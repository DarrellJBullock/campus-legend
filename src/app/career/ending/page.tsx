"use client";

import Link from "next/link";
import { useCareerStore } from "@/stores/career-store";
import { ENDING_LABELS } from "@/game-engine/draft";
import { StatBar } from "@/components/game/stat-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CareerEndingPage() {
  const career = useCareerStore((s) => s.career);
  if (!career) return null;

  if (!career.ending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Ending Resolved Yet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your career hasn&apos;t reached an ending yet. Keep playing, or
            declare for the draft once you&apos;re eligible to resolve your
            career&apos;s final chapter.
          </p>
          <Button asChild variant="stadium">
            <Link href="/career">Back to Career Hub</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const label = ENDING_LABELS[career.ending];
  const unlockedAchievements = career.achievements.filter(
    (a) => a.unlockedWeek !== null,
  ).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{label.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{label.blurb}</p>
          <StatBar
            label="Final Draft Stock"
            value={career.resources.draftStock}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Career Highlights</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm">
          <Badge variant="outline">
            Final Season {career.season.wins}-{career.season.losses}
          </Badge>
          <Badge variant="outline">{career.awards.length} Awards</Badge>
          <Badge variant="outline">
            {unlockedAchievements} Achievements Unlocked
          </Badge>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button asChild variant="stadium" size="lg">
          <Link href="/career/summary">View Career Summary</Link>
        </Button>
      </div>
    </div>
  );
}
