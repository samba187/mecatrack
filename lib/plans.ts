import type { Garage, Plan } from "./types";

/** Prix facturé par SMS envoyé au-delà du quota mensuel inclus. */
export const PRIX_SMS_SUPPLEMENTAIRE = 0.15;

export const DUREE_ESSAI_JOURS = 14;

export const PLANS = {
  atelier: {
    id: "atelier",
    nom: "Atelier",
    prix: 34,
    quotaVehicules: 30,
    quotaSms: 120,
    maxPhotos: 10,
    description: "Pour l'atelier qui démarre le suivi client en ligne.",
    fonctionnalites: [
      "Jusqu'à 30 véhicules par mois",
      "120 SMS clients inclus / mois",
      "Page de suivi client par lien",
      "10 photos par dossier",
      "Devis & factures avec signature électronique",
      "Messagerie client intégrée",
    ],
  },
  pro: {
    id: "pro",
    nom: "Pro",
    prix: 59,
    quotaVehicules: Infinity,
    quotaSms: 300,
    maxPhotos: 20,
    description: "Pour le garage qui tourne à plein régime.",
    fonctionnalites: [
      "Véhicules illimités",
      "300 SMS clients inclus / mois",
      "20 photos par dossier",
      "Votre logo sur la page de suivi",
      "Sans la mention Fiavo",
      "Support prioritaire",
    ],
  },
} as const;

/** Plans payants (hors trial/expired) qui disposent d'un quota. */
type PlanPayant = "atelier" | "pro";

/**
 * Pendant l'essai, le garage a toutes les fonctionnalités Pro.
 * À expiration sans abonnement, le compte passe en lecture seule.
 */
export function planEffectif(garage: Garage): Exclude<Plan, "trial"> {
  if (garage.plan === "trial") {
    const fin = garage.trial_ends_at ? new Date(garage.trial_ends_at) : null;
    if (fin && fin.getTime() > Date.now()) return "pro";
    return "expired";
  }
  return garage.plan;
}

/** Renvoie la config de plan à utiliser pour les quotas (trial → Pro). */
function planQuota(garage: Garage): PlanPayant | null {
  const p = planEffectif(garage);
  if (p === "expired") return null;
  return p; // "atelier" | "pro"
}

export function peutCreerDossier(garage: Garage): boolean {
  return planEffectif(garage) !== "expired";
}

/** Les SMS sont inclus dans tous les plans payants (Atelier et Pro), pas en expiré. */
export function peutEnvoyerSms(garage: Garage): boolean {
  return planEffectif(garage) !== "expired";
}

export function maxPhotosParDossier(garage: Garage): number {
  const p = planQuota(garage);
  return p ? PLANS[p].maxPhotos : 0;
}

/** Nombre de véhicules (nouveaux dossiers) autorisés par mois. Infinity = illimité. */
export function quotaVehicules(garage: Garage): number {
  const p = planQuota(garage);
  return p ? PLANS[p].quotaVehicules : 0;
}

/** Nombre de SMS inclus par mois avant facturation au dépassement. */
export function quotaSms(garage: Garage): number {
  const p = planQuota(garage);
  return p ? PLANS[p].quotaSms : 0;
}

/** Coût des SMS envoyés au-delà du quota. */
export function coutDepassementSms(smsEnvoyes: number, quota: number): number {
  const surplus = Math.max(0, smsEnvoyes - quota);
  return Math.round(surplus * PRIX_SMS_SUPPLEMENTAIRE * 100) / 100;
}

/** Le retrait de la mention Fiavo est réservé au plan Pro. */
export function brandingRetirable(garage: Garage): boolean {
  return planEffectif(garage) === "pro";
}
