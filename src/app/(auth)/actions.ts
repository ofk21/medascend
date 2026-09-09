"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { TRIAL_HOURS, BRAND } from "@/lib/constants";
import { sendEmail } from "@/lib/email";

export type AuthState = { error?: string; success?: string };

function safeNext(next: unknown) {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  terms: z.literal("on", { message: "You must accept the terms to continue" }),
});

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { name, email, password } = parsed.data;
  const exists = await db.user.findUnique({ where: { email } });
  if (exists) return { error: "An account with this email already exists. Try logging in." };
  const isFirstUser = (await db.user.count()) === 0;
  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: isFirstUser ? "ADMIN" : "USER",
      trialEndsAt: new Date(Date.now() + TRIAL_HOURS * 3600_000),
      lastActiveAt: new Date(),
    },
  });
  await setSessionCookie(user.id);
  const plan = formData.get("plan");
  redirect(typeof plan === "string" && plan ? `/checkout/${plan}` : "/dashboard?welcome=1");
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }
  await db.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });
  await setSessionCookie(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await clearSessionCookie();
  redirect("/");
}

export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = z.string().trim().toLowerCase().email().safeParse(formData.get("email"));
  if (!email.success) return { error: "Please enter a valid email address" };
  const user = await db.user.findUnique({ where: { email: email.data } });
  if (user) {
    const token = randomBytes(32).toString("hex");
    await db.passwordResetToken.create({ data: { userId: user.id, token, expiresAt: new Date(Date.now() + 3600_000) } });
    const link = `${BRAND.url}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: `Reset your ${BRAND.name} password`,
      html: `<p>Hi ${user.name},</p><p>Click the link below to choose a new password. It expires in one hour.</p><p><a href="${link}">${link}</a></p><p>If you did not request this, you can ignore this email.</p>`,
    });
  }
  return { success: "If an account exists for that email, we have sent a reset link. Check your inbox (and spam folder)." };
}

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const rec = await db.passwordResetToken.findUnique({ where: { token: parsed.data.token } });
  if (!rec || rec.usedAt || rec.expiresAt < new Date()) return { error: "This reset link is invalid or has expired. Please request a new one." };
  await db.$transaction([
    db.user.update({ where: { id: rec.userId }, data: { passwordHash: await hashPassword(parsed.data.password) } }),
    db.passwordResetToken.update({ where: { id: rec.id }, data: { usedAt: new Date() } }),
  ]);
  await setSessionCookie(rec.userId);
  redirect("/dashboard");
}
