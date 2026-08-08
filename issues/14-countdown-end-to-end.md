---
id: 14
title: Countdown, end to end
labels: [build:slice]
blocked_by: []
assignee: marcosgilf
state: closed
---

## What to build

Open the site, tap **Countdown**, set 5:00 with the min/sec steppers, tap Start, watch giant digits
count down through the prepare countdown into the work Phase, and land on Done showing the total.

The first slice, so it also lays the ground later slices stand on — but only as far as Countdown needs
it: `src/domain/` with `Routine`, `Clock` and `phaseAt` under TDD, the app shell, and **only the
components this screen flow uses**. See [docs/architecture.md](../docs/architecture.md).

Settles the `src/` module layout Open question in [docs/spec.md](../docs/spec.md) §10.

## Acceptance criteria

- [x] Home lists **Countdown only** — no placeholder buttons for Modes that do not work yet
- [x] Config screen: label above, `[+]/[-]` minute column, `mm : ss` digits, `[+]/[-]` second column,
      typing allowed, values clamped silently (`0:75` becomes `1:15`), Start as the lone sticky CTA
- [x] Running screen: variant 3 layout — progress bar, big tabular digits, phase word, small icon
      transport row; `←` back to Config and `✕` to Home in the top nav
- [x] Prepare Phase precedes the work Phase
- [x] Pause/Resume works and elapsed time excludes paused time
- [x] Done screen shows total time and offers Restart; it never auto-navigates
- [x] `phaseAt` is unit-tested at exact Phase boundaries (`workMs - 1`, `workMs`, `workMs + 1`)
- [x] `pnpm check` and `pnpm test` pass; nothing in `src/domain/` imports a browser API

Out of this slice on purpose: round pips, the `next:` hint, skip/back, the `boundaries()` helper, and
every other Mode. Countdown has one Phase — [ticket 15](15-tabata-rounds.md) brings those with the
Mode that needs them.

## Blocked by

None — can start immediately.

## Resolution

Shipped in `feat/14-countdown`. `src/domain/` holds `routine.ts`, `clock.ts` and `phase.ts` — pure,
no browser APIs, 20 unit tests written before the implementation. `src/components/` holds `TopNav`,
`DurationField` and `TimerDisplay`: app-agnostic, properties in, `CustomEvent`s out, importing
nothing from `domain/`. `src/pages/countdown/` is the only file that knows what a Routine is.

Layout decision: Config, Running and Done are three sections on **one page**, toggled by `hidden`, so
the running `Clock` survives the flow without being serialised. Persistence is ticket 17.

Two bugs found by driving a real browser rather than trusting the markup:
- `querySelector("[data-phase]")` matched `<body>` (which carries the phase colour attribute) instead
  of the label. The label hook is now `data-phase-word`.
- The Done screen counted the prepare countdown as timed work — a 2s countdown reported `00:12`. The
  summary now subtracts it.

Deliberately not built, deferred to the tickets that need them: round pips, `next:` hint, skip/back,
`boundaries()`, and every other Mode. `Mode` is currently the single-member union `"countdown"`.
