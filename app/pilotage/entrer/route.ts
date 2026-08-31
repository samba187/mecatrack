import { NextResponse, type NextRequest } from "next/server";
import { jetonPilotage } from "@/lib/admin";

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
  return res;
}
