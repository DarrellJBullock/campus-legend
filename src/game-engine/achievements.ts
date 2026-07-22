/**
 * Achievements & awards — unlock evaluation.
 *
 * Achievements are checked against career state after key moments (game recap,
 * season end). Awards are season honors granted from performance thresholds.
 */

import {
  type Achievement,
  type Award,
  type CareerState,
  type GameResult,
} from "./types";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  check: (c: CareerState) => boolean;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first-start",
    name: "Take the Field",
    description: "Earn your first career start.",
    check: (c) =>
      ["Starter", "Captain", "Conference Star", "National Star"].includes(
        c.depthChart.role,
      ),
  },
  {
    id: "first-win",
    name: "W in the Books",
    description: "Win your first game.",
    check: (c) => c.gameLog.some((g) => g.win),
  },
  {
    id: "highlight",
    name: "SportsCenter Top 10",
    description: "Earn an A+ game grade.",
    check: (c) => c.gameLog.some((g) => g.performanceGrade === "A+"),
  },
  {
    id: "honor-roll",
    name: "Honor Roll",
    description: "Reach a 3.5 GPA.",
    check: (c) => c.resources.gpa >= 3.5,
  },
  {
    id: "first-deal",
    name: "Cha-Ching",
    description: "Sign your first sponsorship.",
    check: (c) =>
      c.activeSponsorships.length > 0 ||
      c.transactions.some((t) => t.amount > 0),
  },
  {
    id: "viral",
    name: "Going Viral",
    description: "Reach 25,000 followers.",
    check: (c) => c.resources.socialFollowing >= 25000,
  },
  {
    id: "captain",
    name: "Wear the C",
    description: "Become a team captain.",
    check: (c) =>
      ["Captain", "Conference Star", "National Star"].includes(
        c.depthChart.role,
      ),
  },
  {
    id: "rival-slayer",
    name: "Rivalry Hero",
    description: "Beat your rival.",
    check: (c) => c.gameLog.some((g) => g.isRival && g.win),
  },
  {
    id: "national-star",
    name: "National Spotlight",
    description: "Reach National Star status.",
    check: (c) => c.depthChart.role === "National Star",
  },
  {
    id: "draft-ready",
    name: "Draft Riser",
    description: "Push draft stock above 75.",
    check: (c) => c.resources.draftStock >= 75,
  },
];

/** Evaluate all achievements and return newly-unlocked ones. */
export function evaluateAchievements(
  career: CareerState,
  weekAbsolute: number,
): Achievement[] {
  const unlockedIds = new Set(
    career.achievements.filter((a) => a.unlockedWeek !== null).map((a) => a.id),
  );
  const newly: Achievement[] = [];
  for (const def of ACHIEVEMENT_DEFS) {
    if (unlockedIds.has(def.id)) continue;
    if (def.check(career)) {
      newly.push({
        id: def.id,
        name: def.name,
        description: def.description,
        unlockedWeek: weekAbsolute,
      });
    }
  }
  return newly;
}

export function initialAchievements(): Achievement[] {
  return ACHIEVEMENT_DEFS.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    unlockedWeek: null,
  }));
}

/** Grant end-of-season awards from the season's game log. */
export function grantSeasonAwards(
  gameLog: GameResult[],
  season: number,
): Award[] {
  const seasonGames = gameLog.filter((g) => g.season === season);
  if (seasonGames.length === 0) return [];
  const awards: Award[] = [];
  const avg =
    seasonGames.reduce((s, g) => s + g.performanceScore, 0) /
    seasonGames.length;
  const wins = seasonGames.filter((g) => g.win).length;

  if (avg >= 82)
    awards.push({
      id: `all-conf-${season}`,
      name: "All-Conference First Team",
      description: "Elite season-long production.",
      season,
    });
  else if (avg >= 72)
    awards.push({
      id: `all-conf-2-${season}`,
      name: "All-Conference Second Team",
      description: "A strong, consistent season.",
      season,
    });

  if (avg >= 88)
    awards.push({
      id: `player-of-year-${season}`,
      name: "Conference Player of the Year",
      description: "The best at your position in the league.",
      season,
    });

  if (wins >= 10)
    awards.push({
      id: `champ-${season}`,
      name: "Conference Champion",
      description: "Led your team to a title-caliber record.",
      season,
    });

  const rivalWin = seasonGames.find((g) => g.isRival && g.win);
  if (rivalWin)
    awards.push({
      id: `rivalry-mvp-${season}`,
      name: "Rivalry Game MVP",
      description: "Delivered when it mattered most.",
      season,
    });

  return awards;
}
