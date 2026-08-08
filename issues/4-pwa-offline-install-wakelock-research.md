---
id: 4
title: PWA offline, install and Wake Lock — platform research
labels: [wayfinder:research]
parent: 0
blocked_by: []
assignee: marcosgilf
state: closed
---

## Question

What does the platform actually allow, so later decisions rest on facts and not hope?

Research and report:
- Astro + PWA: `@vite-pwa/astro` vs hand-written service worker for a fully static site.
  Current versions, Astro 7 compatibility, config surface, size cost.
- Manifest requirements for installability (icons, `display: standalone`, `orientation`,
  `theme_color`) and iOS Safari's deviations (apple-touch-icon, no `beforeinstallprompt`,
  add-to-home-screen only).
- Offline: precache-everything strategy for a static app with no API. Update-on-reconnect
  flow and how the user is told a new version is ready.
- Screen Wake Lock API: browser support (iOS Safari 16.4+?), whether it survives tab switch,
  how to reacquire on `visibilitychange`, and the fallback for unsupported browsers.
- Background timer/audio reality per platform: what happens to WebAudio and timers when the
  screen sleeps or the PWA is backgrounded on iOS vs Android.
- Whether anything here forces a React island.

Capture findings on a throwaway `research/pwa-platform` branch; link it from the resolution.

## Resolution

Full findings, with citations and version numbers, live in `research/pwa-platform.md` on the
throwaway branch **`research/pwa-platform`** (commit `3144d27`). Read it there:
`git show research/pwa-platform:research/pwa-platform.md`. Summary of the load-bearing facts:

### Astro + PWA

`@vite-pwa/astro@1.2.0` (peer range stops at `astro ^5`; [#72](https://github.com/vite-pwa/astro/issues/72)
and [#74](https://github.com/vite-pwa/astro/issues/74) open, [#73](https://github.com/vite-pwa/astro/pull/73)
closed unmerged) **nonetheless builds correctly on `astro@7.1.6`** — verified by running a build:
correct `sw.js`, workbox runtime, `manifest.webmanifest`, and a precache manifest with
`index.html` rewritten to `/`. pnpm installs it with a peer *warning*, not an error.

Two build-verified gotchas: (1) nothing is injected into the HTML — you must emit
`pwaInfo.webManifest.linkTag` from `virtual:pwa-info` and call `registerSW()` from
`virtual:pwa-register` yourself (upstream documents exactly this for Astro); (2) `workbox-window`
must be an explicit devDependency under pnpm, or the build fails with
`Rolldown failed to resolve import "workbox-window"`.

Measured cost: 1.3 KB `sw.js` + 15 KB workbox (SW scope only), 1.27 KB gzip on the page.
A hand-written SW is viable but must generate a hashed precache manifest itself — which is the
only thing the plugin is being paid for. Use `registerType: 'prompt'`, never `autoUpdate`: an
auto-reload mid-Workout would destroy the running clock.

### Install and manifest

Chromium requires `name`/`short_name`, **192px and 512px** icons, `start_url`, `display`, no
`prefer_related_applications`, over HTTPS/localhost. `theme_color` and `orientation` are
presentation, not installability. iOS: Add-to-Home-Screen only, **no `beforeinstallprompt`** (so
install guidance is static copy); `display: standalone|fullscreen` is what makes it a real web app
instead of a bookmark; manifest icons work since iOS 15.4 but **`apple-touch-icon` takes precedence**.

### Screen Wake Lock — the ticket's guess was wrong

Spec: the lock is **released on `visibilitychange` → hidden**, and `request()` rejects while hidden;
reacquire on return to visible. Support is Chrome 84, Firefox 126, Safari macOS 16.4, and
**iOS Safari 18.4** — not 16.4. caniuse says 16.4; MDN BCD is right and explains why: iOS 16.4–18.3
is partial, *"Does not work in standalone Home Screen Web Apps"*
([WebKit bug 254545](https://bugs.webkit.org/show_bug.cgi?id=254545), confirmed by WebKit in comment 32).
**The installed-iOS-web-app case this project targets has no wake lock below iOS 18.4.** Fallback:
feature-detect, let the screen sleep, recompute from `Date.now()` on wake. No silent-video hacks.

### The two facts tickets 1 and 2 were waiting on

**(a) `performance.now()` does not advance while a device is suspended — on either platform.**
WebKit's `Performance::now()` uses `MonotonicTime` = `mach_absolute_time()`, which Darwin documents
as not incrementing while asleep (WebKit keeps a *separate* `ContinuousTime` class for the
sleep-aware clock). Chromium's `TimeTicks` is `CLOCK_MONOTONIC` on Android, which Linux documents as
not counting suspended time, and `mach_absolute_time()` on Apple. Ticket 2's `Date.now()` decision is
confirmed as the only correct elapsed-time source, and its footnote is now a fact.

**(b) A scheduled WebAudio tone fires while hidden on Android, but not while backgrounded on iOS.**
Chromium keeps the AudioContext running for hidden frames by default
(`media-playback-while-not-visible` permission policy) and a page cannot freeze while audio is
playing — but audibility decays after 2 s of silence plus a 30 s grace, so ~32 s into a silent phase
a backgrounded page becomes freezable and its timers drop to 1/min. WebKit **interrupts** the
AudioContext on entering background (state `"interrupted"`, `currentTime` stops) unless
`navigator.audioSession.type` is `"playback"`/`"play-and-record"` (DOM Audio Session, Safari 16.4+,
Safari-only). So on iOS, cues are missed by default — ticket 2's "drop missed cues on wake" is not a
corner case, it is the normal iOS path — and ticket 3 must decide whether to claim a playback audio
session. Consequence for the lookahead: a ~1 s horizon does not cover a 5-minute pomodoro break with
the screen off; either the wake lock holds the page visible, or the lookahead must cover the whole
silent phase.

### React island?

**No.** Registration, the update prompt, wake lock, audio session and haptics are all plain DOM APIs,
and upstream's Astro update-prompt example is a plain `.astro` component with a `<script>`. Only cost:
add `/// <reference types="vite-plugin-pwa/client" />` to `src/env.d.ts` for the virtual-module types.
