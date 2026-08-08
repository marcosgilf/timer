---
id: 21
title: End-to-end safety net
labels: [build:slice]
blocked_by: [17, 19]
assignee:
state: open
---

## What to build

Five Playwright tests, each guarding a decision that would otherwise break silently, plus
`pnpm test:e2e` to run them. Kept deliberately short: this is a safety net, not a coverage exercise.

See [Testing strategy](8-testing-strategy.md) for what is deliberately left untested and why.

## Acceptance criteria

- [ ] Playwright installed and `pnpm test:e2e` runs the suite against a production build
- [ ] Test: a Tabata runs start → skip → done using `page.clock` fast-forward
- [ ] Test: reloading mid-Routine resumes at the correct Phase
- [ ] Test: reloading after completion opens Home
- [ ] Test: load, go offline, reload — the app still works
- [ ] Test: manifest is served and the service worker registers
- [ ] `docs/spec.md` §8 updated to record that audible output, vibration, Wake Lock and iOS
      audio-session behaviour remain manually verified only
- [ ] CI still does not run e2e ([CI workflow](12-ci-workflow.md)); revisit only if these prove stable

## Blocked by

- 17 — It remembers
- 19 — Installable and offline
