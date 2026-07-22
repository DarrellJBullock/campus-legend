import { describe, it, expect } from "vitest";
import {
  simulateGame,
  performanceScore,
  performanceGrade,
  generateStats,
  buildGameDayDecisions,
  type SimInputs,
} from "@/game-engine/game-simulation";
import { Rng } from "@/game-engine/random";
import { defaultResources } from "@/game-engine/energy";
import { generateStartingAttributes } from "@/game-engine/attributes";
import type { Athlete, Opponent, Position } from "@/game-engine/types";

function makeAthlete(position: Position): Athlete {
  return {
    firstName: "Test",
    lastName: "Player",
    jerseyNumber: 7,
    hometown: "Anywhere",
    heightInches: 74,
    weightLbs: 210,
    position,
    playStyle: "Field General",
    personality: "Coachable",
    academicStrength: "STEM",
    avatar: { skinTone: 0, jerseyStyle: 0, accent: 0 },
    attributes: generateStartingAttributes(
      position,
      "Field General",
      new Rng("a"),
    ),
  };
}

const opponent: Opponent = {
  id: "opp",
  schoolId: "s",
  name: "Test Tech",
  strength: 55,
  isRival: false,
  isConference: true,
};

function makeInputs(
  position: Position,
  overrides: Partial<SimInputs> = {},
): SimInputs {
  return {
    athlete: makeAthlete(position),
    resources: defaultResources(),
    opponent,
    teamQuality: 60,
    home: true,
    schemeFit: 65,
    weather: "Clear",
    decisionMod: 0,
    week: 1,
    season: 1,
    ...overrides,
  };
}

describe("game simulation", () => {
  it("is fully deterministic for the same seed and inputs", () => {
    const a = simulateGame(makeInputs("QB"), new Rng("game-1"));
    const b = simulateGame(makeInputs("QB"), new Rng("game-1"));
    expect(a).toEqual(b);
  });

  it("produces different results for different seeds", () => {
    const a = simulateGame(makeInputs("QB"), new Rng("game-1"));
    const b = simulateGame(makeInputs("QB"), new Rng("game-2"));
    expect(a.performanceScore).not.toEqual(b.performanceScore);
  });

  it("better players score higher on average", () => {
    const weak = makeAthlete("RB");
    for (const k of Object.keys(weak.attributes)) weak.attributes[k] = 40;
    const strong = makeAthlete("RB");
    for (const k of Object.keys(strong.attributes)) strong.attributes[k] = 90;

    let weakSum = 0;
    let strongSum = 0;
    for (let i = 0; i < 30; i++) {
      weakSum += performanceScore(
        makeInputs("RB", { athlete: weak }),
        new Rng(`w${i}`),
      );
      strongSum += performanceScore(
        makeInputs("RB", { athlete: strong }),
        new Rng(`s${i}`),
      );
    }
    expect(strongSum / 30).toBeGreaterThan(weakSum / 30);
  });

  it("generates position-specific stat lines", () => {
    const qb = generateStats("QB", 80, new Rng("qb"));
    expect(qb.passAttempts).toBeDefined();
    expect(qb.completions! <= qb.passAttempts!).toBe(true);

    const cb = generateStats("CB", 80, new Rng("cb"));
    expect(cb.targetsAllowed).toBeDefined();
    expect(cb.passAttempts).toBeUndefined();
  });

  it("touchdowns are not guaranteed every game, even at an average performance", () => {
    // Regression: passTds used to be round(mean * swing()), whose 0.75
    // swing floor made at least one TD almost certain any time mean > ~0.2.
    let zeroCount = 0;
    const N = 200;
    for (let i = 0; i < N; i++) {
      const stats = generateStats("QB", 55, new Rng(`qb-td-${i}`));
      if ((stats.passTds ?? 0) === 0) zeroCount++;
    }
    expect(zeroCount).toBeGreaterThan(0);
    expect(zeroCount).toBeLessThan(N);
  });

  it("assigns a valid letter grade", () => {
    expect(performanceGrade(95)).toBe("A+");
    expect(performanceGrade(10)).toBe("F");
  });

  it("scores are non-negative and recap is populated", () => {
    const result = simulateGame(makeInputs("WR"), new Rng("recap"));
    expect(result.playerScore).toBeGreaterThanOrEqual(0);
    expect(result.opponentScore).toBeGreaterThanOrEqual(0);
    expect(result.headline.length).toBeGreaterThan(0);
    expect(result.keyPlays.length).toBeGreaterThan(0);
    expect(result.coachFeedback.length).toBeGreaterThan(0);
  });

  it("offers exactly two game-day decisions", () => {
    const decisions = buildGameDayDecisions(
      "QB",
      defaultResources(),
      new Rng("d"),
    );
    expect(decisions).toHaveLength(2);
    for (const d of decisions)
      expect(d.options.length).toBeGreaterThanOrEqual(2);
  });
});
