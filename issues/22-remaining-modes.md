---
id: 22
title: The remaining Modes — Crono, EMOM, AMRAP, Pomodoro
labels: [build:slice]
blocked_by: [15]
assignee:
state: open
---

## What to build

The last four Modes appear on Home and work. By design they are **configuration over the existing
model**, not new mechanics: EMOM and AMRAP are single-Phase Routines with different defaults, Pomodoro
is Tabata's pattern with a long break appended, and Crono is the one genuinely different case —
unbounded, counting up, started straight from Home with no Config screen.

## Acceptance criteria

- [ ] Home lists all six Modes, all working
- [ ] Defaults: EMOM window 1:00 × 10 · AMRAP 12:00 · Pomodoro 25:00/5:00 × 4 with a 15:00 long break ·
      Crono unbounded
- [ ] Crono starts on tap with no Config screen, counts up, and shows `↺` reset with `⏭` finishing to
      Done with the total
- [ ] Pomodoro's long break runs after the fourth round and ends the Routine
- [ ] EMOM's window is configurable, so E2MOM and E90 need no new code
- [ ] Transport controls are hidden where they cannot act (single-Phase Modes have nothing to skip back
      to)
- [ ] `phaseAt` gains a table-driven (`it.each`) test walking all six Modes end to end, plus the
      simulated 30-minute drift walk from [ticket 2](2-clock-accuracy-and-background-behaviour.md)
- [ ] No Mode has its own code path — adding one is adding a preset

## Blocked by

- 15 — Tabata: rounds and rest
