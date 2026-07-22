"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useCareerStore } from "@/stores/career-store";
import { computeOverall } from "@/game-engine/attributes";
import { STAT_FIELDS } from "@/components/game/game-recap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GameChartPoint {
  index: number;
  label: string;
  performanceScore: number;
  win: boolean;
}

export default function StatsPage() {
  const career = useCareerStore((s) => s.career);
  if (!career) return null;

  const overall = computeOverall(
    career.athlete.position,
    career.athlete.attributes,
  );
  const gameLog = career.gameLog;
  const wins = gameLog.filter((g) => g.win).length;
  const losses = gameLog.length - wins;
  const winPct = gameLog.length > 0 ? (wins / gameLog.length) * 100 : 0;

  const cumulativeStats = STAT_FIELDS[career.athlete.position].map(
    ({ key, label }) => ({
      key,
      label,
      total: gameLog.reduce((sum, g) => sum + (g.stats[key] ?? 0), 0),
    }),
  );

  const chartData: GameChartPoint[] = gameLog.map((g, i) => ({
    index: i + 1,
    label: `S${g.season}W${g.week}`,
    performanceScore: g.performanceScore,
    win: g.win,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Overall Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="scoreboard text-3xl text-stadium">{overall}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Draft Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="scoreboard text-3xl text-turf">
              {Math.round(career.resources.draftStock)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="scoreboard text-3xl">
              {career.resources.gpa.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Career Totals</CardTitle>
        </CardHeader>
        <CardContent>
          {gameLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Play your first game to start building your career totals.
            </p>
          ) : (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              {cumulativeStats.map(({ key, label, total }) => (
                <div
                  key={key}
                  className="flex justify-between border-b border-border/50 pb-1"
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="scoreboard font-mono">{total}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Play your first game to see stats here.
            </p>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 16, bottom: 0, left: -16 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="performanceScore"
                    name="Performance"
                    stroke="hsl(var(--cl-stadium))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Career Record</CardTitle>
        </CardHeader>
        <CardContent>
          {gameLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No games played yet this career.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="success">{wins}W</Badge>
                <Badge variant="destructive">{losses}L</Badge>
                <span className="text-sm text-muted-foreground">
                  {winPct.toFixed(0)}% win rate across {gameLog.length} games
                </span>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full bg-turf")}
                  style={{ width: `${winPct}%` }}
                />
                <div
                  className="h-full bg-destructive"
                  style={{ width: `${100 - winPct}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
