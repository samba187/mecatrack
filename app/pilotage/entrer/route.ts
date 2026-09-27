import { NextResponse, type NextRequest } from "next/server";
import { jetonPilotage } from "@/lib/admin";
import { COOKIE_DEMO } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * Connexion au pilotage : /pilotage/entrer?cle=MOT_DE_PASSE.
 * Mauvais mot de passe (ou pilotage désactivé) => 404, la page reste invisible.
 */
export function GET(request: NextRequest) {
  const cle = request.nextUrl.searchParams.get("cle");
  const jeton = jetonPilotage();
  if (!jeton || !cle || cle !== process.env.ADMIN_PASSWORD) {
    return new NextResponse("Not found", { status: 404 });
  }
  const res = NextResponse.redirect(new URL("/pilotage", request.url));
  res.cookies.set("fiavo_pilo", jeton, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });
  // Une session démo et une session fondateur n'ont aucune raison de coexister :
  // un cookie mt_demo qui traîne coupait silencieusement les envois d'email de
  // /pilotage (relance, message) et les entrées de journal.
  res.cookies.set(COOKIE_DEMO, "", { path: "/", maxAge: 0 });
  return res;
}
