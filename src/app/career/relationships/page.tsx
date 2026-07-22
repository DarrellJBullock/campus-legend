"use client";

import { useCareerStore } from "@/stores/career-store";
import { relationshipTier } from "@/game-engine/relationships";
import { StatBar } from "@/components/game/stat-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function tierVariant(
  level: number,
): "success" | "stadium" | "outline" | "destructive" {
  if (level >= 70) return "success";
  if (level >= 50) return "stadium";
  if (level >= 30) return "outline";
  return "destructive";
}

export default function RelationshipsPage() {
  const career = useCareerStore((s) => s.career);
  if (!career) return null;

  const relationships = [...career.relationships].sort(
    (a, b) => b.level - a.level,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Relationships</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The people around you shape your career — coaches, teammates,
            family, and media. Building trust unlocks favorable outcomes in
            story events; letting a relationship sour can close doors.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relationships.map((r) => (
          <Card key={r.key}>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{r.name}</CardTitle>
                <Badge variant={tierVariant(r.level)}>
                  {relationshipTier(r.level)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{r.role}</p>
            </CardHeader>
            <CardContent>
              <StatBar value={r.level} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
