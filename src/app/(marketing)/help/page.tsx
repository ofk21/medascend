import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading, FaqList } from "@/components/marketing/sections";
import { FAQ } from "@/content/site";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = { title: "Help centre", description: "Answers to common questions about MedAscend, the MRCP Part 1 exam and your account." };

const platformFaq = [
  { q: "How do I create a practice session?", a: "Go to Qbank in your dashboard, choose specialties, difficulty, whether to include unseen / incorrect / flagged questions, set the number of questions (up to 100) and pick Tutor or Timed mode. Click Start session." },
  { q: "Can I pause a session and come back later?", a: "Yes. Tutor-mode sessions can be resumed from the dashboard or History at any time. Timed sessions keep their clock running from the moment you start to keep conditions realistic." },
  { q: "What do the readiness score and peer comparison mean?", a: "The readiness score blends your recent accuracy, coverage of the blueprint and consistency into a 0–100 estimate. Peer comparison shows the percentage of all users who answered each question correctly, so you can tell a genuinely hard question from a personal gap." },
  { q: "How do I flag a question or write a note?", a: "Use the flag icon in the question header or the Notes panel below the explanation. Flagged questions and notes are collected under Flagged and Notes in the sidebar for quick review." },
  { q: "Can I reset my progress?", a: "Yes. In Account → Data you can reset all session history. This cannot be undone." },
  { q: "How do I switch to dark mode?", a: "Account → Appearance lets you choose Light, Dark or System." },
  { q: "I paid but my access has not been activated.", a: `Payments are usually activated within seconds. If not, log out and in again; if you still cannot access, email ${BRAND.supportEmail} with your receipt and we will fix it promptly.` },
];

export default function HelpPage() {
  return (
    <section className="container-x py-16">
      <SectionHeading eyebrow="Help centre" title="How can we help?" text="Browse the most common questions below. Still stuck? Contact us and a human will reply within one working day." />
      <div className="mx-auto mt-12 max-w-3xl space-y-10">
        <div>
          <h2 className="mb-4 font-display text-xl font-bold">Using the platform</h2>
          <FaqList items={platformFaq} />
        </div>
        <div>
          <h2 className="mb-4 font-display text-xl font-bold">The exam & subscriptions</h2>
          <FaqList items={FAQ} />
        </div>
        <p className="text-center text-sm text-muted">
          Can&apos;t find an answer? <Link href="/contact" className="font-semibold text-brand-700 underline-offset-4 hover:underline dark:text-brand-300">Contact support</Link>
        </p>
      </div>
    </section>
  );
}
