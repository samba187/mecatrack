import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_DEMO, DUREE_DEMO } from "@/lib/config";

// Lance une session de démonstration : pose le cookie et ouvre le dashboard
// pré-rempli avec le garage fictif. Fonctionne même quand Supabase est branché.
export function GET(request: NextRequest) {
  // Cette route a des effets de bord (pose un cookie, déconnecte la session
  // réelle) : elle ne doit s'exécuter que sur un clic explicite. Or les boutons
  // « Explorer la démo » sont des <Link>, que Next précharge dès qu'ils entrent
  // dans le viewport — un simple scroll sur l'accueil déconnectait donc le
  // garage connecté. On ignore les préchargements et les aperçus de lien ; on
  // ne teste PAS l'en-tête RSC, présent aussi sur un vrai clic.
  if (
    request.headers.get("next-router-prefetch") ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("x-purpose") === "preview" ||
    request.headers.get("sec-purpose")?.includes("prefetch")
  ) {
    return new NextResponse(null, { status: 204 });
  }

  const res = NextResponse.redirect(
    new URL("/dashboard/dossiers", request.url)
  );
  res.cookies.set(COOKIE_DEMO, "1", {
    path: "/",
    maxAge: DUREE_DEMO,
    sameSite: "lax",
  });
  // Entrer en démo déconnecte toute vraie session : on évite ainsi que les deux
  // états coexistent (source des confusions démo / vrai compte). Les jetons
  // Supabase sont dans des cookies « sb-…-auth-token » (parfois découpés .0/.1).
  for (const c of request.cookies.getAll()) {
    if (/^sb-.+-auth-token(\.\d+)?$/.test(c.name)) {
      res.cookies.set(c.name, "", { path: "/", maxAge: 0 });
    }
  }
  return res;
}
