"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function abandonSession(id: string) {
  const user = await requireUser();
  const s = await db.session.findFirst({ where: { id, userId: user.id, status: "IN_PROGRESS" }, include: { questions: { select: { isCorrect: true } } } });
  if (!s) return;
  const answered = s.questions.filter((q) => q.isCorrect !== null);
  await db.session.update({
    where: { id },
    data: { status: "ABANDONED", completedAt: new Date(), answeredCount: answered.length, correctCount: answered.filter((q) => q.isCorrect).length },
  });
  revalidatePath("/history");
  revalidatePath("/dashboard");
}
