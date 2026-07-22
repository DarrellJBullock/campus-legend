/**
 * Deterministic seeded RNG (mulberry32 + xmur3 string hashing).
 *
 * Simulation must be reproducible: the same seed + same cursor position always
 * yields the same sequence. We expose a stateful generator plus pure helpers so
 * callers can either thread cursor state through a save or spin up an ephemeral
 * generator for a single simulation.
 */

/** Hash an arbitrary string seed into a 32-bit integer. */
export function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** mulberry32 core — returns a float in [0, 1). */
function mulberry32(a: number): number {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export class Rng {
  private state: number;
  private cursor: number;

  constructor(seed: string | number, cursor = 0) {
    this.state = typeof seed === "number" ? seed >>> 0 : hashSeed(seed);
    this.cursor = cursor;
    // Fast-forward to the saved cursor so resumed careers stay deterministic.
    for (let i = 0; i < cursor; i++) this.advance();
  }

  private advance(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    return mulberry32(this.state - 0x6d2b79f5);
  }

  /** Float in [0, 1). */
  next(): number {
    this.cursor++;
    return this.advance();
  }

  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Float in [min, max). */
  float(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /** True with probability p (0–1). */
  chance(p: number): boolean {
    return this.next() < p;
  }

  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error("Rng.pick: empty array");
    return arr[this.int(0, arr.length - 1)]!;
  }

  /** Fisher–Yates shuffle (returns a new array). */
  shuffle<T>(arr: readonly T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [out[i], out[j]] = [out[j]!, out[i]!];
    }
    return out;
  }

  /**
   * Approximate normal distribution via averaging (central limit).
   * Returns a value centered on `mean` with the given `stdDev`, clamped
   * to [mean - 3sd, mean + 3sd].
   */
  gaussian(mean: number, stdDev: number): number {
    let sum = 0;
    for (let i = 0; i < 6; i++) sum += this.next();
    const norm = (sum - 3) / Math.sqrt(0.5); // ~N(0,1)
    return mean + norm * stdDev;
  }

  getCursor(): number {
    return this.cursor;
  }
}

/** Convenience: build an Rng from a career's seed + saved cursor. */
export function rngFor(seed: string, cursor: number): Rng {
  return new Rng(seed, cursor);
}
