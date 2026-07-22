import { describe, it, expect } from "vitest";
import {
  examScore,
  scoreToGpa,
  runExams,
  updateCumulativeGpa,
  graduationProgress,
} from "@/game-engine/academics";
import { Rng } from "@/game-engine/random";
import type { AcademicTerm, Course } from "@/game-engine/types";

const courses: Course[] = [
  { id: "c1", name: "Calc I", department: "STEM", credits: 4, difficulty: 4 },
  {
    id: "c2",
    name: "Comp 101",
    department: "Communications",
    credits: 3,
    difficulty: 2,
  },
];

const term: AcademicTerm = {
  season: 1,
  term: "Fall",
  courses,
  studyProgress: 80,
  midtermScore: null,
  finalScore: null,
  termGpa: null,
};

describe("academics", () => {
  it("higher readiness yields higher exam scores on average", () => {
    const rng = new Rng("exam");
    const low = examScore(20, "STEM", courses[0]!, rng);
    const high = examScore(95, "STEM", courses[0]!, rng);
    expect(high).toBeGreaterThan(low);
  });

  it("maps scores to a 0-4 GPA", () => {
    expect(scoreToGpa(95)).toBe(4);
    expect(scoreToGpa(90)).toBe(4);
    expect(scoreToGpa(30)).toBeLessThan(1);
    expect(scoreToGpa(90)).toBeLessThanOrEqual(4);
  });

  it("runExams produces a bounded term GPA", () => {
    const { termGpa } = runExams(term, "STEM", "final", new Rng("run"));
    expect(termGpa).toBeGreaterThanOrEqual(0);
    expect(termGpa).toBeLessThanOrEqual(4);
  });

  it("cumulative GPA blends toward the new term", () => {
    expect(updateCumulativeGpa(3.0, 4.0)).toBeGreaterThan(3.0);
    expect(updateCumulativeGpa(3.0, 2.0)).toBeLessThan(3.0);
  });

  it("graduation progress increases across seasons", () => {
    expect(graduationProgress(1, 1)).toBeLessThan(graduationProgress(4, 12));
    expect(graduationProgress(4, 16)).toBeLessThanOrEqual(100);
  });
});
