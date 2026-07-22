"use client";

import type { GameResult, GameStatLine, Position } from "@/game-engine/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STAT_FIELDS: Record<
  Position,
  { key: keyof GameStatLine; label: string }[]
> = {
  QB: [
    { key: "completions", label: "Completions" },
    { key: "passAttempts", label: "Attempts" },
    { key: "passYards", label: "Pass Yards" },
    { key: "passTds", label: "Pass TDs" },
    { key: "interceptions", label: "Interceptions" },
    { key: "rushYards", label: "Rush Yards" },
  ],
  RB: [
    { key: "carries", label: "Carries" },
    { key: "rbRushYards", label: "Rush Yards" },
    { key: "rushTds", label: "Rush TDs" },
    { key: "receptions", label: "Receptions" },
    { key: "recYards", label: "Rec Yards" },
    { key: "fumbles", label: "Fumbles" },
  ],
  WR: [
    { key: "targets", label: "Targets" },
    { key: "wrReceptions", label: "Receptions" },
    { key: "wrRecYards", label: "Rec Yards" },
    { key: "wrTds", label: "Receiving TDs" },
    { key: "drops", label: "Drops" },
  ],
  LB: [
    { key: "tackles", label: "Tackles" },
    { key: "tacklesForLoss", label: "Tackles For Loss" },
    { key: "sacks", label: "Sacks" },
    { key: "forcedFumbles", label: "Forced Fumbles" },
    { key: "passBreakups", label: "Pass Breakups" },
  ],
  CB: [
    { key: "cbTackles", label: "Tackles" },
    { key: "cbInterceptions", label: "Interceptions" },
    { key: "cbPassBreakups", label: "Pass Breakups" },
    { key: "targetsAllowed", label: "Targets Allowed" },
    { key: "tdsAllowed", label: "TDs Allowed" },
  ],
};

function DeltaBadge({ label, value }: { label: string; value: number }) {
  if (value === 0) return null;
  return (
    <Badge variant={value > 0 ? "success" : "destructive"}>
      {label} {value > 0 ? "+" : ""}
      {value}
    </Badge>
  );
}

/**
 * Game-day recap step. Renders the final `GameResult` — score, grade,
 * position-relevant box score, key plays, coach feedback, headline, any
 * injury, and reputation/draft-stock deltas.
 */
export function GameRecap({
  result,
  position,
  onContinue,
}: {
  result: GameResult;
  position: Position;
  onContinue: () => void;
}) {
  const statFields = STAT_FIELDS[position];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>
            {result.win ? "Victory" : "Defeat"} · Week {result.week}
          </CardTitle>
          <Badge variant={result.win ? "success" : "destructive"}>
            {result.win ? "W" : "L"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="scoreboard text-3xl text-stadium">
            {result.playerScore}-{result.opponentScore}
          </p>
          <p className="text-sm text-muted-foreground">
            vs. {result.opponentName}
            {result.isRival ? " (Rivalry)" : ""}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="stadium">Grade {result.performanceGrade}</Badge>
            <Badge variant="outline">
              Performance {result.performanceScore}/100
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Box Score</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            {statFields.map(({ key, label }) => {
              const value = result.stats[key];
              if (value === undefined) return null;
              return (
                <div
                  key={key}
                  className="flex justify-between border-b border-border/50 pb-1"
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-mono">{value}</dd>
                </div>
              );
            })}
          </dl>
        </CardContent>
      </Card>

      <div className="surface-paper rounded-lg p-5">
        <p className="font-display text-lg uppercase tracking-wide">
          {result.headline}
        </p>
        <p className="mt-2 text-sm italic text-charcoal/80">
          {result.coachFeedback}
        </p>
      </div>

      {result.keyPlays.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Key Plays</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {result.keyPlays.map((play, i) => (
                <li key={`${i}-${play}`}>{play}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {result.injury ? (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Injury Report</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>
              {result.injury.name} — {result.injury.severity} (
              {result.injury.weeksOut} wk
              {result.injury.weeksOut === 1 ? "" : "s"} out)
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <DeltaBadge label="Reputation" value={result.reputationDelta} />
        <DeltaBadge label="Draft Stock" value={result.draftStockDelta} />
      </div>
      <p className="text-xs text-muted-foreground">{result.depthChartEffect}</p>

      <div className="flex justify-end">
        <Button variant="stadium" size="lg" onClick={onContinue}>
          Continue to Planner
        </Button>
      </div>
    </div>
  );
}
