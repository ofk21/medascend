import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/misc";
import { PlansEditor } from "./editor";

export default async function AdminPlansPage() {
  const plans = await db.plan.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { subscriptions: true } } } });
  return (
    <div>
      <PageHeader eyebrow="Business" title="Plans & pricing" description="Plans are one-off purchases. Prices are in GBP. Inactive plans are hidden from the pricing page but keep their history." />
      <PlansEditor items={plans.map((p) => ({ id: p.id, name: p.name, durationDays: p.durationDays, pricePounds: p.pricePence / 100, badge: p.badge ?? "", description: p.description ?? "", sortOrder: p.sortOrder, active: p.active, purchases: p._count.subscriptions }))} />
    </div>
  );
}
