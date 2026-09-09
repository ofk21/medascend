"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight, dependency-free SVG charts using the brand palette.
 * Teal = primary series, amber = secondary/peer, ink = neutral.
 */

export function ActivityChart({ days }: { days: { date: string; answered: number; correct: number }[] }) {
  const max = Math.max(5, ...days.map((d) => d.answered));
  const w = 600;
  const h = 160;
  const pad = 8;
  const bw = (w - pad * 2) / days.length;
  const id = useId();
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h + 20}`} className="h-44 w-full min-w-[480px]" role="img" aria-label="Questions answered per day over the last 30 days">
        <defs>
          <linearGradient id={`${id}-g`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0e7c7b" />
            <stop offset="1" stopColor="#43a7a3" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={pad} x2={w - pad} y1={h - h * f} y2={h - h * f} stroke="currentColor" className="text-line" strokeDasharray="3 4" />
        ))}
        {days.map((d, i) => {
          const bh = (d.answered / max) * (h - 10);
          const ch = (d.correct / max) * (h - 10);
          const x = pad + i * bw + bw * 0.2;
          return (
            <g key={d.date}>
              <title>{`${new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}: ${d.answered} answered, ${d.correct} correct`}</title>
              <rect x={x} y={h - bh} width={bw * 0.6} height={bh} rx="3" fill={`url(#${id}-g)`} opacity="0.35" />
              <rect x={x} y={h - ch} width={bw * 0.6} height={ch} rx="3" fill={`url(#${id}-g)`} />
              {(i === 0 || i === days.length - 1 || i % 7 === 0) && (
                <text x={x + bw * 0.3} y={h + 15} textAnchor="middle" className="fill-current text-muted" style={{ fontSize: 10 }}>
                  {new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-600" /> Correct</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-600/35" /> Answered</span>
      </div>
    </div>
  );
}

export function TrendChart({ points }: { points: { label: string; value: number }[] }) {
  if (points.length < 2) return <p className="text-sm text-muted">Complete at least two sessions to see your trend.</p>;
  const w = 600;
  const h = 160;
  const pad = 24;
  const xs = points.map((_, i) => pad + (i * (w - pad * 2)) / (points.length - 1));
  const ys = points.map((p) => h - pad - (p.value / 100) * (h - pad * 2));
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = `${d} L${xs[xs.length - 1]},${h - pad} L${xs[0]},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full" role="img" aria-label="Session accuracy trend">
      {[25, 50, 75, 100].map((v) => {
        const y = h - pad - (v / 100) * (h - pad * 2);
        return (
          <g key={v}>
            <line x1={pad} x2={w - pad} y1={y} y2={y} stroke="currentColor" className="text-line" strokeDasharray="3 4" />
            <text x={4} y={y + 3} className="fill-current text-muted" style={{ fontSize: 9 }}>{v}%</text>
          </g>
        );
      })}
      <line x1={pad} x2={w - pad} y1={h - pad - 0.6 * (h - pad * 2)} y2={h - pad - 0.6 * (h - pad * 2)} stroke="#e0a100" strokeWidth="1.5" strokeDasharray="6 4" />
      <text x={w - pad} y={h - pad - 0.6 * (h - pad * 2) - 4} textAnchor="end" fill="#b98200" style={{ fontSize: 9, fontWeight: 600 }}>Pass ≈ 60%</text>
      <path d={area} fill="#0e7c7b" opacity="0.12" />
      <path d={d} fill="none" stroke="#0e7c7b" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {xs.map((x, i) => (
        <g key={i}>
          <title>{`${points[i].label}: ${points[i].value}%`}</title>
          <circle cx={x} cy={ys[i]} r="4" fill="#fff" stroke="#0e7c7b" strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

export function Donut({ value, size = 120, label, className }: { value: number; size?: number; label?: string; className?: string }) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" className="text-bg-soft" strokeWidth="12" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={v >= 70 ? "#0e7c7b" : v >= 55 ? "#e0a100" : "#dc2626"} strokeWidth="12" fill="none" strokeDasharray={`${(v / 100) * c} ${c}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-2xl font-bold leading-none">{v}%</p>
          {label && <p className="mt-1 text-[10px] uppercase tracking-wider text-muted">{label}</p>}
        </div>
      </div>
    </div>
  );
}
