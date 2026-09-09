"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { grantPlan } from "@/lib/subscriptions";

export type AdminState = { error?: string; success?: string };

const err = (e: unknown): AdminState => ({ error: e instanceof z.ZodError ? e.issues[0]?.message ?? "Invalid input" : (e as Error).message ?? "Something went wrong" });

/* ----------------------------- Questions ----------------------------- */

const questionSchema = z.object({
  specialtyId: z.string().min(1, "Choose a specialty"),
  topic: z.string().trim().max(120).default(""),
  stem: z.string().trim().min(20, "Stem is too short"),
  explanation: z.string().trim().min(20, "Explanation is too short"),
  learningPoint: z.string().trim().max(500).default(""),
  difficulty: z.coerce.number().int().min(1).max(3),
  tags: z.string().trim().max(300).default(""),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  isTrial: z.boolean().default(false),
  reference: z.string().trim().max(300).optional(),
  options: z
    .array(z.object({ text: z.string().trim().min(1, "Every option needs text"), explanation: z.string().trim().default("") }))
    .length(5, "Exactly five options are required"),
  correctIndex: z.coerce.number().int().min(0).max(4),
});
export type QuestionInput = z.input<typeof questionSchema>;

function parseQuestionForm(fd: FormData) {
  const options = [0, 1, 2, 3, 4].map((i) => ({ text: String(fd.get(`option_${i}`) ?? ""), explanation: String(fd.get(`option_exp_${i}`) ?? "") }));
  return questionSchema.parse({
    specialtyId: fd.get("specialtyId"),
    topic: fd.get("topic"),
    stem: fd.get("stem"),
    explanation: fd.get("explanation"),
    learningPoint: fd.get("learningPoint"),
    difficulty: fd.get("difficulty"),
    tags: fd.get("tags"),
    status: fd.get("status"),
    isTrial: fd.get("isTrial") === "on",
    reference: fd.get("reference") || undefined,
    options,
    correctIndex: fd.get("correctIndex"),
  });
}

const LABELS = ["A", "B", "C", "D", "E"];

export async function createQuestion(_p: AdminState, fd: FormData): Promise<AdminState> {
  const admin = await requireAdmin();
  let id: string;
  try {
    const d = parseQuestionForm(fd);
    const q = await db.question.create({
      data: {
        specialtyId: d.specialtyId, topic: d.topic, stem: d.stem, explanation: d.explanation, learningPoint: d.learningPoint, difficulty: d.difficulty, tags: d.tags, status: d.status, isTrial: d.isTrial, reference: d.reference, createdById: admin.id,
        options: { create: d.options.map((o, i) => ({ label: LABELS[i], text: o.text, explanation: o.explanation, isCorrect: i === d.correctIndex, order: i })) },
      },
    });
    id = q.id;
  } catch (e) {
    return err(e);
  }
  revalidatePath("/admin/questions");
  if (fd.get("andNew")) redirect("/admin/questions/new?created=1");
  redirect(`/admin/questions/${id}?saved=1`);
}

export async function updateQuestion(id: string, _p: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  try {
    const d = parseQuestionForm(fd);
    const existing = await db.option.findMany({ where: { questionId: id }, orderBy: { order: "asc" } });
    await db.$transaction([
      db.question.update({ where: { id }, data: { specialtyId: d.specialtyId, topic: d.topic, stem: d.stem, explanation: d.explanation, learningPoint: d.learningPoint, difficulty: d.difficulty, tags: d.tags, status: d.status, isTrial: d.isTrial, reference: d.reference } }),
      ...d.options.map((o, i) =>
        existing[i]
          ? db.option.update({ where: { id: existing[i].id }, data: { label: LABELS[i], text: o.text, explanation: o.explanation, isCorrect: i === d.correctIndex, order: i } })
          : db.option.create({ data: { questionId: id, label: LABELS[i], text: o.text, explanation: o.explanation, isCorrect: i === d.correctIndex, order: i } }),
      ),
    ]);
  } catch (e) {
    return err(e);
  }
  revalidatePath("/admin/questions");
  revalidatePath(`/admin/questions/${id}`);
  return { success: "Question saved." };
}

export async function deleteQuestion(id: string) {
  await requireAdmin();
  await db.question.delete({ where: { id } });
  revalidatePath("/admin/questions");
  redirect("/admin/questions?deleted=1");
}

export async function bulkQuestionStatus(ids: string[], status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
  await requireAdmin();
  await db.question.updateMany({ where: { id: { in: ids } }, data: { status } });
  revalidatePath("/admin/questions");
}

export async function bulkQuestionTrial(ids: string[], isTrial: boolean) {
  await requireAdmin();
  await db.question.updateMany({ where: { id: { in: ids } }, data: { isTrial } });
  revalidatePath("/admin/questions");
}

/** Bulk import from JSON (array of question objects). Returns counts. */
const importItemSchema = z.object({
  specialty: z.string().min(1),
  topic: z.string().default(""),
  difficulty: z.coerce.number().int().min(1).max(3).default(2),
  stem: z.string().min(20),
  options: z.array(z.string().min(1)).length(5),
  correctIndex: z.coerce.number().int().min(0).max(4),
  explanation: z.string().min(20),
  optionExplanations: z.array(z.string()).length(5).optional(),
  learningPoint: z.string().default(""),
  tags: z.union([z.array(z.string()), z.string()]).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  isTrial: z.boolean().optional(),
  reference: z.string().optional(),
});

export async function importQuestions(_p: AdminState & { imported?: number; skipped?: string[] }, fd: FormData): Promise<AdminState & { imported?: number; skipped?: string[] }> {
  const admin = await requireAdmin();
  const raw = String(fd.get("json") ?? "");
  const defaultStatus = fd.get("status") === "DRAFT" ? "DRAFT" : "PUBLISHED";
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Invalid JSON. Paste an array of question objects." };
  }
  if (!Array.isArray(parsed)) return { error: "JSON must be an array." };
  const specialties = await db.specialty.findMany();
  const bySlug = new Map(specialties.map((s) => [s.slug, s.id]));
  const byName = new Map(specialties.map((s) => [s.name.toLowerCase(), s.id]));
  let imported = 0;
  const skipped: string[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const r = importItemSchema.safeParse(parsed[i]);
    if (!r.success) {
      skipped.push(`#${i + 1}: ${r.error.issues[0]?.path.join(".")} – ${r.error.issues[0]?.message}`);
      continue;
    }
    const d = r.data;
    const specialtyId = byName.get(d.specialty.toLowerCase()) ?? bySlug.get(slugify(d.specialty));
    if (!specialtyId) {
      skipped.push(`#${i + 1}: unknown specialty "${d.specialty}"`);
      continue;
    }
    await db.question.create({
      data: {
        specialtyId, topic: d.topic, stem: d.stem, explanation: d.explanation, learningPoint: d.learningPoint, difficulty: d.difficulty,
        tags: Array.isArray(d.tags) ? d.tags.join(", ") : d.tags, status: d.status ?? defaultStatus, isTrial: d.isTrial ?? false, reference: d.reference, createdById: admin.id,
        options: { create: d.options.map((text, k) => ({ label: LABELS[k], text, explanation: d.optionExplanations?.[k] ?? "", isCorrect: k === d.correctIndex, order: k })) },
      },
    });
    imported++;
  }
  revalidatePath("/admin/questions");
  return { success: `Imported ${imported} question${imported === 1 ? "" : "s"}.${skipped.length ? ` ${skipped.length} skipped.` : ""}`, imported, skipped };
}

/* ----------------------------- Specialties ----------------------------- */

export async function saveSpecialty(_p: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  try {
    const d = z.object({ id: z.string().optional(), name: z.string().trim().min(2), blueprintCount: z.coerce.number().int().min(0).max(200), description: z.string().trim().max(500).default(""), sortOrder: z.coerce.number().int().default(0) }).parse(Object.fromEntries(fd));
    const data = { name: d.name, slug: slugify(d.name), blueprintCount: d.blueprintCount, description: d.description, sortOrder: d.sortOrder };
    if (d.id) await db.specialty.update({ where: { id: d.id }, data });
    else await db.specialty.create({ data });
  } catch (e) {
    return err(e);
  }
  revalidatePath("/admin/specialties");
  return { success: "Saved." };
}

export async function deleteSpecialty(id: string) {
  await requireAdmin();
  const count = await db.question.count({ where: { specialtyId: id } });
  if (count > 0) return { error: "Move or delete its questions first." };
  await db.specialty.delete({ where: { id } });
  revalidatePath("/admin/specialties");
  return { success: "Deleted." };
}

/* ----------------------------- Papers ----------------------------- */

export async function savePaper(_p: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  let id = String(fd.get("id") ?? "");
  try {
    const d = z.object({ title: z.string().trim().min(3), description: z.string().trim().max(1000).default(""), type: z.enum(["PAST_PAPER", "MOCK"]), durationMinutes: z.coerce.number().int().min(5).max(600), published: z.boolean(), sortOrder: z.coerce.number().int().default(0) }).parse({ ...Object.fromEntries(fd), published: fd.get("published") === "on" });
    const data = { ...d, slug: slugify(d.title) };
    if (id) await db.paper.update({ where: { id }, data });
    else id = (await db.paper.create({ data })).id;
  } catch (e) {
    return err(e);
  }
  revalidatePath("/admin/papers");
  revalidatePath("/papers");
  redirect(`/admin/papers/${id}?saved=1`);
}

export async function deletePaper(id: string) {
  await requireAdmin();
  await db.paper.delete({ where: { id } });
  revalidatePath("/admin/papers");
  redirect("/admin/papers");
}

export async function addQuestionsToPaper(paperId: string, questionIds: string[]) {
  await requireAdmin();
  const existing = await db.paperQuestion.findMany({ where: { paperId }, select: { questionId: true, order: true } });
  const have = new Set(existing.map((e) => e.questionId));
  let order = existing.reduce((m, e) => Math.max(m, e.order), -1) + 1;
  const toAdd = questionIds.filter((q) => !have.has(q));
  if (toAdd.length) await db.paperQuestion.createMany({ data: toAdd.map((questionId) => ({ paperId, questionId, order: order++ })) });
  revalidatePath(`/admin/papers/${paperId}`);
  return { added: toAdd.length };
}

export async function removeQuestionFromPaper(paperId: string, questionId: string) {
  await requireAdmin();
  await db.paperQuestion.delete({ where: { paperId_questionId: { paperId, questionId } } });
  revalidatePath(`/admin/papers/${paperId}`);
}

export async function autoFillPaper(paperId: string, count: number) {
  await requireAdmin();
  const specialties = await db.specialty.findMany({ include: { questions: { where: { status: "PUBLISHED" }, select: { id: true } } } });
  const existing = new Set((await db.paperQuestion.findMany({ where: { paperId }, select: { questionId: true } })).map((x) => x.questionId));
  const total = specialties.reduce((s, x) => s + x.blueprintCount, 0) || 1;
  const picked: string[] = [];
  for (const s of specialties) {
    const want = Math.round((s.blueprintCount / total) * count);
    const pool = s.questions.map((q) => q.id).filter((id) => !existing.has(id)).sort(() => Math.random() - 0.5);
    picked.push(...pool.slice(0, want));
  }
  return addQuestionsToPaper(paperId, picked.slice(0, count));
}

/* ----------------------------- Textbook ----------------------------- */

export async function saveTopic(_p: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  let id = String(fd.get("id") ?? "");
  try {
    const d = z.object({ specialtyId: z.string().min(1), title: z.string().trim().min(3), summary: z.string().trim().max(500).default(""), content: z.string().trim().min(50), readingMinutes: z.coerce.number().int().min(1).max(120), published: z.boolean(), sortOrder: z.coerce.number().int().default(0) }).parse({ ...Object.fromEntries(fd), published: fd.get("published") === "on" });
    const slug = String(fd.get("slug") ?? "").trim() || slugify(d.title);
    if (id) await db.textbookTopic.update({ where: { id }, data: { ...d, slug } });
    else id = (await db.textbookTopic.create({ data: { ...d, slug } })).id;
  } catch (e) {
    return err(e);
  }
  revalidatePath("/admin/textbook");
  revalidatePath("/textbook");
  redirect(`/admin/textbook/${id}?saved=1`);
}

export async function deleteTopic(id: string) {
  await requireAdmin();
  await db.textbookTopic.delete({ where: { id } });
  revalidatePath("/admin/textbook");
  redirect("/admin/textbook");
}

/* ----------------------------- Articles ----------------------------- */

export async function saveArticle(_p: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  let id = String(fd.get("id") ?? "");
  try {
    const d = z.object({ title: z.string().trim().min(3), excerpt: z.string().trim().min(10).max(500), content: z.string().trim().min(50), author: z.string().trim().min(2).max(100), coverEmoji: z.string().trim().min(1).max(8), readingMinutes: z.coerce.number().int().min(1).max(120), published: z.boolean() }).parse({ ...Object.fromEntries(fd), published: fd.get("published") === "on" });
    const slug = String(fd.get("slug") ?? "").trim() || slugify(d.title);
    if (id) await db.article.update({ where: { id }, data: { ...d, slug } });
    else id = (await db.article.create({ data: { ...d, slug } })).id;
  } catch (e) {
    return err(e);
  }
  revalidatePath("/admin/articles");
  revalidatePath("/blog");
  redirect(`/admin/articles/${id}?saved=1`);
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  await db.article.delete({ where: { id } });
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

/* ----------------------------- Users ----------------------------- */

export async function updateUserRole(userId: string, role: "USER" | "ADMIN") {
  const admin = await requireAdmin();
  if (admin.id === userId && role !== "ADMIN") return { error: "You cannot remove your own admin role." };
  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath(`/admin/users/${userId}`);
  return { success: "Role updated." };
}

export async function grantAccess(_p: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  try {
    const d = z.object({ userId: z.string().min(1), planId: z.string().min(1) }).parse(Object.fromEntries(fd));
    await grantPlan({ userId: d.userId, planId: d.planId, source: "ADMIN", amountPence: 0 });
  } catch (e) {
    return err(e);
  }
  revalidatePath(`/admin/users`);
  return { success: "Access granted." };
}

export async function revokeSubscription(subscriptionId: string) {
  await requireAdmin();
  await db.subscription.update({ where: { id: subscriptionId }, data: { status: "CANCELLED", endsAt: new Date() } });
  revalidatePath("/admin/users");
}

export async function extendTrial(userId: string, hours: number) {
  await requireAdmin();
  const u = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const base = u.trialEndsAt && u.trialEndsAt > new Date() ? u.trialEndsAt : new Date();
  await db.user.update({ where: { id: userId }, data: { trialEndsAt: new Date(base.getTime() + hours * 3600_000) } });
  revalidatePath(`/admin/users/${userId}`);
}

export async function adminResetPassword(_p: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  try {
    const d = z.object({ userId: z.string().min(1), password: z.string().min(8, "At least 8 characters") }).parse(Object.fromEntries(fd));
    await db.user.update({ where: { id: d.userId }, data: { passwordHash: await hashPassword(d.password) } });
  } catch (e) {
    return err(e);
  }
  return { success: "Password reset." };
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) return;
  await db.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
  redirect("/admin/users?deleted=1");
}

/* ----------------------------- Plans ----------------------------- */

export async function savePlan(_p: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  try {
    const d = z.object({ id: z.string().optional(), name: z.string().trim().min(2), durationDays: z.coerce.number().int().min(1), pricePounds: z.coerce.number().min(0), badge: z.string().trim().max(40).default(""), description: z.string().trim().max(300).default(""), sortOrder: z.coerce.number().int().default(0), active: z.boolean() }).parse({ ...Object.fromEntries(fd), active: fd.get("active") === "on" });
    const data = { name: d.name, slug: slugify(d.name), durationDays: d.durationDays, pricePence: Math.round(d.pricePounds * 100), badge: d.badge || null, description: d.description || null, sortOrder: d.sortOrder, active: d.active, features: "" };
    if (d.id) await db.plan.update({ where: { id: d.id }, data });
    else await db.plan.create({ data });
  } catch (e) {
    return err(e);
  }
  revalidatePath("/admin/plans");
  revalidatePath("/pricing");
  revalidatePath("/");
  return { success: "Plan saved." };
}

/* ----------------------------- Testimonials ----------------------------- */

export async function saveTestimonial(_p: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  try {
    const d = z.object({ id: z.string().optional(), name: z.string().trim().min(2), role: z.string().trim().min(2), quote: z.string().trim().min(10).max(600), rating: z.coerce.number().int().min(1).max(5), sortOrder: z.coerce.number().int().default(0), published: z.boolean() }).parse({ ...Object.fromEntries(fd), published: fd.get("published") === "on" });
    const { id, ...data } = d;
    if (id) await db.testimonial.update({ where: { id }, data });
    else await db.testimonial.create({ data });
  } catch (e) {
    return err(e);
  }
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return { success: "Saved." };
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();
  await db.testimonial.delete({ where: { id } });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

/* ----------------------------- Messages ----------------------------- */

export async function toggleMessageHandled(id: string, handled: boolean) {
  await requireAdmin();
  await db.contactMessage.update({ where: { id }, data: { handled } });
  revalidatePath("/admin/messages");
}
