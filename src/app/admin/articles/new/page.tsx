import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/misc";
import { ArticleForm } from "../article-form";

export default function NewArticlePage() {
  return (
    <div>
      <Link href="/admin/articles" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> Articles</Link>
      <div className="mt-3"><PageHeader eyebrow="Marketing" title="New article" /></div>
      <ArticleForm />
    </div>
  );
}
