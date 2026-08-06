---
id: 11
title: Where cue and app settings live in the UI
labels: [wayfinder:grilling]
parent: 0
blocked_by: []
assignee:
state: open
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
