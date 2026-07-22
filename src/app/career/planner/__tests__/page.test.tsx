import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WeeklyPlannerPage from "@/app/career/planner/page";
import { useCareerStore } from "@/stores/career-store";
import { createTestCareer } from "@/test/fixtures";

describe("WeeklyPlannerPage", () => {
  beforeEach(() => {
    useCareerStore.getState().load(createTestCareer());
  });

  it("shows the starting action-point count", () => {
    render(<WeeklyPlannerPage />);
    expect(screen.getByText("4 AP left")).toBeInTheDocument();
  });

  it("confirming an action decrements action points and marks it done", async () => {
    const user = userEvent.setup();
    render(<WeeklyPlannerPage />);

    const confirmButtons = screen.getAllByRole("button", { name: "Confirm" });
    expect(confirmButtons.length).toBeGreaterThan(0);

    await user.click(confirmButtons[0]!);

    expect(screen.getByText("3 AP left")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Done this week" }).length,
    ).toBe(1);
    expect(useCareerStore.getState().career?.actionPoints).toBe(3);
    expect(useCareerStore.getState().career?.actionsThisWeek).toHaveLength(1);
  });
});
