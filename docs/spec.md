# Routine timer PWA — implementation spec

Everything an implementer needs to build v1 is here. Terms are used exactly as defined in [CONTEXT.md](../CONTEXT.md) — "interval" and "timer"
are banned as domain nouns.

**The standing rule** (map Notes, restated by
iOS background audio): the app must be **fully correct with
zero platform extras**. Every capability — audio session, Wake Lock, vibration, install, offline —
is feature-detected and a no-op when absent. No polyfills, no UA sniffing, no keepalive hacks.

Assets that are not on `main`, and must not be merged:

- **Prototype**: branch `prototype/timer-ui`, `src/pages/prototype.astro`, run with `pnpm prototype`
  — the visual source of truth for the Running screen
  (Screen layout and config UI).
- **Research**: branch `research/pwa-platform`, `research/pwa-platform.md` (commit `3144d27`),
  read with `git show research/pwa-platform:research/pwa-platform.md` — citations and version
  numbers behind the platform facts
  (PWA offline, install and Wake Lock).

---

## 0. Plan revision — MVP first, no named modes

**This section supersedes parts of what follows.** The decisions below were made as a single v1;
building it proved the batch too big, so delivery is re-cut into shippable capabilities. Nothing here
invalidates the *reasoning* in §1–§9 — the engine, Clock, cue and persistence models stand — but the
product shape and the order changed.

### What changed

1. **Named Modes are gone.** No Crono/Countdown/Tabata/EMOM/AMRAP/Pomodoro buttons and no `Mode`
   type. The app offers three capabilities — count up, count down, repeat with rounds — and *the
   user's configuration* is what makes a Tabata a Tabata. See "Modes are not a concept" in
   [CONTEXT.md](../CONTEXT.md). §1's `Mode` union, its per-Mode defaults table and every per-Mode rule
   are therefore historical: read them as the shape of the *configuration space*, not as features.
2. **Delivery is capability-first**, each usable end to end before the next starts:
   Chrono → PWA → count down with its configuration screen → rounds.
3. **Styling is [Pico CSS](https://picocss.com/), classless.** Semantic HTML carries the design;
   custom CSS is the exception, justified per component (the digits). The variant-3 layout in §4 is
   still the target *look*, expressed through semantic elements rather than the prototype's markup.
4. **WCAG 2.2 AA is a requirement of every slice**, not a later pass — contrast, keyboard, visible and
   unobscured focus, 24×24px minimum targets, colour never the only signal, and no per-second
   live-region announcements. See [architecture.md](./architecture.md).
5. **Configuration reuses the timer display** with `+`/`−` controls for minutes and seconds. Free-text
   entry is dropped — one input mechanism, not two.
6. `prototype/timer-ui` and `feat/14-countdown` are both **prototypes**: primary sources to learn
   from, not code to merge.

### Deferred until a shipped capability needs it

Cues and sound, settings, persistence, Wake Lock, skip/back transport, and configuring the prepare
countdown. Each stays specified below and returns as its own slice.

---

## 1. Domain model

Decided by Interval sequence model — one engine for six modes.

**One model, six presets.** A Mode is default configuration plus a label — never its own code path.
Only Crono is structurally different (unbounded).

```ts
type Mode = "crono" | "countdown" | "tabata" | "emom" | "amrap" | "pomodoro";

type PhaseKind = "prepare" | "work" | "rest" | "done";

type Routine = {
  mode: Mode;
  workMs: number;
  restMs: number;        // 0 = no rest Phase in the pattern (EMOM, countdown, AMRAP, crono)
  rounds: number;        // 1 for single-Phase Modes
  finalRestMs?: number;  // pomodoro long break, appended after the last round
  unbounded?: boolean;   // crono only
};
```

Rules:

- One Round = `work`, then `rest` if `restMs > 0`. **Rounds are the only nesting level — no sets.**
- A `prepare` Phase precedes round 1 in **every** Mode, Crono included. Its duration is a global
  preference (default 10s); `0` disables it.
- Pomodoro's long break is a `rest` Phase with a longer duration appended after round 4, which then
  ends the Routine. It is not a Phase kind of its own.
- EMOM: `work` **is** the window (configurable, so E2MOM/E90 come free), no `rest` Phase. The app
  does not know the split inside the window.
- AMRAP is a countdown under a different name. No round tapping in v1.

### Defaults per Mode

| Mode | Defaults |
|---|---|
| Crono | unbounded, counts up |
| Countdown | 5:00 |
| Tabata | work 0:20 / rest 0:10 × 8 |
| EMOM | window 1:00 × 10 |
| AMRAP | 12:00 |
| Pomodoro | focus 25:00 / break 5:00 × 4, long break 15:00 |

### Validation

**Clamp silently. Never block Start, never show error text.** Phase duration `0:01`–`99:59`,
rounds `1`–99, seconds roll into minutes (`0:75` → `1:15`). Clamping lives in the pure layer, not
in the DOM, so it is unit-tested
(Testing strategy).

---

## 2. The engine — `phaseAt` and Clock arithmetic

Decided by Interval sequence model and
Clock accuracy and background behaviour.

### Derive, don't expand

No array of Phases, no per-tick mutation. State is a pure function of elapsed time:

```ts
phaseAt(elapsedMs: number, routine: Routine): PhaseState
```

`PhaseState` exposes: `phaseKind`, `remainingInPhaseMs` (`elapsedInPhaseMs` when unbounded),
`phaseProgress` (0–1), `round`, `totalRounds`, `nextPhaseKind`, `totalElapsedMs`, `status`
(`idle | running | paused | done`). Whole-Routine remaining is **deliberately absent** — meaningless
for Crono and unused by the design.

Because state is derived, drift correction is free, resume after reload is one stored timestamp, and
skip is arithmetic on one number. This is the single module worth testing hard.

### Clock

```ts
type Clock = { startedAt: number; pausedTotalMs: number; pausedAt: number | null };

const elapsed = (c: Clock, now: number) => (c.pausedAt ?? now) - c.startedAt - c.pausedTotalMs;
```

- **Time source is `Date.now()` only.** `performance.now()` does not advance while the device is
  suspended on either platform — confirmed as fact, not guess, by
  PWA research (WebKit `MonotonicTime` /
  `mach_absolute_time`, Chromium `CLOCK_MONOTONIC`). Sleeping mid-routine is normal on a gym floor.
  Accepted trade-off: an NTP or manual clock step mid-Routine corrupts elapsed — rare, recoverable
  by pausing.
- **Resume** adds `now - pausedAt` to `pausedTotalMs` and clears `pausedAt`.
- **Skip and back shift `startedAt`** — no offset field. One number to store, one to resume from.
  Back is clamped so elapsed can never go below 0.

### Display

- `requestAnimationFrame`, recomputing from `Date.now()` every frame. Never increment a counter.
  rAF pausing while hidden is correct — there is nothing to render.
- **Whole seconds in every Mode.** Tenths are unreadable across a room.
- Countdown uses `ceil(remainingMs / 1000)` so the last beep lands as the display leaves `1` and `0`
  never flashes. Count-up uses `floor`.

### Waking up behind

On `visibilitychange` → visible: recompute from the Clock and **jump** to the correct Phase. Missed
cues are dropped, never replayed — stale beeps are noise. If the Routine completed while away, land
on the Done screen (its end cue may fire). With phase-length cue scheduling
(iOS background audio) the drop rule now only covers a real
device suspend, where nothing helps.

### Transport controls

- **Skip** — set elapsed to the next Phase boundary.
- **Back** — music-player rule: more than 2s into a Phase restarts it, otherwise previous Phase.
- **Done** — stop on the Done screen with total time and rounds completed; end cue fires once;
  Restart and Back offered. **Never auto-navigate** — the user is on the floor, not holding the phone.

### Budget

Phase boundaries ±50 ms wall clock, cues ±30 ms. Display drift is bounded by frame rate (~16 ms)
because nothing accumulates.

---

## 3. Cue model and scheduling

Decided by Audio and haptic cue model, with the
scheduling horizon revised by iOS background audio.

**Cues are data, sinks are dumb.** `cuesFor(routine)` is a pure function returning `{ at, kind }[]`;
sinks (tone, vibration, later speech) render them. The pure part is unit-tested; sinks are trivial
enough not to be. This split is the only thing that makes voice cues cheap later.

### Catalogue

| Cue | Fires | Sound | Vibration (Android only) |
|---|---|---|---|
| `countdown-tick` | last 3s of any Phase, one blip per second | 660 Hz short blip | none (constant buzzing, battery) |
| `phase-start` — work | a `work` Phase begins | 880 Hz | `[200]` |
| `phase-start` — rest | a `rest` Phase begins | 440 Hz | `[200]` |
| `final-round` | last Round begins | marker tone | `[100,100,100]` |
| `routine-end` | Routine reaches `done` | three-note descending figure | `[400,200,400]` |

Pitch carries meaning — **high = work, low = rest** — so the Phase is audible without looking. EMOM
needs no extra cue: each window start *is* a `phase-start`.

### Sound source

**Generated `OscillatorNode` tones. No audio files.** Offline-first means every byte is precached;
synthesised cues add none, and per-kind pitch is free.

### Scheduling — one Phase of lookahead

A hidden tab throttles `setTimeout` to roughly once a minute, so cues must never be driven by
timers. Cues are booked on `AudioContext.currentTime`, which is immune to throttling. The display
clock (`Date.now()`) and the cue clock (`AudioContext.currentTime`) are two views of one timeline,
correlated once at start.

Horizon is **one Phase, not one second** (iOS background audio):
a ~1s horizon does not survive a 5-minute pomodoro break with the screen off. At each Phase start,
schedule every cue of that Phase. A Phase is the natural unit — its cues are fully known when it
begins, and it bounds how much must be cancelled. Scheduling the whole Routine up front would mean
cancelling hundreds of nodes on every skip.

Scheduled `OscillatorNode`s are kept in an array. **Any Clock mutation** (pause, resume, skip, back)
calls one `reschedule(elapsed)` that stops them all and re-books from the new elapsed — the same
function as entering a Phase. One code path, four call sites.

### Audio unlock — the failure mode that matters

iOS and Chrome start `AudioContext` suspended, and a suspended context is **silence with no error**.
So:

1. Create and `resume()` the context on the **Start tap** (a real user gesture).
2. Verify with a zero-volume tone.
3. If still suspended, show a one-line "tap to enable sound" affordance on the Running screen.
4. `resume()` again on `visibilitychange` → visible — iOS suspends on backgrounding.

### Vibration

`navigator.vibrate` does not exist on iOS Safari and has no PWA workaround — haptics are
**Android-only, permanently**. Vibrate where supported, skip silently where not, and **hide** the
vibration toggle when the API is absent rather than showing a dead switch.

### Configuration surface

Master mute, volume, one toggle for `countdown-tick`, one toggle for vibration. **No per-cue toggle
matrix.** Persisted as preferences (§5); surfaced on the Settings screen (§4).

---

## 4. UI — screens, states, layout

Decided by Screen layout and config UI (prototype,
branch `prototype/timer-ui`) and Where cue and app settings live in the UI.

### Chosen layout: variant 3, "bar"

Progress bar + round pips + big digits on a neutral background. Rejected: **v1** full-bleed colour
flood (loud, but loses the round count) and **v2** ring (collides with the digits on some viewports
and costs ~half the digit size, the one thing that matters at 4 m). Colour stays as the Phase signal
on the bar, pips and digits: **green = work, red = rest**, light and dark via `prefers-color-scheme`
only.

### Shell

Every screen **including Home** uses the same top
nav: left slot / centred title / right slot. Content starts at the **top** of the page, never
vertically centred.

| Screen | Nav left | Title | Nav right |
|---|---|---|---|
| Home | (empty) | "Routine" | `⚙` → Settings |
| Config | `←` → Home | Mode name | `✕` → Home |
| Running | `←` → Config (hidden for Crono) | Mode name | `✕` → Home |
| Done | `←` | Mode name | `✕` → Home |
| Settings | `←` → Home | "Settings" | (empty) |

### Home

One full-width Mode button per row, text centred; 3-column grid at ≥900px. Six Modes.

### Config

Per-field block, minutes ±1 and seconds ±1. Free-text entry is absent:

```
Work
[+]  05 : 30  [+]
[−]  min  sec  [−]
```

Digits are timer-sized (3rem/800, `--fg`); boxes match the stepper-column height. Free-text duration
entry is intentionally absent: the `+`/`−` steppers are the only duration controls. **Accept alone at
the bottom as a sticky CTA.** It navigates to the paused Running screen; Start begins the Routine
there. Fields shown are those the Mode uses (§1). Crono has **no Config
screen at all** — it starts on tap from Home.

### Running

Digits fill the screen. Below them: progress bar, round pips, `next: rest`. Controls are one small
centred row (~2.75rem), icons throughout: `⏮ | ⏸/▶ | ⏭`. Deliberately small — big buttons stole
attention from the digits in the prototype.

Mode-dependent behaviour:

- Unbounded Routines (Crono) show `↺` reset instead of `⏮`, and `⏭` **finishes** to the Done screen,
  so every Mode ends the same way.
- During `prepare`, `⏭` skips the countdown in every Mode — it never finishes.
- Single-Phase Routines hide the controls they cannot use.
- **No mute control here** — the phone's volume buttons work face-down on the floor, need no aiming
  and cost no pixels.
- Conditional one-line notes: "tap to enable sound" if the `AudioContext` is still suspended (§3),
  and the Wake Lock API error when a supported request fails (§6). Missing Wake Lock support is silent.

### Done

Total time (+ rounds completed), **Restart as a lone CTA**. Never auto-navigates.

### Settings

Reached from `⚙` on Home; uses the shared shell with `←` back. Five controls plus a reset:

1. Master mute
2. Volume
3. `countdown-tick` toggle
4. Vibration toggle — **hidden entirely** where `navigator.vibrate` is absent
5. Prepare-countdown duration (global preference, not per-Routine)
6. **Reset everything**, ghost style at the bottom — clears both `localStorage` keys

No theme override — `prefers-color-scheme` only, and nothing is stored for it.

### No React, anywhere

The whole prototype is one `.astro` file: plain DOM, CSS custom properties, `rAF`, native
`<input inputmode="numeric">`. Nothing in the UI justifies an island, and nothing in the PWA layer
does either — registration, update activation, Wake Lock, audio session and haptics are all plain DOM APIs.

---

## 5. Persistence

Decided by Persistence model in localStorage.

### Two keys, different lifetimes

```ts
"timer:prefs:v1"   // written rarely, must survive
"timer:session:v1" // written often, disposable
```

Split so a crash mid-write on the session cannot eat preferences.

```ts
type Prefs = {
  v: 1;
  muted: boolean;
  volume: number;    // 0-1
  ticks: boolean;    // countdown-tick cue
  vibrate: boolean;
  prepareMs: number;
  lastUsed: Partial<Record<Mode, Routine>>; // reopening Tabata shows YOUR 30/15×10
};

type Session = { v: 1; routine: Routine; clock: Clock };
```

`lastUsed` is what makes "no presets in v1" bearable and costs one nested object. The session stores
the **resolved** `Routine`, not the Mode name, so changing defaults later cannot rewrite a running
Routine.

### Resume

Resume **running**, from real elapsed — `startedAt` is an absolute `Date.now()` value, so it
survives reload for free. Stale cues are dropped on the way (§2).

If replaying elapsed lands on `done`, the session is **discarded and the app opens Home**. That is
the entire staleness policy: no cut-off constant, no timeout to tune, just the `kind === "done"`
check that already exists.

### Write cadence

On **Clock mutation only** — start, pause, resume, skip — plus `pagehide`/`visibilitychange` for the
crash case. Phase boundaries do **not** write: they do not mutate the Clock. A handful of writes per
Routine. The session key is cleared on Done and on Quit.

### Failure is never visible

Every read is wrapped in try/catch with minimal shape validation; on any failure (corrupt JSON,
unknown `v`, wrong types) **delete the key and continue with defaults**. Every write goes through a
`safeWrite` that swallows `QuotaExceededError` (Safari private browsing throws on write). The app is
fully functional with zero persistence — everything stored is convenience. A timer that will not
start because storage is odd is worse than one that forgot your settings.

---

## 6. PWA — offline, install, Wake Lock

Decided by PWA offline, install and Wake Lock — platform research
and iOS background audio.

### The progressive-enhancement layer table

The baseline is a timer that keeps perfect time from `Date.now()` and beeps while visible. Every
layer below is feature-detected, adds capability where present, and is a no-op where absent.

| Layer | Detect | Present | Absent |
|---|---|---|---|
| Baseline | — | accurate time, visible cues | — |
| Audio session | `"audioSession" in navigator` | `type = "transient"` while running | no-op (Chrome, Firefox) |
| Wake Lock | `"wakeLock" in navigator` | screen held during a Routine | no-op, no notice |
| Vibration | `"vibrate" in navigator` | haptics per §3 | toggle hidden |

### Service worker and offline

- **`@vite-pwa/astro@1.2.0`.** Its peer range stops at `astro ^5`, but it **builds correctly on
  `astro@7.1.6`** — verified by running a build (correct `sw.js`, workbox runtime,
  `manifest.webmanifest`, precache manifest with `index.html` rewritten to `/`). pnpm installs it
  with a peer *warning*, not an error.
- Two build-verified gotchas: (1) **nothing is injected into the HTML** — emit
  `pwaInfo.webManifest.linkTag` from `virtual:pwa-info` and call `registerSW()` from
  `virtual:pwa-register` by hand; (2) **`workbox-window` must be an explicit devDependency** under
  pnpm, or the build fails with `Rolldown failed to resolve import "workbox-window"`.
- Add `/// <reference types="vite-plugin-pwa/client" />` to `src/env.d.ts` for the virtual-module types.
- **`registerType: 'prompt'`, never `autoUpdate`** — hold a waiting worker until a counter activates it.
  The activation path is a thin Astro script around the service-worker registration wrapper.
- Precache everything: the app is static with no API. Measured cost: 1.3 KB `sw.js` + 15 KB workbox
  (SW scope only), 1.27 KB gzip on the page.

#### Update activation

- Use `registerType: 'prompt'`, never `autoUpdate`. Capture `updateSW` from
  `registerSW({ onNeedRefresh })`; a waiting worker stays idle until counter activation.
- Every counter start path — count-up, count down, and restart — emits one activation event. If a worker
  waits, the event calls `updateSW(true)` and reloads automatically into the waiting version. If the
  readiness callback arrives just after the event, activation starts as soon as it is ready. Pause and
  resume do not emit activation events.
- No update button, confirmation prompt, toast dependency, popover/polyfill, polling or custom
  service-worker manager. Automatic reload is intentional and may discard a newly started in-memory
  Clock; the next page starts with the new build.
- Before activation, store a session marker. The new build prefixes the bottom version with green
  **NEW vX.X.X** for the current app session. Clear the marker only when activation fails. Version
  highlighting is optional; storage failures do not block update activation or timer behavior.
- Registration errors are swallowed; offline use of the current version remains unaffected.

### Install and manifest

- Chromium installability requires `name`/`short_name`, **192px and 512px** icons, `start_url`,
  `display`, no `prefer_related_applications`, over HTTPS/localhost. `theme_color` and `orientation`
  are presentation, not installability.
- iOS: **Add-to-Home-Screen only, no `beforeinstallprompt`** — install guidance is static copy.
  `display: standalone | fullscreen` is what makes it a real web app rather than a bookmark.
  Manifest icons work since iOS 15.4, but **`apple-touch-icon` takes precedence**.
- No orientation lock (§4 reflows by width alone).

### Screen Wake Lock

- The lock is **released on `visibilitychange` → hidden**, and `request()` rejects while hidden —
  reacquire on return to visible.
- Support: Chrome 84, Firefox 126, Safari macOS 16.4, and **iOS Safari 18.4** — *not* 16.4. iOS
  16.4–18.3 is partial: it does not work in standalone Home Screen web apps
  ([WebKit bug 254545](https://bugs.webkit.org/show_bug.cgi?id=254545)). **The installed-iOS case
  this project targets has no Wake Lock below iOS 18.4.**
- Fallback: feature-detect, let the screen sleep, and recompute from `Date.now()` on wake. Missing
  support is silent. If a supported initial request or visible-running reacquisition rejects, show
  the Wake Lock API error, prefixed with *"Wake Lock error:"*, until the Routine is idle, paused,
  Done, Reset, or acquisition succeeds.
  **No silent-video keepalive hacks** — battery cost, folklore, and they break.

### Audio session — `"transient"`, not `"playback"`

WebKit **interrupts** the AudioContext on backgrounding (state `"interrupted"`, `currentTime` stops)
unless `navigator.audioSession.type` is `"playback"`/`"play-and-record"` (Safari 16.4+, Safari-only).

`"playback"` survives backgrounding but **takes over from the user's music**, and training with
music is the normal case. `"transient"` ducks other audio for the beep and hands it straight back —
exactly what a cue is. Set on Start, restored to `"auto"` on Done/Quit. Cost: no guaranteed
background survival on iOS, accepted — killing someone's playlist to beep is worse than a missed
beep with the screen off.

### Android background

Chromium keeps the AudioContext running for hidden frames and freezes a silent backgrounded page
~32s after audio stops, dropping timers to 1/min. Cues are already booked on the audio clock before
that, and the display recomputes from `Date.now()` on resume. **No special case needed.**

---

## 7. Toolchain

Decided by Toolchain baseline ported from b2b-wrk-esi
(commit `938e0e9`, already on `main`).

- **Astro 7 + TypeScript, static output.** `output: 'static'` is the Astro 7 default and is
  deliberately not written in the config; it becomes a real decision only if an adapter appears.
- **pnpm**, Node `>=22.12.0`. `pnpm-workspace.yaml` kept (pnpm uses it for `allowBuilds`).
  `.npmrc` sets `min-release-age=7`.
- **React is not installed** and nothing has justified it (§4). Adding it later is `astro add react`.
- **oxlint** (`.oxlintrc.json`, + `env.browser`, `ignorePatterns: [dist, .astro]`) and **oxfmt**
  (`.oxfmtrc.json`, `**/*.md` ignored). oxlint **does** lint `.astro`
  (frontmatter and `<script>`, verified on 1.77.0); **oxfmt does not** — accepted, editor formatting
  plus `astro check` cover it. Add `prettier` + `prettier-plugin-astro` only if template drift
  becomes annoying.
- **`check:types` is `astro check`**, not `tsc --noEmit` — `tsc` cannot parse `.astro`.
  `tsconfig.json` stays on `astro/tsconfigs/strict`.
- **husky**: `pre-commit` → `pnpm exec lint-staged`; `pre-push` → `pnpm check && pnpm test`.
  `.lintstagedrc.js`: JS/TS → `pnpm format` + project-wide `astro check`; `*.astro` →
  `oxlint --fix` + `astro check`.
- Scripts: `dev`, `build`, `preview`, `check`, `check:types`, `lint`, `format`, `test`,
  `test:watch`, `test:coverage`.
- Still to install when the work reaches them: `@vite-pwa/astro` + `workbox-window` (§6),
  Playwright (§8). Drop `--passWithNoTests` from `pnpm test` once the engine has its first test.

---

## 8. Testing strategy

Decided by Testing strategy — vitest unit plus Playwright e2e.

Everything decided is pure, so the strategy is small on purpose: **no fake timers, no mocks, no
jsdom.** The clock is a parameter, so time is just an argument.

### Unit (vitest) — the whole domain

Covers `phaseAt(elapsed, routine)`, `boundaries(routine)`, `cuesFor(routine)`, `elapsed(clock, now)`,
config clamping, prefs parse/validate. Nothing else.

`phaseAt` assertions:

1. Boundary exactness at `workMs - 1`, `workMs`, `workMs + 1`.
2. Table-driven (`it.each`) walk of all six Modes end to end, asserting the full Phase sequence.
3. The 30-minute drift walk (±50 ms Phases, ±30 ms cues).
4. Pomodoro's long break lands after round 4 and ends the Routine.

Config clamping is extracted into the pure layer precisely so it is covered here rather than through
the DOM.

### Component / DOM tests: none

Playwright covers the UI. jsdom tests for a handful of steppers would be maintenance with no
bug-finding power.

### E2E (Playwright) — five, each guarding one decision

1. Tabata start → skip → done, using `page.clock` fast-forward (no app-side test hooks).
2. Reload mid-Routine resumes at the correct Phase.
3. Reload after completion opens Home — the discard rule (§5).
4. Offline: load, go offline, reload, app still works.
5. Manifest present and service worker registered.

### Deliberately untested

Audible output, vibration, Wake Lock acquisition, iOS audio-session behaviour, real
background/suspend timing. None is reachable from Playwright; mocking would only assert that the
mock was called. **A manual check on a real phone before shipping is the control.**

### Where it runs, and coverage

`pre-push` runs `pnpm check && pnpm test` (unit only — pushing must not take 90 seconds).
`pnpm test:e2e` is manual until CI exists. `@vitest/coverage-v8` reports via `pnpm test:coverage`.
Vitest enforces 90% global thresholds for statements, branches, functions, and lines; no higher target
is imposed because percentage chasing invites tests written for the number.

---

## 9. Non-goals

Out of scope. None of these is a gap to fill; each was decided against.

- **Accounts, multi-device sync, any server component** — single local user.
- **Online-only behaviour** beyond service-worker update on reconnect.
- **Routine history, stats, charts.**
- **i18n.**
- **Sets** — a second nesting level above Round. Ruled out of v1 as model complexity; revisit only
  if actually missed in the gym.
- **Named / saved presets** — v1 configures fresh each time. `lastUsed` is already the right shape:
  `Record<string, Routine & { name }>` under a different key, no migration.
- **AMRAP round tapping** — only worth it with history to write rounds to, and history is out of scope.
- **Tenths of a second on Crono** — dropped for readability across a room.
- **Per-Routine prepare countdown** — global preference for now; making it per-Routine is a model
  change, not a UI tweak.
- **Per-cue toggle matrix** — a settings screen nobody opens.
- **Recorded audio samples** — synthesised tones only, unless they prove inaudible in a noisy gym.
- **Voice cues** — a future speech **sink** behind the existing cue model; no engine change needed.
- **Manual theme toggle** — `prefers-color-scheme` only.
- **React islands** — none justified (§4).
- **Whole-Routine remaining time** — meaningless for Crono, unrequested.
- **Polyfills, UA sniffing, keepalive hacks** — the standing rule.
- **Hosting/deploy beyond local** — no backend, no analytics.

---

## 10. Open questions

Genuinely undecided. An implementer should raise these rather than assume.

- ~~**CI**~~ — resolved after the spec was written: CI workflow and
  Netlify site and timer.marcosgilf.com are closed. Vitest coverage thresholds gate `qa`; deploys are
  gated on a green `qa` job; e2e stays out of CI until tests exist; the
  app is live at `timer.marcosgilf.com`.
- **Default values for `Prefs`** — only `prepareMs` has a stated default (10s). Starting `muted`,
  `volume`, `ticks` and `vibrate` values are unspecified.
- ~~**Update-prompt UI**~~ — resolved: no update control. A waiting worker activates and reloads when any
  counter starts or restarts; the new build labels its bottom version **NEW vX.X.X** in green for current app session.
- **Install guidance copy for iOS** — decided that it must be static copy (no
  `beforeinstallprompt`), but not what it says or which screen hosts it.
- ~~**App name, iconography, favicon/manifest icon set, `theme_color`**~~ — resolved: app name
  `Timer`, `short_name` `Timer`, theme/background `#0b0b0c`, icons are `00:00`
  neon-red-on-black PNGs at 192/512 plus `apple-touch-icon`.
- **Source-file layout** (`src/lib/…` module names for the engine, cues, clock, storage) — undecided.
  The prototype keeps everything in one `.astro` file, which does not survive the split.
- **Exact `boundaries(routine)` signature** — named as a unit-test target but never specified.
