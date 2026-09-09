/**
 * Seed script: specialties (with blueprint weights), plans, testimonials, admin user,
 * and – when present – sample content from ./seed-data/*.json
 * (questions.json, topics.json, articles.json).
 *
 * Run with:  npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

const db = new PrismaClient();

const SPECIALTIES = [
  { name: "Cardiology", slug: "cardiology", blueprintCount: 14, description: "Ischaemic heart disease, arrhythmias, valvular disease, heart failure and ECG interpretation." },
  { name: "Clinical Pharmacology & Therapeutics", slug: "clinical-pharmacology", blueprintCount: 15, description: "Mechanisms of action, adverse effects, interactions, prescribing in special groups and toxicology." },
  { name: "Clinical Sciences", slug: "clinical-sciences", blueprintCount: 25, description: "Cell biology, anatomy, biochemistry, physiology, genetics, immunology and statistics/epidemiology." },
  { name: "Dermatology", slug: "dermatology", blueprintCount: 8, description: "Inflammatory skin disease, skin cancers, cutaneous manifestations of systemic disease." },
  { name: "Endocrinology, Diabetes & Metabolic Medicine", slug: "endocrinology", blueprintCount: 14, description: "Diabetes, thyroid, adrenal, pituitary, calcium and bone metabolism." },
  { name: "Gastroenterology & Hepatology", slug: "gastroenterology", blueprintCount: 14, description: "Luminal GI disease, liver disease, pancreatobiliary disorders and nutrition." },
  { name: "Geriatric Medicine", slug: "geriatric-medicine", blueprintCount: 8, description: "Frailty, falls, delirium, dementia, polypharmacy and comprehensive geriatric assessment." },
  { name: "Haematology", slug: "haematology", blueprintCount: 10, description: "Anaemias, haemoglobinopathies, haematological malignancy, coagulation and transfusion." },
  { name: "Infectious Diseases", slug: "infectious-diseases", blueprintCount: 14, description: "Bacterial, viral, fungal and parasitic infection, HIV, tropical medicine and antimicrobials." },
  { name: "Neurology", slug: "neurology", blueprintCount: 14, description: "Stroke, epilepsy, movement disorders, neuromuscular disease, headache and neuro-anatomy." },
  { name: "Oncology", slug: "oncology", blueprintCount: 5, description: "Tumour biology, oncological emergencies, paraneoplastic syndromes and systemic therapy." },
  { name: "Medical Ophthalmology", slug: "ophthalmology", blueprintCount: 4, description: "The red eye, visual loss, ocular manifestations of systemic disease and neuro-ophthalmology." },
  { name: "Palliative Medicine & End of Life Care", slug: "palliative-medicine", blueprintCount: 4, description: "Symptom control, opioid conversion, ethics and end-of-life decision making." },
  { name: "Psychiatry", slug: "psychiatry", blueprintCount: 9, description: "Mood disorders, psychosis, substance misuse, organic psychiatry and psychopharmacology." },
  { name: "Renal Medicine", slug: "renal-medicine", blueprintCount: 14, description: "AKI, CKD, glomerulonephritis, electrolyte disorders and renal replacement therapy." },
  { name: "Respiratory Medicine", slug: "respiratory-medicine", blueprintCount: 14, description: "Asthma, COPD, interstitial lung disease, infection, malignancy and lung function." },
  { name: "Rheumatology", slug: "rheumatology", blueprintCount: 14, description: "Inflammatory arthritis, connective tissue disease, vasculitis and bone disease." },
];

const PLANS = [
  { name: "12 months", slug: "12-months", durationDays: 365, pricePence: 19999, badge: "Best value", sortOrder: 1, description: "For candidates planning ahead or sitting more than one diet." },
  { name: "6 months", slug: "6-months", durationDays: 182, pricePence: 14999, badge: null, sortOrder: 2, description: "Our most popular plan – comfortably covers one full revision cycle." },
  { name: "3 months", slug: "3-months", durationDays: 91, pricePence: 9999, badge: null, sortOrder: 3, description: "Focused, intensive revision in the final stretch before the exam." },
];

const TESTIMONIALS = [
  { name: "Dr Amani Al-Harbi", role: "Passed MRCP Part 1, first attempt", quote: "The mock exams felt exactly like the real thing. On exam day nothing surprised me – the pacing, the phrasing, the mix of specialties. I finished with time to spare.", rating: 5, sortOrder: 1 },
  { name: "Dr Tom Whitaker", role: "IMT2, Manchester", quote: "The analytics changed how I revised. Instead of re-reading everything I focused on my three weakest specialties and my score went up 14% in a month.", rating: 5, sortOrder: 2 },
  { name: "Dr Priya Nair", role: "Core Medical Trainee", quote: "Explanations for every wrong option is the killer feature. You learn five things from one question rather than one.", rating: 5, sortOrder: 3 },
];

type SeedQuestion = { specialty: string; topic: string; difficulty: number; stem: string; options: string[]; correctIndex: number; explanation: string; optionExplanations?: string[]; learningPoint?: string; tags?: string[] | string };
type SeedTopic = { specialty: string; title: string; slug: string; summary: string; readingMinutes: number; content: string };
type SeedArticle = { title: string; slug: string; excerpt: string; author: string; readingMinutes: number; coverEmoji: string; content: string };

function readJson<T>(file: string): T[] {
  const p = path.join(__dirname, "seed-data", file);
  if (!fs.existsSync(p)) {
    console.log(`  (skipping ${file} – not found)`);
    return [];
  }
  return JSON.parse(fs.readFileSync(p, "utf8")) as T[];
}

async function main() {
  console.log("Seeding MedAscend…");

  // Specialties
  for (const [i, s] of SPECIALTIES.entries()) {
    await db.specialty.upsert({ where: { slug: s.slug }, update: { name: s.name, blueprintCount: s.blueprintCount, description: s.description, sortOrder: i + 1 }, create: { ...s, sortOrder: i + 1 } });
  }
  const specialties = await db.specialty.findMany();
  const byName = new Map(specialties.map((s) => [s.name, s.id]));
  console.log(`  ✓ ${specialties.length} specialties`);

  // Plans
  for (const p of PLANS) await db.plan.upsert({ where: { slug: p.slug }, update: { ...p, features: "" }, create: { ...p, features: "" } });
  console.log(`  ✓ ${PLANS.length} plans`);

  // Testimonials
  if ((await db.testimonial.count()) === 0) {
    await db.testimonial.createMany({ data: TESTIMONIALS });
    console.log(`  ✓ ${TESTIMONIALS.length} testimonials`);
  }

  // Admin
  const email = (process.env.ADMIN_EMAIL ?? "admin@medascend.app").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const admin = await db.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: { email, name: process.env.ADMIN_NAME ?? "MedAscend Admin", passwordHash: await bcrypt.hash(password, 11), role: "ADMIN" },
  });
  console.log(`  ✓ admin ${email}`);

  // Questions
  const questions = readJson<SeedQuestion>("questions.json");
  if (questions.length && (await db.question.count()) === 0) {
    let n = 0;
    for (const q of questions) {
      const specialtyId = byName.get(q.specialty);
      if (!specialtyId || q.options.length !== 5) continue;
      await db.question.create({
        data: {
          specialtyId,
          topic: q.topic ?? "",
          stem: q.stem,
          explanation: q.explanation,
          learningPoint: q.learningPoint ?? "",
          difficulty: q.difficulty ?? 2,
          tags: Array.isArray(q.tags) ? q.tags.join(", ") : q.tags ?? "",
          status: "PUBLISHED",
          isTrial: true,
          createdById: admin.id,
          options: { create: q.options.map((text, i) => ({ label: "ABCDE"[i], text, explanation: q.optionExplanations?.[i] ?? "", isCorrect: i === q.correctIndex, order: i })) },
        },
      });
      n++;
    }
    console.log(`  ✓ ${n} questions`);

    // A sample past paper built from the seeded questions (blueprint weighted, ~40 Qs)
    const all = await db.question.findMany({ select: { id: true, specialtyId: true } });
    const totalBp = SPECIALTIES.reduce((s, x) => s + x.blueprintCount, 0);
    const picked: string[] = [];
    for (const s of specialties) {
      const want = Math.max(1, Math.round((s.blueprintCount / totalBp) * 40));
      picked.push(...all.filter((q) => q.specialtyId === s.id).sort(() => Math.random() - 0.5).slice(0, want).map((q) => q.id));
    }
    const paper = await db.paper.create({
      data: { title: "Sample Past Paper 1", slug: "sample-past-paper-1", type: "PAST_PAPER", description: "A blueprint-weighted sample paper built from the starter question set. Replace or extend it from the admin panel.", durationMinutes: Math.round(picked.length * 1.8), published: true, sortOrder: 1 },
    });
    await db.paperQuestion.createMany({ data: picked.map((questionId, i) => ({ paperId: paper.id, questionId, order: i })) });
    console.log(`  ✓ sample paper with ${picked.length} questions`);
  }

  // Textbook
  const topics = readJson<SeedTopic>("topics.json");
  let t = 0;
  for (const [i, tp] of topics.entries()) {
    const specialtyId = byName.get(tp.specialty);
    if (!specialtyId) continue;
    await db.textbookTopic.upsert({
      where: { slug: tp.slug },
      update: {},
      create: { specialtyId, title: tp.title, slug: tp.slug, summary: tp.summary, content: tp.content, readingMinutes: tp.readingMinutes ?? 6, published: true, sortOrder: i },
    });
    t++;
  }
  if (t) console.log(`  ✓ ${t} textbook topics`);

  // Articles
  const articles = readJson<SeedArticle>("articles.json");
  for (const a of articles) {
    await db.article.upsert({ where: { slug: a.slug }, update: {}, create: { ...a, published: true } });
  }
  if (articles.length) console.log(`  ✓ ${articles.length} articles`);

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
