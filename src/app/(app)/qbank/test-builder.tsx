"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Timer, GraduationCap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Label, FormError } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { createPracticeSession } from "./actions";

type SpecialtyCount = { id: string; name: string; total: number; unseen: number; incorrect: number; correct: number; flagged: number };

const FAMILIARITY = [
  { key: "unseen", label: "Unseen", hint: "Never answered" },
  { key: "incorrect", label: "Incorrect", hint: "Last answer wrong" },
  { key: "correct", label: "Correct", hint: "Last answer right" },
  { key: "flagged", label: "Flagged", hint: "Marked for review" },
] as const;

export function TestBuilder({ specialties, initialSpecialties, initialFamiliarity, hasFullAccess, trialLeft }: { specialties: SpecialtyCount[]; initialSpecialties: string[]; initialFamiliarity: string[]; hasFullAccess: boolean; trialLeft: number | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(initialSpecialties.filter((id) => specialties.some((s) => s.id === id)));
  const [difficulties, setDifficulties] = useState<number[]>([1, 2, 3]);
  const [familiarity, setFamiliarity] = useState<string[]>(initialFamiliarity.length ? initialFamiliarity : ["unseen", "incorrect", "correct", "flagged"]);
  const [count, setCount] = useState(20);
  const [mode, setMode] = useState<"TUTOR" | "TIMED">("TUTOR");
  const [keyword, setKeyword] = useState("");
  const [customTime, setCustomTime] = useState(false);
  const [timeLimit, setTimeLimit] = useState(36);

  const pool = useMemo(() => {
    const rows = selected.length ? specialties.filter((s) => selected.includes(s.id)) : specialties;
    const all = familiarity.length === 4 || familiarity.length === 0;
    return rows.reduce((acc, s) => {
      if (all) return acc + s.total;
      let n = 0;
      if (familiarity.includes("unseen")) n += s.unseen;
      if (familiarity.includes("incorrect")) n += s.incorrect;
      if (familiarity.includes("correct")) n += s.correct;
      if (familiarity.includes("flagged")) n += s.flagged; // may overlap; indicative only
      return acc + n;
    }, 0);
  }, [selected, specialties, familiarity]);

  const maxCount = Math.min(100, trialLeft ?? 100);
  const effectiveCount = Math.max(1, Math.min(count, maxCount));

  function toggle<T>(arr: T[], v: T, set: (x: T[]) => void) {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  }

  function submit() {
    setError(null);
    start(async () => {
      const res = await createPracticeSession({
        specialtyIds: selected,
        difficulties,
        familiarity: familiarity as ("unseen" | "incorrect" | "correct" | "flagged")[],
        keyword,
        count: effectiveCount,
        mode,
        timeLimitMin: mode === "TIMED" && customTime ? timeLimit : undefined,
      });
      if ("error" in res) setError(res.error);
      else router.push(`/session/${res.sessionId}`);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Specialties</CardTitle>
              <CardDescription>Leave all unselected to include every specialty.</CardDescription>
            </div>
            <div className="flex gap-2 text-xs">
              <button className="font-semibold text-brand-700 hover:underline dark:text-brand-300" onClick={() => setSelected(specialties.map((s) => s.id))}>Select all</button>
              <span className="text-muted">·</span>
              <button className="font-semibold text-brand-700 hover:underline dark:text-brand-300" onClick={() => setSelected([])}>Clear</button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {specialties.map((s) => {
              const on = selected.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(selected, s.id, setSelected)}
                  aria-pressed={on}
                  className={cn("flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition", on ? "border-brand-600 bg-brand-50 text-brand-900 dark:bg-brand-950/50 dark:text-brand-100" : "border-line hover:bg-bg-soft")}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={cn("grid h-4.5 w-4.5 place-items-center rounded-md border text-[10px] text-white", on ? "border-brand-600 bg-brand-600" : "border-ink-300")}>{on && "✓"}</span>
                    <span className="font-medium">{s.name}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {s.total}
                    {s.incorrect > 0 && <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300">{s.incorrect} ✕</span>}
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Familiarity</CardTitle>
              <CardDescription>Which questions to include.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {FAMILIARITY.map((f) => {
                const on = familiarity.includes(f.key);
                return (
                  <button key={f.key} type="button" aria-pressed={on} onClick={() => toggle(familiarity, f.key, setFamiliarity)} className={cn("flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition", on ? "border-brand-600 bg-brand-50 dark:bg-brand-950/50" : "border-line hover:bg-bg-soft")}>
                    <span>
                      <span className="font-medium">{f.label}</span>
                      <span className="ml-2 text-xs text-muted">{f.hint}</span>
                    </span>
                    <span className={cn("grid h-4.5 w-4.5 place-items-center rounded-md border text-[10px] text-white", on ? "border-brand-600 bg-brand-600" : "border-ink-300")}>{on && "✓"}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Difficulty</CardTitle>
              <CardDescription>Mix levels to mirror the real exam.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { d: 1, l: "Easy", c: "text-emerald-700" },
                { d: 2, l: "Moderate", c: "text-amber-700" },
                { d: 3, l: "Hard", c: "text-red-700" },
              ].map((x) => {
                const on = difficulties.includes(x.d);
                return (
                  <button key={x.d} type="button" aria-pressed={on} onClick={() => toggle(difficulties, x.d, setDifficulties)} className={cn("flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition", on ? "border-brand-600 bg-brand-50 dark:bg-brand-950/50" : "border-line hover:bg-bg-soft")}>
                    <span className={cn("font-medium", x.c)}>{x.l}</span>
                    <span className={cn("grid h-4.5 w-4.5 place-items-center rounded-md border text-[10px] text-white", on ? "border-brand-600 bg-brand-600" : "border-ink-300")}>{on && "✓"}</span>
                  </button>
                );
              })}
              <div className="pt-2">
                <Label htmlFor="keyword">Keyword (optional)</Label>
                <Input id="keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. hyponatraemia, warfarin" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle>Mode</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { m: "TUTOR" as const, icon: GraduationCap, l: "Tutor", d: "Answer & explanation after each question" },
              { m: "TIMED" as const, icon: Timer, l: "Timed", d: "Exam conditions; results at the end" },
            ].map((x) => (
              <button key={x.m} type="button" aria-pressed={mode === x.m} onClick={() => setMode(x.m)} className={cn("rounded-xl border p-3 text-left transition", mode === x.m ? "border-brand-600 bg-brand-50 dark:bg-brand-950/50" : "border-line hover:bg-bg-soft")}>
                <x.icon className={cn("h-5 w-5", mode === x.m ? "text-brand-700 dark:text-brand-300" : "text-muted")} />
                <p className="mt-2 text-sm font-semibold">{x.l}</p>
                <p className="mt-0.5 text-xs text-muted">{x.d}</p>
              </button>
            ))}
            {mode === "TIMED" && (
              <div className="col-span-2 rounded-xl border border-line p-3 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={customTime} onChange={(e) => setCustomTime(e.target.checked)} className="accent-brand-600" />
                  Custom time limit
                </label>
                {customTime ? (
                  <div className="mt-2 flex items-center gap-2">
                    <Input type="number" min={1} max={240} value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} className="w-24" /> <span className="text-muted">minutes</span>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-muted">Default: 1.8 min per question ({Math.round((effectiveCount * 108) / 60)} min) – the real exam pace.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Number of questions</CardTitle>
            <CardDescription>
              Approximately <strong className="text-fg">{pool}</strong> questions match your filters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <input type="range" min={1} max={maxCount} value={effectiveCount} onChange={(e) => setCount(Number(e.target.value))} className="flex-1 accent-brand-600" aria-label="Number of questions" />
              <Input type="number" min={1} max={maxCount} value={effectiveCount} onChange={(e) => setCount(Number(e.target.value))} className="w-20 text-center" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[10, 20, 40, 60, 100].filter((n) => n <= maxCount).map((n) => (
                <button key={n} type="button" onClick={() => setCount(n)} className={cn("rounded-lg border px-3 py-1 text-xs font-semibold", effectiveCount === n ? "border-brand-600 bg-brand-600 text-white" : "border-line hover:bg-bg-soft")}>{n}</button>
              ))}
            </div>
            {!hasFullAccess && trialLeft !== null && (
              <p className="mt-3 inline-flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-200"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Trial: {trialLeft} questions remaining. Upgrade for the full bank.</p>
            )}
            <div className="mt-5 space-y-3">
              <FormError message={error} />
              <Button className="w-full" size="lg" onClick={submit} loading={pending} disabled={pool === 0 || maxCount === 0}>
                Start {mode === "TUTOR" ? "tutor" : "timed"} session · {effectiveCount} Q
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
