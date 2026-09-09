import { Inbox } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { formatDateTime } from "@/lib/utils";
import { HandledToggle } from "./toggle";

export default async function AdminMessagesPage() {
  const messages = await db.contactMessage.findMany({ orderBy: [{ handled: "asc" }, { createdAt: "desc" }], take: 200 });
  return (
    <div>
      <PageHeader eyebrow="Business" title="Contact messages" description={`${messages.filter((m) => !m.handled).length} awaiting a reply.`} />
      {messages.length === 0 ? <EmptyState icon={<Inbox className="h-5 w-5" />} title="No messages yet" /> : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className={`rounded-2xl border bg-card p-5 ${m.handled ? "border-line opacity-70" : "border-amber-300"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display font-bold">{m.subject}</p>
                  <p className="text-sm text-muted">{m.name} · <a href={`mailto:${m.email}?subject=Re:%20${encodeURIComponent(m.subject)}`} className="underline">{m.email}</a> · {formatDateTime(m.createdAt)}</p>
                </div>
                <HandledToggle id={m.id} handled={m.handled} />
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
