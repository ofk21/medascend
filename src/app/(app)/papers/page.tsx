import type { Metadata } from "next";
import { FileText, Timer, Lock } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser, getAccess } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_QUESTIONS, MOCK_DURATION_MIN, SPECIALTIES } from "@/lib/constants";
import { pct } from "@/lib/utils";
import { StartPaperButton, StartMockButton } from "./start-buttons";

export const metadata: Metadata = { title: "Past papers & mock exams" };

export default async function PapersPage() {
  const user = await requireUser();
  const access = getAccess(user);
  const [papers, attempts] = await Promise.all([
    db.paper.findMany({ where: { published: true }, orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }], include: { _count: { select: { questions: true } } } }),
    db.session.findMany({ where: { userId: user.id, type: { in: ["PAPER", "MOCK"] }, status: "COMPLETED" }, orderBy: { completedAt: "desc" }, select: { id: true, paperId: true, correctCount: true, totalQuestions: true, title: true, completedAt: true } }),
  ]);
  const bestByPaper = new Map<string, { score: number; id: string }>();
  for (const a of attempts) {
    if (!a.paperId) continue;
    const s = pct(a.correctCount, a.totalQuestions);
    const cur = bestByPaper.get(a.paperId);
    if (!cur || s > cur.score) bestByPaper.set(a.paperId, { score: s, id: a.id });
  }
  const mockAttempts = attempts.filter((a) => !a.paperId);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Exam practice" title="Past papers & mock exams" description="Sit full papers under timed conditions. Feedback is revealed at the end, exactly like the real exam." />

      {!access.hasFullAccess && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-amber-700/40 dark:bg-amber-500/10">
          <div className="flex items-start gap-3 text-sm">
            <Lock className="mt-0.5 h-5 w-5 text-amber-700" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">Past papers and mocks are part of paid plans</p>
              <p className="text-amber-800/80 dark:text-amber-100/80">Upgrade to sit unlimited blueprint-matched mocks and every bespoke past paper.</p>
            </div>
          </div>
          <Button href="/pricing" variant="amber" size="sm">View plans</Button>
        </div>
      )}

      <section>
        <h2 className="mb-3 font-display text-xl font-bold">Blueprint mock exam</h2>
        <Card className="overflow-hidden">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white"><Timer className="h-6 w-6" /></span>
                <div>
                  <h3 className="font-display text-lg font-bold">Generate a fresh mock</h3>
                  <p className="text-sm text-muted">{MOCK_QUESTIONS} questions · {MOCK_DURATION_MIN} minutes · weighted to the MRCP(UK) blueprint</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Every mock draws a new random set of questions in the same specialty proportions as the real paper, so you can sit as many as you like. Your score against the 60% pass line is the best single indicator of readiness.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <StartMockButton disabled={!access.hasFullAccess} />
                {mockAttempts.length > 0 && <p className="text-sm text-muted">Best mock score: <strong className="text-fg">{Math.max(...mockAttempts.map((a) => pct(a.correctCount, a.totalQuestions)))}%</strong> · {mockAttempts.length} sat</p>}
              </div>
            </div>
            <div className="rounded-xl border border-line bg-bg-soft/60 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Mock composition</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {SPECIALTIES.slice().sort((a, b) => b.blueprintCount - a.blueprintCount).map((s) => (
                  <li key={s.slug} className="flex justify-between gap-2"><span className="truncate text-muted">{s.name}</span><span className="font-semibold">{Math.round(s.blueprintCount / 2)}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-bold">Bespoke past papers</h2>
        {papers.length === 0 ? (
          <EmptyState icon={<FileText className="h-5 w-5" />} title="No past papers published yet" description="Papers appear here as soon as the editorial team publishes them." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {papers.map((p) => {
              const best = bestByPaper.get(p.id);
              return (
                <Card key={p.id}>
                  <CardContent className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">{p.type === "MOCK" ? "Fixed mock" : "Past paper"}</p>
                        <h3 className="mt-1 font-display text-lg font-bold">{p.title}</h3>
                      </div>
                      {best && <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800 dark:bg-brand-950/60 dark:text-brand-200">Best {best.score}%</span>}
                    </div>
                    {p.description && <p className="mt-2 text-sm text-muted">{p.description}</p>}
                    <p className="mt-3 text-xs text-muted">{p._count.questions} questions · {p.durationMinutes} minutes</p>
                    <div className="mt-4 flex items-center gap-2">
                      <StartPaperButton paperId={p.id} disabled={!access.hasFullAccess} />
                      {best && <Button href={`/session/${best.id}/results`} variant="ghost" size="sm">Review best</Button>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
