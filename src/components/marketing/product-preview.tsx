import { Check, Flag, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** Static, illustrative rendering of the question player used on the marketing site. */
export function QuestionPreview({ className }: { className?: string }) {
  const options = [
    { l: "A", t: "Intravenous amiodarone", state: "" },
    { l: "B", t: "Intravenous adenosine", state: "" },
    { l: "C", t: "Synchronised DC cardioversion", state: "correct" },
    { l: "D", t: "Intravenous verapamil", state: "wrong" },
    { l: "E", t: "Vagal manoeuvres", state: "" },
  ];
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-line bg-card shadow-lift", className)}>
      <div className="flex items-center justify-between border-b border-line bg-bg-soft/70 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-brand-600 px-2 py-0.5 font-semibold text-white">Q 14 / 40</span>
          <span className="font-medium text-muted">Cardiology · Moderate</span>
        </div>
        <div className="flex items-center gap-3 text-muted">
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 42:18</span>
          <Flag className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <p className="text-[13px] leading-relaxed text-fg sm:text-sm">
          A 34-year-old woman presents with palpitations for 40 minutes. She is alert with a blood pressure of 74/46 mmHg and cool peripheries. The ECG shows a regular narrow-complex tachycardia at 190 bpm. <strong>What is the most appropriate immediate management?</strong>
        </p>
        <ul className="mt-4 space-y-2">
          {options.map((o) => (
            <li
              key={o.l}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2 text-[13px] sm:text-sm",
                o.state === "correct" && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                o.state === "wrong" && "border-red-300 bg-red-50 line-through decoration-red-400 dark:bg-red-950/30",
                !o.state && "border-line",
              )}
            >
              <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs font-bold", o.state === "correct" ? "bg-emerald-600 text-white" : o.state === "wrong" ? "bg-red-500 text-white" : "bg-bg-soft text-muted")}>
                {o.state === "correct" ? <Check className="h-3.5 w-3.5" /> : o.l}
              </span>
              {o.t}
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-3 text-[12px] leading-relaxed text-brand-900 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-100">
          <p className="mb-1 inline-flex items-center gap-1 font-semibold"><Sparkles className="h-3.5 w-3.5" /> Explanation</p>
          A narrow-complex tachycardia with adverse features (shock) requires immediate synchronised DC cardioversion per Resuscitation Council UK guidance. Adenosine and vagal manoeuvres are for stable SVT…
        </div>
      </div>
    </div>
  );
}

export function AnalyticsPreview({ className }: { className?: string }) {
  const rows = [
    { s: "Cardiology", v: 82 },
    { s: "Clinical Sciences", v: 71 },
    { s: "Neurology", v: 64 },
    { s: "Renal Medicine", v: 58 },
    { s: "Rheumatology", v: 49 },
  ];
  return (
    <div className={cn("rounded-2xl border border-line bg-card p-5 shadow-lift", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Readiness score</p>
          <p className="font-display text-3xl font-bold text-brand-700 dark:text-brand-300">74<span className="text-base text-muted">/100</span></p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">▲ 6 this week</span>
      </div>
      <div className="mt-4 space-y-2.5">
        {rows.map((r) => (
          <div key={r.s}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium">{r.s}</span>
              <span className="text-muted">{r.v}% · peers 66%</span>
            </div>
            <div className="h-2 rounded-full bg-bg-soft">
              <div className={cn("h-2 rounded-full", r.v >= 70 ? "bg-brand-600" : r.v >= 60 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${r.v}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
