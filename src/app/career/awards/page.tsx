"use client";

import { Lock, Trophy } from "lucide-react";
import { useCareerStore } from "@/stores/career-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AwardsPage() {
  const career = useCareerStore((s) => s.career);
  if (!career) return null;

  const achievements = [...career.achievements].sort((a, b) => {
    if (a.unlockedWeek === null && b.unlockedWeek === null) return 0;
    if (a.unlockedWeek === null) return 1;
    if (b.unlockedWeek === null) return -1;
    return a.unlockedWeek - b.unlockedWeek;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Season Awards</CardTitle>
        </CardHeader>
        <CardContent>
          {career.awards.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No awards yet — put together a standout season to start collecting
              hardware.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {career.awards.map((award) => (
                <Card key={award.id} className="border-stadium/40 bg-stadium/5">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-stadium" aria-hidden />
                      <CardTitle className="text-base">{award.name}</CardTitle>
                    </div>
                    <Badge variant="stadium">Season {award.season}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {award.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No achievements tracked yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => {
                const unlocked = achievement.unlockedWeek !== null;
                return (
                  <Card
                    key={achievement.id}
                    className={cn(!unlocked && "opacity-50 grayscale")}
                  >
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-2">
                        {unlocked ? (
                          <Trophy className="h-4 w-4 text-turf" aria-hidden />
                        ) : (
                          <Lock
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden
                          />
                        )}
                        <CardTitle className="text-base">
                          {achievement.name}
                        </CardTitle>
                      </div>
                      {unlocked ? (
                        <Badge variant="success">
                          Week {achievement.unlockedWeek}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Locked</Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
