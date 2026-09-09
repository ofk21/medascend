import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/misc";
import { PaperForm } from "../paper-form";

export default function NewPaperPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/papers" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> Papers</Link>
      <div className="mt-3"><PageHeader eyebrow="Content" title="New paper" description="Create the paper first, then add questions." /></div>
      <PaperForm />
    </div>
  );
}
