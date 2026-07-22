import { describe, it, expect } from "vitest";
import { createCareer } from "@/game-engine/career";
import { buildDemoCareer } from "@/content/demo-career";
import { parseSave } from "@/lib/schemas";
import type { AthleteCreationInput } from "@/lib/schemas";

const input: AthleteCreationInput = {
  firstName: "Test",
  lastName: "Back",
  jerseyNumber: 22,
  hometown: "Somewhere, USA",
  heightInches: 70,
  weightLbs: 205,
  position: "RB",
  playStyle: "Power Runner",
  personality: "Coachable",
  academicStrength: "Business",
  difficulty: "Starter",
  seed: "unit-seed",
  avatar: { skinTone: 0, jerseyStyle: 0, accent: 0 },
};

describe("career factory", () => {
  it("builds a valid, schema-passing career", () => {
    const c = createCareer({
      input,
      schoolId: "granite-peak",
      id: "abc",
      createdAtIso: "2025-08-01T00:00:00.000Z",
    });
    expect(c.schemaVersion).toBe(1);
    expect(c.season.schedule).toHaveLength(12);
    expect(c.actionPoints).toBe(4);
    expect(parseSave(c)).not.toBeNull();
  });

  it("is deterministic for the same seed", () => {
    const a = createCareer({
      input,
      schoolId: "granite-peak",
      id: "x",
      createdAtIso: "2025-08-01T00:00:00.000Z",
    });
    const b = createCareer({
      input,
      schoolId: "granite-peak",
      id: "x",
      createdAtIso: "2025-08-01T00:00:00.000Z",
    });
    expect(a.athlete.attributes).toEqual(b.athlete.attributes);
    expect(a.season.schedule.map((g) => g.opponent.id)).toEqual(
      b.season.schedule.map((g) => g.opponent.id),
    );
  });

  it("never schedules the player against their own school", () => {
    const c = createCareer({
      input,
      schoolId: "granite-peak",
      id: "y",
      createdAtIso: "2025-08-01T00:00:00.000Z",
    });
    expect(
      c.season.schedule.every((g) => g.opponent.schoolId !== "granite-peak"),
    ).toBe(true);
  });

  it("builds a deterministic, valid demo career", () => {
    const d1 = buildDemoCareer();
    const d2 = buildDemoCareer();
    expect(d1.athlete.attributes).toEqual(d2.athlete.attributes);
    expect(d1.isDemo).toBe(true);
    expect(parseSave(d1)).not.toBeNull();
  });
});
