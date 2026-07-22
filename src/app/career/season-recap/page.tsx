"use client";

import { useRouter } from "next/navigation";
import { useCareerStore } from "@/stores/career-store";
import { madeConferenceChampionship, madeBowl } from "@/game-engine/season";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SeasonRecapPage() {
  const career = useCareerStore((s) => s.career);
  const advanceSeason = useCareerStore((s) => s.advanceSeason);
  const router = useRouter();

  if (!career) return null;

  const { season } = career;
  const champ = madeConferenceChampionship(season);
  const bowl = madeBowl(season);
  const seasonAwards = career.awards.filter((a) => a.season === season.season);

  function handleContinue() {
    advanceSeason();
    router.push("/career/offseason");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Season {season.season} Recap · {season.classYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge variant="stadium">
              {season.wins}-{season.losses}
            </Badge>
            {champ ? (
              <Badge variant="success">Conference Champions</Badge>
            ) : null}
            {bowl ? <Badge variant="success">Bowl Eligible</Badge> : null}
            {!champ && !bowl ? (
              <Badge variant="outline">Missed the postseason</Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {champ
              ? "A dominant campaign — you carried your team to the conference title game."
              : bowl
                ? "A solid campaign earned your team a bowl bid."
                : "A tough year on the field, but every season is a chance to grow."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Season Awards</CardTitle>
        </CardHeader>
        <CardContent>
          {seasonAwards.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No awards this season — keep building your résumé.
            </p>
          ) : (
            <ul className="space-y-3 text-sm">
              {seasonAwards.map((a) => (
                <li key={a.id}>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.description}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="stadium" size="lg" onClick={handleContinue}>
          Continue to Offseason
        </Button>
      </div>
    </div>
  );
}
