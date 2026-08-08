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
count down through the prepare countdown into the work Phase, and land on Done showing the total.

The first slice, so it also lays the ground later slices stand on — but only as far as Countdown needs
it: `src/domain/` with `Routine`, `Clock` and `phaseAt` under TDD, the app shell, and **only the
components this screen flow uses**. See [docs/architecture.md](../docs/architecture.md).

Settles the `src/` module layout Open question in [docs/spec.md](../docs/spec.md) §10.

## Acceptance criteria

- [ ] Home lists **Countdown only** — no placeholder buttons for Modes that do not work yet
- [ ] Config screen: label above, `[+]/[-]` minute column, `mm : ss` digits, `[+]/[-]` second column,
      typing allowed, values clamped silently (`0:75` becomes `1:15`), Start as the lone sticky CTA
- [ ] Running screen: variant 3 layout — progress bar, big tabular digits, phase word, small icon
      transport row; `←` back to Config and `✕` to Home in the top nav
- [ ] Prepare Phase precedes the work Phase
- [ ] Pause/Resume works and elapsed time excludes paused time
- [ ] Done screen shows total time and offers Restart; it never auto-navigates
- [ ] `phaseAt` is unit-tested at exact Phase boundaries (`workMs - 1`, `workMs`, `workMs + 1`)
- [ ] `pnpm check` and `pnpm test` pass; nothing in `src/domain/` imports a browser API

Out of this slice on purpose: round pips, the `next:` hint, skip/back, the `boundaries()` helper, and
every other Mode. Countdown has one Phase — [ticket 15](15-tabata-rounds.md) brings those with the
Mode that needs them.

## Blocked by

None — can start immediately.
