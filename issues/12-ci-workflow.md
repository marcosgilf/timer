---
id: 12
title: CI workflow
labels: [wayfinder:task]
parent: 0
blocked_by: []
assignee: marcosenrique.gil
state: closed
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

## Resolution

Remote now exists (`git@github.com:marcosgilf/timer.git`) and the deploy target is **Netlify**, so this
ticket absorbed the deployment decision that had been sitting in the map's fog.

Modelled on `../blog/`, translated from npm to pnpm.

### Files

- `.nvmrc` — `v22`, single source of the Node version for both workflows (`engines` stays `>=22.12.0`).
- `.github/workflows/ci.yml` — **one workflow, three jobs**, on PR and on push to `main`:
  - `check` — `pnpm check` → `pnpm test:coverage` → `pnpm build`; uploads `coverage/` (no gate) and
    `dist/` as artifacts.
  - `deploy-preview` — `needs: check`, pull requests only, downloads `dist/` and deploys to a Netlify
    alias `pr-<number>`, then sticky-comments the URL on the PR. Skipped on forks, where secrets are
    unavailable.
  - `deploy-production` — `needs: check`, push to `main` only, deploys the same artifact with `--prod`.

### Decisions

- **Deploy is a job, not a workflow.** A separate `deploy.yml` on `push` would run *in parallel* with
  CI and could ship a build whose tests were red. `needs: check` is the gate, expressed natively — no
  `workflow_run` indirection, no race.
- **Build once, deploy that artifact.** Preview and production both download the `dist/` produced by
  `check`, so what was tested is exactly what ships.
- **Repository-level** secret `NETLIFY_AUTH_TOKEN` and variable `NETLIFY_SITE_ID` — not environment
  scoped. An `environment:` block was tried and reverted: it buys approval gates this project does not
  want.
- **`packageManager` in `package.json`** — `pnpm/action-setup@v4` refuses to guess a version. Declared
  once there rather than pinned in the workflow, so corepack honours it locally too.
- **Signal, not gate.** Solo project pushing to `main`; branch protection would only lock the author out
  of their own repo. Husky (`pre-push` → `pnpm check && pnpm test`) is the real guard; CI is the second
  opinion on a clean machine.
- **No Playwright in CI.** [Testing strategy](8-testing-strategy.md) left e2e manual, and there are no
  e2e tests yet; adding a browser download to every push for zero tests is pure cost. Revisit when the
  five e2e tests exist.
- **No `netlify.toml` and no adapter.** Output is static (Astro default), so Netlify only receives
  `dist/`. The blog needs `@astrojs/netlify` because it is `output: 'server'`; this project does not.

### Manual step for the human

Create the Netlify site and set `NETLIFY_AUTH_TOKEN` (secret) and `NETLIFY_SITE_ID` (variable) on the
GitHub repo. Until then `deploy.yml` will fail on `main` — CI itself is unaffected.

Verified locally: `pnpm build` → 1 page built; `pnpm test:coverage` → passes with no tests.
