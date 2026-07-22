/**
 * Academics — study readiness, exams, GPA, and eligibility.
 *
 * GPA is bounded 0.0–4.0 (enforced in energy.normalize). Exam scores derive
 * from accumulated study readiness plus the academic-strength/course-difficulty
 * matchup, with seeded variance. Poor academics cascade into eligibility, coach
 * trust, and sponsorship access.
 */

import {
  type AcademicTerm,
  type Course,
  type AcademicStrength,
  GPA_MAX,
} from "./types";
import type { Rng } from "./random";
import { clamp, round } from "@/lib/utils";

/** Score a single exam 0–100 from readiness, fit, difficulty, and variance. */
export function examScore(
  readiness: number,
  strength: AcademicStrength,
  course: Course,
  rng: Rng,
): number {
  const fit = course.department === strength ? 10 : 0;
  const difficultyPenalty = (course.difficulty - 3) * 6; // easier > 0, harder < 0
  const base = readiness * 0.8 + 20 + fit - difficultyPenalty;
  const variance = rng.gaussian(0, 6);
  return clamp(round(base + variance), 0, 100);
}

/** Convert a 0–100 exam average into a 0.0–4.0 GPA on a credit-weighted basis. */
export function scoreToGpa(score: number): number {
  // 90+→4.0, 80→3.0, 70→2.0, 60→1.0, <55→0.0 (linear bands).
  if (score >= 90) return 4.0;
  if (score >= 55) return round(((score - 50) / 40) * 4, 2);
  return round(clamp((score / 50) * 1.0, 0, GPA_MAX), 2);
}

/**
 * Run midterms or finals for the term. Returns updated term with scores and a
 * computed term GPA (credit-weighted across courses).
 */
export function runExams(
  term: AcademicTerm,
  strength: AcademicStrength,
  kind: "midterm" | "final",
  rng: Rng,
): { term: AcademicTerm; termGpa: number } {
  let weighted = 0;
  let credits = 0;
  let scoreSum = 0;
  for (const course of term.courses) {
    const s = examScore(term.studyProgress, strength, course, rng);
    scoreSum += s;
    weighted += scoreToGpa(s) * course.credits;
    credits += course.credits;
  }
  const avgScore = term.courses.length ? scoreSum / term.courses.length : 0;
  const termGpa = credits ? round(weighted / credits, 2) : 0;
  const nextTerm: AcademicTerm = {
    ...term,
    midtermScore: kind === "midterm" ? round(avgScore) : term.midtermScore,
    finalScore: kind === "final" ? round(avgScore) : term.finalScore,
    termGpa,
  };
  return { term: nextTerm, termGpa };
}

/** Blend a term GPA into the cumulative GPA (weighted toward recent work). */
export function updateCumulativeGpa(current: number, termGpa: number): number {
  return round(current * 0.6 + termGpa * 0.4, 2);
}

/** Weekly natural decay of study readiness if the player never studies. */
export function decayStudyProgress(term: AcademicTerm): AcademicTerm {
  return { ...term, studyProgress: clamp(term.studyProgress - 6, 0, 100) };
}

/** Graduation progress: fraction of the 4-year path completed. */
export function graduationProgress(
  season: number,
  weekOfSeason: number,
): number {
  const totalWeeks = 4 * 16;
  const done = (season - 1) * 16 + weekOfSeason;
  return clamp(round((done / totalWeeks) * 100), 0, 100);
}
