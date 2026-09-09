import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { db } from "@/lib/db";
import { grantPlan } from "@/lib/subscriptions";

export async function POST(req: Request) {
  if (!stripeEnabled() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig ?? "", process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${(err as Error).message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    if (userId && planId && session.payment_status === "paid") {
      const exists = await db.subscription.findUnique({ where: { stripeSessionId: session.id } });
      if (!exists) {
        await grantPlan({
          userId,
          planId,
          source: "STRIPE",
          stripeSessionId: session.id,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
          amountPence: session.amount_total ?? undefined,
          currency: session.currency?.toUpperCase(),
        });
      }
    }
  }
  return NextResponse.json({ received: true });
}
