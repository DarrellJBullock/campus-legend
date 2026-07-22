import { describe, it, expect } from "vitest";
import { injuryProbability, rollInjury } from "@/game-engine/injuries";
import { defaultResources } from "@/game-engine/energy";
import { Rng } from "@/game-engine/random";
import {
  weeklyActionsFor,
  projectAction,
  executeAction,
} from "@/game-engine/training";

describe("injuries", () => {
  it("probability rises with fatigue and load", () => {
    const rested = defaultResources({ fatigue: 0, health: 100, injuryRisk: 5 });
    const gassed = defaultResources({
      fatigue: 90,
      health: 60,
      injuryRisk: 40,
    });
    expect(injuryProbability(gassed, 60)).toBeGreaterThan(
      injuryProbability(rested, 60),
    );
  });

  it("probability is bounded 0-0.9", () => {
    const r = defaultResources({ fatigue: 100, health: 0, injuryRisk: 100 });
    expect(injuryProbability(r, 100)).toBeLessThanOrEqual(0.9);
  });

  it("rollInjury returns null when risk is effectively zero", () => {
    const r = defaultResources({ fatigue: 0, health: 100, injuryRisk: 0 });
    // load 0 → probability contribution minimal; many seeds should yield null.
    const results = Array.from({ length: 20 }, (_, i) =>
      rollInjury(r, 0, new Rng(`safe-${i}`)),
    );
    expect(results.some((x) => x === null)).toBe(true);
  });
});

describe("training", () => {
  it("provides distinct action lists including rest", () => {
    const actions = weeklyActionsFor("QB");
    expect(actions.find((a) => a.id === "rest")).toBeDefined();
    expect(actions.find((a) => a.id === "position-training")).toBeDefined();
  });

  it("projects energy cost as a negative delta", () => {
    const action = weeklyActionsFor("RB").find(
      (a) => a.id === "position-training",
    )!;
    const proj = projectAction(action, defaultResources());
    expect(proj.projectedEffects.energy).toBeLessThan(0);
  });

  it("injury-risk label reflects current fatigue/health, not just load", () => {
    const action = weeklyActionsFor("QB").find((a) => a.id === "film-study")!;
    const rested = projectAction(
      action,
      defaultResources({ fatigue: 0, health: 100, injuryRisk: 5 }),
    );
    const gassed = projectAction(
      action,
      defaultResources({ fatigue: 95, health: 40, injuryRisk: 60 }),
    );
    expect(rested.injuryChanceLabel).toBe("Low");
    expect(gassed.injuryChanceLabel).toBe("Elevated");
  });

  it("zero-load actions always show no injury risk regardless of resources", () => {
    const action = weeklyActionsFor("QB").find((a) => a.id === "rest")!;
    const proj = projectAction(
      action,
      defaultResources({ fatigue: 100, health: 0, injuryRisk: 100 }),
    );
    expect(proj.injuryChanceLabel).toBe("None");
  });

  it("training raises the trained attributes", () => {
    const rng = new Rng("train");
    const actions = weeklyActionsFor("WR");
    const action = actions.find((a) => a.id === "position-training")!;
    const attrs = {
      catching: 50,
      routeRunning: 50,
      release: 50,
      spectacularCatch: 50,
      separation: 50,
    };
    const outcome = executeAction(
      action,
      defaultResources(),
      attrs,
      80,
      70,
      rng,
    );
    expect(outcome.attributes.catching!).toBeGreaterThanOrEqual(50);
  });

  it("rest restores energy without attribute gains", () => {
    const rng = new Rng("rest");
    const action = weeklyActionsFor("LB").find((a) => a.id === "rest")!;
    const outcome = executeAction(
      action,
      defaultResources({ energy: 40 }),
      { tackling: 50 },
      50,
      50,
      rng,
    );
    expect(outcome.resources.energy).toBeGreaterThan(40);
    expect(outcome.attributes.tackling).toBe(50);
  });

  it("is deterministic given the same seed", () => {
    const action = weeklyActionsFor("CB").find(
      (a) => a.id === "strength-conditioning",
    )!;
    const base = { manCoverage: 55, strength: 55, stamina: 55, speed: 55 };
    const a = executeAction(
      action,
      defaultResources(),
      base,
      70,
      70,
      new Rng("s"),
    );
    const b = executeAction(
      action,
      defaultResources(),
      base,
      70,
      70,
      new Rng("s"),
    );
    expect(a.attributes).toEqual(b.attributes);
  });
});
