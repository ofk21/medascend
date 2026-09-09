import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function AdminArticlesPage() {
  const articles = await db.article.findMany({ orderBy: { publishedAt: "desc" } });
  return (
    <div>
      <PageHeader eyebrow="Marketing" title="Blog articles" description="Guides shown on the public blog." actions={<Button href="/admin/articles/new"><Plus className="h-4 w-4" /> New article</Button>} />
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="w-full text-sm">
          <thead className="bg-bg-soft text-left text-xs uppercase tracking-wider text-muted"><tr><th className="px-4 py-3 font-semibold">Title</th><th className="px-4 py-3 font-semibold">Author</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Published</th></tr></thead>
          <tbody className="divide-y divide-line">
            {articles.map((a) => (
              <tr key={a.id} className="hover:bg-bg-soft/50">
                <td className="px-4 py-3"><Link href={`/admin/articles/${a.id}`} className="font-semibold hover:underline">{a.coverEmoji} {a.title}</Link><p className="line-clamp-1 text-xs text-muted">{a.excerpt}</p></td>
                <td className="px-4 py-3 text-muted">{a.author}</td>
                <td className="px-4 py-3"><Badge tone={a.published ? "green" : "amber"}>{a.published ? "Published" : "Draft"}</Badge></td>
                <td className="px-4 py-3 text-xs text-muted">{formatDate(a.publishedAt)}</td>
              </tr>
            ))}
            {articles.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">No articles yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
