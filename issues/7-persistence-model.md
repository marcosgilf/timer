---
id: 7
title: Persistence model in localStorage
labels: [wayfinder:grilling]
parent: 0
blocked_by: [1, 2]
assignee: marcosgilf
state: closed
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

## Resolution

### Two keys, different lifetimes

```ts
"timer:prefs:v1"   // written rarely, must survive
"timer:session:v1" // written often, disposable
```

Split because a crash mid-write on the session must not be able to eat preferences.

```ts
type Prefs = {
  v: 1;
  muted: boolean;
  volume: number; // 0-1
  ticks: boolean; // countdown-tick cue
  vibrate: boolean;
  prepareMs: number;
  lastUsed: Partial<Record<Mode, Workout>>; // reopening Tabata shows YOUR 30/15×10
};

type Session = { v: 1; workout: Workout; clock: Clock };
```

`lastUsed` is what makes "no presets in v1" bearable, and costs one nested object. Theme is
`prefers-color-scheme` only — nothing to store. The session stores the **resolved** Workout, not the
Mode name, so changing defaults later cannot rewrite a running Workout.

### Resume

Resume **running**, from real elapsed — `startedAt` is an absolute `Date.now()` value, so it survives
reload for free (exactly why [ticket 2](2-clock-accuracy-and-background-behaviour.md) chose wall
clock). Chosen over resume-paused for simplicity. Stale cues are dropped on the way, per ticket 2.

The one consequence handled: if replaying elapsed lands on `done`, the session is **discarded and the
app opens Home** — no zombie Done screen from yesterday. That is the whole staleness policy: no
cut-off constant, no timeout to tune, just the `kind === "done"` check that already exists.

### Write cadence

On Clock mutation only — start, pause, resume, skip — plus `pagehide`/`visibilitychange` for the crash
case. Phase boundaries do **not** write: they do not mutate the Clock. A handful of writes per
Workout. Key cleared on Done and on Quit.

### Failure is never visible

Every read wrapped in try/catch with minimal shape validation; on any failure (corrupt JSON, unknown
`v`, wrong types) **delete the key and continue with defaults**. Every write goes through a
`safeWrite` that swallows `QuotaExceededError` — Safari private browsing throws on write. The app is
fully functional with zero persistence: everything stored is convenience, none of it is data worth
mourning. A timer that will not start because storage is odd is worse than one that forgot your
settings.

### Presets later

`lastUsed` is already `Record<Mode, Workout>`. Named presets become
`Record<string, Workout & { name }>` — same shape, different key. No migration needed if they ever
graduate from the fog.
