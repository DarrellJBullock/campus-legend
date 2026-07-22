# Campus Legend — TODO

## Phase 1-3 (engine, content, persistence) — done in an earlier pass

- [x] Next.js + TS strict + Tailwind + shadcn scaffolding
- [x] Game-domain types, seeded RNG, attributes/progression/training/academics/
      energy/injuries/depth-chart/relationships/sponsorships/events/
      game-simulation/season/draft/achievements engine modules
- [x] 84 unit tests across all engine modules
- [x] Supabase schema + RLS (`supabase/migrations/0001_init.sql`)
- [x] Local + cloud save layers with Zod validation
- [x] Content: 15 schools / 3 conferences, 24 sponsors, 46 story events,
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
- [ ] Training center page
- [ ] Academic center page
- [ ] Depth chart page
- [ ] Relationships page
- [ ] Schedule + standings page
- [ ] Game preview / game-day decisions / game recap
- [ ] Sponsorship marketplace + active deals page
- [ ] Career stats charts (Recharts)
- [ ] Awards & achievements page
- [ ] News feed page
- [ ] Settings / save management page
- [ ] Season recap page
- [ ] Offseason page
- [ ] Transfer decision page
- [ ] Draft prep + combine page
- [ ] Career ending page
- [ ] Shareable career summary page
- [ ] Component tests (athlete creation, weekly actions, resource display,
      story events, sponsorship cards, game recap, career summary)
- [ ] Playwright e2e: guest career → athlete → school → weekly actions →
      simulate game → review → save/reload
- [ ] GitHub Actions CI (lint, typecheck, test, build)
- [ ] README (features, architecture, setup, deployment, mermaid diagrams)
- [ ] Full `pnpm build` verification
- [ ] Accessibility pass (keyboard nav, focus states, aria-live announcements)
- [ ] Remove dead code / unused deps
- [ ] Final manual click-through of every required page on mobile + desktop
