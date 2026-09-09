import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/misc";
import { SpecialtyEditor } from "./editor";

export default async function SpecialtiesPage() {
  const specialties = await db.specialty.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { questions: true, textbookTopics: true } } } });
  const total = specialties.reduce((s, x) => s + x.blueprintCount, 0);
  return (
    <div>
      <PageHeader eyebrow="Content" title="Specialties & blueprint" description={`Blueprint weights drive mock composition and the readiness score. Current total: ${total} (the real exam has 200).`} />
      <SpecialtyEditor items={specialties.map((s) => ({ id: s.id, name: s.name, blueprintCount: s.blueprintCount, description: s.description ?? "", sortOrder: s.sortOrder, questions: s._count.questions, topics: s._count.textbookTopics }))} />
    </div>
  );
}
