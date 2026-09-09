import "server-only";
import Stripe from "stripe";

export function stripeEnabled() {
  return !!process.env.STRIPE_SECRET_KEY;
}

let client: Stripe | null = null;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured");
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}
