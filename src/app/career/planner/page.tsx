"use client";

import { useState } from "react";
import Link from "next/link";
import { useCareerStore } from "@/stores/career-store";
import { projectAction } from "@/game-engine/training";
import { ATTRIBUTE_LABELS } from "@/game-engine/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  training: "Training",
  academic: "Academic",
  recovery: "Recovery",
  social: "Social",
  branding: "Branding",
};

export default function WeeklyPlannerPage() {
  const career = useCareerStore((s) => s.career);
  const weeklyActions = useCareerStore((s) => s.weeklyActions);
  const performAction = useCareerStore((s) => s.performAction);
  const advanceWeek = useCareerStore((s) => s.advanceWeek);
  const drawEvent = useCareerStore((s) => s.drawEvent);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!career) return null;

  const actions = weeklyActions();
  const upcomingGame = career.season.schedule.find(
    (g) => g.week === career.weekOfSeason && !g.played,
  );
  const canAdvance = !upcomingGame;

  function confirm(actionId: string) {
    performAction(actionId);
    setExpanded(null);
  }

  function onAdvance() {
    advanceWeek();
    drawEvent();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Week {career.weekOfSeason} Planner</CardTitle>
          <Badge variant="stadium">{career.actionPoints} AP left</Badge>
        </CardHeader>
        <CardContent>
          {upcomingGame ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-stadium/40 bg-stadium/10 p-3 text-sm">
              <span>
                Game day this week — {upcomingGame.home ? "vs." : "at"}{" "}
                {upcomingGame.opponent.name}. Play it before advancing to next
                week.
              </span>
              <Button asChild size="sm" variant="stadium">
                <Link href="/career/game">Go to Game Preview</Link>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No game this week. Spend your action points, then advance to the
              next week.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => {
          const used = career.actionsThisWeek.includes(action.id);
          const disabled = used || career.actionPoints <= 0;
          const projection = projectAction(action, career.resources);
          const isOpen = expanded === action.id;
          return (
            <Card key={action.id} className={cn(used && "opacity-60")}>
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{action.label}</CardTitle>
                  <Badge variant="outline">
                    {CATEGORY_LABELS[action.category]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>Energy: -{action.energyCost}</span>
                  <span>Injury risk: {projection.injuryChanceLabel}</span>
                </div>
                {isOpen ? (
                  <div className="space-y-2 rounded-md bg-muted/50 p-2 text-xs">
                    <p className="font-medium">Projected effects</p>
                    <ul className="space-y-0.5">
                      {Object.entries(projection.projectedEffects).map(
                        ([k, v]) => (
                          <li key={k} className="flex justify-between">
                            <span className="capitalize text-muted-foreground">
                              {k}
                            </span>
                            <span
                              className={
                                Number(v) >= 0
                                  ? "text-turf"
                                  : "text-destructive"
                              }
                            >
                              {Number(v) > 0 ? "+" : ""}
                              {v}
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                    {Object.keys(projection.attributeGains).length > 0 ? (
                      <>
                        <p className="pt-1 font-medium">Attribute growth</p>
                        <ul className="space-y-0.5">
                          {Object.entries(projection.attributeGains).map(
                            ([k, v]) => (
                              <li key={k} className="flex justify-between">
                                <span className="text-muted-foreground">
                                  {ATTRIBUTE_LABELS[k] ?? k}
                                </span>
                                <span className="text-turf">+{v}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </>
                    ) : null}
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpanded(isOpen ? null : action.id)}
                  >
                    {isOpen ? "Hide preview" : "Preview"}
                  </Button>
                  <Button
                    size="sm"
                    variant="stadium"
                    disabled={disabled}
                    onClick={() => confirm(action.id)}
                  >
                    {used ? "Done this week" : "Confirm"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          variant="stadium"
          disabled={!canAdvance}
          onClick={onAdvance}
        >
          Advance to Week {career.weekOfSeason + 1}
        </Button>
      </div>
    </div>
  );
}
