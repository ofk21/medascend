"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, Checkbox, FormError, FieldHint } from "@/components/ui/form";
import { Markdown } from "@/components/ui/markdown";
import { saveTopic, type AdminState } from "../actions";
import { cn } from "@/lib/utils";

export type TopicInitial = { id: string; specialtyId: string; title: string; slug: string; summary: string; content: string; readingMinutes: number; published: boolean; sortOrder: number };

export function TopicForm({ initial, specialties }: { initial?: TopicInitial; specialties: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveTopic, {});
  const [content, setContent] = useState(initial?.content ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <Label className="mb-0">Content (Markdown)</Label>
          <div className="flex rounded-lg border border-line p-0.5 text-xs font-semibold">
            {(["write", "preview"] as const).map((t) => <button key={t} type="button" onClick={() => setTab(t)} className={cn("rounded-md px-3 py-1 capitalize", tab === t ? "bg-brand-600 text-white" : "text-muted hover:bg-bg-soft")}>{t}</button>)}
          </div>
        </div>
        {tab === "write" ? (
          <Textarea name="content" required value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[36rem] font-mono text-[13px]" placeholder={"## Overview\n\n...\n\n## Key points\n- ..."} />
        ) : (
          <>
            <input type="hidden" name="content" value={content} />
            <div className="min-h-[36rem] rounded-xl border border-line p-5"><Markdown content={content || "_Nothing to preview yet._"} /></div>
          </>
        )}
        <FieldHint>Use ## for sections, bullet lists, tables and a final **Key points** section. Word count: {content.trim() ? content.trim().split(/\s+/).length : 0}</FieldHint>
      </div>
      <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
        <div className="space-y-4 rounded-2xl border border-line bg-card p-5 sm:p-6">
          <div><Label htmlFor="title">Title</Label><Input id="title" name="title" required defaultValue={initial?.title} /></div>
          <div><Label htmlFor="slug">Slug</Label><Input id="slug" name="slug" defaultValue={initial?.slug} placeholder="auto-generated from title" /></div>
          <div><Label htmlFor="specialtyId">Specialty</Label><Select id="specialtyId" name="specialtyId" required defaultValue={initial?.specialtyId ?? ""}><option value="" disabled>Select…</option>{specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></div>
          <div><Label htmlFor="summary">Summary</Label><Textarea id="summary" name="summary" defaultValue={initial?.summary} className="min-h-20" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="readingMinutes">Reading time (min)</Label><Input id="readingMinutes" name="readingMinutes" type="number" min={1} defaultValue={initial?.readingMinutes ?? 6} /></div>
            <div><Label htmlFor="sortOrder">Sort order</Label><Input id="sortOrder" name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><Checkbox name="published" defaultChecked={initial?.published ?? true} /> Published</label>
        </div>
        <FormError message={state.error} />
        <Button type="submit" className="w-full" size="lg" loading={pending}>{initial ? "Save topic" : "Create topic"}</Button>
      </div>
    </form>
  );
}
