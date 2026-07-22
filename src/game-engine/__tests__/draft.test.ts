import { describe, it, expect } from "vitest";
import {
  computeDraftStock,
  draftOutcome,
  resolveEnding,
  runCombine,
  positionValue,
  consistencyScore,
  productionScore,
} from "@/game-engine/draft";
import { Rng } from "@/game-engine/random";
import type { CareerState, GameResult } from "@/game-engine/types";
import { generateStartingAttributes } from "@/game-engine/attributes";
import { defaultResources } from "@/game-engine/energy";

function fakeGame(perf: number, season = 1): GameResult {
  return {
    week: 1,
    season,
    opponentName: "X",
    isRival: false,
    playerScore: 21,
    opponentScore: 14,
    win: true,
    stats: {},
    performanceGrade: "B",
    performanceScore: perf,
    keyPlays: [],
    coachFeedback: "",
    headline: "",
    attributeXp: 0,
    injury: null,
    reputationDelta: 0,
    draftStockDelta: 0,
    depthChartEffect: "",
  };
}

describe("draft stock", () => {
  it("rewards higher overall and production", () => {
    const low = computeDraftStock({
      overall: 50,
      production: 40,
      awards: 0,
      healthHistory: 80,
      characterScore: 50,
      competitionLevel: 40,
      academicStanding: 60,
      consistency: 50,
      positionValue: 60,
    });
    const high = computeDraftStock({
      overall: 92,
      production: 90,
      awards: 80,
      healthHistory: 90,
      characterScore: 85,
      competitionLevel: 85,
      academicStanding: 90,
      consistency: 88,
      positionValue: 100,
    });
    expect(high).toBeGreaterThan(low);
    expect(high).toBeLessThanOrEqual(100);
  });

  it("QB carries the highest position value", () => {
    expect(positionValue("QB")).toBeGreaterThan(positionValue("RB"));
  });

  it("maps stock to draft outcomes", () => {
    expect(draftOutcome(90)).toBe("firstRound");
    expect(draftOutcome(70)).toBe("midRound");
    expect(draftOutcome(50)).toBe("lateRound");
    expect(draftOutcome(20)).toBe("undrafted");
  });

  it("production and consistency reflect the game log", () => {
    const steady = [fakeGame(70), fakeGame(72), fakeGame(71)];
    const streaky = [fakeGame(40), fakeGame(95), fakeGame(50)];
    expect(consistencyScore(steady)).toBeGreaterThan(consistencyScore(streaky));
    expect(productionScore(steady)).toBeGreaterThan(0);
  });
});

describe("career endings", () => {
  it("career-ending injury overrides everything", () => {
    expect(
      resolveEnding({
        finalStock: 90,
        gpa: 3.5,
        eligibilityIneligible: false,
        hadCareerEndingInjury: true,
        season: 4,
        graduated: true,
        isNationalStar: true,
      }),
    ).toBe("careerEndingInjury");
  });

  it("academic dismissal when ineligible with low GPA", () => {
    expect(
      resolveEnding({
        finalStock: 60,
        gpa: 1.5,
        eligibilityIneligible: true,
        hadCareerEndingInjury: false,
        season: 4,
        graduated: false,
        isNationalStar: false,
      }),
    ).toBe("academicDismissal");
  });

  it("first-round national star becomes a campus legend", () => {
    expect(
      resolveEnding({
        finalStock: 90,
        gpa: 3.0,
        eligibilityIneligible: false,
        hadCareerEndingInjury: false,
        season: 4,
        graduated: true,
        isNationalStar: true,
      }),
    ).toBe("campusLegend");
  });

  it("early low stock recommends returning to school", () => {
    expect(
      resolveEnding({
        finalStock: 40,
        gpa: 3.0,
        eligibilityIneligible: false,
        hadCareerEndingInjury: false,
        season: 2,
        graduated: false,
        isNationalStar: false,
      }),
    ).toBe("returnedToSchool");
  });
});

describe("combine", () => {
  it("is deterministic and athleticism-driven", () => {
    const career = {
      athlete: {
        position: "WR",
        attributes: generateStartingAttributes(
          "WR",
          "Deep Threat",
          new Rng("c"),
        ),
      },
      resources: defaultResources(),
    } as unknown as CareerState;
    const a = runCombine(career, new Rng("combine"));
    const b = runCombine(career, new Rng("combine"));
    expect(a).toEqual(b);
    expect(a.fortyYard).toBeGreaterThan(4);
    expect(a.fortyYard).toBeLessThan(6);
  });
});
