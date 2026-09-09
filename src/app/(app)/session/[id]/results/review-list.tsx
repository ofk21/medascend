"use client";

import { useState } from "react";
import { Check, X, Minus, Flag, Lightbulb, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, difficultyTone } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import { cn, formatDuration, pct } from "@/lib/utils";
import { DIFFICULTY_LABEL } from "@/lib/constants";

export type ReviewItem = {
  order: number;
  questionId: string;
  specialty: string;
  topic: string;
  difficulty: number;
  stem: string;
  explanation: string;
  learningPoint: string;
  options: { id: string; label: string; text: string; explanation: string; isCorrect: boolean }[];
  selectedOptionId: string | null;
  isCorrect: boolean | null;
  timeSpentSec: number;
  flagged: boolean;
  peer: { answered: number; correct: number };
};

type Filter = "all" | "incorrect" | "correct" | "unanswered" | "flagged";

export function ReviewList({ items }: { items: ReviewItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(null);
  const filtered = items.filter((i) => {
    if (filter === "incorrect") return i.isCorrect === false;
    if (filter === "correct") return i.isCorrect === true;
    if (filter === "unanswered") return i.isCorrect === null;
    if (filter === "flagged") return i.flagged;
    return true;
  });
  const counts = {
    all: items.length,
    incorrect: items.filter((i) => i.isCorrect === false).length,
    correct: items.filter((i) => i.isCorrect === true).length,
    unanswered: items.filter((i) => i.isCorrect === null).length,
    flagged: items.filter((i) => i.flagged).length,
  };

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Review questions</CardTitle>
          <CardDescription>Open any question to see the full explanation.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "incorrect", "correct", "unanswered", "flagged"] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize", filter === f ? "border-brand-600 bg-brand-600 text-white" : "border-line hover:bg-bg-soft")}>
              {f} <span className="opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-line">
          {filtered.map((it) => {
            const isOpen = open === it.order;
            return (
              <li key={it.order} className="py-3">
                <button onClick={() => setOpen(isOpen ? null : it.order)} className="flex w-full items-start gap-3 text-left" aria-expanded={isOpen}>
                  <span className={cn("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold text-white", it.isCorrect === true ? "bg-emerald-600" : it.isCorrect === false ? "bg-red-500" : "bg-ink-300")}>
                    {it.isCorrect === true ? <Check className="h-4 w-4" /> : it.isCorrect === false ? <X className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="font-semibold text-fg">Q{it.order + 1}</span>
                      <span>{it.specialty}</span>
                      <Badge tone={difficultyTone(it.difficulty)}>{DIFFICULTY_LABEL[it.difficulty]}</Badge>
                      {it.flagged && <Flag className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />}
                      <span>· {formatDuration(it.timeSpentSec)}</span>
                      {it.peer.answered > 0 && <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {pct(it.peer.correct, it.peer.answered)}%</span>}
                    </span>
                    <span className={cn("mt-1 block text-sm", !isOpen && "line-clamp-2")}>{it.stem}</span>
                  </span>
                </button>
                {isOpen && (
                  <div className="ml-10 mt-3 space-y-3">
                    <ul className="space-y-1.5">
                      {it.options.map((o) => {
                        const sel = o.id === it.selectedOptionId;
                        return (
                          <li key={o.id} className={cn("rounded-lg border px-3 py-2 text-sm", o.isCorrect ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" : sel ? "border-red-400 bg-red-50 dark:bg-red-950/40" : "border-line")}>
                            <div className="flex items-start gap-2">
                              <span className="font-bold">{o.label}.</span>
                              <span className="flex-1">
                                {o.text}
                                {sel && <span className="ml-2 text-xs font-semibold text-muted">(your answer)</span>}
                                {o.explanation && <span className="mt-0.5 block text-xs text-muted">{o.explanation}</span>}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="rounded-xl bg-bg-soft/70 p-4">
                      <Markdown content={it.explanation} small />
                    </div>
                    {it.learningPoint && (
                      <p className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700/40 dark:bg-amber-500/10 dark:text-amber-100"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0" /> <span><strong>Learning point:</strong> {it.learningPoint}</span></p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
          {filtered.length === 0 && <li className="py-8 text-center text-sm text-muted">Nothing to show for this filter.</li>}
        </ul>
      </CardContent>
    </Card>
  );
}
