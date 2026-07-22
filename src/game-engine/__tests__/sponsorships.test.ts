import { describe, it, expect } from "vitest";
import {
  isEligibleForSponsor,
  weeklyPayment,
  signSponsorship,
  tickSponsorship,
  isExpired,
} from "@/game-engine/sponsorships";
import { defaultResources } from "@/game-engine/energy";
import type { Athlete, Sponsor } from "@/game-engine/types";
import { generateStartingAttributes } from "@/game-engine/attributes";
import { Rng } from "@/game-engine/random";

const sponsor: Sponsor = {
  id: "sp1",
  company: "Rally Energy",
  tier: "drink",
  category: "Sports Drink",
  basePayment: 8000,
  durationWeeks: 8,
  weeklyObligation: "One social post",
  reqReputation: 40,
  reqFollowing: 5000,
  reqGpa: 2.5,
  performanceBonus: 1000,
  conflictClause: "No competing drink brands",
  personalityFit: ["Media Darling"],
};

const athlete: Athlete = {
  firstName: "A",
  lastName: "B",
  jerseyNumber: 1,
  hometown: "Town",
  heightInches: 72,
  weightLbs: 200,
  position: "WR",
  playStyle: "Deep Threat",
  personality: "Media Darling",
  academicStrength: "Business",
  avatar: { skinTone: 0, jerseyStyle: 0, accent: 0 },
  attributes: generateStartingAttributes("WR", "Deep Threat", new Rng("x")),
};

describe("sponsorships", () => {
  it("blocks offers below requirements", () => {
    const poor = defaultResources({
      campusReputation: 10,
      nationalReputation: 5,
      socialFollowing: 100,
      gpa: 2.0,
    });
    const res = isEligibleForSponsor(sponsor, poor, athlete);
    expect(res.eligible).toBe(false);
    expect(res.reasons.length).toBeGreaterThan(0);
  });

  it("allows offers when requirements are met", () => {
    const rich = defaultResources({
      campusReputation: 60,
      nationalReputation: 50,
      socialFollowing: 20000,
      gpa: 3.2,
    });
    expect(isEligibleForSponsor(sponsor, rich, athlete).eligible).toBe(true);
  });

  it("payment scales with reputation and following", () => {
    const low = weeklyPayment(
      sponsor,
      defaultResources({ nationalReputation: 10, socialFollowing: 1000 }),
    );
    const high = weeklyPayment(
      sponsor,
      defaultResources({ nationalReputation: 90, socialFollowing: 200000 }),
    );
    expect(high).toBeGreaterThan(low);
  });

  it("pays out and ticks down each week", () => {
    const active = signSponsorship(sponsor, 1);
    const rich = defaultResources({
      campusReputation: 60,
      nationalReputation: 55,
      socialFollowing: 20000,
      gpa: 3.2,
    });
    const {
      active: next,
      payment,
      cancelled,
    } = tickSponsorship(active, sponsor, rich, true);
    expect(cancelled).toBe(false);
    expect(payment).toBeGreaterThan(0);
    expect(next.weeksRemaining).toBe(7);
    expect(next.totalEarned).toBeGreaterThan(0);
  });

  it("cancels the deal when the academic clause is violated", () => {
    const active = signSponsorship(sponsor, 1);
    const failing = defaultResources({
      campusReputation: 60,
      nationalReputation: 55,
      socialFollowing: 20000,
      gpa: 2.0,
    });
    const { cancelled, reason } = tickSponsorship(
      active,
      sponsor,
      failing,
      true,
    );
    expect(cancelled).toBe(true);
    expect(reason).toContain("academic");
  });

  it("expires after the duration", () => {
    expect(
      isExpired({ ...signSponsorship(sponsor, 1), weeksRemaining: 0 }),
    ).toBe(true);
  });
});
