import { describe, it, expect } from "vitest";
import { Rng, hashSeed, rngFor } from "@/game-engine/random";

describe("random / seeded RNG", () => {
  it("is deterministic for the same seed", () => {
    const a = new Rng("campus-legend");
    const b = new Rng("campus-legend");
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    const a = new Rng("seed-a");
    const b = new Rng("seed-b");
    expect(a.next()).not.toEqual(b.next());
  });

  it("resumes deterministically from a saved cursor", () => {
    const fresh = new Rng("x");
    fresh.next();
    fresh.next();
    const cursor = fresh.getCursor();
    const nextExpected = fresh.next();

    const resumed = rngFor("x", cursor);
    expect(resumed.next()).toEqual(nextExpected);
  });

  it("int() stays within inclusive bounds", () => {
    const r = new Rng("bounds");
    for (let i = 0; i < 1000; i++) {
      const v = r.int(1, 6);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
    }
  });

  it("hashSeed returns a stable unsigned 32-bit int", () => {
    expect(hashSeed("abc")).toBe(hashSeed("abc"));
    expect(hashSeed("abc")).toBeGreaterThanOrEqual(0);
  });

  it("pick throws on empty array", () => {
    const r = new Rng("e");
    expect(() => r.pick([])).toThrow();
  });

  it("gaussian clusters near the mean", () => {
    const r = new Rng("g");
    let sum = 0;
    const n = 2000;
    for (let i = 0; i < n; i++) sum += r.gaussian(50, 10);
    const mean = sum / n;
    expect(mean).toBeGreaterThan(46);
    expect(mean).toBeLessThan(54);
  });
});
