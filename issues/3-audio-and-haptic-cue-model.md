---
id: 3
title: Audio and haptic cue model
labels: [wayfinder:grilling]
parent: 0
blocked_by: [1]
assignee: marcosgilf
state: closed
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

## Resolution

**Cues are data, sinks are dumb.** `cuesFor(workout)` is a pure function returning `{ at, kind }[]`;
sinks (tone, vibration, later speech) render them. Pure part is unit-testable, sinks are trivial
enough not to be. This split is the only thing that makes voice cues cheap later.

### Catalogue

| Cue | Fires | Sound | Vibration (Android only) |
|---|---|---|---|
| `countdown-tick` | last 3s of any Phase, one blip per second | 660 Hz short blip | none (constant buzzing, battery) |
| `phase-start` — work | a `work` Phase begins | 880 Hz | `[200]` |
| `phase-start` — rest | a `rest` Phase begins | 440 Hz | `[200]` |
| `final-round` | last Round begins | marker tone | `[100,100,100]` |
| `workout-end` | Workout reaches `done` | three-note descending figure | `[400,200,400]` |

Pitch carries the meaning — high = work, low = rest — so the Phase is audible without looking.
EMOM needs no extra cue: each window start *is* a `phase-start`.

### Sound source

**Generated `OscillatorNode` tones.** Offline-first means every byte is precached; synthesised cues
add none, and per-kind pitch is free. Recorded samples → fog, only if tones prove inaudible in a
noisy gym.

### Configuration

Master mute, volume, one toggle for `countdown-tick`, one toggle for vibration. **No per-cue toggle
matrix** — a settings screen nobody opens. Persisted as preferences
([Persistence model](7-persistence-model.md)).

### Audio unlock — the failure mode that matters

iOS and Chrome start `AudioContext` suspended, and a suspended context is **silence with no error**.
So: create and `resume()` the context on the Start tap (a real user gesture), verify with a
zero-volume tone, and if it is still suspended show a one-line "tap to enable sound" affordance on
the running screen. `resume()` again on `visibilitychange` → visible, since iOS suspends on
backgrounding.

### Vibration

`navigator.vibrate` does not exist on iOS Safari, with no PWA workaround — haptics are Android-only,
permanently. Progressive enhancement: vibrate where supported, skip silently where not, and **hide**
the vibration toggle when the API is absent rather than showing a dead switch.

### Screen off

Silence while the screen is off is accepted: Wake Lock keeps the screen on during a Workout
([PWA research](4-pwa-offline-install-wakelock-research.md)). If that research finds audio dies on
backgrounded iOS regardless, it is a documented limitation, not a redesign.
