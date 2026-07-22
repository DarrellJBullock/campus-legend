"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AthleteForm } from "@/components/onboarding/athlete-form";
import { SchoolPicker } from "@/components/onboarding/school-picker";
import { TradingCard } from "@/components/game/trading-card";
import { Button } from "@/components/ui/button";
import { useCareerStore } from "@/stores/career-store";
import { createCareer } from "@/game-engine/career";
import { computeOverall } from "@/game-engine/attributes";
import { getSchool } from "@/content/schools";
import type { AthleteCreationInput } from "@/lib/schemas";
import type { CareerState } from "@/game-engine/types";

type Step = "athlete" | "school" | "intro";

const STEPS: { key: Step; label: string }[] = [
  { key: "athlete", label: "Create Athlete" },
  { key: "school", label: "Choose School" },
  { key: "intro", label: "Freshman Intro" },
];

export function NewCareerWizard() {
  const router = useRouter();
  const load = useCareerStore((s) => s.load);
  const [step, setStep] = useState<Step>("athlete");
  const [athleteInput, setAthleteInput] = useState<AthleteCreationInput | null>(
    null,
  );
  const [career, setCareer] = useState<CareerState | null>(null);

  function handleAthlete(data: AthleteCreationInput) {
    setAthleteInput(data);
    setStep("school");
  }

  function handleSchool(schoolId: string) {
    if (!athleteInput) return;
    const created = createCareer({
      input: athleteInput,
      schoolId,
      id: crypto.randomUUID(),
      createdAtIso: new Date().toISOString(),
    });
    setCareer(created);
    setStep("intro");
  }

  function enterHub() {
    if (!career) return;
    load(career);
    router.push("/career");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <ol
        className="mb-8 flex items-center gap-2 text-xs"
        aria-label="Career setup progress"
      >
        {STEPS.map((s, i) => {
          const active = s.key === step;
          const done = STEPS.findIndex((x) => x.key === step) > i;
          return (
            <li key={s.key} className="flex items-center gap-2">
              <span
                className={
                  active
                    ? "rounded-full bg-stadium px-2.5 py-1 font-semibold text-navy-deep"
                    : done
                      ? "rounded-full bg-turf px-2.5 py-1 text-white"
                      : "rounded-full bg-muted px-2.5 py-1 text-muted-foreground"
                }
                aria-current={active ? "step" : undefined}
              >
                {i + 1}. {s.label}
              </span>
              {i < STEPS.length - 1 ? (
                <span className="text-muted-foreground">→</span>
              ) : null}
            </li>
          );
        })}
      </ol>

      {step === "athlete" ? (
        <AthleteForm
          onSubmit={handleAthlete}
          defaultValues={athleteInput ?? undefined}
        />
      ) : null}

      {step === "school" && athleteInput ? (
        <SchoolPicker
          position={athleteInput.position}
          onSelect={handleSchool}
        />
      ) : null}

      {step === "intro" && career ? (
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="font-display text-2xl">
            Welcome to Campus, {career.athlete.firstName}
          </h2>
          <p className="max-w-xl text-muted-foreground">
            You&apos;ve committed to {getSchool(career.schoolId)?.name}. Camp
            starts now — your freshman season begins on the{" "}
            {career.depthChart.role.toLowerCase()} depth chart. Every week
            you&apos;ll spend action points on training, academics, and
            relationships, then find out how it plays out on Saturday.
          </p>
          <TradingCard
            athlete={career.athlete}
            schoolId={career.schoolId}
            overall={computeOverall(
              career.athlete.position,
              career.athlete.attributes,
            )}
            classYear="Freshman"
          />
          <Button variant="stadium" size="lg" onClick={enterHub}>
            Enter the Career Hub
          </Button>
        </div>
      ) : null}
    </div>
  );
}
