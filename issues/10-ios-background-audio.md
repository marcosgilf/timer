---
id: 10
title: iOS background audio — audio session and lookahead horizon
labels: [wayfinder:grilling]
parent: 0
blocked_by: []
assignee: marcosgilf
state: closed
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

## Resolution

**Everything here is progressive enhancement: the app is fully correct with none of it.** The
baseline is a timer that keeps perfect time from `Date.now()` and beeps while visible. Each layer
below is feature-detected, adds capability where present, and is a no-op where absent — no polyfills,
no UA sniffing, no hacks.

| Layer | Detect | Present | Absent |
|---|---|---|---|
| Baseline | — | accurate time, visible cues | — |
| Audio session | `"audioSession" in navigator` | `type = "transient"` while running | no-op (Chrome, Firefox) |
| Wake Lock | `"wakeLock" in navigator` | screen held during a Workout | note on Running screen |
| Vibration | `"vibrate" in navigator` | haptics per [ticket 3](3-audio-and-haptic-cue-model.md) | toggle hidden |

### Audio session: `"transient"`, not `"playback"`

`"playback"` survives backgrounding but **takes over from the user's music** — and training with
music is the normal case. `"transient"` ducks other audio for the beep and hands it straight back,
which is exactly what a cue is. Set on Start, restored to `"auto"` on Done/Quit. Cost of the choice:
no guaranteed background survival on iOS — accepted, because killing someone's playlist to beep is
worse than a missed beep with the screen off.

### Lookahead: one Phase, not one second

Ticket 2's ~1 s horizon does not survive a 5-minute pomodoro break. **At each Phase start, schedule
every cue of that Phase** on `AudioContext.currentTime`. A Phase is the natural unit: its cues are
fully known when it begins, and it bounds how much must be cancelled. Scheduling the whole Workout
up front would mean cancelling hundreds of nodes on every skip.

Scheduled `OscillatorNode`s are kept in an array; **any Clock mutation** (pause, resume, skip, back)
calls one `reschedule(elapsed)` that stops them all and re-books from the new elapsed. Same function
as entering a Phase — one code path, four call sites.

### Android needs no special case

Chromium freezes a silent backgrounded page ~32 s after audio stops, dropping timers to 1/min. Cues
are already booked on the audio clock before that, and the display recomputes from `Date.now()` on
resume. Nothing to write.

### iOS < 18.4: no Wake Lock in installed web apps

Feature-detect; when absent, a one-line note on the Running screen: *"Screen may sleep — keep it awake
for sound."* **No silent-video keepalive hacks** — battery cost, folklore, and they break.

### Effect on ticket 2

"Drop missed cues on wake" stands, but narrows: with phase-length scheduling, cues fire from the audio
clock even while hidden. The drop rule now only covers a real device suspend, where nothing helps.
