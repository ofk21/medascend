"use client";

import { useState } from "react";
import { Flag, ChevronDown, Lightbulb } from "lucide-react";
import { Badge, difficultyTone } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";
import { DIFFICULTY_LABEL } from "@/lib/constants";

export type ListQuestion = {
  id: string;
  stem: string;
  specialty: string;
  topic: string;
  difficulty: number;
  explanation: string;
  learningPoint: string;
  options: { label: string; text: string; isCorrect: boolean; explanation: string }[];
  flagged?: boolean;
  lastCorrect?: boolean | null;
};

export function QuestionList({ items, showFlag }: { items: ListQuestion[]; showFlag?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const [flags, setFlags] = useState<Record<string, boolean>>(Object.fromEntries(items.map((i) => [i.id, !!i.flagged])));

  async function toggleFlag(id: string) {
    const next = !flags[id];
    setFlags((f) => ({ ...f, [id]: next }));
    await fetch("/api/flags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: id, flagged: next }) });
  }

  return (
    <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
      {items.map((q) => {
        const isOpen = open === q.id;
        return (
          <li key={q.id} className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <button className="min-w-0 flex-1 text-left" onClick={() => setOpen(isOpen ? null : q.id)} aria-expanded={isOpen}>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="font-semibold text-fg">{q.specialty}</span>
                  {q.topic && <span>· {q.topic}</span>}
                  <Badge tone={difficultyTone(q.difficulty)}>{DIFFICULTY_LABEL[q.difficulty]}</Badge>
                  {q.lastCorrect === true && <Badge tone="green">Last: correct</Badge>}
                  {q.lastCorrect === false && <Badge tone="red">Last: incorrect</Badge>}
                </div>
                <p className={cn("mt-1.5 text-sm leading-relaxed", !isOpen && "line-clamp-2")}>{q.stem}</p>
              </button>
              {showFlag && (
                <button onClick={() => toggleFlag(q.id)} aria-label={flags[q.id] ? "Unflag" : "Flag"} className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", flags[q.id] ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200" : "text-muted hover:bg-bg-soft")}>
                  <Flag className={cn("h-4 w-4", flags[q.id] && "fill-current")} />
                </button>
              )}
              <button onClick={() => setOpen(isOpen ? null : q.id)} aria-label="Toggle" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-bg-soft">
                <ChevronDown className={cn("h-4 w-4 transition", isOpen && "rotate-180")} />
              </button>
            </div>
            {isOpen && (
              <div className="mt-4 space-y-3">
                <ul className="space-y-1.5">
                  {q.options.map((o) => (
                    <li key={o.label} className={cn("rounded-lg border px-3 py-2 text-sm", o.isCorrect ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" : "border-line")}>
                      <span className="font-bold">{o.label}.</span> {o.text}
                      {o.explanation && <span className="mt-0.5 block text-xs text-muted">{o.explanation}</span>}
                    </li>
                  ))}
                </ul>
                <div className="rounded-xl bg-bg-soft/70 p-4"><Markdown content={q.explanation} small /></div>
                {q.learningPoint && <p className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700/40 dark:bg-amber-500/10 dark:text-amber-100"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0" /> <span><strong>Learning point:</strong> {q.learningPoint}</span></p>}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
