---
id: 26
title: Rounds — work, rest, repeat
labels: [build:slice]
blocked_by: [25]
assignee:
state: open
---

## What to build

The countdown can now repeat: a work duration, an optional rest duration, and a number of rounds.
This is the slice that makes Tabata, EMOM and Pomodoro *possible without any of them existing* —
20s / 10s × 8 is a Tabata, 60s / 0s × 10 is an EMOM, 25min / 5min × 4 is a Pomodoro, and the app
never says any of those words.

While running, the display shows which Phase is active and which round you are in.

## Acceptance criteria

- [ ] Configuration adds rest (optional, `0` means none) and rounds, using the same stepper pattern
- [ ] Running shows the Phase (work or rest) and `round x of y`
- [ ] Phase is signalled by colour **and** text — never colour alone (WCAG 1.4.1)
- [ ] Rounds are the only nesting level; there are no sets
- [ ] Reaching the last round ends the Routine
- [ ] A Tabata (20/10 × 8), an EMOM (60/0 × 10) and a Pomodoro (25min/5min × 4) can each be built by
      configuration alone, and each is verified end to end
- [ ] The Phase sequence is derived by a pure function of elapsed time and unit-tested with a
      table-driven test over those three configurations, plus exact Phase boundaries

Out of this slice on purpose: named presets or saved Routines (storage, and a separate decision),
skip/back transport, long-break-after-N-rounds (Pomodoro's 15-minute break is a configuration the
user can run as a second Routine until someone asks otherwise).
