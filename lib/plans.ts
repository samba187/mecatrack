import type { Garage, Plan } from "./types";

export const PLANS = {
  essentiel: {
    id: "essentiel",
    nom: "Essentiel",
    prix: 19,
    description: "Le suivi client complet, sans les SMS automatiques.",
    fonctionnalites: [
      "Dossiers illimités",
      "Page de suivi client par lien",
      "10 photos par dossier",
      "Devis supplémentaires avec signature électronique",
      "Messagerie client intégrée",
      "Historique complet des interventions",
    ],
  },
  pro: {
    id: "pro",
    nom: "Pro",
    prix: 39,
    description: "L'expérience complète, le client est prévenu sans que vous décrochiez.",
    fonctionnalites: [
      "Tout le plan Essentiel",
      "SMS automatiques au client à chaque étape",
      "20 photos par dossier",
      "Votre logo sur la page de suivi",
      "Retrait de la mention Mécatrack",
      "Support prioritaire",
    ],
  },
} as const;

export const DUREE_ESSAI_JOURS = 14;

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

export function peutCreerDossier(garage: Garage): boolean {
  return planEffectif(garage) !== "expired";
}

export function peutEnvoyerSms(garage: Garage): boolean {
  return planEffectif(garage) === "pro";
}

export function maxPhotosParDossier(garage: Garage): number {
  const plan = planEffectif(garage);
  if (plan === "pro") return 20;
  if (plan === "essentiel") return 10;
  return 0;
}

export function brandingRetirable(garage: Garage): boolean {
  return planEffectif(garage) === "pro";
}
