"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label } from "@/components/ui/form";
import { createNote, deleteNote, updateNote } from "./actions";
import { cn, formatDateTime } from "@/lib/utils";

type NoteItem = { id: string; title: string; body: string; label: string; updatedAt: string; question: { id: string; stem: string; specialty: string } | null };

const LABELS = ["general", "mnemonic", "weak-area", "exam-day", "question"];
const labelTone: Record<string, string> = {
  general: "bg-bg-soft text-muted",
  mnemonic: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  "weak-area": "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  "exam-day": "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  question: "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-200",
};

export function NotesBoard({ initial }: { initial: NoteItem[] }) {
  const [notes, setNotes] = useState(initial);
  const [filter, setFilter] = useState("all");
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [label, setLabel] = useState("general");
  const [editing, setEditing] = useState<string | null>(null);

  const shown = notes.filter((n) => filter === "all" || n.label === filter);

  return (
    <div className="space-y-6">
      <form
        className="rounded-2xl border border-line bg-card p-5 shadow-soft"
        onSubmit={(e) => {
          e.preventDefault();
          if (!body.trim()) return;
          start(async () => {
            const n = await createNote({ title, body, label });
            setNotes((ns) => [{ ...n, question: null }, ...ns]);
            setTitle("");
            setBody("");
          });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <div>
            <Label htmlFor="ntitle">Title (optional)</Label>
            <Input id="ntitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Causes of high anion gap acidosis" />
          </div>
          <div>
            <Label htmlFor="nlabel">Label</Label>
            <Select id="nlabel" value={label} onChange={(e) => setLabel(e.target.value)}>
              {LABELS.filter((l) => l !== "question").map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
          </div>
        </div>
        <div className="mt-3">
          <Label htmlFor="nbody">Note</Label>
          <Textarea id="nbody" value={body} onChange={(e) => setBody(e.target.value)} placeholder="MUDPILES: Methanol, Uraemia, DKA, Propylene glycol, Isoniazid/Iron, Lactate, Ethylene glycol, Salicylates…" />
        </div>
        <div className="mt-3 flex justify-end">
          <Button type="submit" loading={pending} disabled={!body.trim()}><Plus className="h-4 w-4" /> Add note</Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-1.5">
        {["all", ...LABELS].map((l) => (
          <button key={l} onClick={() => setFilter(l)} className={cn("rounded-lg border px-2.5 py-1 text-xs font-semibold", filter === l ? "border-brand-600 bg-brand-600 text-white" : "border-line hover:bg-bg-soft")}>
            {l} {l !== "all" && <span className="opacity-70">({notes.filter((n) => n.label === l).length})</span>}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((n) => (
          <article key={n.id} className="flex flex-col rounded-2xl border border-line bg-card p-4 shadow-soft">
            <div className="flex items-start justify-between gap-2">
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", labelTone[n.label] ?? labelTone.general)}><Tag className="h-3 w-3" /> {n.label || "general"}</span>
              <button
                aria-label="Delete note"
                className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600"
                onClick={() =>
                  start(async () => {
                    await deleteNote(n.id);
                    setNotes((ns) => ns.filter((x) => x.id !== n.id));
                  })
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {n.title && <h3 className="mt-2 font-display text-sm font-bold">{n.title}</h3>}
            {editing === n.id ? (
              <Textarea
                autoFocus
                defaultValue={n.body}
                className="mt-2 text-sm"
                onBlur={(e) => {
                  const v = e.target.value;
                  setEditing(null);
                  if (v !== n.body) start(async () => {
                    await updateNote(n.id, { body: v });
                    setNotes((ns) => ns.map((x) => (x.id === n.id ? { ...x, body: v } : x)));
                  });
                }}
              />
            ) : (
              <p className="mt-2 flex-1 whitespace-pre-wrap text-sm leading-relaxed" onDoubleClick={() => setEditing(n.id)} title="Double-click to edit">{n.body}</p>
            )}
            {n.question && (
              <p className="mt-3 rounded-lg bg-bg-soft p-2 text-xs text-muted">
                <span className="font-semibold text-fg">{n.question.specialty}: </span>{n.question.stem.slice(0, 110)}…
              </p>
            )}
            <p className="mt-3 text-[11px] text-muted">{formatDateTime(n.updatedAt)} · double-click to edit</p>
          </article>
        ))}
      </div>
    </div>
  );
}
