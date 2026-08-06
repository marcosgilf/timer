---
id: 11
title: Where cue and app settings live in the UI
labels: [wayfinder:grilling]
parent: 0
blocked_by: []
assignee: marcosenrique.gil
state: closed
---

## Question

[Audio and haptic cue model](3-audio-and-haptic-cue-model.md) decided the adjustable set (master
mute, volume, `countdown-tick` toggle, vibration toggle) and
[Interval sequence model](1-interval-sequence-model.md) added the prepare-countdown duration as a
global preference. [Screen layout and config UI](6-screen-layout-and-config-ui.md) gave none of them
a home — the prototype has Home, Config, Running, Done and nothing else.

Decide:
- A settings screen reached from Home, a panel on the Config screen, or inline controls on the
  Running screen (mute is the one you want mid-Workout)?
- Does the Home screen need a nav bar after all (it is the only screen without one)?
- Is mute reachable in one tap while running, or is that what the device volume buttons are for?
- Does the prepare-countdown duration sit with cue settings, or on the Config screen where it is
  visible per Workout?

## Resolution

**A Settings screen, reached from a gear in the Home top nav.** Home gains the same nav shell as every
other screen — empty left corner, "Workout" centred, `⚙` right — and Settings uses that shell with `←`
back. One pattern, four screens, nothing new invented.

Rejected: a panel on each Config screen (repeats the same controls six times and mixes per-Workout
configuration with global preferences) and inline controls on the Running screen (steal space from the
digits, which [ticket 6](6-screen-layout-and-config-ui.md) protected deliberately).

### Contents — five controls and a reset

1. Master mute
2. Volume
3. `countdown-tick` toggle
4. Vibration toggle — hidden entirely where `navigator.vibrate` is absent (progressive enhancement)
5. Prepare-countdown duration

Plus **Reset everything** at the bottom, ghost style: clears both `localStorage` keys. One line of
code, and it saves clearing site data when preferences get weird.

No theme override — `prefers-color-scheme` only, and [ticket 7](7-persistence-model.md) stores nothing
for it.

### Mute while running: hardware buttons

No mute control on the Running screen. The phone's volume buttons work with the device face-down on
the floor, need no aiming and cost no pixels; in-app mute stays in Settings as the persistent
preference.

### Prepare duration stays global

It is a preference, not Workout configuration. If per-Workout prepare ever matters it becomes a field
on the Config screen and stops being a preference — a change to the model, not a UI tweak, so it goes
to the fog rather than being pre-solved here.
