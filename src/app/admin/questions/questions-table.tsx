"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Badge, difficultyTone, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bulkQuestionStatus, bulkQuestionTrial } from "../actions";
import { DIFFICULTY_LABEL } from "@/lib/constants";
import { formatDate, pct } from "@/lib/utils";

type Row = { id: string; stem: string; specialty: string; topic: string; difficulty: number; status: string; isTrial: boolean; timesAnswered: number; timesCorrect: number; updatedAt: string };

export function QuestionsTable({ items }: { items: Row[] }) {
  const [sel, setSel] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const all = items.length > 0 && sel.length === items.length;
  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); setSel([]); });

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      {sel.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-brand-50 px-4 py-2 text-sm dark:bg-brand-950/40">
          <span className="font-semibold">{sel.length} selected</span>
          <Button size="sm" variant="outline" loading={pending} onClick={() => run(() => bulkQuestionStatus(sel, "PUBLISHED"))}>Publish</Button>
          <Button size="sm" variant="outline" loading={pending} onClick={() => run(() => bulkQuestionStatus(sel, "DRAFT"))}>Set draft</Button>
          <Button size="sm" variant="outline" loading={pending} onClick={() => run(() => bulkQuestionStatus(sel, "ARCHIVED"))}>Archive</Button>
          <Button size="sm" variant="outline" loading={pending} onClick={() => run(() => bulkQuestionTrial(sel, true))}>Mark trial</Button>
          <Button size="sm" variant="outline" loading={pending} onClick={() => run(() => bulkQuestionTrial(sel, false))}>Unmark trial</Button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-bg-soft text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="w-10 px-4 py-3"><input type="checkbox" checked={all} onChange={(e) => setSel(e.target.checked ? items.map((i) => i.id) : [])} aria-label="Select all" className="accent-brand-600" /></th>
              <th className="px-3 py-3 font-semibold">Question</th>
              <th className="px-3 py-3 font-semibold">Specialty</th>
              <th className="px-3 py-3 font-semibold">Difficulty</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">Stats</th>
              <th className="px-3 py-3 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((r) => (
              <tr key={r.id} className="hover:bg-bg-soft/50">
                <td className="px-4 py-3"><input type="checkbox" checked={sel.includes(r.id)} onChange={(e) => setSel(e.target.checked ? [...sel, r.id] : sel.filter((x) => x !== r.id))} aria-label="Select" className="accent-brand-600" /></td>
                <td className="max-w-md px-3 py-3">
                  <Link href={`/admin/questions/${r.id}`} className="line-clamp-2 font-medium hover:text-brand-700 hover:underline">{r.stem}</Link>
                  <p className="mt-0.5 text-xs text-muted">{r.topic || "—"} {r.isTrial && <Badge tone="amber" className="ml-1">Trial</Badge>}</p>
                </td>
                <td className="px-3 py-3 text-muted">{r.specialty}</td>
                <td className="px-3 py-3"><Badge tone={difficultyTone(r.difficulty)}>{DIFFICULTY_LABEL[r.difficulty]}</Badge></td>
                <td className="px-3 py-3"><Badge tone={statusTone(r.status)}>{r.status.toLowerCase()}</Badge></td>
                <td className="px-3 py-3 text-xs text-muted">{r.timesAnswered ? `${pct(r.timesCorrect, r.timesAnswered)}% of ${r.timesAnswered}` : "—"}</td>
                <td className="px-3 py-3 text-xs text-muted">{formatDate(r.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
