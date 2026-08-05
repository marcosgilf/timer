---
id: 8
title: Testing strategy — vitest unit plus Playwright e2e
labels: [wayfinder:grilling]
parent: 0
blocked_by: [1, 2, 4]
assignee:
state: open
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
