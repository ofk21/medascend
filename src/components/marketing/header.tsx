"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/content/site";
import { cn } from "@/lib/utils";

export function MarketingHeader({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-bg-soft hover:text-fg">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {loggedIn ? (
            <Button href="/dashboard" size="sm">
              Go to dashboard
            </Button>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button href="/register" size="sm">
                Start free trial
              </Button>
            </>
          )}
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-xl hover:bg-bg-soft md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <div className={cn("md:hidden border-t border-line bg-bg", open ? "block" : "hidden")}>
        <nav className="container-x flex flex-col gap-1 py-3" aria-label="Mobile">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-bg-soft">
              {l.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-2 px-1">
            {loggedIn ? (
              <Button href="/dashboard" className="flex-1">
                Dashboard
              </Button>
            ) : (
              <>
                <Button href="/login" variant="outline" className="flex-1">
                  Log in
                </Button>
                <Button href="/register" className="flex-1">
                  Start free trial
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
