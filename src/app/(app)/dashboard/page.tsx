import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Flame, Target, CheckCircle2, Clock, PlayCircle, Sparkles, FileText, BookOpen } from "lucide-react";
import { requireUser, getAccess } from "@/lib/auth";
import { getUserOverview } from "@/lib/analytics";
import { trialQuestionsRemaining } from "@/lib/sessions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Stat, Progress, EmptyState } from "@/components/ui/misc";
import { Badge, statusTone } from "@/components/ui/badge";
import { formatDateTime, formatDuration, pct, daysBetween } from "@/lib/utils";
import { ActivityChart } from "@/components/app/charts";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const sp = await searchParams;
  const user = await requireUser();
  const access = getAccess(user);
  const [o, trialLeft] = await Promise.all([getUserOverview(user.id), trialQuestionsRemaining(user)]);
  const inProgress = o.sessions.filter((s) => s.status === "IN_PROGRESS");
  const weakest = o.bySpecialty.filter((s) => s.accuracy !== null && s.answered >= 3).sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0)).slice(0, 3);
  const daysToExam = user.examDate ? daysBetween(new Date(), user.examDate) : null;
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-6">
      {sp.welcome && (
        <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-100">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Welcome to MedAscend, {firstName}! Your 48-hour trial has started.</p>
            <p className="mt-0.5">Explore the textbook, then build your first practice session – the trial includes 100 questions. Set your exam date in <Link href="/account" className="underline">Account</Link> to get a countdown.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {firstName}</h1>
        </div>
        <div className="flex gap-2">
          <Button href="/qbank">
            <PlayCircle className="h-4 w-4" /> New practice session
          </Button>
          <Button href="/papers" variant="outline">
            Sit a mock
          </Button>
        </div>
      </div>

      {!access.hasFullAccess && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-700/40 dark:bg-amber-500/10">
          <div className="text-sm">
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              {access.trialActive ? `Free trial · ${trialLeft} of 100 trial questions remaining` : "Your free trial has ended"}
            </p>
            <p className="text-amber-800/80 dark:text-amber-100/80">{access.trialActive ? "Upgrade any time to unlock the full bank, past papers, mocks and the AI tutor." : "Upgrade to continue practising – your progress is saved."}</p>
          </div>
          <Button href="/pricing" variant="amber" size="sm">
            View plans <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Readiness score" value={<span className={o.readiness >= 70 ? "text-brand-700 dark:text-brand-300" : o.readiness >= 55 ? "text-amber-600" : ""}>{o.readiness}<span className="text-base text-muted">/100</span></span>} hint={o.answered < 20 ? "Answer 20+ questions to unlock a reliable score" : o.readiness >= 70 ? "On track for a pass" : "Keep going – focus on weak specialties"} icon={<Target className="h-4.5 w-4.5" />} />
        <Stat label="Overall accuracy" value={`${o.accuracy}%`} hint={o.peerAccuracy !== null ? `Peers: ${o.peerAccuracy}% on the same questions` : `${o.correct} of ${o.answered} correct`} icon={<CheckCircle2 className="h-4.5 w-4.5" />} />
        <Stat label="Questions answered" value={o.answered.toLocaleString()} hint={`${o.uniqueSeen} unique · ${pct(o.uniqueSeen, o.totalQuestions)}% of the bank`} icon={<Clock className="h-4.5 w-4.5" />} />
        <Stat label="Day streak" value={o.streak} hint={daysToExam !== null ? `${daysToExam > 0 ? `${daysToExam} days to your exam` : "Exam day is here – good luck!"}` : "Set an exam date in Account"} icon={<Flame className="h-4.5 w-4.5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Last 30 days</CardTitle>
              <CardDescription>Questions answered per day. Consistency beats cramming.</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityChart days={o.days} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Recent sessions</CardTitle>
                <CardDescription>Resume unfinished sessions or review results.</CardDescription>
              </div>
              <Link href="/history" className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">View all</Link>
            </CardHeader>
            <CardContent>
              {o.sessions.length === 0 ? (
                <EmptyState title="No sessions yet" description="Build your first practice session to start tracking progress." action={<Button href="/qbank">Create a session</Button>} />
              ) : (
                <ul className="divide-y divide-line">
                  {o.sessions.slice(0, 6).map((s) => (
                    <li key={s.id} className="flex items-center gap-4 py-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-bg-soft text-muted">{s.type === "PRACTICE" ? <PlayCircle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{s.title}</p>
                        <p className="text-xs text-muted">{formatDateTime(s.startedAt)} · {s.mode === "TUTOR" ? "Tutor" : "Timed"}{s.timeLimitSec ? ` · ${formatDuration(s.timeLimitSec)}` : ""}</p>
                      </div>
                      {s.status === "COMPLETED" ? (
                        <span className="font-display text-sm font-bold">{pct(s.correctCount, s.totalQuestions)}%</span>
                      ) : (
                        <Badge tone={statusTone(s.status)}>{s.status === "IN_PROGRESS" ? "In progress" : s.status.toLowerCase()}</Badge>
                      )}
                      <Link href={s.status === "COMPLETED" ? `/session/${s.id}/results` : `/session/${s.id}`} className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
                        {s.status === "COMPLETED" ? "Review" : "Resume"}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {inProgress.length > 0 && (
            <Card className="border-brand-200 dark:border-brand-800">
              <CardHeader>
                <CardTitle>Pick up where you left off</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {inProgress.slice(0, 2).map((s) => (
                  <Link key={s.id} href={`/session/${s.id}`} className="flex items-center justify-between rounded-xl border border-line p-3 text-sm hover:bg-bg-soft">
                    <div>
                      <p className="font-semibold">{s.title}</p>
                      <p className="text-xs text-muted">{s.answeredCount}/{s.totalQuestions} answered</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Weakest specialties</CardTitle>
              <CardDescription>Based on your accuracy so far. Tap to practise.</CardDescription>
            </CardHeader>
            <CardContent>
              {weakest.length === 0 ? (
                <p className="text-sm text-muted">Answer a few more questions and your weak areas will appear here.</p>
              ) : (
                <ul className="space-y-3">
                  {weakest.map((s) => (
                    <li key={s.id}>
                      <Link href={`/qbank?specialty=${s.id}&familiarity=incorrect,unseen`} className="block rounded-xl p-2 -m-2 hover:bg-bg-soft">
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium">{s.name}</span>
                          <span className="text-muted">{s.accuracy}%{s.peerAccuracy !== null && <span className="text-xs"> · peers {s.peerAccuracy}%</span>}</span>
                        </div>
                        <Progress value={s.accuracy ?? 0} tone={(s.accuracy ?? 0) >= 70 ? "brand" : (s.accuracy ?? 0) >= 55 ? "amber" : "red"} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/analytics" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
                Full analytics <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick links</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
              {[
                { href: "/qbank?familiarity=incorrect", label: "Retry incorrect", icon: <Target className="h-4 w-4" /> },
                { href: "/flagged", label: `Flagged (${o.flags})`, icon: <Flame className="h-4 w-4" /> },
                { href: "/textbook", label: "Textbook", icon: <BookOpen className="h-4 w-4" /> },
                { href: "/notes", label: `Notes (${o.notes})`, icon: <FileText className="h-4 w-4" /> },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="flex items-center gap-2 rounded-xl border border-line p-3 font-medium hover:bg-bg-soft">
                  <span className="text-brand-600">{l.icon}</span>
                  {l.label}
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
