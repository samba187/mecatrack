import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_DEMO, DEMO_MODE } from "@/lib/config";
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
    return NextResponse.next();
  }
  return updateSession(request);
}

export const config = {
  // Inclut /api : sans le rafraîchissement de session du middleware, une route
  // API voyait l'utilisateur comme déconnecté dès que le jeton d'accès expirait
  // (~1 h), faisant échouer génération de PDF et incrément du compteur SMS.
  matcher: ["/dashboard/:path*", "/auth/:path*", "/api/:path*"],
};
