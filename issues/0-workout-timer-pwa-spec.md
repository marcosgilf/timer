---
id: 0
title: Workout timer PWA — spec
labels: [wayfinder:map]
state: open
---

## Destination

A handoff-ready spec for an offline-first, installable, mobile-first PWA workout timer
(crono, countdown, tabata, EMOM, AMRAP, pomodoro) with configurable sound + haptics,
readable across a room while training. Spec only — no build in this map.

## Notes

- Domain: web app / fitness interval timing. Single user (the author), no accounts, no sync.
- Stack fixed: Astro + TypeScript, static output, React islands **only where mandatory** —
  prefer plain Astro + native browser features (`<dialog>`, form controls, CSS, View Transitions).
- Tooling fixed: pnpm, vitest (unit), Playwright (e2e), oxlint + oxfmt, husky + lint-staged.
  Reference config: `../../IKEA/b2b-wrk-esi/` (`.oxlintrc.json`, `.oxfmtrc.json`, `.lintstagedrc.js`, `.husky/`).
- Hosting: local only for now. No backend, no analytics.
- Persistence: `localStorage`, minimal.
- Every session: `/grilling` + `/domain-modeling`; `/prototype` for prototype tickets; `/research` subagent for research tickets.
- Plan, don't do: tickets produce decisions, not features.

## Decisions so far

- Destination, scope, and stack pinned in the charting grilling (this map's Notes + Out of scope).
- [Toolchain baseline ported from b2b-wrk-esi](5-toolchain-baseline.md) — pnpm + vitest + oxlint/oxfmt +
  husky/lint-staged wired (commit `938e0e9`); `check:types` is `astro check` since tsc can't read `.astro`,
  oxlint can't either — so logic lives in `src/**/*.ts`, `.astro` stays markup-only. React, Playwright and
  coverage deliberately not installed yet.

## Not yet specified

- Voice cues (spoken counts / "3-2-1-go") — agreed as a *later* addition; shape unknown until
  the audio cue model exists (see Audio & haptic cue model).
- CI (GitHub Actions): no workflow exists; hooks are the only gate. Ticket it if CI is wanted —
  Testing strategy touches the question.
- Preset / saved-workout storage — v1 configures fresh each time, but the config model may make
  presets nearly free; revisit after Persistence model.
- Copy, iconography, app name, favicon/manifest icon set.
- Deploy target beyond local (if ever).

## Out of scope

- Accounts, multi-device sync, any server component — single local user by decision.
- Online-only behaviour beyond service-worker update on reconnect — app is local-only.
- Workout history, stats, charts.
- i18n.
