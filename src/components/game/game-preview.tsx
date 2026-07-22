"use client";

import Link from "next/link";
import type { ActiveInjury, ScheduleGame } from "@/game-engine/types";
import { getSchool } from "@/content/schools";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Game-day preview step. Shows the matchup for the current unplayed week and
 * a "Kickoff" action, or an empty state if no game is scheduled this week.
 * When `activeInjury` is set, the player is currently sidelined — kickoff
 * simulates the team's result without them instead of offering decisions.
 */
export function GamePreview({
  game,
  onKickoff,
  activeInjury = null,
}: {
  game: ScheduleGame | undefined;
  onKickoff: () => void;
  activeInjury?: ActiveInjury | null;
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
        {activeInjury ? (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
            <p className="font-medium text-destructive">
              You&apos;re out with {activeInjury.name} ({activeInjury.severity})
            </p>
            <p className="mt-1 text-muted-foreground">
              The team plays on without you this week — no game-day decisions to
              make while you&apos;re sidelined.
            </p>
          </div>
        ) : null}
        <Button variant="stadium" size="lg" onClick={onKickoff}>
          {activeInjury ? "Simulate Without Me" : "Kickoff"}
        </Button>
      </CardContent>
    </Card>
  );
}
