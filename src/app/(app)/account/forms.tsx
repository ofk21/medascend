"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, FormError, FormSuccess } from "@/components/ui/form";
import { updateProfile, changePassword, setTheme, resetProgress, type ActionState } from "./actions";
import { cn } from "@/lib/utils";

export function ProfileForm({ name, email, examDate }: { name: string; email: string; examDate: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateProfile, {});
  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={email} required />
      </div>
      <div>
        <Label htmlFor="examDate">Exam date</Label>
        <Input id="examDate" name="examDate" type="date" defaultValue={examDate} />
      </div>
      <FormError message={state.error} />
      <FormSuccess message={state.success} />
      <Button type="submit" loading={pending} size="sm">Save changes</Button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(changePassword, {});
  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="current">Current password</Label>
        <Input id="current" name="current" type="password" autoComplete="current-password" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm</Label>
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
        </div>
      </div>
      <FormError message={state.error} />
      <FormSuccess message={state.success} />
      <Button type="submit" loading={pending} size="sm" variant="outline">Update password</Button>
    </form>
  );
}

export function ThemeForm({ current }: { current: string }) {
  const [theme, setLocal] = useState(current);
  async function pick(t: string) {
    setLocal(t);
    document.documentElement.setAttribute("data-theme", t);
    const dark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    await setTheme(t);
  }
  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        { v: "light", l: "Light", bg: "bg-[#fafaf7]", fg: "text-ink-900" },
        { v: "dark", l: "Dark", bg: "bg-[#0b1520]", fg: "text-white" },
        { v: "system", l: "System", bg: "bg-gradient-to-r from-[#fafaf7] to-[#0b1520]", fg: "text-ink-900" },
      ].map((o) => (
        <button key={o.v} onClick={() => pick(o.v)} aria-pressed={theme === o.v} className={cn("rounded-xl border p-2 text-sm font-semibold transition", theme === o.v ? "border-brand-600 ring-2 ring-brand-600/30" : "border-line hover:bg-bg-soft")}>
          <span className={cn("mb-2 block h-12 rounded-lg border border-line", o.bg)} />
          {o.l}
        </button>
      ))}
    </div>
  );
}

export function ResetProgressForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(resetProgress, {});
  const [confirm, setConfirm] = useState("");
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="confirm">Type RESET to confirm</Label>
        <Input id="confirm" name="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="RESET" />
      </div>
      <Button type="submit" variant="danger" size="sm" disabled={confirm !== "RESET"} loading={pending}>Reset all progress</Button>
      <div className="sm:basis-full">
        <FormError message={state.error} />
        <FormSuccess message={state.success} />
      </div>
    </form>
  );
}
