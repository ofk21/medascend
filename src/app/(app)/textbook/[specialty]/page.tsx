import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";

export async function generateMetadata({ params }: PageProps<"/textbook/[specialty]">): Promise<Metadata> {
  const { specialty } = await params;
  const s = await db.specialty.findUnique({ where: { slug: specialty } });
  return { title: s ? `${s.name} – Textbook` : "Textbook" };
}

export default async function SpecialtyTextbookPage({ params }: PageProps<"/textbook/[specialty]">) {
  const { specialty } = await params;
  await requireUser();
  const s = await db.specialty.findUnique({ where: { slug: specialty }, include: { textbookTopics: { where: { published: true }, orderBy: [{ sortOrder: "asc" }, { title: "asc" }] } } });
  if (!s) notFound();
  return (
    <div>
      <Link href="/textbook" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> All specialties</Link>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">Textbook · {s.blueprintCount} questions in the exam</p>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{s.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">{s.description}</p>
        </div>
        <Button href={`/qbank?specialty=${s.id}`} variant="outline">Practise {s.name.split(" ")[0]} questions</Button>
      </div>
      {s.textbookTopics.length === 0 ? (
        <EmptyState className="mt-8" title="No topics yet" description="Topics for this specialty are being written." />
      ) : (
        <ol className="mt-8 divide-y divide-line rounded-2xl border border-line bg-card">
          {s.textbookTopics.map((t, i) => (
            <li key={t.id}>
              <Link href={`/textbook/${s.slug}/${t.slug}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-bg-soft">
                <span className="font-display text-sm font-bold text-muted">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{t.title}</p>
                  <p className="line-clamp-1 text-sm text-muted">{t.summary}</p>
                </div>
                <span className="hidden items-center gap-1 text-xs text-muted sm:inline-flex"><Clock className="h-3.5 w-3.5" /> {t.readingMinutes} min</span>
                <ArrowRight className="h-4 w-4 text-muted" />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
