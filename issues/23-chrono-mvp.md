---
id: 23
title: Chrono — the whole app, counting up
labels: [build:slice]
blocked_by: []
assignee:
state: open
---

## What to build

The MVP. Open `timer.marcosgilf.com` and there is a timer at `00:00` with a **Start** button. Press
it and time counts up; the button becomes **Pause**. Press Pause and a **Reset** button appears
beside it, so you can continue or start over. That is the entire product for this slice — no home
screen, no configuration, no navigation.

Semantic HTML styled by [Pico CSS](https://picocss.com/) classless, with custom CSS only for the
room-readable digits. WCAG 2.2 AA from the start.

## Acceptance criteria

- [ ] The landing page **is** the timer — no menu, no mode list, nothing to choose
- [ ] Start → counts up from `00:00`; the same button then reads Pause
- [ ] Pause → time freezes and a Reset button appears; Resume continues from where it stopped
- [ ] Reset → back to `00:00` and the initial Start state
- [ ] Elapsed time is derived from `Date.now()` every frame, never incremented, so leaving the tab
      and returning shows the correct time
- [ ] Pico CSS classless; no class attributes except where custom CSS is unavoidable, and that
      exception is only the digits
- [ ] Digits fit the viewport at 320px wide with no horizontal scrolling, and stay readable across a
      room
- [ ] Keyboard operable with a visible, unobscured focus indicator; controls at least 24×24px
- [ ] The running time is not announced every second by screen readers; started / paused / reset are
      announced instead
- [ ] Contrast ≥ 4.5:1 for text and ≥ 3:1 for controls in both light and dark schemes
- [ ] The Clock and elapsed arithmetic live in `src/domain/`, are pure, and are unit-tested first

Out of this slice on purpose: everything else. No countdown, no rounds, no configuration, no sound,
no persistence, no install.
