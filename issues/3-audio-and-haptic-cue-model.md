---
id: 3
title: Audio and haptic cue model
labels: [wayfinder:grilling]
parent: 0
blocked_by: [1]
assignee:
state: open
---

## Question

Which cues fire when, and how are they configured?

Decide:
- Cue catalogue and triggers: last-3-seconds ticks, phase change (work→rest), round start,
  final round, workout end, halfway (pomodoro?). Which are on by default.
- Sound source: WebAudio-generated tones (no assets, no bytes) vs audio files. Distinct
  pitches per phase kind?
- Configurability surface: master mute, per-cue toggle, volume, vibration on/off — and where
  that lives in the UI.
- iOS/Android constraint: audio needs a user-gesture unlock, and a suspended AudioContext
  kills cues. Where is unlock triggered, what happens if it fails silently?
- Vibration API patterns per cue; graceful degradation where unsupported (iOS Safari has no
  `navigator.vibrate`).
- Whether cues fire when screen is off / tab hidden, and if not, whether that is accepted.
- Extension point for voice cues later, without designing them now.
