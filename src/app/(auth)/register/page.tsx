import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";
import { TRIAL_HOURS } from "@/lib/constants";

export const metadata: Metadata = { title: "Create your account" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const sp = await searchParams;
  const plan = typeof sp.plan === "string" ? sp.plan : "";
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 text-sm text-muted">Start your free {TRIAL_HOURS}-hour trial. No card required.</p>
      <div className="mt-8">
        <RegisterForm plan={plan} />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account? <Link href="/login" className="font-semibold text-brand-700 hover:underline dark:text-brand-300">Log in</Link>
      </p>
    </div>
  );
}
