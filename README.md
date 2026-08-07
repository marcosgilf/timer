# timer

Track tasks, routines or run pomodoros in a Progressive Web Application.

A timer built to be read across a room while your hands are busy: giant digits, colour-coded phases,
audible cues. Installable, works fully offline, keeps accurate time when the screen sleeps.

> Status: **specified, not yet built.** The design is settled in [`docs/spec.md`](./docs/spec.md);
> implementation has not started.

## Modes

| Mode | What it does |
|---|---|
| Crono | counts up, unbounded — starts the moment you tap it |
| Countdown | counts down from a set time |
| Tabata | work / rest × rounds (20s / 10s × 8 by default) |
| EMOM | a repeating window (60s × 10 by default); E2MOM and E90 by changing the window |
| AMRAP | a capped countdown to work against |
| Pomodoro | focus / break × 4 plus a long break |

All six are one engine: a Mode is default configuration over a single interval model, not its own
code path.

## Design notes

- **Accurate by construction** — state is derived from a wall-clock timestamp with a pure
  `phaseAt(elapsed, routine)`; nothing accumulates ticks, so nothing drifts.
- **Offline-first** — precached service worker, no backend, no accounts, no analytics.
- **Progressive enhancement** — audio session, Wake Lock and vibration are feature-detected and no-ops
  where absent. The app is fully correct without any of them.
- **No framework** — plain Astro, TypeScript, CSS and DOM APIs. No React unless something proves it
  mandatory.

## Development

```sh
pnpm install
pnpm dev          # http://localhost:4321
```

| Command | Action |
|---|---|
| `pnpm dev` | dev server |
| `pnpm build` | production build to `./dist/` |
| `pnpm preview` | preview the build locally |
| `pnpm check` | `astro check` (types) + oxlint + oxfmt |
| `pnpm format` | oxlint `--fix` + oxfmt `--write` |
| `pnpm test` | vitest (unit) |
| `pnpm test:coverage` | vitest with a coverage report (reported, never gated) |

Git hooks: `pre-commit` formats and type-checks staged files, `pre-push` runs `pnpm check && pnpm test`.

## How this project is planned

Decisions are made one at a time as tickets in [`issues/`](./issues) — a local markdown issue tracker
using the [wayfinder](https://github.com/mattpocock/skills) method — and folded into
[`docs/spec.md`](./docs/spec.md). [`CONTEXT.md`](./CONTEXT.md) is the glossary.

Two branches are kept as primary sources and are deliberately not merged:

- `prototype/timer-ui` — the UI prototype that chose the running-screen layout.
- `research/pwa-platform` — cited platform research (Wake Lock, WebAudio, install, `@vite-pwa/astro`).

## Deployment

Static build deployed by GitHub Actions to Netlify on push to `main`, served at
[timer.marcosgilf.com](https://timer.marcosgilf.com).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Licensed under [MIT](./LICENSE).
