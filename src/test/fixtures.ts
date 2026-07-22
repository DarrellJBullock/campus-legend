/**
 * Shared test fixtures for component tests. Builds deterministic `CareerState`
 * objects via the real `createCareer` factory (same path production code uses)
 * so tests exercise real engine wiring instead of hand-rolled mock shapes.
 */

import type { CareerState } from "@/game-engine/types";
import { createCareer } from "@/game-engine/career";
import type { AthleteCreationInput } from "@/lib/schemas";

export const TEST_ATHLETE_INPUT: AthleteCreationInput = {
  firstName: "Test",
  lastName: "Athlete",
  jerseyNumber: 12,
  hometown: "Testville, TX",
  heightInches: 72,
  weightLbs: 200,
  position: "QB",
  playStyle: "Field General",
  personality: "Coachable",
  academicStrength: "Undecided",
  difficulty: "Starter",
  seed: "test-fixture-seed",
  avatar: { skinTone: 0, jerseyStyle: 0, accent: 0 },
};

/** A fresh, deterministic week-1 career for component tests. */
export function createTestCareer(
  overrides: Partial<CareerState> = {},
): CareerState {
  const career = createCareer({
    input: TEST_ATHLETE_INPUT,
    schoolId: "prairie-central",
    id: "test-career",
    createdAtIso: "2025-08-01T12:00:00.000Z",
  });
  return { ...career, ...overrides };
}
