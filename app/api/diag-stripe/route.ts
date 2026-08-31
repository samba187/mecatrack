import { NextResponse } from "next/server";
import { getGarageCourant } from "@/lib/db";
import { stripe, stripeConfigure } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** TEMPORAIRE : diagnostique la config Stripe (sans exposer les clés). */
export async function GET() {
  const garage = await getGarageCourant();
  if (!garage) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const sk = process.env.STRIPE_SECRET_KEY ?? "";
  const idAtelier = process.env.STRIPE_PRICE_ID_ATELIER ?? "";
  const idPro = process.env.STRIPE_PRICE_ID_PRO ?? "";

  const diag: Record<string, unknown> = {
    secretKeyPresente: Boolean(sk),
    modeCle: sk.startsWith("sk_live") ? "LIVE" : sk.startsWith("sk_test") ? "TEST" : "inconnu",
    priceAtelierPresent: Boolean(idAtelier),
    priceProPresent: Boolean(idPro),
    priceAtelierPrefixe: idAtelier.slice(0, 8) || null,
    priceProPrefixe: idPro.slice(0, 8) || null,
  };

  if (stripeConfigure()) {
    for (const [nom, id] of [
      ["atelier", idAtelier],
      ["pro", idPro],
    ] as const) {
      if (!id) {
        diag[`prix_${nom}`] = "variable absente";
        continue;
      }
      try {
        const p = await stripe().prices.retrieve(id);
        diag[`prix_${nom}`] = {
          ok: true,
          montant: (p.unit_amount ?? 0) / 100,
          devise: p.currency,
          recurrent: p.recurring?.interval ?? null,
        };
      } catch (e) {
        diag[`prix_${nom}`] = {
          ok: false,
          erreur: e instanceof Error ? e.message : String(e),
        };
      }
    }
  }

  return NextResponse.json(diag);
}
