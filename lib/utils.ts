import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatEuros(montant: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(montant);
}

export function formatImmat(immat: string): string {
  const clean = immat.toUpperCase().replace(/[^A-Z0-9]/g, "");
  // Format SIV : AA-123-BB
  if (/^[A-Z]{2}[0-9]{3}[A-Z]{2}$/.test(clean)) {
    return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5)}`;
  }
  return immat.toUpperCase();
}

export function totauxDevis(
  lignes: { quantite: number; prix_unitaire_ht: number }[],
  tvaPct: number
): { ht: number; ttc: number; tva: number } {
  const ht =
    Math.round(
      lignes.reduce((s, l) => s + l.quantite * l.prix_unitaire_ht, 0) * 100
    ) / 100;
  const ttc = Math.round(ht * (1 + tvaPct / 100) * 100) / 100;
  return { ht, ttc, tva: Math.round((ttc - ht) * 100) / 100 };
}

export function joursRestants(iso: string | null): number {
  if (!iso) return 0;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
