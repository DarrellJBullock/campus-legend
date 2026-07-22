/**
 * Attribute progression — permanent growth with diminishing returns.
 *
 * Growth slows as an attribute approaches 100 (a 90-rated attribute improves
 * far more slowly than a 50-rated one). A development multiplier derived from
 * work ethic and coaching quality scales all gains.
 */

import { type Attributes } from "./types";
import { clamp, round } from "@/lib/utils";

/** Diminishing-returns curve: fraction of raw gain actually applied. */
export function diminishingFactor(current: number): number {
  // 1.0 at rating 40, ~0.15 near rating 95.
  return clamp(1 - Math.pow(current / 100, 2.2), 0.12, 1);
}

/** Development multiplier from work ethic (0-100) and coaching quality (0-100). */
export function developmentMultiplier(
  workEthic: number,
  coachingQuality: number,
): number {
  const we = 0.7 + (workEthic / 100) * 0.6; // 0.7–1.3
  const cq = 0.85 + (coachingQuality / 100) * 0.4; // 0.85–1.25
  return round(we * cq, 3);
}

/**
 * Apply raw attribute gains (from training/games) with diminishing returns and
 * the development multiplier. Returns a new attributes object.
 */
export function applyGrowth(
  attributes: Attributes,
  rawGains: Attributes,
  multiplier: number,
): Attributes {
  const next: Attributes = { ...attributes };
  for (const [key, raw] of Object.entries(rawGains)) {
    if (!raw) continue;
    const current = next[key] ?? 50;
    const effective = raw * diminishingFactor(current) * multiplier;
    next[key] = clamp(round(current + effective, 1), 0, 100);
  }
  return next;
}

/** Convert accumulated game XP into small distributed attribute gains. */
export function xpToGains(xp: number, focusKeys: string[]): Attributes {
  const perKey = (xp / 100) * 0.8;
  const gains: Attributes = {};
  for (const key of focusKeys) gains[key] = perKey;
  return gains;
}
