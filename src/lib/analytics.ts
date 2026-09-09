import "server-only";
import { db } from "./db";
import { pct } from "./utils";

export async function getUserOverview(userId: string) {
  const [answeredRows, sessions, flags, notes, specialties] = await Promise.all([
    db.sessionQuestion.findMany({
      where: { session: { userId }, isCorrect: { not: null } },
      select: { questionId: true, isCorrect: true, answeredAt: true, timeSpentSec: true, question: { select: { specialtyId: true, difficulty: true, timesAnswered: true, timesCorrect: true } } },
      orderBy: { answeredAt: "asc" },
    }),
    db.session.findMany({ where: { userId }, orderBy: { startedAt: "desc" }, take: 8, include: { paper: { select: { title: true } } } }),
    db.flag.count({ where: { userId } }),
    db.note.count({ where: { userId } }),
    db.specialty.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { questions: { where: { status: "PUBLISHED" } } } } } }),
  ]);

  const answered = answeredRows.length;
  const correct = answeredRows.filter((r) => r.isCorrect).length;
  const uniqueSeen = new Set(answeredRows.map((r) => r.questionId)).size;
  const totalQuestions = specialties.reduce((s, x) => s + x._count.questions, 0);

  // Per specialty
  const bySpecialty = specialties.map((s) => {
    const rows = answeredRows.filter((r) => r.question.specialtyId === s.id);
    const c = rows.filter((r) => r.isCorrect).length;
    const peerAnswered = rows.reduce((a, r) => a + r.question.timesAnswered, 0);
    const peerCorrect = rows.reduce((a, r) => a + r.question.timesCorrect, 0);
    const seen = new Set(rows.map((r) => r.questionId)).size;
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      blueprintCount: s.blueprintCount,
      total: s._count.questions,
      seen,
      answered: rows.length,
      correct: c,
      accuracy: rows.length ? pct(c, rows.length) : null,
      peerAccuracy: peerAnswered ? pct(peerCorrect, peerAnswered) : null,
      coverage: s._count.questions ? pct(seen, s._count.questions) : 0,
    };
  });

  // Per difficulty
  const byDifficulty = [1, 2, 3].map((d) => {
    const rows = answeredRows.filter((r) => r.question.difficulty === d);
    return { difficulty: d, answered: rows.length, accuracy: rows.length ? pct(rows.filter((r) => r.isCorrect).length, rows.length) : null };
  });

  // Daily activity (last 30 days)
  const days: { date: string; answered: number; correct: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    days.push({ date: d.toISOString().slice(0, 10), answered: 0, correct: 0 });
  }
  const idx = new Map(days.map((d, i) => [d.date, i]));
  for (const r of answeredRows) {
    if (!r.answeredAt) continue;
    const key = new Date(r.answeredAt).toISOString().slice(0, 10);
    const i = idx.get(key);
    if (i === undefined) continue;
    days[i].answered++;
    if (r.isCorrect) days[i].correct++;
  }

  // Streak (consecutive days with activity ending today or yesterday)
  const activeDays = new Set(answeredRows.filter((r) => r.answeredAt).map((r) => new Date(r.answeredAt!).toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date(today);
  if (!activeDays.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  while (activeDays.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Recent accuracy (last 100 answers) & readiness score
  const recent = answeredRows.slice(-100);
  const recentAccuracy = recent.length ? pct(recent.filter((r) => r.isCorrect).length, recent.length) : 0;
  const coverage = totalQuestions ? Math.min(100, (uniqueSeen / Math.min(totalQuestions, 600)) * 100) : 0;
  const blueprintTotal = specialties.reduce((s, x) => s + x.blueprintCount, 0) || 1;
  const weightedAccuracy = bySpecialty.reduce((acc, s) => acc + ((s.accuracy ?? recentAccuracy * 0.6) * s.blueprintCount) / blueprintTotal, 0);
  const readiness = answered < 20 ? Math.round(answered) : Math.round(weightedAccuracy * 0.65 + recentAccuracy * 0.2 + coverage * 0.15);

  // Peer comparison overall
  const peerAnswered = answeredRows.reduce((a, r) => a + r.question.timesAnswered, 0);
  const peerCorrect = answeredRows.reduce((a, r) => a + r.question.timesCorrect, 0);
  const avgTime = answered ? Math.round(answeredRows.reduce((a, r) => a + r.timeSpentSec, 0) / answered) : 0;

  return {
    answered,
    correct,
    accuracy: pct(correct, answered),
    uniqueSeen,
    totalQuestions,
    recentAccuracy,
    readiness: Math.max(0, Math.min(100, readiness)),
    peerAccuracy: peerAnswered ? pct(peerCorrect, peerAnswered) : null,
    avgTimeSec: avgTime,
    streak,
    flags,
    notes,
    bySpecialty,
    byDifficulty,
    days,
    sessions,
  };
}

export type UserOverview = Awaited<ReturnType<typeof getUserOverview>>;
