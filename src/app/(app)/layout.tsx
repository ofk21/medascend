import { AppSidebar } from "@/components/app/sidebar";
import { requireUser, getAccess } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const access = getAccess(user);
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AppSidebar
        user={{ name: user.name, email: user.email, role: user.role }}
        access={{
          hasFullAccess: access.hasFullAccess,
          trialActive: access.trialActive,
          trialEndsAt: access.trialEndsAt?.toISOString() ?? null,
          planName: access.planName,
          subscriptionEndsAt: access.subscriptionEndsAt?.toISOString() ?? null,
        }}
      />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
