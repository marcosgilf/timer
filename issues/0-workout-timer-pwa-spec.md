---
id: 0
title: Workout timer PWA — spec
labels: [wayfinder:map]
state: open
---

## Destination

A handoff-ready spec for an offline-first, installable, mobile-first PWA **timer** — a general-purpose
one (tasks, workouts, pomodoros), not a fitness app — with Modes crono, countdown, tabata, EMOM, AMRAP
and pomodoro, configurable sound + haptics, readable across a room. Spec only — no build in this map.
Shipped at `timer.marcosgilf.com`.

## Notes

- **Progressive enhancement is the standing rule**: the app must be fully correct with zero platform
  extras — every capability (audio session, Wake Lock, vibration, install, offline) is feature-detected
  and a no-op when absent. No polyfills, no UA sniffing, no keepalive hacks.
- **Vocabulary correction (post-map)**: the domain noun **Workout** was renamed **Routine**, and the
  framing widened from a fitness timer to a general-purpose one. `CONTEXT.md`, `docs/spec.md` and
  `README.md` use Routine; the closed tickets keep their original wording as the historical record.
  "Session" was rejected — it already names the in-flight run state in storage.
- Domain: web app / **general-purpose interval timing** — tasks, workouts, pomodoros. Single user (the
  author), no accounts, no sync. Repo description: *"Track tasks, workouts or run pomodoros in a
  Progressive Web Application"*.
- Stack fixed: Astro + TypeScript, static output, React islands **only where mandatory** —
  prefer plain Astro + native browser features (`<dialog>`, form controls, CSS, View Transitions).
- Tooling fixed: pnpm, vitest (unit), Playwright (e2e), oxlint + oxfmt, husky + lint-staged.
  Reference config: `../../IKEA/b2b-wrk-esi/` (`.oxlintrc.json`, `.oxfmtrc.json`, `.lintstagedrc.js`, `.husky/`).
- Hosting: **Netlify** at `timer.marcosgilf.com`, deployed from GitHub Actions on push to `main` (same
  pattern as `../blog/`). The `marcosgilf.com` zone is Netlify DNS (nsone), Terraform-managed in
  `../blog/infra/netlify`; a Netlify-connected custom domain auto-manages its record. No backend, no
  analytics.
- Licensed **MIT**; `CONTRIBUTING.md` present — the project is public-facing/OSS-friendly.
- Persistence: `localStorage`, minimal.
- Every session: `/grilling` + `/domain-modeling`; `/prototype` for prototype tickets; `/research` subagent for research tickets.
- Plan, don't do: tickets produce decisions, not features.

## Decisions so far

- Destination, scope, and stack pinned in the charting grilling (this map's Notes + Out of scope).
- [Toolchain baseline ported from b2b-wrk-esi](5-toolchain-baseline.md) — pnpm + vitest + oxlint/oxfmt +
  husky/lint-staged wired (commit `938e0e9`); `check:types` is `astro check` since tsc can't read `.astro`.
  oxlint **does** lint `.astro` (frontmatter + `<script>`); oxfmt does not format them. React, Playwright
  and coverage deliberately not installed yet.
- [Interval sequence model — one engine for six modes](1-interval-sequence-model.md) — one model, six
  presets; Modes are config + label, only Crono is unbounded. State is **derived**, not stepped:
  pure `phaseAt(elapsedMs, workout)`. Rounds are the only nesting level. Vocabulary in `CONTEXT.md`.
- [Clock accuracy and background behaviour](2-clock-accuracy-and-background-behaviour.md) — `Date.now()`
  only (survives sleep), Clock = `{startedAt, pausedTotalMs, pausedAt}`, rAF redraw from the clock,
  skip/back shift `startedAt`. Missed cues on wake are dropped, not replayed. Cues ride a ~1s
  lookahead scheduler on `AudioContext.currentTime` to survive tab throttling. Budget ±50ms phases,
  ±30ms cues; provable without fake timers because the clock is a parameter.
- [Audio and haptic cue model](3-audio-and-haptic-cue-model.md) — cues are data (`{at, kind}` from a pure
  `cuesFor(workout)`), sinks are dumb. Synthesised tones, no audio files; pitch = meaning (high work,
  low rest). Config = mute + volume + tick toggle + vibration toggle. `AudioContext` unlocked on the
  Start tap with a visible fallback. Vibration is Android-only, toggle hidden where unsupported.
- [PWA offline, install and Wake Lock — platform research](4-pwa-offline-install-wakelock-research.md) —
  `@vite-pwa/astro@1.2.0` builds fine on Astro 7 (peer range lies; needs explicit `workbox-window`,
  and head tags are injected by hand); iOS Wake Lock is **18.4**, not 16.4, and absent from Home
  Screen web apps before that; `performance.now()` stalls on suspend on both platforms and iOS
  **interrupts** WebAudio in the background unless `navigator.audioSession.type = "playback"`;
  nothing forces React. Findings on branch `research/pwa-platform`.
- [Screen layout and config UI](6-screen-layout-and-config-ui.md) — variant 3 (bar + round pips + big
  digits) wins; ring and full-bleed colour rejected. Shared top nav (`←` / title / `✕`) on every screen
  but Home, content top-aligned, Start as lone sticky CTA, small icon transport row so the digits keep
  the screen. Crono starts on tap. No React anywhere. Prototype kept on branch `prototype/timer-ui`.
- [Persistence model](7-persistence-model.md) — two `localStorage` keys (`timer:prefs:v1` rarely written,
  `timer:session:v1` disposable). Prefs carry cue settings, prepare duration and **last-used config per
  Mode**. Resume runs from real elapsed; a session that replays to `done` is discarded and opens Home —
  that is the entire staleness policy. Writes on Clock mutation + `pagehide`. All reads/writes fail
  silently to defaults.
- [Testing strategy](8-testing-strategy.md) — unit tests cover the pure core only (`phaseAt`,
  `boundaries`, `cuesFor`, `elapsed`, clamping, prefs) with no fake timers, mocks or jsdom; five
  Playwright e2e tests each guard one decision, using `page.clock`. Audio, vibration, Wake Lock and iOS
  behaviour are explicitly untested — manual phone check before shipping. Coverage reported, never
  gated. Unit on `pre-push`, e2e manual, CI split out as its own ticket.
- [iOS background audio](10-ios-background-audio.md) — every platform capability is **progressive
  enhancement**, feature-detected, no-op when absent: audio session `"transient"` (ducks music, never
  takes it over), Wake Lock with a screen-may-sleep note below iOS 18.4, vibration Android-only. Cue
  lookahead becomes **one Phase**, not one second; any Clock mutation reschedules through a single
  function. No keepalive hacks.
- [Where cue and app settings live in the UI](11-settings-ui-home.md) — a Settings screen behind a `⚙` in
  a new Home top nav; five controls (mute, volume, tick toggle, vibration toggle, prepare duration) plus
  Reset everything. No mute on the Running screen — hardware volume buttons do that job.
- [Assemble the handoff spec](9-assemble-handoff-spec.md) — **destination reached**: `docs/spec.md` folds
  every resolved ticket into one implementable document (domain model, engine + Clock, cues, the five
  screens, persistence, PWA layer table, toolchain, testing, non-goals), each section citing the ticket
  that decided it. Prototype and research branches cited, not merged. Seven genuine gaps are listed as
  **Open questions** rather than guessed — `Prefs` defaults, update-prompt UI, iOS install copy, app
  name/icons/`theme_color`, `src/` module layout, the `boundaries()` signature, and CI.
- [CI workflow](12-ci-workflow.md) — `.nvmrc` + two GitHub Actions: `ci.yml` (check → test:coverage →
  build, on PR and `main`, coverage as artifact, no gate) and `deploy.yml` (build → `netlify-cli deploy
  --prod --dir=dist` on `main`). Signal not gate; husky stays the real guard. No Playwright in CI until
  e2e tests exist; no `netlify.toml` and no adapter because output is static. Human must set
  `NETLIFY_AUTH_TOKEN` / `NETLIFY_SITE_ID`.

## Not yet specified

- Voice cues (spoken counts / "3-2-1-go") — a speech **sink** added behind the cue model decided in
  [Audio and haptic cue model](3-audio-and-haptic-cue-model.md); no engine change needed. Open: Web
  Speech vs recorded clips, and whether it survives offline.
- Recorded audio samples instead of synthesised tones — only if tones prove inaudible in a noisy gym.
- CI (GitHub Actions) — now [ticket 12](12-ci-workflow.md); not a blocker for the spec.
- Preset / saved-workout storage — v1 configures fresh each time, but `lastUsed` in
  [Persistence model](7-persistence-model.md) is already the right shape; named presets would be the
  same object under a different key, no migration.
- **Sets** — a second nesting level above Round (3 sets of tabata with 60s between). Ruled out of v1
  as model complexity; revisit only if it is actually missed in the gym.
- **AMRAP round tapping** — tapping to count rounds is only worth it with history to write them to,
  and history is out of scope. Revisit if history ever comes in.
- **Tenths of a second on Crono** — dropped for readability across a room; revisit only if actually missed.
- **Per-Workout prepare countdown** — currently a global preference; if it needs to vary per Workout it
  becomes a Config field and stops being a preference, which is a model change, not a UI tweak.
- Copy, iconography, app name, favicon/manifest icon set.
- Deploy target beyond local (if ever).

## Out of scope

- Accounts, multi-device sync, any server component — single local user by decision.
- Online-only behaviour beyond service-worker update on reconnect — app is local-only.
- Workout history, stats, charts.
- i18n.
