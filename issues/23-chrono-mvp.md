---
id: 23
title: Chrono — the whole app, counting up
labels: [build:slice]
blocked_by: []
assignee: marcosgilf
state: closed
---

## What to build

The MVP. Open `timer.marcosgilf.com` and there is a timer at `00:00` with a **Start** button. Press
it and time counts up; the button becomes **Pause**. Press Pause and a **Reset** button appears
beside it, so you can continue or start over. That is the entire product for this slice — no home
screen, no configuration, no navigation.

Semantic HTML styled by [Pico CSS](https://picocss.com/) classless, with custom CSS only for the
room-readable digits. WCAG 2.2 AA from the start.

## Acceptance criteria

- [x] The landing page **is** the timer — no menu, no mode list, nothing to choose
- [x] Start → counts up from `00:00`; the same button then reads Pause
- [x] Pause → time freezes and a Reset button appears; Resume continues from where it stopped
- [x] Reset → back to `00:00` and the initial Start state
- [x] Elapsed time is derived from `Date.now()` every frame, never incremented, so leaving the tab
      and returning shows the correct time
- [x] Pico CSS classless; no class attributes except where custom CSS is unavoidable, and that
      exception is only the digits
- [x] Digits fit the viewport at 320px wide with no horizontal scrolling, and stay readable across a
      room
- [x] Keyboard operable with a visible, unobscured focus indicator; controls at least 24×24px
- [x] The running time is not announced every second by screen readers; started / paused / reset are
      announced instead
- [x] Contrast ≥ 4.5:1 for text and ≥ 3:1 for controls in both light and dark schemes
- [x] The Clock and elapsed arithmetic live in `src/domain/`, are pure, and are unit-tested first

Out of this slice on purpose: everything else. No countdown, no rounds, no configuration, no sound,
no persistence, no install.

## Resolution

Shipped on `feat/23-chrono`. The landing page **is** the timer: `<time>` plus one button that reads
Start → Pause → Resume, with Reset appearing only once there is something to reset.

- **Domain** (`src/domain/`): `clock.ts` (three numbers, elapsed derived from `Date.now()`) and
  `format.ts` (`formatElapsed`, plus `announceElapsed` which renders the same time as words). 13
  tests, written first.
- **Markup**: Pico CSS classless. `<main>`, `<h1>`, `<time datetime="PT13S">`, `<button>` — the only
  classes are `controls` and `visually-hidden`, both needed for layout Pico has no opinion about.
- **Custom CSS**: the digits, and nothing else.

Accessibility decisions worth keeping:
- The digits are **not** a live region. A per-second announcement makes a screen reader unusable, so
  `role="status"` carries state changes instead: "Started", "Paused at 13 seconds", "Resumed", "Reset".
- Reset moves focus to the primary button, because it hides itself on click and focus would be lost.
- Controls are 63px tall, far above the 24×24px minimum (2.5.8); Pico provides visible focus rings
  and AA contrast in both schemes.

One sizing bug found before it shipped: past an hour the string grows from `00:00` (~2.7em) to
`10:03:07` (~4.8em) and would overflow a 320px screen at `24vw`. The element now carries `data-hours`
past the hour mark and drops to `13vw`, keeping the digits at ~54% of viewport width at any size.

### Revision after first review

- **No hours.** The display is capped at `99:59` and the timer stops there rather than rendering a
  time it cannot show. This also removes the `data-hours` sizing branch, so the string length is now
  constant and the digits can be sized much more aggressively.
- **Digits dominate**: `min(35vw, 40vh, 20rem)` — about 92% of viewport width, up from 60%. Controls
  dropped to 48px tall and 22rem wide, present but not competing.
- **Both buttons are always visible.** Reset no longer appears and disappears: the shifting layout
  moved the primary button under the user's thumb mid-Routine. Reset is a no-op at `00:00` rather
  than disabled, because disabled controls leave the tab order and invite contrast problems. The
  focus-restoration workaround is gone with the behaviour that needed it.

### Theme: gym clock

Dark is the only theme, not a `prefers-color-scheme` branch — a wall clock is a wall clock. Panel
`#0b0b0c` (a hair off pure black, so OLED does not smear as digits change), digits `#ff2b2b` with a
soft glow. Contrast is 5.3:1, above AA for normal text and far above the 3:1 needed at this size; the
glow is decoration and the digits read the same with it stripped.

Pico's accent variables are pointed at the same red, so buttons and focus rings belong to the clock.
Note that the **classless** Pico build ships no `.secondary`, so `class="secondary"` was silently
doing nothing and both buttons looked identical — Reset is now outlined via our own rule, which is
also one fewer class attribute.

Digit sizing is arithmetic, not taste: `00:00` measures ~2.73em in tabular figures and `main`
reserves 0.5rem of padding per side, so the viewport factor must stay under ~34vw. At 35vw the digits
were clipped by 2px at 320px wide; 32vw leaves room for a font stack that measures slightly wider.
