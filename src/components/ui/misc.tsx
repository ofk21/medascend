import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Progress({ value, className, tone = "brand" }: { value: number; className?: string; tone?: "brand" | "amber" | "green" | "red" }) {
  const v = Math.max(0, Math.min(100, value));
  const bar = { brand: "bg-brand-600", amber: "bg-amber-400", green: "bg-emerald-500", red: "bg-red-500" }[tone];
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-bg-soft", className)} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-all duration-500", bar)} style={{ width: `${v}%` }} />
    </div>
  );
}

export function Stat({ label, value, hint, icon, className }: { label: string; value: React.ReactNode; hint?: React.ReactNode; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-line bg-card p-5 shadow-soft", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        {icon && <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-200">{icon}</span>}
      </div>
      <p className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function EmptyState({ icon, title, description, action, className }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-line bg-card/50 px-6 py-12 text-center", className)}>
      {icon && <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-bg-soft text-muted">{icon}</div>}
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {description && <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: React.ReactNode; actions?: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">{eyebrow}</p>}
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Pagination({ page, totalPages, hrefFor }: { page: number; totalPages: number; hrefFor: (p: number) => string }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-6 flex items-center justify-between gap-3 text-sm" aria-label="Pagination">
      <Link
        aria-disabled={page <= 1}
        className={cn("rounded-lg border border-line px-3 py-1.5 hover:bg-bg-soft", page <= 1 && "pointer-events-none opacity-40")}
        href={hrefFor(Math.max(1, page - 1))}
      >
        ← Previous
      </Link>
      <span className="text-muted">
        Page {page} of {totalPages}
      </span>
      <Link
        aria-disabled={page >= totalPages}
        className={cn("rounded-lg border border-line px-3 py-1.5 hover:bg-bg-soft", page >= totalPages && "pointer-events-none opacity-40")}
        href={hrefFor(Math.min(totalPages, page + 1))}
      >
        Next →
      </Link>
    </nav>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded-md border border-line bg-bg-soft px-1.5 py-0.5 font-mono text-[11px] font-semibold text-muted">{children}</kbd>;
}
