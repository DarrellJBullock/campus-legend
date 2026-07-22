"use client";

import Link from "next/link";
import { useCareerStore } from "@/stores/career-store";
import { computeOverall } from "@/game-engine/attributes";
import { getSchool } from "@/content/schools";
import { getSponsor } from "@/content/sponsors";
import { ResourceMeters } from "@/components/game/resource-meters";
import { StatBar } from "@/components/game/stat-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

const QUICK_LINKS = [
  {
    href: "/career/planner",
    label: "Weekly Planner",
    hint: "Spend your action points",
  },
  {
    href: "/career/training",
    label: "Training",
    hint: "Position drills & conditioning",
  },
  {
    href: "/career/academics",
    label: "Academics",
    hint: "Courses, GPA, eligibility",
  },
  {
    href: "/career/depth-chart",
    label: "Depth Chart",
    hint: "Your role & competitors",
  },
  {
    href: "/career/relationships",
    label: "Relationships",
    hint: "Coaches, rivals, family",
  },
  {
    href: "/career/sponsorships",
    label: "NIL Deals",
    hint: "Offers & active sponsorships",
  },
  {
    href: "/career/schedule",
    label: "Schedule",
    hint: "Season slate & standings",
  },
  { href: "/career/stats", label: "Stats", hint: "Career progression charts" },
];

function objectivesFor(
  role: string,
  eligibility: string,
  coachTrust: number,
): string[] {
  const objectives: string[] = [];
  if (eligibility !== "Eligible")
    objectives.push("Get your GPA back above the eligibility floor.");
  if (["Redshirt", "Reserve", "Rotational"].includes(role))
    objectives.push("Win reps and climb the depth chart.");
  if (coachTrust < 40)
    objectives.push("Rebuild trust with the coaching staff.");
  if (objectives.length === 0)
    objectives.push("Keep stacking good weeks — the season is watching.");
  return objectives;
}

export default function CareerHubPage() {
  const career = useCareerStore((s) => s.career);
  if (!career) return null;

  const overall = computeOverall(
    career.athlete.position,
    career.athlete.attributes,
  );
  const school = getSchool(career.schoolId);
  const upcoming = career.season.schedule.find(
    (g) => g.week === career.weekOfSeason && !g.played,
  );
  const objectives = objectivesFor(
    career.depthChart.role,
    career.resources.eligibility,
    career.resources.coachTrust,
  );
  const recentNews = [...career.news].slice(-3).reverse();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Season {career.season.season} · Week {career.weekOfSeason}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge variant="stadium">{overall} OVR</Badge>
              <Badge variant="outline">
                {career.depthChart.role} · Rank #{career.depthChart.rank}
              </Badge>
              <Badge variant="outline">
                {career.season.wins}-{career.season.losses}
              </Badge>
              <Badge
                variant={
                  career.resources.eligibility === "Eligible"
                    ? "success"
                    : "destructive"
                }
              >
                {career.resources.eligibility} ·{" "}
                {career.resources.gpa.toFixed(2)} GPA
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {upcoming
                ? `Upcoming: ${upcoming.home ? "vs." : "at"} ${upcoming.opponent.name}${upcoming.opponent.isRival ? " (Rivalry)" : ""}`
                : "No game scheduled this week — focus on development."}
            </p>
            <ul className="space-y-1 text-sm">
              {objectives.map((o) => (
                <li key={o} className="flex gap-2">
                  <span aria-hidden className="text-stadium">
                    •
                  </span>
                  {o}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild variant="stadium">
                <Link href="/career/planner">Go to Weekly Planner</Link>
              </Button>
              {upcoming ? (
                <Button asChild variant="secondary">
                  <Link href="/career/game">Game Preview</Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vitals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ResourceMeters resources={career.resources} />
            <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
              <div>
                <p className="text-muted-foreground">Draft Stock</p>
                <StatBar value={career.resources.draftStock} />
              </div>
              <div>
                <p className="text-muted-foreground">Money</p>
                <p className="scoreboard text-lg text-turf">
                  {formatMoney(career.resources.money)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Deals</CardTitle>
          </CardHeader>
          <CardContent>
            {career.activeSponsorships.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active sponsorships yet.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {career.activeSponsorships.map((a) => {
                  const sponsor = getSponsor(a.sponsorId);
                  return (
                    <li key={a.sponsorId} className="flex justify-between">
                      <span>{sponsor?.company ?? a.sponsorId}</span>
                      <span className="text-muted-foreground">
                        {a.weeksRemaining}wk left
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent News</CardTitle>
          </CardHeader>
          <CardContent>
            {recentNews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No headlines yet — play your first game.
              </p>
            ) : (
              <ul className="space-y-3 text-sm">
                {recentNews.map((n) => (
                  <li key={n.id}>
                    <p className="font-medium">{n.headline}</p>
                    <p className="text-xs text-muted-foreground">
                      Week {n.week}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>{school?.name}</p>
            <p>
              {school?.city}, {school?.state} · {school?.mascot}
            </p>
            <p>Coach trust: {Math.round(career.resources.coachTrust)}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg">Quick Links</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="focus-ring rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted"
            >
              <p className="font-medium">{l.label}</p>
              <p className="text-xs text-muted-foreground">{l.hint}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
