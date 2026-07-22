/**
 * Career factory — assembles a complete `CareerState` from creation input.
 *
 * This is the single entry point for starting a new career (guest or account).
 * It wires together every engine module's initial state so the rest of the app
 * only ever deals with a fully-formed, normalized career object.
 */

import {
  type CareerState,
  type Athlete,
  type AcademicTerm,
  type Opponent,
  type DepthChart,
  type Competitor,
  ACTION_POINTS_PER_WEEK,
} from "@/game-engine/types";
import { Rng } from "@/game-engine/random";
import {
  generateStartingAttributes,
  computeOverall,
} from "@/game-engine/attributes";
import { defaultResources } from "@/game-engine/energy";
import { defaultRelationships } from "@/game-engine/relationships";
import { initialAchievements } from "@/game-engine/achievements";
import { buildSchedule, initialSeasonState } from "@/game-engine/season";
import { SCHOOLS, getSchool } from "@/content/schools";
import { coursesForDepartment, generalCourses } from "@/content/courses";
import type { AthleteCreationInput } from "@/lib/schemas";

const DIFFICULTY_MOD: Record<AthleteCreationInput["difficulty"], number> = {
  Recruit: 6,
  Starter: 0,
  "All-American": -5,
  Legend: -10,
};

/** Build the opponent pool for a school's season (11 others + non-conf filler). */
function opponentPool(
  schoolId: string,
  rng: Rng,
): { opponents: Opponent[]; rivalId: string } {
  const others = SCHOOLS.filter((s) => s.id !== schoolId);
  const shuffled = rng.shuffle(others).slice(0, 12);
  const opponents: Opponent[] = shuffled.map((s, i) => ({
    id: s.id,
    schoolId: s.id,
    name: `${s.name} ${s.mascot}`,
    strength: Math.round((s.athleticPrestige + s.coachingRating) / 2),
    isRival: i === 0,
    isConference: getSchool(schoolId)?.conferenceId === s.conferenceId,
  }));
  return { opponents, rivalId: opponents[0]?.id ?? "" };
}

export function initialDepthChart(overall: number, rng: Rng): DepthChart {
  const names = [
    "Cole Bishop",
    "Zane Portis",
    "Eli Transom",
    "Rey Calloway",
    "Nash Verdi",
  ];
  const competitors: Competitor[] = rng
    .shuffle(names)
    .slice(0, 3)
    .map((name, i) => ({
      id: `comp-${i}`,
      name: name.replace(/\b\w/g, (m) => m.toUpperCase()),
      year: i === 0 ? "Senior" : i === 1 ? "Junior" : "Sophomore",
      overall: Math.round(overall + rng.gaussian(8 - i * 3, 4)),
      role: i === 0 ? "Starter" : "Reserve",
    }));
  return {
    role: "Reserve",
    rank: competitors.filter((c) => c.overall > overall).length + 1,
    competitors,
    lastMovementReason: "You arrive on campus as a freshman recruit.",
  };
}

function initialAcademics(input: AthleteCreationInput): AcademicTerm {
  const major = coursesForDepartment(input.academicStrength);
  const gened = generalCourses().filter(
    (c) => !major.some((m) => m.id === c.id),
  );
  const courses = [...major.slice(0, 3), ...gened.slice(0, 1)];
  return {
    season: 1,
    term: "Fall",
    courses: courses.length ? courses : gened.slice(0, 4),
    studyProgress: 40,
    midtermScore: null,
    finalScore: null,
    termGpa: null,
  };
}

export interface NewCareerOptions {
  input: AthleteCreationInput;
  schoolId: string;
  id: string;
  createdAtIso: string;
  isDemo?: boolean;
}

export function createCareer(opts: NewCareerOptions): CareerState {
  const { input, schoolId, id, createdAtIso, isDemo = false } = opts;
  const seed =
    input.seed?.trim() || `${input.firstName}-${input.lastName}-${id}`;
  const rng = new Rng(seed);

  const attributes = generateStartingAttributes(
    input.position,
    input.playStyle,
    rng,
    DIFFICULTY_MOD[input.difficulty],
  );
  const overall = computeOverall(input.position, attributes);

  const athlete: Athlete = {
    firstName: input.firstName,
    lastName: input.lastName,
    jerseyNumber: input.jerseyNumber,
    hometown: input.hometown,
    heightInches: input.heightInches,
    weightLbs: input.weightLbs,
    position: input.position,
    playStyle: input.playStyle,
    personality: input.personality,
    academicStrength: input.academicStrength,
    avatar: input.avatar,
    attributes,
  };

  const { opponents, rivalId } = opponentPool(schoolId, rng);
  const schedule = buildSchedule(opponents, rivalId, rng);

  return {
    schemaVersion: 1,
    id,
    name: `${input.firstName} ${input.lastName}`,
    createdAt: createdAtIso,
    updatedAt: createdAtIso,
    seed,
    rngCursor: rng.getCursor(),
    difficulty: input.difficulty,
    isDemo,
    athlete,
    schoolId,
    resources: defaultResources(),
    depthChart: initialDepthChart(overall, rng),
    relationships: defaultRelationships((n) => rng.int(0, n - 1)),
    academics: initialAcademics(input),
    activeInjury: null,
    season: initialSeasonState(1, schedule),
    weekOfSeason: 1,
    actionPoints: ACTION_POINTS_PER_WEEK,
    actionsThisWeek: [],
    activeSponsorships: [],
    offeredSponsorIds: [],
    awards: [],
    achievements: initialAchievements(),
    news: [],
    transactions: [],
    pendingEffects: [],
    completedEventIds: [],
    queuedEventIds: [],
    gameLog: [],
    ending: null,
  };
}
