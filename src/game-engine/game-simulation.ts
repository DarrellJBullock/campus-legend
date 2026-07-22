/**
 * Game simulation — deterministic, seeded, position-specific.
 *
 * A game's outcome is driven by a performance score computed from the player's
 * ratings, opponent strength, team quality, home field, scheme matchup, coach
 * trust, health, fatigue, confidence, chemistry, weather, and the player's
 * game-day decisions. The same seed + inputs always produces the same result,
 * which makes the engine fully testable.
 */

import {
  type Athlete,
  type GameResult,
  type GameStatLine,
  type Opponent,
  type Resources,
  type Weather,
  type GameDayDecision,
  type InjuryReport,
  type Position,
} from "./types";
import { computeOverall } from "./attributes";
import { rollInjury } from "./injuries";
import type { Rng } from "./random";
import { clamp, round } from "@/lib/utils";

export interface SimInputs {
  athlete: Athlete;
  resources: Resources;
  opponent: Opponent;
  teamQuality: number; // 0-100
  home: boolean;
  schemeFit: number; // 0-100
  weather: Weather;
  /** Sum of performanceMod from chosen game-day decisions. */
  decisionMod: number;
  week: number;
  season: number;
}

const WEATHER_MOD: Record<Weather, number> = {
  Clear: 0,
  Rain: -4,
  Wind: -3,
  Snow: -5,
  Heat: -2,
};

/**
 * Core performance score, 0–100. This is the single number that drives stats,
 * grade, reputation, and draft-stock movement.
 */
export function performanceScore(input: SimInputs, rng: Rng): number {
  const { athlete, resources, opponent } = input;
  const overall = computeOverall(athlete.position, athlete.attributes);

  const healthFactor = (resources.health / 100) * 8 - 4; // -4..+4
  const fatiguePenalty = (resources.fatigue / 100) * 6; // 0..6
  const confidenceMod = (resources.confidence - 50) / 10; // -5..+5
  const chemistryMod = (resources.teamChemistry - 50) / 20; // -2.5..+2.5
  const trustMod = (resources.coachTrust - 50) / 25; // -2..+2
  const homeMod = input.home ? 3 : -1;
  const schemeMod = (input.schemeFit - 50) / 12.5; // -4..+4
  const oppMod = (50 - opponent.strength) / 5; // stronger opp → negative
  const teamMod = (input.teamQuality - 50) / 12.5;

  const base =
    overall +
    healthFactor -
    fatiguePenalty +
    confidenceMod +
    chemistryMod +
    trustMod +
    homeMod +
    schemeMod +
    oppMod +
    teamMod +
    WEATHER_MOD[input.weather] +
    input.decisionMod;

  const variance = rng.gaussian(0, 7);
  return clamp(round(base + variance), 0, 100);
}

/** Letter grade from a 0–100 performance score. */
export function performanceGrade(score: number): string {
  if (score >= 93) return "A+";
  if (score >= 88) return "A";
  if (score >= 83) return "A-";
  if (score >= 78) return "B+";
  if (score >= 73) return "B";
  if (score >= 68) return "B-";
  if (score >= 63) return "C+";
  if (score >= 58) return "C";
  if (score >= 50) return "C-";
  if (score >= 42) return "D";
  return "F";
}

/**
 * Touchdown-style counting stat: scales with performance but keeps genuine
 * variance — including a real chance of a scoreless game — unlike
 * `round(mean * swing())` (swing's 0.75 floor made at least one score
 * almost guaranteed the moment `mean` cleared a very low bar).
 */
function scoreCount(mean: number, rng: Rng): number {
  const sd = Math.max(0.6, mean * 0.7);
  return Math.max(0, Math.round(rng.gaussian(mean, sd)));
}

/** Generate a position-specific stat line scaled by performance. */
export function generateStats(
  position: Position,
  perf: number,
  rng: Rng,
): GameStatLine {
  const p = perf / 100; // 0-1 quality
  const swing = () => rng.float(0.75, 1.25);
  switch (position) {
    case "QB": {
      const attempts = Math.round(rng.int(24, 38) * swing());
      const completions = Math.round(
        attempts * clamp(0.45 + p * 0.35, 0.3, 0.85),
      );
      return {
        passAttempts: attempts,
        completions,
        passYards: Math.round(completions * rng.float(9, 14) * (0.7 + p * 0.6)),
        passTds: scoreCount(p * 2.4, rng),
        interceptions: Math.round(clamp((1 - p) * 3 * swing(), 0, 4)),
        rushYards: Math.round(rng.int(-2, 20) * (0.6 + p)),
      };
    }
    case "RB": {
      const carries = Math.round(rng.int(10, 24) * swing());
      return {
        carries,
        rbRushYards: Math.round(
          carries * rng.float(2.8, 6.2) * (0.7 + p * 0.7),
        ),
        rushTds: scoreCount(p * 1.6, rng),
        receptions: Math.round(rng.int(0, 5) * (0.6 + p)),
        recYards: Math.round(rng.int(0, 40) * (0.6 + p)),
        fumbles: rng.chance((1 - p) * 0.3) ? 1 : 0,
      };
    }
    case "WR": {
      const targets = Math.round(rng.int(4, 12) * swing());
      const receptions = Math.round(targets * clamp(0.4 + p * 0.4, 0.2, 0.85));
      return {
        targets,
        wrReceptions: receptions,
        wrRecYards: Math.round(receptions * rng.float(9, 18) * (0.7 + p * 0.6)),
        wrTds: scoreCount(p * 1.3, rng),
        drops: Math.round(clamp((1 - p) * 2 * swing(), 0, 3)),
      };
    }
    case "LB": {
      return {
        tackles: Math.round(rng.int(4, 11) * (0.7 + p * 0.7)),
        tacklesForLoss: Math.round(clamp(p * 2.5 * swing(), 0, 4)),
        sacks: Math.round(clamp(p * 2 * swing(), 0, 3)),
        forcedFumbles: rng.chance(p * 0.35) ? 1 : 0,
        passBreakups: Math.round(clamp(p * 2 * swing(), 0, 3)),
      };
    }
    case "CB": {
      const targetsAllowed = rng.int(3, 9);
      return {
        cbTackles: Math.round(rng.int(2, 7) * (0.7 + p * 0.5)),
        cbInterceptions: rng.chance(p * 0.4) ? rng.int(1, 2) : 0,
        cbPassBreakups: Math.round(clamp(p * 3 * swing(), 0, 4)),
        targetsAllowed,
        tdsAllowed: Math.round(clamp((1 - p) * 2 * swing(), 0, 3)),
      };
    }
  }
}

/** Team scores derived from player performance, team quality, and opponent. */
function computeScore(
  input: SimInputs,
  perf: number,
  rng: Rng,
): { player: number; opponent: number } {
  const teamOffense = (input.teamQuality + perf) / 2;
  const playerPoints = Math.round(
    clamp(teamOffense / 3.5, 3, 52) + rng.int(-6, 6),
  );
  const oppPoints = Math.round(
    clamp(input.opponent.strength / 3.2, 3, 52) + rng.int(-6, 6),
  );
  return {
    player: Math.max(0, playerPoints),
    opponent: Math.max(0, oppPoints),
  };
}

const HEADLINES_WIN = [
  "%NAME% powers %TEAM% past %OPP%",
  "%TEAM% rides %NAME% to statement win over %OPP%",
  "%NAME% shines as %TEAM% downs %OPP%",
];
const HEADLINES_LOSS = [
  "%TEAM% falls to %OPP% despite %NAME%'s effort",
  "%OPP% edges %TEAM% in tough test for %NAME%",
  "Late mistakes doom %TEAM% against %OPP%",
];

/** Run a complete game simulation and produce a full recap. */
export function simulateGame(input: SimInputs, rng: Rng): GameResult {
  const perf = performanceScore(input, rng);
  const stats = generateStats(input.athlete.position, perf, rng);
  const { player, opponent } = computeScore(input, perf, rng);
  const win = player > opponent;
  const grade = performanceGrade(perf);

  // Injury roll — higher game load than training.
  const injury: InjuryReport | null = rollInjury(input.resources, 45, rng);

  const nameKey = `${input.athlete.firstName} ${input.athlete.lastName}`;
  const headlineTemplate = win
    ? rng.pick(HEADLINES_WIN)
    : rng.pick(HEADLINES_LOSS);
  const headline = headlineTemplate
    .replace("%NAME%", nameKey)
    .replace("%TEAM%", "your squad")
    .replace("%OPP%", input.opponent.name);

  const reputationDelta = round(
    (perf - 55) / 6 + (win ? 3 : 0) + (input.opponent.isRival ? 2 : 0),
  );
  const draftStockDelta = round((perf - 60) / 10 + (win ? 0.5 : -0.5));

  return {
    week: input.week,
    season: input.season,
    opponentName: input.opponent.name,
    isRival: input.opponent.isRival,
    playerScore: player,
    opponentScore: opponent,
    win,
    stats,
    performanceGrade: grade,
    performanceScore: perf,
    keyPlays: buildKeyPlays(input.athlete.position, stats, win, rng),
    coachFeedback: coachFeedback(perf, win),
    headline,
    attributeXp: round(perf * 0.9),
    injury,
    reputationDelta,
    draftStockDelta,
    depthChartEffect:
      perf >= 72
        ? "Impressed the staff — depth chart stock rising."
        : perf < 45
          ? "A step back — you'll need to answer in practice."
          : "Held your ground on the depth chart.",
  };
}

function buildKeyPlays(
  position: Position,
  stats: GameStatLine,
  win: boolean,
  rng: Rng,
): string[] {
  const plays: string[] = [];
  if (position === "QB" && (stats.passTds ?? 0) > 0)
    plays.push(`Threw for ${stats.passYards} yards and ${stats.passTds} TDs.`);
  if (position === "RB" && (stats.rushTds ?? 0) > 0)
    plays.push(`Broke off a ${rng.int(18, 62)}-yard touchdown run.`);
  if (position === "WR" && (stats.wrTds ?? 0) > 0)
    plays.push(`Hauled in a ${rng.int(15, 55)}-yard touchdown catch.`);
  if (position === "LB" && (stats.sacks ?? 0) > 0)
    plays.push(`Recorded ${stats.sacks} sack(s) and set the edge all night.`);
  if (position === "CB" && (stats.cbInterceptions ?? 0) > 0)
    plays.push(`Jumped a route for a key interception.`);
  plays.push(
    win
      ? "Made the play when it mattered most."
      : "Fought to the final whistle.",
  );
  return plays;
}

function coachFeedback(perf: number, win: boolean): string {
  if (perf >= 85) return "That's the standard. Keep stacking days like this.";
  if (perf >= 70)
    return win
      ? "Solid work — you helped us win."
      : "You played well; we just came up short.";
  if (perf >= 55) return "Some good, some to clean up. Get back to the film.";
  return "We expect more. Let's fix it in practice this week.";
}

/** Build the set of game-day decisions offered before a game. */
export function buildGameDayDecisions(
  _position: Position,
  _resources: Resources,
  rng: Rng,
): GameDayDecision[] {
  const pool: GameDayDecision[] = [
    {
      id: "risk-play",
      prompt: "3rd & long. The coordinator leaves it up to you.",
      options: [
        {
          id: "safe",
          label: "Take the safe checkdown",
          riskReward: "Low risk, small gain",
          performanceMod: 1,
          variance: 1,
        },
        {
          id: "risky",
          label: "Attempt the big play",
          riskReward: "High risk, high reward",
          performanceMod: 0,
          variance: 8,
          resource: { confidence: 2 },
        },
      ],
    },
    {
      id: "injury-call",
      prompt:
        "You tweaked something on the last series. Trainers are checking.",
      options: [
        {
          id: "play",
          label: "Play through the pain",
          riskReward: "Boosts trust, injury risk",
          performanceMod: 2,
          variance: 2,
          resource: { injuryRisk: 12, coachTrust: 3 },
        },
        {
          id: "report",
          label: "Report it and rest",
          riskReward: "Protects health",
          performanceMod: -3,
          variance: 1,
          resource: { injuryRisk: -8, health: 5 },
        },
      ],
    },
    {
      id: "audible",
      prompt:
        "You see a mismatch pre-snap. The called play doesn't exploit it.",
      options: [
        {
          id: "follow",
          label: "Run the called play",
          riskReward: "Safe, coach-approved",
          performanceMod: 1,
          variance: 1,
          resource: { coachTrust: 1 },
        },
        {
          id: "adjust",
          label: "Make the adjustment",
          riskReward: "Big upside if right",
          performanceMod: 0,
          variance: 7,
        },
      ],
    },
    {
      id: "lead-mgmt",
      prompt: "Late lead. You can pad your stats or protect the win.",
      options: [
        {
          id: "protect",
          label: "Protect the lead",
          riskReward: "Team-first",
          performanceMod: 2,
          variance: 1,
          resource: { coachTrust: 3, teamChemistry: 3 },
        },
        {
          id: "stats",
          label: "Push for personal stats",
          riskReward: "Reputation over team",
          performanceMod: 1,
          variance: 4,
          resource: { teamChemistry: -4, nationalReputation: 2 },
        },
      ],
    },
  ];
  // Offer 2 of the 4 each game, seeded.
  return rng.shuffle(pool).slice(0, 2);
}
