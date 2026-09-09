import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/form";
import { formatDate } from "@/lib/utils";

export default async function AdminTextbookPage({ searchParams }: PageProps<"/admin/textbook">) {
  const sp = await searchParams;
  const specialtyId = typeof sp.specialty === "string" ? sp.specialty : "";
  const [topics, specialties] = await Promise.all([
    db.textbookTopic.findMany({ where: specialtyId ? { specialtyId } : {}, orderBy: [{ specialty: { sortOrder: "asc" } }, { sortOrder: "asc" }, { title: "asc" }], include: { specialty: { select: { name: true } } } }),
    db.specialty.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  return (
    <div>
      <PageHeader eyebrow="Content" title="Textbook topics" description={`${topics.length} topic${topics.length === 1 ? "" : "s"}. Markdown content with headings, tables and key points.`} actions={<Button href="/admin/textbook/new"><Plus className="h-4 w-4" /> New topic</Button>} />
      <form className="mb-4 flex gap-2" action="/admin/textbook">
        <Select name="specialty" defaultValue={specialtyId} className="max-w-xs">
          <option value="">All specialties</option>
          {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <Button type="submit" variant="secondary">Filter</Button>
      </form>
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="w-full text-sm">
          <thead className="bg-bg-soft text-left text-xs uppercase tracking-wider text-muted">
            <tr><th className="px-4 py-3 font-semibold">Title</th><th className="px-4 py-3 font-semibold">Specialty</th><th className="px-4 py-3 font-semibold">Read</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Updated</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {topics.map((t) => (
              <tr key={t.id} className="hover:bg-bg-soft/50">
                <td className="px-4 py-3"><Link href={`/admin/textbook/${t.id}`} className="font-semibold hover:underline">{t.title}</Link><p className="line-clamp-1 text-xs text-muted">{t.summary}</p></td>
                <td className="px-4 py-3 text-muted">{t.specialty.name}</td>
                <td className="px-4 py-3 text-muted">{t.readingMinutes} min</td>
                <td className="px-4 py-3"><Badge tone={t.published ? "green" : "amber"}>{t.published ? "Published" : "Draft"}</Badge></td>
                <td className="px-4 py-3 text-xs text-muted">{formatDate(t.updatedAt)}</td>
              </tr>
            ))}
            {topics.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No topics yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
