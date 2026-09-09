import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cache } from "react";
import { db } from "./db";

export const SESSION_COOKIE = "medascend_session";
const SESSION_DAYS = 30;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error("AUTH_SECRET is missing or too short. Set it in .env");
  }
  return new TextEncoder().encode(s);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 11);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string) {
  const token = await createSessionToken(userId);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof loadUser>>>;

async function loadUser(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      theme: true,
      trialEndsAt: true,
      examDate: true,
      createdAt: true,
      subscriptions: {
        where: { status: "ACTIVE", endsAt: { gt: new Date() } },
        orderBy: { endsAt: "desc" },
        take: 1,
        include: { plan: { select: { name: true } } },
      },
    },
  });
}

export const getCurrentUser = cache(async () => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const userId = await verifySessionToken(token);
  if (!userId) return null;
  const user = await loadUser(userId);
  return user ?? null;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

export type AccessInfo = {
  hasFullAccess: boolean;
  onTrial: boolean;
  trialActive: boolean;
  trialEndsAt: Date | null;
  subscriptionEndsAt: Date | null;
  planName: string | null;
};

export function getAccess(user: CurrentUser): AccessInfo {
  const sub = user.subscriptions[0];
  const now = Date.now();
  const trialActive = !!user.trialEndsAt && user.trialEndsAt.getTime() > now;
  const hasSub = !!sub;
  return {
    hasFullAccess: hasSub || user.role === "ADMIN",
    onTrial: !hasSub && user.role !== "ADMIN",
    trialActive,
    trialEndsAt: user.trialEndsAt,
    subscriptionEndsAt: sub?.endsAt ?? null,
    planName: sub?.plan.name ?? null,
  };
}

/** True when the user can practise questions at all (paid, admin, or trial still running). */
export function canPractise(user: CurrentUser) {
  const a = getAccess(user);
  return a.hasFullAccess || a.trialActive;
}
