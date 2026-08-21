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
  return res;
}
