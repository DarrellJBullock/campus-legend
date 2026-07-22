# Campus Legend — Project Status

_Last updated: 2026-07-22_

## Where things stand

The game engine, content, persistence, and Supabase/RLS layers were built in an
earlier pass and are solid: 14 engine modules, 84 passing unit tests, 12
fictional schools across 3 conferences, 24 sponsors, 46 story events, and a
Zustand store (`src/stores/career-store.ts`) that wires it all together.

What was missing when this pass started: **zero UI routes**. `src/app/` had
only `layout.tsx` + `globals.css` — no landing page, no onboarding, no career
hub, nothing playable. This pass is building the full page tree on top of the
existing engine/store.

## Completed this pass

- Repo initialized (`git init -b main`), dependencies installed, baseline
  typecheck/lint/test all green (fixed several pre-existing type errors:
  non-tuple `as const` arrays breaking `z.enum`, an untyped Supabase cookie
  callback, a stray `discipline` key in a `ResourceDelta`, a few unused
  imports/params).
- Fixed a `globals.css` build error (`@apply font-display` inside `@layer
base` created a circular dependency with the Tailwind `fontFamily.display`
  utility of the same name).
- Landing page (`src/app/page.tsx`) — hero, four-season preview, feature
  highlights, sample newspaper headlines, Start/Continue/Demo CTAs, footer
  disclaimer.
- Auth pages (`/sign-in`, `/sign-up`) — Supabase email/password, with a clear
  guest-mode fallback when Supabase env vars aren't configured.
- New-career wizard (`/new-career`) — athlete creation (react-hook-form +
  the existing Zod schema), school selection (12+ recruiting cards across 3
  conferences), freshman-intro recap — verified end-to-end in-browser.
- Career hub (`/career`) and weekly planner (`/career/planner`) — verified
  in-browser: confirming a training action live-updates attributes/overall
  and action points.
- Wired the previously-unused academics exam engine into `advanceWeek()`
  (midterms week 6, finals week 12) so GPA/eligibility actually respond to
  study readiness — this was built (`academics.ts`) but never invoked before.
- Added a `transferSchool` store action (was referenced by the required-pages
  list but didn't exist).
- Dispatched 4 parallel sub-agents for the remaining route batches:
  training/academics/depth-chart/relationships, schedule + game-day flow,
  sponsorships/stats/awards/news/settings, and season-recap through
  career-ending/summary. Each was briefed with exact store APIs, existing
  component conventions, and a hard boundary (no edits to `career-store.ts`
  or `game-engine/*`) to avoid merge conflicts between them.

## In progress / not yet verified

- The 4 sub-agent route batches above — pending their completion + my
  integration pass (typecheck/lint/build, then manual browser click-through
  of every route, then a commit).

## Not started yet

- Component tests (RTL) and Playwright e2e critical-path tests.
- GitHub Actions CI workflow.
- README.
- Final accessibility/perf/dead-code pass.
- `pnpm build` production build has not been run yet this pass.

## Known gaps / deliberate simplifications

- Database schema is a single `careers` table with the full `CareerState` as
  a validated `jsonb` blob (plus a few denormalized columns for listing),
  not the fully normalized 30-table schema the original spec sketched. This
  was already the design going in; it's a reasonable, defensible tradeoff for
  an MVP save system and RLS is correctly scoped per-user.
- Sponsor `personalityFit` is advisory (shows a mismatch note) rather than a
  hard eligibility gate — kept deals plentiful rather than over-restrictive.
- One exam cycle per season (midterm/final), not a separate Fall/Spring term
  split.
- Game-day decisions are offered from a small fixed pool (2 of 4 shown per
  game) rather than per-position content — acceptable for MVP scope.
