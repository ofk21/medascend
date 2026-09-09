import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "brand" | "amber" | "ink" | "green" | "red" | "blue" | "neutral" | "purple";

const tones: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-950/60 dark:text-brand-200 dark:ring-brand-800",
  amber: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-700/50",
  ink: "bg-ink-900 text-white ring-ink-900 dark:bg-white dark:text-ink-900 dark:ring-white",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800",
  red: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-800",
  blue: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-800",
  purple: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-800",
  neutral: "bg-bg-soft text-muted ring-line",
};

export function Badge({ tone = "neutral", className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", tones[tone], className)}
      {...props}
    />
  );
}

export function difficultyTone(d: number): Tone {
  return d === 1 ? "green" : d === 3 ? "red" : "amber";
}

export function statusTone(s: string): Tone {
  switch (s) {
    case "PUBLISHED":
    case "ACTIVE":
    case "COMPLETED":
      return "green";
    case "DRAFT":
    case "IN_PROGRESS":
    case "PENDING":
      return "amber";
    case "ARCHIVED":
    case "EXPIRED":
    case "CANCELLED":
    case "ABANDONED":
      return "neutral";
    case "ADMIN":
      return "purple";
    default:
      return "neutral";
  }
}
