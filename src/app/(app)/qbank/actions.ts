"use server";

import { z } from "zod";
import { requireUser, canPractise } from "@/lib/auth";
import { buildPracticeSession, buildPaperSession, buildMockSession, trialQuestionsRemaining } from "@/lib/sessions";

const schema = z.object({
  specialtyIds: z.array(z.string()).default([]),
  difficulties: z.array(z.number().int().min(1).max(3)).default([1, 2, 3]),
  familiarity: z.array(z.enum(["unseen", "incorrect", "correct", "flagged"])).default([]),
  keyword: z.string().max(100).optional(),
  count: z.number().int().min(1).max(100),
  mode: z.enum(["TUTOR", "TIMED"]),
  timeLimitMin: z.number().int().min(1).max(240).optional(),
});

export async function createPracticeSession(input: z.input<typeof schema>): Promise<{ sessionId: string } | { error: string }> {
  const user = await requireUser();
  if (!canPractise(user)) return { error: "Your trial has ended. Upgrade to continue practising." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Invalid session settings." };
  const left = await trialQuestionsRemaining(user);
  if (left <= 0) return { error: "You have used all 100 trial questions. Upgrade to unlock the full bank." };
  const res = await buildPracticeSession(user, { ...parsed.data, count: Math.min(parsed.data.count, left) });
  if (res.error !== undefined) return { error: res.error };
  return { sessionId: res.session.id };
}

export async function startPaper(paperId: string): Promise<{ sessionId: string } | { error: string }> {
  const user = await requireUser();
  const res = await buildPaperSession(user, paperId);
  if (res.error !== undefined) return { error: res.error };
  return { sessionId: res.session.id };
}

export async function startMock(): Promise<{ sessionId: string } | { error: string }> {
  const user = await requireUser();
  const res = await buildMockSession(user);
  if (res.error !== undefined) return { error: res.error };
  return { sessionId: res.session.id };
}
