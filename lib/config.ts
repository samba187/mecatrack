/**
 * Le mode démo s'active automatiquement quand Supabase n'est pas configuré
 * (ou explicitement via NEXT_PUBLIC_DEMO=true). Toute l'application fonctionne
 * alors sur un jeu de données en mémoire : pratique pour développer sans clés
 * et pour faire une démonstration du produit à un garagiste.
 */
export const DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO === "true" ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL;

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
