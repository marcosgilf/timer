---
id: 16
title: Cues you can hear
labels: [build:slice]
blocked_by: [14]
assignee:
state: open
---

## What to build

The timer becomes usable without looking at it: a tone when work or rest begins (high for work, low
for rest), a tick for each of the last three seconds of a Phase, and a distinct figure at the end.

Cues are data — `cuesFor(routine)` returns `{ at, kind }[]` and a dumb sink renders them. See
[Audio and haptic cue model](3-audio-and-haptic-cue-model.md) and
[iOS background audio](10-ios-background-audio.md).

## Acceptance criteria

- [ ] Tones generated with `OscillatorNode`; no audio files shipped
- [ ] All of the current Phase's cues are scheduled on `AudioContext.currentTime` at Phase start
- [ ] Pause, resume, skip and back cancel and reschedule through one `reschedule(elapsed)` function
- [ ] The `AudioContext` is created and resumed on the Start tap and resumed again on
      `visibilitychange`; if it stays suspended, a "tap to enable sound" affordance appears
- [ ] `cuesFor` is unit-tested; the audio sink is not
- [ ] Verified by ear on a real phone

Out of this slice on purpose: the `final-round` marker cue (add it when a long Tabata proves it
useful), vibration ([ticket 20](20-wake-lock-audio-session.md) owns the platform-capability layer),
and cue settings — volume and mute arrive with [ticket 18](18-settings-screen.md); until then cues
simply play.

## Blocked by

- 14 — Countdown, end to end
