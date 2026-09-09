"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Small confirm-then-run button for destructive server actions. */
export function ConfirmButton({ onConfirm, label = "Delete", confirmLabel = "Confirm delete", variant = "danger", size = "sm", icon = true }: { onConfirm: () => Promise<unknown>; label?: string; confirmLabel?: string; variant?: "danger" | "outline" | "ghost"; size?: "sm" | "md"; icon?: boolean }) {
  const [arm, setArm] = useState(false);
  const [pending, start] = useTransition();
  if (!arm) {
    return (
      <Button type="button" variant={variant} size={size} onClick={() => setArm(true)}>
        {icon && <Trash2 className="h-4 w-4" />} {label}
      </Button>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <Button type="button" variant="danger" size={size} loading={pending} onClick={() => start(async () => { await onConfirm(); setArm(false); })}>
        {confirmLabel}
      </Button>
      <Button type="button" variant="ghost" size={size} onClick={() => setArm(false)}>Cancel</Button>
    </span>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void | Promise<void>; label?: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={pending} onClick={() => start(async () => { await onChange(!checked); })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-brand-600" : "bg-ink-300"} disabled:opacity-60`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}
