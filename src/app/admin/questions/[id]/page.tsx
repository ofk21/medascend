import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, Flag, StickyNote } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/misc";
import { QuestionForm } from "../question-form";
import { updateQuestion, deleteQuestion } from "../../actions";
import { ConfirmButton } from "@/components/admin/ui";
import { pct, formatDateTime } from "@/lib/utils";

export default async function EditQuestionPage({ params, searchParams }: PageProps<"/admin/questions/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const [q, specialties, flags, notes] = await Promise.all([
    db.question.findUnique({ where: { id }, include: { options: { orderBy: { order: "asc" } }, createdBy: { select: { name: true } } } }),
    db.specialty.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.flag.count({ where: { questionId: id } }),
    db.note.count({ where: { questionId: id } }),
  ]);
  if (!q) notFound();
  const action = updateQuestion.bind(null, id);
  const del = deleteQuestion.bind(null, id);

  return (
    <div>
      <Link href="/admin/questions" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> Questions</Link>
      <div className="mt-3">
        <PageHeader
          eyebrow={`Question · ${q.id}`}
          title="Edit question"
          description={<span className="flex flex-wrap gap-4 text-xs"><span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {q.timesAnswered ? `${pct(q.timesCorrect, q.timesAnswered)}% correct of ${q.timesAnswered}` : "Not answered yet"}</span><span className="inline-flex items-center gap-1"><Flag className="h-3.5 w-3.5" /> {flags} flags</span><span className="inline-flex items-center gap-1"><StickyNote className="h-3.5 w-3.5" /> {notes} notes</span><span>Created {formatDateTime(q.createdAt)}{q.createdBy ? ` by ${q.createdBy.name}` : ""}</span></span>}
          actions={<ConfirmButton onConfirm={del} label="Delete question" />}
        />
      </div>
      {sp.saved && <p className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-800">Question created successfully.</p>}
      <QuestionForm
        action={action}
        specialties={specialties}
        submitLabel="Save changes"
        initial={{
          specialtyId: q.specialtyId,
          topic: q.topic,
          stem: q.stem,
          explanation: q.explanation,
          learningPoint: q.learningPoint,
          difficulty: q.difficulty,
          tags: q.tags,
          status: q.status,
          isTrial: q.isTrial,
          reference: q.reference ?? "",
          options: q.options.map((o) => ({ text: o.text, explanation: o.explanation })),
          correctIndex: Math.max(0, q.options.findIndex((o) => o.isCorrect)),
        }}
      />
    </div>
  );
}
