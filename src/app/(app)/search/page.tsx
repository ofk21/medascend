import type { Metadata } from "next";
import Link from "next/link";
import { Search as SearchIcon, BookOpen } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { allowedQuestionWhere, getUserQuestionHistory } from "@/lib/sessions";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { QuestionList } from "@/components/app/question-list";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const user = await requireUser();
  let questions: Awaited<ReturnType<typeof searchQuestions>> = [];
  let topics: { slug: string; title: string; summary: string; specialty: { slug: string; name: string } }[] = [];
  if (q.length >= 2) {
    const where = await allowedQuestionWhere(user);
    [questions, topics] = await Promise.all([
      searchQuestions(where, q),
      db.textbookTopic.findMany({ where: { published: true, OR: [{ title: { contains: q, mode: "insensitive" } }, { content: { contains: q, mode: "insensitive" } }] }, take: 10, select: { slug: true, title: true, summary: true, specialty: { select: { slug: true, name: true } } } }),
    ]);
  }
  const history = q ? await getUserQuestionHistory(user.id) : new Map<string, boolean>();
  const flags = q ? new Set((await db.flag.findMany({ where: { userId: user.id }, select: { questionId: true } })).map((f) => f.questionId)) : new Set<string>();

  return (
    <div>
      <PageHeader eyebrow="Search" title="Search questions & textbook" description="Find questions by keyword, topic or tag, and textbook topics by title or content." />
      <form className="flex gap-2" action="/search">
        <Input name="q" defaultValue={q} placeholder="e.g. hyperkalaemia, Wilson's disease, lithium" autoFocus className="h-11" />
        <Button type="submit"><SearchIcon className="h-4 w-4" /> Search</Button>
      </form>
      {q.length >= 2 && (
        <div className="mt-8 space-y-8">
          {topics.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-bold">Textbook topics ({topics.length})</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {topics.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/textbook/${t.specialty.slug}/${t.slug}`} className="flex gap-3 rounded-xl border border-line bg-card p-4 hover:bg-bg-soft">
                      <BookOpen className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-600" />
                      <div>
                        <p className="font-semibold">{t.title}</p>
                        <p className="text-xs text-muted">{t.specialty.name} · {t.summary.slice(0, 90)}…</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2 className="mb-3 font-display text-lg font-bold">Questions ({questions.length}{questions.length === 50 ? "+" : ""})</h2>
            {questions.length === 0 ? (
              <EmptyState title="No questions found" description="Try a different keyword or a broader term." />
            ) : (
              <QuestionList
                showFlag
                items={questions.map((x) => ({
                  id: x.id,
                  stem: x.stem,
                  specialty: x.specialty.name,
                  topic: x.topic,
                  difficulty: x.difficulty,
                  explanation: x.explanation,
                  learningPoint: x.learningPoint,
                  options: x.options.map((o) => ({ label: o.label, text: o.text, isCorrect: o.isCorrect, explanation: o.explanation })),
                  flagged: flags.has(x.id),
                  lastCorrect: history.has(x.id) ? history.get(x.id) : undefined,
                }))}
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}

async function searchQuestions(where: { status: string; isTrial?: boolean }, q: string) {
  return db.question.findMany({
    where: { ...where, OR: [{ stem: { contains: q, mode: "insensitive" } }, { topic: { contains: q, mode: "insensitive" } }, { tags: { contains: q, mode: "insensitive" } }, { explanation: { contains: q, mode: "insensitive" } }] },
    take: 50,
    include: { specialty: { select: { name: true } }, options: { orderBy: { order: "asc" } } },
  });
}
