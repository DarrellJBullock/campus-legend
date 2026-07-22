"use client";

import { useState } from "react";
import { useCareerStore } from "@/stores/career-store";
import { computeOverall } from "@/game-engine/attributes";
import { ENDING_LABELS } from "@/game-engine/draft";
import { getSchool } from "@/content/schools";
import { TradingCard } from "@/components/game/trading-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CareerSummaryPage() {
  const career = useCareerStore((s) => s.career);
  const [copied, setCopied] = useState(false);

  if (!career) return null;

  const overall = computeOverall(
    career.athlete.position,
    career.athlete.attributes,
  );
  const school = getSchool(career.schoolId);
  const ending = career.ending ? ENDING_LABELS[career.ending] : null;
  const seasonsPlayed = career.season.season;
  const totalGames = career.gameLog.length;
  const totalWins = career.gameLog.filter((g) => g.win).length;
  const totalAwards = career.awards.length;
  const unlockedAchievements = career.achievements.filter(
    (a) => a.unlockedWeek !== null,
  ).length;

  async function handleCopy() {
    if (!career) return;
    const lines = [
      `${career.athlete.firstName} ${career.athlete.lastName} — ${career.athlete.position} — ${school?.name ?? "Campus Legend"}`,
      ending ? `${ending.title}: ${ending.blurb}` : "Career in progress",
      `${seasonsPlayed} seasons · ${totalWins}-${totalGames - totalWins} record · ${overall} OVR`,
      `${totalAwards} awards · ${unlockedAchievements} achievements unlocked`,
    ];
    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="mx-auto">
          <TradingCard
            athlete={career.athlete}
            schoolId={career.schoolId}
            overall={overall}
            classYear={career.season.classYear}
          />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {ending ? ending.title : "Career In Progress"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {ending
                  ? ending.blurb
                  : "This career hasn't reached its ending yet — here's the story so far."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Career Totals</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3 text-sm">
              <Badge variant="outline">{seasonsPlayed} Seasons</Badge>
              <Badge variant="outline">
                {totalWins}-{totalGames - totalWins} Record
              </Badge>
              <Badge variant="outline">{totalAwards} Awards</Badge>
              <Badge variant="outline">
                {unlockedAchievements} Achievements
              </Badge>
              <Badge variant="stadium">{overall} OVR</Badge>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button variant="stadium" onClick={handleCopy}>
              Copy Summary
            </Button>
            {copied ? <span className="text-sm text-turf">Copied!</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
