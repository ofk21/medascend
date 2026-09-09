"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Checkbox, Select, FormError, FormSuccess } from "@/components/ui/form";
import { ConfirmButton } from "@/components/admin/ui";
import { saveTestimonial, deleteTestimonial, type AdminState } from "../actions";

type T = { id?: string; name: string; role: string; quote: string; rating: number; sortOrder: number; published: boolean };

function Form({ t, isNew }: { t: T; isNew?: boolean }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveTestimonial, {});
  return (
    <form action={action} className={`rounded-2xl border bg-card p-5 ${isNew ? "border-dashed border-line" : "border-line"}`}>
      {t.id && <input type="hidden" name="id" value={t.id} />}
      {isNew && <h3 className="mb-3 inline-flex items-center gap-2 font-display font-bold"><Plus className="h-4 w-4" /> Add testimonial</h3>}
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_100px_80px]">
        <div><Label>Name</Label><Input name="name" required defaultValue={t.name} placeholder="Dr Jane Smith" /></div>
        <div><Label>Role</Label><Input name="role" required defaultValue={t.role} placeholder="Passed MRCP Part 1, 2026" /></div>
        <div><Label>Rating</Label><Select name="rating" defaultValue={String(t.rating)}>{[5, 4, 3].map((r) => <option key={r} value={r}>{r} ★</option>)}</Select></div>
        <div><Label>Order</Label><Input name="sortOrder" type="number" defaultValue={t.sortOrder} /></div>
      </div>
      <div className="mt-3"><Label>Quote</Label><Textarea name="quote" required defaultValue={t.quote} className="min-h-20" /></div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm"><Checkbox name="published" defaultChecked={t.published} /> Published</label>
        <div className="flex gap-2">
          {t.id && <ConfirmButton onConfirm={() => deleteTestimonial(t.id!)} label="" />}
          <Button type="submit" size="sm" loading={pending}>{isNew ? "Add" : "Save"}</Button>
        </div>
      </div>
      <div className="mt-2"><FormError message={state.error} /><FormSuccess message={state.success} /></div>
    </form>
  );
}

export function TestimonialsEditor({ items }: { items: T[] }) {
  return (
    <div className="space-y-4">
      {items.map((t) => <Form key={t.id} t={t} />)}
      <Form isNew t={{ name: "", role: "", quote: "", rating: 5, sortOrder: items.length + 1, published: true }} />
    </div>
  );
}
