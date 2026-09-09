import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/misc";
import { ArticleForm } from "../article-form";
import { ConfirmButton } from "@/components/admin/ui";
import { deleteArticle } from "../../actions";
import { Button } from "@/components/ui/button";

export default async function EditArticlePage({ params, searchParams }: PageProps<"/admin/articles/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const a = await db.article.findUnique({ where: { id } });
  if (!a) notFound();
  return (
    <div>
      <Link href="/admin/articles" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> Articles</Link>
      <div className="mt-3"><PageHeader eyebrow="Marketing" title={a.title} actions={<><Button href={`/blog/${a.slug}`} variant="outline" size="sm"><ExternalLink className="h-4 w-4" /> View</Button><ConfirmButton onConfirm={deleteArticle.bind(null, id)} label="Delete" /></>} /></div>
      {sp.saved && <p className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-800">Article saved.</p>}
      <ArticleForm initial={{ id: a.id, title: a.title, slug: a.slug, excerpt: a.excerpt, content: a.content, author: a.author, coverEmoji: a.coverEmoji, readingMinutes: a.readingMinutes, published: a.published }} />
    </div>
  );
}
