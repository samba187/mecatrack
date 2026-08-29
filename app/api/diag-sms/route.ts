import { NextResponse } from "next/server";
import { getGarageCourant, smsCeMois } from "@/lib/db";
import { normaliserTel } from "@/lib/notifications";
import { peutEnvoyerSms, planEffectif, quotaSms } from "@/lib/plans";

export const dynamic = "force-dynamic";

/**
 * Diagnostic d'envoi de SMS (réservé au garage connecté).
 * - GET /api/diag-sms            : état de la configuration
 * - GET /api/diag-sms?to=+336... : tente un envoi réel et renvoie la réponse
 *   brute du fournisseur (statut HTTP + corps), sans jamais exposer la clé.
 */
export async function GET(request: Request) {
  const garage = await getGarageCourant();
  if (!garage) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const cle = process.env.BREVO_API_KEY;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const brut = process.env.SMS_SENDER_ID ?? "Fiavo";
  const expediteur =
    brut
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 11) || "Fiavo";

  const diag: Record<string, unknown> = {
    garage: garage.nom,
    plan: planEffectif(garage),
    smsAutoriseParLePlan: peutEnvoyerSms(garage),
    quotaSms: quotaSms(garage),
    smsConsommesCeMois: await smsCeMois(garage),
    fournisseur: cle ? "brevo" : sid ? "twilio" : "aucun (mode simulation)",
    cleBrevoPresente: Boolean(cle),
    cleBrevoLongueur: cle?.length ?? 0,
    cleBrevoPrefixe: cle ? cle.slice(0, 8) + "…" : null,
    expediteurUtilise: expediteur,
  };

  const to = new URL(request.url).searchParams.get("to");
  if (to) {
    // Dans une URL, « + » est décodé en espace : on le rétablit avant
    // normalisation pour que ?to=+33... soit interprété correctement.
    const destinataire = normaliserTel(to.trim().replace(/^\s+/, ""));

    if (!cle) {
      diag.envoi = {
        tente: false,
        raison: "BREVO_API_KEY absente — l'app est en mode simulation.",
      };
    } else {
      try {
        const r = await fetch("https://api.brevo.com/v3/transactionalSMS/send", {
          method: "POST",
          headers: {
            "api-key": cle,
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            sender: expediteur,
            recipient: destinataire,
            content: `Test Fiavo : si vous recevez ce message, l'envoi de SMS fonctionne.`,
            type: "transactional",
          }),
        });
        const corps = await r.text().catch(() => "");
        diag.envoi = {
          tente: true,
          destinataire,
          statutHttp: r.status,
          ok: r.ok,
          reponse: corps.slice(0, 500),
        };
      } catch (e) {
        diag.envoi = {
          tente: true,
          destinataire,
          erreurReseau: e instanceof Error ? e.message : String(e),
        };
      }
    }
  }

  return NextResponse.json(diag);
}
