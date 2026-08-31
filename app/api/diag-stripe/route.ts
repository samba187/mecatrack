import { NextResponse } from "next/server";
import { stripe, stripeConfigure } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** TEMPORAIRE : diagnostic Stripe, protégé par ADMIN_PASSWORD (?cle=). */
export async function GET(request: Request) {
  const cle = new URL(request.url).searchParams.get("cle");
  if (!process.env.ADMIN_PASSWORD || cle !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "non autorisé" }, { status: 404 });
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
    priceAtelier: idAtelier.slice(0, 10) || null,
    pricePro: idPro.slice(0, 10) || null,
  };

  if (stripeConfigure()) {
    try {
      const p = await stripe().prices.retrieve(idAtelier);
      diag.prix_atelier = { ok: true, montant: (p.unit_amount ?? 0) / 100 };
    } catch (e) {
      diag.prix_atelier = {
        ok: false,
        erreur: e instanceof Error ? e.message : String(e),
      };
    }
    try {
      const p = await stripe().prices.retrieve(idPro);
      diag.prix_pro = { ok: true, montant: (p.unit_amount ?? 0) / 100 };
    } catch (e) {
      diag.prix_pro = {
        ok: false,
        erreur: e instanceof Error ? e.message : String(e),
      };
    }
    // Reproduit l'opération qui échoue au checkout : création d'une session.
    try {
      const session = await stripe().checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: idAtelier, quantity: 1 }],
        success_url: "https://www.fiavo.fr/dashboard/compte",
        cancel_url: "https://www.fiavo.fr/dashboard/compte",
      });
      diag.session = { ok: true, cree: Boolean(session.url) };
    } catch (e) {
      diag.session = {
        ok: false,
        erreur: e instanceof Error ? e.message : String(e),
      };
    }
  }

  return NextResponse.json(diag);
}
