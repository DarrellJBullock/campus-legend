/**
 * Fictional schools & conferences. All names, mascots, and colors are original
 * and invented for Campus Legend — no real institutions are referenced.
 *
 * Colors are HSL triples ("H S% L%") so they can be injected directly into the
 * --team-primary / --team-secondary CSS variables at runtime.
 */

import type { Position } from "@/game-engine/types";

export interface Conference {
  id: string;
  name: string;
  region: string;
}

export interface School {
  id: string;
  conferenceId: string;
  name: string;
  city: string;
  state: string;
  mascot: string;
  primaryColor: string; // HSL triple
  secondaryColor: string; // HSL triple
  academicRating: number; // 0-100
  athleticPrestige: number; // 0-100
  coachingRating: number; // 0-100
  facilitiesRating: number; // 0-100
  mediaMarket: number; // 0-100
  scheme:
    "Pro Style" | "Air Raid" | "Spread Option" | "4-3 Defense" | "3-4 Multiple";
  /** Depth-chart competition at each position, 0-100 (higher = harder to start). */
  positionCompetition: Record<Position, number>;
}

export const CONFERENCES: Conference[] = [
  { id: "summit", name: "Summit Athletic Conference", region: "Mountain West" },
  {
    id: "tidewater",
    name: "Tidewater Collegiate League",
    region: "Atlantic Coast",
  },
  { id: "heartland", name: "Heartland Gridiron Alliance", region: "Midwest" },
];

function comp(
  qb: number,
  rb: number,
  wr: number,
  lb: number,
  cb: number,
): Record<Position, number> {
  return { QB: qb, RB: rb, WR: wr, LB: lb, CB: cb };
}

export const SCHOOLS: School[] = [
  // --- Summit Athletic Conference ---
  {
    id: "granite-peak",
    conferenceId: "summit",
    name: "Granite Peak University",
    city: "Alderstone",
    state: "CO",
    mascot: "Avalanche",
    primaryColor: "215 55% 25%",
    secondaryColor: "45 90% 55%",
    academicRating: 78,
    athleticPrestige: 88,
    coachingRating: 85,
    facilitiesRating: 90,
    mediaMarket: 72,
    scheme: "Pro Style",
    positionCompetition: comp(85, 70, 75, 68, 72),
  },
  {
    id: "silvercreek",
    conferenceId: "summit",
    name: "Silvercreek State",
    city: "Silvercreek",
    state: "MT",
    mascot: "Timberwolves",
    primaryColor: "150 40% 28%",
    secondaryColor: "40 30% 88%",
    academicRating: 70,
    athleticPrestige: 72,
    coachingRating: 74,
    facilitiesRating: 68,
    mediaMarket: 48,
    scheme: "Spread Option",
    positionCompetition: comp(60, 58, 62, 55, 60),
  },
  {
    id: "cascade-tech",
    conferenceId: "summit",
    name: "Cascade Technical Institute",
    city: "Fernvale",
    state: "OR",
    mascot: "Voltage",
    primaryColor: "260 45% 32%",
    secondaryColor: "55 95% 60%",
    academicRating: 92,
    athleticPrestige: 60,
    coachingRating: 66,
    facilitiesRating: 72,
    mediaMarket: 55,
    scheme: "Air Raid",
    positionCompetition: comp(55, 50, 58, 52, 54),
  },
  {
    id: "sierra-vista",
    conferenceId: "summit",
    name: "Sierra Vista University",
    city: "Sierra Vista",
    state: "NV",
    mascot: "Prospectors",
    primaryColor: "25 70% 40%",
    secondaryColor: "220 30% 20%",
    academicRating: 64,
    athleticPrestige: 78,
    coachingRating: 80,
    facilitiesRating: 82,
    mediaMarket: 66,
    scheme: "Pro Style",
    positionCompetition: comp(74, 72, 70, 64, 66),
  },
  // --- Tidewater Collegiate League ---
  {
    id: "harbor-point",
    conferenceId: "tidewater",
    name: "Harbor Point College",
    city: "Harbor Point",
    state: "VA",
    mascot: "Mariners",
    primaryColor: "205 65% 30%",
    secondaryColor: "45 85% 58%",
    academicRating: 84,
    athleticPrestige: 82,
    coachingRating: 83,
    facilitiesRating: 80,
    mediaMarket: 78,
    scheme: "Pro Style",
    positionCompetition: comp(80, 68, 74, 66, 70),
  },
  {
    id: "magnolia-state",
    conferenceId: "tidewater",
    name: "Magnolia State University",
    city: "Beaumont Hills",
    state: "GA",
    mascot: "Bulldogs",
    primaryColor: "0 60% 35%",
    secondaryColor: "40 35% 85%",
    academicRating: 68,
    athleticPrestige: 90,
    coachingRating: 88,
    facilitiesRating: 92,
    mediaMarket: 85,
    scheme: "Spread Option",
    positionCompetition: comp(90, 82, 84, 80, 82),
  },
  {
    id: "coastal-carolina-a",
    conferenceId: "tidewater",
    name: "Atlantic Shores University",
    city: "Dunmere",
    state: "NC",
    mascot: "Stingrays",
    primaryColor: "185 60% 32%",
    secondaryColor: "30 90% 55%",
    academicRating: 74,
    athleticPrestige: 70,
    coachingRating: 72,
    facilitiesRating: 70,
    mediaMarket: 60,
    scheme: "Air Raid",
    positionCompetition: comp(62, 60, 66, 58, 60),
  },
  {
    id: "piedmont",
    conferenceId: "tidewater",
    name: "Piedmont Union",
    city: "Rockbridge",
    state: "SC",
    mascot: "Ironhawks",
    primaryColor: "230 40% 28%",
    secondaryColor: "15 80% 52%",
    academicRating: 80,
    athleticPrestige: 66,
    coachingRating: 70,
    facilitiesRating: 74,
    mediaMarket: 58,
    scheme: "3-4 Multiple",
    positionCompetition: comp(58, 56, 60, 54, 56),
  },
  // --- Heartland Gridiron Alliance ---
  {
    id: "prairie-central",
    conferenceId: "heartland",
    name: "Prairie Central University",
    city: "Kellerton",
    state: "IA",
    mascot: "Cyclones",
    primaryColor: "210 50% 30%",
    secondaryColor: "48 92% 56%",
    academicRating: 76,
    athleticPrestige: 84,
    coachingRating: 82,
    facilitiesRating: 84,
    mediaMarket: 70,
    scheme: "Pro Style",
    positionCompetition: comp(78, 74, 72, 70, 68),
  },
  {
    id: "great-lakes",
    conferenceId: "heartland",
    name: "Great Lakes State",
    city: "Marquette Bay",
    state: "MI",
    mascot: "Freighters",
    primaryColor: "200 55% 26%",
    secondaryColor: "40 30% 86%",
    academicRating: 72,
    athleticPrestige: 80,
    coachingRating: 79,
    facilitiesRating: 78,
    mediaMarket: 82,
    scheme: "4-3 Defense",
    positionCompetition: comp(72, 70, 70, 76, 72),
  },
  {
    id: "copperhill",
    conferenceId: "heartland",
    name: "Copperhill College",
    city: "Copperhill",
    state: "OH",
    mascot: "Miners",
    primaryColor: "20 65% 38%",
    secondaryColor: "205 40% 24%",
    academicRating: 82,
    athleticPrestige: 62,
    coachingRating: 68,
    facilitiesRating: 66,
    mediaMarket: 54,
    scheme: "Spread Option",
    positionCompetition: comp(54, 52, 56, 52, 54),
  },
  {
    id: "northgate",
    conferenceId: "heartland",
    name: "Northgate University",
    city: "Northgate",
    state: "MN",
    mascot: "Sentinels",
    primaryColor: "270 40% 30%",
    secondaryColor: "45 88% 58%",
    academicRating: 88,
    athleticPrestige: 68,
    coachingRating: 73,
    facilitiesRating: 76,
    mediaMarket: 64,
    scheme: "3-4 Multiple",
    positionCompetition: comp(60, 58, 62, 60, 58),
  },
];

export function getSchool(id: string): School | undefined {
  return SCHOOLS.find((s) => s.id === id);
}

export function getConference(id: string): Conference | undefined {
  return CONFERENCES.find((c) => c.id === id);
}

export function schoolsInConference(conferenceId: string): School[] {
  return SCHOOLS.filter((s) => s.conferenceId === conferenceId);
}

/** Coaching quality proxy used by the progression development multiplier. */
export function coachingQuality(school: School): number {
  return Math.round((school.coachingRating + school.facilitiesRating) / 2);
}
