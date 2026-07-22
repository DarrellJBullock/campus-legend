/**
 * Fictional course catalog keyed by academic department. Each season the engine
 * draws a term load from the athlete's declared strength plus general-ed fillers.
 */

import type { Course, AcademicStrength } from "@/game-engine/types";

export const COURSES: Course[] = [
  // STEM
  {
    id: "c-calc1",
    name: "Calculus I",
    department: "STEM",
    credits: 4,
    difficulty: 4,
  },
  {
    id: "c-bio",
    name: "Foundations of Biology",
    department: "STEM",
    credits: 4,
    difficulty: 3,
  },
  {
    id: "c-chem",
    name: "General Chemistry",
    department: "STEM",
    credits: 4,
    difficulty: 4,
  },
  {
    id: "c-physics",
    name: "Physics of Motion",
    department: "STEM",
    credits: 3,
    difficulty: 5,
  },
  {
    id: "c-cs",
    name: "Intro to Computer Science",
    department: "STEM",
    credits: 3,
    difficulty: 3,
  },
  {
    id: "c-stats",
    name: "Applied Statistics",
    department: "STEM",
    credits: 3,
    difficulty: 3,
  },
  // Business
  {
    id: "c-econ",
    name: "Principles of Economics",
    department: "Business",
    credits: 3,
    difficulty: 3,
  },
  {
    id: "c-acct",
    name: "Financial Accounting",
    department: "Business",
    credits: 3,
    difficulty: 4,
  },
  {
    id: "c-mgmt",
    name: "Organizational Management",
    department: "Business",
    credits: 3,
    difficulty: 2,
  },
  {
    id: "c-mktg",
    name: "Marketing Fundamentals",
    department: "Business",
    credits: 3,
    difficulty: 2,
  },
  {
    id: "c-finance",
    name: "Personal & Sports Finance",
    department: "Business",
    credits: 3,
    difficulty: 3,
  },
  // Liberal Arts
  {
    id: "c-hist",
    name: "Modern World History",
    department: "Liberal Arts",
    credits: 3,
    difficulty: 2,
  },
  {
    id: "c-phil",
    name: "Ethics & Society",
    department: "Liberal Arts",
    credits: 3,
    difficulty: 3,
  },
  {
    id: "c-lit",
    name: "American Literature",
    department: "Liberal Arts",
    credits: 3,
    difficulty: 2,
  },
  {
    id: "c-psych",
    name: "Introduction to Psychology",
    department: "Liberal Arts",
    credits: 3,
    difficulty: 2,
  },
  {
    id: "c-soc",
    name: "Sociology of Sport",
    department: "Liberal Arts",
    credits: 3,
    difficulty: 2,
  },
  // Communications
  {
    id: "c-speech",
    name: "Public Speaking",
    department: "Communications",
    credits: 3,
    difficulty: 2,
  },
  {
    id: "c-media",
    name: "Media & Society",
    department: "Communications",
    credits: 3,
    difficulty: 2,
  },
  {
    id: "c-writing",
    name: "Persuasive Writing",
    department: "Communications",
    credits: 3,
    difficulty: 3,
  },
  {
    id: "c-journalism",
    name: "Foundations of Journalism",
    department: "Communications",
    credits: 3,
    difficulty: 3,
  },
  // General education (Undecided fillers)
  {
    id: "c-firstyear",
    name: "First-Year Seminar",
    department: "Undecided",
    credits: 2,
    difficulty: 1,
  },
  {
    id: "c-wellness",
    name: "Wellness & Nutrition",
    department: "Undecided",
    credits: 2,
    difficulty: 1,
  },
  {
    id: "c-art",
    name: "Art Appreciation",
    department: "Undecided",
    credits: 2,
    difficulty: 1,
  },
  {
    id: "c-elective",
    name: "General Elective",
    department: "Undecided",
    credits: 3,
    difficulty: 2,
  },
];

export function coursesForDepartment(dept: AcademicStrength): Course[] {
  return COURSES.filter((c) => c.department === dept);
}

export function generalCourses(): Course[] {
  return COURSES.filter((c) => c.department === "Undecided");
}
