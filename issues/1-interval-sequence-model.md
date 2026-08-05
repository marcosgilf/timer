---
id: 1
title: Interval sequence model — one engine for six modes
labels: [wayfinder:grilling]
parent: 0
blocked_by: []
assignee: marcosenrique.gil
state: closed
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

## Resolution

**Yes — one model, six presets.** A Mode is default configuration plus a label; only Crono is
structurally different (unbounded). Vocabulary landed in `CONTEXT.md` (Workout / Mode / Phase /
Round; "interval" and "timer" banned as domain nouns).

### The model

```ts
type PhaseKind = "prepare" | "work" | "rest" | "done";

type Workout = {
  mode: "crono" | "countdown" | "tabata" | "emom" | "amrap" | "pomodoro";
  workMs: number;
  restMs: number; // 0 = no rest Phase in the pattern (EMOM, countdown, AMRAP, crono)
  rounds: number; // 1 for single-Phase Modes
  finalRestMs?: number; // pomodoro long break, appended after the last round
  unbounded?: boolean; // crono only
};
```

One Round = `work` then, if `restMs > 0`, `rest`. Rounds are the only nesting level — **no sets**.
A `prepare` Phase precedes round 1 in every Mode (global preference, default 10s, `0` disables).
Pomodoro's long break is a `rest` Phase with a longer duration, appended after round 4, which then
ends the Workout. EMOM is `work` = the window (configurable, so E2MOM/E90 come free) with no `rest`
Phase — the app does not know the split inside the window. AMRAP is a countdown under a different
name; no round tapping in v1.

### Defaults per Mode

| Mode | Defaults |
|---|---|
| Crono | unbounded, counts up |
| Countdown | 5:00 |
| Tabata | work 0:20 / rest 0:10 × 8 |
| EMOM | window 1:00 × 10 |
| AMRAP | 12:00 |
| Pomodoro | focus 25:00 / break 5:00 × 4, long break 15:00 |

### Validation

Clamp silently, never block Start, never show error text: phase duration `0:01`–`99:59`,
rounds `1`–99, seconds roll into minutes (`0:75` → `1:15`).

### Representation — the load-bearing decision

**Derive, don't expand.** No array of Phases and no per-tick mutation:

```ts
phaseAt(elapsedMs: number, workout: Workout): PhaseState
```

A pure function of elapsed time. Nothing to keep in sync, so drift-correction is free (ticket 2),
resume-after-reload is one stored `startedAt` (ticket 7), and skip is arithmetic on one number.
This is the single module worth testing hard.

`PhaseState` exposes: `phaseKind`, `remainingInPhaseMs` (`elapsedInPhaseMs` when unbounded),
`phaseProgress` (0–1, for a ring), `round`, `totalRounds`, `nextPhaseKind`, `totalElapsedMs`,
`status` (`idle` | `running` | `paused` | `done`). Whole-Workout remaining is deliberately absent —
meaningless for crono, and no design ticket has asked for it.

### Transport controls

- **Skip** — set elapsed to the next Phase boundary. One continuous timeline, `phaseAt` stays pure.
- **Back** — music-player rule: more than 2s into a Phase restarts it, otherwise previous Phase.
- **Done** — stop on a done screen with total time and rounds completed, end cue fires once,
  Restart and Back offered. Never auto-navigate; the user is on the floor, not holding the phone.
