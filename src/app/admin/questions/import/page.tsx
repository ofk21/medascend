import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/misc";
import { ImportForm } from "./import-form";

export default async function ImportPage() {
  const specialties = await db.specialty.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true } });
  return (
    <div>
      <Link href="/admin/questions" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> Questions</Link>
      <div className="mt-3">
        <PageHeader eyebrow="Content" title="Bulk import questions" description="Paste or upload a JSON array. Each item becomes one question with five options." />
      </div>
      <ImportForm specialties={specialties.map((s) => s.name)} />
    </div>
  );
}
