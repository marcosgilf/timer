---
id: 10
title: iOS background audio — audio session and lookahead horizon
labels: [wayfinder:grilling]
parent: 0
blocked_by: []
assignee:
state: open
---

## Question

Surfaced by [PWA platform research](4-pwa-offline-install-wakelock-research.md), which invalidated two
assumptions in closed tickets 2 and 3:

1. WebKit **interrupts** the AudioContext on backgrounding (state `"interrupted"`, `currentTime`
   stops) unless `navigator.audioSession.type = "playback"` — Safari-only API, 16.4+.
2. Screen Wake Lock does not exist in installed iOS web apps below **18.4**, so "the screen stays on"
   cannot be assumed. A ~1 s cue lookahead therefore does not survive a 5-minute pomodoro break with
   the screen off.

Decide:
- Claim `navigator.audioSession.type = "playback"` on iOS, or accept silent cues when backgrounded?
  Claiming it makes the app behave like a media player (ducks other audio, keeps playing when
  backgrounded) — which may be wrong when the user is running Spotify during the Workout.
- Lookahead horizon: keep ~1 s, or schedule **every cue of the current Phase** on the audio clock at
  Phase start so a whole silent Phase is covered? What happens to scheduled cues on skip/pause
  (cancel and reschedule).
- Chromium's freeze rule: a silent backgrounded page becomes freezable ~32 s after audio goes silent.
  Does that change the answer on Android too?
- Whether the iOS < 18.4 no-wake-lock case needs any UI at all (a "keep your screen awake" note) or
  is silently accepted.
