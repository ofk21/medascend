import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/misc";
import { QuestionForm } from "../question-form";
import { createQuestion } from "../../actions";

export default async function NewQuestionPage({ searchParams }: PageProps<"/admin/questions/new">) {
  const sp = await searchParams;
  const specialties = await db.specialty.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });
  return (
    <div>
      <Link href="/admin/questions" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> Questions</Link>
      <div className="mt-3">
        <PageHeader eyebrow="Content" title="New question" description="Write a best-of-five question with a full explanation." />
      </div>
      {sp.created && <p className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-800">Question created. Add another below.</p>}
      <QuestionForm action={createQuestion} specialties={specialties} submitLabel="Create question" showAndNew />
    </div>
  );
}
