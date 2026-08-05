---
id: 5
title: Toolchain baseline ported from b2b-wrk-esi
labels: [wayfinder:task]
parent: 0
blocked_by: []
assignee:
state: open
---

## Question

Pin the exact toolchain config the spec will hand off, using `../../IKEA/b2b-wrk-esi/` as
the reference — nothing to decide about the app itself, but later tickets assume it.

Do / decide:
- Astro config: `output: 'static'`, React integration present-but-unused vs added only when
  a ticket proves an island is mandatory.
- vitest config for a DOM-less engine plus any component tests; fake-timer strategy noted
  (real decision lives in Testing strategy).
- oxlint `.oxlintrc.json` + oxfmt `.oxfmtrc.json` copied and adjusted for Astro/React/JSX.
  Confirm oxlint handles `.astro` files or state what covers them instead.
- husky `pre-commit` (lint-staged) and `pre-push` (types + tests) equivalents; `.lintstagedrc.js`
  adapted so `tsc --noEmit` runs project-wide.
- `package.json` scripts to mirror: `lint`, `format`, `check`, `check:types`, `test`,
  `test:coverage`, `dependencies:check/update`.
- Node/pnpm versions and whether `pnpm-workspace.yaml` stays (repo currently has one).

Record the resulting file list and any deviation from the reference in the resolution.
