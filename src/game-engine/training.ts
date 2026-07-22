/**
 * Training system — position-specific plans and weekly actions.
 *
 * Every action returns a projected effect (shown to the player before they
 * confirm) and, when executed with an Rng, an actual outcome that may include a
 * bonus or a setback. Attribute gains route through progression.applyGrowth so
 * diminishing returns and the development multiplier apply consistently.
 */

import {
  type Attributes,
  type Position,
  type ResourceDelta,
  type Resources,
  POSITION_ATTRIBUTES,
} from "./types";
import { applyGrowth, developmentMultiplier } from "./progression";
import { rollInjury, injuryProbability } from "./injuries";
import { applyDelta } from "./energy";
import type { Rng } from "./random";

export interface WeeklyAction {
  id: string;
  label: string;
  description: string;
  category: "training" | "academic" | "recovery" | "social" | "branding";
  energyCost: number;
  /** Base resource deltas always applied. */
  baseEffects: ResourceDelta;
  /** Attribute gains before diminishing returns (training only). */
  attributeGains?: Attributes;
  /** Injury/intensity load 0–100 for the injury roll. */
  load: number;
  coachTrustEffect: number;
}

export interface ActionProjection {
  action: WeeklyAction;
  projectedEffects: ResourceDelta;
  attributeGains: Attributes;
  injuryChanceLabel: string;
  hasUncertainty: boolean;
}

export interface ActionOutcome {
  resources: Resources;
  attributes: Attributes;
  coachTrustDelta: number;
  injury: ReturnType<typeof rollInjury>;
  bonusText: string | null;
  setbackText: string | null;
  logLabel: string;
}

/**
 * Build the list of weekly actions available for a position. The first block
 * (position training) is specialized; the rest are shared life/career actions.
 */
export function weeklyActionsFor(position: Position): WeeklyAction[] {
  const posAttrs = POSITION_ATTRIBUTES[position];
  const posGains: Attributes = {};
  for (const a of posAttrs) posGains[a] = 3.2;

  return [
    {
      id: "position-training",
      label: "Position Training",
      description: `Drill ${position} fundamentals with your position coach.`,
      category: "training",
      energyCost: 25,
      baseEffects: { fatigue: 14, injuryRisk: 5, confidence: 2 },
      attributeGains: posGains,
      load: 55,
      coachTrustEffect: 3,
    },
    {
      id: "strength-conditioning",
      label: "Strength & Conditioning",
      description:
        "Build strength, stamina, and durability in the weight room.",
      category: "training",
      energyCost: 22,
      baseEffects: { fatigue: 16, injuryRisk: 6, health: 2 },
      attributeGains: { strength: 3, stamina: 2.5, speed: 1 },
      load: 60,
      coachTrustEffect: 2,
    },
    {
      id: "film-study",
      label: "Film Study",
      description: "Study opponents and your playbook to sharpen your mind.",
      category: "training",
      energyCost: 12,
      baseEffects: { fatigue: 4, academicFocus: -2 },
      attributeGains: { awareness: 3, footballIQ: 3.5 },
      load: 10,
      coachTrustEffect: 4,
    },
    {
      id: "playbook-review",
      label: "Review the Playbook",
      description: "Master your assignments to earn coach trust.",
      category: "training",
      energyCost: 10,
      baseEffects: { fatigue: 3 },
      attributeGains: { footballIQ: 2.5, decisionMaking: 2, coverage: 1 },
      load: 5,
      coachTrustEffect: 5,
    },
    {
      id: "tutoring",
      label: "Attend Tutoring",
      description: "Work with a tutor to shore up a tough course.",
      category: "academic",
      energyCost: 12,
      baseEffects: { fatigue: 5, academicFocus: 14, stress: -4 },
      load: 5,
      coachTrustEffect: 0,
    },
    {
      id: "study",
      label: "Study for an Exam",
      description: "Hit the books. Improves academic readiness.",
      category: "academic",
      energyCost: 14,
      baseEffects: { fatigue: 6, academicFocus: 18, stress: 4 },
      load: 3,
      coachTrustEffect: 0,
    },
    {
      id: "rest",
      label: "Rest & Recover",
      description: "Recharge. Restores energy and lowers injury risk.",
      category: "recovery",
      energyCost: 0,
      baseEffects: {
        energy: 22,
        fatigue: -22,
        injuryRisk: -8,
        stress: -8,
        health: 6,
      },
      load: 0,
      coachTrustEffect: 0,
    },
    {
      id: "trainer",
      label: "Visit the Trainer",
      description: "Prehab and recovery work with the team trainer.",
      category: "recovery",
      energyCost: 6,
      baseEffects: { fatigue: -10, injuryRisk: -12, health: 10 },
      load: 0,
      coachTrustEffect: 1,
    },
    {
      id: "coach-meeting",
      label: "Meet with the Coach",
      description: "Build rapport and show your preparation.",
      category: "social",
      energyCost: 8,
      baseEffects: { fatigue: 3, confidence: 3 },
      load: 5,
      coachTrustEffect: 6,
    },
    {
      id: "teammates",
      label: "Time with Teammates",
      description: "Build chemistry — but watch for distractions.",
      category: "social",
      energyCost: 12,
      baseEffects: { fatigue: 6, teamChemistry: 10, morale: 6, stress: -6 },
      load: 5,
      coachTrustEffect: 1,
    },
    {
      id: "campus-event",
      label: "Attend a Campus Event",
      description: "Grow your campus reputation and following.",
      category: "social",
      energyCost: 14,
      baseEffects: {
        fatigue: 7,
        campusReputation: 8,
        morale: 4,
        socialFollowing: 120,
      },
      load: 5,
      coachTrustEffect: 0,
    },
    {
      id: "media",
      label: "Media Obligations",
      description: "Interviews and press. Grows national reputation.",
      category: "branding",
      energyCost: 12,
      baseEffects: {
        fatigue: 6,
        nationalReputation: 6,
        socialFollowing: 200,
        stress: 5,
      },
      load: 5,
      coachTrustEffect: 0,
    },
    {
      id: "branding",
      label: "Personal Branding",
      description: "Grow your social following and marketability.",
      category: "branding",
      energyCost: 10,
      baseEffects: { fatigue: 5, socialFollowing: 350, campusReputation: 3 },
      load: 3,
      coachTrustEffect: 0,
    },
    {
      id: "sponsor-meet",
      label: "Meet a Sponsor",
      description: "Discuss a deal. Earns goodwill but costs energy.",
      category: "branding",
      energyCost: 16,
      baseEffects: { fatigue: 8, money: 250, nationalReputation: 2 },
      load: 5,
      coachTrustEffect: 0,
    },
  ];
}

/**
 * Project an action's effects for the confirmation preview. The injury-risk
 * label reflects the athlete's *current* resources (fatigue, health,
 * standing injury risk), not just the action's static load — a "low load"
 * action can still carry real risk once fatigue/health have degraded, and
 * the preview should say so instead of always reading the action's baseline.
 */
export function projectAction(
  action: WeeklyAction,
  resources: Resources,
): ActionProjection {
  const effects: ResourceDelta = {
    ...action.baseEffects,
    energy: (action.baseEffects.energy ?? 0) - action.energyCost,
  };
  const hasUncertainty = action.load > 0 || !!action.attributeGains;
  const injuryChanceLabel =
    action.load === 0
      ? "None"
      : (() => {
          const p = injuryProbability(resources, action.load);
          if (p >= 0.5) return "Elevated";
          if (p >= 0.25) return "Moderate";
          return "Low";
        })();
  return {
    action,
    projectedEffects: effects,
    attributeGains: action.attributeGains ?? {},
    injuryChanceLabel,
    hasUncertainty,
  };
}

/**
 * Execute an action against current state. Applies energy/resource deltas,
 * attribute growth (with diminishing returns), rolls for injury and for a
 * bonus/setback, and returns the new state plus narrative text.
 */
export function executeAction(
  action: WeeklyAction,
  resources: Resources,
  attributes: Attributes,
  workEthic: number,
  coachingQuality: number,
  rng: Rng,
): ActionOutcome {
  let bonusText: string | null = null;
  let setbackText: string | null = null;

  // Resource effects (energy cost folded in).
  const effects: ResourceDelta = {
    ...action.baseEffects,
    energy: (action.baseEffects.energy ?? 0) - action.energyCost,
  };
  let nextResources = applyDelta(resources, effects);

  // Attribute growth.
  let nextAttributes = attributes;
  if (action.attributeGains) {
    const mult = developmentMultiplier(workEthic, coachingQuality);
    let gains = action.attributeGains;
    // Bonus/setback rolls only on training actions.
    if (rng.chance(0.15)) {
      bonusText = "Breakthrough session! Extra gains earned.";
      gains = scale(gains, 1.6);
      nextResources = applyDelta(nextResources, { confidence: 4 });
    } else if (rng.chance(0.1)) {
      setbackText = "Rough session — you struggled to find a rhythm.";
      gains = scale(gains, 0.4);
      nextResources = applyDelta(nextResources, { confidence: -3 });
    }
    nextAttributes = applyGrowth(attributes, gains, mult);
  }

  // Injury roll.
  const injury =
    action.load > 0 ? rollInjury(nextResources, action.load, rng) : null;
  if (injury) {
    nextResources = applyDelta(nextResources, {
      health: -injury.healthImpact,
      confidence: -5,
      morale: -6,
    });
    setbackText = `Injury: ${injury.name} (${injury.severity}). Out ~${injury.weeksOut} wk.`;
  }

  return {
    resources: nextResources,
    attributes: nextAttributes,
    coachTrustDelta: action.coachTrustEffect,
    injury,
    bonusText,
    setbackText,
    logLabel: action.label,
  };
}

function scale(gains: Attributes, factor: number): Attributes {
  const out: Attributes = {};
  for (const [k, v] of Object.entries(gains)) out[k] = v * factor;
  return out;
}
