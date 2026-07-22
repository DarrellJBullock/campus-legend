"use client";

import type { Resources } from "@/game-engine/types";
import { StatBar } from "./stat-bar";
import { cn } from "@/lib/utils";

const METERS: { key: keyof Resources; label: string }[] = [
  { key: "energy", label: "Energy" },
  { key: "health", label: "Health" },
  { key: "morale", label: "Morale" },
  { key: "confidence", label: "Confidence" },
  { key: "coachTrust", label: "Coach Trust" },
  { key: "teamChemistry", label: "Team Chemistry" },
  { key: "stress", label: "Stress" },
  { key: "academicFocus", label: "Academic Focus" },
];

/** Grid of the core 0–100 career meters. */
export function ResourceMeters({
  resources,
  className,
}: {
  resources: Resources;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-4 gap-y-3", className)}>
      {METERS.map((m) => (
        <StatBar
          key={m.key}
          label={m.label}
          value={resources[m.key] as number}
        />
      ))}
    </div>
  );
}
