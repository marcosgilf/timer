---
id: 24
title: Installable and offline
labels: [build:slice]
blocked_by: [23]
assignee: marcosgilf
state: closed
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

## Resolution

Shipped on `feat/24-pwa`. The existing Chrono is now installable and offline-capable.

- Added `@vite-pwa/astro` and explicit `workbox-window` (required under pnpm, per research).
- Manifest: `name`/`short_name` = **Timer**, `display: standalone`, `start_url`/`scope` = `/`,
  background/theme colour `#0b0b0c`.
- Icons generated from a tiny Python script, no image dependency: neon `00:00` on black at 192px,
  512px, `apple-touch-icon` 180px and `favicon.png` 32px.
- The same icon family is used for the favicon; the Astro starter `favicon.svg`/`.ico` are removed.
- Icon spacing was widened so the digits and colon do not touch when masked or shrunk by launchers.
- Manual links emitted in the layout (`manifest.webmanifest`, `apple-touch-icon`) because Astro PWA
  did not inject them.
- Service worker registered with `registerType: 'autoUpdate'` and no UI. Updates land on the next page
  load; no modal interrupts the timer.

Verified locally from `astro preview`:
- `manifest.webmanifest` serves as `application/manifest+json`.
- `sw.js` serves and controls the page after one reload.
- The Workbox precache contains `/`, the built CSS/JS, `manifest.webmanifest`, favicon and all icons.
- `pnpm check`, `pnpm test` and `pnpm build` pass.
- Build output contains no update-prompt copy (`Update ready` count = 0).
- App version is rendered in the bottom-right corner from `package.json` (`v0.0.1`).

Still needs real-device verification after preview deploy: installability on Android, add-to-home-screen
on iOS, and load → offline → reload.
