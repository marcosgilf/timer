# Scripts

Small repo automation. Keep scripts boring: one job per file, no hidden framework.

## `setup-github-iac.sh`

Interactive bootstrap for `infra/github`.

Use it once per machine or when credentials rotate:

```sh
./scripts/setup-github-iac.sh
```

What it does:

1. Prints the required GitHub PAT permissions and opens the PAT page.
2. Prompts for:
   - `github_token` — Terraform PAT
   - `release_please_token` — Release Please PAT
   - `netlify_auth_token`
   - `netlify_site_id`
3. Writes `infra/github/terraform.tfvars` with `0600` permissions.
4. Runs `terraform init`.
5. Calls `import-github-infra.sh`.
6. Runs `terraform plan`.

Why it does **not** create PATs: GitHub does not expose a safe API for scripts to mint user PATs.
Credential creation stays manual; the script automates everything after that.

Environment overrides, useful for password managers or CI experiments:

```sh
GITHUB_TOKEN_FOR_TERRAFORM=... \
RELEASE_PLEASE_TOKEN=... \
NETLIFY_AUTH_TOKEN=... \
NETLIFY_SITE_ID=... \
./scripts/setup-github-iac.sh
```

## `import-github-infra.sh`

Non-interactive import of the existing GitHub repo resources into the current Terraform state.
Used by GitHub Actions before plan/apply, and by `setup-github-iac.sh` locally.

```sh
./scripts/import-github-infra.sh
```

Imports if missing:

- `github_repository.this`
- `github_repository_ruleset.main`
- `github_repository_vulnerability_alerts.this`
- `github_actions_secret.netlify_auth_token`
- `github_actions_secret.release_please_token`
- `github_actions_variable.netlify_site_id`

Inputs:

- `GITHUB_REPOSITORY` (default `marcosgilf/timer`)
- `TF_DIR` (default `infra/github`)
- `GH_TOKEN` must be available for `gh api` in CI. Locally, `gh auth login` is enough.

Why this script exists: the repo uses local/ephemeral Terraform state for now. Importing each run keeps
the workflow simple without adding Terraform Cloud or a state bucket. If this grows, move to remote
state and delete the import step.
