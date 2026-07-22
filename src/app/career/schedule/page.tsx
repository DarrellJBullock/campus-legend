"use client";

import Link from "next/link";
import { useCareerStore } from "@/stores/career-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SchedulePage() {
  const career = useCareerStore((s) => s.career);
  if (!career) return null;

  const { season, weekOfSeason } = career;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Season {season.season} Schedule</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="stadium">
              {season.wins}-{season.losses}
            </Badge>
            <Badge variant="outline">{season.phase}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {season.classYear} season · Week {weekOfSeason}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {season.schedule.map((game) => {
          const isThisWeek = game.week === weekOfSeason && !game.played;
          return (
            <Card
              key={game.week}
              className={cn(isThisWeek && "border-stadium bg-stadium/10")}
            >
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <span className="w-14 font-mono text-sm text-muted-foreground">
                    Wk {game.week}
                  </span>
                  <div>
                    <p className="font-medium">
                      {game.home ? "vs." : "at"} {game.opponent.name}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {game.opponent.isRival ? (
                        <Badge variant="destructive">Rivalry</Badge>
                      ) : null}
                      {game.opponent.isConference ? (
                        <Badge variant="outline">Conference</Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {game.played && game.result ? (
                    <>
                      <span className="scoreboard text-lg">
                        {game.result.playerScore}-{game.result.opponentScore}
                      </span>
                      <Badge
                        variant={game.result.win ? "success" : "destructive"}
                      >
                        {game.result.win ? "W" : "L"}
                      </Badge>
                    </>
                  ) : isThisWeek ? (
                    <>
                      <Badge variant="stadium">This Week</Badge>
                      <Button asChild size="sm" variant="stadium">
                        <Link href="/career/game">Play Game</Link>
                      </Button>
                    </>
                  ) : (
                    <Badge variant="outline">Upcoming</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
