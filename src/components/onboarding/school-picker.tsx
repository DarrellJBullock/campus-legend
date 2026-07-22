"use client";

import { useState } from "react";
import { CONFERENCES, schoolsInConference } from "@/content/schools";
import type { Position } from "@/game-engine/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function pathToPlaytime(competition: number): {
  label: string;
  tone: "success" | "outline" | "destructive";
} {
  if (competition < 40)
    return { label: "Clear path to early snaps", tone: "success" };
  if (competition < 65)
    return { label: "Open competition at your spot", tone: "outline" };
  return {
    label: "Crowded room — you'll have to earn it",
    tone: "destructive",
  };
}

export function SchoolPicker({
  position,
  onSelect,
}: {
  position: Position;
  onSelect: (schoolId: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {CONFERENCES.map((conf) => (
        <div key={conf.id}>
          <h3 className="font-display text-lg">
            {conf.name}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              · {conf.region}
            </span>
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schoolsInConference(conf.id).map((school) => {
              const comp = school.positionCompetition[position];
              const playtime = pathToPlaytime(comp);
              const isSelected = selected === school.id;
              return (
                <button
                  key={school.id}
                  type="button"
                  onClick={() => setSelected(school.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "trading-card focus-ring flex flex-col gap-2 p-4 text-left text-cream",
                    isSelected && "ring-2 ring-stadium",
                  )}
                  style={
                    {
                      "--team-primary": school.primaryColor,
                      "--team-secondary": school.secondaryColor,
                    } as React.CSSProperties
                  }
                >
                  <div className="flex items-center justify-between">
                    <p className="font-display text-base uppercase tracking-wide">
                      {school.name}
                    </p>
                    <Badge
                      variant="outline"
                      className="border-white/30 text-cream"
                    >
                      {school.mascot}
                    </Badge>
                  </div>
                  <p className="text-xs opacity-80">
                    {school.city}, {school.state} · {school.scheme}
                  </p>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <dt className="opacity-70">Academics</dt>
                      <dd>{school.academicRating}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="opacity-70">Prestige</dt>
                      <dd>{school.athleticPrestige}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="opacity-70">Coaching</dt>
                      <dd>{school.coachingRating}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="opacity-70">Facilities</dt>
                      <dd>{school.facilitiesRating}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="opacity-70">Media market</dt>
                      <dd>{school.mediaMarket}</dd>
                    </div>
                  </dl>
                  <Badge variant={playtime.tone} className="w-fit">
                    {playtime.label}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button
          variant="stadium"
          size="lg"
          disabled={!selected}
          onClick={() => selected && onSelect(selected)}
        >
          Accept Offer
        </Button>
      </div>
    </div>
  );
}
