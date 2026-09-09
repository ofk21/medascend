import Link from "next/link";
import { Plus, Upload, Search } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader, Pagination } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { QuestionsTable } from "./questions-table";

const PAGE = 25;

export default async function AdminQuestionsPage({ searchParams }: PageProps<"/admin/questions">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const specialtyId = typeof sp.specialty === "string" ? sp.specialty : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const difficulty = typeof sp.difficulty === "string" ? Number(sp.difficulty) : 0;
  const trial = typeof sp.trial === "string" ? sp.trial : "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const where = {
    ...(q ? { OR: [{ stem: { contains: q, mode: "insensitive" as const } }, { topic: { contains: q, mode: "insensitive" as const } }, { tags: { contains: q, mode: "insensitive" as const } }, { id: q }] } : {}),
    ...(specialtyId ? { specialtyId } : {}),
    ...(status ? { status } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(trial === "yes" ? { isTrial: true } : trial === "no" ? { isTrial: false } : {}),
  };

  const [items, total, specialties, counts] = await Promise.all([
    db.question.findMany({ where, orderBy: { updatedAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE, include: { specialty: { select: { name: true } } } }),
    db.question.count({ where }),
    db.specialty.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.question.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;

  const hrefFor = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (specialtyId) u.set("specialty", specialtyId);
    if (status) u.set("status", status);
    if (difficulty) u.set("difficulty", String(difficulty));
    if (trial) u.set("trial", trial);
    u.set("page", String(p));
    return `/admin/questions?${u}`;
  };

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Questions"
        description={`${countOf("PUBLISHED")} published · ${countOf("DRAFT")} drafts · ${countOf("ARCHIVED")} archived`}
        actions={
          <>
            <Button href="/admin/questions/import" variant="outline"><Upload className="h-4 w-4" /> Import</Button>
            <Button href="/admin/questions/new"><Plus className="h-4 w-4" /> New question</Button>
          </>
        }
      />
      {sp.deleted && <p className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-800">Question deleted.</p>}
      <form className="mb-4 grid gap-2 rounded-2xl border border-line bg-card p-3 sm:grid-cols-[1fr_200px_140px_130px_120px_auto]" action="/admin/questions">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input name="q" defaultValue={q} placeholder="Search stem, topic, tag or ID" className="pl-9" />
        </div>
        <Select name="specialty" defaultValue={specialtyId}>
          <option value="">All specialties</option>
          {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <Select name="status" defaultValue={status}>
          <option value="">Any status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
        <Select name="difficulty" defaultValue={difficulty || ""}>
          <option value="">Any difficulty</option>
          <option value="1">Easy</option>
          <option value="2">Moderate</option>
          <option value="3">Hard</option>
        </Select>
        <Select name="trial" defaultValue={trial}>
          <option value="">Trial: any</option>
          <option value="yes">Trial only</option>
          <option value="no">Non-trial</option>
        </Select>
        <Button type="submit" variant="secondary">Filter</Button>
      </form>
      <p className="mb-2 text-sm text-muted">{total.toLocaleString()} result{total === 1 ? "" : "s"}</p>
      <QuestionsTable items={items.map((i) => ({ id: i.id, stem: i.stem, specialty: i.specialty.name, topic: i.topic, difficulty: i.difficulty, status: i.status, isTrial: i.isTrial, timesAnswered: i.timesAnswered, timesCorrect: i.timesCorrect, updatedAt: i.updatedAt.toISOString() }))} />
      <Pagination page={page} totalPages={Math.ceil(total / PAGE)} hrefFor={hrefFor} />
      {total === 0 && (
        <div className="mt-6 text-center text-sm text-muted">
          No questions match. <Link href="/admin/questions/new" className="font-semibold text-brand-700 hover:underline">Create one</Link> or <Link href="/admin/questions/import" className="font-semibold text-brand-700 hover:underline">import in bulk</Link>.
        </div>
      )}
    </div>
  );
}
