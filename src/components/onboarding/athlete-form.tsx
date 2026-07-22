"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  POSITIONS,
  POSITION_NAMES,
  PLAY_STYLES,
  PERSONALITY_TRAITS,
  ACADEMIC_STRENGTHS,
  DIFFICULTIES,
} from "@/game-engine/types";
import {
  athleteCreationSchema,
  type AthleteCreationInput,
} from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SKIN_TONES = ["#f2d3b3", "#e0b088", "#c68642", "#8d5524", "#5c3a1e"];
const ACCENTS = ["#facc15", "#38bdf8", "#f87171", "#a78bfa", "#34d399"];
const JERSEY_STYLES = ["Classic", "Bold", "Retro", "Modern"];

const DIFFICULTY_HINTS: Record<(typeof DIFFICULTIES)[number], string> = {
  Recruit: "Generous growth, forgiving setbacks. Best for a relaxed first run.",
  Starter: "The standard Campus Legend experience.",
  "All-American": "Slower growth, sharper consequences.",
  Legend: "Unforgiving. Every choice matters.",
};

export function AthleteForm({
  onSubmit,
  defaultValues,
}: {
  onSubmit: (data: AthleteCreationInput) => void;
  defaultValues?: Partial<AthleteCreationInput>;
}) {
  const form = useForm<AthleteCreationInput>({
    resolver: zodResolver(athleteCreationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      jerseyNumber: 1,
      hometown: "",
      heightInches: 72,
      weightLbs: 200,
      position: "QB",
      playStyle: PLAY_STYLES.QB[0],
      personality: "Coachable",
      academicStrength: "Undecided",
      difficulty: "Starter",
      seed: "",
      avatar: { skinTone: 0, jerseyStyle: 0, accent: 0 },
      ...defaultValues,
    },
  });

  const position = form.watch("position");
  const avatar = form.watch("avatar");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
      noValidate
      aria-label="Athlete creation"
    >
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="col-span-full font-display text-lg">Identity</legend>
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            {...register("firstName")}
            aria-invalid={!!errors.firstName}
          />
          {errors.firstName ? (
            <p className="text-xs text-destructive">
              {errors.firstName.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            {...register("lastName")}
            aria-invalid={!!errors.lastName}
          />
          {errors.lastName ? (
            <p className="text-xs text-destructive">
              {errors.lastName.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jerseyNumber">Jersey number</Label>
          <Input
            id="jerseyNumber"
            type="number"
            min={0}
            max={99}
            {...register("jerseyNumber")}
          />
          {errors.jerseyNumber ? (
            <p className="text-xs text-destructive">
              {errors.jerseyNumber.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hometown">Hometown</Label>
          <Input
            id="hometown"
            placeholder="Cedar Falls, IA"
            {...register("hometown")}
          />
          {errors.hometown ? (
            <p className="text-xs text-destructive">
              {errors.hometown.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="heightInches">Height (inches)</Label>
          <Input
            id="heightInches"
            type="number"
            min={60}
            max={84}
            {...register("heightInches")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weightLbs">Weight (lbs)</Label>
          <Input
            id="weightLbs"
            type="number"
            min={150}
            max={400}
            {...register("weightLbs")}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="col-span-full font-display text-lg">
          On the Field
        </legend>
        <div className="space-y-1.5">
          <Label htmlFor="position">Position</Label>
          <Select
            value={position}
            onValueChange={(v) => {
              setValue("position", v as AthleteCreationInput["position"]);
              setValue(
                "playStyle",
                PLAY_STYLES[v as keyof typeof PLAY_STYLES][0]!,
              );
            }}
          >
            <SelectTrigger id="position">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POSITIONS.map((p) => (
                <SelectItem key={p} value={p}>
                  {POSITION_NAMES[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="playStyle">Play style</Label>
          <Select
            value={form.watch("playStyle")}
            onValueChange={(v) => setValue("playStyle", v)}
          >
            <SelectTrigger id="playStyle">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLAY_STYLES[position].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="personality">Personality</Label>
          <Select
            value={form.watch("personality")}
            onValueChange={(v) =>
              setValue("personality", v as AthleteCreationInput["personality"])
            }
          >
            <SelectTrigger id="personality">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERSONALITY_TRAITS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="academicStrength">Academic strength</Label>
          <Select
            value={form.watch("academicStrength")}
            onValueChange={(v) =>
              setValue(
                "academicStrength",
                v as AthleteCreationInput["academicStrength"],
              )
            }
          >
            <SelectTrigger id="academicStrength">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACADEMIC_STRENGTHS.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-display text-lg">Avatar</legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Skin tone</p>
            <div className="flex gap-2">
              {SKIN_TONES.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Skin tone ${i + 1}`}
                  aria-pressed={avatar.skinTone === i}
                  onClick={() => setValue("avatar.skinTone", i)}
                  className={cn(
                    "focus-ring h-8 w-8 rounded-full border-2",
                    avatar.skinTone === i
                      ? "border-stadium"
                      : "border-transparent",
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Accent color</p>
            <div className="flex gap-2">
              {ACCENTS.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Accent ${i + 1}`}
                  aria-pressed={avatar.accent === i}
                  onClick={() => setValue("avatar.accent", i)}
                  className={cn(
                    "focus-ring h-8 w-8 rounded-full border-2",
                    avatar.accent === i
                      ? "border-stadium"
                      : "border-transparent",
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Jersey style</p>
            <div className="flex flex-wrap gap-2">
              {JERSEY_STYLES.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={avatar.jerseyStyle === i}
                  onClick={() => setValue("avatar.jerseyStyle", i)}
                  className={cn(
                    "focus-ring rounded-md border px-2 py-1 text-xs",
                    avatar.jerseyStyle === i
                      ? "border-stadium bg-stadium/10 text-stadium"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="font-display text-lg">Difficulty & Seed</legend>
        <div className="space-y-1.5">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            value={form.watch("difficulty")}
            onValueChange={(v) =>
              setValue("difficulty", v as AthleteCreationInput["difficulty"])
            }
          >
            <SelectTrigger id="difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {DIFFICULTY_HINTS[form.watch("difficulty")]}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seed">Game seed (optional)</Label>
          <Input
            id="seed"
            placeholder="Leave blank for random"
            {...register("seed")}
          />
          <p className="text-xs text-muted-foreground">
            Same seed + same choices reproduce the same career — useful for
            sharing runs.
          </p>
        </div>
      </fieldset>

      <div className="flex justify-end">
        <Button type="submit" variant="stadium" size="lg">
          Continue to school selection
        </Button>
      </div>
    </form>
  );
}
