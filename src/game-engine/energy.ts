/**
 * Resource bounds & mutation helpers.
 *
 * All career resources are bounded. This module is the ONLY place that clamps
 * resource state, guaranteeing invalid states (energy < 0, GPA > 4.0, negative
 * money) can never be persisted. Every engine module routes resource changes
 * through `applyDelta`.
 */

import {
  type Resources,
  type ResourceDelta,
  type EligibilityStatus,
  GPA_MAX,
  ELIGIBILITY_GPA_FLOOR,
  PROBATION_GPA_FLOOR,
} from "./types";
import { clamp, round } from "@/lib/utils";

/** Keys clamped to 0–100. */
const PERCENT_KEYS: (keyof Resources)[] = [
  "energy",
  "fatigue",
  "health",
  "injuryRisk",
  "confidence",
  "morale",
  "coachTrust",
  "teamChemistry",
  "campusReputation",
  "nationalReputation",
  "academicFocus",
  "draftStock",
  "stress",
];

export function defaultResources(
  overrides: Partial<Resources> = {},
): Resources {
  return {
    energy: 100,
    fatigue: 0,
    health: 100,
    injuryRisk: 8,
    confidence: 60,
    morale: 65,
    coachTrust: 40,
    teamChemistry: 50,
    campusReputation: 15,
    nationalReputation: 5,
    academicFocus: 60,
    gpa: 3.0,
    eligibility: "Eligible",
    money: 0,
    draftStock: 20,
    socialFollowing: 250,
    stress: 20,
    ...overrides,
  };
}

/** Apply a partial delta and clamp everything back into legal ranges. */
export function applyDelta(
  resources: Resources,
  delta: ResourceDelta,
): Resources {
  const next: Resources = { ...resources };
  for (const [key, amount] of Object.entries(delta)) {
    if (amount === undefined) continue;
    const k = key as keyof ResourceDelta;
    next[k] = (next[k] as number) + amount;
  }
  return normalize(next);
}

/** Force all resources back into their legal bounds. */
export function normalize(r: Resources): Resources {
  const out: Resources = { ...r };
  for (const key of PERCENT_KEYS) {
    out[key] = clamp(round(out[key] as number), 0, 100) as never;
  }
  out.gpa = clamp(round(out.gpa, 2), 0, GPA_MAX);
  out.money = Math.max(0, round(out.money));
  out.socialFollowing = Math.max(0, Math.round(out.socialFollowing));
  out.eligibility = deriveEligibility(out.gpa, out.eligibility);
  return out;
}

/**
 * Eligibility ladder based on GPA. Once "Ineligible", a player must climb back
 * above the probation floor to recover — mirrors real academic-standing rules.
 */
export function deriveEligibility(
  gpa: number,
  current: EligibilityStatus,
): EligibilityStatus {
  if (gpa < ELIGIBILITY_GPA_FLOOR) return "Ineligible";
  if (gpa < PROBATION_GPA_FLOOR) {
    return current === "Ineligible" ? "Probation" : "Probation";
  }
  if (gpa < PROBATION_GPA_FLOOR + 0.2) return "Warning";
  return "Eligible";
}

/**
 * Weekly passive drift applied at the start of each week: fatigue recovers a
 * little, energy trends toward rested, stress cools slightly, injury risk
 * decays. Keeps the sim from getting stuck at extremes.
 */
export function weeklyResourceDrift(r: Resources): Resources {
  return normalize({
    ...r,
    energy: r.energy + 12,
    fatigue: r.fatigue - 10,
    injuryRisk: r.injuryRisk - 4,
    stress: r.stress - 5,
    health: r.health + (r.health < 100 ? 6 : 0),
  });
}

export { PERCENT_KEYS };
