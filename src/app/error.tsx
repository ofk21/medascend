"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="max-w-md text-center">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-8 font-display text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-muted">An unexpected error occurred. Please try again – if it keeps happening, contact support and quote the reference below.</p>
        {error.digest && <p className="mt-2 font-mono text-xs text-muted">Ref: {error.digest}</p>}
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button href="/" variant="outline">Home</Button>
        </div>
      </div>
    </div>
  );
}
