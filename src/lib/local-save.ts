/**
 * Local (guest) save system. Careers are persisted to localStorage as a keyed
 * collection so a guest can run multiple careers without an account. Every load
 * is validated through the Zod save schema, so corrupted or version-mismatched
 * blobs are rejected rather than crashing the app.
 */

import type { CareerState } from "@/game-engine/types";
import { parseSave } from "@/lib/schemas";

const INDEX_KEY = "campus-legend:saves";
const SAVE_PREFIX = "campus-legend:save:";
const ACTIVE_KEY = "campus-legend:active";

export interface SaveSummary {
  id: string;
  name: string;
  schoolId: string;
  season: number;
  updatedAt: string;
  isDemo: boolean;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readIndex(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeIndex(ids: string[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(INDEX_KEY, JSON.stringify([...new Set(ids)]));
}

/** Persist a career locally. Stamps updatedAt via the caller's timestamp. */
export function saveLocalCareer(career: CareerState): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(SAVE_PREFIX + career.id, JSON.stringify(career));
  writeIndex([...readIndex(), career.id]);
}

/** Load and validate a single local career. Returns null if missing/invalid. */
export function loadLocalCareer(id: string): CareerState | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(SAVE_PREFIX + id);
  if (!raw) return null;
  try {
    const parsed = parseSave(JSON.parse(raw));
    return parsed as CareerState | null;
  } catch {
    return null;
  }
}

export function listLocalCareers(): SaveSummary[] {
  return readIndex()
    .map((id) => loadLocalCareer(id))
    .filter((c): c is CareerState => c !== null)
    .map((c) => ({
      id: c.id,
      name: c.name,
      schoolId: c.schoolId,
      season: c.season.season,
      updatedAt: c.updatedAt,
      isDemo: c.isDemo,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function deleteLocalCareer(id: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(SAVE_PREFIX + id);
  writeIndex(readIndex().filter((x) => x !== id));
  if (getActiveCareerId() === id) clearActiveCareer();
}

export function setActiveCareer(id: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACTIVE_KEY, id);
}

export function getActiveCareerId(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACTIVE_KEY);
}

export function clearActiveCareer(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACTIVE_KEY);
}
