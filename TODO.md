# Campus Legend — TODO

## Phase 1-3 (engine, content, persistence) — done in an earlier pass

- [x] Next.js + TS strict + Tailwind + shadcn scaffolding
- [x] Game-domain types, seeded RNG, attributes/progression/training/academics/
      energy/injuries/depth-chart/relationships/sponsorships/events/
      game-simulation/season/draft/achievements engine modules
- [x] 84 unit tests across all engine modules
- [x] Supabase schema + RLS (`supabase/migrations/0001_init.sql`)
- [x] Local + cloud save layers with Zod validation
- [x] Content: 12 schools / 3 conferences, 24 sponsors, 46 story events,
      courses, news templates, demo career

## This pass (UI build-out)

- [x] Repo init, baseline typecheck/lint/test green
- [x] Fix globals.css circular-dependency build error
- [x] Landing page
- [x] Sign-in / sign-up pages
- [x] Athlete creation + school selection + freshman intro wizard
- [x] Career hub
- [x] Weekly planner
- [x] Wire academics exam engine into `advanceWeek`
- [x] `transferSchool` store action
- [x] Training center page
- [x] Academic center page
- [x] Depth chart page
- [x] Relationships page
- [x] Schedule + standings page
- [x] Game preview / game-day decisions / game recap
- [x] Sponsorship marketplace + active deals page
- [x] Career stats charts (Recharts)
- [x] Awards & achievements page
- [x] News feed page
- [x] Settings / save management page
- [x] Season recap page
- [x] Offseason page
- [x] Transfer decision page
- [x] Draft prep + combine page
- [x] Career ending page
- [x] Shareable career summary page
- [x] GitHub Actions CI (lint, typecheck, test, build) — pre-existing, verified
- [x] README (features, architecture, setup, deployment, mermaid diagrams)
- [x] Full `pnpm build` verification — all 24 routes prerender successfully
- [x] Component tests (athlete creation, weekly actions, resource display,
      story events, sponsorship cards, game recap, career summary) — 17 new
      tests, 101/101 total passing
- [x] Playwright e2e: guest career → athlete → school → weekly actions →
      simulate game → review → save/reload — passes on chromium + mobile
- [x] Remove dead code / unused deps — dropped unused `@radix-ui/react-toast`
      and `@radix-ui/react-tooltip`; fixed a duplicate-course bug for
      "Undecided" majors and a settings-page hydration error found during
      manual click-through
- [x] Security: bumped Next.js 15.1.6 → 15.5.21 (patches two critical CVEs:
      RCE via React Flight protocol, middleware auth bypass)
- [x] Final manual click-through of every required page on mobile + desktop —
      landing, onboarding, hub, planner, training, academics, depth chart,
      relationships, schedule, game-day wizard, sponsorships, stats, awards,
      news, settings, offseason, transfer, draft (empty state), ending
      (empty state), summary (mid-career state) all verified live in-browser
- [ ] Accessibility pass beyond what shipped by default (keyboard nav, focus
      states, and aria-live announcements already exist from earlier work;
      no dedicated screen-reader pass has been done)
