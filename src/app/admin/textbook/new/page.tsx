import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/misc";
import { TopicForm } from "../topic-form";

export default async function NewTopicPage() {
  const specialties = await db.specialty.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });
  return (
    <div>
      <Link href="/admin/textbook" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> Textbook</Link>
      <div className="mt-3"><PageHeader eyebrow="Content" title="New textbook topic" /></div>
      <TopicForm specialties={specialties} />
    </div>
  );
}
