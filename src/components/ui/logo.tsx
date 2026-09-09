import Link from "next/link";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/constants";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("h-8 w-8", className)} aria-hidden>
      <rect width="64" height="64" rx="16" fill="#0e7c7b" />
      <path d="M14 46 L28 20 L36 34 L42 26 L52 46" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="42" cy="26" r="4" fill="#f5b700" />
    </svg>
  );
}

export function Logo({ href = "/", light = false, className }: { href?: string; light?: boolean; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 font-display font-bold text-lg tracking-tight", className)}>
      <LogoMark />
      <span className={light ? "text-white" : "text-fg"}>
        Med<span className="text-brand-600 dark:text-brand-300">Ascend</span>
      </span>
      <span className="sr-only">{BRAND.name}</span>
    </Link>
  );
}
