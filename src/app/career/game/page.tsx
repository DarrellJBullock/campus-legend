"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCareerStore } from "@/stores/career-store";
import { GamePreview } from "@/components/game/game-preview";
import { GameDayDecisions } from "@/components/game/game-day-decisions";
import { GameRecap } from "@/components/game/game-recap";
import { absoluteWeek } from "@/game-engine/events";
import type { GameDayDecision, GameResult } from "@/game-engine/types";

type Step = "preview" | "decisions" | "recap";

/**
 * Game-day wizard: preview the matchup, make pre-game decisions, then
 * simulate and review the recap. A thin container over the three step
 * components — state (decisions, result) lives here so it's stable across
 * re-renders and shared between steps.
 */
export default function GameDayPage() {
  const router = useRouter();
  const career = useCareerStore((s) => s.career);
  const gameDayDecisions = useCareerStore((s) => s.gameDayDecisions);
  const playGame = useCareerStore((s) => s.playGame);
  const advanceWeek = useCareerStore((s) => s.advanceWeek);

  const [step, setStep] = useState<Step>("preview");
  const [decisions, setDecisions] = useState<GameDayDecision[]>([]);
  const [result, setResult] = useState<GameResult | null>(null);

  if (!career) return null;

  const game = career.season.schedule.find(
    (g) => g.week === career.weekOfSeason && !g.played,
  );
  const sidelined = Boolean(
    career.activeInjury &&
    absoluteWeek(career.season.season, career.weekOfSeason) <
      career.activeInjury.returnWeekAbsolute,
  );

  function handleKickoff() {
    if (sidelined) {
      // Sidelined: the store simulates the team's result without the
      // player — no game-day decisions to make.
      const played = playGame([]);
      if (played) {
        setResult(played);
        setStep("recap");
      }
      return;
    }
    setDecisions(gameDayDecisions());
    setStep("decisions");
  }

  function handleSimulate(decisionOptionIds: string[]) {
    const played = playGame(decisionOptionIds);
    if (played) {
      setResult(played);
      setStep("recap");
    }
  }

  function handleContinue() {
    advanceWeek();
    router.push("/career/planner");
  }

  if (step === "recap" && result) {
    return (
      <GameRecap
        result={result}
        position={career.athlete.position}
        onContinue={handleContinue}
      />
    );
  }

  if (step === "decisions") {
    return <GameDayDecisions decisions={decisions} onSubmit={handleSimulate} />;
  }

  return (
    <GamePreview
      game={game}
      onKickoff={handleKickoff}
      activeInjury={sidelined ? career.activeInjury : null}
    />
  );
}
