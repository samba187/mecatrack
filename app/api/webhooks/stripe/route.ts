import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { APP_URL } from "@/lib/config";
import { emailPaiementEchoue } from "@/lib/notifications";
import { planPourPriceId, stripe, stripeConfigure } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Garage } from "@/lib/types";

export async function POST(request: NextRequest) {
  if (!stripeConfigure()) {
    return NextResponse.json({ error: "Stripe non configuré" }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      await request.text(),
      signature,
      secret
    );
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const garageId = session.metadata?.garage_id;
      const plan = session.metadata?.plan === "atelier" ? "atelier" : "pro";
      if (garageId) {
        await admin
          .from("garages")
          .update({
            plan,
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
          })
          .eq("id", garageId);
        const { journaliser } = await import("@/lib/admin");
        await journaliser({
          niveau: "succes",
          type: "abonnement",
          message: `Nouvel abonnement ${plan === "pro" ? "Pro (59 €)" : "Atelier (34 €)"}`,
          garage: session.customer_details?.email ?? (session.customer as string),
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const garageId = sub.metadata?.garage_id;
      if (!garageId) break;
      if (sub.status === "active" || sub.status === "trialing") {
        const plan =
          planPourPriceId(sub.items.data[0]?.price.id ?? "") ?? "pro";
        await admin
          .from("garages")
          .update({ plan, stripe_subscription_id: sub.id })
          .eq("id", garageId);
      } else if (
        ["canceled", "unpaid", "incomplete_expired"].includes(sub.status)
      ) {
        await admin
          .from("garages")
          .update({ plan: "expired", stripe_subscription_id: null })
          .eq("id", garageId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const garageId = sub.metadata?.garage_id;
      if (garageId) {
        await admin
          .from("garages")
          .update({ plan: "expired", stripe_subscription_id: null })
          .eq("id", garageId);
        const { journaliser } = await import("@/lib/admin");
        await journaliser({
          niveau: "info",
          type: "abonnement",
          message: "Abonnement terminé (compte repassé en lecture seule)",
          garage:
            typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const { data: garage } = await admin
        .from("garages")
        .select("*")
        .eq("stripe_customer_id", customerId)
        .single();
      if (garage) {
        await emailPaiementEchoue(
          garage as Garage,
          `${APP_URL}/api/stripe/portal`
        );
        const { journaliser } = await import("@/lib/admin");
        await journaliser({
          niveau: "erreur",
          type: "paiement",
          message: "Échec de prélèvement d'abonnement (email envoyé au garage)",
          garage: (garage as Garage).email ?? (garage as Garage).nom,
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
