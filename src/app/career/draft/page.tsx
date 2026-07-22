"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCareerStore } from "@/stores/career-store";
import { canDeclareForDraft } from "@/game-engine/season";
import { StatBar } from "@/components/game/stat-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DraftPrepPage() {
  const career = useCareerStore((s) => s.career);
  const endCareer = useCareerStore((s) => s.endCareer);
  const router = useRouter();

  if (!career) return null;

  if (!canDeclareForDraft(career.season.season)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not Yet Eligible</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Draft declaration opens after your junior year (season 3+).
            You&apos;re currently in season {career.season.season}. Keep
            building your résumé and check back once you&apos;ve earned junior
            standing.
          </p>
          <Button asChild variant="stadium">
            <Link href="/career">Back to Career Hub</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  function handleDeclare() {
    endCareer();
    router.push("/career/ending");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Draft Prep & Combine</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The combine measures raw athleticism — 40-yard dash, bench press,
            vertical jump, and three-cone drill — layered on top of your game
            production, awards, health history, and character to set your final
            draft stock.
          </p>
          <StatBar
            label="Current Draft Stock"
            value={career.resources.draftStock}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Declare for the Draft</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Declaring ends your college career and runs the combine. This cannot
            be undone — make sure you&apos;re ready to move on.
          </p>
          <Button variant="stadium" size="lg" onClick={handleDeclare}>
            Declare for the Draft
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
