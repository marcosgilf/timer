---
id: 15
title: Tabata — rounds and rest
labels: [build:superseded]
blocked_by: [14]
assignee:
state: closed
---

## What to build

Tabata appears on Home and runs: 20s work, 10s rest, eight rounds, with the screen showing which round
you are in and what is coming next. Skipping and going back move between Phases.

This is the slice that teaches the domain about **rounds and a repeating Phase pattern** — the reason
it is separate from the four Modes that follow, which are only configuration on top of it.

## Acceptance criteria

- [ ] Home lists Countdown and Tabata; still no buttons for Modes that do not work
- [ ] Config adds Rest and Rounds fields, clamped to 0:01–99:59 and 1–99
- [ ] Running screen shows `round x/y`, round pips, and the `next:` hint
- [ ] Phase colour follows kind (green work, red rest); the phase word is the non-colour signal
- [ ] `⏭` jumps to the next Phase boundary; `⏮` restarts the current Phase if more than 2s in,
      otherwise goes to the previous one; both work by shifting `startedAt`, nothing else
- [ ] `⏭` during the prepare countdown skips it
- [ ] `boundaries(routine)` exists with a signature recorded in `docs/spec.md`, and its Open question
      is struck out
- [ ] Tests: a full Tabata walked end to end asserting the Phase sequence, plus skip/back arithmetic

## Blocked by

- 14 — Countdown, end to end


## Superseded

Retired by the MVP-first re-plan (see `docs/spec.md` §0). This ticket assumed named Modes on a Home
screen; the product now offers capabilities — count up, count down, repeat — and the user's own
configuration is what makes a Tabata or a Pomodoro. Work is re-cut into tickets 23–26.

Kept unclosed-in-spirit, not deleted: its acceptance criteria are still the best description of the
behaviour, and the tickets that replace it borrow from them.
