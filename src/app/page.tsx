import type { Metadata } from "next";
import Link from "next/link";
import { CareerCta } from "@/components/marketing/career-cta";
import { HeroCard } from "@/components/marketing/hero-card";
import { renderNews } from "@/content/news";
import { GAME_NEWS, MILESTONE_NEWS } from "@/content/news";

export const metadata: Metadata = {
  title: "Campus Legend — Own the season. Build the legacy.",
};

const SEASONS = [
  {
    year: "Freshman",
    body: "Arrive on campus, fight for reps, earn your first snaps.",
  },
  {
    year: "Sophomore",
    body: "Win the starting job, build coach trust, sign your first deals.",
  },
  {
    year: "Junior",
    body: "Chase awards, manage stardom, and keep your grades eligible.",
  },
  {
    year: "Senior",
    body: "Chase a title, protect your draft stock, and write your ending.",
  },
];

const FEATURES = [
  {
    title: "Position Training",
    body: "Every rep trades energy and injury risk for growth — five positions, five distinct attribute trees.",
  },
  {
    title: "Academics & Eligibility",
    body: "Midterms, finals, and GPA aren't flavor text — fall below the line and you lose the field.",
  },
  {
    title: "Simulated Game Days",
    body: "A seeded, deterministic engine turns your week into a box score, a grade, and a headline.",
  },
  {
    title: "Story Decisions",
    body: "40+ branching events with coaches, rivals, and family — every choice has a delayed cost.",
  },
  {
    title: "Fictional NIL Deals",
    body: "24 invented sponsors gate offers behind reputation, following, GPA, and personality fit.",
  },
];

const HEADLINES = [
  renderNews(GAME_NEWS.positive[0]!, {
    name: "Jordan Vale",
    school: "Prairie Central",
    opp: "Granite Peak",
  }),
  renderNews(MILESTONE_NEWS[0]!, {
    name: "Jordan Vale",
    school: "Prairie Central",
  }),
  renderNews(GAME_NEWS.neutral[0]!, {
    name: "Jordan Vale",
    school: "Prairie Central",
    opp: "Cobalt Ridge",
  }),
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 pb-16 pt-14 text-center sm:pt-20 lg:flex-row lg:text-left">
          <div className="flex-1 space-y-6">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-stadium">
              A Player-Career Sports RPG
            </p>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Campus Legend
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0">
              Own the season. Build the legacy. Recruit as a freshman, train
              your position, fight for the depth chart, and chase the fictional
              pro draft across four college seasons.
            </p>
            <div className="flex justify-center lg:justify-start">
              <CareerCta />
            </div>
          </div>
          <div className="flex-1">
            <HeroCard />
          </div>
        </section>

        {/* Four-season progression */}
        <section className="border-y border-border bg-card/40 py-14">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="font-display text-2xl">Four Seasons. One Legacy.</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SEASONS.map((s, i) => (
                <div key={s.year} className="surface-paper rounded-lg p-5">
                  <span className="scoreboard text-sm text-turf">S{i + 1}</span>
                  <h3 className="mt-1 font-display text-lg text-charcoal">
                    {s.year}
                  </h3>
                  <p className="mt-2 text-sm text-charcoal/80">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-display text-2xl">
            Built Like a Career, Not a Dashboard
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-border bg-card p-5"
              >
                <h3 className="font-display text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Newspaper headlines */}
        <section className="border-y border-border bg-card/40 py-14">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="font-display text-2xl">
              From the Campus Sports Desk
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {HEADLINES.map((h, i) => (
                <article key={i} className="surface-paper rounded-lg p-5">
                  <p className="text-[11px] uppercase tracking-widest text-charcoal/60">
                    {h.outlet}
                  </p>
                  <h3 className="mt-1 font-display text-base leading-snug text-charcoal">
                    {h.headline}
                  </h3>
                  <p className="mt-2 text-sm text-charcoal/70">{h.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="font-display text-2xl">Ready to Write Your Legend?</h2>
          <p className="mt-2 text-muted-foreground">
            No account required — guest careers save right to this browser.
          </p>
          <div className="mt-6 flex justify-center">
            <CareerCta />
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Sign in
            </Link>{" "}
            to continue a cloud save.
          </p>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-10 text-center text-xs text-muted-foreground">
        <p className="mx-auto max-w-2xl">
          Every school, conference, athlete, sponsor, and headline in Campus
          Legend is entirely fictional. Any resemblance to real institutions,
          teams, leagues, or brands is coincidental.
        </p>
        <p className="mt-4">
          Built with Next.js, React, TypeScript, Tailwind CSS, Zustand, Zod,
          Supabase, Recharts, and Framer Motion.
        </p>
      </footer>
    </div>
  );
}
