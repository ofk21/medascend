"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, ListChecks, FileText, BookOpen, BarChart3, Flag, StickyNote, History, Search, Settings, ShieldCheck, LogOut, Menu, X, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { logout } from "@/app/(auth)/actions";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/qbank", label: "Qbank", icon: ListChecks },
  { href: "/papers", label: "Papers & mocks", icon: FileText },
  { href: "/textbook", label: "Textbook", icon: BookOpen },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/flagged", label: "Flagged", icon: Flag },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/history", label: "History", icon: History },
  { href: "/search", label: "Search", icon: Search },
];

export function AppSidebar({ user, access }: { user: { name: string; email: string; role: string }; access: { hasFullAccess: boolean; trialActive: boolean; trialEndsAt: string | null; planName: string | null; subscriptionEndsAt: string | null } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1" aria-label="App">
      {items.map((it) => {
        const active = pathname === it.href || pathname.startsWith(it.href + "/");
        return (
          <Link
            key={it.href}
            href={it.href}
            onClick={() => setOpen(false)}
            className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-brand-600 text-white shadow-[0_6px_16px_-8px_rgba(14,124,123,0.8)]" : "text-muted hover:bg-bg-soft hover:text-fg")}
          >
            <it.icon className="h-4.5 w-4.5" />
            {it.label}
          </Link>
        );
      })}
      {user.role === "ADMIN" && (
        <Link href="/admin" onClick={() => setOpen(false)} className={cn("mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", pathname.startsWith("/admin") ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "text-muted hover:bg-bg-soft hover:text-fg")}>
          <ShieldCheck className="h-4.5 w-4.5" /> Admin panel
        </Link>
      )}
    </nav>
  );

  const accessCard = access.hasFullAccess ? (
    <div className="rounded-xl border border-line bg-bg-soft/70 p-3 text-xs">
      <p className="font-semibold">{access.planName ?? (user.role === "ADMIN" ? "Admin access" : "Full access")}</p>
      {access.subscriptionEndsAt && <p className="mt-0.5 text-muted">Until {new Date(access.subscriptionEndsAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>}
    </div>
  ) : (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs dark:border-amber-700/40 dark:bg-amber-500/10">
      <p className="inline-flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-200"><Sparkles className="h-3.5 w-3.5" /> {access.trialActive ? "Free trial" : "Trial ended"}</p>
      <p className="mt-0.5 text-amber-800/80 dark:text-amber-100/80">{access.trialActive && access.trialEndsAt ? `Ends ${new Date(access.trialEndsAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : "Upgrade to keep practising."}</p>
      <Link href="/pricing" className="mt-2 block rounded-lg bg-amber-400 px-3 py-1.5 text-center font-semibold text-ink-900 hover:bg-amber-300">Upgrade</Link>
    </div>
  );

  const footer = (
    <div className="mt-auto space-y-3 pt-4">
      {accessCard}
      <div className="flex items-center gap-3 rounded-xl border border-line p-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 font-display text-sm font-bold text-brand-800">{user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>
        <Link href="/account" aria-label="Account settings" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-bg-soft hover:text-fg"><Settings className="h-4 w-4" /></Link>
        <form action={logout}>
          <button aria-label="Log out" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-bg-soft hover:text-fg"><LogOut className="h-4 w-4" /></button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur lg:hidden">
        <Logo href="/dashboard" />
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-bg-soft"><Menu className="h-5 w-5" /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-card p-4 shadow-lift">
            <div className="mb-4 flex items-center justify-between">
              <Logo href="/dashboard" />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-bg-soft"><X className="h-5 w-5" /></button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-card p-4 lg:flex">
        <div className="mb-6 px-1">
          <Logo href="/dashboard" />
        </div>
        {nav}
        {footer}
      </aside>
    </>
  );
}
