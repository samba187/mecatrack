import { NextResponse, type NextRequest } from "next/server";
import { DEMO_MODE } from "@/lib/config";
import { demoDb } from "@/lib/demo/store";
import { getGarageCourant } from "@/lib/db";
import { priceIdPourPlan, stripe, stripeConfigure } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Base = domaine réel de la requête (fiavo.fr), pas une variable d'env
  // potentiellement mal réglée : évite un success_url invalide côté Stripe.
  const base = request.nextUrl.origin;
  const compte = `${base}/dashboard/compte`;

  const garage = await getGarageCourant();
  if (!garage) {
    return NextResponse.redirect(`${base}/auth/login`);
  }
  const plan =
    request.nextUrl.searchParams.get("plan") === "atelier"
      ? ("atelier" as const)
      : ("pro" as const);

  // Mode démo : simule la souscription sans paiement.
  if (DEMO_MODE) {
    demoDb().garage.plan = plan;
    return NextResponse.redirect(`${compte}?abonnement=demo`);
  }

  if (!stripeConfigure()) {
    return NextResponse.redirect(`${compte}?erreur=stripe-non-configure`);
  }

  try {
    const s = stripe();
    let customerId = garage.stripe_customer_id;
    if (!customerId) {
      const customer = await s.customers.create({
        email: garage.email ?? undefined,
        name: garage.nom,
        metadata: { garage_id: garage.id },
      });
      customerId = customer.id;
      const { supabaseAdmin } = await import("@/lib/supabase/server");
      await supabaseAdmin()
        .from("garages")
        .update({ stripe_customer_id: customerId })
        .eq("id", garage.id);
    }

    const session = await s.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceIdPourPlan(plan), quantity: 1 }],
      success_url: `${compte}?abonnement=ok`,
      cancel_url: `${compte}?abonnement=annule`,
      metadata: { garage_id: garage.id, plan },
      subscription_data: { metadata: { garage_id: garage.id } },
      locale: "fr",
      allow_promotion_codes: true,
    });

    if (!session.url) throw new Error("Stripe n'a pas renvoyé d'URL de paiement");
    return NextResponse.redirect(session.url, { status: 303 });
  } catch (e) {
    // Plutôt qu'une page d'erreur brute : on renvoie au compte avec un message,
    // et on journalise la cause exacte (prix inexistant, clé invalide…).
    console.error("Échec création session Stripe", e);
    return NextResponse.redirect(`${compte}?erreur=stripe-checkout`);
  }
}
