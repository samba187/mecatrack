import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_DEMO } from "@/lib/config";

// Lance une session de démonstration : pose le cookie et ouvre le dashboard
// pré-rempli avec le garage fictif. Fonctionne même quand Supabase est branché.
export function GET(request: NextRequest) {
  const res = NextResponse.redirect(
    new URL("/dashboard/dossiers", request.url)
  );
  res.cookies.set(COOKIE_DEMO, "1", {
    path: "/",
    maxAge: 60 * 60 * 24, // 24 h
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
