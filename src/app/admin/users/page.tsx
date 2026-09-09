import Link from "next/link";
import { Search } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader, Pagination } from "@/components/ui/misc";
import { Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const PAGE = 25;

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const access = typeof sp.access === "string" ? sp.access : "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const now = new Date();
  const where = {
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { email: { contains: q, mode: "insensitive" as const } }] } : {}),
    ...(access === "paid" ? { subscriptions: { some: { status: "ACTIVE", endsAt: { gt: now } } } } : access === "trial" ? { subscriptions: { none: { status: "ACTIVE", endsAt: { gt: now } } }, trialEndsAt: { gt: now } } : access === "expired" ? { subscriptions: { none: { status: "ACTIVE", endsAt: { gt: now } } }, OR: [{ trialEndsAt: null }, { trialEndsAt: { lte: now } }] } : access === "admin" ? { role: "ADMIN" } : {}),
  };
  const [users, total] = await Promise.all([
    db.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE, include: { subscriptions: { where: { status: "ACTIVE", endsAt: { gt: now } }, orderBy: { endsAt: "desc" }, take: 1, include: { plan: { select: { name: true } } } }, _count: { select: { sessions: true } } } }),
    db.user.count({ where }),
  ]);
  const hrefFor = (p: number) => `/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), ...(access ? { access } : {}), page: String(p) })}`;

  return (
    <div>
      <PageHeader eyebrow="Business" title="Users" description={`${total.toLocaleString()} account${total === 1 ? "" : "s"}`} />
      {sp.deleted && <p className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-800">User deleted.</p>}
      <form className="mb-4 grid gap-2 rounded-2xl border border-line bg-card p-3 sm:grid-cols-[1fr_180px_auto]" action="/admin/users">
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><Input name="q" defaultValue={q} placeholder="Search name or email" className="pl-9" /></div>
        <Select name="access" defaultValue={access}><option value="">All users</option><option value="paid">Paid</option><option value="trial">On trial</option><option value="expired">Expired / no access</option><option value="admin">Admins</option></Select>
        <Button type="submit" variant="secondary">Filter</Button>
      </form>
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="w-full text-sm">
          <thead className="bg-bg-soft text-left text-xs uppercase tracking-wider text-muted"><tr><th className="px-4 py-3 font-semibold">User</th><th className="px-4 py-3 font-semibold">Access</th><th className="px-4 py-3 font-semibold">Sessions</th><th className="px-4 py-3 font-semibold">Joined</th><th className="px-4 py-3 font-semibold">Last active</th></tr></thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => {
              const sub = u.subscriptions[0];
              const trial = u.trialEndsAt && u.trialEndsAt > now;
              return (
                <tr key={u.id} className="hover:bg-bg-soft/50">
                  <td className="px-4 py-3"><Link href={`/admin/users/${u.id}`} className="font-semibold hover:underline">{u.name}</Link> {u.role === "ADMIN" && <Badge tone="purple" className="ml-1">Admin</Badge>}<p className="text-xs text-muted">{u.email}</p></td>
                  <td className="px-4 py-3">{sub ? <Badge tone="green">{sub.plan.name} · to {formatDate(sub.endsAt)}</Badge> : trial ? <Badge tone="amber">Trial</Badge> : <Badge tone="neutral">None</Badge>}</td>
                  <td className="px-4 py-3 text-muted">{u._count.sessions}</td>
                  <td className="px-4 py-3 text-xs text-muted">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-xs text-muted">{formatDate(u.lastActiveAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={Math.ceil(total / PAGE)} hrefFor={hrefFor} />
    </div>
  );
}
