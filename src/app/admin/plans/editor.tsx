"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Checkbox, FormError, FormSuccess } from "@/components/ui/form";
import { savePlan, type AdminState } from "../actions";

type Plan = { id?: string; name: string; durationDays: number; pricePounds: number; badge: string; description: string; sortOrder: number; active: boolean; purchases?: number };

function PlanForm({ p, isNew }: { p: Plan; isNew?: boolean }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(savePlan, {});
  return (
    <form action={action} className={`rounded-2xl border bg-card p-5 ${isNew ? "border-dashed border-line" : "border-line"}`}>
      {p.id && <input type="hidden" name="id" value={p.id} />}
      {isNew && <h3 className="mb-3 inline-flex items-center gap-2 font-display font-bold"><Plus className="h-4 w-4" /> Add plan</h3>}
      <div className="grid gap-3 sm:grid-cols-[1fr_120px_120px_140px_80px]">
        <div><Label>Name</Label><Input name="name" required defaultValue={p.name} placeholder="12 months" /></div>
        <div><Label>Days</Label><Input name="durationDays" type="number" min={1} required defaultValue={p.durationDays || ""} /></div>
        <div><Label>Price (£)</Label><Input name="pricePounds" type="number" min={0} step="0.01" required defaultValue={p.pricePounds || ""} /></div>
        <div><Label>Badge</Label><Input name="badge" defaultValue={p.badge} placeholder="Best value" /></div>
        <div><Label>Order</Label><Input name="sortOrder" type="number" defaultValue={p.sortOrder} /></div>
      </div>
      <div className="mt-3"><Label>Description</Label><Input name="description" defaultValue={p.description} placeholder="One line shown on the pricing card" /></div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm"><Checkbox name="active" defaultChecked={p.active} /> Active {p.purchases !== undefined && <span className="text-xs text-muted">· {p.purchases} purchase{p.purchases === 1 ? "" : "s"}</span>}</label>
        <Button type="submit" size="sm" loading={pending}>{isNew ? "Add plan" : "Save"}</Button>
      </div>
      <div className="mt-2"><FormError message={state.error} /><FormSuccess message={state.success} /></div>
    </form>
  );
}

export function PlansEditor({ items }: { items: Plan[] }) {
  return (
    <div className="space-y-4">
      {items.map((p) => <PlanForm key={p.id} p={p} />)}
      <PlanForm isNew p={{ name: "", durationDays: 0, pricePounds: 0, badge: "", description: "", sortOrder: items.length + 1, active: true }} />
    </div>
  );
}
