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
  husky/lint-staged wired (commit `938e0e9`); `check:types` is `astro check` since tsc can't read `.astro`.
  oxlint **does** lint `.astro` (frontmatter + `<script>`); oxfmt does not format them. React, Playwright
  and coverage deliberately not installed yet.
- [Interval sequence model — one engine for six modes](1-interval-sequence-model.md) — one model, six
  presets; Modes are config + label, only Crono is unbounded. State is **derived**, not stepped:
  pure `phaseAt(elapsedMs, workout)`. Rounds are the only nesting level. Vocabulary in `CONTEXT.md`.

## Not yet specified

- Voice cues (spoken counts / "3-2-1-go") — agreed as a *later* addition; shape unknown until
  the audio cue model exists (see Audio & haptic cue model).
- CI (GitHub Actions): no workflow exists; hooks are the only gate. Ticket it if CI is wanted —
  Testing strategy touches the question.
- Preset / saved-workout storage — v1 configures fresh each time, but the config model may make
  presets nearly free; revisit after Persistence model.
- **Sets** — a second nesting level above Round (3 sets of tabata with 60s between). Ruled out of v1
  as model complexity; revisit only if it is actually missed in the gym.
- **AMRAP round tapping** — tapping to count rounds is only worth it with history to write them to,
  and history is out of scope. Revisit if history ever comes in.
- Copy, iconography, app name, favicon/manifest icon set.
- Deploy target beyond local (if ever).

## Out of scope

- Accounts, multi-device sync, any server component — single local user by decision.
- Online-only behaviour beyond service-worker update on reconnect — app is local-only.
- Workout history, stats, charts.
- i18n.
