import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { APP_URL, DEMO_MODE } from "@/lib/config";
import { getGarageCourant } from "@/lib/db";
import { stripe, stripeConfigure } from "@/lib/stripe";

export async function GET() {
  const garage = await getGarageCourant();
  if (!garage) return NextResponse.redirect(`${APP_URL}/auth/login`);

  if (DEMO_MODE || !stripeConfigure() || !garage.stripe_customer_id) {
    return NextResponse.redirect(
      `${APP_URL}/dashboard/compte?erreur=portail-indisponible`
    );
  }

  const session = await stripe().billingPortal.sessions.create({
    customer: garage.stripe_customer_id,
    return_url: `${APP_URL}/dashboard/compte`,
  });
  return NextResponse.redirect(session.url, { status: 303 });
}
