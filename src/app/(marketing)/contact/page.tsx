import type { Metadata } from "next";
import { Mail, MessageSquare, Clock } from "lucide-react";
import { SectionHeading } from "@/components/marketing/sections";
import { BRAND } from "@/lib/constants";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact us", description: `Get in touch with the ${BRAND.name} team.` };

export default function ContactPage() {
  return (
    <section className="container-x py-16">
      <SectionHeading eyebrow="Contact" title="Talk to a human" text="Questions about content, your account or institutional access? Send us a message." />
      <div className="mx-auto mt-12 grid max-w-4xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          {[
            { i: <Mail className="h-5 w-5" />, t: "Email", d: BRAND.supportEmail },
            { i: <Clock className="h-5 w-5" />, t: "Response time", d: "Within one working day" },
            { i: <MessageSquare className="h-5 w-5" />, t: "Content errors", d: "Use the “Report a problem” link on any question – it reaches the specialty editor directly." },
          ].map((c) => (
            <div key={c.t} className="flex gap-4 rounded-2xl border border-line bg-card p-5 shadow-soft">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-200">{c.i}</span>
              <div>
                <p className="font-semibold">{c.t}</p>
                <p className="text-sm text-muted">{c.d}</p>
              </div>
            </div>
          ))}
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
