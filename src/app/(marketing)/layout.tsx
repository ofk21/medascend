import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { getCurrentUser } from "@/lib/auth";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader loggedIn={!!user} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
