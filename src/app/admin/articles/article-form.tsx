"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Checkbox, FormError } from "@/components/ui/form";
import { Markdown } from "@/components/ui/markdown";
import { saveArticle, type AdminState } from "../actions";
import { cn } from "@/lib/utils";

export type ArticleInitial = { id: string; title: string; slug: string; excerpt: string; content: string; author: string; coverEmoji: string; readingMinutes: number; published: boolean };

export function ArticleForm({ initial }: { initial?: ArticleInitial }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveArticle, {});
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
        {tab === "write" ? <Textarea name="content" required value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[36rem] font-mono text-[13px]" /> : <><input type="hidden" name="content" value={content} /><div className="min-h-[36rem] rounded-xl border border-line p-5"><Markdown content={content || "_Nothing to preview yet._"} /></div></>}
      </div>
      <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
        <div className="space-y-4 rounded-2xl border border-line bg-card p-5 sm:p-6">
          <div><Label htmlFor="title">Title</Label><Input id="title" name="title" required defaultValue={initial?.title} /></div>
          <div><Label htmlFor="slug">Slug</Label><Input id="slug" name="slug" defaultValue={initial?.slug} placeholder="auto-generated from title" /></div>
          <div><Label htmlFor="excerpt">Excerpt</Label><Textarea id="excerpt" name="excerpt" required defaultValue={initial?.excerpt} className="min-h-20" /></div>
          <div className="grid grid-cols-[1fr_80px_100px] gap-3">
            <div><Label htmlFor="author">Author</Label><Input id="author" name="author" defaultValue={initial?.author ?? "MedAscend Editorial Team"} /></div>
            <div><Label htmlFor="coverEmoji">Emoji</Label><Input id="coverEmoji" name="coverEmoji" defaultValue={initial?.coverEmoji ?? "📘"} /></div>
            <div><Label htmlFor="readingMinutes">Read (min)</Label><Input id="readingMinutes" name="readingMinutes" type="number" min={1} defaultValue={initial?.readingMinutes ?? 7} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><Checkbox name="published" defaultChecked={initial?.published ?? true} /> Published</label>
        </div>
        <FormError message={state.error} />
        <Button type="submit" className="w-full" size="lg" loading={pending}>{initial ? "Save article" : "Publish article"}</Button>
      </div>
    </form>
  );
}
