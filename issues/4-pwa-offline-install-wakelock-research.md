---
id: 4
title: PWA offline, install and Wake Lock — platform research
labels: [wayfinder:research]
parent: 0
blocked_by: []
assignee: marcosenrique.gil
state: open
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
