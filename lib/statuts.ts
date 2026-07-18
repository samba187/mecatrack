import type { Statut } from "./types";

export interface StatutConfig {
  value: Statut;
  label: string;
  labelClient: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
  pulse?: boolean;
}

export const STATUTS: StatutConfig[] = [
  {
    value: "en_attente",
    label: "En attente",
    labelClient: "Véhicule pris en charge",
    description: "Le véhicule est arrivé, intervention pas encore commencée",
    color: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-200",
    dot: "bg-slate-500",
  },
  {
    value: "diagnostic",
    label: "Diagnostic",
    labelClient: "Diagnostic en cours",
    description: "Recherche de la panne en cours",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  {
    value: "en_cours",
    label: "Réparation en cours",
    labelClient: "Réparation en cours",
    description: "Les travaux sont en cours",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  {
    value: "en_attente_validation",
    label: "Attente validation",
    labelClient: "Votre validation est attendue",
    description: "Un devis attend la validation du client",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    pulse: true,
  },
  {
    value: "pret",
    label: "Prêt",
    labelClient: "Véhicule prêt",
    description: "Le client peut venir récupérer son véhicule",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-600",
  },
  {
    value: "livre",
    label: "Livré",
    labelClient: "Véhicule restitué",
    description: "Le véhicule a été rendu au client",
    color: "text-gray-700",
    bg: "bg-gray-100",
    border: "border-gray-300",
    dot: "bg-gray-600",
  },
];

export function statutConfig(statut: Statut): StatutConfig {
  return STATUTS.find((s) => s.value === statut) ?? STATUTS[0];
}
