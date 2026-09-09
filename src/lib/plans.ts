import { db } from "./db";

export async function getActivePlans() {
  return db.plan.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
}

export async function getPublishedTestimonials() {
  return db.testimonial.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } });
}

export async function getPlatformStats() {
  const [questions, papers, topics, users] = await Promise.all([
    db.question.count({ where: { status: "PUBLISHED" } }),
    db.paper.count({ where: { published: true } }),
    db.textbookTopic.count({ where: { published: true } }),
    db.user.count(),
  ]);
  return { questions, papers, topics, users };
}
