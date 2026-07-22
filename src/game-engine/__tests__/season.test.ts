import { describe, it, expect } from "vitest";
import {
  buildSchedule,
  initialSeasonState,
  recordResult,
  canDeclareForDraft,
  madeConferenceChampionship,
  madeBowl,
  classYearFor,
} from "@/game-engine/season";
import { Rng } from "@/game-engine/random";
import type { Opponent } from "@/game-engine/types";

const opponents: Opponent[] = Array.from({ length: 12 }, (_, i) => ({
  id: `o${i}`,
  schoolId: `s${i}`,
  name: `Team ${i}`,
  strength: 40 + i,
  isRival: i === 5,
  isConference: true,
}));

describe("season", () => {
  it("builds a 12-game schedule with the rival slotted in", () => {
    const schedule = buildSchedule(opponents, "o5", new Rng("sched"));
    expect(schedule).toHaveLength(12);
    const rivalWeek = schedule.find((g) => g.week === 11);
    expect(rivalWeek?.opponent.id).toBe("o5");
  });

  it("is deterministic given the same seed", () => {
    const a = buildSchedule(opponents, "o5", new Rng("k"));
    const b = buildSchedule(opponents, "o5", new Rng("k"));
    expect(a.map((g) => g.opponent.id)).toEqual(b.map((g) => g.opponent.id));
  });

  it("records wins and losses", () => {
    let state = initialSeasonState(
      1,
      buildSchedule(opponents, "o5", new Rng("r")),
    );
    state = recordResult(state, 1, true);
    state = recordResult(state, 2, false);
    expect(state.wins).toBe(1);
    expect(state.losses).toBe(1);
    expect(state.schedule.find((g) => g.week === 1)?.played).toBe(true);
  });

  it("gates draft declaration to junior year and later", () => {
    expect(canDeclareForDraft(2)).toBe(false);
    expect(canDeclareForDraft(3)).toBe(true);
  });

  it("computes postseason eligibility from wins", () => {
    const champ = { ...initialSeasonState(1, []), wins: 10 };
    const bowl = { ...initialSeasonState(1, []), wins: 7 };
    const poor = { ...initialSeasonState(1, []), wins: 3 };
    expect(madeConferenceChampionship(champ)).toBe(true);
    expect(madeBowl(bowl)).toBe(true);
    expect(madeBowl(poor)).toBe(false);
  });

  it("maps season number to class year", () => {
    expect(classYearFor(1)).toBe("Freshman");
    expect(classYearFor(4)).toBe("Senior");
    expect(classYearFor(9)).toBe("Senior");
  });
});
