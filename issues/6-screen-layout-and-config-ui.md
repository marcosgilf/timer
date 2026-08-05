---
id: 6
title: Screen layout and config UI — prototype
labels: [wayfinder:prototype]
parent: 0
blocked_by: [1]
assignee:
state: open
---

## Question

What does it look like, and how is a workout configured in under 15 seconds with sweaty hands?

Prototype and react to:
- Home: one big button per mode (crono, countdown, tabata, EMOM, AMRAP, pomodoro).
- Config screen per mode: minutes/seconds via up-down steppers **and** direct typing
  (`<input type="number" inputmode="numeric">`?), rounds, then Start.
- Running screen: giant digits legible across a room, phase colour state (green = work,
  red = rest), round `x/y`, next-phase preview, total elapsed. What else earns screen space.
- Controls while running: pause, resume, skip phase, reset, exit — hit-target size, placement
  for thumb reach, guard against accidental reset.
- Mobile-first responsive: how the layout reflows to landscape and to a tablet/desktop width
  purely by screen size (no orientation lock).
- Light and dark theme: `prefers-color-scheme` only, or a manual toggle too? How red/green keep
  contrast in both, and what colour-blind users see (shape/text, not colour alone).
- What, if anything, here cannot be done with plain Astro + CSS + native form controls —
  that is the only justification for a React island.
