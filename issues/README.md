# Issue tracker (local markdown)

One file per issue: `issues/<id>-<slug>.md`. Front matter holds state.

```yaml
---
id: 3
title: Human-readable name
labels: [wayfinder:map | wayfinder:research | wayfinder:prototype | wayfinder:grilling | wayfinder:task | build:slice]
parent: 0            # map id, omit on the map itself and on build slices
blocked_by: [1, 2]   # closed ids only count as unblocked
assignee:            # empty = unclaimed; set it to claim BEFORE working
state: open | closed
---
```

Two kinds of ticket live here:

- **`wayfinder:*`** — decision tickets. Body is `## Question`, resolution appended as `## Resolution`
  on close. Children of the map, `0-workout-timer-pwa-spec.md`. The map is complete; these are the
  record of why the app is the way it is.
- **`build:slice`** — build tickets, sliced from `docs/spec.md`. Body is `## What to build` +
  `## Acceptance criteria` + `## Blocked by`. Each is a tracer bullet: a narrow but complete path from
  domain to screen, demoable on its own, sized for one session. No parent.

Frontier (takeable now):

```sh
grep -l 'state: open' issues/*.md
```

then keep those whose `blocked_by` ids are all `state: closed` and whose `assignee` is empty.
