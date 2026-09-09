import "server-only";
import { db } from "./db";
import { shuffle } from "./utils";
import { MAX_SESSION_QUESTIONS, MOCK_QUESTIONS, MOCK_DURATION_MIN, TRIAL_QUESTION_LIMIT } from "./constants";
import type { CurrentUser } from "./auth";
import { getAccess } from "./auth";

export type BuildResult = { error: string; session?: undefined } | { session: { id: string }; error?: undefined };

export type Familiarity = "unseen" | "incorrect" | "correct" | "flagged";

export type PracticeFilters = {
  specialtyIds: string[];
  difficulties: number[];
  familiarity: Familiarity[];
  keyword?: string;
  count: number;
  mode: "TUTOR" | "TIMED";
  timeLimitMin?: number;
};

/** Question ids the user is allowed to see. Trial users are restricted to the trial pool. */
export async function allowedQuestionWhere(user: CurrentUser) {
  const access = getAccess(user);
  if (access.hasFullAccess) return { status: "PUBLISHED" };
  return { status: "PUBLISHED" as const, isTrial: true };
}

export async function getUserQuestionHistory(userId: string) {
  const rows = await db.sessionQuestion.findMany({
    where: { session: { userId }, isCorrect: { not: null } },
    select: { questionId: true, isCorrect: true, answeredAt: true },
    orderBy: { answeredAt: "asc" },
  });
  const last = new Map<string, boolean>();
  for (const r of rows) last.set(r.questionId, !!r.isCorrect);
  return last; // questionId -> last answer correct?
}

export async function buildPracticeSession(user: CurrentUser, f: PracticeFilters): Promise<BuildResult> {
  const count = Math.min(MAX_SESSION_QUESTIONS, Math.max(1, f.count));
  const baseWhere = await allowedQuestionWhere(user);

  const where: Record<string, unknown> = { ...baseWhere };
  if (f.specialtyIds.length) where.specialtyId = { in: f.specialtyIds };
  if (f.difficulties.length && f.difficulties.length < 3) where.difficulty = { in: f.difficulties };
  if (f.keyword?.trim()) {
    const k = f.keyword.trim();
    where.OR = [{ stem: { contains: k, mode: "insensitive" } }, { topic: { contains: k, mode: "insensitive" } }, { tags: { contains: k, mode: "insensitive" } }];
  }

  const candidates = await db.question.findMany({ where, select: { id: true } });
  let ids = candidates.map((c) => c.id);

  if (f.familiarity.length && f.familiarity.length < 4) {
    const history = await getUserQuestionHistory(user.id);
    const flagged = new Set((await db.flag.findMany({ where: { userId: user.id }, select: { questionId: true } })).map((x) => x.questionId));
    ids = ids.filter((id) => {
      const seen = history.has(id);
      const wasCorrect = history.get(id);
      return (
        (f.familiarity.includes("unseen") && !seen) ||
        (f.familiarity.includes("incorrect") && seen && wasCorrect === false) ||
        (f.familiarity.includes("correct") && seen && wasCorrect === true) ||
        (f.familiarity.includes("flagged") && flagged.has(id))
      );
    });
  }

  if (ids.length === 0) return { error: "No questions match those filters. Try widening your selection." };

  const chosen = shuffle(ids).slice(0, count);
  const timeLimitSec = f.mode === "TIMED" ? (f.timeLimitMin ? f.timeLimitMin * 60 : Math.round(chosen.length * 108)) : null;

  const session = await db.session.create({
    data: {
      userId: user.id,
      type: "PRACTICE",
      mode: f.mode,
      title: `Practice · ${chosen.length} questions`,
      timeLimitSec,
      filtersJson: JSON.stringify(f),
      totalQuestions: chosen.length,
      questions: { create: chosen.map((questionId, i) => ({ questionId, order: i })) },
    },
  });
  return { session };
}

export async function buildPaperSession(user: CurrentUser, paperId: string): Promise<BuildResult> {
  const paper = await db.paper.findUnique({ where: { id: paperId }, include: { questions: { orderBy: { order: "asc" }, include: { question: { select: { status: true } } } } } });
  if (!paper || !paper.published) return { error: "Paper not found." };
  if (!getAccess(user).hasFullAccess) return { error: "Past papers and mock exams are available on paid plans." };
  const qs = paper.questions.filter((q) => q.question.status === "PUBLISHED");
  if (!qs.length) return { error: "This paper has no published questions yet." };
  const session = await db.session.create({
    data: {
      userId: user.id,
      type: paper.type === "MOCK" ? "MOCK" : "PAPER",
      mode: "TIMED",
      title: paper.title,
      paperId: paper.id,
      timeLimitSec: paper.durationMinutes * 60,
      totalQuestions: qs.length,
      questions: { create: qs.map((q, i) => ({ questionId: q.questionId, order: i })) },
    },
  });
  return { session };
}

/** Generate a blueprint-weighted 100 question mock exam. */
export async function buildMockSession(user: CurrentUser): Promise<BuildResult> {
  if (!getAccess(user).hasFullAccess) return { error: "Mock exams are available on paid plans." };
  const specialties = await db.specialty.findMany({ include: { questions: { where: { status: "PUBLISHED" }, select: { id: true } } } });
  const totalBlueprint = specialties.reduce((s, x) => s + x.blueprintCount, 0) || 1;
  const picked: string[] = [];
  const leftovers: string[] = [];
  for (const s of specialties) {
    const want = Math.round((s.blueprintCount / totalBlueprint) * MOCK_QUESTIONS);
    const pool = shuffle(s.questions.map((q) => q.id));
    picked.push(...pool.slice(0, want));
    leftovers.push(...pool.slice(want));
  }
  // Top up (or trim) to exactly MOCK_QUESTIONS where content allows.
  const fill = shuffle(leftovers).slice(0, Math.max(0, MOCK_QUESTIONS - picked.length));
  const ids = shuffle([...picked, ...fill]).slice(0, MOCK_QUESTIONS);
  if (ids.length < 10) return { error: "Not enough published questions to build a mock yet." };
  const session = await db.session.create({
    data: {
      userId: user.id,
      type: "MOCK",
      mode: "TIMED",
      title: `Mock exam · ${ids.length} questions`,
      timeLimitSec: Math.round((MOCK_DURATION_MIN * 60 * ids.length) / MOCK_QUESTIONS),
      totalQuestions: ids.length,
      questions: { create: ids.map((questionId, i) => ({ questionId, order: i })) },
    },
  });
  return { session };
}

export async function trialQuestionsRemaining(user: CurrentUser) {
  if (getAccess(user).hasFullAccess) return Infinity;
  const answered = await db.sessionQuestion.count({ where: { session: { userId: user.id }, isCorrect: { not: null } } });
  return Math.max(0, TRIAL_QUESTION_LIMIT - answered);
}

export async function finishSession(sessionId: string) {
  const s = await db.session.findUnique({ where: { id: sessionId }, include: { questions: true } });
  if (!s) return null;
  const answered = s.questions.filter((q) => q.isCorrect !== null);
  const correct = answered.filter((q) => q.isCorrect).length;
  return db.session.update({
    where: { id: sessionId },
    data: { status: "COMPLETED", completedAt: new Date(), correctCount: correct, answeredCount: answered.length },
  });
}
