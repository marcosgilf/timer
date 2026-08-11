# GitHub repository IaC

Terraform-managed settings for `marcosgilf/timer`.

## What it manages

- Repository settings: description, visibility, merge strategy, delete branch on merge
- Feature toggles: Issues enabled, Projects disabled, Wiki disabled
- Vulnerability alerts
- Repository ruleset for `main`
- GitHub Actions credentials:
  - secret `NETLIFY_AUTH_TOKEN`
  - variable `NETLIFY_SITE_ID`
  - secret `RELEASE_PLEASE_TOKEN`

## Why `RELEASE_PLEASE_TOKEN` exists

Release Please failed with `GITHUB_TOKEN` because GitHub Actions was not allowed to create PRs. A
fine-grained PAT stored as `RELEASE_PLEASE_TOKEN` fixes two problems at once:

1. Release Please can open Release PRs.
2. Release PRs and GitHub Releases created by Release Please trigger workflows like a human-created PR
   or release. GitHub suppresses follow-up workflows when using `GITHUB_TOKEN`.

Required permissions for that PAT, scoped to `marcosgilf/timer`:

- Contents: Read and write
- Pull requests: Read and write
- Metadata: Read

The Terraform `github_token` (used to apply this module) needs broader repo administration:

- Administration: Read and write
- Secrets: Read and write
- Variables: Read and write
- Metadata: Read

## First-time setup

Create local `terraform.tfvars` (gitignored):

```hcl
github_token = "github_pat_..."

netlify_auth_token  = "nfp_..."
netlify_site_id     = "00000000-0000-0000-0000-000000000000"
release_please_token = "github_pat_..."
```

Initialize and import the existing repository and ruleset:

```sh
terraform -chdir=infra/github init
terraform -chdir=infra/github import github_repository.this timer
terraform -chdir=infra/github import github_repository_ruleset.main timer:20583655
```

Secrets and variables can be imported too, but it is usually simpler to let Terraform overwrite them
with the local `terraform.tfvars` values on first apply.

Preview and apply:

```sh
terraform -chdir=infra/github plan
terraform -chdir=infra/github apply
```

## Day to day

```sh
terraform -chdir=infra/github fmt -recursive
terraform -chdir=infra/github validate
terraform -chdir=infra/github plan
terraform -chdir=infra/github apply
```

## State

State is local and gitignored. Do not commit `terraform.tfstate`, `.terraform/` or `terraform.tfvars`.
