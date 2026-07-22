"use client";

import type { Athlete } from "@/game-engine/types";
import { POSITION_NAMES, ATTRIBUTE_LABELS } from "@/game-engine/types";
import { attributeKeysFor } from "@/game-engine/attributes";
import { getSchool } from "@/content/schools";
import { teamStyle } from "@/lib/team-theme";
import { cn } from "@/lib/utils";
import { AthleteAvatar } from "./athlete-avatar";

/** Collectible trading-card view of the athlete. */
export function TradingCard({
  athlete,
  schoolId,
  overall,
  classYear,
  className,
}: {
  athlete: Athlete;
  schoolId: string;
  overall: number;
  classYear?: string;
  className?: string;
}) {
  const school = getSchool(schoolId);
  const topAttrs = attributeKeysFor(athlete.position)
    .map((k) => ({ k, v: athlete.attributes[k] ?? 0 }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 4);

  return (
    <div
      className={cn("trading-card p-4 text-cream", className)}
      style={teamStyle(schoolId)}
    >
      <div className="flex items-start justify-between">
        <div className="scoreboard rounded bg-black/40 px-2 py-1 text-center">
          <span className="block text-2xl leading-none text-stadium">
            {overall}
          </span>
          <span className="text-[9px] uppercase tracking-widest opacity-80">
            OVR
          </span>
        </div>
        <span className="rounded bg-black/40 px-2 py-1 font-display text-xs uppercase tracking-widest">
          {athlete.position}
        </span>
      </div>

      <div className="my-3 flex justify-center">
        <AthleteAvatar athlete={athlete} size={92} />
      </div>

      <div className="text-center">
        <p className="font-display text-xl uppercase leading-tight tracking-wide">
          {athlete.firstName} {athlete.lastName}
        </p>
        <p className="text-xs opacity-80">
          {classYear ? `${classYear} · ` : ""}
          {POSITION_NAMES[athlete.position]}
        </p>
        <p className="text-[11px] opacity-70">{school?.name}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-white/20 pt-2 text-[11px]">
        {topAttrs.map(({ k, v }) => (
          <div key={k} className="flex justify-between">
            <span className="truncate opacity-80">
              {ATTRIBUTE_LABELS[k] ?? k}
            </span>
            <span className="font-mono tabular-nums text-stadium">
              {Math.round(v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
