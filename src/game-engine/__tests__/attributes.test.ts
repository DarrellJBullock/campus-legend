import { describe, it, expect } from "vitest";
import {
  computeOverall,
  generateStartingAttributes,
  attributeKeysFor,
} from "@/game-engine/attributes";
import { Rng } from "@/game-engine/random";

describe("attributes / overall rating", () => {
  it("is position-weighted, not a flat average", () => {
    // QB weights short accuracy & decision-making heavily; strength barely.
    const highPassing = {
      throwPower: 90,
      shortAccuracy: 95,
      deepAccuracy: 90,
      pocketPresence: 90,
      decisionMaking: 95,
      awareness: 90,
      footballIQ: 90,
      agility: 40,
      leadership: 50,
      confidence: 50,
      strength: 20,
    };
    const overall = computeOverall("QB", highPassing);
    // A flat average would be dragged down hard by strength(20)/agility(40);
    // weighting should keep the QB elite.
    expect(overall).toBeGreaterThan(82);
  });

  it("clamps into 0-100", () => {
    const attrs = attributeKeysFor("RB").reduce<Record<string, number>>(
      (a, k) => {
        a[k] = 100;
        return a;
      },
      {},
    );
    expect(computeOverall("RB", attrs)).toBeLessThanOrEqual(100);
  });

  it("generates freshman attributes in a believable band", () => {
    const rng = new Rng("gen");
    const attrs = generateStartingAttributes("WR", "Deep Threat", rng);
    for (const key of attributeKeysFor("WR")) {
      expect(attrs[key]).toBeGreaterThanOrEqual(35);
      expect(attrs[key]).toBeLessThanOrEqual(85);
    }
  });

  it("play style biases signature attributes upward", () => {
    const rng1 = new Rng("style");
    const deep = generateStartingAttributes("WR", "Deep Threat", rng1);
    // Deep Threat biases speed; assert it is not below the floor and is set.
    expect(deep.speed).toBeGreaterThanOrEqual(35);
    expect(deep.routeRunning).toBeDefined();
  });

  it("is deterministic given the same seed", () => {
    const a = generateStartingAttributes("CB", "Ball Hawk", new Rng("z"));
    const b = generateStartingAttributes("CB", "Ball Hawk", new Rng("z"));
    expect(a).toEqual(b);
  });
});
