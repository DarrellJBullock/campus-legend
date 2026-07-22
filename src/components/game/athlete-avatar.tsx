"use client";

import type { Athlete } from "@/game-engine/types";
import { cn } from "@/lib/utils";

const SKIN_TONES = ["#f2d3b3", "#e0b088", "#c68642", "#8d5524", "#5c3a1e"];
const ACCENTS = ["#facc15", "#38bdf8", "#f87171", "#a78bfa", "#34d399"];

/** Deterministic silhouette avatar built from the athlete's avatar config. */
export function AthleteAvatar({
  athlete,
  size = 64,
  className,
}: {
  athlete: Athlete;
  size?: number;
  className?: string;
}) {
  const skin = SKIN_TONES[athlete.avatar.skinTone % SKIN_TONES.length];
  const accent = ACCENTS[athlete.avatar.accent % ACCENTS.length];
  const initials = `${athlete.firstName[0] ?? ""}${athlete.lastName[0] ?? ""}`;
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-full border-2",
        className,
      )}
      style={{
        width: size,
        height: size,
        borderColor: accent,
        background: `radial-gradient(circle at 50% 35%, ${skin}, hsl(var(--cl-navy-deep)))`,
      }}
      aria-hidden
    >
      <span
        className="font-display font-bold uppercase tracking-wider text-charcoal"
        style={{ fontSize: size * 0.4, color: accent }}
      >
        {initials}
      </span>
      <span
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: accent }}
      />
    </div>
  );
}
