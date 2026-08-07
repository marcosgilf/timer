# Architecture

How this codebase is organised and why. Companion to [`docs/spec.md`](./spec.md) (what to build) and
[`CONTEXT.md`](../CONTEXT.md) (the vocabulary).

## Principles

### Lean — the user decides what is waste

Everything that does not end up helping someone time a Routine is waste: speculative abstraction,
layers with one implementation, configuration nobody changes, tests that assert a mock was called.

Applied here:

- **Build only what a user can feel.** Work is sliced as tracer bullets — a narrow but complete path
  from domain to screen — so every slice is demoable at `timer.marcosgilf.com`, not a layer nobody can
  see yet.
- **Decide as late as responsibly possible.** The six Open questions in `docs/spec.md` §10 stay open
  until the slice that needs them; deciding early is inventory that rots.
- **Small batches.** One slice per pull request, deployed on merge. A preview URL per PR is the
  feedback loop.
- **Amplify learning.** Prototype branches and research branches are kept as primary sources rather
  than summarised and thrown away.

### DDD, the half that pays

Full tactical DDD — aggregates, repositories, application services, an anti-corruption layer — would
be waste in a single-user offline timer with no backend. What is kept is the part that earns its
place: **a pure domain model, expressed in the ubiquitous language of `CONTEXT.md`, isolated from
everything the browser provides.**

- The **domain** knows Routine, Mode, Phase, Round, Clock, Cue. It has no idea a screen, a speaker or
  `localStorage` exists.
- **Infrastructure** adapts browser APIs to the domain's needs. Each adapter is thin and replaceable,
  and each one is a place a platform can fail without the domain caring — which is exactly the
  progressive-enhancement rule from `docs/spec.md` §6.
- **UI** renders domain state and turns input into domain calls.

The test of a boundary: if a file imports `window`, `document`, `navigator` or `localStorage`, it is
not domain.

### TDD, where there is logic to get wrong

Red → green → refactor on the domain, which is where every real decision lives (`phaseAt`, cue
scheduling, clamping, prefs parsing). The domain takes time and configuration as **arguments**, so
tests need no fake timers, no jsdom and no mocks.

Not TDD'd: markup, styling, and adapters that only forward a call to a browser API — a test there
asserts the mock, not the behaviour. Those are covered by the five Playwright tests in
`docs/spec.md` §8, or deliberately not covered at all.

## Folders

Astro's conventions where Astro owns the file (`src/pages`, `src/layouts`, `src/components`,
`src/styles`), plus two folders that carry the DDD boundary:

```
src/
├── domain/       pure TypeScript: Routine, Phase, Clock, Cue. No browser APIs. Tests live beside.
├── infra/        adapters over browser APIs: storage, audio, haptics, wake lock, audio session.
├── components/   Astro components (markup + scoped styles + the DOM wiring for one screen)
├── layouts/      the shared app shell (top nav, theme, viewport)
├── pages/        routes (Astro convention)
└── styles/       design tokens and global CSS
docs/             spec, architecture
issues/           decision tickets (wayfinder) and build tickets
```

Rules that keep the boundary honest:

- `domain/` imports nothing from `infra/`, `components/` or Astro. Dependencies point **inwards**.
- `infra/` may import `domain/` types; never the reverse.
- Logic lives in `.ts` files, not in `.astro` — oxlint and vitest both see `.ts`, and `.astro` stays
  markup plus a thin `<script>` that wires a component to domain and infra.
- Tests are colocated: `src/domain/phase.test.ts` beside `src/domain/phase.ts`.

## Why not more

- **No `application/` layer** — with no backend, no auth and no transactions, use cases are one
  function call. A layer that only forwards is waste.
- **No repository interfaces** — there is exactly one storage implementation, `localStorage`, and it
  is allowed to fail silently. An interface with one implementation is a guess about a second one.
- **No state-management library** — state is three numbers (`Clock`) plus a `Routine`; the domain
  derives the rest.
- **No component framework** — plain Astro and DOM, per `docs/spec.md`. React arrives only if a slice
  proves it mandatory, and that proof goes in a ticket.
