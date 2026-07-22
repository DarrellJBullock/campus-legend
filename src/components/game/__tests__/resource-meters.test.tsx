import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatBar } from "@/components/game/stat-bar";
import { ResourceMeters } from "@/components/game/resource-meters";
import { defaultResources } from "@/game-engine/energy";

describe("StatBar", () => {
  it("renders the label, rounded numeric value, and meter aria attributes", () => {
    render(<StatBar label="Energy" value={71.6} />);

    expect(screen.getByText("Energy")).toBeInTheDocument();
    expect(screen.getByText("72")).toBeInTheDocument();

    const meter = screen.getByRole("meter", { name: "Energy" });
    expect(meter).toHaveAttribute("aria-valuenow", "72");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
  });

  it("supports a custom max", () => {
    render(<StatBar label="Draft Stock" value={40} max={200} />);
    const meter = screen.getByRole("meter", { name: "Draft Stock" });
    expect(meter).toHaveAttribute("aria-valuemax", "200");
  });
});

describe("ResourceMeters", () => {
  it("renders all core resource meters with the correct current values", () => {
    const resources = defaultResources({ energy: 88, health: 42, stress: 15 });
    render(<ResourceMeters resources={resources} />);

    const meters = screen.getAllByRole("meter");
    expect(meters).toHaveLength(8);

    expect(screen.getByRole("meter", { name: "Energy" })).toHaveAttribute(
      "aria-valuenow",
      "88",
    );
    expect(screen.getByRole("meter", { name: "Health" })).toHaveAttribute(
      "aria-valuenow",
      "42",
    );
    expect(screen.getByRole("meter", { name: "Stress" })).toHaveAttribute(
      "aria-valuenow",
      "15",
    );
  });
});
