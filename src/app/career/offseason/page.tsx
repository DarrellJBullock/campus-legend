"use client";

import Link from "next/link";
import { useCareerStore } from "@/stores/career-store";
import {
  canDeclareForDraft,
  OFFSEASON_TRAINING_WEEKS,
} from "@/game-engine/season";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function OffseasonPage() {
  const career = useCareerStore((s) => s.career);
  if (!career) return null;

  const eligible = canDeclareForDraft(career.season.season);
  const wellEstablished = [
    "Starter",
    "Captain",
    "Conference Star",
    "National Star",
  ].includes(career.depthChart.role);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Offseason · Entering Season {career.season.season} as a{" "}
            {career.season.classYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            You have a {OFFSEASON_TRAINING_WEEKS}-week training window before
            the next season kicks off. Use it to sharpen your attributes, weigh
            a transfer, or — if you&apos;ve earned junior status — explore the
            draft.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline">{career.athlete.position}</Badge>
            <Badge variant="outline">
              {career.depthChart.role} · Rank #{career.depthChart.rank}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Continue Training</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Keep grinding at your current school and push for a bigger role
              next season.
            </p>
            <Button asChild variant="stadium">
              <Link href="/career/planner">Continue Training</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consider Transferring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {wellEstablished
                ? "Your role here is strong, but a bigger stage might still be worth exploring."
                : "A fresh depth chart elsewhere could open the door to more playing time."}
            </p>
            <Button asChild variant={wellEstablished ? "outline" : "secondary"}>
              <Link href="/career/transfer">Consider Transferring</Link>
            </Button>
          </CardContent>
        </Card>

        {eligible ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Declare for the Draft</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You&apos;ve reached junior year — you&apos;re eligible to
                declare for the professional draft.
              </p>
              <Button asChild variant="stadium">
                <Link href="/career/draft">Declare for the Draft</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
