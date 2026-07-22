/**
 * Depth chart — role placement and weekly movement.
 *
 * A player's "depth score" blends overall rating, coach trust, recent training,
 * discipline, health, and game performance. Their rank within the position
 * group is derived by comparing that score to fictional competitors, and the
 * role (Reserve → Starter → National Star) follows from rank + reputation.
 */

import {
  type Competitor,
  type DepthChart,
  type DepthRole,
  type Resources,
} from "./types";
import { clamp, round } from "@/lib/utils";

export interface DepthInputs {
  overall: number;
  coachTrust: number;
  recentTrainingBoost: number; // 0-20, decays weekly
  discipline: number;
  health: number;
  lastGameScore: number; // 0-100, 50 = neutral
  schemeFit: number; // 0-100
}

/** Compute a 0–100 depth score. */
export function depthScore(i: DepthInputs): number {
  const score =
    i.overall * 0.42 +
    i.coachTrust * 0.2 +
    i.recentTrainingBoost * 0.6 +
    i.discipline * 0.08 +
    i.health * 0.08 +
    (i.lastGameScore - 50) * 0.25 +
    i.schemeFit * 0.1;
  return clamp(round(score), 0, 100);
}

/** Map a rank (1 = best) and national reputation to a depth role. */
export function roleForRank(
  rank: number,
  nationalReputation: number,
  redshirt: boolean,
): DepthRole {
  if (redshirt) return "Redshirt";
  if (rank === 1) {
    if (nationalReputation >= 75) return "National Star";
    if (nationalReputation >= 50) return "Conference Star";
    if (nationalReputation >= 30) return "Captain";
    return "Starter";
  }
  if (rank === 2) return "Rotational";
  if (rank <= 4) return "Reserve";
  return "Reserve";
}

/**
 * Recompute the depth chart. Returns new role, rank, and a human-readable
 * reason for any movement versus the previous role.
 */
export function recomputeDepthChart(
  previous: DepthChart,
  inputs: DepthInputs,
  resources: Resources,
  redshirt: boolean,
): DepthChart {
  const myScore = depthScore(inputs);
  // Rank = 1 + number of competitors clearly ahead.
  const ahead = previous.competitors.filter(
    (c) => c.overall > myScore + 2,
  ).length;
  const rank = ahead + 1;
  const role = roleForRank(rank, resources.nationalReputation, redshirt);

  const reason = movementReason(previous.role, role, inputs);

  // Nudge competitor ratings slightly so the group feels alive.
  const competitors: Competitor[] = previous.competitors.map((c) => ({
    ...c,
    role: c.overall > myScore ? "Starter" : "Reserve",
  }));

  return {
    role,
    rank,
    competitors,
    lastMovementReason: reason,
  };
}

function movementReason(
  prev: DepthRole,
  next: DepthRole,
  i: DepthInputs,
): string {
  const order = rolePriority(next) - rolePriority(prev);
  if (order > 0) {
    if (i.lastGameScore >= 70) return "Strong game performance moved you up.";
    if (i.coachTrust >= 70) return "The coaches trust you with a bigger role.";
    if (i.recentTrainingBoost >= 12)
      return "Your practice reps earned a promotion.";
    return "You climbed the depth chart.";
  }
  if (order < 0) {
    if (i.health < 60) return "Injury concerns dropped you on the chart.";
    if (i.lastGameScore < 40) return "A rough game cost you reps.";
    if (i.coachTrust < 40) return "You've lost some of the staff's trust.";
    return "You slipped on the depth chart.";
  }
  return "Your role held steady this week.";
}

const ROLE_ORDER: DepthRole[] = [
  "Redshirt",
  "Reserve",
  "Rotational",
  "Starter",
  "Captain",
  "Conference Star",
  "National Star",
];

export function rolePriority(role: DepthRole): number {
  return ROLE_ORDER.indexOf(role);
}

/** Is this role an on-field contributor (affects whether they play games)? */
export function playsInGames(role: DepthRole): boolean {
  return role !== "Redshirt" && role !== "Reserve";
}
