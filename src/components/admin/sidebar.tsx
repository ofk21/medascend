"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, ListChecks, Layers, FileText, BookOpen, Newspaper, Users, CreditCard, Quote, Inbox, ArrowLeft, Menu, X, Upload } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const groups = [
  { title: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    title: "Content",
    items: [
      { href: "/admin/questions", label: "Questions", icon: ListChecks },
      { href: "/admin/questions/import", label: "Bulk import", icon: Upload },
      { href: "/admin/specialties", label: "Specialties", icon: Layers },
      { href: "/admin/papers", label: "Papers & mocks", icon: FileText },
      { href: "/admin/textbook", label: "Textbook", icon: BookOpen },
      { href: "/admin/articles", label: "Blog articles", icon: Newspaper },
    ],
  },
  {
    title: "Business",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/plans", label: "Plans & pricing", icon: CreditCard },
      { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
      { href: "/admin/messages", label: "Messages", icon: Inbox },
    ],
  },
];

export function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || (pathname.startsWith(href + "/") && href !== "/admin/questions") || (href === "/admin/questions" && pathname.startsWith("/admin/questions") && !pathname.startsWith("/admin/questions/import")));

  const nav = (
    <nav className="flex flex-1 flex-col gap-5" aria-label="Admin">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-ink-400">{g.title}</p>
          <div className="flex flex-col gap-0.5">
            {g.items.map((it) => (
              <Link key={it.href} href={it.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition", isActive(it.href) ? "bg-white text-ink-900" : "text-ink-200 hover:bg-ink-800 hover:text-white")}>
                <it.icon className="h-4 w-4" /> {it.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
      <Link href="/dashboard" className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-300 hover:bg-ink-800 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to learner app</Link>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between bg-ink-900 px-4 text-white lg:hidden">
        <Logo href="/admin" light />
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-ink-800"><Menu className="h-5 w-5" /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-ink-900 p-4 text-white">
            <div className="mb-4 flex items-center justify-between"><Logo href="/admin" light /><button onClick={() => setOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-ink-800"><X className="h-5 w-5" /></button></div>
            {nav}
          </aside>
        </div>
      )}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink-900 p-4 text-white lg:flex">
        <div className="mb-6 flex items-center justify-between px-1">
          <Logo href="/admin" light />
          <span className="rounded-md bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-ink-900">ADMIN</span>
        </div>
        {nav}
        <p className="mt-3 truncate px-3 text-xs text-ink-400">Signed in as {name}</p>
      </aside>
    </>
  );
}
