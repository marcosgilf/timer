---
id: 16
title: Cues you can hear
labels: [build:slice]
blocked_by: [14]
assignee:
state: open
---

## What to build

The timer becomes usable without looking at it: a tick for each of the last three seconds of a Phase,
a tone when work or rest begins (high for work, low for rest), a marker at the final round, and a
distinct figure at the end. Vibration accompanies them on devices that support it.

Cues are data — `cuesFor(routine)` returns `{ at, kind }[]` and dumb sinks render them. See
[Audio and haptic cue model](3-audio-and-haptic-cue-model.md) and
[iOS background audio](10-ios-background-audio.md).

## Acceptance criteria

- [ ] Tones are generated with `OscillatorNode`; no audio files are shipped
- [ ] All of the current Phase's cues are scheduled on `AudioContext.currentTime` when the Phase starts
- [ ] Pause, resume, skip and back all cancel and reschedule through one `reschedule(elapsed)` function
- [ ] The `AudioContext` is created and resumed on the Start tap and resumed again on
      `visibilitychange`; if it stays suspended a "tap to enable sound" affordance appears
- [ ] Vibration fires where `navigator.vibrate` exists and is skipped silently where it does not
- [ ] `cuesFor` is unit-tested; the audio sink is not
- [ ] Verified by ear on a real phone

## Blocked by

- 14 — Countdown, end to end
