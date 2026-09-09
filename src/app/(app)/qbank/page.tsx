import type { Metadata } from "next";
import { requireUser, getAccess } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserQuestionHistory, trialQuestionsRemaining } from "@/lib/sessions";
import { PageHeader } from "@/components/ui/misc";
import { TestBuilder } from "./test-builder";

export const metadata: Metadata = { title: "Qbank – create a session" };

export default async function QbankPage({ searchParams }: PageProps<"/qbank">) {
  const sp = await searchParams;
  const user = await requireUser();
  const access = getAccess(user);
  const where = access.hasFullAccess ? { status: "PUBLISHED" } : { status: "PUBLISHED", isTrial: true };

  const [specialties, questions, history, flags, trialLeft] = await Promise.all([
    db.specialty.findMany({ orderBy: { sortOrder: "asc" } }),
    db.question.findMany({ where, select: { id: true, specialtyId: true, difficulty: true } }),
    getUserQuestionHistory(user.id),
    db.flag.findMany({ where: { userId: user.id }, select: { questionId: true } }),
    trialQuestionsRemaining(user),
  ]);
  const flagged = new Set(flags.map((f) => f.questionId));

  const counts = specialties.map((s) => {
    const qs = questions.filter((q) => q.specialtyId === s.id);
    let unseen = 0, incorrect = 0, correct = 0, flaggedN = 0;
    for (const q of qs) {
      const h = history.get(q.id);
      if (h === undefined) unseen++;
      else if (h) correct++;
      else incorrect++;
      if (flagged.has(q.id)) flaggedN++;
    }
    return { id: s.id, name: s.name, total: qs.length, unseen, incorrect, correct, flagged: flaggedN };
  });

  const preSpecialty = typeof sp.specialty === "string" ? sp.specialty.split(",") : [];
  const preFamiliarity = typeof sp.familiarity === "string" ? sp.familiarity.split(",") : [];

  return (
    <div>
      <PageHeader eyebrow="Qbank" title="Create a practice session" description="Choose what to practise and how. Sessions can contain up to 100 questions." />
      <TestBuilder
        specialties={counts}
        initialSpecialties={preSpecialty}
        initialFamiliarity={preFamiliarity}
        hasFullAccess={access.hasFullAccess}
        trialLeft={Number.isFinite(trialLeft) ? trialLeft : null}
      />
    </div>
  );
}
