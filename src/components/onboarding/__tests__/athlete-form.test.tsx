import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AthleteForm } from "@/components/onboarding/athlete-form";

describe("AthleteForm", () => {
  it("blocks submit and shows validation errors when required fields are empty", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AthleteForm onSubmit={onSubmit} />);

    await user.click(
      screen.getByRole("button", { name: /continue to school selection/i }),
    );

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      await screen.findByText(/first name is required/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/hometown is required/i)).toBeInTheDocument();
  });

  it("calls onSubmit with the entered data plus default selections", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AthleteForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/first name/i), "Jordan");
    await user.type(screen.getByLabelText(/last name/i), "Vale");
    await user.type(screen.getByLabelText(/hometown/i), "Cedar Falls, IA");
    await user.click(
      screen.getByRole("button", { name: /continue to school selection/i }),
    );

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const data = onSubmit.mock.calls[0]?.[0];
    expect(data).toMatchObject({
      firstName: "Jordan",
      lastName: "Vale",
      hometown: "Cedar Falls, IA",
      position: "QB",
      playStyle: "Field General",
      personality: "Coachable",
      academicStrength: "Undecided",
      difficulty: "Starter",
    });
  });

  it("does not submit when hometown is left blank but names are filled", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AthleteForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/first name/i), "Jordan");
    await user.type(screen.getByLabelText(/last name/i), "Vale");
    await user.click(
      screen.getByRole("button", { name: /continue to school selection/i }),
    );

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      await screen.findByText(/hometown is required/i),
    ).toBeInTheDocument();
  });
});
