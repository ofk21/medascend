"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Checkbox, FormError, FieldHint } from "@/components/ui/form";
import { register, type AuthState } from "../actions";

export function RegisterForm({ plan }: { plan: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(register, {});
  return (
    <form action={action} className="space-y-5">
      {plan && <input type="hidden" name="plan" value={plan} />}
      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" autoComplete="name" required placeholder="Dr Jane Smith" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" />
        <FieldHint>Use 8+ characters with a mix of letters and numbers.</FieldHint>
      </div>
      <label className="flex items-start gap-3 text-sm text-muted">
        <Checkbox name="terms" required className="mt-0.5" />
        <span>
          I agree to the <Link href="/terms" className="font-medium text-fg underline underline-offset-2">Terms of service</Link> and <Link href="/privacy" className="font-medium text-fg underline underline-offset-2">Privacy policy</Link>.
        </span>
      </label>
      <FormError message={state.error} />
      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Create account & start trial
      </Button>
    </form>
  );
}
