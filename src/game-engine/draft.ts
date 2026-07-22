/**
 * Draft stock & career endings + fictional combine.
 *
 * Draft stock (0–100) is a running measure updated by games, awards, and
 * decisions. At career end, a final combine plus the accumulated stock maps to
 * a draft outcome or an alternate ending (return, transfer, academic path...).
 */

import {
  type CareerState,
  type CareerEnding,
  type GameResult,
  type Position,
} from "./types";
import { computeOverall } from "./attributes";
import type { Rng } from "./random";
import { clamp, round } from "@/lib/utils";

export interface DraftStockInputs {
  overall: number;
  production: number; // 0-100 normalized career production
  awards: number;
  healthHistory: number; // 0-100, higher = healthier
  characterScore: number; // 0-100 (discipline+leadership)
  competitionLevel: number; // 0-100 (athletic prestige of program)
  academicStanding: number; // gpa*25
  consistency: number; // 0-100
  positionValue: number; // 0-100 by position
}

const POSITION_VALUE: Record<Position, number> = {
  QB: 100,
  CB: 78,
  WR: 74,
  RB: 58,
  LB: 66,
};

export function positionValue(position: Position): number {
  return POSITION_VALUE[position];
}

/** Compute an updated 0–100 draft stock from weighted inputs. */
export function computeDraftStock(i: DraftStockInputs): number {
  const score =
    i.overall * 0.28 +
    i.production * 0.18 +
    i.awards * 0.08 +
    i.healthHistory * 0.08 +
    i.characterScore * 0.08 +
    i.competitionLevel * 0.08 +
    i.academicStanding * 0.04 +
    i.consistency * 0.08 +
    i.positionValue * 0.1;
  return clamp(round(score), 0, 100);
}

/** Normalize career production (yards/tds/tackles) into a 0–100 figure. */
export function productionScore(gameLog: GameResult[]): number {
  if (gameLog.length === 0) return 0;
  const avgPerf =
    gameLog.reduce((sum, g) => sum + g.performanceScore, 0) / gameLog.length;
  return round(avgPerf);
}

/** Consistency = inverse of performance variance. */
export function consistencyScore(gameLog: GameResult[]): number {
  if (gameLog.length < 2) return 60;
  const scores = gameLog.map((g) => g.performanceScore);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((s, v) => s + (v - mean) ** 2, 0) / scores.length;
  const std = Math.sqrt(variance);
  return clamp(round(100 - std * 3), 0, 100);
}

export interface CombineResult {
  fortyYard: number; // seconds
  benchReps: number;
  verticalInches: number;
  threeCone: number;
  overallBoost: number; // draft stock delta
}

/** Run the fictional combine — seeded, athleticism-driven. */
export function runCombine(career: CareerState, rng: Rng): CombineResult {
  const a = career.athlete.attributes;
  const speed = a.speed ?? 60;
  const strength = a.strength ?? 60;
  const agility = a.agility ?? 60;

  const fortyYard = round(
    5.4 - (speed / 100) * 1.3 + rng.float(-0.05, 0.05),
    2,
  );
  const benchReps = Math.round((strength / 100) * 30 + rng.int(-2, 3));
  const verticalInches = round(28 + (agility / 100) * 16 + rng.float(-1, 1), 1);
  const threeCone = round(
    7.6 - (agility / 100) * 1.2 + rng.float(-0.05, 0.05),
    2,
  );

  // Boost: reward elite testing.
  const boost = round(
    (speed + strength + agility) / 3 / 10 - 5 + rng.float(-1, 2),
  );
  return {
    fortyYard,
    benchReps,
    verticalInches,
    threeCone,
    overallBoost: boost,
  };
}

/** Map final draft stock to a draft-based ending. */
export function draftOutcome(finalStock: number): CareerEnding {
  if (finalStock >= 85) return "firstRound";
  if (finalStock >= 65) return "midRound";
  if (finalStock >= 48) return "lateRound";
  return "undrafted";
}

export interface EndingContext {
  finalStock: number;
  gpa: number;
  eligibilityIneligible: boolean;
  hadCareerEndingInjury: boolean;
  season: number;
  graduated: boolean;
  isNationalStar: boolean;
}

/**
 * Resolve the overall career ending, accounting for alternate paths that
 * override the pure draft outcome (academic dismissal, career-ending injury,
 * campus-legend status, graduation paths).
 */
export function resolveEnding(ctx: EndingContext): CareerEnding {
  if (ctx.hadCareerEndingInjury) return "careerEndingInjury";
  if (ctx.eligibilityIneligible && ctx.gpa < 2.0) return "academicDismissal";
  if (ctx.season < 4 && ctx.finalStock < 55) return "returnedToSchool";
  const draft = draftOutcome(ctx.finalStock);
  if (draft === "undrafted") {
    if (ctx.isNationalStar) return "campusLegend";
    if (ctx.graduated && ctx.gpa >= 3.2) return "businessPath";
    if (ctx.graduated) return "coachingPath";
  }
  if (draft === "firstRound" && ctx.isNationalStar) return "campusLegend";
  return draft;
}

export const ENDING_LABELS: Record<
  CareerEnding,
  { title: string; blurb: string }
> = {
  firstRound: {
    title: "First-Round Selection",
    blurb: "You hear your name called on night one. A franchise cornerstone.",
  },
  midRound: {
    title: "Mid-Round Selection",
    blurb: "A team bets on your upside in the middle rounds.",
  },
  lateRound: {
    title: "Late-Round Selection",
    blurb: "You sneak in on day three — now prove them wrong.",
  },
  undrafted: {
    title: "Undrafted Free Agent",
    blurb: "No call, but a camp invite. The grind continues.",
  },
  returnedToSchool: {
    title: "Returned to School",
    blurb: "You bet on yourself and came back for another season.",
  },
  transferred: {
    title: "Transferred Programs",
    blurb: "A fresh start at a new school.",
  },
  careerEndingInjury: {
    title: "Career-Ending Injury",
    blurb: "The body gave out, but the legend of your play remains.",
  },
  academicDismissal: {
    title: "Academic Dismissal",
    blurb: "The classroom caught up with you. A hard lesson.",
  },
  coachingPath: {
    title: "Graduated — Coaching Path",
    blurb: "Degree in hand, you step into coaching to build the next legend.",
  },
  businessPath: {
    title: "Graduated — Business Path",
    blurb: "You parlay your brand and degree into the business world.",
  },
  campusLegend: {
    title: "Campus Legend",
    blurb: "Statues and retired numbers. They'll tell your story for decades.",
  },
};

export function computeOverallFor(career: CareerState): number {
  return computeOverall(career.athlete.position, career.athlete.attributes);
}
