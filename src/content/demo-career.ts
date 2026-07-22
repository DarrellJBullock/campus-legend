/**
 * Deterministic demo career. Used by "Try the Demo" so a first-time visitor can
 * explore a populated hub with games already played, a signed deal, and unlocked
 * achievements — without creating an account. Fully deterministic from a fixed
 * seed so tests can assert against it.
 */

import type { CareerState } from "@/game-engine/types";
import { createCareer } from "@/game-engine/career";
import type { AthleteCreationInput } from "@/lib/schemas";

export const DEMO_CAREER_ID = "demo-career";
const DEMO_CREATED_AT = "2025-08-01T12:00:00.000Z";

const DEMO_INPUT: AthleteCreationInput = {
  firstName: "Jordan",
  lastName: "Vale",
  jerseyNumber: 7,
  hometown: "Cedar Falls, IA",
  heightInches: 74,
  weightLbs: 210,
  position: "QB",
  playStyle: "Dual Threat",
  personality: "Natural Leader",
  academicStrength: "Communications",
  difficulty: "Starter",
  seed: "campus-legend-demo",
  avatar: { skinTone: 2, jerseyStyle: 1, accent: 0 },
};

/** Build the demo career fresh (deterministic). */
export function buildDemoCareer(): CareerState {
  const career = createCareer({
    input: DEMO_INPUT,
    schoolId: "prairie-central",
    id: DEMO_CAREER_ID,
    createdAtIso: DEMO_CREATED_AT,
    isDemo: true,
  });

  // Pre-populate a few weeks of progress for a lived-in demo hub.
  career.resources = {
    ...career.resources,
    campusReputation: 46,
    nationalReputation: 32,
    coachTrust: 62,
    socialFollowing: 18400,
    money: 4200,
    draftStock: 44,
    confidence: 74,
  };
  career.depthChart = {
    ...career.depthChart,
    role: "Starter",
    rank: 1,
    lastMovementReason: "You won the starting job with a strong camp.",
  };
  career.weekOfSeason = 6;
  career.season = { ...career.season, phase: "Regular", wins: 4, losses: 1 };
  career.achievements = career.achievements.map((a) =>
    ["first-start", "first-win", "first-deal"].includes(a.id)
      ? { ...a, unlockedWeek: 3 }
      : a,
  );

  return career;
}
