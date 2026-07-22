"use client";

/**
 * Career store — the single client-side orchestrator.
 *
 * Holds the active `CareerState` and exposes intent-level actions (perform a
 * weekly action, advance the week, play a game, resolve an event, sign a deal,
 * advance the season, end the career). Every mutation:
 *   1. runs through the pure game-engine modules,
 *   2. re-normalizes resources (bounds enforced in energy.ts),
 *   3. advances the RNG cursor for deterministic resume,
 *   4. persists locally (and to the cloud when signed in).
 *
 * Pages never touch engine modules directly — they call store actions and read
 * derived selectors. This keeps game rules in one place and the UI thin.
 */

import { create } from "zustand";
import type {
  CareerState,
  GameResult,
  StoryEvent,
  EventChoice,
} from "@/game-engine/types";
import { rngFor } from "@/game-engine/random";
import {
  weeklyActionsFor,
  executeAction,
  type WeeklyAction,
} from "@/game-engine/training";
import { applyDelta, weeklyResourceDrift } from "@/game-engine/energy";
import { runExams, updateCumulativeGpa } from "@/game-engine/academics";
import { adjustRelationships } from "@/game-engine/relationships";
import { computeOverall } from "@/game-engine/attributes";
import { recomputeDepthChart } from "@/game-engine/depth-chart";
import {
  simulateGame,
  buildGameDayDecisions,
  type SimInputs,
} from "@/game-engine/game-simulation";
import { pickEvent, resolveChoice, absoluteWeek } from "@/game-engine/events";
import {
  signSponsorship,
  tickSponsorship,
  isExpired,
  weeklyPayment,
} from "@/game-engine/sponsorships";
import {
  evaluateAchievements,
  grantSeasonAwards,
} from "@/game-engine/achievements";
import {
  buildSchedule,
  initialSeasonState,
  recordResult,
  classYearFor,
} from "@/game-engine/season";
import {
  computeDraftStock,
  productionScore,
  consistencyScore,
  positionValue,
  resolveEnding,
  runCombine,
} from "@/game-engine/draft";
import { initialDepthChart } from "@/game-engine/career";
import { STORY_EVENTS } from "@/content/events";
import { getSponsor } from "@/content/sponsors";
import { getSchool, coachingQuality, SCHOOLS } from "@/content/schools";
import {
  saveLocalCareer,
  loadLocalCareer,
  setActiveCareer,
  getActiveCareerId,
} from "@/lib/local-save";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import {
  upsertCloudCareer,
  loadCloudCareer as fetchCloudCareer,
} from "@/lib/cloud-save";
import { toast } from "@/components/ui/use-toast";
import { round } from "@/lib/utils";
import { ACTION_POINTS_PER_WEEK, MAX_SEASONS } from "@/game-engine/types";

function nowIso(): string {
  return new Date().toISOString();
}

interface CareerStore {
  career: CareerState | null;
  lastGameResult: GameResult | null;
  activeEvent: StoryEvent | null;
  /** Current authenticated Supabase user id, or null when signed out/guest. */
  userId: string | null;

  load: (career: CareerState) => void;
  loadById: (id: string) => boolean;
  loadCloudById: (slug: string) => Promise<boolean>;
  clear: () => void;

  weeklyActions: () => WeeklyAction[];
  performAction: (actionId: string) => void;
  advanceWeek: () => void;
  playGame: (decisionOptionIds: string[]) => GameResult | null;
  gameDayDecisions: () => ReturnType<typeof buildGameDayDecisions>;
  drawEvent: () => StoryEvent | null;
  resolveEvent: (choice: EventChoice) => void;
  dismissEvent: () => void;
  signSponsor: (sponsorId: string) => void;
  advanceSeason: () => void;
  endCareer: () => void;
  transferSchool: (schoolId: string) => void;
}

/** Current authenticated Supabase user id, tracked outside React so the
 *  plain `persist()` function below can fire a background cloud sync. */
let currentUserId: string | null = null;

/** Persist helper: stamp updatedAt, write to local storage, and — when
 *  signed in — sync to the cloud in the background (best-effort; a failed
 *  cloud write never blocks or reverts the local save). */
function persist(career: CareerState): CareerState {
  const stamped = { ...career, updatedAt: nowIso() };
  saveLocalCareer(stamped);
  if (currentUserId) {
    const supabase = createSupabaseBrowserClient();
    void upsertCloudCareer(supabase, currentUserId, stamped).catch(() => {
      toast({
        title: "Cloud save failed",
        description: "Your progress is saved locally; we'll retry next save.",
        variant: "destructive",
      });
    });
  }
  return stamped;
}

export const useCareerStore = create<CareerStore>((set, get) => ({
  career: null,
  lastGameResult: null,
  activeEvent: null,
  userId: null,

  load: (career) => {
    setActiveCareer(career.id);
    set({ career: persist(career), lastGameResult: null, activeEvent: null });
  },

  loadById: (id) => {
    const c = loadLocalCareer(id);
    if (!c) return false;
    setActiveCareer(id);
    set({ career: c, lastGameResult: null, activeEvent: null });
    return true;
  },

  loadCloudById: async (slug) => {
    if (!currentUserId) return false;
    const supabase = createSupabaseBrowserClient();
    const c = await fetchCloudCareer(supabase, currentUserId, slug);
    if (!c) return false;
    setActiveCareer(c.id);
    saveLocalCareer(c);
    set({ career: c, lastGameResult: null, activeEvent: null });
    return true;
  },

  clear: () => set({ career: null, lastGameResult: null, activeEvent: null }),

  weeklyActions: () => {
    const c = get().career;
    return c ? weeklyActionsFor(c.athlete.position) : [];
  },

  performAction: (actionId) => {
    const c = get().career;
    if (!c) return;
    if (c.actionPoints <= 0) {
      toast({
        title: "No action points left",
        description: "Advance the week to refresh.",
        variant: "destructive",
      });
      return;
    }
    if (c.actionsThisWeek.includes(actionId)) {
      toast({
        title: "Already done this week",
        description: "Pick a different action.",
        variant: "destructive",
      });
      return;
    }
    const action = weeklyActionsFor(c.athlete.position).find(
      (a) => a.id === actionId,
    );
    if (!action) return;

    const school = getSchool(c.schoolId);
    const rng = rngFor(c.seed, c.rngCursor);
    const outcome = executeAction(
      action,
      c.resources,
      c.athlete.attributes,
      c.athlete.attributes.workEthic ?? 60,
      school ? coachingQuality(school) : 60,
      rng,
    );

    const resources = applyDelta(outcome.resources, {
      coachTrust: outcome.coachTrustDelta,
    });
    const activeInjury =
      outcome.injury && outcome.injury.weeksOut > 0
        ? {
            name: outcome.injury.name,
            severity: outcome.injury.severity,
            returnWeekAbsolute:
              absoluteWeek(c.season.season, c.weekOfSeason) +
              outcome.injury.weeksOut,
          }
        : c.activeInjury;
    const next: CareerState = {
      ...c,
      resources,
      athlete: { ...c.athlete, attributes: outcome.attributes },
      actionPoints: c.actionPoints - 1,
      actionsThisWeek: [...c.actionsThisWeek, actionId],
      rngCursor: rng.getCursor(),
      activeInjury,
    };

    if (outcome.bonusText)
      toast({
        title: action.label,
        description: outcome.bonusText,
        variant: "success",
      });
    if (outcome.setbackText)
      toast({
        title: action.label,
        description: outcome.setbackText,
        variant: "destructive",
      });

    set({ career: persist(next) });
  },

  advanceWeek: () => {
    const c = get().career;
    if (!c) return;

    let resources = weeklyResourceDrift(c.resources);
    const news = c.news;
    let transactions = c.transactions;
    const weekAbs = absoluteWeek(c.season.season, c.weekOfSeason);

    // Sponsorship payouts + clause checks.
    const stillActive: typeof c.activeSponsorships = [];
    for (const active of c.activeSponsorships) {
      const sponsor = getSponsor(active.sponsorId);
      if (!sponsor) continue;
      const {
        active: ticked,
        payment,
        cancelled,
        reason,
      } = tickSponsorship(active, sponsor, resources, true);
      if (payment > 0) {
        resources = applyDelta(resources, { money: payment });
        transactions = [
          ...transactions,
          {
            id: `tx-${weekAbs}-${sponsor.id}`,
            week: c.weekOfSeason,
            season: c.season.season,
            label: `${sponsor.company} payment`,
            amount: payment,
          },
        ];
      }
      if (cancelled && reason) {
        toast({
          title: "Deal cancelled",
          description: reason,
          variant: "destructive",
        });
      } else if (!isExpired(ticked)) {
        stillActive.push(ticked);
      }
    }

    // Apply any delayed effects due now.
    const pending = c.pendingEffects.filter(
      (p) => p.applyWeekAbsolute <= weekAbs,
    );
    const remaining = c.pendingEffects.filter(
      (p) => p.applyWeekAbsolute > weekAbs,
    );
    for (const p of pending) {
      resources = applyDelta(resources, p.effects);
      toast({ title: "Consequence", description: p.text });
    }

    // Midterms/finals: study readiness (academicFocus) drives the exam score,
    // which blends into cumulative GPA and re-derives eligibility.
    const rng = rngFor(c.seed, c.rngCursor);
    let academics = { ...c.academics, studyProgress: resources.academicFocus };
    const examKind =
      c.weekOfSeason === 6 && academics.midtermScore === null
        ? "midterm"
        : c.weekOfSeason === 12 && academics.finalScore === null
          ? "final"
          : null;
    if (examKind) {
      const { term, termGpa } = runExams(
        academics,
        c.athlete.academicStrength,
        examKind,
        rng,
      );
      academics = term;
      const nextGpa = updateCumulativeGpa(resources.gpa, termGpa);
      resources = applyDelta(resources, {
        gpa: nextGpa - resources.gpa,
        academicFocus: -20,
      });
      toast({
        title:
          examKind === "midterm"
            ? "Midterm Grades Posted"
            : "Final Grades Posted",
        description: `Term GPA ${termGpa.toFixed(2)} · Cumulative ${resources.gpa.toFixed(2)}`,
        variant:
          resources.eligibility === "Eligible" ? "success" : "destructive",
      });
    }

    const nextWeekOfSeason = c.weekOfSeason + 1;
    let activeInjury = c.activeInjury;
    if (
      activeInjury &&
      absoluteWeek(c.season.season, nextWeekOfSeason) >=
        activeInjury.returnWeekAbsolute
    ) {
      toast({
        title: "Cleared to Play",
        description: `You're fully recovered from your ${activeInjury.name.toLowerCase()} and ready to go.`,
        variant: "success",
      });
      activeInjury = null;
    }

    const next: CareerState = {
      ...c,
      resources,
      activeSponsorships: stillActive,
      pendingEffects: remaining,
      academics,
      news,
      transactions,
      weekOfSeason: nextWeekOfSeason,
      actionPoints: ACTION_POINTS_PER_WEEK,
      actionsThisWeek: [],
      season: { ...c.season, phase: "Regular" },
      rngCursor: rng.getCursor(),
      activeInjury,
    };
    set({ career: persist(next) });
  },

  gameDayDecisions: () => {
    const c = get().career;
    if (!c) return [];
    const rng = rngFor(c.seed, c.rngCursor);
    return buildGameDayDecisions(c.athlete.position, c.resources, rng);
  },

  playGame: (decisionOptionIds) => {
    const c = get().career;
    if (!c) return null;
    const game = c.season.schedule.find(
      (g) => g.week === c.weekOfSeason && !g.played,
    );
    if (!game) {
      toast({
        title: "No game this week",
        description: "Advance to a game week.",
        variant: "destructive",
      });
      return null;
    }

    const sidelined =
      c.activeInjury &&
      absoluteWeek(c.season.season, c.weekOfSeason) <
        c.activeInjury.returnWeekAbsolute;
    if (sidelined) {
      const injury = c.activeInjury!;
      const rng = rngFor(c.seed, c.rngCursor);
      const school = getSchool(c.schoolId);
      const teamQuality = school ? school.athleticPrestige : 60;
      const winChance = Math.min(
        0.85,
        Math.max(0.15, 0.5 + (teamQuality - game.opponent.strength) / 200),
      );
      const win = rng.chance(winChance);
      const winnerScore = rng.int(17, 38);
      const loserScore = Math.max(0, winnerScore - rng.int(3, 21));
      const teamName = school ? `${school.name} ${school.mascot}` : "Your team";

      const result: GameResult = {
        week: c.weekOfSeason,
        season: c.season.season,
        opponentName: game.opponent.name,
        isRival: game.opponent.isRival,
        playerScore: win ? winnerScore : loserScore,
        opponentScore: win ? loserScore : winnerScore,
        win,
        stats: {},
        performanceGrade: "DNP",
        performanceScore: 0,
        keyPlays: [
          `You watched from the sideline, still recovering from your ${injury.name.toLowerCase()}.`,
        ],
        coachFeedback: "Get healthy — we need you back at full strength.",
        headline: `${teamName} ${win ? "wins" : "falls"} while ${c.athlete.firstName} ${c.athlete.lastName} sits out with injury`,
        attributeXp: 0,
        injury: null,
        reputationDelta: 0,
        draftStockDelta: 0,
        depthChartEffect: "No change — you didn't play this week.",
      };

      const season = recordResult(c.season, c.weekOfSeason, win);
      const withResult: CareerState = {
        ...c,
        season: {
          ...season,
          schedule: season.schedule.map((g) =>
            g.week === c.weekOfSeason ? { ...g, result } : g,
          ),
        },
        gameLog: [...c.gameLog, result],
        news: [
          ...c.news,
          {
            id: `news-${absoluteWeek(c.season.season, c.weekOfSeason)}`,
            week: c.weekOfSeason,
            season: c.season.season,
            headline: result.headline,
            body: result.coachFeedback,
            tone: win ? "positive" : "negative",
          },
        ],
        rngCursor: rng.getCursor(),
      };
      set({ career: persist(withResult), lastGameResult: result });
      return result;
    }

    const rng = rngFor(c.seed, c.rngCursor);
    const decisions = buildGameDayDecisions(
      c.athlete.position,
      c.resources,
      rng,
    );
    let decisionMod = 0;
    let resources = c.resources;
    decisions.forEach((d) => {
      const chosen =
        d.options.find((o) => decisionOptionIds.includes(o.id)) ??
        d.options[0]!;
      decisionMod +=
        chosen.performanceMod +
        (rng.chance(0.5)
          ? rng.float(0, chosen.variance)
          : -rng.float(0, chosen.variance));
      if (chosen.resource) resources = applyDelta(resources, chosen.resource);
    });

    const school = getSchool(c.schoolId);
    const weather = rng.pick([
      "Clear",
      "Clear",
      "Rain",
      "Wind",
      "Snow",
      "Heat",
    ] as const);
    const input: SimInputs = {
      athlete: c.athlete,
      resources,
      opponent: game.opponent,
      teamQuality: school ? school.athleticPrestige : 60,
      home: game.home,
      schemeFit: 60,
      weather,
      decisionMod,
      week: c.weekOfSeason,
      season: c.season.season,
    };
    const result = simulateGame(input, rng);

    // Apply results.
    resources = applyDelta(resources, {
      fatigue: 18,
      confidence: result.win ? 4 : -3,
      nationalReputation: result.reputationDelta,
      campusReputation: round(result.reputationDelta * 0.8),
      draftStock: result.draftStockDelta,
      teamChemistry: result.win ? 2 : -1,
    });
    if (result.injury) {
      resources = applyDelta(resources, {
        health: -result.injury.healthImpact,
        injuryRisk: 10,
      });
    }

    const season = recordResult(c.season, c.weekOfSeason, result.win);
    const overall = computeOverall(c.athlete.position, c.athlete.attributes);
    const depthChart = recomputeDepthChart(
      c.depthChart,
      {
        overall,
        coachTrust: resources.coachTrust,
        recentTrainingBoost: 6,
        discipline: c.athlete.attributes.discipline ?? 60,
        health: resources.health,
        lastGameScore: result.performanceScore,
        schemeFit: 60,
      },
      resources,
      false,
    );

    const withResult: CareerState = {
      ...c,
      resources,
      season: {
        ...season,
        schedule: season.schedule.map((g) =>
          g.week === c.weekOfSeason ? { ...g, result } : g,
        ),
      },
      depthChart,
      gameLog: [...c.gameLog, result],
      news: [
        ...c.news,
        {
          id: `news-${absoluteWeek(c.season.season, c.weekOfSeason)}`,
          week: c.weekOfSeason,
          season: c.season.season,
          headline: result.headline,
          body: result.coachFeedback,
          tone: result.win ? "positive" : "negative",
        },
      ],
      rngCursor: rng.getCursor(),
    };

    // Achievements.
    const newAchievements = evaluateAchievements(
      withResult,
      absoluteWeek(c.season.season, c.weekOfSeason),
    );
    if (newAchievements.length) {
      withResult.achievements = withResult.achievements.map((a) => {
        const unlocked = newAchievements.find((n) => n.id === a.id);
        return unlocked ?? a;
      });
      newAchievements.forEach((a) =>
        toast({
          title: "Achievement unlocked",
          description: a.name,
          variant: "success",
        }),
      );
    }

    set({ career: persist(withResult), lastGameResult: result });
    return result;
  },

  drawEvent: () => {
    const c = get().career;
    if (!c) return null;
    const rng = rngFor(c.seed, c.rngCursor);
    const event = pickEvent(
      STORY_EVENTS,
      {
        resources: c.resources,
        role: c.depthChart.role,
        season: c.season.season,
        position: c.athlete.position,
        completedEventIds: c.completedEventIds,
      },
      rng,
    );
    if (event) {
      set({
        activeEvent: event,
        career: persist({ ...c, rngCursor: rng.getCursor() }),
      });
    }
    return event;
  },

  resolveEvent: (choice) => {
    const c = get().career;
    const event = get().activeEvent;
    if (!c || !event) return;
    const resolved = resolveChoice(
      choice,
      absoluteWeek(c.season.season, c.weekOfSeason),
    );

    const resources = applyDelta(c.resources, resolved.immediate);
    const relationships = adjustRelationships(
      c.relationships,
      resolved.relationships,
    );
    let attributes = c.athlete.attributes;
    for (const [k, v] of Object.entries(resolved.attributeDelta)) {
      attributes = { ...attributes, [k]: (attributes[k] ?? 50) + v };
    }
    const pendingEffects = resolved.delayed
      ? [...c.pendingEffects, resolved.delayed]
      : c.pendingEffects;

    const next: CareerState = {
      ...c,
      resources,
      relationships,
      athlete: { ...c.athlete, attributes },
      pendingEffects,
      completedEventIds: [...c.completedEventIds, event.id],
    };
    toast({ title: event.title, description: resolved.outcomeText });
    set({ career: persist(next), activeEvent: null });
  },

  dismissEvent: () => set({ activeEvent: null }),

  signSponsor: (sponsorId) => {
    const c = get().career;
    if (!c) return;
    if (c.activeSponsorships.some((a) => a.sponsorId === sponsorId)) return;
    const sponsor = getSponsor(sponsorId);
    if (!sponsor) return;
    const active = signSponsorship(
      sponsor,
      absoluteWeek(c.season.season, c.weekOfSeason),
    );
    const signingBonus = round(weeklyPayment(sponsor, c.resources));
    const next: CareerState = {
      ...c,
      activeSponsorships: [...c.activeSponsorships, active],
      resources: applyDelta(c.resources, { money: signingBonus, morale: 4 }),
      transactions: [
        ...c.transactions,
        {
          id: `tx-sign-${sponsor.id}`,
          week: c.weekOfSeason,
          season: c.season.season,
          label: `${sponsor.company} signing`,
          amount: signingBonus,
        },
      ],
    };
    toast({
      title: "Deal signed!",
      description: `${sponsor.company} — ${sponsor.category}`,
      variant: "success",
    });
    set({ career: persist(next) });
  },

  advanceSeason: () => {
    const c = get().career;
    if (!c) return;
    const awards = grantSeasonAwards(c.gameLog, c.season.season);
    if (c.season.season >= MAX_SEASONS) {
      get().endCareer();
      return;
    }
    const nextSeasonNum = c.season.season + 1;
    const rng = rngFor(c.seed, c.rngCursor);
    const others = SCHOOLS.filter((s) => s.id !== c.schoolId);
    const shuffled = rng.shuffle(others).slice(0, 12);
    const opponents = shuffled.map((s, i) => ({
      id: s.id,
      schoolId: s.id,
      name: `${s.name} ${s.mascot}`,
      strength: Math.round((s.athleticPrestige + s.coachingRating) / 2),
      isRival: i === 0,
      isConference: getSchool(c.schoolId)?.conferenceId === s.conferenceId,
    }));
    const schedule = buildSchedule(opponents, opponents[0]?.id ?? "", rng);

    const next: CareerState = {
      ...c,
      season: {
        ...initialSeasonState(nextSeasonNum, schedule),
        classYear: classYearFor(nextSeasonNum),
      },
      weekOfSeason: 1,
      actionPoints: ACTION_POINTS_PER_WEEK,
      actionsThisWeek: [],
      awards: [...c.awards, ...awards],
      academics: {
        ...c.academics,
        season: nextSeasonNum,
        midtermScore: null,
        finalScore: null,
        termGpa: null,
      },
      rngCursor: rng.getCursor(),
    };
    awards.forEach((a) =>
      toast({ title: "Season award", description: a.name, variant: "success" }),
    );
    set({ career: persist(next) });
  },

  endCareer: () => {
    const c = get().career;
    if (!c) return;
    const rng = rngFor(c.seed, c.rngCursor);
    const combine = runCombine(c, rng);
    const overall = computeOverall(c.athlete.position, c.athlete.attributes);
    const school = getSchool(c.schoolId);
    const stock = computeDraftStock({
      overall,
      production: productionScore(c.gameLog),
      awards: Math.min(c.awards.length * 20, 100),
      healthHistory: c.resources.health,
      characterScore: Math.round(
        ((c.athlete.attributes.discipline ?? 60) +
          (c.athlete.attributes.leadership ?? 60)) /
          2,
      ),
      competitionLevel: school ? school.athleticPrestige : 60,
      academicStanding: c.resources.gpa * 25,
      consistency: consistencyScore(c.gameLog),
      positionValue: positionValue(c.athlete.position),
    });
    const finalStock = Math.min(100, stock + combine.overallBoost);
    const ending = resolveEnding({
      finalStock,
      gpa: c.resources.gpa,
      eligibilityIneligible: c.resources.eligibility === "Ineligible",
      hadCareerEndingInjury: c.resources.health < 15,
      season: c.season.season,
      graduated: c.season.season >= MAX_SEASONS,
      isNationalStar: c.depthChart.role === "National Star",
    });
    const next: CareerState = {
      ...c,
      resources: { ...c.resources, draftStock: finalStock },
      ending,
    };
    set({ career: persist(next) });
  },

  transferSchool: (schoolId) => {
    const c = get().career;
    if (!c || schoolId === c.schoolId) return;
    const rng = rngFor(c.seed, c.rngCursor);
    const overall = computeOverall(c.athlete.position, c.athlete.attributes);
    const school = getSchool(schoolId);
    const next: CareerState = {
      ...c,
      schoolId,
      depthChart: initialDepthChart(overall, rng),
      resources: applyDelta(c.resources, {
        coachTrust: -10,
        campusReputation: -10,
        confidence: -5,
      }),
      rngCursor: rng.getCursor(),
    };
    toast({
      title: "Transfer Complete",
      description: `Welcome to ${school?.name ?? "your new program"}. You'll have to earn your spot again.`,
    });
    set({ career: persist(next) });
  },
}));

/**
 * Auth session tracking. Runs once per browser session (this module is a
 * singleton). Mirrors the Supabase session into `currentUserId` (used by the
 * plain `persist()` function above) and into the store's `userId` field (so
 * components can react to sign-in/out). On a fresh sign-in, also pushes
 * whichever career is currently active in local storage to the cloud — this
 * is the guest-to-account handoff: play as a guest, sign in, and your
 * in-progress career is copied to your account automatically.
 */
if (typeof window !== "undefined" && isSupabaseConfigured()) {
  const supabase = createSupabaseBrowserClient();

  supabase.auth.getSession().then(({ data }) => {
    currentUserId = data.session?.user.id ?? null;
    useCareerStore.setState({ userId: currentUserId });
  });

  supabase.auth.onAuthStateChange((event, session) => {
    currentUserId = session?.user.id ?? null;
    useCareerStore.setState({ userId: currentUserId });
    if (event === "SIGNED_IN" && currentUserId) {
      const activeId = getActiveCareerId();
      const localCareer = activeId ? loadLocalCareer(activeId) : null;
      if (localCareer) {
        void upsertCloudCareer(supabase, currentUserId, localCareer);
      }
    }
  });
}
