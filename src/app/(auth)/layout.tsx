import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Check } from "lucide-react";

const perks = ["Free 48-hour trial – no card required", "Textbook access plus 100 practice questions", "Tutor and Timed modes with full explanations", "Analytics that show when you are ready"];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <div className="noise relative hidden flex-col justify-between overflow-hidden bg-ink-900 p-10 text-white lg:flex">
        <div className="absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
        <Logo light />
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight">Rise to the standard.<br />Pass MRCP Part 1.</h2>
          <ul className="mt-8 space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3 text-ink-100">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-600"><Check className="h-3 w-3" /></span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-ink-400">“The mock exams felt exactly like the real thing.” — Dr Amani Al-Harbi, passed first attempt</p>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Logo />
          <Link href="/" className="text-sm text-muted hover:text-fg">← Back to site</Link>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
