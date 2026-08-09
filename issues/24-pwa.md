---
id: 24
title: Installable and offline
labels: [build:slice]
blocked_by: [23]
assignee:
state: open
---

## What to build

The Chrono becomes a real app: installable to the home screen, opening full-screen without browser
chrome, and working with no network at all. Deploying a new version offers a reload rather than
swapping the app out while it is running.

Platform facts, with citations and version numbers, are on the `research/pwa-platform` branch:
`@vite-pwa/astro@1.2.0` builds correctly on Astro 7 despite its peer range, `workbox-window` must be
an explicit devDependency, and nothing is injected into the HTML for you.

## Acceptance criteria

- [ ] `manifest.webmanifest` with name, short_name, 192px and 512px icons, `start_url`,
      `display: standalone` and `theme_color`; `apple-touch-icon` present, since iOS prefers it
- [ ] Installs on Android and adds to the home screen on iOS
- [ ] Load the app, go offline, reload — it still works
- [ ] `registerType: 'prompt'`: a new version offers a reload and never auto-reloads a running Routine
- [ ] The app name, icon set and `theme_color` are chosen and recorded in `docs/spec.md`
- [ ] Lighthouse (or equivalent) reports the app as installable

Out of this slice on purpose: Wake Lock, audio session, iOS install-guidance copy, and any offline
storage of user data — there is no user data yet.
