# Campus Legend — Project Status

_Last updated: 2026-07-22_

## Where things stand: MVP complete

Every acceptance-criterion flow works end-to-end, verified both by an
automated test suite and by manually clicking through the running app in a
browser: guest career creation → athlete creation → school selection →
freshman intro → career hub → weekly planner (training/academics/recovery/
social/branding actions with previews) → story events → sponsorship
marketplace → simulated game (preview → game-day decisions → recap) →
season/week advancement → save persistence across a page reload.

- `pnpm typecheck`, `pnpm lint`, `pnpm test` (101/101), `pnpm test:e2e`
  (2/2, chromium + mobile), and `pnpm build` (all 24 routes prerender) are
  all green as of this update.
- 12 fictional schools / 3 conferences, 24 sponsors, 46 story events across
  17 categories, 5 playable positions — all verified via
  `npx tsx scripts/seed.ts`.
- Deployed to production (`campus-legend.vercel.app`, GitHub-connected —
  every push to `main` auto-deploys) with a real Supabase project wired up.
  Cloud saves are fully live: sign-up/sign-in, the `profiles`/`careers`
  schema + RLS, and the actual save/load sync were all verified against the
  running production site (not just locally). The sync logic was a
  follow-up fix — the initial deployment had auth and the database wired
  but no code path ever called `upsertCloudCareer`/`loadCloudCareer`, so
  cloud saves _looked_ configured but games were still only saved to
  `localStorage`. `career-store.ts` now tracks the Supabase session and
  syncs every save in the background when signed in, with an automatic
  guest→account handoff on first sign-in.

## How this pass was carried out

The engine, content, persistence, and Supabase/RLS layers already existed
from earlier work (14 engine modules, 84 engine unit tests, a Zustand
store wiring it together). What was missing at the start of this pass:
**zero UI routes** — `src/app/` had only `layout.tsx` + `globals.css`, no
git repo, no README/TODO/PROJECT_STATUS.

Work was sequenced as:

1. **Foundation**: git init, install deps, fix pre-existing type errors
   (non-tuple `as const` arrays breaking `z.enum`, an untyped Supabase
   cookie callback, a stray resource key, unused imports/params) and a
   `globals.css` build error (`@apply font-display` self-referencing its
   own utility inside `@layer base` — circular dependency).
2. **Critical-path pages built directly** (to lock in conventions before
   parallelizing): landing page, auth pages, the athlete-creation → school
   → intro onboarding wizard, the career hub, and the weekly planner. Each
   was verified in-browser immediately after building it.
3. **Two engine gaps closed** before delegating further UI work: the
   academics exam engine (`academics.ts`) existed but was never invoked —
   wired midterms (week 6) and finals (week 12) into `advanceWeek()` so
   GPA/eligibility actually respond to study readiness. Added a
   `transferSchool` store action (referenced by the required-pages list
   but didn't exist).
4. **Remaining 18 routes built via 4 parallel sub-agents**, each scoped to
   a disjoint set of files and explicitly forbidden from touching
   `career-store.ts`, `game-engine/*`, or `content/*` to avoid merge
   conflicts: (a) training/academics/depth-chart/relationships, (b)
   schedule + the full game-day wizard, (c) sponsorships/stats/awards/
   news/settings, (d) season-recap through career-ending/summary.
5. **Integration pass**: typecheck/lint/test/build after merging all four
   batches — all green immediately.
6. **Manual browser click-through of every new route**, which caught two
   real bugs the automated checks didn't: a `<Badge>` (renders `<div>`)
   nested inside a `<p>` in the settings page (invalid HTML → hydration
   error), and a duplicate-course bug in `career.ts`'s `initialAcademics`
   for athletes with academic strength "Undecided" (the major-course pool
   and the general-ed pool were identical, so the same course could be
   added twice, producing a duplicate React key and a repeated row on the
   Academic Center page). Both fixed and verified.
7. **Dependency/security audit**: removed two genuinely-unused Radix
   packages (`@radix-ui/react-toast`, `@radix-ui/react-tooltip` — the
   toast system here is custom, built on Zustand, not Radix; recharts'
   `Tooltip` was mistaken for Radix's on first grep and confirmed
   otherwise). `pnpm audit` surfaced two **critical** Next.js CVEs on the
   pinned 15.1.6 (RCE via the React Flight protocol; a middleware
   authorization bypass) — bumped to 15.5.21, which patches both;
   re-verified typecheck/lint/test/build and a fresh in-browser smoke test
   after the upgrade.
8. **Test coverage** (component tests + Playwright e2e) delegated to a
   dedicated tester sub-agent once the UI was stable: 17 new component
   tests (athlete creation validation, weekly-action confirm/AP-decrement,
   resource meters/aria attributes, story-event dialog, sponsorship
   sign/eligibility, game recap, career summary mid-career vs. resolved),
   plus one sequential Playwright spec covering the full guest-career
   happy path including a page reload to confirm save persistence. No
   bugs found during test-writing; all new tests pass without weakening
   assertions to dodge real behavior.
9. **Docs**: this file, `TODO.md`, and `README.md` (features, architecture
   with a mermaid diagram, engine module table, data model, tech-choice
   table, setup/deploy instructions, accessibility/security/performance
   sections, known limitations, roadmap).

## Known gaps / deliberate simplifications

- Database schema is a single `careers` table with the full `CareerState`
  as a validated `jsonb` blob (plus a few denormalized columns for
  listing), not a fully normalized 30-table schema. This was the existing
  design going in; RLS is correctly scoped per-user and it's a reasonable
  MVP tradeoff.
- Sponsor `personalityFit` is advisory (shows a mismatch note, doesn't
  block signing) rather than a hard eligibility gate — keeps deals
  plentiful rather than overly restrictive.
- One exam cycle per season (midterm/final), not a separate Fall/Spring
  term split.
- Game-day decisions draw from a small fixed pool (2 of 4 offered per
  game) rather than per-position content.
- The transfer-decision screen's school picker includes the player's
  current school as a selectable (inert) option rather than excluding it
  — cosmetic, not a functional bug (selecting it is a no-op in the store).
- No dedicated screen-reader/assistive-tech audit pass was done beyond
  what shipped by default (focus rings, skip link, aria-live toasts,
  `role="meter"` on stat bars, reduced-motion support).
- Remaining `pnpm audit` findings are all in the Vitest/Vite dev toolchain
  (never shipped to users) — worth tracking, not urgent.

## Verification commands (all currently green)

```bash
pnpm typecheck   # clean
pnpm lint        # clean
pnpm test        # 101/101 passing (21 files)
pnpm test:e2e    # 2/2 passing (chromium + mobile)
pnpm build       # all 24 routes prerender successfully
```
