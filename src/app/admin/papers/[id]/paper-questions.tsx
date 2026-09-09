"use client";

import { useState, useTransition } from "react";
import { Plus, X, Wand2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Badge, difficultyTone } from "@/components/ui/badge";
import { addQuestionsToPaper, removeQuestionFromPaper, autoFillPaper } from "../../actions";
import { DIFFICULTY_LABEL } from "@/lib/constants";

type Q = { id: string; stem: string; specialty: string; difficulty: number; order?: number };

export function PaperQuestions({ paperId, query, questions, candidates }: { paperId: string; query: string; specialties: { id: string; name: string }[]; questions: Q[]; candidates: Q[] }) {
  const [pending, start] = useTransition();
  const [sel, setSel] = useState<string[]>([]);
  const [fill, setFill] = useState(100);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-card p-5">
        <h3 className="font-display font-bold">Add questions</h3>
        <form className="mt-3 flex gap-2" action={`/admin/papers/${paperId}`}>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input name="q" defaultValue={query} placeholder="Search published questions by stem, topic, tag or specialty" className="pl-9" />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
        {candidates.length > 0 && (
          <div className="mt-3">
            <ul className="max-h-72 divide-y divide-line overflow-y-auto rounded-xl border border-line scroll-thin">
              {candidates.map((c) => (
                <li key={c.id} className="flex items-start gap-3 p-2.5 text-sm">
                  <input type="checkbox" className="mt-1 accent-brand-600" checked={sel.includes(c.id)} onChange={(e) => setSel(e.target.checked ? [...sel, c.id] : sel.filter((x) => x !== c.id))} aria-label="Select" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2">{c.stem}</p>
                    <p className="text-xs text-muted">{c.specialty} · {DIFFICULTY_LABEL[c.difficulty]}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center gap-2">
              <Button size="sm" disabled={!sel.length} loading={pending} onClick={() => start(async () => { const r = await addQuestionsToPaper(paperId, sel); setMsg(`Added ${r.added}.`); setSel([]); })}><Plus className="h-4 w-4" /> Add {sel.length || ""} selected</Button>
              <Button size="sm" variant="ghost" onClick={() => setSel(candidates.map((c) => c.id))}>Select all shown</Button>
            </div>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4 text-sm">
          <Wand2 className="h-4 w-4 text-brand-600" />
          <span>Auto-fill</span>
          <Input type="number" min={1} max={200} value={fill} onChange={(e) => setFill(Number(e.target.value))} className="w-20" />
          <span className="text-muted">questions weighted to the blueprint</span>
          <Button size="sm" variant="outline" loading={pending} onClick={() => start(async () => { const r = await autoFillPaper(paperId, fill); setMsg(`Added ${r.added} questions.`); })}>Fill</Button>
        </div>
        {msg && <p className="mt-2 text-xs text-brand-700">{msg}</p>}
      </div>

      <div className="rounded-2xl border border-line bg-card">
        <div className="border-b border-line px-5 py-3"><h3 className="font-display font-bold">Questions in this paper ({questions.length})</h3></div>
        {questions.length === 0 ? <p className="p-5 text-sm text-muted">Nothing added yet.</p> : (
          <ol className="max-h-[36rem] divide-y divide-line overflow-y-auto scroll-thin">
            {questions.map((q, i) => (
              <li key={q.id} className="flex items-start gap-3 p-3 text-sm">
                <span className="w-7 shrink-0 text-right font-display text-xs font-bold text-muted">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2">{q.stem}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-muted">{q.specialty} <Badge tone={difficultyTone(q.difficulty)}>{DIFFICULTY_LABEL[q.difficulty]}</Badge></p>
                </div>
                <button aria-label="Remove" disabled={pending} onClick={() => start(async () => { await removeQuestionFromPaper(paperId, q.id); })} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600"><X className="h-4 w-4" /></button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
