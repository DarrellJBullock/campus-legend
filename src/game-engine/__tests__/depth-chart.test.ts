import { describe, it, expect } from "vitest";
import {
  depthScore,
  roleForRank,
  recomputeDepthChart,
  playsInGames,
  rolePriority,
  type DepthInputs,
} from "@/game-engine/depth-chart";
import { defaultResources } from "@/game-engine/energy";
import type { DepthChart } from "@/game-engine/types";

const baseInputs: DepthInputs = {
  overall: 70,
  coachTrust: 60,
  recentTrainingBoost: 8,
  discipline: 70,
  health: 90,
  lastGameScore: 60,
  schemeFit: 70,
};

describe("depth chart", () => {
  it("higher inputs produce a higher depth score", () => {
    const low = depthScore({ ...baseInputs, overall: 50, coachTrust: 30 });
    const high = depthScore({ ...baseInputs, overall: 90, coachTrust: 90 });
    expect(high).toBeGreaterThan(low);
  });

  it("rank 1 with high national rep becomes a star role", () => {
    expect(roleForRank(1, 80, false)).toBe("National Star");
    expect(roleForRank(1, 55, false)).toBe("Conference Star");
    expect(roleForRank(1, 10, false)).toBe("Starter");
  });

  it("redshirt overrides role", () => {
    expect(roleForRank(1, 90, true)).toBe("Redshirt");
  });

  it("promotion produces an upward movement reason", () => {
    const prev: DepthChart = {
      role: "Reserve",
      rank: 3,
      competitors: [
        {
          id: "c1",
          name: "Rival A",
          year: "Senior",
          overall: 60,
          role: "Reserve",
        },
        {
          id: "c2",
          name: "Rival B",
          year: "Junior",
          overall: 62,
          role: "Reserve",
        },
      ],
      lastMovementReason: "",
    };
    const next = recomputeDepthChart(
      prev,
      { ...baseInputs, overall: 85, lastGameScore: 80 },
      defaultResources({ nationalReputation: 20 }),
      false,
    );
    expect(next.rank).toBe(1);
    expect(next.lastMovementReason.length).toBeGreaterThan(0);
  });

  it("reserves and redshirts do not play in games", () => {
    expect(playsInGames("Redshirt")).toBe(false);
    expect(playsInGames("Reserve")).toBe(false);
    expect(playsInGames("Starter")).toBe(true);
  });

  it("role priority is ordered", () => {
    expect(rolePriority("National Star")).toBeGreaterThan(
      rolePriority("Starter"),
    );
  });
});
