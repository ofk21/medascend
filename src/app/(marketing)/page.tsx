import Link from "next/link";
import { ArrowRight, BookOpen, BarChart3, Brain, FileText, ListChecks, Timer, ShieldCheck, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionPreview, AnalyticsPreview } from "@/components/marketing/product-preview";
import { SectionHeading, FaqList, PlanCard, TestimonialCard, CtaBanner } from "@/components/marketing/sections";
import { FEATURES, LEARNING_CYCLE, DEFAULT_TESTIMONIALS } from "@/content/site";
import { SPECIALTIES, EXAM_INFO } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { getActivePlans, getPublishedTestimonials, getPlatformStats } from "@/lib/plans";

const featureIcons: Record<string, React.ReactNode> = {
  qbank: <ListChecks className="h-5 w-5" />,
  papers: <FileText className="h-5 w-5" />,
  mock: <Timer className="h-5 w-5" />,
  textbook: <BookOpen className="h-5 w-5" />,
  analytics: <BarChart3 className="h-5 w-5" />,
  tutor: <Brain className="h-5 w-5" />,
};

function roundDown(n: number, step: number) {
  return Math.floor(n / step) * step;
}

export default async function HomePage() {
  const [user, plans, testimonialsDb, stats] = await Promise.all([getCurrentUser(), getActivePlans(), getPublishedTestimonials(), getPlatformStats()]);
  const testimonials = testimonialsDb.length ? testimonialsDb : DEFAULT_TESTIMONIALS;
  const loggedIn = !!user;
  const qCount = stats.questions >= 1000 ? `${roundDown(stats.questions, 500).toLocaleString()}+` : `${stats.questions}`;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0 -z-10" />
        <div className="container-x grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-200">
              <Sparkles className="h-3.5 w-3.5" /> MRCP(UK) Part 1 · built on the official blueprint
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Prepare with confidence.
              <br />
              <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">Pass MRCP Part 1.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              A physician-written question bank, bespoke past papers, blueprint-matched mock exams and a high-yield textbook – with analytics that tell you exactly when you are ready.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href={loggedIn ? "/dashboard" : "/register"} size="lg">
                {loggedIn ? "Go to dashboard" : "Start free 48-hour trial"} <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/pricing" variant="outline" size="lg">
                See plans & pricing
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-brand-600" /> No card needed for trial</span>
              <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-brand-600" /> Peer-reviewed by physicians</span>
            </div>
          </div>
          <div className="relative animate-fade-up delay-2">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-200/60 via-transparent to-amber-200/50 blur-2xl dark:from-brand-900/40 dark:to-amber-900/20" />
            <QuestionPreview />
            <AnalyticsPreview className="absolute -bottom-8 -left-4 hidden w-64 sm:block lg:-left-10" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-line bg-card">
        <div className="container-x grid grid-cols-2 gap-6 py-10 text-center md:grid-cols-4">
          {[
            { v: qCount, l: "Exam-style questions" },
            { v: `${stats.papers}+`, l: "Past papers & mocks" },
            { v: `${stats.topics}+`, l: "High-yield textbook topics" },
            { v: "17", l: "Specialties, blueprint weighted" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-3xl font-extrabold tracking-tight text-brand-700 dark:text-brand-300 sm:text-4xl">{s.v}</p>
              <p className="mt-1 text-sm text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="container-x py-20">
        <SectionHeading eyebrow="Everything in one place" title="A complete revision system, not just a question bank" text="Each tool feeds the next: read, practise, identify weak areas, reinforce and progress. Built to reduce overwhelm and maximise marks per hour of revision." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={f.key} className={`animate-fade-up delay-${(i % 4) + 1} group rounded-2xl border border-line bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift`}>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-950/60 dark:text-brand-200 dark:ring-brand-800">
                {featureIcons[f.key]}
              </span>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">{f.title}</p>
              <h3 className="mt-1 font-display text-lg font-bold">{f.headline}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LEARNING CYCLE */}
      <section className="bg-ink-900 text-white">
        <div className="container-x py-20">
          <SectionHeading light eyebrow="Scientifically grounded" title="The MedAscend learning cycle" text="Active recall, spaced repetition and deliberate practice on your weakest areas – the methods with the strongest evidence for high-stakes exams." />
          <ol className="mt-12 grid gap-4 md:grid-cols-5">
            {LEARNING_CYCLE.map((s, i) => (
              <li key={s.step} className="relative rounded-2xl border border-ink-700 bg-ink-800/60 p-5">
                <span className="font-display text-sm font-bold text-amber-300">0{i + 1}</span>
                <h3 className="mt-2 font-display text-xl font-bold">{s.step}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-200">{s.text}</p>
                {i < LEARNING_CYCLE.length - 1 && <ArrowRight className="absolute -right-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-ink-500 md:block" />}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* BLUEPRINT */}
      <section className="container-x py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" eyebrow="Matched to the exam" title="Every mock follows the official specialty blueprint" text={`The real exam has ${EXAM_INFO.totalQuestions} best-of-five questions across ${EXAM_INFO.papers} papers. Our mocks reproduce the weighting of all 17 specialties, so your score is a true readiness signal – not a guess.`} />
            <div className="mt-8 flex gap-3">
              <Button href="/exam-guide" variant="outline">
                Read the exam guide
              </Button>
              <Button href={loggedIn ? "/papers" : "/register"}>Sit a mock exam</Button>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-card p-5 shadow-soft">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Questions per specialty (out of 200)</p>
            <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {SPECIALTIES.slice()
                .sort((a, b) => b.blueprintCount - a.blueprintCount)
                .map((s) => (
                  <li key={s.slug} className="flex items-center gap-3 text-sm">
                    <span className="w-6 shrink-0 text-right font-display font-bold text-brand-700 dark:text-brand-300">{s.blueprintCount}</span>
                    <div className="h-1.5 flex-1 rounded-full bg-bg-soft">
                      <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${(s.blueprintCount / 25) * 100}%` }} />
                    </div>
                    <span className="w-40 truncate text-muted" title={s.name}>{s.name}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-bg-soft/60 py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Trusted by candidates" title="Doctors who passed with MedAscend" />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <TestimonialCard key={t.name} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="container-x py-20">
        <SectionHeading eyebrow="Simple pricing" title="One payment. Everything included." text="No auto-renewal, no hidden tiers. Every plan unlocks the full platform – choose how long you need." />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <PlanCard key={p.id} plan={p} loggedIn={loggedIn} featured={i === 0} />
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Not ready to commit? <Link href={loggedIn ? "/dashboard" : "/register"} className="font-semibold text-brand-700 underline-offset-4 hover:underline dark:text-brand-300">Start the free 48-hour trial</Link> – textbook plus 100 questions.
        </p>
      </section>

      {/* FAQ */}
      <section className="container-x pb-20">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
        <div className="mx-auto mt-10 max-w-3xl">
          <FaqList />
        </div>
      </section>

      <CtaBanner loggedIn={loggedIn} />
    </>
  );
}
