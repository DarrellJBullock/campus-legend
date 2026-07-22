"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCareerStore } from "@/stores/career-store";
import { listLocalCareers, type SaveSummary } from "@/lib/local-save";
import { buildDemoCareer } from "@/content/demo-career";

/** Start / Continue / Demo call-to-action. Client-only: reads localStorage saves. */
export function CareerCta() {
  const router = useRouter();
  const load = useCareerStore((s) => s.load);
  const loadById = useCareerStore((s) => s.loadById);
  const [saves, setSaves] = useState<SaveSummary[] | null>(null);

  useEffect(() => {
    setSaves(listLocalCareers());
  }, []);

  const mostRecent = saves?.[0];

  function startDemo() {
    load(buildDemoCareer());
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
          onClick={() => {
            loadById(mostRecent.id);
            router.push("/career");
          }}
        >
          Continue: {mostRecent.name}
        </Button>
      ) : null}
      <Button variant="secondary" size="lg" onClick={startDemo}>
        Try the Guest Demo
      </Button>
    </div>
  );
}
