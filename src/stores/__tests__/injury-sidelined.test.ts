import { describe, it, expect, beforeEach } from "vitest";
import { useCareerStore } from "@/stores/career-store";
import { createTestCareer } from "@/test/fixtures";
import { absoluteWeek } from "@/game-engine/events";
import { defaultResources } from "@/game-engine/energy";

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

  it("a game-inflicted injury also sidelines the player, not just training injuries", () => {
    // Regression: only performAction (training) set activeInjury at first;
    // playGame's own injury roll updated resources but never sidelined the
    // player, so a game injury still let you suit up the next week.
    let found = false;
    for (let i = 0; i < 40 && !found; i++) {
      useCareerStore.getState().load(
        createTestCareer({
          seed: `game-injury-try-${i}`,
          weekOfSeason: 1,
          resources: {
            ...defaultResources(),
            injuryRisk: 100,
            fatigue: 100,
            health: 0,
          },
        }),
      );
      const result = useCareerStore.getState().playGame([]);
      if (result?.injury) {
        found = true;
        const after = useCareerStore.getState().career;
        expect(after?.activeInjury).not.toBeNull();
        expect(after?.activeInjury?.name).toBe(result.injury.name);
      }
    }
    expect(found).toBe(true);
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
