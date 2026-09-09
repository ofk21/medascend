import "server-only";
import { db } from "./db";

/** Grant (or extend) access for a plan. New period is appended to any active subscription. */
export async function grantPlan(opts: { userId: string; planId: string; source: "STRIPE" | "ADMIN"; stripeSessionId?: string; stripeCustomerId?: string; amountPence?: number; currency?: string }) {
  const plan = await db.plan.findUniqueOrThrow({ where: { id: opts.planId } });
  const current = await db.subscription.findFirst({ where: { userId: opts.userId, status: "ACTIVE", endsAt: { gt: new Date() } }, orderBy: { endsAt: "desc" } });
  const startsAt = current ? current.endsAt : new Date();
  const endsAt = new Date(startsAt.getTime() + plan.durationDays * 86_400_000);
  return db.subscription.create({
    data: {
      userId: opts.userId,
      planId: plan.id,
      status: "ACTIVE",
      startsAt,
      endsAt,
      source: opts.source,
      stripeSessionId: opts.stripeSessionId,
      stripeCustomerId: opts.stripeCustomerId,
      amountPence: opts.amountPence ?? plan.pricePence,
      currency: opts.currency ?? "GBP",
    },
  });
}
