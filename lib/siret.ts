/**
 * Vérifie un SIRET contre le registre officiel des entreprises
 * (recherche-entreprises.api.gouv.fr — gratuit, sans clé). Sert à garantir
 * qu'un compte correspond à une vraie entreprise immatriculée, pas à
 * n'importe qui. En cas d'indisponibilité de l'API, on ne bloque pas
 * l'inscription (fail-open) : seule une entreprise réellement introuvable
 * est rejetée.
 */
export async function verifierSiret(
  siretBrut: string
): Promise<{ ok: boolean; nom?: string; erreur?: string }> {
  const siret = siretBrut.replace(/\D/g, "");
  if (!/^\d{14}$/.test(siret)) {
    return { ok: false, erreur: "Le SIRET doit contenir 14 chiffres." };
  }

  try {
    const ctrl = new AbortController();
    const minuteur = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${siret}&page=1&per_page=1`,
      { signal: ctrl.signal, headers: { Accept: "application/json" } }
    );
    clearTimeout(minuteur);

    // API indisponible : on laisse passer plutôt que de bloquer les inscriptions.
    if (!res.ok) return { ok: true };

    const data = (await res.json()) as {
      results?: Array<{
        nom_complet?: string;
        siege?: { siret?: string };
        matching_etablissements?: Array<{ siret?: string }>;
      }>;
    };
    const results = data.results ?? [];
    const trouve = results.some(
      (r) =>
        r.siege?.siret === siret ||
        (r.matching_etablissements ?? []).some((e) => e.siret === siret)
    );
    if (!trouve) {
      return {
        ok: false,
        erreur:
          "Ce SIRET est introuvable au registre des entreprises. Vérifiez le numéro de votre établissement.",
      };
    }
    return { ok: true, nom: results[0]?.nom_complet };
  } catch {
    // Réseau lent / abort : on n'empêche pas l'inscription.
    return { ok: true };
  }
}
