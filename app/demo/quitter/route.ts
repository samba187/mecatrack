import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_DEMO } from "@/lib/config";

// Quitte la session de démonstration : retire le cookie et revient à l'accueil.
export function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/", request.url));
  res.cookies.set(COOKIE_DEMO, "", { path: "/", maxAge: 0 });
  return res;
}
