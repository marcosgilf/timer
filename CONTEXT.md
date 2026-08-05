# Context

Domain glossary for the workout timer. Terms only — no implementation, no spec.

## Workout

The whole configured thing the user starts: a Mode plus its settings. Configured fresh each
time; nothing is saved as a named workout in v1.

## Mode

One of six: **Crono**, **Countdown**, **Tabata**, **EMOM**, **AMRAP**, **Pomodoro**. A Mode is
default configuration over the one shared model — never its own code path. The single exception
is Crono, which is unbounded.

## Phase

One timed segment of a Workout, with a **kind**: `prepare`, `work`, `rest`, or `done`.
Colour follows kind (green = work, red = rest). Pomodoro's long break is a `rest` Phase with a
longer duration, not a kind of its own. EMOM has no `rest` Phase — the rest is whatever is left
inside the window.

## Round

One pass of a Workout's Phase pattern. Tabata's `work 20 / rest 10` repeated 8 times is 8 Rounds.
Rounds are the **only** nesting level: there are no sets.

## Prepare countdown

A get-ready `prepare` Phase before the first `work` Phase of any Mode, Crono included. A global
preference, not per-Workout configuration; `0` disables it.

## Banned terms

- **Interval** — gym slang for both a single Phase and the tabata style as a whole. Say Phase or Mode.
- **Timer** — the product, not a domain concept. Say Workout, Phase, or Clock.
