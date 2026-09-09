import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/misc";
import { TopicForm } from "../topic-form";
import { ConfirmButton } from "@/components/admin/ui";
import { deleteTopic } from "../../actions";
import { Button } from "@/components/ui/button";

export default async function EditTopicPage({ params, searchParams }: PageProps<"/admin/textbook/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const [t, specialties] = await Promise.all([db.textbookTopic.findUnique({ where: { id }, include: { specialty: true } }), db.specialty.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } })]);
  if (!t) notFound();
  return (
    <div>
      <Link href="/admin/textbook" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> Textbook</Link>
      <div className="mt-3">
        <PageHeader eyebrow={t.specialty.name} title={t.title} actions={<><Button href={`/textbook/${t.specialty.slug}/${t.slug}`} variant="outline" size="sm"><ExternalLink className="h-4 w-4" /> View</Button><ConfirmButton onConfirm={deleteTopic.bind(null, id)} label="Delete" /></>} />
      </div>
      {sp.saved && <p className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-800">Topic saved.</p>}
      <TopicForm specialties={specialties} initial={{ id: t.id, specialtyId: t.specialtyId, title: t.title, slug: t.slug, summary: t.summary, content: t.content, readingMinutes: t.readingMinutes, published: t.published, sortOrder: t.sortOrder }} />
    </div>
  );
}
