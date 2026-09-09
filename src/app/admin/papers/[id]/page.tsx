import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/misc";
import { PaperForm } from "../paper-form";
import { PaperQuestions } from "./paper-questions";
import { ConfirmButton } from "@/components/admin/ui";
import { deletePaper } from "../../actions";

export default async function EditPaperPage({ params, searchParams }: PageProps<"/admin/papers/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const [paper, specialties] = await Promise.all([
    db.paper.findUnique({ where: { id }, include: { questions: { orderBy: { order: "asc" }, include: { question: { select: { id: true, stem: true, difficulty: true, specialty: { select: { name: true } } } } } } } }),
    db.specialty.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!paper) notFound();
  const inPaper = new Set(paper.questions.map((x) => x.questionId));
  const candidates = q
    ? await db.question.findMany({ where: { status: "PUBLISHED", id: { notIn: [...inPaper] }, OR: [{ stem: { contains: q, mode: "insensitive" } }, { topic: { contains: q, mode: "insensitive" } }, { tags: { contains: q, mode: "insensitive" } }, { specialty: { name: { contains: q, mode: "insensitive" } } }] }, take: 30, include: { specialty: { select: { name: true } } } })
    : [];
  const bySpecialty = Object.entries(paper.questions.reduce<Record<string, number>>((a, x) => { a[x.question.specialty.name] = (a[x.question.specialty.name] ?? 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <Link href="/admin/papers" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> Papers</Link>
      <div className="mt-3">
        <PageHeader eyebrow="Content" title={paper.title} description={`${paper.questions.length} questions · ${paper.durationMinutes} minutes · ${paper.published ? "published" : "draft"}`} actions={<ConfirmButton onConfirm={deletePaper.bind(null, id)} label="Delete paper" />} />
      </div>
      {sp.saved && <p className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-800">Paper saved.</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-6">
          <PaperForm initial={{ id: paper.id, title: paper.title, description: paper.description ?? "", type: paper.type, durationMinutes: paper.durationMinutes, published: paper.published, sortOrder: paper.sortOrder }} />
          <div className="rounded-2xl border border-line bg-card p-5">
            <h3 className="font-display font-bold">Composition</h3>
            {bySpecialty.length === 0 ? <p className="mt-2 text-sm text-muted">No questions yet.</p> : (
              <ul className="mt-2 space-y-1 text-sm">{bySpecialty.map(([n, c]) => <li key={n} className="flex justify-between"><span className="text-muted">{n}</span><span className="font-semibold">{c}</span></li>)}</ul>
            )}
          </div>
        </div>
        <PaperQuestions
          paperId={paper.id}
          query={q}
          specialties={specialties}
          questions={paper.questions.map((x) => ({ id: x.question.id, stem: x.question.stem, specialty: x.question.specialty.name, difficulty: x.question.difficulty, order: x.order }))}
          candidates={candidates.map((c) => ({ id: c.id, stem: c.stem, specialty: c.specialty.name, difficulty: c.difficulty }))}
        />
      </div>
    </div>
  );
}
