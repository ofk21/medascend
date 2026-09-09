import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { db } from "@/lib/db";
import { SectionHeading } from "@/components/marketing/sections";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog – MRCP Part 1 revision guides",
  description: "Guides, timetables and strategy for passing MRCP Part 1 from the MedAscend editorial team.",
};

export default async function BlogPage() {
  const articles = await db.article.findMany({ where: { published: true }, orderBy: { publishedAt: "desc" } });
  return (
    <section className="container-x py-16">
      <SectionHeading eyebrow="Blog" title="Guides for MRCP Part 1 candidates" text="Practical, evidence-based advice on the exam, revision planning and question technique." />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {articles.map((a) => (
          <Link key={a.id} href={`/blog/${a.slug}`} className="group flex flex-col rounded-2xl border border-line bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
            <span className="text-3xl">{a.coverEmoji}</span>
            <h2 className="mt-4 font-display text-xl font-bold group-hover:text-brand-700 dark:group-hover:text-brand-300">{a.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{a.excerpt}</p>
            <p className="mt-4 flex items-center gap-3 text-xs text-muted">
              <span>{a.author}</span>·<span>{formatDate(a.publishedAt)}</span>·<span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {a.readingMinutes} min read</span>
            </p>
          </Link>
        ))}
        {articles.length === 0 && <p className="text-muted">No articles published yet.</p>}
      </div>
    </section>
  );
}
