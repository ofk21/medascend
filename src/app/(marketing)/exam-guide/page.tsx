import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading, FaqList, CtaBanner } from "@/components/marketing/sections";
import { SPECIALTIES, EXAM_INFO } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { FAQ } from "@/content/site";

export const metadata: Metadata = {
  title: "MRCP Part 1 Exam Guide 2026 – Format, Blueprint, Dates & Fees",
  description: "Everything you need to know about MRCP(UK) Part 1: two 3-hour papers of 100 best-of-five questions, the specialty blueprint, 2026 exam dates, fees, pass mark and eligibility.",
};

export default async function ExamGuidePage() {
  const user = await getCurrentUser();
  const facts = [
    { l: "Papers", v: `${EXAM_INFO.papers} × ${EXAM_INFO.paperDurationHours} hours` },
    { l: "Questions", v: `${EXAM_INFO.totalQuestions} best-of-five` },
    { l: "Marking", v: "1 mark each, no negative marking" },
    { l: "Pass mark", v: `${EXAM_INFO.passMarkScaled} scaled (${EXAM_INFO.passMarkApprox})` },
    { l: "Attempts", v: `Maximum ${EXAM_INFO.maxAttempts}` },
    { l: "Fees", v: `${EXAM_INFO.feeUK} UK · ${EXAM_INFO.feeInternational} international` },
  ];
  return (
    <>
      <section className="container-x pt-16 pb-12">
        <SectionHeading eyebrow="Exam guide" title="MRCP(UK) Part 1 – everything you need to know" text="The format, the blueprint, the 2026 dates and how the exam is scored. Updated for the move to computer-based testing at test centres." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((f) => (
            <div key={f.l} className="rounded-2xl border border-line bg-card p-5 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">{f.l}</p>
              <p className="mt-1 font-display text-lg font-bold">{f.v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x pb-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="prose-ma">
            <h2>Format</h2>
            <p>
              Part 1 is a written examination taken in a single day. It consists of two papers, each lasting three hours and containing 100 questions in the <strong>best-of-five</strong> format: a clinical vignette followed by a lead-in question and five options, of which exactly one is the best answer.
            </p>
            <p>Each correct answer scores one mark and there is no negative marking, so you should answer every question. Questions are text-based; there are no images in Part 1.</p>
            <h2>Scoring and pass mark</h2>
            <p>
              Results are reported on a scaled score from {EXAM_INFO.scaledRange}. The pass mark is {EXAM_INFO.passMarkScaled}, which corresponds to roughly {EXAM_INFO.passMarkApprox} of questions answered correctly. Statistical equating adjusts for small differences in difficulty between diets.
            </p>
            <h2>Eligibility and attempts</h2>
            <p>
              Candidates need at least 12 months of postgraduate clinical experience (the equivalent of completing Foundation Year 1). A maximum of {EXAM_INFO.maxAttempts} attempts is permitted.
            </p>
            <h2 id="dates">2026 exam dates</h2>
            <table>
              <thead>
                <tr><th>Exam date</th><th>Application window</th><th>Results</th></tr>
              </thead>
              <tbody>
                {EXAM_INFO.diets.map((d) => (
                  <tr key={d.exam}><td>{d.exam}</td><td>{d.applications}</td><td>{d.results}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm text-muted">Always confirm dates and fees on the official MRCP(UK) website before applying.</p>
          </div>
          <div>
            <div className="rounded-2xl border border-line bg-card p-6 shadow-soft">
              <h2 className="font-display text-xl font-bold">Specialty blueprint</h2>
              <p className="mt-1 text-sm text-muted">Approximate number of questions per specialty across the 200-question exam. MedAscend mocks follow this weighting.</p>
              <ul className="mt-5 divide-y divide-line">
                {SPECIALTIES.slice()
                  .sort((a, b) => b.blueprintCount - a.blueprintCount)
                  .map((s) => (
                    <li key={s.slug} className="flex items-center gap-4 py-2.5 text-sm">
                      <span className="w-8 font-display text-lg font-bold text-brand-700 dark:text-brand-300">{s.blueprintCount}</span>
                      <div className="flex-1">
                        <p className="font-medium">{s.name}</p>
                        <div className="mt-1 h-1.5 rounded-full bg-bg-soft">
                          <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${(s.blueprintCount / 25) * 100}%` }} />
                        </div>
                      </div>
                      <span className="w-10 text-right text-xs text-muted">{Math.round((s.blueprintCount / 200) * 100)}%</span>
                    </li>
                  ))}
              </ul>
              <p className="mt-4 text-xs text-muted">Clinical Sciences (25) comprises cell & molecular biology, clinical anatomy, biochemistry, physiology, genetics, immunology and statistics/epidemiology.</p>
            </div>
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-relaxed text-amber-900 dark:border-amber-700/40 dark:bg-amber-500/10 dark:text-amber-100">
              <p className="font-display font-bold">How to use this</p>
              <p className="mt-1">Cardiology, Clinical Pharmacology, Clinical Sciences and the four big organ specialties make up roughly two-thirds of the paper. Prioritise them – but do not neglect the small specialties, where a few easy marks are often available.</p>
              <Link href="/blog" className="mt-3 inline-block font-semibold underline underline-offset-4">Read our revision guides →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x pb-20">
        <SectionHeading title="Common questions about the exam" />
        <div className="mx-auto mt-8 max-w-3xl">
          <FaqList items={FAQ.slice(0, 4)} />
        </div>
      </section>
      <CtaBanner loggedIn={!!user} />
    </>
  );
}
