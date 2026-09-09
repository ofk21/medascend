"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flag, Clock, ChevronLeft, ChevronRight, StickyNote, Sparkles, X, Check, AlertTriangle, LayoutGrid, Send, Lightbulb, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, difficultyTone } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/misc";
import { Markdown } from "@/components/ui/markdown";
import { cn, formatDuration, pct } from "@/lib/utils";
import { DIFFICULTY_LABEL, BRAND } from "@/lib/constants";

export type PlayerQuestion = {
  order: number;
  questionId: string;
  specialty: string;
  topic: string;
  difficulty: number;
  stem: string;
  options: { id: string; label: string; text: string; explanation?: string }[];
  selectedOptionId: string | null;
  isCorrect: boolean | null;
  answered: boolean;
  correctOptionId: string | null;
  explanation: string | null;
  learningPoint: string | null;
  peer: { answered: number; correct: number } | null;
  flagged: boolean;
  note: string;
};

type Props = { sessionId: string; title: string; mode: "TUTOR" | "TIMED"; deadline: string | null; initialIndex: number; questions: PlayerQuestion[]; tutorAvailable: boolean };

export function Player({ sessionId, title, mode, deadline, initialIndex, questions: initial, tutorAvailable }: Props) {
  const router = useRouter();
  const [questions, setQuestions] = useState(initial);
  const [index, setIndex] = useState(initialIndex);
  const [choice, setChoice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const startedAt = useRef<number>(0);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = questions[index];
  const total = questions.length;
  const answeredCount = questions.filter((x) => x.answered).length;
  const isLast = index === total - 1;

  const finishRef = useRef<() => Promise<void>>(async () => {});

  const finish = useCallback(async () => {
    if (finishing) return;
    setFinishing(true);
    await fetch(`/api/session/${sessionId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "finish" }) });
    router.push(`/session/${sessionId}/results`);
  }, [finishing, router, sessionId]);
  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  // Countdown timer – auto-submits when it reaches zero
  useEffect(() => {
    if (!deadline) return;
    const end = new Date(deadline).getTime();
    let fired = false;
    const tick = () => {
      const r = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setRemaining(r);
      if (r === 0 && !fired) {
        fired = true;
        void finishRef.current();
      }
    };
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [deadline]);

  // Persist position & restart the per-question clock
  useEffect(() => {
    startedAt.current = Date.now();
    void fetch(`/api/session/${sessionId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "position", index }) });
  }, [index, sessionId]);

  const goTo = useCallback((i: number) => {
    setChoice(null);
    setIndex(i);
  }, []);

  const patch = useCallback((order: number, data: Partial<PlayerQuestion>) => {
    setQuestions((qs) => qs.map((x) => (x.order === order ? { ...x, ...data } : x)));
  }, []);

  async function submit() {
    if (!choice || q.answered || submitting) return;
    setSubmitting(true);
    setError(null);
    const timeSpentSec = Math.round((Date.now() - startedAt.current) / 1000);
    try {
      const res = await fetch(`/api/session/${sessionId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "answer", order: q.order, optionId: choice, timeSpentSec }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save answer");
      if (mode === "TUTOR") {
        patch(q.order, {
          answered: true,
          selectedOptionId: choice,
          isCorrect: data.isCorrect,
          correctOptionId: data.correctOptionId,
          explanation: data.explanation,
          learningPoint: data.learningPoint,
          peer: data.peer,
          options: q.options.map((o) => ({ ...o, explanation: data.optionExplanations?.[o.id] })),
        });
      } else {
        patch(q.order, { answered: true, selectedOptionId: choice });
        if (!isLast) goTo(index + 1);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleFlag() {
    const flagged = !q.flagged;
    patch(q.order, { flagged });
    await fetch(`/api/session/${sessionId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "flag", questionId: q.questionId, flagged }) });
  }

  const saveNote = useCallback(
    (questionId: string, body: string) => {
      if (noteTimer.current) clearTimeout(noteTimer.current);
      noteTimer.current = setTimeout(() => {
        void fetch(`/api/session/${sessionId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "note", questionId, body }) });
      }, 600);
    },
    [sessionId],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (["TEXTAREA", "INPUT"].includes(target.tagName)) return;
      const k = e.key.toUpperCase();
      const idx = ["A", "B", "C", "D", "E"].indexOf(k);
      const num = ["1", "2", "3", "4", "5"].indexOf(k);
      if (!q.answered && (idx >= 0 || num >= 0)) {
        const o = q.options[idx >= 0 ? idx : num];
        if (o) setChoice(o.id);
      } else if (e.key === "Enter") {
        if (!q.answered && choice) void submit();
        else if (q.answered && !isLast) goTo(index + 1);
      } else if (e.key === "ArrowRight" && !isLast) goTo(index + 1);
      else if (e.key === "ArrowLeft" && index > 0) goTo(index - 1);
      else if (k === "F") void toggleFlag();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, choice, isLast, index]);

  const selected = q.answered ? q.selectedOptionId : choice;
  const lowTime = remaining !== null && remaining < 300;

  return (
    <div className="-mx-4 -my-6 flex min-h-screen flex-col sm:-mx-6 lg:-mx-8 lg:-my-8">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-line bg-card/95 backdrop-blur lg:top-0">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <Link href="/dashboard" className="hidden text-sm font-medium text-muted hover:text-fg sm:block">← Exit</Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{title}</p>
            <div className="mt-1 h-1.5 w-full max-w-xs rounded-full bg-bg-soft">
              <div className="h-1.5 rounded-full bg-brand-600 transition-all" style={{ width: `${(answeredCount / total) * 100}%` }} />
            </div>
          </div>
          <span className="rounded-lg bg-bg-soft px-2.5 py-1 text-xs font-semibold">{answeredCount}/{total} answered</span>
          {remaining !== null && (
            <span className={cn("inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-sm font-semibold", lowTime ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300" : "bg-bg-soft")}>
              <Clock className="h-4 w-4" /> {formatDuration(remaining)}
            </span>
          )}
          <button onClick={() => setShowGrid((v) => !v)} className="grid h-9 w-9 place-items-center rounded-lg border border-line hover:bg-bg-soft" aria-label="Question navigator" title="Question navigator">
            <LayoutGrid className="h-4 w-4" />
          </button>
          <Button variant="outline" size="sm" onClick={() => setConfirmFinish(true)}>
            Finish
          </Button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6 sm:px-6">
        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="rounded-2xl border border-line bg-card shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-bold text-white">Q {index + 1} / {total}</span>
                <span className="text-sm font-medium text-muted">{q.specialty}{q.topic ? ` · ${q.topic}` : ""}</span>
                <Badge tone={difficultyTone(q.difficulty)}>{DIFFICULTY_LABEL[q.difficulty]}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={toggleFlag} className={cn("inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition", q.flagged ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200" : "text-muted hover:bg-bg-soft")} title="Flag (F)">
                  <Flag className={cn("h-4 w-4", q.flagged && "fill-current")} /> <span className="hidden sm:inline">{q.flagged ? "Flagged" : "Flag"}</span>
                </button>
                <button onClick={() => setShowNotes((v) => !v)} className={cn("inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition", showNotes || q.note ? "bg-brand-50 text-brand-800 dark:bg-brand-950/60 dark:text-brand-200" : "text-muted hover:bg-bg-soft")}>
                  <StickyNote className="h-4 w-4" /> <span className="hidden sm:inline">Note</span>
                </button>
                {tutorAvailable && (
                  <button onClick={() => setShowTutor((v) => !v)} className={cn("inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition", showTutor ? "bg-brand-600 text-white" : "text-muted hover:bg-bg-soft")}>
                    <Sparkles className="h-4 w-4" /> <span className="hidden sm:inline">AI tutor</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <p className="whitespace-pre-line text-[15px] leading-relaxed sm:text-base">{q.stem}</p>

              <ul className="mt-6 space-y-2.5" role="radiogroup" aria-label="Answer options">
                {q.options.map((o) => {
                  const isSel = selected === o.id;
                  const revealed = q.answered && q.correctOptionId !== null;
                  const isCorrectOpt = revealed && q.correctOptionId === o.id;
                  const isWrongSel = revealed && isSel && !isCorrectOpt;
                  return (
                    <li key={o.id}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={isSel}
                        disabled={q.answered}
                        onClick={() => setChoice(o.id)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-[15px] transition disabled:cursor-default",
                          !q.answered && (isSel ? "border-brand-600 bg-brand-50 ring-2 ring-brand-600/30 dark:bg-brand-950/50" : "border-line hover:border-brand-300 hover:bg-bg-soft"),
                          q.answered && !revealed && (isSel ? "border-brand-600 bg-brand-50 dark:bg-brand-950/50" : "border-line opacity-80"),
                          isCorrectOpt && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                          isWrongSel && "border-red-400 bg-red-50 dark:bg-red-950/40",
                          revealed && !isCorrectOpt && !isSel && "border-line opacity-70",
                        )}
                      >
                        <span className={cn("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold", isCorrectOpt ? "bg-emerald-600 text-white" : isWrongSel ? "bg-red-500 text-white" : isSel ? "bg-brand-600 text-white" : "bg-bg-soft text-muted")}>
                          {isCorrectOpt ? <Check className="h-4 w-4" /> : isWrongSel ? <X className="h-4 w-4" /> : o.label}
                        </span>
                        <span className="flex-1">
                          <span className="block">{o.text}</span>
                          {revealed && o.explanation && <span className={cn("mt-1 block text-sm", isCorrectOpt ? "text-emerald-800 dark:text-emerald-200" : "text-muted")}>{o.explanation}</span>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {error && <p className="mt-4 inline-flex items-center gap-2 text-sm text-red-600"><AlertTriangle className="h-4 w-4" /> {error}</p>}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="hidden items-center gap-2 text-xs text-muted sm:flex">
                  <Kbd>A</Kbd>–<Kbd>E</Kbd> select · <Kbd>Enter</Kbd> {q.answered ? "next" : "submit"} · <Kbd>F</Kbd> flag
                </div>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <Button variant="outline" onClick={() => goTo(Math.max(0, index - 1))} disabled={index === 0} aria-label="Previous question">
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </Button>
                  {!q.answered ? (
                    <Button onClick={submit} disabled={!choice} loading={submitting} className="flex-1 sm:flex-none sm:min-w-40">
                      {mode === "TIMED" ? (isLast ? "Save answer" : "Save & next") : "Submit answer"}
                    </Button>
                  ) : isLast ? (
                    <Button onClick={() => setConfirmFinish(true)} className="flex-1 sm:flex-none sm:min-w-40">
                      Finish session
                    </Button>
                  ) : (
                    <Button onClick={() => goTo(index + 1)} className="flex-1 sm:flex-none sm:min-w-40">
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                  {!q.answered && mode === "TIMED" && (
                    <Button variant="ghost" onClick={() => !isLast && goTo(index + 1)} disabled={isLast}>
                      Skip
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Explanation (tutor mode) */}
            {q.answered && q.explanation && (
              <div className="border-t border-line bg-bg-soft/50 p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold", q.isCorrect ? "bg-emerald-600 text-white" : "bg-red-500 text-white")}>
                    {q.isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />} {q.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                  {q.peer && q.peer.answered > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted"><Users className="h-4 w-4" /> {pct(q.peer.correct, q.peer.answered)}% of users answered correctly</span>
                  )}
                </div>
                <div className="mt-4">
                  <Markdown content={q.explanation} small />
                </div>
                {q.learningPoint && (
                  <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700/40 dark:bg-amber-500/10 dark:text-amber-100">
                    <Lightbulb className="mt-0.5 h-4.5 w-4.5 shrink-0" />
                    <p><span className="font-semibold">Learning point: </span>{q.learningPoint}</p>
                  </div>
                )}
                <p className="mt-4 text-xs text-muted">
                  Spotted an error? <a className="underline" href={`mailto:${BRAND.supportEmail}?subject=Question%20report%20${q.questionId}`}>Report a problem</a>
                </p>
              </div>
            )}

            {/* Notes */}
            {showNotes && (
              <div className="border-t border-line p-5 sm:p-7">
                <label className="mb-2 block text-sm font-semibold">Your note on this question</label>
                <textarea
                  value={q.note}
                  onChange={(e) => {
                    patch(q.order, { note: e.target.value });
                    saveNote(q.questionId, e.target.value);
                  }}
                  placeholder="Mnemonics, why you got it wrong, links to the textbook…"
                  className="min-h-24 w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
                />
                <p className="mt-1 text-xs text-muted">Saved automatically. Find all notes under Notes in the sidebar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Tutor side panel */}
        {showTutor && tutorAvailable && <TutorPanel key={q.questionId} questionId={q.questionId} revealed={q.answered && q.correctOptionId !== null} onClose={() => setShowTutor(false)} />}
      </div>

      {/* Navigator */}
      {showGrid && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink-900/40 p-4 sm:items-center" onClick={() => setShowGrid(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-line bg-card p-5 shadow-lift" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Question navigator</h3>
              <button onClick={() => setShowGrid(false)} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-bg-soft"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-8 gap-2 sm:grid-cols-10">
              {questions.map((x, i) => (
                <button
                  key={x.order}
                  onClick={() => {
                    goTo(i);
                    setShowGrid(false);
                  }}
                  className={cn(
                    "relative grid h-9 place-items-center rounded-lg border text-xs font-semibold",
                    i === index && "ring-2 ring-brand-600 ring-offset-1",
                    x.answered ? (x.isCorrect === true ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200" : x.isCorrect === false ? "border-red-400 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200" : "border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-950/40 dark:text-brand-200") : "border-line text-muted",
                  )}
                >
                  {i + 1}
                  {x.flagged && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400" />}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-line" /> Unanswered</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-brand-100 border border-brand-500" /> Answered</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-400" /> Flagged</span>
            </div>
          </div>
        </div>
      )}

      {/* Finish confirm */}
      {confirmFinish && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/50 p-4" onClick={() => setConfirmFinish(false)}>
          <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-bold">Finish this session?</h3>
            <p className="mt-2 text-sm text-muted">
              You have answered {answeredCount} of {total} questions.{answeredCount < total ? ` ${total - answeredCount} unanswered question${total - answeredCount === 1 ? "" : "s"} will be marked as not attempted.` : ""}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmFinish(false)}>Keep going</Button>
              <Button onClick={finish} loading={finishing}>Finish & see results</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TutorPanel({ questionId, revealed, onClose }: { questionId: string; revealed: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/tutor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId, message: text, history: messages, revealed }) });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: res.ok ? data.reply : `⚠️ ${data.error ?? "Something went wrong."}` }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "⚠️ Network error – please try again." }]);
    } finally {
      setBusy(false);
    }
  }

  const suggestions = revealed
    ? ["Why are the other options wrong?", "Explain the underlying mechanism", "Give me a mnemonic for this"]
    : ["What is this question really testing?", "Define the key terms in the stem", "Give me a hint without the answer"];

  return (
    <aside className="hidden w-80 shrink-0 flex-col rounded-2xl border border-line bg-card shadow-soft lg:flex xl:w-96" style={{ maxHeight: "calc(100vh - 8rem)", position: "sticky", top: "5rem" }}>
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="inline-flex items-center gap-2 font-display text-sm font-bold"><Sparkles className="h-4 w-4 text-brand-600" /> AI tutor</p>
        <button onClick={onClose} aria-label="Close tutor" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-bg-soft"><X className="h-4 w-4" /></button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4 scroll-thin">
        {messages.length === 0 && (
          <div className="text-sm text-muted">
            <p>Ask anything about this question. {revealed ? "I can explain each option in depth." : "I won't reveal the answer before you commit."}</p>
            <div className="mt-3 flex flex-col gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-xl border border-line px-3 py-2 text-left text-xs font-medium hover:bg-bg-soft">{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed", m.role === "user" ? "ml-auto bg-brand-600 text-white" : "bg-bg-soft")}>
            {m.role === "assistant" ? <Markdown content={m.content} small className="text-sm [&_p]:my-1" /> : m.content}
          </div>
        ))}
        {busy && <div className="w-16 rounded-2xl bg-bg-soft px-3.5 py-2.5 text-sm text-muted">…</div>}
        <div ref={bottom} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="flex gap-2 border-t border-line p-3"
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the tutor…" className="flex-1 rounded-xl border border-line bg-card px-3 py-2 text-sm outline-none focus:border-brand-500" />
        <Button type="submit" size="icon" disabled={!input.trim() || busy} aria-label="Send"><Send className="h-4 w-4" /></Button>
      </form>
    </aside>
  );
}
