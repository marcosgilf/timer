# Scripts

Small repo automation. Keep scripts boring: one job per file, no hidden framework.

## `setup-github-iac.sh`

Interactive bootstrap for `infra/github`.

Use it once per machine or when credentials rotate:

```sh
./scripts/setup-github-iac.sh
```

What it does:

1. Reads existing values from env vars or `infra/github/terraform.tfvars`.
2. Validates them:
   - GitHub tokens via GitHub API (repo access; Terraform token also checks ruleset access)
   - Netlify token via Netlify API
   - Netlify site id via Netlify API
3. Prompts only for values that are missing, expired or invalid.

Important: GitHub Actions secrets are write-only. The script can check whether a secret named
`NETLIFY_AUTH_TOKEN` exists, but it cannot read the secret value back from GitHub. If the value is not
in env vars or local `terraform.tfvars`, the script must ask for it again.
4. Writes `infra/github/terraform.tfvars` with `0600` permissions.
5. Runs `terraform init`.
6. Calls `import-github-infra.sh`.
7. Runs `terraform plan`.

Why it does **not** create PATs: GitHub does not expose a safe API for scripts to mint user PATs.
Credential creation stays manual; the script automates everything after that.

Environment overrides, useful for password managers or CI experiments. If valid, these skip prompts:

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

Imports if present, skips if missing so Terraform can create on apply:

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
