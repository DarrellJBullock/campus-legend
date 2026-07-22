"use client";

import { useMemo, useState } from "react";
import { useCareerStore } from "@/stores/career-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NewsArticle } from "@/game-engine/types";

const PAGE_SIZE = 8;

const TONE_BADGE: Record<
  NewsArticle["tone"],
  "success" | "destructive" | "outline"
> = {
  positive: "success",
  negative: "destructive",
  neutral: "outline",
};

export default function NewsPage() {
  const career = useCareerStore((s) => s.career);
  const [page, setPage] = useState(0);

  const sorted = useMemo(
    () => (career ? [...career.news].reverse() : []),
    [career],
  );

  if (!career) return null;

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages - 1);
  const pageItems = sorted.slice(
    clampedPage * PAGE_SIZE,
    clampedPage * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campus Legend Wire</CardTitle>
        </CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No headlines yet — play your first game to make the news.
            </p>
          ) : (
            <div className="space-y-4">
              {pageItems.map((article) => (
                <div
                  key={article.id}
                  className="surface-paper rounded-md border border-border/60 p-4"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <Badge variant={TONE_BADGE[article.tone]}>
                      {article.tone}
                    </Badge>
                    <span className="text-xs text-charcoal/60">
                      Season {article.season} · Week {article.week}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold">
                    {article.headline}
                  </h3>
                  <p className="mt-1 text-sm text-charcoal/80">
                    {article.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {sorted.length > PAGE_SIZE ? (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={clampedPage <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {clampedPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={clampedPage >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
