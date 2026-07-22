"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCareerStore } from "@/stores/career-store";
import { computeOverall } from "@/game-engine/attributes";
import { getActiveCareerId } from "@/lib/local-save";
import { formatMoney, cn } from "@/lib/utils";
import { Nameplate } from "@/components/game/nameplate";
import { Badge } from "@/components/ui/badge";

const NAV: { href: string; label: string }[] = [
  { href: "/career", label: "Hub" },
  { href: "/career/planner", label: "Week" },
  { href: "/career/training", label: "Training" },
  { href: "/career/academics", label: "Academics" },
  { href: "/career/depth-chart", label: "Depth Chart" },
  { href: "/career/schedule", label: "Schedule" },
  { href: "/career/sponsorships", label: "NIL Deals" },
  { href: "/career/relationships", label: "Relationships" },
  { href: "/career/stats", label: "Stats" },
  { href: "/career/awards", label: "Awards" },
  { href: "/career/news", label: "News" },
  { href: "/career/settings", label: "Settings" },
];

/** Shared in-career shell: loads the active save, renders nav + header. */
export function CareerShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const career = useCareerStore((s) => s.career);
  const loadById = useCareerStore((s) => s.loadById);

  useEffect(() => {
    if (career) return;
    const id = getActiveCareerId();
    if (!id || !loadById(id)) router.replace("/");
  }, [career, loadById, router]);

  if (!career) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading your career…
      </div>
    );
  }

  const overall = computeOverall(
    career.athlete.position,
    career.athlete.attributes,
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 p-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Nameplate
          athlete={career.athlete}
          schoolId={career.schoolId}
          overall={overall}
          className="flex-1"
        />
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="stadium">
            S{career.season.season} · Wk {career.weekOfSeason}
          </Badge>
          <Badge variant="outline">
            {career.season.wins}-{career.season.losses}
          </Badge>
          <Badge variant="success">{formatMoney(career.resources.money)}</Badge>
          <Badge
            variant={
              career.resources.eligibility === "Eligible"
                ? "outline"
                : "destructive"
            }
          >
            {career.resources.eligibility}
          </Badge>
          <Badge variant="outline">{career.actionPoints} AP</Badge>
        </div>
      </header>

      <nav aria-label="Career navigation" className="overflow-x-auto">
        <ul className="flex gap-1 whitespace-nowrap">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "focus-ring block rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
