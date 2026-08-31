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
    modeCle: sk.startsWith("sk_live")
      ? "LIVE"
      : sk.startsWith("sk_test")
        ? "TEST"
        : "inconnu",
    priceAtelierPrefixe: idAtelier.slice(0, 8) || null,
    priceProPrefixe: idPro.slice(0, 8) || null,
  };

  if (stripeConfigure()) {
    // Test « je peux créer une session » : reproduit l'erreur réelle du checkout.
    try {
      const p = await stripe().prices.retrieve(idAtelier);
      diag.prix_atelier = { ok: true, montant: (p.unit_amount ?? 0) / 100 };
    } catch (e) {
      diag.prix_atelier = { ok: false, erreur: e instanceof Error ? e.message : String(e) };
    }
    try {
      const p = await stripe().prices.retrieve(idPro);
      diag.prix_pro = { ok: true, montant: (p.unit_amount ?? 0) / 100 };
    } catch (e) {
      diag.prix_pro = { ok: false, erreur: e instanceof Error ? e.message : String(e) };
    }
  }

  return NextResponse.json(diag);
}
