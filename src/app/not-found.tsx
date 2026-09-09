import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="text-center">
        <div className="flex justify-center"><Logo /></div>
        <p className="mt-8 font-display text-7xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-2 font-display text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-muted">The page you are looking for does not exist or has moved.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button href="/">Home</Button>
          <Button href="/dashboard" variant="outline">Dashboard</Button>
        </div>
        <p className="mt-6 text-sm text-muted">Need help? <Link href="/help" className="underline">Visit the help centre</Link></p>
      </div>
    </div>
  );
}
