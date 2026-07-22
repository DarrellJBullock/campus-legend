/**
 * Story event engine — data-driven decision trees.
 *
 * Events are pure data (see content/events.ts). This module decides which
 * events can trigger given the current career state, picks one via seeded
 * randomness weighted by rarity, and resolves a chosen option into resource,
 * relationship, attribute, and delayed effects.
 */

import {
  type StoryEvent,
  type EventChoice,
  type EventTrigger,
  type Resources,
  type DepthRole,
  type PendingDelayedEffect,
  type ResourceDelta,
  type RelationshipDelta,
  type Attributes,
} from "./types";
import type { Rng } from "./random";

export interface EventContext {
  resources: Resources;
  role: DepthRole;
  season: number;
  position: string;
  completedEventIds: string[];
}

/** Does the career state satisfy an event's trigger conditions? */
export function triggerSatisfied(
  trigger: EventTrigger | undefined,
  ctx: EventContext,
): boolean {
  if (!trigger) return true;
  const r = ctx.resources;
  const rep = Math.round((r.campusReputation + r.nationalReputation) / 2);
  if (trigger.minReputation !== undefined && rep < trigger.minReputation)
    return false;
  if (trigger.maxReputation !== undefined && rep > trigger.maxReputation)
    return false;
  if (
    trigger.minCoachTrust !== undefined &&
    r.coachTrust < trigger.minCoachTrust
  )
    return false;
  if (
    trigger.maxCoachTrust !== undefined &&
    r.coachTrust > trigger.maxCoachTrust
  )
    return false;
  if (trigger.minStress !== undefined && r.stress < trigger.minStress)
    return false;
  if (trigger.maxGpa !== undefined && r.gpa > trigger.maxGpa) return false;
  if (
    trigger.minSocialFollowing !== undefined &&
    r.socialFollowing < trigger.minSocialFollowing
  )
    return false;
  if (trigger.requiresRole && !trigger.requiresRole.includes(ctx.role))
    return false;
  return true;
}

/** All events eligible to fire right now (not already completed, filters pass). */
export function eligibleEvents(
  all: StoryEvent[],
  ctx: EventContext,
): StoryEvent[] {
  return all.filter((e) => {
    if (ctx.completedEventIds.includes(e.id)) return false;
    if (e.seasons && !e.seasons.includes(ctx.season)) return false;
    if (e.positions && !e.positions.includes(ctx.position as never))
      return false;
    return triggerSatisfied(e.trigger, ctx);
  });
}

const RARITY_WEIGHT: Record<StoryEvent["rarity"], number> = {
  common: 6,
  uncommon: 3,
  rare: 1,
};

/** Weighted random pick of one eligible event (or null if none). */
export function pickEvent(
  all: StoryEvent[],
  ctx: EventContext,
  rng: Rng,
): StoryEvent | null {
  const pool = eligibleEvents(all, ctx);
  if (pool.length === 0) return null;
  const weights = pool.map((e) => RARITY_WEIGHT[e.rarity]);
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng.float(0, total);
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i]!;
    if (roll <= 0) return pool[i]!;
  }
  return pool[pool.length - 1]!;
}

export interface ResolvedEvent {
  immediate: ResourceDelta;
  relationships: RelationshipDelta;
  attributeDelta: Attributes;
  delayed: PendingDelayedEffect | null;
  followUpEventId: string | null;
  outcomeText: string;
}

/** Resolve a chosen option into concrete effects. */
export function resolveChoice(
  choice: EventChoice,
  currentWeekAbsolute: number,
): ResolvedEvent {
  const delayed: PendingDelayedEffect | null = choice.delayed
    ? {
        applyWeekAbsolute: currentWeekAbsolute + choice.delayed.weeks,
        effects: choice.delayed.effects,
        text: choice.delayed.text,
      }
    : null;
  return {
    immediate: choice.immediate,
    relationships: choice.relationships ?? {},
    attributeDelta: choice.attributeDelta ?? {},
    delayed,
    followUpEventId: choice.followUpEventId ?? null,
    outcomeText: choice.outcomeText,
  };
}

/** Absolute week index across the whole career (season 1 wk 1 = 1). */
export function absoluteWeek(season: number, weekOfSeason: number): number {
  return (season - 1) * 16 + weekOfSeason;
}
