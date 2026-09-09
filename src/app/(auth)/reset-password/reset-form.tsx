"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, FormError } from "@/components/ui/form";
import { resetPassword, type AuthState } from "../actions";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(resetPassword, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </div>
      <div>
        <Label htmlFor="confirm">Confirm password</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
      </div>
      <FormError message={state.error} />
      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Save new password
      </Button>
    </form>
  );
}
