import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/misc";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Textbook" };

export default async function TextbookPage() {
  await requireUser();
  const specialties = await db.specialty.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { textbookTopics: { where: { published: true } }, questions: { where: { status: "PUBLISHED" } } } } } });
  const total = specialties.reduce((s, x) => s + x._count.textbookTopics, 0);
  return (
    <div>
      <PageHeader eyebrow="Textbook" title="High-yield topics by specialty" description={`${total} structured topics with key points. Read a topic, then test yourself on linked questions.`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {specialties.map((s) => (
          <Link key={s.id} href={`/textbook/${s.slug}`} className="group">
            <Card className="h-full p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-lift">
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-200"><BookOpen className="h-5 w-5" /></span>
                <span className="rounded-full bg-bg-soft px-2 py-0.5 text-xs font-semibold text-muted">{s.blueprintCount} in exam</span>
              </div>
              <h2 className="mt-4 font-display text-base font-bold group-hover:text-brand-700 dark:group-hover:text-brand-300">{s.name}</h2>
              <p className="mt-1 line-clamp-2 text-xs text-muted">{s.description}</p>
              <p className="mt-3 flex items-center justify-between text-xs text-muted">
                <span>{s._count.textbookTopics} topics · {s._count.questions} questions</span>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
