"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCareerStore } from "@/stores/career-store";
import { listLocalCareers, type SaveSummary } from "@/lib/local-save";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { listCloudCareers } from "@/lib/cloud-save";
import { buildDemoCareer } from "@/content/demo-career";

type ContinueTarget = { source: "local" | "cloud"; save: SaveSummary };

/** Start / Continue / Demo call-to-action. Client-only: reads local + cloud saves. */
export function CareerCta() {
  const router = useRouter();
  const load = useCareerStore((s) => s.load);
  const loadById = useCareerStore((s) => s.loadById);
  const loadCloudById = useCareerStore((s) => s.loadCloudById);
  const userId = useCareerStore((s) => s.userId);
  const [localSaves, setLocalSaves] = useState<SaveSummary[]>([]);
  const [cloudSaves, setCloudSaves] = useState<SaveSummary[]>([]);

  useEffect(() => {
    setLocalSaves(listLocalCareers());
  }, []);

  useEffect(() => {
    if (!userId) {
      setCloudSaves([]);
      return;
    }
    let cancelled = false;
    listCloudCareers(createSupabaseBrowserClient(), userId).then((list) => {
      if (!cancelled) setCloudSaves(list);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const merged: ContinueTarget[] = [
    ...localSaves.map((save) => ({ source: "local" as const, save })),
    ...cloudSaves
      .filter((cs) => !localSaves.some((ls) => ls.id === cs.id))
      .map((save) => ({ source: "cloud" as const, save })),
  ].sort((a, b) => b.save.updatedAt.localeCompare(a.save.updatedAt));

  const mostRecent = merged[0];

  function startDemo() {
    load(buildDemoCareer());
    router.push("/career");
  }

  async function continueCareer(target: ContinueTarget) {
    if (target.source === "local") {
      loadById(target.save.id);
    } else {
      await loadCloudById(target.save.id);
    }
    router.push("/career");
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Button asChild variant="stadium" size="lg">
        <Link href="/new-career">Start Career</Link>
      </Button>
      {mostRecent ? (
        <Button
          variant="outline"
          size="lg"
          onClick={() => void continueCareer(mostRecent)}
        >
          Continue: {mostRecent.save.name}
        </Button>
      ) : null}
      <Button variant="secondary" size="lg" onClick={startDemo}>
        Try the Guest Demo
      </Button>
    </div>
  );
}
