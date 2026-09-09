import type { Metadata } from "next";
import Link from "next/link";
import { Target, Users, Clock, CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserOverview } from "@/lib/analytics";
import { PageHeader, Stat, Progress } from "@/components/ui/misc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Donut, TrendChart, ActivityChart } from "@/components/app/charts";
import { formatDuration, pct, formatDate } from "@/lib/utils";
import { DIFFICULTY_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const user = await requireUser();
  const [o, completed] = await Promise.all([
    getUserOverview(user.id),
    db.session.findMany({ where: { userId: user.id, status: "COMPLETED", totalQuestions: { gte: 5 } }, orderBy: { completedAt: "asc" }, take: 30, select: { completedAt: true, correctCount: true, totalQuestions: true, title: true } }),
  ]);
  const trend = completed.map((s) => ({ label: `${s.title} · ${formatDate(s.completedAt)}`, value: pct(s.correctCount, s.totalQuestions) }));
  const rows = o.bySpecialty.slice().sort((a, b) => (a.accuracy ?? 101) - (b.accuracy ?? 101));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Analytics" title="Your performance" description="Accuracy by specialty and difficulty, trend over time and how you compare with other candidates on the same questions." />

      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <Card className="flex items-center gap-6 p-6">
          <Donut value={o.readiness} size={150} label="Readiness" />
          <div className="max-w-xs">
            <p className="font-display text-lg font-bold">{o.readiness >= 70 ? "You look ready" : o.readiness >= 55 ? "Getting close" : "Keep building"}</p>
            <p className="mt-1 text-sm text-muted">Blends blueprint-weighted accuracy (65%), recent accuracy (20%) and coverage of the bank (15%). Aim for 70+ before exam day.</p>
          </div>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Overall accuracy" value={`${o.accuracy}%`} hint={`${o.correct}/${o.answered} correct`} icon={<CheckCircle2 className="h-4.5 w-4.5" />} />
          <Stat label="Recent accuracy" value={`${o.recentAccuracy}%`} hint="Last 100 answers" icon={<Target className="h-4.5 w-4.5" />} />
          <Stat label="Peer average" value={o.peerAccuracy !== null ? `${o.peerAccuracy}%` : "—"} hint="Same questions, all users" icon={<Users className="h-4.5 w-4.5" />} />
          <Stat label="Avg. time / question" value={formatDuration(o.avgTimeSec)} hint="Exam pace is 1:48" icon={<Clock className="h-4.5 w-4.5" />} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Score trend</CardTitle>
            <CardDescription>Completed sessions with 5+ questions, oldest to newest.</CardDescription>
          </CardHeader>
          <CardContent><TrendChart points={trend} /></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Questions per day over the last 30 days · {o.streak}-day streak.</CardDescription>
          </CardHeader>
          <CardContent><ActivityChart days={o.days} /></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accuracy by specialty</CardTitle>
          <CardDescription>Sorted weakest first. Amber bar shows the peer average on the questions you attempted.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="pb-2 font-semibold">Specialty</th>
                <th className="pb-2 font-semibold">Exam weight</th>
                <th className="pb-2 font-semibold">Coverage</th>
                <th className="pb-2 font-semibold">Answered</th>
                <th className="pb-2 w-64 font-semibold">Accuracy vs peers</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className="py-3 font-medium">{s.name}</td>
                  <td className="py-3 text-muted">{s.blueprintCount} Q · {Math.round((s.blueprintCount / 200) * 100)}%</td>
                  <td className="py-3 text-muted">{s.seen}/{s.total} ({s.coverage}%)</td>
                  <td className="py-3 text-muted">{s.answered}</td>
                  <td className="py-3">
                    {s.accuracy === null ? (
                      <span className="text-xs text-muted">Not attempted</span>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs"><span className="font-semibold">{s.accuracy}%</span>{s.peerAccuracy !== null && <span className="text-muted">peers {s.peerAccuracy}%</span>}</div>
                        <Progress value={s.accuracy} tone={s.accuracy >= 70 ? "brand" : s.accuracy >= 55 ? "amber" : "red"} />
                        {s.peerAccuracy !== null && <Progress value={s.peerAccuracy} tone="amber" className="h-1 opacity-70" />}
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-right"><Link href={`/qbank?specialty=${s.id}`} className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-300">Practise</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accuracy by difficulty</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {o.byDifficulty.map((d) => (
            <div key={d.difficulty} className="rounded-xl border border-line p-4">
              <p className="text-sm font-semibold">{DIFFICULTY_LABEL[d.difficulty]}</p>
              <p className="mt-1 font-display text-2xl font-bold">{d.accuracy === null ? "—" : `${d.accuracy}%`}</p>
              <p className="text-xs text-muted">{d.answered} answered</p>
              <Progress className="mt-2" value={d.accuracy ?? 0} tone={(d.accuracy ?? 0) >= 70 ? "brand" : (d.accuracy ?? 0) >= 55 ? "amber" : "red"} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
