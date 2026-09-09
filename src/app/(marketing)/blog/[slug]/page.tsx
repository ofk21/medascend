import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { Markdown } from "@/components/ui/markdown";
import { CtaBanner } from "@/components/marketing/sections";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = await db.article.findUnique({ where: { slug } });
  if (!a) return { title: "Article not found" };
  return { title: a.title, description: a.excerpt, openGraph: { title: a.title, description: a.excerpt, type: "article" } };
}

export default async function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const [a, user] = await Promise.all([db.article.findUnique({ where: { slug } }), getCurrentUser()]);
  if (!a || !a.published) notFound();
  return (
    <>
      <article className="container-x max-w-3xl py-14">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-fg">
          <ArrowLeft className="h-4 w-4" /> All articles
        </Link>
        <span className="mt-6 block text-4xl">{a.coverEmoji}</span>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{a.title}</h1>
        <p className="mt-3 text-lg text-muted">{a.excerpt}</p>
        <p className="mt-4 flex items-center gap-3 text-sm text-muted">
          <span>{a.author}</span>·<span>Updated {formatDate(a.updatedAt)}</span>·<span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {a.readingMinutes} min read</span>
        </p>
        <hr className="my-8 border-line" />
        <Markdown content={a.content} />
      </article>
      <CtaBanner loggedIn={!!user} />
    </>
  );
}
