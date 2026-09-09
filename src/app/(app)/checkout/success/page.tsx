import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { grantPlan } from "@/lib/subscriptions";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Payment complete" };

export default async function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const sp = await searchParams;
  const user = await requireUser();
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : null;

  // Belt-and-braces: if the webhook has not arrived yet, verify with Stripe directly.
  if (sessionId && stripeEnabled()) {
    const exists = await db.subscription.findUnique({ where: { stripeSessionId: sessionId } });
    if (!exists) {
      try {
        const cs = await stripe().checkout.sessions.retrieve(sessionId);
        if (cs.payment_status === "paid" && cs.metadata?.userId === user.id && cs.metadata?.planId) {
          await grantPlan({ userId: user.id, planId: cs.metadata.planId, source: "STRIPE", stripeSessionId: cs.id, stripeCustomerId: typeof cs.customer === "string" ? cs.customer : undefined, amountPence: cs.amount_total ?? undefined, currency: cs.currency?.toUpperCase() });
        }
      } catch (e) {
        console.error("[checkout/success]", e);
      }
    }
  }
  const sub = await db.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE", endsAt: { gt: new Date() } }, orderBy: { endsAt: "desc" }, include: { plan: true } });

  return (
    <div className="mx-auto max-w-lg py-10 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-200"><CheckCircle2 className="h-8 w-8" /></span>
      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">{sub ? "You're all set!" : "Thank you"}</h1>
      <p className="mt-2 text-muted">
        {sub ? `${sub.plan.name} access is active until ${formatDate(sub.endsAt)}. A receipt has been emailed to you.` : "Your payment is being confirmed. Access usually activates within a minute – refresh this page shortly."}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button href="/qbank" size="lg">Start practising</Button>
        <Button href="/dashboard" variant="outline" size="lg">Dashboard</Button>
      </div>
    </div>
  );
}
