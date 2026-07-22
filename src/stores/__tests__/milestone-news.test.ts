import { describe, it, expect, beforeEach } from "vitest";
import { useCareerStore } from "@/stores/career-store";
import { createTestCareer } from "@/test/fixtures";
import { SPONSORS } from "@/content/sponsors";

describe("career-store: milestone news", () => {
  beforeEach(() => {
    useCareerStore.setState({ userId: null });
  });

  it("signing a sponsor adds a news article", () => {
    const sponsor = SPONSORS[0]!;
    const career = createTestCareer();
    useCareerStore.getState().load(career);
    const before = useCareerStore.getState().career!.news.length;

    useCareerStore.getState().signSponsor(sponsor.id);

    const after = useCareerStore.getState().career!.news;
    expect(after.length).toBe(before + 1);
    expect(after.at(-1)!.headline).toContain(career.athlete.firstName);
  });

  it("each season award gets its own distinct news entry, not one shared/duplicated article", () => {
    const career = createTestCareer({
      season: {
        season: 1,
        classYear: "Freshman",
        phase: "Postseason",
        wins: 11,
        losses: 1,
        schedule: [],
        redshirted: false,
      },
      gameLog: Array.from({ length: 12 }, (_, i) => ({
        week: i + 1,
        season: 1,
        opponentName: "Test Tech",
        isRival: false,
        playerScore: 30,
        opponentScore: 10,
        win: true,
        stats: {},
        performanceGrade: "A+",
        performanceScore: 95,
        keyPlays: [],
        coachFeedback: "",
        headline: "",
        attributeXp: 10,
        injury: null,
        reputationDelta: 3,
        draftStockDelta: 2,
        depthChartEffect: "",
      })),
    });
    useCareerStore.getState().load(career);

    useCareerStore.getState().advanceSeason();

    const news = useCareerStore.getState().career!.news;
    const awardNews = news.filter((n) => n.id.includes("n-mile-award"));
    // A 11-1, avg-95 season should clear multiple award thresholds.
    expect(awardNews.length).toBeGreaterThan(1);
    const ids = awardNews.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
