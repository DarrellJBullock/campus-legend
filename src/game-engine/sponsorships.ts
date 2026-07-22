/**
 * Sponsorships — fictional NIL-style deal eligibility, offers, and lifecycle.
 *
 * Offers are gated by reputation, following, GPA, and personality fit. Active
 * deals pay out weekly, track obligations, and can be cancelled when clauses
 * are violated (e.g. dropping below the required GPA/reputation).
 */

import {
  type ActiveSponsorship,
  type Sponsor,
  type Resources,
  type Athlete,
} from "./types";
import { round } from "@/lib/utils";

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
}

/** Can the athlete be offered this sponsor right now? */
export function isEligibleForSponsor(
  sponsor: Sponsor,
  resources: Resources,
  athlete: Athlete,
): EligibilityResult {
  const reasons: string[] = [];
  const reputation = Math.round(
    (resources.campusReputation + resources.nationalReputation) / 2,
  );
  if (reputation < sponsor.reqReputation)
    reasons.push(
      `Needs reputation ${sponsor.reqReputation} (you: ${reputation}).`,
    );
  if (resources.socialFollowing < sponsor.reqFollowing)
    reasons.push(`Needs ${sponsor.reqFollowing.toLocaleString()} followers.`);
  if (resources.gpa < sponsor.reqGpa)
    reasons.push(`Needs GPA ${sponsor.reqGpa.toFixed(1)}.`);
  const eligible = reasons.length === 0;

  // Personality fit is advisory, not a hard gate — it just flags a mismatch.
  if (
    eligible &&
    sponsor.personalityFit.length > 0 &&
    !sponsor.personalityFit.includes(athlete.personality)
  ) {
    reasons.push(
      `${sponsor.company} usually partners with a different personality type.`,
    );
  }
  return { eligible, reasons };
}

/** Compute the actual weekly payment (base scaled by reputation/following). */
export function weeklyPayment(sponsor: Sponsor, resources: Resources): number {
  const repMult = 1 + resources.nationalReputation / 200; // up to 1.5x
  const followMult = 1 + Math.min(resources.socialFollowing / 100000, 0.5);
  return round(
    (sponsor.basePayment * repMult * followMult) / sponsor.durationWeeks,
  );
}

export function signSponsorship(
  sponsor: Sponsor,
  currentWeekAbsolute: number,
): ActiveSponsorship {
  return {
    sponsorId: sponsor.id,
    signedWeek: currentWeekAbsolute,
    weeksRemaining: sponsor.durationWeeks,
    totalEarned: 0,
    obligationsMet: 0,
    obligationsMissed: 0,
  };
}

/** Advance one week of an active deal: pay out, tick down, check clauses. */
export function tickSponsorship(
  active: ActiveSponsorship,
  sponsor: Sponsor,
  resources: Resources,
  obligationMet: boolean,
): {
  active: ActiveSponsorship;
  payment: number;
  cancelled: boolean;
  reason: string | null;
} {
  const payment = weeklyPayment(sponsor, resources);
  let cancelled = false;
  let reason: string | null = null;

  // Conflict clause: dropping below requirements risks cancellation.
  const repNow = Math.round(
    (resources.campusReputation + resources.nationalReputation) / 2,
  );
  if (resources.gpa < sponsor.reqGpa - 0.3) {
    cancelled = true;
    reason = `${sponsor.company} cancelled: academic clause (GPA too low).`;
  } else if (repNow < sponsor.reqReputation - 15) {
    cancelled = true;
    reason = `${sponsor.company} cancelled: reputation clause not met.`;
  } else if (!obligationMet && active.obligationsMissed + 1 >= 3) {
    cancelled = true;
    reason = `${sponsor.company} cancelled: too many missed obligations.`;
  }

  const next: ActiveSponsorship = {
    ...active,
    weeksRemaining: active.weeksRemaining - 1,
    totalEarned: round(active.totalEarned + (cancelled ? 0 : payment)),
    obligationsMet: active.obligationsMet + (obligationMet ? 1 : 0),
    obligationsMissed: active.obligationsMissed + (obligationMet ? 0 : 1),
  };

  return { active: next, payment: cancelled ? 0 : payment, cancelled, reason };
}

export function isExpired(active: ActiveSponsorship): boolean {
  return active.weeksRemaining <= 0;
}

/** Rank offers a player would most want (highest pay first, eligible only). */
export function rankOffers(
  sponsors: Sponsor[],
  resources: Resources,
  athlete: Athlete,
): { sponsor: Sponsor; eligible: boolean; weekly: number }[] {
  return sponsors
    .map((s) => ({
      sponsor: s,
      eligible: isEligibleForSponsor(s, resources, athlete).eligible,
      weekly: weeklyPayment(s, resources),
    }))
    .sort(
      (a, b) => Number(b.eligible) - Number(a.eligible) || b.weekly - a.weekly,
    );
}
