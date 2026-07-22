import { describe, it, expect, beforeEach } from "vitest";
import { useCareerStore } from "@/stores/career-store";
import { createTestCareer } from "@/test/fixtures";
import { absoluteWeek } from "@/game-engine/events";

describe("career-store: sidelined by injury", () => {
  beforeEach(() => {
    useCareerStore.setState({ userId: null });
  });

  it("playGame simulates a team-only result and never lets an injured player play", () => {
    const career = createTestCareer({
      weekOfSeason: 1,
      activeInjury: {
        name: "High Ankle Sprain",
        severity: "Moderate",
        returnWeekAbsolute: absoluteWeek(1, 1) + 5,
      },
    });
    useCareerStore.getState().load(career);

    const result = useCareerStore.getState().playGame([]);

    expect(result).not.toBeNull();
    expect(result?.performanceGrade).toBe("DNP");
    expect(result?.stats).toEqual({});
    expect(result?.injury).toBeNull();
    expect(result?.attributeXp).toBe(0);

    const after = useCareerStore.getState().career!;
    // Still sidelined — playing a game never clears or shortens the injury.
    expect(after.activeInjury).not.toBeNull();
    expect(after.season.schedule.find((g) => g.week === 1)?.played).toBe(true);
    expect(after.season.wins + after.season.losses).toBe(1);
  });

  it("advanceWeek clears the injury once the return week arrives", () => {
    const career = createTestCareer({
      weekOfSeason: 1,
      activeInjury: {
        name: "Hamstring Strain",
        severity: "Minor",
        returnWeekAbsolute: absoluteWeek(1, 2),
      },
    });
    useCareerStore.getState().load(career);

    useCareerStore.getState().advanceWeek();

    expect(useCareerStore.getState().career?.activeInjury).toBeNull();
  });

  it("advanceWeek keeps the injury active before the return week", () => {
    const career = createTestCareer({
      weekOfSeason: 1,
      activeInjury: {
        name: "MCL Sprain",
        severity: "Severe",
        returnWeekAbsolute: absoluteWeek(1, 4),
      },
    });
    useCareerStore.getState().load(career);

    useCareerStore.getState().advanceWeek();

    expect(useCareerStore.getState().career?.activeInjury).not.toBeNull();
  });
});
