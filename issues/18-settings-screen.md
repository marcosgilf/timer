---
id: 18
title: Settings screen
labels: [build:slice]
blocked_by: [16, 17]
assignee:
state: open
---

## What to build

A `⚙` appears in a new Home top nav and opens a Settings screen where sound and haptics are tuned:
master mute, volume, a toggle for the last-three-seconds ticks, a vibration toggle, and the
prepare-countdown duration. A Reset everything button clears stored preferences and any session.

Choices persist immediately and apply to the next Routine. See
[Where cue and app settings live in the UI](11-settings-ui-home.md).

Settles the `Prefs` defaults Open question in [docs/spec.md](../docs/spec.md) §10.

## Acceptance criteria

- [ ] Home gains the shared top nav (empty left, title centred, `⚙` right); Settings uses it with `←`
- [ ] Five controls present: mute, volume, ticks toggle, vibration toggle, prepare duration
- [ ] The vibration toggle is hidden entirely where `navigator.vibrate` is absent
- [ ] Reset everything clears both `localStorage` keys and returns to defaults
- [ ] Changes are written to `timer:prefs:v1` and survive reload
- [ ] Starting values for `muted`, `volume`, `ticks` and `vibrate` are chosen, recorded in
      `docs/spec.md`, and the Open question struck out
- [ ] No mute control appears on the Running screen — hardware volume buttons cover that

## Blocked by

- 16 — Cues you can hear
- 17 — It remembers
