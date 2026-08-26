import { NextResponse, type NextRequest } from "next/server";
import { APP_URL, DEMO_MODE } from "@/lib/config";
import { demoDb } from "@/lib/demo/store";
import { getGarageCourant } from "@/lib/db";
import { priceIdPourPlan, stripe, stripeConfigure } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const garage = await getGarageCourant();
  if (!garage) {
    return NextResponse.redirect(`${APP_URL}/auth/login`);
  }
  const plan =
    request.nextUrl.searchParams.get("plan") === "atelier"
      ? ("atelier" as const)
      : ("pro" as const);

  // Mode démo : simule la souscription sans paiement.
  if (DEMO_MODE) {
    demoDb().garage.plan = plan;
    return NextResponse.redirect(
      `${APP_URL}/dashboard/compte?abonnement=demo`
    );
  }

  if (!stripeConfigure()) {
    return NextResponse.redirect(
      `${APP_URL}/dashboard/compte?erreur=stripe-non-configure`
    );
  }

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
    success_url: `${APP_URL}/dashboard/compte?abonnement=ok`,
    cancel_url: `${APP_URL}/dashboard/compte?abonnement=annule`,
    metadata: { garage_id: garage.id, plan },
    subscription_data: { metadata: { garage_id: garage.id } },
    locale: "fr",
    allow_promotion_codes: true,
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
