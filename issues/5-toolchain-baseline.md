---
id: 5
title: Toolchain baseline ported from b2b-wrk-esi
labels: [wayfinder:task]
parent: 0
blocked_by: []
assignee: marcosgilf
state: closed
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

## Resolution

Done in commit `938e0e9`. Hooks verified live on that commit (lint-staged ran, types checked).

Files added/changed:
- `.oxlintrc.json` — reference config plus `env.browser` and `ignorePatterns: [dist, .astro]`.
- `.oxfmtrc.json` — reference config plus `**/*.md` ignored, so oxfmt never rewrites `issues/` tickets.
- `.lintstagedrc.js` — JS/TS → `pnpm format` + project-wide `astro check`; `*.astro` → `oxlint --fix` + `astro check`.
- `vitest.config.ts` — `include: src/**/*.test.ts` (copied verbatim).
- `.husky/pre-commit` → `pnpm exec lint-staged`; `.husky/pre-push` → `pnpm check && pnpm test`.
- `.npmrc` — `min-release-age=7` (copied).
- `package.json` — `private: true`, scripts `test`, `test:watch`, `lint`, `format`, `check`, `check:types`, `prepare`.

Decisions and deviations from `b2b-wrk-esi`:
- **React not installed.** Notes say islands only where mandatory; no ticket has proven one yet.
  Adding it later is `astro add react`, one command — installing now would be speculative.
- **`check:types` is `astro check`, not `tsc --noEmit`** — `tsc` cannot parse `.astro` files.
  `@astrojs/check` added for this; `tsconfig.json` stays on `astro/tsconfigs/strict`, untouched.
- **`.lintstagedrc.js`** — JS/TS → `pnpm format` + project-wide `astro check`; `*.astro` → `oxlint --fix`
  + `astro check`.
- **oxlint lints `.astro`** (verified on 1.77.0: flags errors in both frontmatter and `<script>`, and
  `oxlint .` walks them without extra config). **oxfmt does not** — `.astro` files are excluded by its
  ignore rules, so nothing formats them today. Accepted: editor formatting + `astro check` cover it.
  Add `prettier` + `prettier-plugin-astro` only if template drift becomes annoying.
- **`output: 'static'` not set** — it is the Astro 7 default; the explicit line would be noise.
  It becomes a real decision only if an adapter appears (PWA research ticket).
- **Playwright not installed** — Testing strategy owns that decision; installing before it is decided
  would prejudge the e2e list.
- **Reference's `pre-commit` ran `pnpm format` on the whole repo before lint-staged; dropped.**
  lint-staged already formats staged files.
- **Skipped from reference:** `@vitest/coverage-v8` (no coverage bar set yet) and `npm-check-updates`
  (`pnpm outdated` covers it). `pnpm-workspace.yaml` kept as-is — pnpm uses it for `allowBuilds`.

Commands available now: `pnpm dev|build|check|check:types|lint|format|test|test:watch`.
`pnpm test` passes with no tests (`--passWithNoTests`); drop that flag once the engine has its
first test.
