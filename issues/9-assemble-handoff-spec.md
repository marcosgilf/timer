---
id: 9
title: Assemble the handoff spec
labels: [wayfinder:task]
parent: 0
blocked_by: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11]
assignee: marcosgilf
state: closed
---

## Question

Fold every resolved ticket into one spec document that an implementer can build from
without rereading the map.

Produce `docs/spec.md` covering: domain model, engine + clock rules, cue model, UI screens
and states, persistence, PWA/offline/install, toolchain, testing, and explicit non-goals.
Every section cites the ticket that decided it. Reaching this ticket's close = destination.

## Resolution

`docs/spec.md` written — ten sections, every one citing the ticket that decided it by name and
relative link, nothing invented. Contents: domain model (`Workout`/`Mode`/`Phase`/`Round`,
defaults table, silent clamping), the pure engine (`phaseAt`, the one `elapsed` formula,
`Date.now()` only, rAF display, ±50ms/±30ms budget, transport rules), the cue model (catalogue
table, synthesised tones, one-Phase lookahead with a single `reschedule`, audio unlock, vibration),
UI (variant 3 bar layout, the shared nav shell across Home/Config/Running/Done/Settings, Crono's
missing Config screen, no React), persistence (two keys, resume-running, `done` discard, silent
failure), PWA (the four-row progressive-enhancement layer table, `@vite-pwa/astro` gotchas,
`registerType: 'prompt'`, iOS Wake Lock 18.4, audio session `"transient"`), toolchain, testing
(unit list + five e2e + the untested list), and non-goals.

The prototype (`prototype/timer-ui`) and research (`research/pwa-platform`) branches are cited as
assets with the command to read them; **neither is merged**.

Seven genuine gaps were **not** guessed — they are listed under `## Open questions` in the spec:
CI ([ticket 12](12-ci-workflow.md), still open), starting values for `Prefs` other than
`prepareMs`, where the service-worker update prompt lives in the screen shell, iOS install-guidance
copy, app name/icons/`theme_color` (the manifest cannot be written without them), `src/` module
layout, and the `boundaries(workout)` signature that
[ticket 8](8-testing-strategy.md) names but [ticket 1](1-interval-sequence-model.md) never
specified. None blocks starting the build; each blocks one small part of it.

Destination reached: the map's remaining open ticket ([CI workflow](12-ci-workflow.md)) is
explicitly not a blocker for the spec.
