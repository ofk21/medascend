import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, ListChecks } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Markdown } from "@/components/ui/markdown";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: PageProps<"/textbook/[specialty]/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const t = await db.textbookTopic.findUnique({ where: { slug } });
  return { title: t ? `${t.title} – Textbook` : "Textbook" };
}

export default async function TopicPage({ params }: PageProps<"/textbook/[specialty]/[slug]">) {
  const { specialty, slug } = await params;
  await requireUser();
  const t = await db.textbookTopic.findUnique({ where: { slug }, include: { specialty: true } });
  if (!t || !t.published || t.specialty.slug !== specialty) notFound();
  const siblings = await db.textbookTopic.findMany({ where: { specialtyId: t.specialtyId, published: true }, orderBy: [{ sortOrder: "asc" }, { title: "asc" }], select: { slug: true, title: true } });
  const idx = siblings.findIndex((s) => s.slug === t.slug);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const relatedCount = await db.question.count({ where: { specialtyId: t.specialtyId, status: "PUBLISHED", OR: [{ topic: { contains: t.title.split(" ")[0], mode: "insensitive" } }, { tags: { contains: t.title.split(" ")[0].toLowerCase() } }] } });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
      <article className="min-w-0">
        <Link href={`/textbook/${t.specialty.slug}`} className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> {t.specialty.name}</Link>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-lg text-muted">{t.summary}</p>
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted"><Clock className="h-3.5 w-3.5" /> {t.readingMinutes} min read</p>
        <hr className="my-6 border-line" />
        <Markdown content={t.content} />
        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between">
          {prev ? (
            <Link href={`/textbook/${t.specialty.slug}/${prev.slug}`} className="group rounded-xl border border-line p-4 text-sm hover:bg-bg-soft sm:max-w-[48%]">
              <span className="text-xs text-muted">← Previous</span>
              <p className="font-semibold group-hover:text-brand-700">{prev.title}</p>
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/textbook/${t.specialty.slug}/${next.slug}`} className="group rounded-xl border border-line p-4 text-right text-sm hover:bg-bg-soft sm:max-w-[48%]">
              <span className="text-xs text-muted">Next →</span>
              <p className="font-semibold group-hover:text-brand-700">{next.title}</p>
            </Link>
          )}
        </div>
      </article>
      <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-800 dark:bg-brand-950/40">
          <p className="inline-flex items-center gap-2 font-display font-bold"><ListChecks className="h-4.5 w-4.5 text-brand-700 dark:text-brand-300" /> Test yourself</p>
          <p className="mt-1 text-sm text-muted">{relatedCount > 0 ? `${relatedCount} questions match this topic.` : `Practise ${t.specialty.name} questions now.`}</p>
          <Button href={relatedCount > 0 ? `/qbank?specialty=${t.specialtyId}` : `/qbank?specialty=${t.specialtyId}`} className="mt-3 w-full" size="sm">
            Start questions <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">In this specialty</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {siblings.map((s) => (
              <li key={s.slug}>
                <Link href={`/textbook/${t.specialty.slug}/${s.slug}`} className={s.slug === t.slug ? "font-semibold text-brand-700 dark:text-brand-300" : "text-muted hover:text-fg"}>{s.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
