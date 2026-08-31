import "server-only";
import { createHash } from "crypto";
import { estDemo } from "./config";
import { demoDb } from "./demo/store";
import { stripe, stripeConfigure } from "./stripe";
import { supabaseAdmin } from "./supabase/server";
import type { Garage } from "./types";

const PRIX = { atelier: 34, pro: 59 } as const;

/** Jeton de session admin dérivé du mot de passe (jamais le mot de passe en clair). */
export function jetonPilotage(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update(`${pw}::fiavo-pilotage`).digest("hex");
}

function moisCourant(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export type NiveauJournal = "info" | "succes" | "erreur";

/**
 * Enregistre un événement dans le journal de pilotage (inscriptions, paiements,
 * abonnements, erreurs…). Best-effort : ne lève jamais, ne bloque jamais le
 * flux appelant même si la table n'existe pas encore.
 */
export async function journaliser(entree: {
  type: string;
  message: string;
  niveau?: NiveauJournal;
  garage?: string | null;
}): Promise<void> {
  if (estDemo()) {
    console.log(`[journal:${entree.type}] ${entree.message}`);
    return;
  }
  try {
    await supabaseAdmin().from("journal").insert({
      niveau: entree.niveau ?? "info",
      type: entree.type,
      message: entree.message,
      garage: entree.garage ?? null,
    });
  } catch (e) {
    console.error("journal insert échoué", e);
  }
}

export interface Pilotage {
  garages: number;
  essaisEnCours: number;
  atelier: number;
  pro: number;
  expires: number;
  mrr: number;
  nouveauxSemaine: number;
  nouveauxMois: number;
  essaisBientot: { nom: string; email: string | null; jours: number }[];
  smsMois: number;
  supportTotal: number;
  supportNonTraite: number;
  derniersComptes: {
    nom: string;
    email: string | null;
    plan: string;
    cree: string;
    finEssai: string | null;
  }[];
  journal: {
    niveau: NiveauJournal;
    type: string;
    message: string;
    garage: string | null;
    created_at: string;
  }[];
  stripe: {
    configure: boolean;
    mode: "TEST" | "LIVE" | null;
    abonnementsActifs: number;
    revenuReel: number;
    paiements: {
      date: string;
      montant: number;
      statut: string;
      client: string;
    }[];
    renouvellements: { client: string; date: string; montant: number }[];
    erreur: string | null;
  };
}

export async function donneesPilotage(): Promise<Pilotage> {
  const mois = moisCourant();
  let garages: Garage[];
  let smsMois = 0;
  let supportTotal = 0;
  let supportNonTraite = 0;

  let journal: Pilotage["journal"] = [];

  if (estDemo()) {
    garages = [demoDb().garage];
    smsMois = demoDb().smsParMois[mois] ?? 0;
    journal = [
      {
        niveau: "succes",
        type: "inscription",
        message: "Exemple : nouveau garage inscrit (démo)",
        garage: "Garage Lemoine",
        created_at: new Date().toISOString(),
      },
    ];
  } else {
    const admin = supabaseAdmin();
    const [gRes, sRes, stRes, sntRes, jRes] = await Promise.all([
      admin.from("garages").select("*"),
      admin.from("sms_usage").select("count").eq("mois", mois),
      admin.from("support_messages").select("id", { count: "exact", head: true }),
      admin
        .from("support_messages")
        .select("id", { count: "exact", head: true })
        .eq("traite", false),
      admin
        .from("journal")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(40),
    ]);
    garages = (gRes.data ?? []) as Garage[];
    smsMois = (sRes.data ?? []).reduce(
      (s, r) => s + ((r.count as number | undefined) ?? 0),
      0
    );
    supportTotal = stRes.count ?? 0;
    supportNonTraite = sntRes.count ?? 0;
    journal = (jRes.data ?? []) as Pilotage["journal"];
  }

  const now = Date.now();
  const jour = 86400000;
  let essaisEnCours = 0;
  let atelier = 0;
  let pro = 0;
  let expires = 0;
  let nouveauxSemaine = 0;
  let nouveauxMois = 0;
  const essaisBientot: Pilotage["essaisBientot"] = [];

  for (const g of garages) {
    if (g.plan === "atelier") atelier++;
    else if (g.plan === "pro") pro++;
    else if (g.plan === "trial") {
      const fin = g.trial_ends_at ? new Date(g.trial_ends_at).getTime() : 0;
      if (fin > now) {
        essaisEnCours++;
        const jours = Math.ceil((fin - now) / jour);
        if (jours <= 5) essaisBientot.push({ nom: g.nom, email: g.email, jours });
      } else expires++;
    } else expires++;

    const cree = new Date(g.created_at).getTime();
    if (now - cree < 7 * jour) nouveauxSemaine++;
    if (now - cree < 30 * jour) nouveauxMois++;
  }
  essaisBientot.sort((a, b) => a.jours - b.jours);

  const derniersComptes = [...garages]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 12)
    .map((g) => ({
      nom: g.nom,
      email: g.email,
      plan: g.plan,
      cree: g.created_at,
      finEssai: g.trial_ends_at,
    }));

  // ── Stripe : abonnements actifs + paiements réels ──────────────────────
  const sk = process.env.STRIPE_SECRET_KEY ?? "";
  const stripeInfo: Pilotage["stripe"] = {
    configure: stripeConfigure(),
    mode: sk.startsWith("sk_live") ? "LIVE" : sk.startsWith("sk_test") ? "TEST" : null,
    abonnementsActifs: 0,
    revenuReel: 0,
    paiements: [],
    renouvellements: [],
    erreur: null,
  };
  if (stripeConfigure() && !estDemo()) {
    try {
      const s = stripe();
      const subs = await s.subscriptions.list({ status: "active", limit: 100 });
      stripeInfo.abonnementsActifs = subs.data.length;
      for (const sub of subs.data) {
        const item = sub.items.data[0];
        const montant = (item?.price.unit_amount ?? 0) / 100;
        stripeInfo.revenuReel += montant;
        // La fin de période a migré de la subscription vers l'item selon la
        // version d'API : on lit l'un ou l'autre.
        const fin =
          (item as unknown as { current_period_end?: number })
            ?.current_period_end ??
          (sub as unknown as { current_period_end?: number })
            .current_period_end ??
          0;
        stripeInfo.renouvellements.push({
          client:
            typeof sub.customer === "string" ? sub.customer : sub.customer.id,
          date: new Date(fin * 1000).toISOString(),
          montant,
        });
      }
      stripeInfo.renouvellements.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const inv = await s.invoices.list({ limit: 8 });
      stripeInfo.paiements = inv.data.map((i) => ({
        date: new Date((i.created ?? 0) * 1000).toISOString(),
        montant: (i.amount_paid ?? 0) / 100,
        statut: i.status ?? "—",
        client: i.customer_email ?? (i.customer as string) ?? "—",
      }));
    } catch (e) {
      stripeInfo.erreur = e instanceof Error ? e.message : String(e);
    }
  }

  return {
    garages: garages.length,
    essaisEnCours,
    atelier,
    pro,
    expires,
    mrr: atelier * PRIX.atelier + pro * PRIX.pro,
    nouveauxSemaine,
    nouveauxMois,
    essaisBientot: essaisBientot.slice(0, 8),
    smsMois,
    supportTotal,
    supportNonTraite,
    derniersComptes,
    journal,
    stripe: stripeInfo,
  };
}
