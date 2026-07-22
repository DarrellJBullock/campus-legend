import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CareerSummaryPage from "@/app/career/summary/page";
import { useCareerStore } from "@/stores/career-store";
import { createTestCareer } from "@/test/fixtures";
import { ENDING_LABELS } from "@/game-engine/draft";

describe("CareerSummaryPage", () => {
  it("renders mid-career copy when the career has no ending yet", () => {
    useCareerStore.getState().load(createTestCareer({ ending: null }));
    render(<CareerSummaryPage />);

    expect(screen.getByText("Career In Progress")).toBeInTheDocument();
    expect(
      screen.getByText(/hasn't reached its ending yet/i),
    ).toBeInTheDocument();
  });

  it("renders the resolved ending's title and blurb when the career has ended", () => {
    useCareerStore.getState().load(createTestCareer({ ending: "firstRound" }));
    render(<CareerSummaryPage />);

    const { title, blurb } = ENDING_LABELS.firstRound;
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(blurb)).toBeInTheDocument();
    expect(screen.queryByText("Career In Progress")).not.toBeInTheDocument();
  });
});
