---
id: 25
title: Count down, with the display as the configuration
labels: [build:slice]
blocked_by: [24]
assignee:
state: open
---

## What to build

The timer can now count **down**. Choosing a duration happens on the timer display itself: the same
big digits, with `+` and `−` controls under the minutes and under the seconds. Press Start and those
digits count down to zero, where the Routine ends.

Free-text entry is deliberately dropped — one input mechanism, not two. Steppers keep the display
valid by construction: always two digits, seconds carrying into minutes.

## Acceptance criteria

- [ ] The user chooses between counting up and counting down; the choice is obvious without a manual
      and is expressed in semantic HTML (a radio group or equivalent, not a bespoke widget)
- [ ] Configuration reuses the timer display — same digits, with `+`/`−` for minutes and for seconds
- [ ] No free-text input anywhere
- [ ] Steppers keep the value two-digit and carrying: `05:00` − 1 min → `04:00`; `03:55` + 5s →
      `04:00`; values clamp silently between `00:01` and `99:59`
- [ ] Start / Pause / Reset behave exactly as in the Chrono
- [ ] Reaching zero ends the Routine and shows what was configured, never the measured elapsed time
- [ ] The steppers are a labelled group, keyboard operable, targets ≥ 24×24px, and each announces
      what it changes
- [ ] `phaseAt`-style logic stays pure, in `src/domain/`, tested at the exact zero boundary

Out of this slice on purpose: rounds, rest, prepare countdown, sound, saved durations.
