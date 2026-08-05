---
id: 2
title: Clock accuracy and background behaviour
labels: [wayfinder:grilling]
parent: 0
blocked_by: []
assignee:
state: open
---

## Question

How does the timer stay accurate — accuracy is a stated must — given browsers throttle
timers in background tabs and pause them on sleep?

Decide:
- Timekeeping source: monotonic `performance.now()` deltas vs `Date.now()` wall clock vs
  AudioContext `currentTime`; which drives display and which drives cue scheduling.
- The rule: never accumulate ticks — derive state from `(now - startedAt) - pausedTotal`.
  Confirm and pin the pause/resume arithmetic.
- Display refresh: `requestAnimationFrame` vs interval, and what precision is shown
  (whole seconds, tenths on crono?).
- Behaviour on tab hidden / screen off / phone sleep: does the timer keep running, do cues
  still fire, does it self-correct on `visibilitychange` resume?
- Whether cues must be scheduled ahead on the audio clock (WebAudio lookahead) to survive
  throttling — depends on how far Audio & haptic cue model goes.
- Acceptable drift budget over a 30-minute session, and how it gets asserted in a test.
