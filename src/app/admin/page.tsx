import Link from "next/link";
import { Users, ListChecks, CreditCard, Activity, Inbox, FileText, BookOpen, AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader, Stat } from "@/components/ui/misc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatDateTime, pct } from "@/lib/utils";
import { SPECIALTIES } from "@/lib/constants";

export default async function AdminDashboard() {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const [users, newUsers, activeSubs, revenue, questions, drafts, answers30, papers, topics, messages, recentUsers, bySpecialty, hardest] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: since } } }),
    db.subscription.count({ where: { status: "ACTIVE", endsAt: { gt: new Date() } } }),
    db.subscription.aggregate({ _sum: { amountPence: true }, where: { source: "STRIPE", createdAt: { gte: since } } }),
    db.question.count({ where: { status: "PUBLISHED" } }),
    db.question.count({ where: { status: "DRAFT" } }),
    db.sessionQuestion.count({ where: { answeredAt: { gte: since } } }),
    db.paper.count({ where: { published: true } }),
    db.textbookTopic.count({ where: { published: true } }),
    db.contactMessage.count({ where: { handled: false } }),
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, name: true, email: true, createdAt: true, role: true } }),
    db.specialty.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { questions: { where: { status: "PUBLISHED" } } } } } }),
    db.question.findMany({ where: { status: "PUBLISHED", timesAnswered: { gte: 5 } }, orderBy: [{ timesCorrect: "asc" }], take: 5, select: { id: true, stem: true, timesAnswered: true, timesCorrect: true, specialty: { select: { name: true } } } }),
  ]);
  const target = SPECIALTIES.reduce((s, x) => s + x.blueprintCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Overview" description="Platform health at a glance – last 30 days." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Users" value={users.toLocaleString()} hint={`+${newUsers} in 30 days`} icon={<Users className="h-4.5 w-4.5" />} />
        <Stat label="Active subscriptions" value={activeSubs} hint={`${pct(activeSubs, users)}% of users`} icon={<CreditCard className="h-4.5 w-4.5" />} />
        <Stat label="Revenue (30d, Stripe)" value={formatPrice(revenue._sum.amountPence ?? 0)} icon={<Activity className="h-4.5 w-4.5" />} />
        <Stat label="Answers submitted (30d)" value={answers30.toLocaleString()} icon={<ListChecks className="h-4.5 w-4.5" />} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/questions"><Stat label="Published questions" value={questions} hint={drafts ? `${drafts} drafts awaiting review` : "No drafts"} icon={<ListChecks className="h-4.5 w-4.5" />} /></Link>
        <Link href="/admin/papers"><Stat label="Published papers" value={papers} icon={<FileText className="h-4.5 w-4.5" />} /></Link>
        <Link href="/admin/textbook"><Stat label="Textbook topics" value={topics} icon={<BookOpen className="h-4.5 w-4.5" />} /></Link>
        <Link href="/admin/messages"><Stat label="Unhandled messages" value={messages} icon={<Inbox className="h-4.5 w-4.5" />} className={messages ? "border-amber-300" : ""} /></Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Question bank coverage</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {bySpecialty.map((s) => {
                const share = s._count.questions;
                const ideal = Math.round((s.blueprintCount / target) * questions);
                const low = share < ideal * 0.8;
                return (
                  <li key={s.id} className="flex items-center gap-3 text-sm">
                    <span className="w-56 truncate">{s.name}</span>
                    <div className="h-2 flex-1 rounded-full bg-bg-soft"><div className={low ? "h-2 rounded-full bg-amber-400" : "h-2 rounded-full bg-brand-600"} style={{ width: `${Math.min(100, (share / Math.max(1, ideal)) * 100)}%` }} /></div>
                    <span className="w-24 text-right text-xs text-muted">{share} / ~{ideal}</span>
                    {low && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-muted">Target is proportional to the exam blueprint. Amber = under 80% of target.</p>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Newest users</CardTitle></CardHeader>
            <CardContent>
              <ul className="divide-y divide-line text-sm">
                {recentUsers.map((u) => (
                  <li key={u.id} className="flex items-center justify-between py-2">
                    <div><Link href={`/admin/users/${u.id}`} className="font-semibold hover:underline">{u.name}</Link><p className="text-xs text-muted">{u.email}</p></div>
                    <span className="text-xs text-muted">{formatDateTime(u.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Hardest questions</CardTitle></CardHeader>
            <CardContent>
              <ul className="divide-y divide-line text-sm">
                {hardest.map((q) => (
                  <li key={q.id} className="py-2">
                    <Link href={`/admin/questions/${q.id}`} className="line-clamp-1 hover:underline">{q.stem}</Link>
                    <p className="text-xs text-muted">{q.specialty.name} · {pct(q.timesCorrect, q.timesAnswered)}% correct of {q.timesAnswered}</p>
                  </li>
                ))}
                {hardest.length === 0 && <li className="py-2 text-muted">Not enough answer data yet.</li>}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
