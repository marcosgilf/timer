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
- `.github/workflows/ci.yml` — on PR and on push to `main`: `pnpm check` → `pnpm test:coverage` →
  `pnpm build`. Coverage uploaded as an artifact (`if-no-files-found: ignore`, since there are no tests
  yet); **no gate**, per [Testing strategy](8-testing-strategy.md).
- `.github/workflows/deploy.yml` — on push to `main`: build, then `netlify-cli deploy --prod --no-build
  --dir=dist`. `NETLIFY_AUTH_TOKEN` as a secret, `NETLIFY_SITE_ID` as a repo variable, same as the blog.
  `concurrency: deploy-production` with `cancel-in-progress` so two pushes cannot race a deploy.

### Decisions

- **One job, not three.** The blog splits lint/test and build; here they share an install and run in one
  job — the build takes ~1s and splitting only buys parallel red marks.
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
