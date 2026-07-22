/**
 * Relationships — recurring characters and their effect on the career.
 *
 * Relationship levels (0–100) gate events, provide bonuses, and shape endings.
 * This module owns the default cast and the helpers to read/adjust levels.
 */

import {
  type Relationship,
  type RelationshipKey,
  type RelationshipDelta,
} from "./types";
import { clamp } from "@/lib/utils";

interface CastMember {
  key: RelationshipKey;
  role: string;
  names: string[];
  start: number;
}

const CAST: CastMember[] = [
  {
    key: "headCoach",
    role: "Head Coach",
    names: ["Coach Rhodes", "Coach Vance", "Coach Merritt"],
    start: 40,
  },
  {
    key: "positionCoach",
    role: "Position Coach",
    names: ["Coach Diallo", "Coach Park", "Coach Boone"],
    start: 45,
  },
  {
    key: "academicAdvisor",
    role: "Academic Advisor",
    names: ["Dr. Alvarez", "Dr. Kimura", "Dr. Ellison"],
    start: 50,
  },
  {
    key: "trainer",
    role: "Head Trainer",
    names: ["Trainer Ruiz", "Trainer Osei", "Trainer Kane"],
    start: 50,
  },
  {
    key: "unitLeader",
    role: "Unit Leader",
    names: ["Marcus Reed", "Tre Coleman", "DJ Hollis"],
    start: 40,
  },
  {
    key: "rival",
    role: "Position Rival",
    names: ["Kayden Cruz", "Bo Whitfield", "Isaiah Frost"],
    start: 30,
  },
  {
    key: "bestFriend",
    role: "Best Friend",
    names: ["Sam Ortiz", "Jaylen Brooks", "Nate Kang"],
    start: 60,
  },
  {
    key: "family",
    role: "Family",
    names: ["Your Mother", "Your Father", "Your Sister"],
    start: 70,
  },
  {
    key: "journalist",
    role: "Student Journalist",
    names: ["Priya Nair", "Casey Lin", "Owen Tate"],
    start: 45,
  },
  {
    key: "sponsorRep",
    role: "Sponsor Rep",
    names: ["Dana Cole", "Rio Vega", "Sloan Pierce"],
    start: 35,
  },
  {
    key: "agent",
    role: "Draft Advisor",
    names: ["Vic Sterling", "Mara Quinn", "Leo Márquez"],
    start: 20,
  },
];

export function defaultRelationships(
  seedPick: (n: number) => number,
): Relationship[] {
  return CAST.map((c) => ({
    key: c.key,
    name: c.names[seedPick(c.names.length)] ?? c.names[0]!,
    role: c.role,
    level: c.start,
  }));
}

export function adjustRelationships(
  relationships: Relationship[],
  delta: RelationshipDelta,
): Relationship[] {
  return relationships.map((r) => {
    const d = delta[r.key];
    return d === undefined ? r : { ...r, level: clamp(r.level + d, 0, 100) };
  });
}

export function getRelationship(
  relationships: Relationship[],
  key: RelationshipKey,
): Relationship | undefined {
  return relationships.find((r) => r.key === key);
}

export function relationshipTier(level: number): string {
  if (level >= 85) return "Inseparable";
  if (level >= 70) return "Close";
  if (level >= 50) return "Solid";
  if (level >= 30) return "Cordial";
  if (level >= 15) return "Strained";
  return "Hostile";
}
