---
id: 8
title: Testing strategy — vitest unit plus Playwright e2e
labels: [wayfinder:grilling]
parent: 0
blocked_by: [1, 2, 4]
assignee: marcosenrique.gil
state: closed
---

## Question

What is tested, at which level, and what is deliberately not?

Decide:
- Unit (vitest): engine phase transitions per mode, pause/resume arithmetic, drift budget
  assertion, config validation. Fake timers vs injected clock function — a pure engine taking
  `now` as input needs neither.
- Mocking audio: is the cue layer a pure "cues due at time T" function (testable) with a thin
  WebAudio sink (untested)?
- E2E (Playwright): the short list worth the maintenance — run a tabata to completion with a
  fast clock, resume after reload, offline load with the service worker, install manifest check.
  What Playwright genuinely cannot cover (real vibration, real Wake Lock, iOS Safari).
- Where tests run: pre-push hook, CI, or both — repo has no CI yet; is that in scope?
- Coverage expectation, if any (`@vitest/coverage-v8` is in the reference repo).

## Resolution

Everything decided so far is pure, so the test strategy is small on purpose: **no fake timers, no
mocks, no jsdom.** The clock is a parameter ([ticket 2](2-clock-accuracy-and-background-behaviour.md)),
so time is just an argument.

### Unit (vitest) — the whole domain

`phaseAt(elapsed, workout)`, `boundaries(workout)`, `cuesFor(workout)`, `elapsed(clock, now)`, config
clamping, prefs parse/validate. Nothing else.

`phaseAt` assertions:
1. Boundary exactness at `workMs - 1`, `workMs`, `workMs + 1`.
2. Table-driven (`it.each`) walk of all six Modes end to end, asserting the full Phase sequence.
3. The 30-minute drift walk from ticket 2 (±50 ms Phases, ±30 ms cues).
4. Pomodoro's long break lands after round 4 and ends the Workout.

**Config clamping is extracted into the pure layer** so it is covered here rather than through the
DOM.

### Component / DOM tests: none

Playwright covers the UI. jsdom tests for a handful of steppers would be maintenance with no
bug-finding power.

### E2E (Playwright) — five, each guarding a decision

1. Tabata start → skip → done, using `page.clock` fast-forward (no app-side test hooks needed).
2. Reload mid-Workout resumes at the correct Phase.
3. Reload after completion opens Home — the discard rule from [ticket 7](7-persistence-model.md).
4. Offline: load, go offline, reload, app still works.
5. Manifest present and service worker registered.

### Deliberately untested — and said out loud in the spec

Audible output, vibration, Wake Lock acquisition, iOS audio-session behaviour, real
background/suspend timing. None is reachable from Playwright; mocking it would only assert that the
mock was called. **Manual check on a real phone before shipping** is the control.

### Where it runs

- `pre-push` → `pnpm check && pnpm test` (unit only — pushing must not take 90 seconds).
- `pnpm test:e2e` manual until CI exists; CI is [ticket 12](12-ci-workflow.md), not smuggled in here.

### Coverage

`@vitest/coverage-v8` installed and `pnpm test:coverage` reports — **but no threshold and no gate.**
The report is for looking at; the test list above is the actual bar. A percentage target invites
tests written for the number.
