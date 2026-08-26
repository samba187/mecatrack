// Valeurs pré-remplies à la création d'un nouveau garage : catalogue de
// prestations et textes du devis. Le garagiste peut tout modifier ensuite.

export const TVA_DEFAUT = 20;

export const CONDITIONS_PAIEMENT_DEFAUT =
  "Paiement à la restitution du véhicule (espèces, carte ou chèque).";

export const MENTIONS_DEVIS_DEFAUT =
  "Devis gratuit, valable 30 jours. Les travaux ne débutent qu'après votre validation.";

/** Prix HT indicatifs (moyenne garage indépendant) — à ajuster par le garage. */
export const PRESTATIONS_DEFAUT: { designation: string; prix_ht: number }[] = [
  { designation: "Vidange + filtre à huile", prix_ht: 89 },
  { designation: "Filtre à air", prix_ht: 39 },
  { designation: "Filtre habitacle (pollen)", prix_ht: 42 },
  { designation: "Filtre à carburant", prix_ht: 49 },
  { designation: "Plaquettes de frein avant (jeu, posées)", prix_ht: 119 },
  { designation: "Plaquettes de frein arrière (jeu, posées)", prix_ht: 109 },
  { designation: "Disques + plaquettes avant (posés)", prix_ht: 249 },
  { designation: "Disque de frein (l'unité)", prix_ht: 75 },
  { designation: "Forfait distribution (kit + pose)", prix_ht: 449 },
  { designation: "Courroie d'accessoires", prix_ht: 120 },
  { designation: "Embrayage (kit + pose)", prix_ht: 690 },
  { designation: "Pneu tourisme (monté + équilibré)", prix_ht: 89 },
  { designation: "Géométrie / parallélisme train avant", prix_ht: 65 },
  { designation: "Diagnostic électronique (valise)", prix_ht: 49 },
  { designation: "Recharge climatisation", prix_ht: 89 },
  { designation: "Batterie (pose comprise)", prix_ht: 149 },
  { designation: "Jeu de bougies (remplacement)", prix_ht: 79 },
  { designation: "Amortisseur avant (l'unité, posé)", prix_ht: 149 },
  { designation: "Main d'œuvre — taux horaire", prix_ht: 60 },
];
