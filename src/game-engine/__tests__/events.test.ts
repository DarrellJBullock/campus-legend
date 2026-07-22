import { describe, it, expect } from "vitest";
import {
  triggerSatisfied,
  eligibleEvents,
  pickEvent,
  resolveChoice,
  absoluteWeek,
  type EventContext,
} from "@/game-engine/events";
import { defaultResources } from "@/game-engine/energy";
import { Rng } from "@/game-engine/random";
import type { StoryEvent } from "@/game-engine/types";

const ctx: EventContext = {
  resources: defaultResources({
    coachTrust: 60,
    stress: 40,
    gpa: 3.0,
    campusReputation: 40,
    nationalReputation: 30,
  }),
  role: "Starter",
  season: 2,
  position: "QB",
  completedEventIds: [],
};

const events: StoryEvent[] = [
  {
    id: "e-common",
    title: "Common",
    description: "",
    category: "campusLife",
    rarity: "common",
    choices: [
      {
        id: "a",
        label: "A",
        immediate: { morale: 5 },
        outcomeText: "ok",
      },
    ],
  },
  {
    id: "e-high-trust",
    title: "High trust only",
    description: "",
    category: "teamLeadership",
    rarity: "uncommon",
    trigger: { minCoachTrust: 90 },
    choices: [{ id: "a", label: "A", immediate: {}, outcomeText: "ok" }],
  },
  {
    id: "e-season3",
    title: "Season 3 only",
    description: "",
    category: "draftPrep",
    rarity: "rare",
    seasons: [3, 4],
    choices: [{ id: "a", label: "A", immediate: {}, outcomeText: "ok" }],
  },
];

describe("event engine", () => {
  it("evaluates trigger conditions", () => {
    expect(triggerSatisfied({ minCoachTrust: 50 }, ctx)).toBe(true);
    expect(triggerSatisfied({ minCoachTrust: 90 }, ctx)).toBe(false);
    expect(triggerSatisfied(undefined, ctx)).toBe(true);
  });

  it("filters by season and trigger", () => {
    const pool = eligibleEvents(events, ctx);
    const ids = pool.map((e) => e.id);
    expect(ids).toContain("e-common");
    expect(ids).not.toContain("e-high-trust"); // trust too low
    expect(ids).not.toContain("e-season3"); // wrong season
  });

  it("excludes completed events", () => {
    const pool = eligibleEvents(events, {
      ...ctx,
      completedEventIds: ["e-common"],
    });
    expect(pool.map((e) => e.id)).not.toContain("e-common");
  });

  it("pickEvent is deterministic for a seed", () => {
    const a = pickEvent(events, ctx, new Rng("pick"));
    const b = pickEvent(events, ctx, new Rng("pick"));
    expect(a?.id).toEqual(b?.id);
  });

  it("returns null when no events are eligible", () => {
    const empty = pickEvent([], ctx, new Rng("n"));
    expect(empty).toBeNull();
  });

  it("resolves a choice including delayed effects", () => {
    const resolved = resolveChoice(
      {
        id: "c",
        label: "Risky",
        immediate: { confidence: 5 },
        relationships: { headCoach: 3 },
        delayed: {
          weeks: 2,
          effects: { stress: 10 },
          text: "It caught up with you.",
        },
        outcomeText: "done",
      },
      absoluteWeek(2, 4),
    );
    expect(resolved.immediate.confidence).toBe(5);
    expect(resolved.relationships.headCoach).toBe(3);
    expect(resolved.delayed?.applyWeekAbsolute).toBe(absoluteWeek(2, 4) + 2);
  });
});
