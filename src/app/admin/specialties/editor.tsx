"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FormError, FormSuccess } from "@/components/ui/form";
import { ConfirmButton } from "@/components/admin/ui";
import { saveSpecialty, deleteSpecialty, type AdminState } from "../actions";

type Item = { id: string; name: string; blueprintCount: number; description: string; sortOrder: number; questions: number; topics: number };

function Row({ s }: { s: Item }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveSpecialty, {});
  const [open, setOpen] = useState(false);
  return (
    <li className="p-4">
      <form action={action} className="grid gap-3 sm:grid-cols-[60px_1fr_110px_auto] sm:items-end">
        <input type="hidden" name="id" value={s.id} />
        <div>
          <Label>Order</Label>
          <Input name="sortOrder" type="number" defaultValue={s.sortOrder} />
        </div>
        <div>
          <Label>Name <span className="ml-2 text-xs font-normal text-muted">{s.questions} questions · {s.topics} topics</span></Label>
          <Input name="name" defaultValue={s.name} required />
        </div>
        <div>
          <Label>Blueprint Qs</Label>
          <Input name="blueprintCount" type="number" min={0} max={200} defaultValue={s.blueprintCount} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" loading={pending}>Save</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setOpen((v) => !v)}>{open ? "Hide" : "Description"}</Button>
          {s.questions === 0 && <ConfirmButton onConfirm={() => deleteSpecialty(s.id)} label="" />}
        </div>
        {open && (
          <div className="sm:col-span-4">
            <Textarea name="description" defaultValue={s.description} className="min-h-20" placeholder="Short description shown in the textbook" />
          </div>
        )}
        {!open && <input type="hidden" name="description" value={s.description} />}
        <div className="sm:col-span-4"><FormError message={state.error} /><FormSuccess message={state.success} /></div>
      </form>
    </li>
  );
}

export function SpecialtyEditor({ items }: { items: Item[] }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveSpecialty, {});
  return (
    <div className="space-y-6">
      <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
        {items.map((s) => <Row key={s.id} s={s} />)}
      </ul>
      <form action={action} className="rounded-2xl border border-dashed border-line bg-card p-4">
        <h3 className="mb-3 inline-flex items-center gap-2 font-display font-bold"><Plus className="h-4 w-4" /> Add specialty</h3>
        <div className="grid gap-3 sm:grid-cols-[1fr_120px_100px_auto] sm:items-end">
          <div><Label>Name</Label><Input name="name" required placeholder="e.g. Genetics" /></div>
          <div><Label>Blueprint Qs</Label><Input name="blueprintCount" type="number" min={0} defaultValue={0} /></div>
          <div><Label>Order</Label><Input name="sortOrder" type="number" defaultValue={items.length + 1} /></div>
          <Button type="submit" loading={pending}>Add</Button>
          <input type="hidden" name="description" value="" />
        </div>
        <div className="mt-2"><FormError message={state.error} /><FormSuccess message={state.success} /></div>
      </form>
    </div>
  );
}
