---
id: 6
title: Screen layout and config UI — prototype
labels: [wayfinder:prototype]
parent: 0
blocked_by: [1]
assignee: marcosenrique.gil
state: closed
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

## Resolution

Answered by prototype on branch **`prototype/timer-ui`** (`src/pages/prototype.astro`, run with
`pnpm prototype`) — three running-screen variants on one route, driven by the real `phaseAt` and
`Clock` decisions from tickets 1 and 2, with a ×10 speed switch. Kept as the primary source; **not
merged to main**.

### Verdict: variant 3 ("bar")

Progress bar + round pips, big digits on a neutral background. Rejected: **v1** (full-bleed colour
flood — loud but loses the round count, and its first cut was a CSS bug: `background: var(--phase)`
in the same rule that redefined `--phase`); **v2** (ring — collided with the digits on some
viewports and cost ~half the digit size, which is the one thing that matters at 4 m). Colour stays
as the phase signal on the bar, pips, and digits; green work / red rest, light and dark via
`prefers-color-scheme`.

### Screen structure — same shell everywhere

Every screen except Home starts with the **same top nav**: `←` left, centred title, `✕` right.
Content starts at the top of the page, never vertically centred.

- **Home** — one full-width Mode button per row, text centred; 3-column grid at ≥900px. No nav.
- **Config** — nav `←` to Home; per-field block:
  ```
  Work
  [+]  05 : 30  [+]
  [−]  min  sec  [−]
  ```
  Minutes ±1, seconds ±5, both also typeable; digits are timer-sized (3rem/800, `--fg`), boxes
  match the stepper-column height. **Start alone at the bottom as sticky CTA.**
- **Running** — nav `←` back to Config (hidden for Crono, which has none), `✕` to Home. Digits fill
  the screen; bar + pips + `next: rest`. Controls are one small centred row (~2.75rem):
  `⏮ | ⏸/▶ | ⏭`, icons throughout. Deliberately small — big buttons stole attention from the digits.
- **Done** — same nav, total time (+ rounds), Restart as lone CTA. Never auto-navigates.

### Mode-dependent controls

- **Crono** starts on tap — no config screen at all.
- Unbounded Workouts show `↺` reset instead of `⏮`, and `⏭` **finishes** to the Done screen, so
  every Mode ends the same way.
- During `prepare`, `⏭` skips the countdown in every Mode (never finishes).
- Single-Phase Workouts hide the controls they cannot use.

### No React

The whole prototype is one `.astro` file: plain DOM, CSS custom properties, `rAF`, native
`<input inputmode="numeric">`. Nothing here justifies an island, matching the research finding on
ticket 4.
