"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, FormError, FormSuccess } from "@/components/ui/form";
import { requestPasswordReset, type AuthState } from "../actions";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, {});
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Reset your password</h1>
      <p className="mt-2 text-sm text-muted">Enter your email and we will send you a link to choose a new password.</p>
      <form action={action} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" />
        </div>
        <FormError message={state.error} />
        <FormSuccess message={state.success} />
        <Button type="submit" className="w-full" size="lg" loading={pending}>
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="font-semibold text-brand-700 hover:underline dark:text-brand-300">Back to log in</Link>
      </p>
    </div>
  );
}
