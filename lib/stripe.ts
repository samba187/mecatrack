import "server-only";
import Stripe from "stripe";

export function stripeConfigure(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
    });
  }
  return client;
}

export function priceIdPourPlan(plan: "essentiel" | "pro"): string {
  const id =
    plan === "pro"
      ? process.env.STRIPE_PRICE_ID_PRO
      : process.env.STRIPE_PRICE_ID_ESSENTIEL;
  if (!id) throw new Error(`Price Stripe manquant pour le plan ${plan}`);
  return id;
}

export function planPourPriceId(priceId: string): "essentiel" | "pro" | null {
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_ID_ESSENTIEL) return "essentiel";
  return null;
}
