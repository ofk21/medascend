"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startPaper, startMock } from "@/app/(app)/qbank/actions";

export function StartPaperButton({ paperId, disabled }: { paperId: string; disabled?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <Button
        size="sm"
        disabled={disabled}
        loading={pending}
        onClick={() =>
          start(async () => {
            const r = await startPaper(paperId);
            if ("error" in r) setErr(r.error);
            else router.push(`/session/${r.sessionId}`);
          })
        }
      >
        <Play className="h-4 w-4" /> Start paper
      </Button>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}

export function StartMockButton({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <Button
        size="lg"
        disabled={disabled}
        loading={pending}
        onClick={() =>
          start(async () => {
            const r = await startMock();
            if ("error" in r) setErr(r.error);
            else router.push(`/session/${r.sessionId}`);
          })
        }
      >
        <Play className="h-4 w-4" /> Start mock exam
      </Button>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}
