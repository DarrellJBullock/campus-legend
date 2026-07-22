"use client";

import { useState } from "react";
import { useCareerStore } from "@/stores/career-store";
import { weeklyActionsFor, projectAction } from "@/game-engine/training";
import {
  ATTRIBUTE_LABELS,
  ELIGIBILITY_GPA_FLOOR,
  PROBATION_GPA_FLOOR,
} from "@/game-engine/types";
import { StatBar } from "@/components/game/stat-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AcademicCenterPage() {
  const career = useCareerStore((s) => s.career);
  const performAction = useCareerStore((s) => s.performAction);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!career) return null;

  const { academics, resources } = career;
  const academicActions = weeklyActionsFor(career.athlete.position).filter(
    (a) => a.category === "academic",
  );
  const eligible = resources.eligibility === "Eligible";

  function confirm(actionId: string) {
    performAction(actionId);
    setExpanded(null);
  }

  return (
    <div className="space-y-6">
      <Card className="surface-paper">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Academic Center</CardTitle>
          <Badge variant={eligible ? "success" : "destructive"}>
            {resources.eligibility} · {resources.gpa.toFixed(2)} GPA
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {academics.season
              ? `Season ${academics.season} · ${academics.term} Term`
              : null}
          </p>
          {!eligible ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              <p className="font-medium">Eligibility Warning</p>
              <p className="text-muted-foreground">
                Your cumulative GPA needs to stay at or above{" "}
                {ELIGIBILITY_GPA_FLOOR.toFixed(1)} to remain eligible. Falling
                below {PROBATION_GPA_FLOOR.toFixed(1)} puts you on academic
                probation, and dropping under {ELIGIBILITY_GPA_FLOOR.toFixed(1)}{" "}
                makes you ineligible to play. Prioritize tutoring and study
                sessions this week.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="surface-paper">
          <CardHeader>
            <CardTitle>Current Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm">
              {academics.courses.map((course) => (
                <li
                  key={course.id}
                  className="flex items-center justify-between rounded-md border border-border/60 p-2"
                >
                  <div>
                    <p className="font-medium">{course.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.department} · {course.credits} credits
                    </p>
                  </div>
                  <Badge variant="outline">
                    Difficulty {course.difficulty}/5
                  </Badge>
                </li>
              ))}
            </ul>
            <StatBar label="Study Progress" value={academics.studyProgress} />
          </CardContent>
        </Card>

        <Card className="surface-paper">
          <CardHeader>
            <CardTitle>Exam Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Midterm Score</span>
              <span>
                {academics.midtermScore !== null
                  ? academics.midtermScore
                  : "Not yet taken (Week 6)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Final Score</span>
              <span>
                {academics.finalScore !== null
                  ? academics.finalScore
                  : "Not yet taken (Week 12)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Term GPA</span>
              <span>
                {academics.termGpa !== null
                  ? academics.termGpa.toFixed(2)
                  : "Pending"}
              </span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-2">
              <span className="text-muted-foreground">Cumulative GPA</span>
              <span className="font-medium">{resources.gpa.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg">Academic Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {academicActions.map((action) => {
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
