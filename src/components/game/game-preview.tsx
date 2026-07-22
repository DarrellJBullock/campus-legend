"use client";

import Link from "next/link";
import type { ScheduleGame } from "@/game-engine/types";
import { getSchool } from "@/content/schools";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Game-day preview step. Shows the matchup for the current unplayed week and
 * a "Kickoff" action, or an empty state if no game is scheduled this week.
 */
export function GamePreview({
  game,
  onKickoff,
}: {
  game: ScheduleGame | undefined;
  onKickoff: () => void;
}) {
  if (!game) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Game This Week</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            There&apos;s no game scheduled this week — head back to the planner.
          </p>
          <Button asChild variant="stadium">
            <Link href="/career/planner">Back to Planner</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const school = getSchool(game.opponent.schoolId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>
          Week {game.week} · {game.home ? "Home" : "Away"} Game
        </CardTitle>
        <div className="flex flex-wrap gap-1">
          {game.opponent.isRival ? (
            <Badge variant="destructive">Rivalry</Badge>
          ) : null}
          {game.opponent.isConference ? (
            <Badge variant="outline">Conference</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="font-display text-2xl uppercase tracking-wide">
          {game.home ? "vs." : "at"} {game.opponent.name}
        </p>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:max-w-sm">
          <div>
            <dt className="text-muted-foreground">Opponent Strength</dt>
            <dd className="scoreboard text-lg text-stadium">
              {game.opponent.strength}
            </dd>
          </div>
          {school ? (
            <div>
              <dt className="text-muted-foreground">Program</dt>
              <dd>
                {school.name} {school.mascot}
              </dd>
            </div>
          ) : null}
        </dl>
        <Button variant="stadium" size="lg" onClick={onKickoff}>
          Kickoff
        </Button>
      </CardContent>
    </Card>
  );
}
