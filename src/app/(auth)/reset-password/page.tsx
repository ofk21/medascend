import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  if (!token) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold">Invalid link</h1>
        <p className="mt-2 text-sm text-muted">This reset link is missing its token. <Link href="/forgot-password" className="font-semibold text-brand-700 hover:underline">Request a new one</Link>.</p>
      </div>
    );
  }
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Choose a new password</h1>
      <div className="mt-8">
        <ResetForm token={token} />
      </div>
    </div>
  );
}
