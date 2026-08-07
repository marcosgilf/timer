---
id: 13
title: Netlify site and timer.marcosgilf.com
labels: [wayfinder:task]
parent: 0
blocked_by: [12]
assignee:
state: open
---

## Question

[CI workflow](12-ci-workflow.md) added `deploy.yml`, which runs `netlify-cli deploy --prod` against
`NETLIFY_SITE_ID`. Neither the site nor the subdomain exists yet, so every push to `main` fails that
job. Manual work only — the agent cannot click through Netlify or mint tokens.

Facts established: the `marcosgilf.com` zone is **Netlify DNS** (`dns{1..4}.p06.nsone.net`),
Terraform-managed in `../blog/infra/netlify`. Because the zone already lives in Netlify, connecting a
custom domain to a site in the **same Netlify team** creates the record automatically (type `NETLIFY`,
`managed: true`) — no Terraform change and no registrar change.

## Checklist for the human

1. Netlify → **Add new site** → import `marcosgilf/timer` (or `netlify sites:create --name timer`).
   Build command and publish directory can stay empty: `deploy.yml` builds and uploads `dist/` itself.
2. Site settings → **Domain management** → add custom domain `timer.marcosgilf.com`. Confirm the record
   appears in the `marcosgilf.com` Netlify DNS zone and that HTTPS is provisioned.
3. Copy the site's API ID → GitHub repo → **Settings → Secrets and variables → Actions**:
   - variable `NETLIFY_SITE_ID` = the site API ID
   - secret `NETLIFY_AUTH_TOKEN` = a Netlify personal access token
4. Push to `main` (or re-run the failed Deploy workflow) and confirm `timer.marcosgilf.com` serves the
   build.
5. Decide whether deploy previews on pull requests are wanted (`../blog/` has `deploy-preview.yml`) —
   **yes**: `ci.yml` deploys pull requests to the Netlify alias `pr-<number>` and comments the URL.
   Nothing extra to configure; it reuses the same site and credentials.

## Open decision

Does `../blog/infra/netlify` Terraform need a record for the subdomain, or is the auto-managed
`NETLIFY` record enough? Verify in the Netlify DNS zone after step 2; if Terraform would drift, add
the record there and note it in the blog repo instead.
