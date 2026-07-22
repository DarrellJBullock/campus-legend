import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameRecap } from "@/components/game/game-recap";
import type { GameResult } from "@/game-engine/types";

const RESULT: GameResult = {
  week: 3,
  season: 1,
  opponentName: "Granite Peak Wolves",
  isRival: true,
  playerScore: 28,
  opponentScore: 21,
  win: true,
  stats: {
    completions: 20,
    passAttempts: 30,
    passYards: 280,
    passTds: 3,
    interceptions: 1,
    rushYards: 15,
  },
  performanceGrade: "A-",
  performanceScore: 88,
  keyPlays: ["41-yard TD strike to open the second half."],
  coachFeedback: "Great command of the offense out there today.",
  headline: "Vale Leads Comeback Win Over Rival Wolves",
  attributeXp: 12,
  injury: null,
  reputationDelta: 6,
  draftStockDelta: 2,
  depthChartEffect: "Your grip on the starting job tightens.",
};

describe("GameRecap", () => {
  it("renders score, grade, headline, and box score for the given position", () => {
    render(<GameRecap result={RESULT} position="QB" onContinue={() => {}} />);

    expect(screen.getByText("28-21")).toBeInTheDocument();
    expect(screen.getByText("Grade A-")).toBeInTheDocument();
    expect(
      screen.getByText("Vale Leads Comeback Win Over Rival Wolves"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Victory/)).toBeInTheDocument();
    expect(
      screen.getByText("vs. Granite Peak Wolves (Rivalry)"),
    ).toBeInTheDocument();

    // QB-specific box score field.
    expect(screen.getByText("Pass Yards")).toBeInTheDocument();
    expect(screen.getByText("280")).toBeInTheDocument();
  });

  it("calls onContinue when the Continue button is clicked", async () => {
    const onContinue = vi.fn();
    const user = userEvent.setup();
    render(<GameRecap result={RESULT} position="QB" onContinue={onContinue} />);

    await user.click(
      screen.getByRole("button", { name: /continue to planner/i }),
    );
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
