import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_DEMO, DEMO_MODE, DUREE_DEMO } from "@/lib/config";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Mode démo global (pas de Supabase) : accès direct, aucune authentification.
  if (DEMO_MODE) return NextResponse.next();
  // Session de démonstration (le visiteur a cliqué « Voir la démo ») : on laisse
  // parcourir le dashboard sans compte, mais /auth reste accessible pour
  // s'inscrire pour de vrai.
  if (
    request.cookies.get(COOKIE_DEMO)?.value === "1" &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    // Réarme le cookie : tant que le visiteur explore, la démo ne doit jamais
    // expirer sous ses pieds et le renvoyer vers /auth/login.
    const res = NextResponse.next();
    res.cookies.set(COOKIE_DEMO, "1", {
      path: "/",
      maxAge: DUREE_DEMO,
      sameSite: "lax",
    });
    return res;
  }
  return updateSession(request);
}

export const config = {
  // Inclut /api : sans le rafraîchissement de session du middleware, une route
  // API voyait l'utilisateur comme déconnecté dès que le jeton d'accès expirait
  // (~1 h), faisant échouer génération de PDF et incrément du compteur SMS.
  matcher: ["/dashboard/:path*", "/auth/:path*", "/api/:path*"],
};
