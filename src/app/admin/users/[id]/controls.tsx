"use client";

import { useActionState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, FormError, FormSuccess } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/admin/ui";
import { grantAccess, revokeSubscription, updateUserRole, extendTrial, adminResetPassword, deleteUser, type AdminState } from "../../actions";
import { formatDate } from "@/lib/utils";

type Sub = { id: string; plan: string; startsAt: string; endsAt: string; status: string; source: string; amount: string; active: boolean };

export function UserControls({ userId, role, isSelf, plans, subscriptions }: { userId: string; role: string; isSelf: boolean; plans: { id: string; name: string }[]; subscriptions: Sub[] }) {
  const [grantState, grantAction, granting] = useActionState<AdminState, FormData>(grantAccess, {});
  const [pwState, pwAction, resetting] = useActionState<AdminState, FormData>(adminResetPassword, {});
  const [pending, start] = useTransition();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Subscriptions</CardTitle><CardDescription>Grant access manually (e.g. after a bank transfer) or revoke.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <form action={grantAction} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="userId" value={userId} />
            <div className="min-w-40 flex-1"><Label htmlFor="planId">Plan</Label><Select id="planId" name="planId" defaultValue={plans[0]?.id}>{plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
            <Button type="submit" size="sm" loading={granting}>Grant access</Button>
            <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => start(async () => { await extendTrial(userId, 48); })}>+48h trial</Button>
          </form>
          <FormError message={grantState.error} /><FormSuccess message={grantState.success} />
          <ul className="divide-y divide-line text-sm">
            {subscriptions.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2">
                <div><p className="font-medium">{s.plan} <span className="text-xs text-muted">· {s.source === "ADMIN" ? "granted" : s.amount}</span></p><p className="text-xs text-muted">{formatDate(s.startsAt)} → {formatDate(s.endsAt)}</p></div>
                <div className="flex items-center gap-2">
                  <Badge tone={s.active ? "green" : "neutral"}>{s.active ? "Active" : s.status.toLowerCase()}</Badge>
                  {s.active && <ConfirmButton onConfirm={() => revokeSubscription(s.id)} label="Revoke" confirmLabel="Revoke now" variant="outline" icon={false} />}
                </div>
              </li>
            ))}
            {subscriptions.length === 0 && <li className="py-2 text-muted">No subscriptions.</li>}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Label className="mb-0">Role</Label>
            <Select value={role} disabled={isSelf || pending} onChange={(e) => start(async () => { await updateUserRole(userId, e.target.value as "USER" | "ADMIN"); })} className="w-40"><option value="USER">User</option><option value="ADMIN">Admin</option></Select>
            {isSelf && <span className="text-xs text-muted">You cannot change your own role.</span>}
          </div>
          <form action={pwAction} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="userId" value={userId} />
            <div className="min-w-48 flex-1"><Label htmlFor="password">Set a new password</Label><Input id="password" name="password" type="text" minLength={8} placeholder="Temporary password (8+ chars)" /></div>
            <Button type="submit" size="sm" variant="outline" loading={resetting}>Reset password</Button>
            <div className="basis-full"><FormError message={pwState.error} /><FormSuccess message={pwState.success} /></div>
          </form>
          {!isSelf && (
            <div className="border-t border-line pt-4">
              <p className="mb-2 text-xs text-muted">Permanently delete this user and all their data.</p>
              <ConfirmButton onConfirm={() => deleteUser(userId)} label="Delete user" confirmLabel="Yes, delete permanently" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
