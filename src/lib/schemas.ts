/**
 * Zod schemas — runtime validation for athlete creation input and full save
 * blobs. Used at every trust boundary: the creation form, local-save loading
 * (guards against corrupted localStorage), and Supabase save/load.
 */

import { z } from "zod";
import {
  POSITIONS,
  PLAY_STYLES,
  PERSONALITY_TRAITS,
  ACADEMIC_STRENGTHS,
  DIFFICULTIES,
  SAVE_SCHEMA_VERSION,
} from "@/game-engine/types";

export const positionSchema = z.enum(POSITIONS);

export const athleteCreationSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(20),
    lastName: z.string().trim().min(1, "Last name is required").max(20),
    jerseyNumber: z.coerce.number().int().min(0).max(99),
    hometown: z.string().trim().min(1, "Hometown is required").max(40),
    heightInches: z.coerce.number().int().min(60).max(84),
    weightLbs: z.coerce.number().int().min(150).max(400),
    position: positionSchema,
    playStyle: z.string().min(1),
    personality: z.enum(PERSONALITY_TRAITS),
    academicStrength: z.enum(ACADEMIC_STRENGTHS),
    difficulty: z.enum(DIFFICULTIES),
    seed: z.string().trim().max(64).optional(),
    avatar: z.object({
      skinTone: z.number().int().min(0),
      jerseyStyle: z.number().int().min(0),
      accent: z.number().int().min(0),
    }),
  })
  .refine(
    (d) => (PLAY_STYLES[d.position] as readonly string[]).includes(d.playStyle),
    {
      message: "Play style must match the selected position",
      path: ["playStyle"],
    },
  );

export type AthleteCreationInput = z.infer<typeof athleteCreationSchema>;

// --- Full save validation (structural; keeps corrupted saves from loading) ---

const resourcesSchema = z.object({
  energy: z.number(),
  fatigue: z.number(),
  health: z.number(),
  injuryRisk: z.number(),
  confidence: z.number(),
  morale: z.number(),
  coachTrust: z.number(),
  teamChemistry: z.number(),
  campusReputation: z.number(),
  nationalReputation: z.number(),
  academicFocus: z.number(),
  gpa: z.number().min(0).max(4),
  eligibility: z.enum(["Eligible", "Warning", "Probation", "Ineligible"]),
  money: z.number().min(0),
  draftStock: z.number(),
  socialFollowing: z.number().min(0),
  stress: z.number(),
});

export const careerSaveSchema = z.object({
  schemaVersion: z.number(),
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  seed: z.string(),
  rngCursor: z.number(),
  difficulty: z.enum(DIFFICULTIES),
  isDemo: z.boolean(),
  athlete: z.object({
    firstName: z.string(),
    lastName: z.string(),
    jerseyNumber: z.number(),
    hometown: z.string(),
    heightInches: z.number(),
    weightLbs: z.number(),
    position: positionSchema,
    playStyle: z.string(),
    personality: z.enum(PERSONALITY_TRAITS),
    academicStrength: z.enum(ACADEMIC_STRENGTHS),
    avatar: z.object({
      skinTone: z.number(),
      jerseyStyle: z.number(),
      accent: z.number(),
    }),
    attributes: z.record(z.string(), z.number()),
  }),
  schoolId: z.string(),
  resources: resourcesSchema,
  // The remaining nested collections are validated loosely — the engine
  // re-normalizes them on load, so structural presence is what matters here.
  depthChart: z.object({}).passthrough(),
  relationships: z.array(z.object({}).passthrough()),
  academics: z.object({}).passthrough(),
  season: z.object({}).passthrough(),
  weekOfSeason: z.number(),
  actionPoints: z.number(),
  actionsThisWeek: z.array(z.string()),
  activeSponsorships: z.array(z.object({}).passthrough()),
  offeredSponsorIds: z.array(z.string()),
  awards: z.array(z.object({}).passthrough()),
  achievements: z.array(z.object({}).passthrough()),
  news: z.array(z.object({}).passthrough()),
  transactions: z.array(z.object({}).passthrough()),
  pendingEffects: z.array(z.object({}).passthrough()),
  completedEventIds: z.array(z.string()),
  queuedEventIds: z.array(z.string()),
  gameLog: z.array(z.object({}).passthrough()),
  ending: z.string().nullable(),
});

/** Validate a loaded save; returns null if invalid or wrong schema version. */
export function parseSave(
  data: unknown,
): z.infer<typeof careerSaveSchema> | null {
  const result = careerSaveSchema.safeParse(data);
  if (!result.success) return null;
  if (result.data.schemaVersion !== SAVE_SCHEMA_VERSION) return null;
  return result.data;
}
