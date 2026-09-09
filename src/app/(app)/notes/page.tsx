import type { Metadata } from "next";
import { StickyNote } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { NotesBoard } from "./notes-board";

export const metadata: Metadata = { title: "Notes" };

export default async function NotesPage() {
  const user = await requireUser();
  const notes = await db.note.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { question: { select: { id: true, stem: true, specialty: { select: { name: true } } } } },
  });
  const items = notes.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    label: n.label,
    updatedAt: n.updatedAt.toISOString(),
    question: n.question ? { id: n.question.id, stem: n.question.stem, specialty: n.question.specialty.name } : null,
  }));
  return (
    <div>
      <PageHeader eyebrow="Study area" title="Notes" description="Sticky notes for mnemonics, key concepts and weak areas. Notes you write on questions appear here too." />
      <NotesBoard initial={items} />
      {items.length === 0 && <EmptyState className="mt-6" icon={<StickyNote className="h-5 w-5" />} title="No notes yet" description="Create your first note above, or add notes to questions while practising." />}
    </div>
  );
}
