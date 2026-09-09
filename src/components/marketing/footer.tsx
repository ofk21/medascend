import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { BRAND } from "@/lib/constants";

const cols = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/exam-guide", label: "MRCP Part 1 exam guide" },
      { href: "/register", label: "Free 48-hour trial" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/blog", label: "Blog & guides" },
      { href: "/exam-guide#dates", label: "Exam dates" },
      { href: "/help", label: "Help centre" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About MedAscend" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/refund-policy", label: "Refund policy" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-ink-900 text-ink-200">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-300">
              Pass exams. Progress careers. {BRAND.name} is the MRCP Part 1 revision platform written and reviewed by physicians, built around the official blueprint.
            </p>
            <div className="mt-5 flex items-center gap-3 text-xs text-ink-400">
              <span className="rounded-md border border-ink-700 px-2 py-1">Visa</span>
              <span className="rounded-md border border-ink-700 px-2 py-1">Mastercard</span>
              <span className="rounded-md border border-ink-700 px-2 py-1">Amex</span>
              <span className="rounded-md border border-ink-700 px-2 py-1">Apple Pay</span>
              <span className="rounded-md border border-ink-700 px-2 py-1">Google Pay</span>
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">{c.title}</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-ink-300 transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-ink-800 pt-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved. MRCP(UK) is a trademark of the Federation of Royal Colleges of Physicians; {BRAND.name} is an independent revision resource.</p>
          <p>Questions? <a className="text-ink-200 hover:text-white" href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a></p>
        </div>
      </div>
    </footer>
  );
}
