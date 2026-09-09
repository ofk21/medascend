import { NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { getCurrentUser, getAccess } from "@/lib/auth";

const schema = z.object({
  questionId: z.string(),
  message: z.string().min(1).max(2000),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(6000) })).max(12).default([]),
  revealed: z.boolean().default(false),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (!getAccess(user).hasFullAccess) return NextResponse.json({ error: "The AI tutor is available on paid plans." }, { status: 403 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "The AI tutor is not configured on this server." }, { status: 503 });

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { questionId, message, history, revealed } = body.data;

  const q = await db.question.findUnique({ where: { id: questionId }, include: { options: { orderBy: { order: "asc" } }, specialty: true } });
  if (!q) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  const optionText = q.options.map((o) => `${o.label}. ${o.text}`).join("\n");
  const answerBlock = revealed
    ? `The correct answer is ${q.options.find((o) => o.isCorrect)?.label}. Official explanation: ${q.explanation}\nOption notes: ${q.options.map((o) => `${o.label}: ${o.explanation}`).join(" | ")}`
    : "The learner has NOT yet answered. Do not reveal which option is correct. Guide with Socratic hints, clarify concepts and definitions, and help them reason – but never state or strongly imply the answer.";

  const system = `You are the MedAscend AI tutor helping a UK doctor revise for the MRCP(UK) Part 1 exam. Be accurate, concise (under 200 words unless asked for depth), UK-guideline oriented (NICE, BNF, Resuscitation Council UK) and warm but direct. Use plain prose and short bullet lists; no headings. Never invent guideline numbers. If unsure, say so.

Current question (${q.specialty.name}, topic: ${q.topic}):
${q.stem}

Options:
${optionText}

${answerBlock}`;

  const client = new Anthropic();
  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1500,
      system,
      messages: [...history.map((h) => ({ role: h.role, content: h.content })), { role: "user", content: message }],
    });
    if (response.stop_reason === "refusal") {
      return NextResponse.json({ reply: "I can't help with that particular request, but I'm happy to explain the medicine behind this question." });
    }
    const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    return NextResponse.json({ reply: text || "Sorry, I could not produce an answer. Please try again." });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return NextResponse.json({ error: "The tutor is busy right now. Please try again in a moment." }, { status: 429 });
    if (err instanceof Anthropic.AuthenticationError) return NextResponse.json({ error: "The AI tutor is misconfigured on this server." }, { status: 503 });
    console.error("[tutor]", err);
    return NextResponse.json({ error: "The tutor could not respond. Please try again." }, { status: 500 });
  }
}
