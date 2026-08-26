import { cookies } from "next/headers";

/**
 * Mode démo « global » : actif quand Supabase n'est pas configuré (ou via
 * NEXT_PUBLIC_DEMO=true). Toute l'app tourne alors sur des données en mémoire.
 * Sert au build et aux composants qui ne dépendent pas de la requête.
 */
export const DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO === "true" ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL;

/** Cookie qui active une session de démonstration pour un visiteur. */
export const COOKIE_DEMO = "mt_demo";

/**
 * Vrai si la requête courante doit utiliser les données de démo : soit l'app
 * est en mode démo global, soit le visiteur a lancé une session de démo
 * (cookie) — ce qui permet à la démo de coexister avec les vrais comptes une
 * fois Supabase branché. À n'appeler que côté serveur (Server Component,
 * Route Handler, Server Action).
 */
export function estDemo(): boolean {
  if (DEMO_MODE) return true;
  try {
    return cookies().get(COOKIE_DEMO)?.value === "1";
  } catch {
    return false;
  }
}

// URL publique de l'app. Priorité : variable explicite, puis domaine Vercel
// (auto-détecté, aucune config requise), puis localhost en dev. Évite qu'un
// lien de suivi copié pointe vers localhost sur un déploiement Vercel.
const vercelUrl =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");

export function lienSuivi(token: string): string {
  return `${APP_URL}/suivi/${token}`;
}

export function lienDocument(token: string, devisId: string): string {
  return `${APP_URL}/document/${token}/${devisId}`;
}

/** Adresse qui reçoit les messages de support des garages. */
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "contact@fiavo.fr";
