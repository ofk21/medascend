import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getUserOverview } from "@/lib/analytics";
import { PageHeader, Stat } from "@/components/ui/misc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusTone } from "@/components/ui/badge";
import { formatDate, formatDateTime, formatPrice, pct } from "@/lib/utils";
import { UserControls } from "./controls";

export default async function AdminUserPage({ params }: PageProps<"/admin/users/[id]">) {
  const { id } = await params;
  const admin = await requireAdmin();
  const [u, plans] = await Promise.all([
    db.user.findUnique({ where: { id }, include: { subscriptions: { orderBy: { createdAt: "desc" }, include: { plan: true } }, sessions: { orderBy: { startedAt: "desc" }, take: 10 } } }),
    db.plan.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!u) notFound();
  const o = await getUserOverview(u.id);
  const now = new Date();

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> Users</Link>
      <PageHeader eyebrow={u.role} title={u.name} description={<>{u.email} · joined {formatDate(u.createdAt)} · last active {formatDateTime(u.lastActiveAt)}{u.trialEndsAt && <> · trial {u.trialEndsAt > now ? "ends" : "ended"} {formatDateTime(u.trialEndsAt)}</>}</>} />
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Answered" value={o.answered} />
        <Stat label="Accuracy" value={`${o.accuracy}%`} />
        <Stat label="Readiness" value={o.readiness} />
        <Stat label="Sessions" value={u.sessions.length >= 10 ? "10+" : u.sessions.length} hint={`${o.flags} flags · ${o.notes} notes`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <UserControls userId={u.id} role={u.role} isSelf={admin.id === u.id} plans={plans} subscriptions={u.subscriptions.map((s) => ({ id: s.id, plan: s.plan.name, startsAt: s.startsAt.toISOString(), endsAt: s.endsAt.toISOString(), status: s.status, source: s.source, amount: formatPrice(s.amountPence, s.currency), active: s.status === "ACTIVE" && s.endsAt > now }))} />
        <Card>
          <CardHeader><CardTitle>Recent sessions</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y divide-line text-sm">
              {u.sessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2">
                  <div><p className="font-medium">{s.title}</p><p className="text-xs text-muted">{formatDateTime(s.startedAt)} · {s.mode}</p></div>
                  <div className="flex items-center gap-2"><Badge tone={statusTone(s.status)}>{s.status.toLowerCase()}</Badge><span className="font-display font-bold">{s.status === "COMPLETED" ? `${pct(s.correctCount, s.totalQuestions)}%` : `${s.answeredCount}/${s.totalQuestions}`}</span></div>
                </li>
              ))}
              {u.sessions.length === 0 && <li className="py-2 text-muted">No sessions yet.</li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
