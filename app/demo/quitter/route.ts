import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_DEMO } from "@/lib/config";
import { oublierDemo } from "@/lib/demo/store";

export const runtime = "nodejs";

// Quitte la session de démonstration : retire le cookie, libère l'état stocké
// et revient à l'accueil.
export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_DEMO)?.value;
  if (session) await oublierDemo(session);
  const res = NextResponse.redirect(new URL("/", request.url));
  res.cookies.set(COOKIE_DEMO, "", { path: "/", maxAge: 0 });
  return res;
}
