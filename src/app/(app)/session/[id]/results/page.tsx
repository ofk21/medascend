import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check, X, Minus, Clock, Target, Users, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Donut } from "@/components/app/charts";
import { Progress } from "@/components/ui/misc";
import { formatDuration, pct, formatDateTime } from "@/lib/utils";
import { ReviewList } from "./review-list";

export const metadata: Metadata = { title: "Session results" };

export default async function ResultsPage({ params }: PageProps<"/session/[id]/results">) {
  const { id } = await params;
  const user = await requireUser();
  const session = await db.session.findFirst({
    where: { id, userId: user.id },
    include: {
      questions: { orderBy: { order: "asc" }, include: { question: { include: { options: { orderBy: { order: "asc" } }, specialty: { select: { name: true } } } } } },
    },
  });
  if (!session) notFound();
  if (session.status === "IN_PROGRESS") redirect(`/session/${id}`);

  const flags = new Set((await db.flag.findMany({ where: { userId: user.id, questionId: { in: session.questions.map((q) => q.questionId) } }, select: { questionId: true } })).map((f) => f.questionId));

  const total = session.totalQuestions;
  const answered = session.questions.filter((q) => q.isCorrect !== null);
  const correct = answered.filter((q) => q.isCorrect).length;
  const incorrect = answered.length - correct;
  const skipped = total - answered.length;
  const score = pct(correct, total);
  const timeSpent = session.questions.reduce((a, q) => a + q.timeSpentSec, 0);
  const peerAnswered = session.questions.reduce((a, q) => a + q.question.timesAnswered, 0);
  const peerCorrect = session.questions.reduce((a, q) => a + q.question.timesCorrect, 0);
  const peerPct = peerAnswered ? pct(peerCorrect, peerAnswered) : null;

  const bySpecialty = Object.values(
    session.questions.reduce<Record<string, { name: string; total: number; correct: number }>>((acc, q) => {
      const k = q.question.specialty.name;
      acc[k] ??= { name: k, total: 0, correct: 0 };
      acc[k].total++;
      if (q.isCorrect) acc[k].correct++;
      return acc;
    }, {}),
  ).sort((a, b) => pct(a.correct, a.total) - pct(b.correct, b.total));

  const review = session.questions.map((sq) => ({
    order: sq.order,
    questionId: sq.questionId,
    specialty: sq.question.specialty.name,
    topic: sq.question.topic,
    difficulty: sq.question.difficulty,
    stem: sq.question.stem,
    explanation: sq.question.explanation,
    learningPoint: sq.question.learningPoint,
    options: sq.question.options.map((o) => ({ id: o.id, label: o.label, text: o.text, explanation: o.explanation, isCorrect: o.isCorrect })),
    selectedOptionId: sq.selectedOptionId,
    isCorrect: sq.isCorrect,
    timeSpentSec: sq.timeSpentSec,
    flagged: flags.has(sq.questionId),
    peer: { answered: sq.question.timesAnswered, correct: sq.question.timesCorrect },
  }));

  const passLine = 60;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">Results</p>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{session.title}</h1>
          <p className="mt-1 text-sm text-muted">{formatDateTime(session.startedAt)} · {session.mode === "TUTOR" ? "Tutor mode" : "Timed mode"}</p>
        </div>
        <div className="flex gap-2">
          <Button href="/qbank" variant="outline">New session</Button>
          <Button href="/dashboard">Dashboard <ArrowRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <Card className="flex items-center gap-6 p-6">
          <Donut value={score} size={140} label="Score" />
          <div>
            <p className="font-display text-xl font-bold">{score >= passLine ? "Above the pass line" : score >= passLine - 10 ? "Close to the pass line" : "Below the pass line"}</p>
            <p className="mt-1 text-sm text-muted">The real exam pass mark is roughly 60%.</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><Check className="h-3.5 w-3.5" /> {correct} correct</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300"><X className="h-3.5 w-3.5" /> {incorrect} incorrect</span>
              {skipped > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-bg-soft px-2.5 py-1 font-semibold text-muted"><Minus className="h-3.5 w-3.5" /> {skipped} unanswered</span>}
            </div>
          </div>
        </Card>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <p className="inline-flex items-center gap-1.5 text-sm text-muted"><Clock className="h-4 w-4" /> Time spent</p>
            <p className="mt-2 font-display text-2xl font-bold">{formatDuration(timeSpent)}</p>
            <p className="text-xs text-muted">{answered.length ? `${formatDuration(Math.round(timeSpent / answered.length))} per question` : "—"} · exam pace 1:48</p>
          </Card>
          <Card className="p-5">
            <p className="inline-flex items-center gap-1.5 text-sm text-muted"><Users className="h-4 w-4" /> Peer average</p>
            <p className="mt-2 font-display text-2xl font-bold">{peerPct !== null ? `${peerPct}%` : "—"}</p>
            <p className="text-xs text-muted">{peerPct !== null ? (score >= peerPct ? `You scored ${score - peerPct} points above peers` : `${peerPct - score} points below peers on these questions`) : "No peer data yet"}</p>
          </Card>
          <Card className="p-5">
            <p className="inline-flex items-center gap-1.5 text-sm text-muted"><Target className="h-4 w-4" /> Accuracy (answered)</p>
            <p className="mt-2 font-display text-2xl font-bold">{pct(correct, answered.length)}%</p>
            <p className="text-xs text-muted">Excluding unanswered questions</p>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Breakdown by specialty</CardTitle>
          <CardDescription>Weakest first. Tap a specialty to practise it.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {bySpecialty.map((s) => {
            const p = pct(s.correct, s.total);
            return (
              <Link key={s.name} href={`/qbank?familiarity=incorrect,unseen`} className="block">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted">{s.correct}/{s.total} · {p}%</span>
                </div>
                <Progress value={p} tone={p >= 70 ? "brand" : p >= 55 ? "amber" : "red"} />
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <ReviewList items={review} />
    </div>
  );
}
