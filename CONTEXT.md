# Context

Domain glossary for the timer. Terms only — no implementation, no spec.

This is a **general-purpose timer**: it times tasks, workouts, pomodoros or anything else on a clock.
It is not a task manager and not a pomodoro app — those are two of the things you can point it at.

## Routine

The whole configured thing the user starts: how long to count, in which direction, and whether it
repeats. Configured fresh each time; nothing is saved as a named Routine yet. Named **Routine** and
not "Session", which already means the in-flight run state in storage, nor "Workout", which wrongly
narrowed the app to fitness.

## Modes are not a concept

There are **no named modes in the product**. Tabata, EMOM, Pomodoro and AMRAP are *configurations a
user builds*, not features the app ships — 20s work / 10s rest × 8 rounds is a Tabata whether or not
anything is labelled "Tabata". Six named presets would be six things to build, name, test and
maintain, in place of three capabilities:

1. **Count up** — unbounded, nothing to configure. The Chrono.
2. **Count down** — from a configured duration.
3. **Repeat** — work, optional rest, a number of Rounds.

Every "mode" anyone asks for is a point in that space. Presets may return later as *saved* Routines,
which is storage, not a code path.

## Chrono

A Routine that counts up with no end and no configuration. The simplest thing the product does, and
the first thing it shipped.

## Phase

One timed segment of a Routine, with a **kind**: `prepare`, `work`, `rest`, or `done`. Colour follows
kind (green = work, red = rest), always alongside a text label — colour is never the only signal.

## Round

One pass of a Routine's Phase pattern: `work`, then `rest` if one is configured. Rounds are the
**only** nesting level — there are no sets.

## Prepare countdown

A get-ready `prepare` Phase before the first `work` Phase. A preference, not per-Routine
configuration; `0` disables it.

## Clock

The three numbers a running Routine is made of: `startedAt`, `pausedTotalMs`, `pausedAt`. **Elapsed**
is derived from them and the current time — never counted up. Moving through a Routine moves
`startedAt`; nothing else moves.

## Cue

A moment that makes itself heard or felt: `{ at, kind }`. Cues are **data** produced by a pure
function from a Routine; a **sink** (tone, vibration, later speech) renders them.

## Banned terms

- **Mode** — retired with the named presets. Say Routine, or name the capability: count up, count
  down, repeat.
- **Interval** — gym slang for both a single Phase and the tabata style as a whole. Say Phase.
- **Timer** — the product, not a domain concept. Say Routine, Phase, or Clock.
