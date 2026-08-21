import "server-only";
import { randomUUID } from "crypto";
import { estDemo, APP_URL } from "./config";
import { demoDb } from "./demo/store";
import { supabaseAdmin, supabaseServer } from "./supabase/server";
import { maxPhotosParDossier, peutCreerDossier, peutEnvoyerSms } from "./plans";
import { totauxDevis } from "./utils";
import {
  emailDevisRepondu,
  emailNouveauMessage,
  smsChangementStatut,
  smsCreationDossier,
  smsGarageDevisRepondu,
  smsGarageMessage,
  smsNouveauDevis,
} from "./notifications";
import type {
  Devis,
  DevisStatut,
  DevisType,
  Dossier,
  DossierComplet,
  DossierResume,
  Garage,
  LigneDevis,
  Message,
  Notification,
  NotificationType,
  Photo,
  Prestation,
  Statut,
  SuiviPublic,
} from "./types";

// ── Notifications in-app ────────────────────────────────────────────────────

async function creerNotification(
  garage: Garage,
  type: NotificationType,
  dossier: Dossier,
  titre: string,
  corps: string
): Promise<void> {
  if (estDemo()) {
    demoDb().notifications.unshift({
      id: randomUUID(),
      garage_id: garage.id,
      type,
      dossier_id: dossier.id,
      titre,
      corps,
      lu: false,
      created_at: new Date().toISOString(),
    });
    return;
  }
  await supabaseAdmin().from("notifications").insert({
    garage_id: garage.id,
    type,
    dossier_id: dossier.id,
    titre,
    corps,
  });
}

export async function listNotifications(
  garage: Garage,
  limite = 30
): Promise<Notification[]> {
  if (estDemo()) {
    return demoDb()
      .notifications.filter((n) => n.garage_id === garage.id)
      .slice(0, limite);
  }
  const { data } = await supabaseServer()
    .from("notifications")
    .select("*")
    .eq("garage_id", garage.id)
    .order("created_at", { ascending: false })
    .limit(limite);
  return (data ?? []) as Notification[];
}

export async function compteNotificationsNonLues(
  garage: Garage
): Promise<number> {
  if (estDemo()) {
    return demoDb().notifications.filter(
      (n) => n.garage_id === garage.id && !n.lu
    ).length;
  }
  const { count } = await supabaseServer()
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("garage_id", garage.id)
    .eq("lu", false);
  return count ?? 0;
}

export async function marquerNotificationsLues(garage: Garage): Promise<void> {
  if (estDemo()) {
    demoDb()
      .notifications.filter((n) => n.garage_id === garage.id)
      .forEach((n) => (n.lu = true));
    return;
  }
  await supabaseServer()
    .from("notifications")
    .update({ lu: true })
    .eq("garage_id", garage.id)
    .eq("lu", false);
}

// ── Prestations (catalogue réutilisable) ────────────────────────────────────

export async function listPrestations(garage: Garage): Promise<Prestation[]> {
  if (estDemo()) {
    return demoDb()
      .prestations.filter((p) => p.garage_id === garage.id)
      .sort((a, b) => a.designation.localeCompare(b.designation, "fr"));
  }
  const { data } = await supabaseServer()
    .from("prestations")
    .select("*")
    .eq("garage_id", garage.id)
    .order("designation");
  return (data ?? []) as Prestation[];
}

export async function creerPrestation(
  garage: Garage,
  input: { designation: string; prix_ht: number }
): Promise<Prestation> {
  const prestation: Prestation = {
    id: randomUUID(),
    garage_id: garage.id,
    designation: input.designation,
    prix_ht: input.prix_ht,
  };
  if (estDemo()) {
    demoDb().prestations.push(prestation);
    return prestation;
  }
  const { data, error } = await supabaseServer()
    .from("prestations")
    .insert({
      id: prestation.id,
      garage_id: garage.id,
      designation: input.designation,
      prix_ht: input.prix_ht,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Prestation;
}

export async function supprimerPrestation(
  garage: Garage,
  prestationId: string
): Promise<void> {
  if (estDemo()) {
    const db = demoDb();
    db.prestations = db.prestations.filter((p) => p.id !== prestationId);
    return;
  }
  await supabaseServer()
    .from("prestations")
    .delete()
    .eq("id", prestationId)
    .eq("garage_id", garage.id);
}

async function prochainNumeroDevis(garage: Garage): Promise<string> {
  const annee = new Date().getFullYear();
  if (estDemo()) {
    const db = demoDb();
    db.compteurDevis += 1;
    return `DEV-${annee}-${String(db.compteurDevis).padStart(4, "0")}`;
  }
  const { count } = await supabaseAdmin()
    .from("devis")
    .select("id", { count: "exact", head: true })
    .in(
      "dossier_id",
      (
        await supabaseAdmin()
          .from("dossiers")
          .select("id")
          .eq("garage_id", garage.id)
      ).data?.map((d) => d.id) ?? []
    );
  return `DEV-${annee}-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

async function prochainNumeroFacture(garage: Garage): Promise<string> {
  const annee = new Date().getFullYear();
  if (estDemo()) {
    const db = demoDb();
    db.compteurFacture += 1;
    return `FAC-${annee}-${String(db.compteurFacture).padStart(4, "0")}`;
  }
  const dossierIds =
    (
      await supabaseAdmin()
        .from("dossiers")
        .select("id")
        .eq("garage_id", garage.id)
    ).data?.map((d) => d.id) ?? [];
  const { count } = await supabaseAdmin()
    .from("devis")
    .select("id", { count: "exact", head: true })
    .not("facture_numero", "is", null)
    .in("dossier_id", dossierIds);
  return `FAC-${annee}-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

// ── Garage courant ──────────────────────────────────────────────────────────

export async function getGarageCourant(): Promise<Garage | null> {
  if (estDemo()) return demoDb().garage;
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("garages")
    .select("*")
    .eq("user_id", user.id)
    .single();
  return (data as Garage) ?? null;
}

export async function majGarage(
  garage: Garage,
  patch: Partial<
    Pick<
      Garage,
      | "nom"
      | "adresse"
      | "telephone"
      | "telephone_mobile"
      | "email"
      | "siret"
      | "logo_url"
      | "cachet_url"
      | "lien_avis"
    >
  >
): Promise<void> {
  if (estDemo()) {
    Object.assign(demoDb().garage, patch);
    return;
  }
  const supabase = supabaseServer();
  const { error } = await supabase
    .from("garages")
    .update(patch)
    .eq("id", garage.id);
  if (error) throw new Error(error.message);
}

// ── Dossiers ────────────────────────────────────────────────────────────────

export type OngletDossiers = "actifs" | "livres" | "tous";

export async function listDossiers(
  garage: Garage,
  onglet: OngletDossiers = "actifs",
  recherche = ""
): Promise<DossierResume[]> {
  let dossiers: Dossier[];
  let photos: Photo[];
  let devis: Devis[];
  let messages: Message[];

  if (estDemo()) {
    const db = demoDb();
    dossiers = db.dossiers.filter((d) => d.garage_id === garage.id);
    photos = db.photos;
    devis = db.devis;
    messages = db.messages;
  } else {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("dossiers")
      .select("*, photos(id), devis(id, statut), messages(id, auteur, lu)")
      .eq("garage_id", garage.id)
      .order("date_entree", { ascending: false });
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as (Dossier & {
      photos: { id: string }[];
      devis: { id: string; statut: string }[];
      messages: { id: string; auteur: string; lu: boolean }[];
    })[];
    return filtrer(
      rows.map((r) => ({
        ...r,
        nb_photos: r.photos.length,
        devis_en_attente: r.devis.filter((x) => x.statut === "en_attente")
          .length,
        messages_non_lus: r.messages.filter(
          (m) => m.auteur === "client" && !m.lu
        ).length,
      })),
      onglet,
      recherche
    );
  }

  const resumes: DossierResume[] = dossiers.map((d) => ({
    ...d,
    nb_photos: photos.filter((p) => p.dossier_id === d.id).length,
    devis_en_attente: devis.filter(
      (x) => x.dossier_id === d.id && x.statut === "en_attente"
    ).length,
    messages_non_lus: messages.filter(
      (m) => m.dossier_id === d.id && m.auteur === "client" && !m.lu
    ).length,
  }));
  return filtrer(
    resumes.sort(
      (a, b) =>
        new Date(b.date_entree).getTime() - new Date(a.date_entree).getTime()
    ),
    onglet,
    recherche
  );
}

function filtrer(
  dossiers: DossierResume[],
  onglet: OngletDossiers,
  recherche: string
): DossierResume[] {
  let out = dossiers;
  if (onglet === "actifs") out = out.filter((d) => d.statut !== "livre");
  if (onglet === "livres") out = out.filter((d) => d.statut === "livre");
  const q = recherche.trim().toLowerCase();
  if (q) {
    const qImmat = q.replace(/[^a-z0-9]/g, "");
    out = out.filter(
      (d) =>
        d.client_nom.toLowerCase().includes(q) ||
        d.vehicule_immat
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .includes(qImmat) ||
        `${d.vehicule_marque} ${d.vehicule_modele}`.toLowerCase().includes(q)
    );
  }
  return out;
}

export async function getDossierComplet(
  garage: Garage,
  dossierId: string
): Promise<DossierComplet | null> {
  if (estDemo()) {
    const db = demoDb();
    const dossier = db.dossiers.find(
      (d) => d.id === dossierId && d.garage_id === garage.id
    );
    if (!dossier) return null;
    return {
      dossier,
      photos: db.photos.filter((p) => p.dossier_id === dossierId),
      devis: trierRecent(db.devis.filter((x) => x.dossier_id === dossierId)),
      messages: trierAncien(
        db.messages.filter((m) => m.dossier_id === dossierId)
      ),
      historique: trierRecent(
        db.historique.filter((h) => h.dossier_id === dossierId)
      ),
    };
  }
  const supabase = supabaseServer();
  const { data: dossier } = await supabase
    .from("dossiers")
    .select("*")
    .eq("id", dossierId)
    .eq("garage_id", garage.id)
    .single();
  if (!dossier) return null;
  const [photos, devis, messages, historique] = await Promise.all([
    supabase.from("photos").select("*").eq("dossier_id", dossierId),
    supabase
      .from("devis")
      .select("*")
      .eq("dossier_id", dossierId)
      .order("created_at", { ascending: false }),
    supabase
      .from("messages")
      .select("*")
      .eq("dossier_id", dossierId)
      .order("created_at", { ascending: true }),
    supabase
      .from("historique_statuts")
      .select("*")
      .eq("dossier_id", dossierId)
      .order("created_at", { ascending: false }),
  ]);
  return {
    dossier: dossier as Dossier,
    photos: await signerPhotos((photos.data ?? []) as Photo[]),
    devis: (devis.data ?? []) as Devis[],
    messages: (messages.data ?? []) as Message[],
    historique: (historique.data ?? []) as never[],
  };
}

function trierRecent<T extends { created_at: string }>(arr: T[]): T[] {
  return [...arr].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
function trierAncien<T extends { created_at: string }>(arr: T[]): T[] {
  return [...arr].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

export interface NouveauDossier {
  client_nom: string;
  client_telephone: string | null;
  client_email: string | null;
  vehicule_marque: string;
  vehicule_modele: string;
  vehicule_immat: string;
  vehicule_annee: number | null;
  kilometrage: number | null;
  motif_entree: string | null;
  date_prevue_sortie: string | null;
  notes_internes: string | null;
}

export async function creerDossier(
  garage: Garage,
  input: NouveauDossier
): Promise<Dossier> {
  if (!peutCreerDossier(garage)) {
    throw new Error(
      "Votre période d'essai est terminée. Choisissez une formule pour créer de nouveaux dossiers."
    );
  }
  const maintenant = new Date().toISOString();
  const dossier: Dossier = {
    id: randomUUID(),
    garage_id: garage.id,
    token_public: randomUUID(),
    statut: "en_attente",
    date_entree: maintenant,
    date_livraison: null,
    created_at: maintenant,
    updated_at: maintenant,
    ...input,
  };

  if (estDemo()) {
    const db = demoDb();
    db.dossiers.push(dossier);
    db.historique.push({
      id: randomUUID(),
      dossier_id: dossier.id,
      ancien_statut: null,
      nouveau_statut: "en_attente",
      note: null,
      created_at: maintenant,
    });
  } else {
    const supabase = supabaseServer();
    const { error } = await supabase.from("dossiers").insert({
      ...input,
      id: dossier.id,
      garage_id: garage.id,
      token_public: dossier.token_public,
      statut: "en_attente",
    });
    if (error) throw new Error(error.message);
    await supabase.from("historique_statuts").insert({
      dossier_id: dossier.id,
      ancien_statut: null,
      nouveau_statut: "en_attente",
    });
  }

  if (peutEnvoyerSms(garage) && dossier.client_telephone) {
    await smsCreationDossier(garage, dossier);
  }
  return dossier;
}

export async function majDossier(
  garage: Garage,
  dossierId: string,
  patch: Partial<
    Pick<
      Dossier,
      | "client_nom"
      | "client_telephone"
      | "client_email"
      | "date_prevue_sortie"
      | "notes_internes"
      | "motif_entree"
    >
  >
): Promise<void> {
  if (estDemo()) {
    const d = demoDb().dossiers.find(
      (x) => x.id === dossierId && x.garage_id === garage.id
    );
    if (!d) throw new Error("Dossier introuvable");
    Object.assign(d, patch, { updated_at: new Date().toISOString() });
    return;
  }
  const supabase = supabaseServer();
  const { error } = await supabase
    .from("dossiers")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", dossierId)
    .eq("garage_id", garage.id);
  if (error) throw new Error(error.message);
}

export async function changerStatut(
  garage: Garage,
  dossierId: string,
  nouveau: Statut
): Promise<void> {
  let dossier: Dossier | null = null;
  const maintenant = new Date().toISOString();

  if (estDemo()) {
    const db = demoDb();
    dossier =
      db.dossiers.find(
        (x) => x.id === dossierId && x.garage_id === garage.id
      ) ?? null;
    if (!dossier) throw new Error("Dossier introuvable");
    const ancien = dossier.statut;
    if (ancien === nouveau) return;
    dossier.statut = nouveau;
    dossier.updated_at = maintenant;
    if (nouveau === "livre") dossier.date_livraison = maintenant;
    db.historique.push({
      id: randomUUID(),
      dossier_id: dossierId,
      ancien_statut: ancien,
      nouveau_statut: nouveau,
      note: null,
      created_at: maintenant,
    });
  } else {
    const supabase = supabaseServer();
    const { data } = await supabase
      .from("dossiers")
      .select("*")
      .eq("id", dossierId)
      .eq("garage_id", garage.id)
      .single();
    dossier = data as Dossier | null;
    if (!dossier) throw new Error("Dossier introuvable");
    if (dossier.statut === nouveau) return;
    const { error } = await supabase
      .from("dossiers")
      .update({
        statut: nouveau,
        updated_at: maintenant,
        ...(nouveau === "livre" ? { date_livraison: maintenant } : {}),
      })
      .eq("id", dossierId)
      .eq("garage_id", garage.id);
    if (error) throw new Error(error.message);
    await supabase.from("historique_statuts").insert({
      dossier_id: dossierId,
      ancien_statut: dossier.statut,
      nouveau_statut: nouveau,
    });
    dossier.statut = nouveau;
  }

  if (peutEnvoyerSms(garage)) {
    await smsChangementStatut(garage, dossier, nouveau);
  }
}

// ── Photos ──────────────────────────────────────────────────────────────────

export async function ajouterPhoto(
  garage: Garage,
  dossierId: string,
  fichier: File,
  legende: string | null
): Promise<Photo> {
  const max = maxPhotosParDossier(garage);

  if (estDemo()) {
    const db = demoDb();
    const dossier = db.dossiers.find(
      (x) => x.id === dossierId && x.garage_id === garage.id
    );
    if (!dossier) throw new Error("Dossier introuvable");
    const existantes = db.photos.filter((p) => p.dossier_id === dossierId);
    if (existantes.length >= max) {
      throw new Error(`Limite de ${max} photos par dossier atteinte.`);
    }
    const buffer = Buffer.from(await fichier.arrayBuffer());
    const photo: Photo = {
      id: randomUUID(),
      dossier_id: dossierId,
      url: `data:${fichier.type || "image/jpeg"};base64,${buffer.toString("base64")}`,
      legende,
      visible_client: true,
      created_at: new Date().toISOString(),
    };
    db.photos.push(photo);
    return photo;
  }

  const supabase = supabaseServer();
  const { data: dossier } = await supabase
    .from("dossiers")
    .select("id")
    .eq("id", dossierId)
    .eq("garage_id", garage.id)
    .single();
  if (!dossier) throw new Error("Dossier introuvable");
  const { count } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("dossier_id", dossierId);
  if ((count ?? 0) >= max) {
    throw new Error(`Limite de ${max} photos par dossier atteinte.`);
  }
  const extension = (fichier.name.split(".").pop() || "jpg").toLowerCase();
  const chemin = `${dossierId}/${randomUUID()}.${extension}`;
  const admin = supabaseAdmin();
  const { error: errUpload } = await admin.storage
    .from("photos")
    .upload(chemin, Buffer.from(await fichier.arrayBuffer()), {
      contentType: fichier.type || "image/jpeg",
    });
  if (errUpload) throw new Error(errUpload.message);
  const { data, error } = await supabase
    .from("photos")
    .insert({ dossier_id: dossierId, url: chemin, legende })
    .select()
    .single();
  if (error) throw new Error(error.message);
  const [signee] = await signerPhotos([data as Photo]);
  return signee;
}

/** En mode Supabase, la colonne `url` contient le chemin dans le bucket privé : on signe à la lecture. */
async function signerPhotos(photos: Photo[]): Promise<Photo[]> {
  if (photos.length === 0) return photos;
  const admin = supabaseAdmin();
  return Promise.all(
    photos.map(async (p) => {
      if (p.url.startsWith("data:") || p.url.startsWith("http")) return p;
      const { data } = await admin.storage
        .from("photos")
        .createSignedUrl(p.url, 3600);
      return { ...p, url: data?.signedUrl ?? p.url };
    })
  );
}

export async function majPhoto(
  garage: Garage,
  photoId: string,
  patch: Partial<Pick<Photo, "legende" | "visible_client">>
): Promise<void> {
  if (estDemo()) {
    const db = demoDb();
    const photo = db.photos.find((p) => p.id === photoId);
    if (!photo) throw new Error("Photo introuvable");
    Object.assign(photo, patch);
    return;
  }
  const supabase = supabaseServer();
  const { error } = await supabase
    .from("photos")
    .update(patch)
    .eq("id", photoId);
  if (error) throw new Error(error.message);
}

export async function supprimerPhoto(
  garage: Garage,
  photoId: string
): Promise<void> {
  if (estDemo()) {
    const db = demoDb();
    db.photos = db.photos.filter((p) => p.id !== photoId);
    return;
  }
  const supabase = supabaseServer();
  const { data: photo } = await supabase
    .from("photos")
    .select("url")
    .eq("id", photoId)
    .single();
  const { error } = await supabase.from("photos").delete().eq("id", photoId);
  if (error) throw new Error(error.message);
  if (photo?.url && !photo.url.startsWith("http")) {
    await supabaseAdmin().storage.from("photos").remove([photo.url]);
  }
}

// ── Devis ───────────────────────────────────────────────────────────────────

export async function creerDevis(
  garage: Garage,
  dossierId: string,
  input: {
    type: DevisType;
    lignes: LigneDevis[];
    tva_pct: number;
    description?: string | null;
  }
): Promise<Devis> {
  if (input.lignes.length === 0) {
    throw new Error("Ajoutez au moins une ligne au devis.");
  }
  const { ht, ttc } = totauxDevis(input.lignes, input.tva_pct);
  const numero = await prochainNumeroDevis(garage);
  const devis: Devis = {
    id: randomUUID(),
    dossier_id: dossierId,
    numero,
    type: input.type,
    lignes: input.lignes,
    montant_ht: ht,
    tva_pct: input.tva_pct,
    montant_ttc: ttc,
    description: input.description ?? "",
    statut: "en_attente",
    signature_base64: null,
    signature_at: null,
    signe_par: null,
    facture_numero: null,
    facture_at: null,
    created_at: new Date().toISOString(),
  };

  let dossier: Dossier | null = null;
  if (estDemo()) {
    const db = demoDb();
    dossier =
      db.dossiers.find(
        (x) => x.id === dossierId && x.garage_id === garage.id
      ) ?? null;
    if (!dossier) throw new Error("Dossier introuvable");
    db.devis.push(devis);
  } else {
    const supabase = supabaseServer();
    const { data } = await supabase
      .from("dossiers")
      .select("*")
      .eq("id", dossierId)
      .eq("garage_id", garage.id)
      .single();
    dossier = data as Dossier | null;
    if (!dossier) throw new Error("Dossier introuvable");
    const { error } = await supabase.from("devis").insert({
      id: devis.id,
      dossier_id: dossierId,
      numero,
      type: input.type,
      lignes: input.lignes,
      montant_ht: ht,
      tva_pct: input.tva_pct,
      montant_ttc: ttc,
      description: devis.description,
    });
    if (error) throw new Error(error.message);
  }

  // Un devis supplémentaire nécessite l'accord du client → on le prévient.
  if (input.type === "supplementaire" && peutEnvoyerSms(garage)) {
    await smsNouveauDevis(garage, dossier);
  }
  return devis;
}

/** Facture un devis accepté : lui attribue un numéro de facture et une date. */
export async function creerFacture(
  garage: Garage,
  dossierId: string,
  devisId: string
): Promise<string> {
  const maintenant = new Date().toISOString();
  if (estDemo()) {
    const db = demoDb();
    const dossier = db.dossiers.find(
      (x) => x.id === dossierId && x.garage_id === garage.id
    );
    if (!dossier) throw new Error("Dossier introuvable");
    const devis = db.devis.find((v) => v.id === devisId);
    if (!devis) throw new Error("Devis introuvable");
    if (devis.statut !== "accepte")
      throw new Error("Seul un devis accepté peut être facturé.");
    if (devis.facture_numero) return devis.facture_numero;
    devis.facture_numero = await prochainNumeroFacture(garage);
    devis.facture_at = maintenant;
    return devis.facture_numero;
  }
  const supabase = supabaseServer();
  const { data } = await supabase
    .from("devis")
    .select("*, dossiers!inner(garage_id)")
    .eq("id", devisId)
    .eq("dossiers.garage_id", garage.id)
    .single();
  const devis = data as (Devis & { dossiers: unknown }) | null;
  if (!devis) throw new Error("Devis introuvable");
  if (devis.statut !== "accepte")
    throw new Error("Seul un devis accepté peut être facturé.");
  if (devis.facture_numero) return devis.facture_numero;
  const numero = await prochainNumeroFacture(garage);
  const { error } = await supabase
    .from("devis")
    .update({ facture_numero: numero, facture_at: maintenant })
    .eq("id", devisId);
  if (error) throw new Error(error.message);
  return numero;
}

/** Relance le client sur un devis encore en attente (renvoie le SMS). */
export async function relancerDevis(
  garage: Garage,
  dossierId: string,
  devisId: string
): Promise<void> {
  const complet = await getDossierComplet(garage, dossierId);
  if (!complet) throw new Error("Dossier introuvable");
  const devis = complet.devis.find((v) => v.id === devisId);
  if (!devis) throw new Error("Devis introuvable");
  if (devis.statut !== "en_attente")
    throw new Error("Ce devis a déjà reçu une réponse.");
  if (peutEnvoyerSms(garage)) {
    await smsNouveauDevis(garage, complet.dossier);
  }
}

// ── Statistiques du tableau de bord ─────────────────────────────────────────

export interface StatsGarage {
  atelier: number;
  livresMois: number;
  caMois: number;
  tauxAcceptation: number | null; // 0..1, null si aucun devis répondu
  devisEnAttente: number;
}

export async function statsGarage(garage: Garage): Promise<StatsGarage> {
  let dossiers: Dossier[];
  let devis: Devis[];
  if (estDemo()) {
    const db = demoDb();
    dossiers = db.dossiers.filter((d) => d.garage_id === garage.id);
    const ids = new Set(dossiers.map((d) => d.id));
    devis = db.devis.filter((v) => ids.has(v.dossier_id));
  } else {
    const supabase = supabaseServer();
    const { data: doss } = await supabase
      .from("dossiers")
      .select("*")
      .eq("garage_id", garage.id);
    dossiers = (doss ?? []) as Dossier[];
    const ids = dossiers.map((d) => d.id);
    if (ids.length === 0) {
      devis = [];
    } else {
      const { data } = await supabase
        .from("devis")
        .select("*")
        .in("dossier_id", ids);
      devis = (data ?? []) as Devis[];
    }
  }

  const now = new Date();
  const memeMois = (iso: string | null) => {
    if (!iso) return false;
    const d = new Date(iso);
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  };

  const atelier = dossiers.filter((d) => d.statut !== "livre").length;
  const livresMois = dossiers.filter(
    (d) => d.statut === "livre" && memeMois(d.date_livraison)
  ).length;
  const acceptes = devis.filter((v) => v.statut === "accepte");
  const refuses = devis.filter((v) => v.statut === "refuse");
  const caMois = acceptes
    .filter((v) => memeMois(v.signature_at ?? v.created_at))
    .reduce((s, v) => s + v.montant_ttc, 0);
  const repondus = acceptes.length + refuses.length;
  const tauxAcceptation = repondus > 0 ? acceptes.length / repondus : null;
  const devisEnAttente = devis.filter((v) => v.statut === "en_attente").length;

  return { atelier, livresMois, caMois, tauxAcceptation, devisEnAttente };
}

// ── Espace documentaire : tous les devis du garage ──────────────────────────

export interface DevisAvecContexte extends Devis {
  client_nom: string;
  vehicule: string;
  vehicule_immat: string;
}

export async function listTousDevis(
  garage: Garage,
  filtre?: { statut?: DevisStatut; type?: DevisType }
): Promise<DevisAvecContexte[]> {
  let devis: Devis[];
  let dossiers: Dossier[];
  if (estDemo()) {
    const db = demoDb();
    dossiers = db.dossiers.filter((d) => d.garage_id === garage.id);
    const ids = new Set(dossiers.map((d) => d.id));
    devis = db.devis.filter((v) => ids.has(v.dossier_id));
  } else {
    const supabase = supabaseServer();
    const { data: doss } = await supabase
      .from("dossiers")
      .select("*")
      .eq("garage_id", garage.id);
    dossiers = (doss ?? []) as Dossier[];
    const ids = dossiers.map((d) => d.id);
    if (ids.length === 0) return [];
    const { data } = await supabase
      .from("devis")
      .select("*")
      .in("dossier_id", ids)
      .order("created_at", { ascending: false });
    devis = (data ?? []) as Devis[];
  }

  const parDossier = new Map(dossiers.map((d) => [d.id, d]));
  let out: DevisAvecContexte[] = devis
    .map((v) => {
      const d = parDossier.get(v.dossier_id);
      if (!d) return null;
      return {
        ...v,
        client_nom: d.client_nom,
        vehicule: `${d.vehicule_marque} ${d.vehicule_modele}`,
        vehicule_immat: d.vehicule_immat,
      };
    })
    .filter((v): v is DevisAvecContexte => v !== null);

  if (filtre?.statut) out = out.filter((v) => v.statut === filtre.statut);
  if (filtre?.type) out = out.filter((v) => v.type === filtre.type);
  return out.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getDevisPourImpression(
  garage: Garage,
  dossierId: string,
  devisId: string
): Promise<{ devis: Devis; dossier: Dossier } | null> {
  const complet = await getDossierComplet(garage, dossierId);
  if (!complet) return null;
  const devis = complet.devis.find((v) => v.id === devisId);
  if (!devis) return null;
  return { devis, dossier: complet.dossier };
}

// ── Messagerie ──────────────────────────────────────────────────────────────

export async function envoyerMessageGarage(
  garage: Garage,
  dossierId: string,
  contenu: string
): Promise<Message> {
  const message: Message = {
    id: randomUUID(),
    dossier_id: dossierId,
    auteur: "garage",
    contenu,
    lu: true,
    created_at: new Date().toISOString(),
  };
  if (estDemo()) {
    const db = demoDb();
    const dossier = db.dossiers.find(
      (x) => x.id === dossierId && x.garage_id === garage.id
    );
    if (!dossier) throw new Error("Dossier introuvable");
    db.messages.push(message);
    return message;
  }
  const supabase = supabaseServer();
  const { error } = await supabase.from("messages").insert({
    id: message.id,
    dossier_id: dossierId,
    auteur: "garage",
    contenu,
    lu: true,
  });
  if (error) throw new Error(error.message);
  return message;
}

export async function marquerMessagesLus(
  garage: Garage,
  dossierId: string
): Promise<void> {
  if (estDemo()) {
    demoDb()
      .messages.filter(
        (m) => m.dossier_id === dossierId && m.auteur === "client"
      )
      .forEach((m) => (m.lu = true));
    return;
  }
  const supabase = supabaseServer();
  await supabase
    .from("messages")
    .update({ lu: true })
    .eq("dossier_id", dossierId)
    .eq("auteur", "client");
}

// ── Page publique (accès par token, sans authentification) ─────────────────

export async function getSuiviParToken(
  token: string
): Promise<SuiviPublic | null> {
  if (estDemo()) {
    const db = demoDb();
    const dossier = db.dossiers.find((d) => d.token_public === token);
    if (!dossier) return null;
    const g = db.garage;
    return {
      garage: {
        nom: g.nom,
        telephone: g.telephone,
        telephone_mobile: g.telephone_mobile,
        adresse: g.adresse,
        logo_url: g.logo_url,
        lien_avis: g.lien_avis,
        plan: g.plan,
      },
      dossier,
      photos: db.photos.filter(
        (p) => p.dossier_id === dossier.id && p.visible_client
      ),
      devis: trierRecent(db.devis.filter((x) => x.dossier_id === dossier.id)),
      messages: trierAncien(
        db.messages.filter((m) => m.dossier_id === dossier.id)
      ),
      historique: trierAncien(
        db.historique.filter((h) => h.dossier_id === dossier.id)
      ),
    };
  }

  const admin = supabaseAdmin();
  const { data: dossier } = await admin
    .from("dossiers")
    .select("*")
    .eq("token_public", token)
    .single();
  if (!dossier) return null;
  const [garage, photos, devis, messages, historique] = await Promise.all([
    admin
      .from("garages")
      .select("nom, telephone, telephone_mobile, adresse, logo_url, lien_avis, plan")
      .eq("id", dossier.garage_id)
      .single(),
    admin
      .from("photos")
      .select("*")
      .eq("dossier_id", dossier.id)
      .eq("visible_client", true),
    admin
      .from("devis")
      .select("*")
      .eq("dossier_id", dossier.id)
      .order("created_at", { ascending: false }),
    admin
      .from("messages")
      .select("*")
      .eq("dossier_id", dossier.id)
      .order("created_at", { ascending: true }),
    admin
      .from("historique_statuts")
      .select("*")
      .eq("dossier_id", dossier.id)
      .order("created_at", { ascending: true }),
  ]);
  if (!garage.data) return null;
  return {
    garage: garage.data as SuiviPublic["garage"],
    dossier: dossier as Dossier,
    photos: await signerPhotos((photos.data ?? []) as Photo[]),
    devis: (devis.data ?? []) as Devis[],
    messages: (messages.data ?? []) as Message[],
    historique: (historique.data ?? []) as never[],
  };
}

async function garagePourDossier(dossier: Dossier): Promise<Garage | null> {
  if (estDemo()) return demoDb().garage;
  const { data } = await supabaseAdmin()
    .from("garages")
    .select("*")
    .eq("id", dossier.garage_id)
    .single();
  return (data as Garage) ?? null;
}

export async function repondreDevis(
  token: string,
  devisId: string,
  reponse:
    | { action: "accepte"; signature_base64: string; signe_par: string }
    | { action: "refuse" }
): Promise<void> {
  const maintenant = new Date().toISOString();
  let dossier: Dossier;
  let devis: Devis;

  if (estDemo()) {
    const db = demoDb();
    const d = db.dossiers.find((x) => x.token_public === token);
    const v = db.devis.find((x) => x.id === devisId);
    if (!d || !v || v.dossier_id !== d.id) throw new Error("Devis introuvable");
    if (v.statut !== "en_attente") throw new Error("Ce devis a déjà reçu une réponse.");
    v.statut = reponse.action;
    if (reponse.action === "accepte") {
      v.signature_base64 = reponse.signature_base64;
      v.signe_par = reponse.signe_par;
      v.signature_at = maintenant;
    }
    dossier = d;
    devis = v;
  } else {
    const admin = supabaseAdmin();
    const { data: d } = await admin
      .from("dossiers")
      .select("*")
      .eq("token_public", token)
      .single();
    if (!d) throw new Error("Dossier introuvable");
    const { data: v } = await admin
      .from("devis")
      .select("*")
      .eq("id", devisId)
      .eq("dossier_id", d.id)
      .single();
    if (!v) throw new Error("Devis introuvable");
    if (v.statut !== "en_attente") throw new Error("Ce devis a déjà reçu une réponse.");
    const patch =
      reponse.action === "accepte"
        ? {
            statut: "accepte",
            signature_base64: reponse.signature_base64,
            signe_par: reponse.signe_par,
            signature_at: maintenant,
          }
        : { statut: "refuse" };
    const { error } = await admin.from("devis").update(patch).eq("id", devisId);
    if (error) throw new Error(error.message);
    dossier = d as Dossier;
    devis = { ...(v as Devis), ...patch } as Devis;
  }

  const garage = await garagePourDossier(dossier);
  if (garage) {
    const accepte = devis.statut === "accepte";
    await Promise.all([
      emailDevisRepondu(
        garage,
        dossier,
        devis,
        `${APP_URL}/dashboard/dossiers/${dossier.id}`
      ),
      creerNotification(
        garage,
        accepte ? "devis_accepte" : "devis_refuse",
        dossier,
        `Devis ${accepte ? "accepté" : "refusé"} — ${dossier.client_nom}`,
        `Devis ${devis.numero} ${accepte ? "signé" : "refusé"} (${devis.montant_ttc
          .toFixed(2)
          .replace(".", ",")} € TTC).`
      ),
      peutEnvoyerSms(garage)
        ? smsGarageDevisRepondu(garage, dossier, devis)
        : Promise.resolve(),
    ]);
  }
}

export async function envoyerMessageClient(
  token: string,
  contenu: string
): Promise<Message> {
  let dossier: Dossier | null = null;
  const message: Message = {
    id: randomUUID(),
    dossier_id: "",
    auteur: "client",
    contenu,
    lu: false,
    created_at: new Date().toISOString(),
  };

  if (estDemo()) {
    const db = demoDb();
    dossier = db.dossiers.find((d) => d.token_public === token) ?? null;
    if (!dossier) throw new Error("Dossier introuvable");
    message.dossier_id = dossier.id;
    db.messages.push(message);
  } else {
    const admin = supabaseAdmin();
    const { data: d } = await admin
      .from("dossiers")
      .select("*")
      .eq("token_public", token)
      .single();
    if (!d) throw new Error("Dossier introuvable");
    dossier = d as Dossier;
    message.dossier_id = dossier.id;
    const { error } = await admin.from("messages").insert({
      id: message.id,
      dossier_id: dossier.id,
      auteur: "client",
      contenu,
      lu: false,
    });
    if (error) throw new Error(error.message);
  }

  const garage = await garagePourDossier(dossier);
  if (garage) {
    await Promise.all([
      emailNouveauMessage(
        garage,
        dossier,
        contenu,
        `${APP_URL}/dashboard/dossiers/${dossier.id}`
      ),
      creerNotification(
        garage,
        "message_client",
        dossier,
        `Nouveau message — ${dossier.client_nom}`,
        contenu
      ),
      peutEnvoyerSms(garage)
        ? smsGarageMessage(garage, dossier, contenu)
        : Promise.resolve(),
    ]);
  }
  return message;
}
