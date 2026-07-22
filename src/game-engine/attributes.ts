/**
 * Attribute generation and position-weighted overall rating.
 *
 * Overall is a WEIGHTED blend of position-specific and shared attributes, not a
 * flat average — each position emphasizes the attributes that matter for its
 * role. Weights per position sum to 1.0.
 */

import {
  type Attributes,
  type Position,
  POSITION_ATTRIBUTES,
  SHARED_ATTRIBUTES,
} from "./types";
import { clamp, round } from "@/lib/utils";
import type { Rng } from "./random";

// Weight of each attribute in the overall rating, per position.
// Keys reference both position-specific and shared attributes.
const OVERALL_WEIGHTS: Record<Position, Record<string, number>> = {
  QB: {
    throwPower: 0.12,
    shortAccuracy: 0.16,
    deepAccuracy: 0.12,
    pocketPresence: 0.12,
    decisionMaking: 0.16,
    awareness: 0.08,
    footballIQ: 0.1,
    agility: 0.04,
    leadership: 0.06,
    confidence: 0.04,
  },
  RB: {
    vision: 0.16,
    carrying: 0.1,
    elusiveness: 0.16,
    breakTackle: 0.14,
    receiving: 0.08,
    speed: 0.14,
    agility: 0.12,
    strength: 0.06,
    stamina: 0.04,
  },
  WR: {
    catching: 0.18,
    routeRunning: 0.16,
    release: 0.1,
    spectacularCatch: 0.08,
    separation: 0.14,
    speed: 0.14,
    agility: 0.1,
    awareness: 0.06,
    stamina: 0.04,
  },
  LB: {
    tackling: 0.18,
    blockShedding: 0.12,
    pursuit: 0.14,
    coverage: 0.12,
    passRush: 0.1,
    strength: 0.1,
    speed: 0.08,
    awareness: 0.1,
    footballIQ: 0.06,
  },
  CB: {
    manCoverage: 0.18,
    zoneCoverage: 0.14,
    press: 0.1,
    ballSkills: 0.14,
    recoverySpeed: 0.12,
    speed: 0.14,
    agility: 0.1,
    awareness: 0.08,
  },
};

/** Compute a 0–100 position-weighted overall rating. */
export function computeOverall(
  position: Position,
  attributes: Attributes,
): number {
  const weights = OVERALL_WEIGHTS[position];
  let total = 0;
  let weightSum = 0;
  for (const [attr, w] of Object.entries(weights)) {
    const value = attributes[attr] ?? 50;
    total += value * w;
    weightSum += w;
  }
  // Guard against weight tables that don't sum exactly to 1.
  return clamp(round(total / weightSum), 0, 100);
}

/**
 * Generate a starting attribute set for a freshman recruit.
 * Base values scale with difficulty (harder = lower start) and are nudged by
 * play style. All attributes land in a believable 40–75 freshman band.
 */
export function generateStartingAttributes(
  position: Position,
  playStyle: string,
  rng: Rng,
  difficultyMod = 0,
): Attributes {
  const attrs: Attributes = {};
  const keys = [...SHARED_ATTRIBUTES, ...POSITION_ATTRIBUTES[position]];
  for (const key of keys) {
    const base = rng.gaussian(56, 8) + difficultyMod;
    attrs[key] = clamp(round(base), 35, 78);
  }
  applyPlayStyleBias(attrs, position, playStyle);
  return attrs;
}

/** Play-style specializations: bump the signature attributes for the style. */
const PLAY_STYLE_BIAS: Record<string, string[]> = {
  // QB
  "Field General": ["decisionMaking", "footballIQ", "shortAccuracy"],
  "Dual Threat": ["agility", "speed", "elusiveness"],
  Gunslinger: ["throwPower", "deepAccuracy", "confidence"],
  // RB
  "Power Runner": ["strength", "breakTackle", "carrying"],
  "Elusive Back": ["elusiveness", "agility", "speed"],
  "Receiving Back": ["receiving", "catching", "routeRunning"],
  // WR
  "Deep Threat": ["speed", "deepAccuracy", "separation"],
  "Route Technician": ["routeRunning", "release", "awareness"],
  "Possession Receiver": ["catching", "spectacularCatch", "strength"],
  // LB
  "Run Stopper": ["tackling", "blockShedding", "strength"],
  "Coverage Specialist": ["coverage", "zoneCoverage", "speed"],
  "Pass Rusher": ["passRush", "pursuit", "agility"],
  // CB
  "Shutdown Corner": ["manCoverage", "press", "recoverySpeed"],
  "Ball Hawk": ["ballSkills", "zoneCoverage", "awareness"],
  "Press Specialist": ["press", "strength", "manCoverage"],
};

function applyPlayStyleBias(
  attrs: Attributes,
  _position: Position,
  playStyle: string,
): void {
  const boosts = PLAY_STYLE_BIAS[playStyle];
  if (!boosts) return;
  for (const key of boosts) {
    if (attrs[key] !== undefined) {
      attrs[key] = clamp(round(attrs[key]! + 8), 35, 85);
    }
  }
}

/** Ordered attribute keys for a position (shared first, then specific). */
export function attributeKeysFor(position: Position): string[] {
  return [...SHARED_ATTRIBUTES, ...POSITION_ATTRIBUTES[position]];
}
