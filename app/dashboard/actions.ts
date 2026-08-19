"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ajouterPhoto,
  changerStatut,
  creerDevis,
  creerDossier,
  creerFacture,
  creerPrestation,
  envoyerMessageGarage,
  getGarageCourant,
  majDossier,
  majGarage,
  majPhoto,
  marquerMessagesLus,
  marquerNotificationsLues,
  relancerDevis,
  supprimerPhoto,
  supprimerPrestation,
} from "@/lib/db";
import {
  schemaDevis,
  schemaGarage,
  schemaMessage,
  schemaNouveauDossier,
  schemaPrestation,
} from "@/lib/validation";
import type { Statut } from "@/lib/types";

export interface EtatFormulaire {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
}

async function garageOuErreur() {
  const garage = await getGarageCourant();
  if (!garage) redirect("/auth/login");
  return garage;
}

function erreursZod(e: unknown): EtatFormulaire {
  if (e && typeof e === "object" && "flatten" in (e as never)) {
    const flat = (
      e as { flatten: () => { fieldErrors: Record<string, string[]> } }
    ).flatten();
    const fieldErrors: Record<string, string> = {};
    for (const [k, v] of Object.entries(flat.fieldErrors)) {
      if (v?.[0]) fieldErrors[k] = v[0];
    }
    return { error: "Certains champs sont invalides.", fieldErrors };
  }
  return { error: e instanceof Error ? e.message : "Une erreur est survenue." };
}

export async function actionCreerDossier(
  _prev: EtatFormulaire,
  formData: FormData
): Promise<EtatFormulaire> {
  const garage = await garageOuErreur();
  const parsed = schemaNouveauDossier.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) return erreursZod(parsed.error);

  let dossierId: string;
  try {
    const dossier = await creerDossier(garage, parsed.data);
    dossierId = dossier.id;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Création impossible." };
  }
  revalidatePath("/dashboard/dossiers");
  redirect(`/dashboard/dossiers/${dossierId}?nouveau=1`);
}

export async function actionChangerStatut(
  dossierId: string,
  statut: Statut
): Promise<EtatFormulaire> {
  const garage = await garageOuErreur();
  try {
    await changerStatut(garage, dossierId, statut);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Changement impossible." };
  }
  revalidatePath(`/dashboard/dossiers/${dossierId}`);
  revalidatePath("/dashboard/dossiers");
  return { ok: true };
}

export async function actionMajDatePrevue(
  dossierId: string,
  date: string
): Promise<EtatFormulaire> {
  const garage = await garageOuErreur();
  try {
    await majDossier(garage, dossierId, {
      date_prevue_sortie: date ? new Date(date).toISOString() : null,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Mise à jour impossible." };
  }
  revalidatePath(`/dashboard/dossiers/${dossierId}`);
  return { ok: true };
}

export async function actionMajNotes(
  dossierId: string,
  notes: string
): Promise<EtatFormulaire> {
  const garage = await garageOuErreur();
  try {
    await majDossier(garage, dossierId, { notes_internes: notes || null });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Sauvegarde impossible." };
  }
  return { ok: true };
}

export async function actionAjouterPhoto(
  dossierId: string,
  formData: FormData
): Promise<EtatFormulaire> {
  const garage = await garageOuErreur();
  const fichier = formData.get("fichier");
  if (!(fichier instanceof File) || fichier.size === 0) {
    return { error: "Aucun fichier sélectionné." };
  }
  if (fichier.size > 2 * 1024 * 1024) {
    return { error: "Photo trop lourde (2 Mo maximum après compression)." };
  }
  if (!fichier.type.startsWith("image/")) {
    return { error: "Le fichier doit être une image." };
  }
  const legende = (formData.get("legende") as string | null)?.trim() || null;
  try {
    await ajouterPhoto(garage, dossierId, fichier, legende);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Envoi impossible." };
  }
  revalidatePath(`/dashboard/dossiers/${dossierId}`);
  return { ok: true };
}

export async function actionMajPhoto(
  dossierId: string,
  photoId: string,
  patch: { legende?: string | null; visible_client?: boolean }
): Promise<EtatFormulaire> {
  const garage = await garageOuErreur();
  try {
    await majPhoto(garage, photoId, patch);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Mise à jour impossible." };
  }
  revalidatePath(`/dashboard/dossiers/${dossierId}`);
  return { ok: true };
}

export async function actionSupprimerPhoto(
  dossierId: string,
  photoId: string
): Promise<EtatFormulaire> {
  const garage = await garageOuErreur();
  try {
    await supprimerPhoto(garage, photoId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Suppression impossible." };
  }
  revalidatePath(`/dashboard/dossiers/${dossierId}`);
  return { ok: true };
}

export async function actionCreerDevis(
  dossierId: string,
  _prev: EtatFormulaire,
  formData: FormData
): Promise<EtatFormulaire> {
  const garage = await garageOuErreur();
  const parsed = schemaDevis.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return erreursZod(parsed.error);
  try {
    await creerDevis(garage, dossierId, {
      type: parsed.data.type,
      lignes: parsed.data.lignes,
      tva_pct: parsed.data.tva_pct,
      description: parsed.data.description ?? null,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Création impossible." };
  }
  revalidatePath(`/dashboard/dossiers/${dossierId}`);
  revalidatePath("/dashboard/dossiers");
  revalidatePath("/dashboard/devis");
  return { ok: true };
}

export async function actionCreerFacture(
  dossierId: string,
  devisId: string
): Promise<EtatFormulaire> {
  const garage = await garageOuErreur();
  try {
    await creerFacture(garage, dossierId, devisId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Facturation impossible." };
  }
  revalidatePath(`/dashboard/dossiers/${dossierId}`);
  revalidatePath("/dashboard/factures");
  return { ok: true };
}

export async function actionRelancerDevis(
  dossierId: string,
  devisId: string
): Promise<EtatFormulaire> {
  const garage = await garageOuErreur();
  try {
    await relancerDevis(garage, dossierId, devisId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Relance impossible." };
  }
  return { ok: true };
}

export async function actionCreerPrestation(
  _prev: EtatFormulaire,
  formData: FormData
): Promise<EtatFormulaire> {
  const garage = await garageOuErreur();
  const parsed = schemaPrestation.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) return erreursZod(parsed.error);
  try {
    await creerPrestation(garage, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ajout impossible." };
  }
  revalidatePath("/dashboard/prestations");
  return { ok: true };
}

export async function actionSupprimerPrestation(
  prestationId: string
): Promise<EtatFormulaire> {
  const garage = await garageOuErreur();
  try {
    await supprimerPrestation(garage, prestationId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Suppression impossible." };
  }
  revalidatePath("/dashboard/prestations");
  return { ok: true };
}

export async function actionMarquerNotifsLues(): Promise<void> {
  const garage = await garageOuErreur();
  await marquerNotificationsLues(garage);
  revalidatePath("/dashboard", "layout");
}

export async function actionEnvoyerMessage(
  dossierId: string,
  _prev: EtatFormulaire,
  formData: FormData
): Promise<EtatFormulaire> {
  const garage = await garageOuErreur();
  const parsed = schemaMessage.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return erreursZod(parsed.error);
  try {
    await envoyerMessageGarage(garage, dossierId, parsed.data.contenu);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Envoi impossible." };
  }
  revalidatePath(`/dashboard/dossiers/${dossierId}`);
  return { ok: true };
}

export async function actionMarquerLus(dossierId: string): Promise<void> {
  const garage = await garageOuErreur();
  await marquerMessagesLus(garage, dossierId);
  revalidatePath("/dashboard/dossiers");
}

export async function actionEnvoyerLienSms(
  dossierId: string
): Promise<EtatFormulaire> {
  const garage = await garageOuErreur();
  const { peutEnvoyerSms } = await import("@/lib/plans");
  if (!peutEnvoyerSms(garage)) {
    return { error: "L'envoi de SMS est réservé au plan Pro." };
  }
  const { getDossierComplet } = await import("@/lib/db");
  const complet = await getDossierComplet(garage, dossierId);
  if (!complet) return { error: "Dossier introuvable." };
  if (!complet.dossier.client_telephone) {
    return { error: "Aucun numéro de téléphone renseigné pour ce client." };
  }
  const { smsCreationDossier } = await import("@/lib/notifications");
  await smsCreationDossier(garage, complet.dossier);
  return { ok: true };
}

export async function actionMajGarage(
  _prev: EtatFormulaire,
  formData: FormData
): Promise<EtatFormulaire> {
  const garage = await garageOuErreur();
  const parsed = schemaGarage.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return erreursZod(parsed.error);
  try {
    await majGarage(garage, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Mise à jour impossible." };
  }
  revalidatePath("/dashboard/compte");
  return { ok: true };
}
