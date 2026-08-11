# timer

Track tasks, routines or run pomodoros in a Progressive Web Application.

A timer built to be read across a room while your hands are busy: giant digits, colour-coded phases,
audible cues. Installable, works fully offline, keeps accurate time when the screen sleeps.

> Status: **specified, not yet built.** The design is settled in [`docs/spec.md`](./docs/spec.md);
> implementation has not started.

## What it does

Three capabilities, not a menu of modes:

| Capability | What it does |
|---|---|
| Count up | An unbounded chrono — start, pause, reset |
| Count down | From a duration you set on the timer itself |
| Repeat | Work, optional rest, a number of rounds |

Tabata, EMOM and Pomodoro are **configurations you build**, not features the app ships: 20s / 10s × 8
is a Tabata whether or not anything is labelled "Tabata".

## Design notes

- **Accurate by construction** — state is derived from a wall-clock timestamp with a pure
  `phaseAt(elapsed, routine)`; nothing accumulates ticks, so nothing drifts.
- **Offline-first** — precached service worker, no backend, no accounts, no analytics. Installable as
  **Timer**; updates are picked up on page reload, not via a modal prompt.
- **Progressive enhancement** — audio session, Wake Lock and vibration are feature-detected and no-ops
  where absent. The app is fully correct without any of them.
- **Semantic and accessible** — [Pico CSS](https://picocss.com/) classless, WCAG 2.2 AA in every slice.
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
[`docs/spec.md`](./docs/spec.md), with the code structure in [`docs/architecture.md`](./docs/architecture.md). [`CONTEXT.md`](./CONTEXT.md) is the glossary.

Two branches are kept as primary sources and are deliberately not merged:

- `prototype/timer-ui` — the UI prototype that chose the running-screen layout.
- `research/pwa-platform` — cited platform research (Wake Lock, WebAudio, install, `@vite-pwa/astro`).

## Deployment

Static build deployed by GitHub Actions to Netlify on push to `main`, served at
[timer.marcosgilf.com](https://timer.marcosgilf.com).

## Releases

Release Please opens Release PRs from Conventional Commits. Merging a Release PR bumps
`package.json`, updates `CHANGELOG.md`, creates a `vX.Y.Z` Git tag and a GitHub Release. The app shows
that version in the bottom-right corner.

Use commit prefixes intentionally:

- `feat:` → minor version
- `fix:` → patch version
- `feat!:` or `BREAKING CHANGE:` → major version
- `docs:` / `chore:` → no release unless paired with releasable changes

Set repository secret `RELEASE_PLEASE_TOKEN` if you want Release PRs to trigger CI like normal PRs;
otherwise GitHub suppresses workflows created by `GITHUB_TOKEN`.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Licensed under [MIT](./LICENSE).
