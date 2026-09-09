"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser, hashPassword, verifyPassword } from "@/lib/auth";

export type ActionState = { error?: string; success?: string };

export async function updateProfile(_p: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().toLowerCase().email(), examDate: z.string().optional() }).safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { name, email, examDate } = parsed.data;
  if (email !== user.email) {
    const taken = await db.user.findUnique({ where: { email } });
    if (taken) return { error: "That email is already in use." };
  }
  await db.user.update({ where: { id: user.id }, data: { name, email, examDate: examDate ? new Date(examDate) : null } });
  revalidatePath("/account");
  return { success: "Profile updated." };
}

export async function changePassword(_p: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = z
    .object({ current: z.string().min(1), password: z.string().min(8, "New password must be at least 8 characters"), confirm: z.string() })
    .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] })
    .safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const full = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(parsed.data.current, full.passwordHash))) return { error: "Current password is incorrect." };
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.password) } });
  return { success: "Password updated." };
}

export async function setTheme(theme: string) {
  const user = await requireUser();
  const t = ["light", "dark", "system"].includes(theme) ? theme : "system";
  await db.user.update({ where: { id: user.id }, data: { theme: t } });
  const jar = await cookies();
  jar.set("medascend_theme", t, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}

export async function resetProgress(_p: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (fd.get("confirm") !== "RESET") return { error: "Type RESET to confirm." };
  await db.$transaction([
    db.session.deleteMany({ where: { userId: user.id } }),
    db.flag.deleteMany({ where: { userId: user.id } }),
    db.note.deleteMany({ where: { userId: user.id, questionId: { not: null } } }),
  ]);
  revalidatePath("/dashboard");
  return { success: "Your progress has been reset." };
}
