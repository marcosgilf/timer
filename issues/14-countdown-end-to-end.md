---
id: 14
title: Countdown, end to end
labels: [build:slice]
blocked_by: []
assignee:
state: open
---

## What to build

Open the site, tap **Countdown**, set 5:00 with the min/sec steppers, tap Start, watch giant digits
count down through the prepare countdown into the work Phase, and land on Done showing the total. Quit
and back navigation work from the top nav.

The first slice, so it also lays the ground every later slice stands on: `src/domain/` with `Routine`,
`Clock` and `phaseAt` under TDD, `src/lib/` for browser adapters, the app shell in `src/layouts/`, and
the first app-agnostic components (top nav, digits, stepper, mode button) with a props-in/events-out
contract. See [docs/architecture.md](../docs/architecture.md).

Settles two Open questions in [docs/spec.md](../docs/spec.md) §10: the `src/` module layout and the
exact `boundaries(routine)` signature.

## Acceptance criteria

- [ ] Home lists all six Modes; only Countdown navigates anywhere (the rest are inert until slice 15)
- [ ] Config screen: label above, `[+]/[-]` minute column, `mm : ss` digits, `[+]/[-]` second column,
      typing allowed, values clamped silently (`0:75` becomes `1:15`), Start as the lone sticky CTA
- [ ] Running screen: variant 3 layout — progress bar, big tabular digits, phase word, `next:` hint,
      small icon transport row; `←` back to Config and `✕` to Home in the top nav
- [ ] Prepare Phase precedes the work Phase; `⏭` during prepare skips it
- [ ] Pause/Resume works and the elapsed time excludes paused time
- [ ] Done screen shows total time and offers Restart; it never auto-navigates
- [ ] `phaseAt` is unit-tested at exact Phase boundaries (`workMs - 1`, `workMs`, `workMs + 1`)
- [ ] `pnpm check` and `pnpm test` pass; no browser API is imported inside `src/domain/`

## Blocked by

None — can start immediately.
