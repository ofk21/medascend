import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { SectionHeading, PlanCard, FaqList, CtaBanner } from "@/components/marketing/sections";
import { getCurrentUser } from "@/lib/auth";
import { getActivePlans } from "@/lib/plans";
import { TRIAL_HOURS, TRIAL_QUESTION_LIMIT } from "@/lib/constants";
import { FAQ } from "@/content/site";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing",
  description: "MRCP Part 1 revision plans for 3, 6 or 12 months. One payment, full access, no auto-renewal. Free 48-hour trial included.",
};

const compare = [
  { f: "Question bank", trial: `${TRIAL_QUESTION_LIMIT} questions`, paid: "Full bank" },
  { f: "Textbook", trial: true, paid: true },
  { f: "Past papers", trial: false, paid: true },
  { f: "Blueprint mock exams", trial: false, paid: true },
  { f: "Tutor & Timed modes", trial: true, paid: true },
  { f: "Flags, notes & search", trial: true, paid: true },
  { f: "Analytics & readiness score", trial: "Basic", paid: "Full + peer comparison" },
  { f: "AI tutor", trial: false, paid: true },
];

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Check className="mx-auto h-5 w-5 text-brand-600" />;
  if (v === false) return <X className="mx-auto h-5 w-5 text-muted/50" />;
  return <span className="text-sm">{v}</span>;
}

export default async function PricingPage() {
  const [user, plans] = await Promise.all([getCurrentUser(), getActivePlans()]);
  const loggedIn = !!user;
  return (
    <>
      <section className="container-x pt-16 pb-12">
        <SectionHeading eyebrow="Pricing" title="Choose how long you need. Everything is included." text="One-off payment, full access from the first minute, and you can extend at any time – the new period is added to your remaining access." />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <PlanCard key={p.id} plan={p} loggedIn={loggedIn} featured={i === 0} />
          ))}
        </div>
      </section>

      <section className="container-x pb-16">
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-soft">
          <table className="w-full text-left">
            <thead className="bg-bg-soft text-sm">
              <tr>
                <th className="px-5 py-4 font-semibold">What you get</th>
                <th className="px-5 py-4 text-center font-semibold">Free trial<br /><span className="text-xs font-normal text-muted">{TRIAL_HOURS} hours</span></th>
                <th className="px-5 py-4 text-center font-semibold">Paid plans<br /><span className="text-xs font-normal text-muted">3 / 6 / 12 months</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {compare.map((r) => (
                <tr key={r.f}>
                  <td className="px-5 py-3.5 font-medium">{r.f}</td>
                  <td className="px-5 py-3.5 text-center text-muted"><Cell v={r.trial} /></td>
                  <td className="px-5 py-3.5 text-center"><Cell v={r.paid} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 text-center">
          <Button href={loggedIn ? "/dashboard" : "/register"} variant="outline">
            {loggedIn ? "Back to dashboard" : "Start the free trial"}
          </Button>
        </div>
      </section>

      <section className="container-x pb-20">
        <SectionHeading title="Pricing questions" />
        <div className="mx-auto mt-8 max-w-3xl">
          <FaqList items={FAQ.filter((f) => /trial|renew|refund/i.test(f.q))} />
        </div>
      </section>
      <CtaBanner loggedIn={loggedIn} />
    </>
  );
}
