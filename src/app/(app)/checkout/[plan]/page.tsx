import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Check, ShieldCheck, Lock } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { PLAN_FEATURES } from "@/content/site";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = { title: "Checkout" };

async function beginCheckout(planId: string) {
  "use server";
  const user = await requireUser();
  const plan = await db.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.active) redirect("/pricing");
  if (!stripeEnabled()) redirect(`/checkout/${plan.slug}?unavailable=1`);
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [{ quantity: 1, price_data: { currency: "gbp", unit_amount: plan.pricePence, product_data: { name: `${BRAND.name} – MRCP Part 1 · ${plan.name}`, description: `${plan.durationDays} days of full access` } } }],
    metadata: { userId: user.id, planId: plan.id },
    success_url: `${BRAND.url}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BRAND.url}/checkout/${plan.slug}?cancelled=1`,
  });
  if (!session.url) redirect("/pricing");
  redirect(session.url);
}

export default async function CheckoutPage({ params, searchParams }: PageProps<"/checkout/[plan]">) {
  const { plan: slug } = await params;
  const sp = await searchParams;
  const user = await requireUser();
  const plan = await db.plan.findUnique({ where: { slug } });
  if (!plan || !plan.active) notFound();
  const enabled = stripeEnabled();

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">Checkout</p>
      <h1 className="font-display text-3xl font-bold tracking-tight">{plan.name} access</h1>
      <p className="mt-1 text-muted">Signed in as {user.email}</p>
      {sp.cancelled && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Payment was cancelled – nothing has been charged.</p>}
      <div className="mt-8 grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold">What you get</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {PLAN_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5"><Check className="mt-0.5 h-4 w-4 text-brand-600" /> {f}</li>
            ))}
          </ul>
          <p className="mt-6 flex items-start gap-2 text-xs text-muted"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> 7-day money-back guarantee if you have answered fewer than 50 questions. One-off payment, no auto-renewal. Existing access is extended, never replaced.</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted">Total</p>
          <p className="font-display text-4xl font-bold">{formatPrice(plan.pricePence)}</p>
          <p className="text-xs text-muted">{plan.durationDays} days · GBP · VAT included where applicable</p>
          {enabled && !sp.unavailable ? (
            <form action={beginCheckout.bind(null, plan.id)} className="mt-6">
              <Button type="submit" className="w-full" size="lg"><Lock className="h-4 w-4" /> Pay securely with Stripe</Button>
            </form>
          ) : (
            <div className="mt-6 rounded-xl border border-line bg-bg-soft p-4 text-sm">
              <p className="font-semibold">Online payments are not enabled yet</p>
              <p className="mt-1 text-muted">Email <a className="underline" href={`mailto:${BRAND.supportEmail}?subject=Purchase%20${encodeURIComponent(plan.name)}`}>{BRAND.supportEmail}</a> and we will activate your access manually.</p>
            </div>
          )}
          <p className="mt-4 text-center text-xs text-muted">Card, Apple Pay and Google Pay accepted.</p>
        </Card>
      </div>
    </div>
  );
}
