"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label, Textarea, Select, FormError, FormSuccess } from "@/components/ui/form";
import { importQuestions } from "../../actions";

const example = `[
  {
    "specialty": "Cardiology",
    "topic": "Acute coronary syndrome",
    "difficulty": 2,
    "stem": "A 58-year-old man presents with 40 minutes of central chest pain... What is the most appropriate immediate management?",
    "options": ["Aspirin 300 mg and primary PCI", "Fibrinolysis", "Intravenous heparin alone", "Oral beta-blocker", "Urgent CT coronary angiography"],
    "correctIndex": 0,
    "explanation": "ST-elevation with symptom onset under 12 hours requires primary PCI within 120 minutes...",
    "optionExplanations": ["Correct – ...", "Only if PCI cannot be delivered within 120 minutes", "...", "...", "..."],
    "learningPoint": "STEMI within 12 hours: primary PCI if achievable within 120 minutes of the time fibrinolysis could have been given.",
    "tags": ["stemi", "pci"],
    "isTrial": false
  }
]`;

export function ImportForm({ specialties }: { specialties: string[] }) {
  const [state, action, pending] = useActionState(importQuestions, {});
  const [json, setJson] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setJson(await f.text());
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <form action={action} className="space-y-4 rounded-2xl border border-line bg-card p-5 sm:p-6">
        <div>
          <Label htmlFor="file">Upload a .json file</Label>
          <input id="file" type="file" accept="application/json,.json" onChange={onFile} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700" />
        </div>
        <div>
          <Label htmlFor="json">…or paste JSON</Label>
          <Textarea id="json" name="json" value={json} onChange={(e) => setJson(e.target.value)} className="min-h-72 font-mono text-xs" placeholder={example} required />
        </div>
        <div className="grid gap-3 sm:grid-cols-[200px_1fr] sm:items-end">
          <div>
            <Label htmlFor="status">Default status</Label>
            <Select id="status" name="status" defaultValue="PUBLISHED">
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft (review first)</option>
            </Select>
          </div>
          <Button type="submit" loading={pending} disabled={!json.trim()}>Import questions</Button>
        </div>
        <FormError message={state.error} />
        <FormSuccess message={state.success} />
        {state.skipped && state.skipped.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <p className="font-semibold">Skipped items</p>
            <ul className="mt-1 list-disc pl-4">{state.skipped.slice(0, 30).map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
        )}
      </form>
      <aside className="space-y-4">
        <div className="rounded-2xl border border-line bg-card p-5 text-sm">
          <h3 className="font-display font-bold">Format</h3>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-muted">
            <li><code>specialty</code> – must match one of the names on the right (case-insensitive).</li>
            <li><code>options</code> – exactly 5 strings; <code>correctIndex</code> is 0-based.</li>
            <li><code>optionExplanations</code> – optional, 5 strings in the same order.</li>
            <li><code>difficulty</code> – 1 easy, 2 moderate, 3 hard (default 2).</li>
            <li><code>tags</code> – array or comma-separated string.</li>
            <li><code>status</code>, <code>isTrial</code>, <code>reference</code> – optional.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5 text-sm">
          <h3 className="font-display font-bold">Specialty names</h3>
          <ul className="mt-2 grid gap-1 text-xs text-muted">{specialties.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
        <details className="rounded-2xl border border-line bg-card p-5 text-sm">
          <summary className="cursor-pointer font-display font-bold">Example JSON</summary>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-bg-soft p-3 text-[11px]">{example}</pre>
        </details>
      </aside>
    </div>
  );
}
