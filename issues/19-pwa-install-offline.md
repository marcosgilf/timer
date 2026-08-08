---
id: 19
title: Installable and offline
labels: [build:slice]
blocked_by: [14]
assignee:
state: open
---

## What to build

The timer installs to the home screen and runs with no network at all. Returning after a new version
has deployed offers a prompt to reload rather than swapping the app out mid-Routine.

Uses `@vite-pwa/astro@1.2.0`, which builds correctly on Astro 7 despite its peer range — see
[PWA platform research](4-pwa-offline-install-wakelock-research.md) for the two gotchas
(`workbox-window` must be an explicit devDependency; nothing is injected into the HTML for you).

Settles the app name / icons / `theme_color` / iOS install copy Open questions in
[docs/spec.md](../docs/spec.md) §10 — the manifest cannot be written without them.

## Acceptance criteria

- [ ] `manifest.webmanifest` with name, short_name, 192px and 512px icons, `start_url`,
      `display: standalone`, `theme_color`; `apple-touch-icon` present since iOS prefers it
- [ ] Installable on Android (Chromium install criteria met) and add-to-home-screen works on iOS
- [ ] Loading the app, going offline and reloading still works
- [ ] `registerType: 'prompt'` — a new version shows a reload prompt; never auto-reloads
- [ ] The update prompt has a defined place in the screen shell and cannot appear mid-Routine
      without the user choosing it
- [ ] Static install guidance copy for iOS is written (there is no `beforeinstallprompt`)
- [ ] `/// <reference types="vite-plugin-pwa/client" />` added so virtual modules type-check
- [ ] Deployed preview passes an installability check

## Blocked by

- 14 — Countdown, end to end
