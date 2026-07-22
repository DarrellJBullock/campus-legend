import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SponsorshipsPage from "@/app/career/sponsorships/page";
import { useCareerStore } from "@/stores/career-store";
import { createTestCareer } from "@/test/fixtures";
import { buildDemoCareer } from "@/content/demo-career";

describe("SponsorshipsPage", () => {
  it("shows an empty active-deals state and no offers before reputation is built", () => {
    useCareerStore.getState().load(createTestCareer());
    render(<SponsorshipsPage />);

    expect(screen.getByText(/no active sponsorships yet/i)).toBeInTheDocument();
  });

  it("renders distinct eligible / not-eligible badges and signing an eligible offer moves it to Active Deals", async () => {
    // The demo career has enough reputation/following for some sponsors but
    // not all — a real mix of eligible and ineligible offers.
    useCareerStore.getState().load(buildDemoCareer());
    const user = userEvent.setup();
    render(<SponsorshipsPage />);

    const eligibleBadges = screen.getAllByText("Eligible");
    const ineligibleBadges = screen.getAllByText("Not eligible");
    expect(eligibleBadges.length).toBeGreaterThan(0);
    expect(ineligibleBadges.length).toBeGreaterThan(0);

    expect(screen.getByText(/no active sponsorships yet/i)).toBeInTheDocument();

    const signButtonsBefore = screen.getAllByRole("button", {
      name: /sign deal/i,
    });
    const enabledSignButton = signButtonsBefore.find(
      (b) => !(b as HTMLButtonElement).disabled,
    );
    expect(enabledSignButton).toBeDefined();

    await user.click(enabledSignButton!);

    const career = useCareerStore.getState().career!;
    expect(career.activeSponsorships.length).toBe(1);

    // The signed offer disappears from the marketplace list...
    const signButtonsAfter = screen.getAllByRole("button", {
      name: /sign deal/i,
    });
    expect(signButtonsAfter.length).toBe(signButtonsBefore.length - 1);

    // ...and now appears in Active Deals instead of the empty state.
    expect(
      screen.queryByText(/no active sponsorships yet/i),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/weeks remaining/i)).toBeInTheDocument();
  });
});
