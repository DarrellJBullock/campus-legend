import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CareerHubPage from "@/app/career/page";
import { useCareerStore } from "@/stores/career-store";
import { createTestCareer } from "@/test/fixtures";

describe("CareerHubPage", () => {
  beforeEach(() => {
    useCareerStore.getState().load(createTestCareer());
  });

  it("links to the weekly planner during the regular season", () => {
    render(<CareerHubPage />);
    expect(
      screen.getByRole("link", { name: "Go to Weekly Planner" }),
    ).toHaveAttribute("href", "/career/planner");
  });

  it("points to the season recap instead of the planner once all 12 games are done", () => {
    useCareerStore.getState().load(createTestCareer({ weekOfSeason: 13 }));
    render(<CareerHubPage />);

    expect(
      screen.getByRole("link", { name: "View Season Recap" }),
    ).toHaveAttribute("href", "/career/season-recap");
    expect(
      screen.queryByRole("link", { name: "Go to Weekly Planner" }),
    ).not.toBeInTheDocument();
  });
});
