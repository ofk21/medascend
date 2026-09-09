import type { Metadata } from "next";
import { Flag } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { QuestionList } from "@/components/app/question-list";

export const metadata: Metadata = { title: "Flagged questions" };

export default async function FlaggedPage() {
  const user = await requireUser();
  const flags = await db.flag.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { question: { include: { specialty: { select: { name: true } }, options: { orderBy: { order: "asc" } } } } },
  });
  const items = flags.map((f) => ({
    id: f.question.id,
    stem: f.question.stem,
    specialty: f.question.specialty.name,
    topic: f.question.topic,
    difficulty: f.question.difficulty,
    explanation: f.question.explanation,
    learningPoint: f.question.learningPoint,
    options: f.question.options.map((o) => ({ label: o.label, text: o.text, isCorrect: o.isCorrect, explanation: o.explanation })),
    flagged: true,
  }));
  return (
    <div>
      <PageHeader eyebrow="Review" title="Flagged questions" description="Questions you marked during sessions. Practise them all in one go, or unflag once they are secure." actions={items.length > 0 && <Button href="/qbank?familiarity=flagged">Practise flagged</Button>} />
      {items.length === 0 ? (
        <EmptyState icon={<Flag className="h-5 w-5" />} title="No flagged questions" description="Press F or tap the flag icon during a session to collect questions here." action={<Button href="/qbank">Start a session</Button>} />
      ) : (
        <QuestionList items={items} showFlag />
      )}
    </div>
  );
}
