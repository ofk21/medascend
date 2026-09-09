import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/misc";
import { TestimonialsEditor } from "./editor";

export default async function AdminTestimonialsPage() {
  const items = await db.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <PageHeader eyebrow="Marketing" title="Testimonials" description="Shown on the homepage. The first three published testimonials appear." />
      <TestimonialsEditor items={items} />
    </div>
  );
}
