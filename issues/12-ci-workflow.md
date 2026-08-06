---
id: 12
title: CI workflow
labels: [wayfinder:task]
parent: 0
blocked_by: []
assignee:
state: open
---

## Question

[Testing strategy](8-testing-strategy.md) put unit tests on `pre-push` and left e2e manual, on the
grounds that CI belongs in its own ticket. The repo has no `.github/workflows` at all.

Decide and do:
- GitHub Actions workflow running `pnpm check` + `pnpm test` on push/PR, and `pnpm test:e2e` where
  the Playwright browser download cost is worth it.
- Node/pnpm versions and cache strategy, matching `engines` in `package.json`.
- Whether coverage output is uploaded as an artifact (there is no gate by decision).
- Whether this repo has PRs at all, or pushes straight to `main` as a solo project — which decides
  whether the workflow is a gate or just a signal.

Not a blocker for the spec: the app ships without CI.
