import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { baseUrl, estDemo } from "@/lib/config";
import { getGarageCourant } from "@/lib/db";
import { stripe, stripeConfigure } from "@/lib/stripe";

export async function GET() {
  // Domaine réel de la requête, comme le checkout : une NEXT_PUBLIC_APP_URL mal
  // réglée renvoyait un client payant vers un autre domaine (ou localhost).
  const base = baseUrl();
  const garage = await getGarageCourant();
  if (!garage) return NextResponse.redirect(`${base}/auth/login`);

  if (estDemo() || !stripeConfigure() || !garage.stripe_customer_id) {
    return NextResponse.redirect(
      `${base}/dashboard/compte?erreur=portail-indisponible`
    );
  }

  const session = await stripe().billingPortal.sessions.create({
    customer: garage.stripe_customer_id,
    return_url: `${base}/dashboard/compte`,
  });
  return NextResponse.redirect(session.url, { status: 303 });
}
