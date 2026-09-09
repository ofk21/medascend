import type { Metadata } from "next";
import { SectionHeading, CtaBanner } from "@/components/marketing/sections";
import { getCurrentUser } from "@/lib/auth";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = { title: "About", description: `About ${BRAND.name} – the MRCP Part 1 revision platform built by physicians.` };

const principles = [
  { t: "Written with clinicians", d: "Every question is drafted by a physician who has passed the exam and reviewed by a second before publication." },
  { t: "Reviewed by experts", d: "Specialty leads audit explanations against current NICE, BNF and Royal College guidance, and update them when guidance changes." },
  { t: "Focused on what matters", d: "We map every item to the official blueprint so your time goes on high-yield material, not obscure trivia." },
  { t: "Always improving", d: "Candidate feedback after each diet shapes new past papers and highlights recurring themes." },
];

export default async function AboutPage() {
  const user = await getCurrentUser();
  return (
    <>
      <section className="container-x pt-16 pb-12">
        <SectionHeading eyebrow="About us" title="We help doctors pass exams and progress their careers" text={`${BRAND.name} was founded by physicians who felt existing resources were either exhaustive but overwhelming, or concise but shallow. We set out to build the resource we wished we had: exam-realistic, blueprint-driven and honest about your readiness.`} />
      </section>
      <section className="container-x pb-16">
        <div className="grid gap-5 sm:grid-cols-2">
          {principles.map((p, i) => (
            <div key={p.t} className="rounded-2xl border border-line bg-card p-6 shadow-soft">
              <span className="font-display text-sm font-bold text-amber-500">0{i + 1}</span>
              <h3 className="mt-2 font-display text-lg font-bold">{p.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.d}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="container-x pb-20">
        <div className="prose-ma mx-auto max-w-3xl">
          <h2>Our approach to content</h2>
          <p>Memorising facts is not enough for Part 1. The exam rewards candidates who understand mechanisms and can apply them to unfamiliar scenarios. That is why every MedAscend question carries a full explanation of the correct answer <em>and</em> a one-line explanation for each incorrect option, plus a high-yield learning point you can revisit in the days before the exam.</p>
          <h2>Independence</h2>
          <p>{BRAND.name} is an independent revision resource and is not affiliated with or endorsed by the Federation of Royal Colleges of Physicians of the UK. All content is original.</p>
        </div>
      </section>
      <CtaBanner loggedIn={!!user} />
    </>
  );
}
