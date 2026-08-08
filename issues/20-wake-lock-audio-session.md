---
id: 20
title: Screen stays awake
labels: [build:slice]
blocked_by: [16, 19]
assignee:
state: open
---

## What to build

Put the phone on the floor and the screen no longer sleeps mid-Routine, so the digits stay readable
and the cues keep firing. Where the platform cannot do that, the app says so in one line instead of
failing quietly.

Every capability here is progressive enhancement: feature-detected, no-op when absent, and the app
stays fully correct without any of it. See [iOS background audio](10-ios-background-audio.md).

## Acceptance criteria

- [ ] A Wake Lock is acquired while a Routine runs and released on Done, Quit and pause
- [ ] The lock is reacquired on `visibilitychange` → visible, since the platform drops it when hidden
- [ ] Where Wake Lock is unavailable (installed iOS web apps below 18.4), the Running screen shows
      "Screen may sleep — keep it awake for sound"
- [ ] `navigator.audioSession.type` is set to `"transient"` while running and restored to `"auto"` on
      Done/Quit, so the user's music ducks for a cue rather than being taken over
- [ ] No silent-video or other keepalive hacks
- [ ] Returning after the device slept jumps to the correct Phase and drops missed cues rather than
      replaying them
- [ ] Verified on a real iOS device and a real Android device; results noted in the ticket

## Blocked by

- 16 — Cues you can hear
- 19 — Installable and offline
