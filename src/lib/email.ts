import "server-only";

/**
 * Minimal email sender. Uses Resend's REST API when RESEND_API_KEY is set,
 * otherwise logs the message to the server console (useful in development).
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "MedAscend <noreply@medascend.app>";
  if (!key) {
    console.info(`\n[email:dev] To: ${to}\nSubject: ${subject}\n${html.replace(/<[^>]+>/g, "")}\n`);
    return { ok: true, dev: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    console.error("[email] failed", res.status, await res.text());
    return { ok: false };
  }
  return { ok: true };
}
