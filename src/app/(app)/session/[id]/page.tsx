import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser, getAccess } from "@/lib/auth";
import { Player, type PlayerQuestion } from "./player";

export const metadata: Metadata = { title: "Session" };

export default async function SessionPage({ params }: PageProps<"/session/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const session = await db.session.findFirst({
    where: { id, userId: user.id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { question: { include: { options: { orderBy: { order: "asc" } }, specialty: { select: { name: true } } } } },
      },
    },
  });
  if (!session) notFound();
  if (session.status !== "IN_PROGRESS") redirect(`/session/${id}/results`);

  const [flags, notes] = await Promise.all([
    db.flag.findMany({ where: { userId: user.id, questionId: { in: session.questions.map((q) => q.questionId) } }, select: { questionId: true } }),
    db.note.findMany({ where: { userId: user.id, questionId: { in: session.questions.map((q) => q.questionId) } }, select: { questionId: true, body: true } }),
  ]);
  const flagged = new Set(flags.map((f) => f.questionId));
  const noteMap = new Map(notes.map((n) => [n.questionId!, n.body]));
  const tutorMode = session.mode === "TUTOR";

  const questions: PlayerQuestion[] = session.questions.map((sq) => {
    const q = sq.question;
    const answered = sq.isCorrect !== null;
    const reveal = tutorMode && answered;
    return {
      order: sq.order,
      questionId: q.id,
      specialty: q.specialty.name,
      topic: q.topic,
      difficulty: q.difficulty,
      stem: q.stem,
      options: q.options.map((o) => ({ id: o.id, label: o.label, text: o.text, explanation: reveal ? o.explanation : undefined })),
      selectedOptionId: sq.selectedOptionId,
      isCorrect: reveal ? sq.isCorrect : answered ? null : null,
      answered,
      correctOptionId: reveal ? q.options.find((o) => o.isCorrect)?.id ?? null : null,
      explanation: reveal ? q.explanation : null,
      learningPoint: reveal ? q.learningPoint : null,
      peer: reveal ? { answered: q.timesAnswered, correct: q.timesCorrect } : null,
      flagged: flagged.has(q.id),
      note: noteMap.get(q.id) ?? "",
    };
  });

  const access = getAccess(user);
  const deadline = session.timeLimitSec ? new Date(session.startedAt.getTime() + session.timeLimitSec * 1000).toISOString() : null;

  return (
    <Player
      sessionId={session.id}
      title={session.title}
      mode={session.mode as "TUTOR" | "TIMED"}
      deadline={deadline}
      initialIndex={Math.min(session.currentIndex, questions.length - 1)}
      questions={questions}
      tutorAvailable={access.hasFullAccess && !!process.env.ANTHROPIC_API_KEY}
    />
  );
}
