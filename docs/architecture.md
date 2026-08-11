# Architecture

How this codebase is organised and why. Companion to [`docs/spec.md`](./spec.md) (what to build) and
[`CONTEXT.md`](../CONTEXT.md) (the vocabulary).

## Principles

### MVP first, then iterate

The product grows one **shippable capability** at a time, each usable end to end by a real person
before the next begins. Not layers, not screens-without-behaviour, not six presets at once:

1. **Chrono** — landing page, Start, Pause, Reset. The whole app, working.
2. **Installable and offline** — the same app, now a PWA.
3. **Count down** — plus the configuration screen that feeds it.
4. **Rounds** — work, rest, repeat, which makes Tabata/EMOM/Pomodoro *configurable* without any of
   them existing as a feature.

Anything not needed by the capability in hand is not built. If a user cannot do something new when a
slice lands, the slice was the wrong shape.

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

### YAGNI — you aren't gonna need it

The lean principle applied to the code you are tempted to write *right now*. Build for the behaviour
in front of you, not the one you can imagine.

- A slice ships **only what its own acceptance criteria demand**. If Countdown is the slice, Home
  lists Countdown — not six buttons where five do nothing. Placeholders are inventory: they look like
  progress, they need maintaining, and they lie to the user about what works.
- **No abstraction until the second case exists.** An interface with one implementation, a factory
  with one product, a config value nobody changes, a generic used once — deleted on sight. The second
  caller justifies the abstraction, and it arrives with better information than you have now.
- **No dependency for what a few lines do.** Reach for the platform first: `<dialog>`, form controls,
  CSS, `localStorage`, `AudioContext`. Every dependency is bytes to precache, a supply chain, and an
  upgrade you will owe.
- **No code for a future requirement.** If it is genuinely coming, write it when the requirement is
  real and its shape is known.
- Deliberate shortcuts that cut a real corner get a `ponytail:` comment naming the ceiling and the
  upgrade path, so the trade-off is visible instead of forgotten.

The test before writing anything: *what breaks for the user if I leave this out?* No answer means
leave it out.

### DDD, the half that pays

Full tactical DDD — aggregates, repositories, application services, an anti-corruption layer — would
be waste in a single-user offline timer with no backend. What is kept is the part that earns its
place: **a pure domain model, expressed in the ubiquitous language of `CONTEXT.md`, isolated from
everything the browser provides.**

- The **domain** knows Routine, Mode, Phase, Round, Clock, Cue. It has no idea a screen, a speaker or
  `localStorage` exists.
- **Browser adapters** in `src/lib/` wrap the platform APIs the domain needs acting on. Each adapter is
  thin and replaceable, and each is a place a platform can fail without the domain caring — which is
  exactly the progressive-enhancement rule from `docs/spec.md` §6.
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

## Styling and markup

### Semantic HTML, classless CSS

[Pico CSS](https://picocss.com/) in its **classless** form: correct semantic elements get sensible
styles with no class attributes at all. `<nav>`, `<button>`, `<form>`, `<article>`, `<dialog>` and
`<input>` are the design system.

- Reach for the right element before any styling: a button that acts is `<button>`, navigation is
  `<nav><ul>`, a grouped control is `<fieldset>`.
- Custom CSS is the exception and is justified by something Pico cannot express — the room-readable
  digits are the obvious one. It stays scoped to the component that needs it.
- No utility classes, no CSS framework classes, no component library.

The payoff is that accessibility, dark mode and responsive behaviour come from the markup being right
rather than from a stylesheet fighting it.

### WCAG 2.2 AA is a requirement, not a polish pass

Every slice ships accessible, because retrofitting is more work than doing it once:

- **Contrast** — 4.5:1 for text, 3:1 for UI components and graphics, in both colour schemes.
- **Colour is never alone** (1.4.1) — the Phase always has a text label beside its colour.
- **Keyboard** — everything operable, visible focus (2.4.7), focus never obscured (2.4.11, new in 2.2).
- **Target size** — at least 24×24 CSS px (2.5.8, new in 2.2); the timer's controls are far larger,
  because they are used with sweaty hands.
- **Status changes** — announced politely where it helps and silenced where it would flood a screen
  reader: a per-second `aria-live` clock is unusable, so the running time is `aria-live="off"` with
  state changes (started, paused, finished) announced instead.
- **Motion and orientation** — no orientation lock, no animation that ignores `prefers-reduced-motion`.

## Folders

Astro's default structure everywhere Astro owns the file, plus one folder that carries the DDD
boundary: `src/domain/`.

```
src/
├── domain/       pure TypeScript: Routine, Phase, Clock, Cue. No browser APIs. Tests beside.
├── lib/          browser adapters: storage, audio, haptics, wake lock, audio session
├── components/   reusable UI components — app-agnostic, props in / events out
├── layouts/      the app shell (top nav slot, theme, viewport)
├── pages/        routes, and the screen composition for each
└── styles/       design tokens and global CSS
docs/             spec, architecture
```

**`infra/` is reserved for deployment infrastructure as code** (Terraform, Netlify/DNS config) at the
repository root, outside `src/`, following the pattern in `../blog/infra/netlify`. Nothing needs it
yet — it is named here so browser adapters never squat on the word.

### `components/` is a component library, not app parts

Everything in `src/components/` must be usable by another app: a stepper, a digit display, a top nav,
a progress bar, a mode button. The contract is **properties in, events out** — a component receives its
data as props and reports intent by dispatching a `CustomEvent`. It never reaches into app state, never
imports `src/domain/`, never reads storage, and never decides what happens next.

An example of the split: `<Stepper value min max step>` emits `change`; deciding that the change means
`routine.workMs` is now 30s belongs to the page composing it. Screen composition — anything that knows
what a Routine *is* — lives in `src/pages/`.

Rules that keep the boundaries honest:

- `domain/` imports nothing from `lib/`, `components/` or Astro. Dependencies point **inwards**.
- `lib/` may import `domain/` types; never the reverse.
- `components/` imports neither `domain/` nor `lib/`.
- Logic lives in `.ts` files, not in `.astro` — oxlint and vitest both see `.ts`, and `.astro` stays
  markup plus a thin `<script>` that wires things together.
- Tests are colocated: `src/domain/phase.test.ts` beside `src/domain/phase.ts`.

## Why not more

- **No `application/` layer** — with no backend, no auth and no transactions, use cases are one
  function call. A layer that only forwards is waste.
- **No repository interfaces** — there is exactly one storage implementation, `localStorage`, and it
  is allowed to fail silently. An interface with one implementation is a guess about a second one.
- **No state-management library** — state is three numbers (`Clock`) plus a `Routine`; the domain
  derives the rest.
- **No component framework** — plain Astro and DOM. React arrives only if a slice proves it
  mandatory, and that proof goes in the spec.
- **No design system beyond Pico** — classless semantic CSS covers everything except the digits.
