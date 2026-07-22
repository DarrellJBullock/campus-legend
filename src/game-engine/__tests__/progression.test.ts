import { describe, it, expect } from "vitest";
import {
  diminishingFactor,
  developmentMultiplier,
  applyGrowth,
} from "@/game-engine/progression";

describe("progression / attribute growth", () => {
  it("applies diminishing returns as ratings climb", () => {
    expect(diminishingFactor(40)).toBeGreaterThan(diminishingFactor(90));
  });

  it("a 90 attribute grows slower than a 50 attribute given the same raw gain", () => {
    const mult = 1;
    const low = applyGrowth({ speed: 50 }, { speed: 10 }, mult).speed!;
    const high = applyGrowth({ speed: 90 }, { speed: 10 }, mult).speed!;
    expect(low - 50).toBeGreaterThan(high - 90);
  });

  it("development multiplier rewards work ethic and coaching", () => {
    const low = developmentMultiplier(20, 20);
    const high = developmentMultiplier(95, 95);
    expect(high).toBeGreaterThan(low);
  });

  it("never exceeds 100", () => {
    const grown = applyGrowth({ strength: 99 }, { strength: 50 }, 2);
    expect(grown.strength).toBeLessThanOrEqual(100);
  });
});
