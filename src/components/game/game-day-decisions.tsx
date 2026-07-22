"use client";

import { useState } from "react";
import type { GameDayDecision } from "@/game-engine/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Game-day decisions step. Renders each offered decision with its options as
 * a button group; once every decision has a selection, "Simulate Game"
 * submits the chosen option ids in decision order.
 */
export function GameDayDecisions({
  decisions,
  onSubmit,
}: {
  decisions: GameDayDecision[];
  onSubmit: (decisionOptionIds: string[]) => void;
}) {
  const [selections, setSelections] = useState<Record<string, string>>({});

  const allSelected = decisions.every((d) => Boolean(selections[d.id]));

  function choose(decisionId: string, optionId: string) {
    setSelections((prev) => ({ ...prev, [decisionId]: optionId }));
  }

  function simulate() {
    if (!allSelected) return;
    onSubmit(decisions.map((d) => selections[d.id]!));
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl uppercase tracking-wide">
        Game Day Decisions
      </h2>
      {decisions.map((decision) => (
        <Card key={decision.id}>
          <CardHeader>
            <CardTitle className="text-base normal-case">
              {decision.prompt}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-3">
            {decision.options.map((option) => {
              const selected = selections[decision.id] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => choose(decision.id, option.id)}
                  className={cn(
                    "focus-ring rounded-md border border-border p-3 text-left text-sm transition-colors hover:bg-muted",
                    selected && "border-stadium bg-stadium/10",
                  )}
                >
                  <p className="font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {option.riskReward}
                  </p>
                </button>
              );
            })}
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end">
        <Button
          variant="stadium"
          size="lg"
          disabled={!allSelected}
          onClick={simulate}
        >
          Simulate Game
        </Button>
      </div>
    </div>
  );
}
