import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import StatsPage from "@/app/career/stats/page";
import { useCareerStore } from "@/stores/career-store";
import { createTestCareer } from "@/test/fixtures";
import type { GameResult } from "@/game-engine/types";

function makeGame(overrides: Partial<GameResult>): GameResult {
  return {
    week: 1,
    season: 1,
    opponentName: "Test Tech",
    isRival: false,
    playerScore: 21,
    opponentScore: 14,
    win: true,
    stats: {},
    performanceGrade: "B",
    performanceScore: 70,
    keyPlays: [],
    coachFeedback: "",
    headline: "",
    attributeXp: 10,
    injury: null,
    reputationDelta: 1,
    draftStockDelta: 1,
    depthChartEffect: "",
    ...overrides,
  };
}

describe("StatsPage", () => {
  beforeEach(() => {
    useCareerStore.setState({ userId: null });
  });

  it("shows an empty state before any games are played", () => {
    useCareerStore.getState().load(createTestCareer());
    render(<StatsPage />);
    expect(
      screen.getByText(
        "Play your first game to start building your career totals.",
      ),
    ).toBeInTheDocument();
  });

  it("sums position-specific stats across every played game", () => {
    useCareerStore.getState().load(
      createTestCareer({
        gameLog: [
          makeGame({ week: 1, stats: { passTds: 2, passYards: 210 } }),
          makeGame({ week: 2, stats: { passTds: 1, passYards: 180 } }),
        ],
      }),
    );
    render(<StatsPage />);

    const passTdsRow = screen.getByText("Pass TDs").closest("div")!;
    expect(passTdsRow).toHaveTextContent("3");
    const passYardsRow = screen.getByText("Pass Yards").closest("div")!;
    expect(passYardsRow).toHaveTextContent("390");
  });
});
