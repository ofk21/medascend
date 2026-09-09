"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, Checkbox, FormError } from "@/components/ui/form";
import { savePaper, type AdminState } from "../actions";

export function PaperForm({ initial }: { initial?: { id: string; title: string; description: string; type: string; durationMinutes: number; published: boolean; sortOrder: number } }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(savePaper, {});
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-line bg-card p-5 sm:p-6">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <div><Label htmlFor="title">Title</Label><Input id="title" name="title" required defaultValue={initial?.title} placeholder="e.g. Past Paper 12 – September 2025 themes" /></div>
      <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" defaultValue={initial?.description} className="min-h-20" placeholder="What this paper covers and how it was built." /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><Label htmlFor="type">Type</Label><Select id="type" name="type" defaultValue={initial?.type ?? "PAST_PAPER"}><option value="PAST_PAPER">Past paper</option><option value="MOCK">Fixed mock</option></Select></div>
        <div><Label htmlFor="durationMinutes">Duration (minutes)</Label><Input id="durationMinutes" name="durationMinutes" type="number" min={5} defaultValue={initial?.durationMinutes ?? 180} /></div>
        <div><Label htmlFor="sortOrder">Sort order</Label><Input id="sortOrder" name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} /></div>
      </div>
      <label className="flex items-center gap-2 text-sm"><Checkbox name="published" defaultChecked={initial?.published} /> Published (visible to paid users)</label>
      <FormError message={state.error} />
      <Button type="submit" loading={pending}>{initial ? "Save paper" : "Create paper"}</Button>
    </form>
  );
}
