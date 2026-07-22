import { describe, it, expect } from "vitest";
import { STORY_EVENTS } from "@/content/events";
import type { EventCategory } from "@/game-engine/types";

const REQUIRED_CATEGORIES: EventCategory[] = [
  "coachConflict",
  "teammateRivalry",
  "teamLeadership",
  "academicPressure",
  "family",
  "campusLife",
  "mediaInterview",
  "socialMedia",
  "injuryRecovery",
  "boosterPressure",
  "sponsorConflict",
  "transferOpportunity",
  "positionChange",
  "ruleViolation",
  "communityService",
  "championshipPressure",
  "draftPrep",
];

describe("story events content", () => {
  it("has at least 40 events", () => {
    expect(STORY_EVENTS.length).toBeGreaterThanOrEqual(40);
  });

  it("covers every required category", () => {
    const present = new Set(STORY_EVENTS.map((e) => e.category));
    for (const cat of REQUIRED_CATEGORIES) {
      expect(present.has(cat)).toBe(true);
    }
  });

  it("has unique event ids", () => {
    const ids = STORY_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every choice has an outcome and at least one has two choices", () => {
    for (const ev of STORY_EVENTS) {
      expect(ev.choices.length).toBeGreaterThanOrEqual(2);
      for (const c of ev.choices) {
        expect(c.outcomeText.length).toBeGreaterThan(0);
        expect(c.label.length).toBeGreaterThan(0);
      }
    }
  });

  it("restricts season-gated events to seasons 1-4", () => {
    for (const ev of STORY_EVENTS) {
      if (!ev.seasons) continue;
      for (const s of ev.seasons) {
        expect(s).toBeGreaterThanOrEqual(1);
        expect(s).toBeLessThanOrEqual(4);
      }
    }
  });
});
