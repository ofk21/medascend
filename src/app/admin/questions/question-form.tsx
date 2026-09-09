"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, Checkbox, FieldHint, FormError, FormSuccess } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { AdminState } from "../actions";

export type QuestionFormData = {
  specialtyId: string;
  topic: string;
  stem: string;
  explanation: string;
  learningPoint: string;
  difficulty: number;
  tags: string;
  status: string;
  isTrial: boolean;
  reference: string;
  options: { text: string; explanation: string }[];
  correctIndex: number;
};

const LABELS = ["A", "B", "C", "D", "E"];

export function QuestionForm({ action, initial, specialties, submitLabel, showAndNew }: { action: (prev: AdminState, fd: FormData) => Promise<AdminState>; initial?: Partial<QuestionFormData>; specialties: { id: string; name: string }[]; submitLabel: string; showAndNew?: boolean }) {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(action, {});
  const [correct, setCorrect] = useState(initial?.correctIndex ?? 0);
  const options = initial?.options ?? Array.from({ length: 5 }, () => ({ text: "", explanation: "" }));

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold">Vignette</h2>
          <div className="mt-4">
            <Label htmlFor="stem">Question stem</Label>
            <Textarea id="stem" name="stem" required minLength={20} defaultValue={initial?.stem} className="min-h-40" placeholder="A 54-year-old man presents with… What is the most appropriate next step in management?" />
            <FieldHint>Write in the best-of-five style: clinical vignette, relevant results with reference ranges, then a single clear lead-in.</FieldHint>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Options</h2>
            <p className="text-xs text-muted">Select the radio next to the correct answer</p>
          </div>
          <input type="hidden" name="correctIndex" value={correct} />
          <div className="mt-4 space-y-3">
            {options.map((o, i) => (
              <div key={i} className={cn("rounded-xl border p-3 transition", correct === i ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30" : "border-line")}>
                <div className="flex items-start gap-3">
                  <label className="mt-2 flex cursor-pointer items-center gap-2">
                    <input type="radio" name="_correct" checked={correct === i} onChange={() => setCorrect(i)} className="accent-emerald-600" aria-label={`Option ${LABELS[i]} is correct`} />
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-bg-soft text-xs font-bold">{LABELS[i]}</span>
                  </label>
                  <div className="flex-1 space-y-2">
                    <Input name={`option_${i}`} required defaultValue={o.text} placeholder={`Option ${LABELS[i]}`} />
                    <Input name={`option_exp_${i}`} defaultValue={o.explanation} placeholder={correct === i ? "Why this is correct (one sentence)" : "Why this is wrong (one sentence)"} className="text-xs" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold">Explanation</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="explanation">Full explanation (Markdown supported)</Label>
              <Textarea id="explanation" name="explanation" required minLength={20} defaultValue={initial?.explanation} className="min-h-48" />
            </div>
            <div>
              <Label htmlFor="learningPoint">Learning point</Label>
              <Input id="learningPoint" name="learningPoint" defaultValue={initial?.learningPoint} placeholder="One crisp, high-yield sentence" />
            </div>
            <div>
              <Label htmlFor="reference">Reference (optional)</Label>
              <Input id="reference" name="reference" defaultValue={initial?.reference} placeholder="e.g. NICE NG136 (2019); BNF" />
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
        <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold">Classification</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="specialtyId">Specialty</Label>
              <Select id="specialtyId" name="specialtyId" required defaultValue={initial?.specialtyId ?? ""}>
                <option value="" disabled>Select…</option>
                {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" name="topic" defaultValue={initial?.topic} placeholder="e.g. Acute coronary syndrome" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select id="difficulty" name="difficulty" defaultValue={String(initial?.difficulty ?? 2)}>
                  <option value="1">Easy</option>
                  <option value="2">Moderate</option>
                  <option value="3">Hard</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" defaultValue={initial?.status ?? "PUBLISHED"}>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" defaultValue={initial?.tags} placeholder="comma, separated, keywords" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox name="isTrial" defaultChecked={initial?.isTrial} /> Available to free-trial users
            </label>
          </div>
        </section>

        <div className="space-y-3">
          <FormError message={state.error} />
          <FormSuccess message={state.success} />
          <Button type="submit" className="w-full" size="lg" loading={pending}>{submitLabel}</Button>
          {showAndNew && (
            <Button type="submit" name="andNew" value="1" variant="outline" className="w-full" loading={pending}>Save & add another</Button>
          )}
        </div>
      </div>
    </form>
  );
}
