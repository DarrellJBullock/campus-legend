"use client";

import type { Athlete } from "@/game-engine/types";
import { POSITION_NAMES } from "@/game-engine/types";
import { getSchool } from "@/content/schools";
import { teamStyle } from "@/lib/team-theme";
import { cn } from "@/lib/utils";
import { AthleteAvatar } from "./athlete-avatar";

/** Locker-room nameplate showing the athlete's identity + school colors. */
export function Nameplate({
  athlete,
  schoolId,
  overall,
  className,
}: {
  athlete: Athlete;
  schoolId: string;
  overall?: number;
  className?: string;
}) {
  const school = getSchool(schoolId);
  return (
    <div
      className={cn("nameplate flex items-center gap-3 text-cream", className)}
      style={teamStyle(schoolId)}
    >
      <AthleteAvatar athlete={athlete} size={48} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg leading-tight">
          {athlete.firstName} {athlete.lastName}
        </p>
        <p className="truncate text-xs font-normal tracking-wide opacity-90">
          #{athlete.jerseyNumber} · {POSITION_NAMES[athlete.position]} ·{" "}
          {school?.name ?? "Free Agent"}
        </p>
      </div>
      {overall !== undefined ? (
        <div className="scoreboard rounded bg-black/30 px-2 py-1 text-center">
          <span className="block text-lg leading-none text-stadium">
            {overall}
          </span>
          <span className="text-[9px] uppercase tracking-widest opacity-80">
            OVR
          </span>
        </div>
      ) : null}
    </div>
  );
}
