import { NextResponse } from "next/server";
import { estDemo } from "@/lib/config";
import { getGarageCourant } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * TEMPORAIRE : diagnostique l'envoi d'email.
 * - GET /api/diag-email          : état de la config
 * - GET /api/diag-email?to=x@y.z : envoie un vrai mail de test via Resend
 */
export async function GET(request: Request) {
  const garage = await getGarageCourant();
  if (!garage) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const cle = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Fiavo <notifications@fiavo.fr>";

  const diag: Record<string, unknown> = {
    garage: garage.nom,
    modeDemo: estDemo(),
    resendConfigure: Boolean(cle),
    cleResendLongueur: cle?.length ?? 0,
    emailFrom: from,
    supportEmail: process.env.SUPPORT_EMAIL ?? "contact@fiavo.fr (défaut)",
  };

  const to = new URL(request.url).searchParams.get("to");
  if (to) {
    if (!cle) {
      diag.envoi = { tente: false, raison: "RESEND_API_KEY absente." };
    } else {
      try {
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cle}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            from,
            to,
            subject: "Test Fiavo — envoi email",
            html: "<p>Si vous lisez ceci, l'envoi d'email fonctionne.</p>",
          }),
        });
        const corps = await r.text().catch(() => "");
        diag.envoi = {
          tente: true,
          destinataire: to,
          statutHttp: r.status,
          ok: r.ok,
          reponse: corps.slice(0, 400),
        };
      } catch (e) {
        diag.envoi = {
          tente: true,
          erreurReseau: e instanceof Error ? e.message : String(e),
        };
      }
    }
  }

  return NextResponse.json(diag);
}
