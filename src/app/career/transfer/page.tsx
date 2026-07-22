"use client";

import { useRouter } from "next/navigation";
import { useCareerStore } from "@/stores/career-store";
import { getSchool } from "@/content/schools";
import { SchoolPicker } from "@/components/onboarding/school-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TransferDecisionPage() {
  const career = useCareerStore((s) => s.career);
  const transferSchool = useCareerStore((s) => s.transferSchool);
  const router = useRouter();

  if (!career) return null;

  const currentSchool = getSchool(career.schoolId);

  function handleTransfer(schoolId: string) {
    transferSchool(schoolId);
    router.push("/career");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transfer Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Transferring gets you a fresh shot at a new depth chart, but you
            start over: coach trust, campus reputation, and confidence all take
            a small hit as you prove yourself again. Staying at{" "}
            {currentSchool?.name ?? "your current school"} keeps everything
            you&apos;ve built intact.
          </p>
          <Button variant="outline" onClick={() => router.push("/career")}>
            Stay at {currentSchool?.name ?? "your current school"}
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-lg">Explore Transfer Offers</h2>
        <SchoolPicker
          position={career.athlete.position}
          onSelect={handleTransfer}
        />
      </div>
    </div>
  );
}
