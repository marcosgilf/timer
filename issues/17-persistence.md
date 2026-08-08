---
id: 17
title: It remembers
labels: [build:slice]
blocked_by: [15]
assignee:
state: open
---

## What to build

The app stops forgetting. Reopening a Mode shows the configuration you used last time instead of the
default. Reloading mid-Routine puts you back exactly where you were, because elapsed time is derived
from a wall-clock timestamp. Reloading after a Routine finished opens Home rather than a stale Done
screen.

Two `localStorage` keys with different lifetimes, per [Persistence model](7-persistence-model.md).

## Acceptance criteria

- [ ] `timer:prefs:v1` stores last-used configuration per Mode; `timer:session:v1` stores
      `{ routine, clock }`
- [ ] Writes happen on Clock mutation (start, pause, resume, skip) and on `pagehide`, not per frame
      and not on Phase boundaries
- [ ] Reload during a running Routine resumes running at the correct Phase
- [ ] A session that replays to `done` is discarded and the app opens Home
- [ ] The session key is cleared on Done and on Quit
- [ ] Corrupt JSON, an unknown `v`, or wrong types delete the key and fall back to defaults without
      throwing or showing an error
- [ ] Writes survive `QuotaExceededError` (Safari private browsing); the app is fully usable with
      persistence disabled
- [ ] Parse/validate logic is unit-tested with hostile inputs

## Blocked by

- 15 — The other five Modes
