"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const createSchema = z.object({ title: z.string().trim().max(120).default(""), body: z.string().trim().min(1).max(5000), label: z.string().trim().max(30).default("general") });

export async function createNote(input: z.input<typeof createSchema>) {
  const user = await requireUser();
  const data = createSchema.parse(input);
  const n = await db.note.create({ data: { ...data, userId: user.id } });
  return { id: n.id, title: n.title, body: n.body, label: n.label, updatedAt: n.updatedAt.toISOString() };
}

export async function updateNote(id: string, input: { title?: string; body?: string; label?: string }) {
  const user = await requireUser();
  const data = z.object({ title: z.string().trim().max(120).optional(), body: z.string().trim().min(1).max(5000).optional(), label: z.string().trim().max(30).optional() }).parse(input);
  await db.note.updateMany({ where: { id, userId: user.id }, data });
}

export async function deleteNote(id: string) {
  const user = await requireUser();
  await db.note.deleteMany({ where: { id, userId: user.id } });
}
