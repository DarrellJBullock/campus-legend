/**
 * Cloud save layer (authenticated users). Wraps the careers table with the same
 * Zod validation used for local saves, so a tampered or version-mismatched blob
 * from the DB is rejected the same way a corrupt localStorage entry would be.
 *
 * All calls run through the RLS-enforced anon client — a user physically cannot
 * read or write another user's careers.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CareerState } from "@/game-engine/types";
import { parseSave } from "@/lib/schemas";
import type { SaveSummary } from "@/lib/local-save";

export async function upsertCloudCareer(
  supabase: SupabaseClient,
  userId: string,
  career: CareerState,
): Promise<void> {
  const { error } = await supabase.from("careers").upsert(
    {
      user_id: userId,
      slug: career.id,
      name: career.name,
      school_id: career.schoolId,
      position: career.athlete.position,
      season: career.season.season,
      schema_version: career.schemaVersion,
      is_demo: career.isDemo,
      state: career,
    },
    { onConflict: "user_id,slug" },
  );
  if (error) throw new Error(`Cloud save failed: ${error.message}`);
}

export async function loadCloudCareer(
  supabase: SupabaseClient,
  userId: string,
  slug: string,
): Promise<CareerState | null> {
  const { data, error } = await supabase
    .from("careers")
    .select("state")
    .eq("user_id", userId)
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return parseSave(data.state) as CareerState | null;
}

export async function listCloudCareers(
  supabase: SupabaseClient,
  userId: string,
): Promise<SaveSummary[]> {
  const { data, error } = await supabase
    .from("careers")
    .select("slug, name, school_id, season, updated_at, is_demo")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.slug as string,
    name: r.name as string,
    schoolId: r.school_id as string,
    season: r.season as number,
    updatedAt: r.updated_at as string,
    isDemo: r.is_demo as boolean,
  }));
}

export async function deleteCloudCareer(
  supabase: SupabaseClient,
  userId: string,
  slug: string,
): Promise<void> {
  const { error } = await supabase
    .from("careers")
    .delete()
    .eq("user_id", userId)
    .eq("slug", slug);
  if (error) throw new Error(`Cloud delete failed: ${error.message}`);
}
