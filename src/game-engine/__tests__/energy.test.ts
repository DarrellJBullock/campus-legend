import { describe, it, expect } from "vitest";
import {
  applyDelta,
  defaultResources,
  normalize,
  deriveEligibility,
  weeklyResourceDrift,
} from "@/game-engine/energy";

describe("energy / resource bounds", () => {
  it("never lets energy drop below zero", () => {
    const r = defaultResources({ energy: 10 });
    const next = applyDelta(r, { energy: -50 });
    expect(next.energy).toBe(0);
  });

  it("never lets a percent resource exceed 100", () => {
    const r = defaultResources({ confidence: 95 });
    const next = applyDelta(r, { confidence: 50 });
    expect(next.confidence).toBe(100);
  });

  it("clamps GPA to 4.0 and never negative", () => {
    expect(normalize(defaultResources({ gpa: 5 })).gpa).toBe(4);
    expect(normalize(defaultResources({ gpa: -1 })).gpa).toBe(0);
  });

  it("never lets money go negative", () => {
    const r = defaultResources({ money: 100 });
    expect(applyDelta(r, { money: -500 }).money).toBe(0);
  });

  it("derives eligibility from GPA", () => {
    expect(deriveEligibility(3.5, "Eligible")).toBe("Eligible");
    expect(deriveEligibility(2.4, "Eligible")).toBe("Warning");
    expect(deriveEligibility(2.1, "Eligible")).toBe("Probation");
    expect(deriveEligibility(1.5, "Eligible")).toBe("Ineligible");
  });

  it("weekly drift recovers energy and reduces fatigue within bounds", () => {
    const r = defaultResources({ energy: 50, fatigue: 40, stress: 30 });
    const next = weeklyResourceDrift(r);
    expect(next.energy).toBeGreaterThan(50);
    expect(next.fatigue).toBeLessThan(40);
    expect(next.energy).toBeLessThanOrEqual(100);
    expect(next.fatigue).toBeGreaterThanOrEqual(0);
  });
});
