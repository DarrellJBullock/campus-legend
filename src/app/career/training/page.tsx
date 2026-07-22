"use client";

import { useState } from "react";
import { useCareerStore } from "@/stores/career-store";
import { weeklyActionsFor, projectAction } from "@/game-engine/training";
import { ATTRIBUTE_LABELS, SHARED_ATTRIBUTES } from "@/game-engine/types";
import { attributeKeysFor } from "@/game-engine/attributes";
import { StatBar } from "@/components/game/stat-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TrainingCenterPage() {
  const career = useCareerStore((s) => s.career);
  const performAction = useCareerStore((s) => s.performAction);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!career) return null;

  const { position, attributes } = career.athlete;
  const positionAttrKeys = attributeKeysFor(position).filter(
    (k) => !(SHARED_ATTRIBUTES as readonly string[]).includes(k),
  );
  const trainingActions = weeklyActionsFor(position).filter(
    (a) => a.category === "training",
  );

  function confirm(actionId: string) {
    performAction(actionId);
    setExpanded(null);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Training Center</CardTitle>
          <Badge variant="stadium">{career.actionPoints} AP left</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Drill your fundamentals, build strength, and sharpen your football
            IQ. Attribute gains apply diminishing returns, so steady, consistent
            training beats occasional bursts.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shared Attributes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SHARED_ATTRIBUTES.map((key) => (
              <StatBar
                key={key}
                label={ATTRIBUTE_LABELS[key] ?? key}
                value={attributes[key] ?? 0}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Position Attributes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {positionAttrKeys.map((key) => (
              <StatBar
                key={key}
                label={ATTRIBUTE_LABELS[key] ?? key}
                value={attributes[key] ?? 0}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg">Weekly Training</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trainingActions.map((action) => {
            const used = career.actionsThisWeek.includes(action.id);
            const disabled = used || career.actionPoints <= 0;
            const projection = projectAction(action);
            const isOpen = expanded === action.id;
            return (
              <Card key={action.id} className={cn(used && "opacity-60")}>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base">{action.label}</CardTitle>
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
      </div>
    </div>
  );
}
