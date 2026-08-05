---
id: 1
title: Interval sequence model — one engine for six modes
labels: [wayfinder:grilling]
parent: 0
blocked_by: []
assignee:
state: open
---

## Question

Can crono, countdown, tabata, EMOM, AMRAP and pomodoro all be expressed as one
sequence of typed intervals, and what exactly is that data model?

Decide:
- The interval primitive: phase kind (prepare / work / rest / recover / long-break),
  duration, direction (count up vs down), repeat/round structure, terminal condition
  (time-bound vs open-ended for crono and AMRAP).
- Per-mode config fields and their defaults (tabata 20/10×8, EMOM 60s×N, pomodoro 25/5/15×4,
  AMRAP cap, countdown target, crono nothing).
- Validation limits (min/max seconds, max rounds) and what happens on invalid input.
- Whether a "prepare" countdown precedes every mode and whether it is configurable.
- What the engine exposes as state (current phase, remaining ms, round x of y, total elapsed)
  and which of those the UI needs.
- Whether modes are one engine + config, or the model forces per-mode branches (and if so, where).

Out of bounds here: rendering, storage format, sound. Those have their own tickets.
