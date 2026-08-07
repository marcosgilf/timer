# Context

Domain glossary for the timer. Terms only — no implementation, no spec.

This is a **general-purpose timer**: it times tasks, workouts, pomodoros or anything else on a clock.
It is not a task manager and not a pomodoro app — those are two of the things you can point it at.

## Routine

The whole configured thing the user starts: a Mode plus its settings. Configured fresh each
time; nothing is saved as a named Routine in v1. Named **Routine** and not "Session", which already
means the in-flight run state in storage (`timer:session:v1`), nor "Workout", which wrongly narrowed
the app to fitness.

## Mode

One of six: **Crono**, **Countdown**, **Tabata**, **EMOM**, **AMRAP**, **Pomodoro**. A Mode is
default configuration over the one shared model — never its own code path. The single exception
is Crono, which is unbounded.

## Phase

One timed segment of a Routine, with a **kind**: `prepare`, `work`, `rest`, or `done`.
Colour follows kind (green = work, red = rest). Pomodoro's long break is a `rest` Phase with a
longer duration, not a kind of its own. EMOM has no `rest` Phase — the rest is whatever is left
inside the window.

## Round

One pass of a Routine's Phase pattern. Tabata's `work 20 / rest 10` repeated 8 times is 8 Rounds.
Rounds are the **only** nesting level: there are no sets.

## Prepare countdown

A get-ready `prepare` Phase before the first `work` Phase of any Mode, Crono included. A global
preference, not per-Routine configuration; `0` disables it.

## Clock

The three numbers a running Routine is made of: `startedAt`, `pausedTotalMs`, `pausedAt`. **Elapsed**
is derived from them and the current time — never counted up. Skipping forward or back moves
`startedAt`; nothing else moves.

## Cue

A moment that makes itself heard or felt: `{ at, kind }`. Kinds are `countdown-tick`,
`phase-start`, `final-round`, `routine-end`. Cues are **data** produced by a pure function from a
Routine; a **sink** (tone, vibration, later speech) renders them. Pitch carries meaning — high = work,
low = rest.

## Banned terms

- **Interval** — gym slang for both a single Phase and the tabata style as a whole. Say Phase or Mode.
- **Timer** — the product, not a domain concept. Say Routine, Phase, or Clock.
