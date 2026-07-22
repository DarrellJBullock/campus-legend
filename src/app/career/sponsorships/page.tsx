"use client";

import { useCareerStore } from "@/stores/career-store";
import { rankOffers, isEligibleForSponsor } from "@/game-engine/sponsorships";
import { SPONSORS, getSponsor, SPONSOR_TIER_LABELS } from "@/content/sponsors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

export default function SponsorshipsPage() {
  const career = useCareerStore((s) => s.career);
  const signSponsor = useCareerStore((s) => s.signSponsor);

  if (!career) return null;

  const activeIds = new Set(career.activeSponsorships.map((a) => a.sponsorId));
  const offers = rankOffers(SPONSORS, career.resources, career.athlete).filter(
    (o) => !activeIds.has(o.sponsor.id),
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>NIL Marketplace</CardTitle>
        </CardHeader>
        <CardContent>
          {offers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You&apos;ve signed every available deal. Check back after your
              reputation grows for new offers.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map(({ sponsor, eligible, weekly }) => {
                const { reasons } = isEligibleForSponsor(
                  sponsor,
                  career.resources,
                  career.athlete,
                );
                return (
                  <Card key={sponsor.id} className="flex flex-col">
                    <CardHeader className="space-y-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {sponsor.company}
                        </CardTitle>
                        <Badge variant={eligible ? "success" : "outline"}>
                          {eligible ? "Eligible" : "Not eligible"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="stadium">
                          {SPONSOR_TIER_LABELS[sponsor.tier]}
                        </Badge>
                        <Badge variant="outline">{sponsor.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-3 text-sm">
                      <div className="flex items-baseline justify-between">
                        <span className="text-muted-foreground">
                          Est. weekly pay
                        </span>
                        <span className="scoreboard text-turf">
                          {formatMoney(weekly)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>Duration: {sponsor.durationWeeks}wk</span>
                        <span>Obligation: {sponsor.weeklyObligation}</span>
                        <span>Reputation: {sponsor.reqReputation}+</span>
                        <span>
                          Followers: {sponsor.reqFollowing.toLocaleString()}+
                        </span>
                        <span>GPA: {sponsor.reqGpa.toFixed(1)}+</span>
                      </div>
                      {reasons.length > 0 ? (
                        <ul className="space-y-0.5 text-xs text-destructive">
                          {reasons.map((r) => (
                            <li key={r}>{r}</li>
                          ))}
                        </ul>
                      ) : null}
                      <div className="mt-auto pt-2">
                        <Button
                          size="sm"
                          variant="stadium"
                          className="w-full"
                          disabled={!eligible}
                          onClick={() => signSponsor(sponsor.id)}
                        >
                          Sign Deal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Deals</CardTitle>
        </CardHeader>
        <CardContent>
          {career.activeSponsorships.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active sponsorships yet. Sign a deal from the marketplace
              above.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {career.activeSponsorships.map((active) => {
                const sponsor = getSponsor(active.sponsorId);
                return (
                  <Card key={active.sponsorId}>
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-base">
                        {sponsor?.company ?? active.sponsorId}
                      </CardTitle>
                      {sponsor ? (
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="stadium">
                            {SPONSOR_TIER_LABELS[sponsor.tier]}
                          </Badge>
                          <Badge variant="outline">{sponsor.category}</Badge>
                        </div>
                      ) : null}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Weeks remaining
                        </span>
                        <span>{active.weeksRemaining}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total earned
                        </span>
                        <span className="text-turf">
                          {formatMoney(active.totalEarned)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Obligations met / missed
                        </span>
                        <span>
                          {active.obligationsMet} / {active.obligationsMissed}
                        </span>
                      </div>
                      {sponsor ? (
                        <p className="pt-1 text-xs text-muted-foreground">
                          Obligation: {sponsor.weeklyObligation}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
