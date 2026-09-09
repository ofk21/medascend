"use client";

import { Toggle } from "@/components/admin/ui";
import { toggleMessageHandled } from "../actions";

export function HandledToggle({ id, handled }: { id: string; handled: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">{handled ? "Handled" : "Open"}</span>
      <Toggle checked={handled} label="Mark handled" onChange={(v) => toggleMessageHandled(id, v)} />
    </label>
  );
}
