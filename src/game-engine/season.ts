/**
 * Season structure — schedule generation and season/phase advancement.
 *
 * A season is 12 regular-season games plus preseason, a bye, a rivalry game,
 * and a postseason slot. This module builds a deterministic schedule from the
 * opponent pool and advances the career through the four-year arc.
 */

import {
  type Opponent,
  type ScheduleGame,
  type SeasonState,
  type ClassYear,
  CLASS_YEARS,
  REGULAR_SEASON_GAMES,
} from "./types";
import type { Rng } from "./random";

/** Build a full-season schedule from a pool of opponents. */
export function buildSchedule(
  opponents: Opponent[],
  rivalId: string,
  rng: Rng,
): ScheduleGame[] {
  const shuffled = rng.shuffle(opponents);
  const games: ScheduleGame[] = [];
  for (let week = 1; week <= REGULAR_SEASON_GAMES; week++) {
    // Rivalry game is fixed at the second-to-last week.
    let opp: Opponent;
    if (week === REGULAR_SEASON_GAMES - 1) {
      opp =
        opponents.find((o) => o.id === rivalId) ??
        shuffled[week % shuffled.length]!;
    } else {
      opp = shuffled[week % shuffled.length]!;
    }
    games.push({
      week,
      opponent: opp,
      played: false,
      result: null,
      home: week % 2 === 1,
    });
  }
  return games;
}

export function initialSeasonState(
  season: number,
  schedule: ScheduleGame[],
): SeasonState {
  return {
    season,
    classYear: CLASS_YEARS[season - 1] ?? "Senior",
    phase: "Preseason",
    wins: 0,
    losses: 0,
    schedule,
    redshirted: false,
  };
}

export function classYearFor(season: number): ClassYear {
  return CLASS_YEARS[Math.min(season - 1, 3)] ?? "Senior";
}

/** Record a game result into the season standings. */
export function recordResult(
  season: SeasonState,
  week: number,
  win: boolean,
): SeasonState {
  const schedule = season.schedule.map((g) =>
    g.week === week ? { ...g, played: true } : g,
  );
  return {
    ...season,
    schedule,
    wins: season.wins + (win ? 1 : 0),
    losses: season.losses + (win ? 0 : 1),
  };
}

/** Is the player eligible to declare for the pro draft? (after junior year) */
export function canDeclareForDraft(season: number): boolean {
  return season >= 3;
}

/** Did the team qualify for the conference championship? */
export function madeConferenceChampionship(season: SeasonState): boolean {
  return season.wins >= 9;
}

/** Did the team earn a postseason bowl slot? */
export function madeBowl(season: SeasonState): boolean {
  return season.wins >= 6;
}

export const OFFSEASON_TRAINING_WEEKS = 4;
