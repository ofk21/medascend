import type { Metadata } from "next";
import Link from "next/link";
import { History as HistoryIcon, PlayCircle, FileText, Timer } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, EmptyState, Pagination } from "@/components/ui/misc";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatDuration, pct } from "@/lib/utils";
import { abandonSession } from "./actions";

export const metadata: Metadata = { title: "Session history" };

const PAGE = 20;

export default async function HistoryPage({ searchParams }: PageProps<"/history">) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const user = await requireUser();
  const [sessions, total] = await Promise.all([
    db.session.findMany({ where: { userId: user.id }, orderBy: { startedAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE }),
    db.session.count({ where: { userId: user.id } }),
  ]);
  const icon = (t: string) => (t === "PRACTICE" ? <PlayCircle className="h-5 w-5" /> : t === "MOCK" ? <Timer className="h-5 w-5" /> : <FileText className="h-5 w-5" />);

  return (
    <div>
      <PageHeader eyebrow="History" title="All sessions" description="Every practice session, paper and mock you have started." />
      {sessions.length === 0 ? (
        <EmptyState icon={<HistoryIcon className="h-5 w-5" />} title="No sessions yet" action={<Button href="/qbank">Create a session</Button>} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <table className="w-full text-sm">
            <thead className="bg-bg-soft text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Session</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Mode</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Started</th>
                <th className="px-4 py-3 font-semibold">Score</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-bg-soft/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-bg-soft text-muted">{icon(s.type)}</span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{s.title}</p>
                        <p className="text-xs text-muted">{s.totalQuestions} questions{s.timeLimitSec ? ` · ${formatDuration(s.timeLimitSec)}` : ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted sm:table-cell">{s.mode === "TUTOR" ? "Tutor" : "Timed"}</td>
                  <td className="hidden px-4 py-3 text-muted md:table-cell">{formatDateTime(s.startedAt)}</td>
                  <td className="px-4 py-3 font-display font-bold">{s.status === "COMPLETED" ? `${pct(s.correctCount, s.totalQuestions)}%` : `${s.answeredCount}/${s.totalQuestions}`}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(s.status)}>{s.status === "IN_PROGRESS" ? "In progress" : s.status.charAt(0) + s.status.slice(1).toLowerCase()}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    {s.status === "COMPLETED" ? (
                      <Link href={`/session/${s.id}/results`} className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">Review</Link>
                    ) : s.status === "IN_PROGRESS" ? (
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/session/${s.id}`} className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">Resume</Link>
                        <form action={abandonSession.bind(null, s.id)}>
                          <button className="text-xs text-muted hover:text-red-600">Abandon</button>
                        </form>
                      </div>
                    ) : (
                      <Link href={`/session/${s.id}/results`} className="text-sm text-muted hover:underline">View</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={Math.ceil(total / PAGE)} hrefFor={(p) => `/history?page=${p}`} />
    </div>
  );
}
