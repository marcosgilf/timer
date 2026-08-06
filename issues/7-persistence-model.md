---
id: 7
title: Persistence model in localStorage
labels: [wayfinder:grilling]
parent: 0
blocked_by: [1, 2]
assignee: marcosenrique.gil
state: open
---

## Question

What is stored, in what shape, and what happens on reload mid-workout?

Decide:
- Keys and payload shape: last-used config per mode, cue/theme settings, in-flight session
  (started-at, paused-total, current phase) — and a schema version field.
- Resume behaviour: reload during a running workout — resume from wall-clock elapsed, resume
  paused, or discard? Staleness cut-off (resume a session from 3 hours ago? no).
- Write cadence: on every phase change vs on visibilitychange vs throttled — cheapest thing
  that survives a crash.
- Read/parse failure and unknown-version handling: reset to defaults, never throw.
- Whether this model makes named presets trivial later (fog item), without building them now.
