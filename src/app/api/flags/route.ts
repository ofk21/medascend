import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({ questionId: z.string(), flagged: z.boolean() });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { questionId, flagged } = body.data;
  if (flagged) {
    await db.flag.upsert({ where: { userId_questionId: { userId: user.id, questionId } }, create: { userId: user.id, questionId }, update: {} });
  } else {
    await db.flag.deleteMany({ where: { userId: user.id, questionId } });
  }
  return NextResponse.json({ ok: true });
}
