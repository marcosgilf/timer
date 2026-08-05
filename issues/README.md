# Issue tracker (local markdown)

One file per issue: `issues/<id>-<slug>.md`. Front matter holds state.

```yaml
---
id: 3
title: Human-readable name
labels: [wayfinder:map | wayfinder:research | wayfinder:prototype | wayfinder:grilling | wayfinder:task]
parent: 0            # map id, omit on the map itself
blocked_by: [1, 2]   # closed ids only count as unblocked
assignee:            # empty = unclaimed; set it to claim BEFORE working
state: open | closed
---
```

Body = `## Question`. Resolution appended as `## Resolution` on close.

Frontier (takeable now):

```sh
grep -l 'state: open' issues/*.md
```

then keep those whose `blocked_by` ids are all `state: closed` and whose `assignee` is empty.
