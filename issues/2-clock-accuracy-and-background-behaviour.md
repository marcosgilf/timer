---
id: 2
title: Clock accuracy and background behaviour
labels: [wayfinder:grilling]
parent: 0
blocked_by: []
assignee: marcosgilf
state: closed
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

## Resolution

Accuracy comes from **deriving state from a timestamp**, never from counting ticks. Combined with
`phaseAt` ([Interval sequence model](1-interval-sequence-model.md)), no code path accumulates error.

### Time source

`Date.now()` — single source of elapsed time. It survives device sleep exactly; `performance.now()`
does not advance while suspended on some platforms, and sleeping mid-workout is normal on a gym
floor. The trade-off accepted: an NTP or manual clock step mid-Workout corrupts elapsed — rare, and
recoverable by pausing. (Whether `performance.now()` genuinely stalls on iOS is a footnote for
[PWA research](4-pwa-offline-install-wakelock-research.md); it cannot change this answer.)

### The only formula

```ts
type Clock = { startedAt: number; pausedTotalMs: number; pausedAt: number | null };

const elapsed = (c: Clock, now: number) => (c.pausedAt ?? now) - c.startedAt - c.pausedTotalMs;
```

Resume adds `now - pausedAt` to `pausedTotalMs` and clears `pausedAt`. **Skip and back shift
`startedAt`** rather than introducing an offset field, so there is exactly one number to store and
one to resume from. Back is clamped so elapsed can never go below 0.

### Display

`requestAnimationFrame`, recomputing from `Date.now()` every frame — never incrementing a counter.
rAF pausing while hidden is correct: there is nothing to render. Whole seconds in every Mode
(tenths are unreadable across a room — in the fog if missed). Countdown uses `ceil(remainingMs/1000)`
so the last beep lands as the display leaves `1` and `0` never flashes; count-up uses `floor`.

### Waking up behind

On `visibilitychange` → visible, recompute from the clock and **jump** to the correct Phase. Missed
cues are dropped, not replayed — stale beeps are noise. If the Workout completed while away, land on
the done screen (its end cue may fire). Wake Lock should make this rare.

### Cue timing under throttling

A hidden tab throttles `setTimeout` to roughly once a minute, so cues must not be driven by timers.
A **lookahead scheduler** (~1 s horizon) books upcoming cues on `AudioContext.currentTime`, which is
immune to throttling. Display clock (`Date.now()`) and cue clock (`AudioContext.currentTime`) are
two views of one timeline, correlated once at start. *Which* cues exist is
[Audio and haptic cue model](3-audio-and-haptic-cue-model.md); this is only the mechanism.

### Budget and proof

Phase boundaries ±50 ms wall clock, cues ±30 ms. Display drift is bounded by frame rate (~16 ms)
because nothing accumulates. Proven by unit tests on `phaseAt` at exact boundary values plus one
that walks a simulated 30-minute timeline and asserts the Phase sequence — **no fake timers**, since
the clock is a parameter, not an ambient dependency.
