/**
 * Campus Legend — core game domain types.
 * These are the single source of truth shared by the game-engine modules,
 * the Zustand store, the Zod schemas, and the UI.
 *
 * The engine is sport-agnostic at the boundaries (career, resources, events,
 * academics, sponsorships) so a second sport can be added later without
 * rewriting auth, progression, or save management. Only the football-specific
 * pieces (positions, position attributes, game stats) live in dedicated types.
 */

export const SAVE_SCHEMA_VERSION = 1;

// ---------------------------------------------------------------------------
// Positions & play styles
// ---------------------------------------------------------------------------

export const POSITIONS = ["QB", "RB", "WR", "LB", "CB"] as const;
export type Position = (typeof POSITIONS)[number];

export const POSITION_NAMES: Record<Position, string> = {
  QB: "Quarterback",
  RB: "Running Back",
  WR: "Wide Receiver",
  LB: "Linebacker",
  CB: "Cornerback",
};

export const PLAY_STYLES: Record<Position, readonly string[]> = {
  QB: ["Field General", "Dual Threat", "Gunslinger"],
  RB: ["Power Runner", "Elusive Back", "Receiving Back"],
  WR: ["Deep Threat", "Route Technician", "Possession Receiver"],
  LB: ["Run Stopper", "Coverage Specialist", "Pass Rusher"],
  CB: ["Shutdown Corner", "Ball Hawk", "Press Specialist"],
} as const;

export type PersonalityTrait =
  | "Coachable"
  | "Fiery Competitor"
  | "Laid Back"
  | "Natural Leader"
  | "Lone Wolf"
  | "Media Darling";

export const PERSONALITY_TRAITS = [
  "Coachable",
  "Fiery Competitor",
  "Laid Back",
  "Natural Leader",
  "Lone Wolf",
  "Media Darling",
] as const satisfies readonly PersonalityTrait[];

export type AcademicStrength =
  "STEM" | "Business" | "Liberal Arts" | "Communications" | "Undecided";

export const ACADEMIC_STRENGTHS = [
  "STEM",
  "Business",
  "Liberal Arts",
  "Communications",
  "Undecided",
] as const satisfies readonly AcademicStrength[];

export type Difficulty = "Recruit" | "Starter" | "All-American" | "Legend";
export const DIFFICULTIES = [
  "Recruit",
  "Starter",
  "All-American",
  "Legend",
] as const satisfies readonly Difficulty[];

// ---------------------------------------------------------------------------
// Attributes
// ---------------------------------------------------------------------------

export const SHARED_ATTRIBUTES = [
  "speed",
  "strength",
  "agility",
  "stamina",
  "awareness",
  "discipline",
  "leadership",
  "confidence",
  "workEthic",
  "footballIQ",
] as const;
export type SharedAttribute = (typeof SHARED_ATTRIBUTES)[number];

export const POSITION_ATTRIBUTES: Record<Position, readonly string[]> = {
  QB: [
    "throwPower",
    "shortAccuracy",
    "deepAccuracy",
    "pocketPresence",
    "decisionMaking",
  ],
  RB: ["vision", "carrying", "elusiveness", "breakTackle", "receiving"],
  WR: ["catching", "routeRunning", "release", "spectacularCatch", "separation"],
  LB: ["tackling", "blockShedding", "pursuit", "coverage", "passRush"],
  CB: ["manCoverage", "zoneCoverage", "press", "ballSkills", "recoverySpeed"],
} as const;

/** Every attribute key is a 0–100 rating. */
export type Attributes = Record<string, number>;

export const ATTRIBUTE_LABELS: Record<string, string> = {
  speed: "Speed",
  strength: "Strength",
  agility: "Agility",
  stamina: "Stamina",
  awareness: "Awareness",
  discipline: "Discipline",
  leadership: "Leadership",
  confidence: "Confidence",
  workEthic: "Work Ethic",
  footballIQ: "Football IQ",
  throwPower: "Throw Power",
  shortAccuracy: "Short Accuracy",
  deepAccuracy: "Deep Accuracy",
  pocketPresence: "Pocket Presence",
  decisionMaking: "Decision Making",
  vision: "Vision",
  carrying: "Carrying",
  elusiveness: "Elusiveness",
  breakTackle: "Break Tackle",
  receiving: "Receiving",
  catching: "Catching",
  routeRunning: "Route Running",
  release: "Release",
  spectacularCatch: "Spectacular Catch",
  separation: "Separation",
  tackling: "Tackling",
  blockShedding: "Block Shedding",
  pursuit: "Pursuit",
  coverage: "Coverage",
  passRush: "Pass Rush",
  manCoverage: "Man Coverage",
  zoneCoverage: "Zone Coverage",
  press: "Press",
  ballSkills: "Ball Skills",
  recoverySpeed: "Recovery Speed",
};

// ---------------------------------------------------------------------------
// Athlete
// ---------------------------------------------------------------------------

export interface Athlete {
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  hometown: string;
  heightInches: number;
  weightLbs: number;
  position: Position;
  playStyle: string;
  personality: PersonalityTrait;
  academicStrength: AcademicStrength;
  /** Selected avatar part ids, or null for initials/silhouette fallback. */
  avatar: AvatarConfig;
  attributes: Attributes;
}

export interface AvatarConfig {
  skinTone: number;
  jerseyStyle: number;
  accent: number;
}

// ---------------------------------------------------------------------------
// Resources — bounded career state
// ---------------------------------------------------------------------------

export interface Resources {
  energy: number; // 0-100
  fatigue: number; // 0-100
  health: number; // 0-100
  injuryRisk: number; // 0-100
  confidence: number; // 0-100
  morale: number; // 0-100
  coachTrust: number; // 0-100
  teamChemistry: number; // 0-100
  campusReputation: number; // 0-100
  nationalReputation: number; // 0-100
  academicFocus: number; // 0-100
  gpa: number; // 0.0-4.0
  eligibility: EligibilityStatus;
  money: number; // dollars, >= 0
  draftStock: number; // 0-100
  socialFollowing: number; // followers, >= 0
  stress: number; // 0-100
}

export type EligibilityStatus =
  "Eligible" | "Warning" | "Probation" | "Ineligible";

// ---------------------------------------------------------------------------
// Depth chart
// ---------------------------------------------------------------------------

export type DepthRole =
  | "Redshirt"
  | "Reserve"
  | "Rotational"
  | "Starter"
  | "Captain"
  | "Conference Star"
  | "National Star";

export interface Competitor {
  id: string;
  name: string;
  year: ClassYear;
  overall: number;
  role: DepthRole;
}

export interface DepthChart {
  role: DepthRole;
  rank: number; // 1 = top of the position group
  competitors: Competitor[];
  lastMovementReason: string;
}

// ---------------------------------------------------------------------------
// Academics
// ---------------------------------------------------------------------------

export interface Course {
  id: string;
  name: string;
  department: AcademicStrength;
  credits: number;
  difficulty: number; // 1-5
}

export interface AcademicTerm {
  season: number;
  term: "Fall" | "Spring";
  courses: Course[];
  studyProgress: number; // 0-100 aggregate readiness
  midtermScore: number | null;
  finalScore: number | null;
  termGpa: number | null;
}

// ---------------------------------------------------------------------------
// Relationships
// ---------------------------------------------------------------------------

export type RelationshipKey =
  | "headCoach"
  | "positionCoach"
  | "academicAdvisor"
  | "trainer"
  | "unitLeader"
  | "rival"
  | "bestFriend"
  | "family"
  | "journalist"
  | "sponsorRep"
  | "agent";

export interface Relationship {
  key: RelationshipKey;
  name: string;
  role: string;
  level: number; // 0-100
}

// ---------------------------------------------------------------------------
// Sponsorships
// ---------------------------------------------------------------------------

export type SponsorTier =
  | "local"
  | "apparel"
  | "gaming"
  | "drink"
  | "auto"
  | "community"
  | "social"
  | "regional"
  | "national";

export interface Sponsor {
  id: string;
  company: string;
  tier: SponsorTier;
  category: string;
  basePayment: number;
  durationWeeks: number;
  weeklyObligation: string;
  reqReputation: number;
  reqFollowing: number;
  reqGpa: number;
  performanceBonus: number;
  conflictClause: string;
  personalityFit: PersonalityTrait[];
}

export interface ActiveSponsorship {
  sponsorId: string;
  signedWeek: number;
  weeksRemaining: number;
  totalEarned: number;
  obligationsMet: number;
  obligationsMissed: number;
}

// ---------------------------------------------------------------------------
// Story events (decision tree)
// ---------------------------------------------------------------------------

export type EventCategory =
  | "coachConflict"
  | "teammateRivalry"
  | "teamLeadership"
  | "academicPressure"
  | "family"
  | "campusLife"
  | "mediaInterview"
  | "socialMedia"
  | "injuryRecovery"
  | "boosterPressure"
  | "sponsorConflict"
  | "transferOpportunity"
  | "positionChange"
  | "ruleViolation"
  | "communityService"
  | "championshipPressure"
  | "draftPrep";

export type EventRarity = "common" | "uncommon" | "rare";

/** Partial deltas applied to resources when a choice is made. */
export type ResourceDelta = Partial<
  Record<Exclude<keyof Resources, "eligibility">, number>
>;

export type RelationshipDelta = Partial<Record<RelationshipKey, number>>;

export interface EventChoice {
  id: string;
  label: string;
  description?: string;
  immediate: ResourceDelta;
  relationships?: RelationshipDelta;
  attributeDelta?: Attributes;
  /** Delayed effect applied N weeks later. */
  delayed?: { weeks: number; effects: ResourceDelta; text: string };
  followUpEventId?: string;
  outcomeText: string;
}

export interface StoryEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  rarity: EventRarity;
  seasons?: number[]; // restrict to certain seasons (1-4)
  positions?: Position[]; // restrict to certain positions
  trigger?: EventTrigger;
  choices: EventChoice[];
}

export interface EventTrigger {
  minReputation?: number;
  maxReputation?: number;
  minCoachTrust?: number;
  maxCoachTrust?: number;
  minStress?: number;
  maxGpa?: number;
  minSocialFollowing?: number;
  requiresRole?: DepthRole[];
}

// ---------------------------------------------------------------------------
// Games & simulation
// ---------------------------------------------------------------------------

export interface Opponent {
  id: string;
  schoolId: string;
  name: string;
  strength: number; // 0-100
  isRival: boolean;
  isConference: boolean;
}

export type Weather = "Clear" | "Rain" | "Wind" | "Snow" | "Heat";

export interface GameDayDecision {
  id: string;
  prompt: string;
  options: {
    id: string;
    label: string;
    riskReward: string;
    performanceMod: number; // additive to performance score
    variance: number; // extra randomness
    resource?: ResourceDelta;
  }[];
}

/** Position-keyed stat line. Only relevant keys are populated. */
export interface GameStatLine {
  // QB
  passAttempts?: number;
  completions?: number;
  passYards?: number;
  passTds?: number;
  interceptions?: number;
  rushYards?: number;
  // RB
  carries?: number;
  rbRushYards?: number;
  rushTds?: number;
  receptions?: number;
  recYards?: number;
  fumbles?: number;
  // WR
  targets?: number;
  wrReceptions?: number;
  wrRecYards?: number;
  wrTds?: number;
  drops?: number;
  // LB
  tackles?: number;
  tacklesForLoss?: number;
  sacks?: number;
  forcedFumbles?: number;
  passBreakups?: number;
  // CB
  cbTackles?: number;
  cbInterceptions?: number;
  cbPassBreakups?: number;
  targetsAllowed?: number;
  tdsAllowed?: number;
}

export interface GameResult {
  week: number;
  season: number;
  opponentName: string;
  isRival: boolean;
  playerScore: number;
  opponentScore: number;
  win: boolean;
  stats: GameStatLine;
  performanceGrade: string; // A+ .. F
  performanceScore: number; // 0-100
  keyPlays: string[];
  coachFeedback: string;
  headline: string;
  attributeXp: number;
  injury: InjuryReport | null;
  reputationDelta: number;
  draftStockDelta: number;
  depthChartEffect: string;
}

export interface InjuryReport {
  name: string;
  severity: "Minor" | "Moderate" | "Severe";
  weeksOut: number;
  healthImpact: number;
}

/** A currently-sidelined injury. Cleared once the absolute week reaches
 *  `returnWeekAbsolute` (see game-engine/events.ts's `absoluteWeek`). */
export interface ActiveInjury {
  name: string;
  severity: InjuryReport["severity"];
  returnWeekAbsolute: number;
}

// ---------------------------------------------------------------------------
// Season & career
// ---------------------------------------------------------------------------

export type ClassYear = "Freshman" | "Sophomore" | "Junior" | "Senior";

export const CLASS_YEARS: readonly ClassYear[] = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
];

export type SeasonPhase =
  "Preseason" | "Regular" | "Bye" | "Rivalry" | "Postseason" | "Offseason";

export interface ScheduleGame {
  week: number;
  opponent: Opponent;
  played: boolean;
  result: GameResult | null;
  home: boolean;
}

export interface SeasonState {
  season: number; // 1-4
  classYear: ClassYear;
  phase: SeasonPhase;
  wins: number;
  losses: number;
  schedule: ScheduleGame[];
  redshirted: boolean;
}

export interface Award {
  id: string;
  name: string;
  description: string;
  season: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedWeek: number | null;
}

export interface NewsArticle {
  id: string;
  week: number;
  season: number;
  headline: string;
  body: string;
  tone: "positive" | "neutral" | "negative";
}

export interface CareerTransaction {
  id: string;
  week: number;
  season: number;
  label: string;
  amount: number; // +income / -spend
}

// ---------------------------------------------------------------------------
// Full career save
// ---------------------------------------------------------------------------

export type CareerEnding =
  | "firstRound"
  | "midRound"
  | "lateRound"
  | "undrafted"
  | "returnedToSchool"
  | "transferred"
  | "careerEndingInjury"
  | "academicDismissal"
  | "coachingPath"
  | "businessPath"
  | "campusLegend";

export interface PendingDelayedEffect {
  applyWeekAbsolute: number;
  effects: ResourceDelta;
  text: string;
}

export interface CareerState {
  schemaVersion: number;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  seed: string;
  rngCursor: number;
  difficulty: Difficulty;
  isDemo: boolean;

  athlete: Athlete;
  schoolId: string;

  resources: Resources;
  depthChart: DepthChart;
  relationships: Relationship[];
  academics: AcademicTerm;
  /** Currently sidelined injury, or null when healthy enough to play. */
  activeInjury: ActiveInjury | null;

  season: SeasonState;
  weekOfSeason: number; // 1-based within the season
  actionPoints: number;
  actionsThisWeek: string[]; // action ids used this week (prevents duplicates)

  activeSponsorships: ActiveSponsorship[];
  offeredSponsorIds: string[];

  awards: Award[];
  achievements: Achievement[];
  news: NewsArticle[];
  transactions: CareerTransaction[];

  pendingEffects: PendingDelayedEffect[];
  completedEventIds: string[];
  queuedEventIds: string[];

  gameLog: GameResult[];
  ending: CareerEnding | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const REGULAR_SEASON_GAMES = 12;
export const ACTION_POINTS_PER_WEEK = 4;
export const MAX_SEASONS = 4;
export const GPA_MAX = 4.0;
export const ELIGIBILITY_GPA_FLOOR = 2.0;
export const PROBATION_GPA_FLOOR = 2.3;
