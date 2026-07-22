"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TradingCard } from "@/components/game/trading-card";
import type { Athlete } from "@/game-engine/types";

const HERO_ATHLETE: Athlete = {
  firstName: "Jordan",
  lastName: "Vale",
  jerseyNumber: 7,
  hometown: "Cedar Falls, IA",
  heightInches: 74,
  weightLbs: 210,
  position: "QB",
  playStyle: "Dual Threat",
  personality: "Natural Leader",
  academicStrength: "Communications",
  avatar: { skinTone: 2, jerseyStyle: 1, accent: 0 },
  attributes: {
    throwPower: 78,
    shortAccuracy: 82,
    deepAccuracy: 74,
    pocketPresence: 71,
    decisionMaking: 76,
  },
};

/** Animated hero trading card for the landing page (respects reduced motion). */
export function HeroCard() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16, rotate: -3 }}
      animate={{ opacity: 1, y: 0, rotate: -2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={reduce ? undefined : { rotate: 0, scale: 1.02 }}
      className="mx-auto w-64 sm:w-72"
    >
      <TradingCard
        athlete={HERO_ATHLETE}
        schoolId="prairie-central"
        overall={81}
        classYear="Junior"
      />
    </motion.div>
  );
}
