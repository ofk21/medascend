import Link from "next/link";
import { ArrowRight, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAQ, PLAN_FEATURES } from "@/content/site";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, text, align = "center", light = false }: { eyebrow?: string; title: string; text?: string; align?: "center" | "left"; light?: boolean }) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && <p className={cn("mb-3 text-xs font-bold uppercase tracking-[0.16em]", light ? "text-amber-300" : "text-brand-600 dark:text-brand-300")}>{eyebrow}</p>}
      <h2 className={cn("font-display text-3xl font-bold tracking-tight sm:text-4xl", light ? "text-white" : "text-fg")}>{title}</h2>
      {text && <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", light ? "text-ink-200" : "text-muted")}>{text}</p>}
    </div>
  );
}

export function FaqList({ items = FAQ }: { items?: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-card">
      {items.map((f) => (
        <details key={f.q} className="group px-5 py-4 open:bg-bg-soft/50 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-semibold [&::-webkit-details-marker]:hidden">
            {f.q}
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-muted transition group-open:rotate-45 group-open:bg-brand-600 group-open:text-white group-open:border-brand-600">+</span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-[15px]">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export type PlanCardData = { id: string; name: string; slug: string; durationDays: number; pricePence: number; badge: string | null; description: string | null };

export function PlanCard({ plan, loggedIn, featured }: { plan: PlanCardData; loggedIn: boolean; featured?: boolean }) {
  const months = Math.round(plan.durationDays / 30.4);
  const perMonth = plan.pricePence / Math.max(1, months);
  return (
    <div className={cn("relative flex flex-col rounded-3xl border p-6 sm:p-7", featured ? "border-brand-600 bg-ink-900 text-white shadow-lift ring-4 ring-brand-600/20" : "border-line bg-card shadow-soft")}>
      {plan.badge && (
        <span className="absolute -top-3 left-6 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-ink-900 shadow">{plan.badge}</span>
      )}
      <h3 className="font-display text-xl font-bold">{plan.name}</h3>
      <p className={cn("mt-1 text-sm", featured ? "text-ink-300" : "text-muted")}>{plan.description}</p>
      <div className="mt-6 flex items-end gap-2">
        <span className="font-display text-4xl font-bold tracking-tight">{formatPrice(plan.pricePence)}</span>
        <span className={cn("mb-1.5 text-sm", featured ? "text-ink-300" : "text-muted")}>one-off · {formatPrice(Math.round(perMonth))}/mo</span>
      </div>
      <ul className="mt-6 space-y-2.5 text-sm">
        {PLAN_FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check className={cn("mt-0.5 h-4 w-4 shrink-0", featured ? "text-amber-300" : "text-brand-600")} />
            <span className={featured ? "text-ink-100" : "text-fg"}>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Button href={loggedIn ? `/checkout/${plan.slug}` : `/register?plan=${plan.slug}`} variant={featured ? "amber" : "primary"} className="w-full" size="lg">
          Get {plan.name} access <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function TestimonialCard({ t }: { t: { name: string; role: string; quote: string; rating: number } }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-line bg-card p-6 shadow-soft">
      <div className="flex gap-0.5 text-amber-400" aria-label={`${t.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={cn("h-4 w-4", i < t.rating ? "fill-current" : "opacity-30")} />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-fg">“{t.quote}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 font-display text-sm font-bold text-brand-800">{t.name.replace(/^Dr\s+/, "").split(" ").map((p) => p[0]).slice(0, 2).join("")}</span>
        <div>
          <p className="text-sm font-semibold">{t.name}</p>
          <p className="text-xs text-muted">{t.role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export function CtaBanner({ loggedIn }: { loggedIn: boolean }) {
  return (
    <section className="container-x pb-20">
      <div className="noise relative overflow-hidden rounded-3xl bg-brand-700 px-6 py-14 text-center text-white sm:px-12">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-500/40 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-amber-400/30 blur-3xl" />
        <div className="relative">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Try MedAscend free for 48 hours</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">Full textbook access and 100 practice questions. No card required – see for yourself how ready you are.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={loggedIn ? "/dashboard" : "/register"} variant="amber" size="lg">
              {loggedIn ? "Go to your dashboard" : "Start your free trial"} <ArrowRight className="h-4 w-4" />
            </Button>
            <Link href="/pricing" className="text-sm font-semibold text-white/90 underline-offset-4 hover:underline">
              View pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
