"use client";

import { cn } from "@/lib/utils";

/** A labeled 0–100 stat bar (turf→stadium gradient from globals.css). */
export function StatBar({
  label,
  value,
  max = 100,
  className,
}: {
  label?: string;
  value: number;
  max?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <div className="mb-1 flex items-baseline justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-mono tabular-nums">{Math.round(value)}</span>
        </div>
      ) : null}
      <div
        className="stat-bar"
        role="meter"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
