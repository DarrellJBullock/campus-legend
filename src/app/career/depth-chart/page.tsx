"use client";

import { useCareerStore } from "@/stores/career-store";
import { computeOverall } from "@/game-engine/attributes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function DepthChartPage() {
  const career = useCareerStore((s) => s.career);
  if (!career) return null;

  const { depthChart, athlete } = career;
  const overall = computeOverall(athlete.position, athlete.attributes);
  const playerRow = {
    id: "player",
    name: `${athlete.firstName} ${athlete.lastName}`,
    year: "You" as const,
    overall,
    role: depthChart.role,
    isPlayer: true,
  };
  const competitorRows = depthChart.competitors.map((c) => ({
    ...c,
    isPlayer: false,
  }));
  const rows = [...competitorRows, playerRow].sort(
    (a, b) => b.overall - a.overall,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Depth Chart</CardTitle>
          <div className="flex gap-2">
            <Badge variant="stadium">{depthChart.role}</Badge>
            <Badge variant="outline">Rank #{depthChart.rank}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {depthChart.lastMovementReason}
          </p>
          <p className="text-sm text-muted-foreground">
            Depth-chart movement is driven by your overall rating, recent
            training intensity, coach trust, discipline, health, and game-day
            performance. Slipping in any of these areas can cost you reps, while
            stacking strong weeks and big performances moves you up the chart.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{athlete.position} Position Group</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Year</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4 text-right">Overall</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-border/40 last:border-0",
                      row.isPlayer && "bg-stadium/10 font-medium",
                    )}
                  >
                    <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                    <td className="py-2 pr-4">
                      {row.name}
                      {row.isPlayer ? (
                        <Badge variant="stadium" className="ml-2">
                          You
                        </Badge>
                      ) : null}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {row.year}
                    </td>
                    <td className="py-2 pr-4">
                      <Badge variant="outline">{row.role}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-right font-mono tabular-nums">
                      {row.overall}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
