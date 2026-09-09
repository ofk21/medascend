import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { finishSession } from "@/lib/sessions";

const answerSchema = z.object({
  action: z.literal("answer"),
  order: z.number().int().min(0),
  optionId: z.string(),
  timeSpentSec: z.number().int().min(0).max(36000).default(0),
});
const flagSchema = z.object({ action: z.literal("flag"), questionId: z.string(), flagged: z.boolean() });
const noteSchema = z.object({ action: z.literal("note"), questionId: z.string(), body: z.string().max(5000) });
const finishSchema = z.object({ action: z.literal("finish") });
const positionSchema = z.object({ action: z.literal("position"), index: z.number().int().min(0) });
const schema = z.discriminatedUnion("action", [answerSchema, flagSchema, noteSchema, finishSchema, positionSchema]);

export async function POST(req: Request, ctx: RouteContext<"/api/session/[id]">) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const { id } = await ctx.params;
  const session = await db.session.findFirst({ where: { id, userId: user.id } });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const data = body.data;

  switch (data.action) {
    case "answer": {
      if (session.status !== "IN_PROGRESS") return NextResponse.json({ error: "Session finished" }, { status: 409 });
      const sq = await db.sessionQuestion.findUnique({ where: { sessionId_order: { sessionId: id, order: data.order } }, include: { question: { include: { options: { orderBy: { order: "asc" } } } } } });
      if (!sq) return NextResponse.json({ error: "Question not found" }, { status: 404 });
      if (sq.isCorrect !== null) return NextResponse.json({ error: "Already answered" }, { status: 409 });
      const opt = sq.question.options.find((o) => o.id === data.optionId);
      if (!opt) return NextResponse.json({ error: "Invalid option" }, { status: 400 });
      const isCorrect = opt.isCorrect;
      await db.$transaction([
        db.sessionQuestion.update({ where: { id: sq.id }, data: { selectedOptionId: opt.id, isCorrect, answeredAt: new Date(), timeSpentSec: data.timeSpentSec } }),
        db.question.update({ where: { id: sq.questionId }, data: { timesAnswered: { increment: 1 }, timesCorrect: { increment: isCorrect ? 1 : 0 } } }),
        db.session.update({ where: { id }, data: { answeredCount: { increment: 1 }, correctCount: { increment: isCorrect ? 1 : 0 }, currentIndex: data.order } }),
        db.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } }),
      ]);
      const q = sq.question;
      return NextResponse.json({
        isCorrect,
        correctOptionId: q.options.find((o) => o.isCorrect)?.id,
        explanation: q.explanation,
        learningPoint: q.learningPoint,
        optionExplanations: Object.fromEntries(q.options.map((o) => [o.id, o.explanation])),
        peer: { answered: q.timesAnswered + 1, correct: q.timesCorrect + (isCorrect ? 1 : 0) },
      });
    }
    case "flag": {
      if (data.flagged) {
        await db.flag.upsert({ where: { userId_questionId: { userId: user.id, questionId: data.questionId } }, create: { userId: user.id, questionId: data.questionId }, update: {} });
      } else {
        await db.flag.deleteMany({ where: { userId: user.id, questionId: data.questionId } });
      }
      return NextResponse.json({ ok: true });
    }
    case "note": {
      const existing = await db.note.findFirst({ where: { userId: user.id, questionId: data.questionId } });
      if (!data.body.trim()) {
        if (existing) await db.note.delete({ where: { id: existing.id } });
        return NextResponse.json({ ok: true, deleted: true });
      }
      const note = existing
        ? await db.note.update({ where: { id: existing.id }, data: { body: data.body } })
        : await db.note.create({ data: { userId: user.id, questionId: data.questionId, body: data.body, label: "question" } });
      return NextResponse.json({ ok: true, noteId: note.id });
    }
    case "position": {
      await db.session.update({ where: { id }, data: { currentIndex: Math.min(data.index, session.totalQuestions - 1) } });
      return NextResponse.json({ ok: true });
    }
    case "finish": {
      const s = await finishSession(id);
      return NextResponse.json({ ok: true, correct: s?.correctCount, total: s?.totalQuestions });
    }
  }
}
