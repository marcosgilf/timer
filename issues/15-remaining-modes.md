---
id: 15
title: The other five Modes
labels: [build:slice]
blocked_by: [14]
assignee:
state: open
---

## What to build

Every Mode on the Home screen works: Crono starts on tap with no config, Tabata runs work/rest across
rounds with round pips, EMOM repeats a configurable window, AMRAP is a capped countdown, Pomodoro runs
focus/break × 4 and finishes on the long break.

One model, six presets — a Mode is default configuration plus a label, not a code path. See
[Interval sequence model](1-interval-sequence-model.md).

## Acceptance criteria

- [ ] Defaults: Countdown 5:00 · Tabata 20s/10s × 8 · EMOM 1:00 × 10 · AMRAP 12:00 ·
      Pomodoro 25:00/5:00 × 4 with a 15:00 long break · Crono unbounded
- [ ] Config shows only the fields a Mode has; Crono has no Config screen at all
- [ ] Running screen shows `round x/y` and round pips for multi-round Modes
- [ ] Phase colour follows kind (green work, red rest) with the phase word as the non-colour signal
- [ ] Transport per Mode: `⏮` for multi-Phase, `↺` reset for unbounded, `⏭` finishes an unbounded
      Routine, controls hidden where they cannot act
- [ ] Rounds clamp to 1–99, durations to 0:01–99:59
- [ ] `phaseAt` has a table-driven (`it.each`) test walking all six Modes end to end, plus the
      pomodoro long-break case and a simulated 30-minute drift walk

## Blocked by

- 14 — Countdown, end to end
