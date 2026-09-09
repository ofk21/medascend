import type { Metadata } from "next";
import { CreditCard, Palette, User, Lock, Database } from "lucide-react";
import { requireUser, getAccess } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/misc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, statusTone } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/utils";
import { ProfileForm, PasswordForm, ThemeForm, ResetProgressForm } from "./forms";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireUser();
  const access = getAccess(user);
  const subs = await db.subscription.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { plan: true } });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Account" title="Settings" description="Manage your profile, subscription and preferences." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2"><User className="h-4.5 w-4.5 text-brand-600" /> Profile</CardTitle>
            <CardDescription>Your name, email and exam date (used for the dashboard countdown).</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm name={user.name} email={user.email} examDate={user.examDate ? user.examDate.toISOString().slice(0, 10) : ""} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2"><CreditCard className="h-4.5 w-4.5 text-brand-600" /> Subscription</CardTitle>
            <CardDescription>{access.hasFullAccess ? `Full access${access.subscriptionEndsAt ? ` until ${formatDate(access.subscriptionEndsAt)}` : ""}.` : access.trialActive ? `Free trial until ${formatDate(access.trialEndsAt)}.` : "No active subscription."}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              <Button href="/pricing" size="sm" variant={access.hasFullAccess ? "outline" : "primary"}>{access.hasFullAccess ? "Extend access" : "Upgrade now"}</Button>
            </div>
            {subs.length === 0 ? (
              <p className="text-sm text-muted">No purchases yet.</p>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {subs.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="font-semibold">{s.plan.name}</p>
                      <p className="text-xs text-muted">{formatDate(s.startsAt)} → {formatDate(s.endsAt)} · {s.source === "ADMIN" ? "Granted" : formatPrice(s.amountPence, s.currency)}</p>
                    </div>
                    <Badge tone={statusTone(s.endsAt > new Date() && s.status === "ACTIVE" ? "ACTIVE" : "EXPIRED")}>{s.endsAt > new Date() && s.status === "ACTIVE" ? "Active" : "Expired"}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2"><Palette className="h-4.5 w-4.5 text-brand-600" /> Appearance</CardTitle>
            <CardDescription>Choose light, dark or follow your system.</CardDescription>
          </CardHeader>
          <CardContent><ThemeForm current={user.theme} /></CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2"><Lock className="h-4.5 w-4.5 text-brand-600" /> Password</CardTitle>
          </CardHeader>
          <CardContent><PasswordForm /></CardContent>
        </Card>

        <Card className="lg:col-span-2 border-red-200 dark:border-red-900/50">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2"><Database className="h-4.5 w-4.5 text-red-600" /> Data</CardTitle>
            <CardDescription>Reset your progress to start fresh. This deletes all sessions, answers, flags and question notes and cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent><ResetProgressForm /></CardContent>
        </Card>
      </div>
    </div>
  );
}
