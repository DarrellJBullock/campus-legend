/**
 * Injury system — risk accumulation and injury rolls.
 *
 * Injury risk rises with fatigue and training load and falls with rest/health.
 * An injury roll uses seeded randomness so results are reproducible.
 */

import { type InjuryReport, type Resources } from "./types";
import type { Rng } from "./random";
import { clamp } from "@/lib/utils";

const INJURY_TYPES: {
  name: string;
  severity: InjuryReport["severity"];
  weeks: [number, number];
  health: number;
}[] = [
  { name: "Ankle Tweak", severity: "Minor", weeks: [0, 1], health: 8 },
  { name: "Hamstring Strain", severity: "Minor", weeks: [1, 2], health: 12 },
  { name: "Shoulder Sprain", severity: "Moderate", weeks: [2, 3], health: 20 },
  {
    name: "High Ankle Sprain",
    severity: "Moderate",
    weeks: [2, 4],
    health: 24,
  },
  { name: "MCL Sprain", severity: "Severe", weeks: [4, 6], health: 35 },
  { name: "Concussion", severity: "Severe", weeks: [1, 3], health: 30 },
];

/**
 * Effective probability of an injury this roll, 0–1.
 * Combines standing injury risk, current fatigue, and low health.
 */
export function injuryProbability(r: Resources, load: number): number {
  const base = r.injuryRisk / 100;
  const fatigueFactor = r.fatigue / 200; // up to +0.5
  const healthFactor = (100 - r.health) / 400; // up to +0.25
  const loadFactor = load / 100; // training/game intensity 0–1
  return clamp(
    base * 0.5 + fatigueFactor + healthFactor + loadFactor * 0.15,
    0,
    0.9,
  );
}

/** Roll for an injury. Returns null if none occurs. */
export function rollInjury(
  r: Resources,
  load: number,
  rng: Rng,
): InjuryReport | null {
  const p = injuryProbability(r, load);
  if (!rng.chance(p)) return null;
  // Severity skews toward minor unless health is already poor.
  const pool = r.health < 45 ? INJURY_TYPES : INJURY_TYPES.slice(0, 4);
  const t = rng.pick(pool);
  const weeksOut = rng.int(t.weeks[0], t.weeks[1]);
  return {
    name: t.name,
    severity: t.severity,
    weeksOut,
    healthImpact: t.health,
  };
}
