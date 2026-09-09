import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function AdminPapersPage() {
  const papers = await db.paper.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], include: { _count: { select: { questions: true, sessions: true } } } });
  return (
    <div>
      <PageHeader eyebrow="Content" title="Past papers & fixed mocks" description="Curated, fixed-order papers. Random blueprint mocks are generated automatically and need no setup." actions={<Button href="/admin/papers/new"><Plus className="h-4 w-4" /> New paper</Button>} />
      {papers.length === 0 ? (
        <EmptyState title="No papers yet" description="Create a paper, then add questions manually or auto-fill from the blueprint." action={<Button href="/admin/papers/new">Create paper</Button>} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <table className="w-full text-sm">
            <thead className="bg-bg-soft text-left text-xs uppercase tracking-wider text-muted">
              <tr><th className="px-4 py-3 font-semibold">Title</th><th className="px-4 py-3 font-semibold">Type</th><th className="px-4 py-3 font-semibold">Questions</th><th className="px-4 py-3 font-semibold">Duration</th><th className="px-4 py-3 font-semibold">Attempts</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Created</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {papers.map((p) => (
                <tr key={p.id} className="hover:bg-bg-soft/50">
                  <td className="px-4 py-3"><Link href={`/admin/papers/${p.id}`} className="font-semibold hover:underline">{p.title}</Link></td>
                  <td className="px-4 py-3 text-muted">{p.type === "MOCK" ? "Fixed mock" : "Past paper"}</td>
                  <td className="px-4 py-3">{p._count.questions}</td>
                  <td className="px-4 py-3 text-muted">{p.durationMinutes} min</td>
                  <td className="px-4 py-3 text-muted">{p._count.sessions}</td>
                  <td className="px-4 py-3"><Badge tone={p.published ? "green" : "amber"}>{p.published ? "Published" : "Draft"}</Badge></td>
                  <td className="px-4 py-3 text-xs text-muted">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
