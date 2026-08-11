#!/usr/bin/env bash
set -euo pipefail

repo_owner="${GITHUB_OWNER:-marcosgilf}"
repo_name="${GITHUB_REPOSITORY_NAME:-timer}"
tf_dir="infra/github"
tfvars="$tf_dir/terraform.tfvars"

open_url() {
  local url="$1"
  if command -v open >/dev/null 2>&1; then
    open "$url" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 || true
  fi
}

need() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

read_secret() {
  local name="$1"
  local value=""
  printf "%s: " "$name" >&2
  IFS= read -rs value
  printf "\n" >&2
  printf "%s" "$value"
}

read_plain() {
  local name="$1"
  local default="${2:-}"
  local value=""
  if [[ -n "$default" ]]; then
    printf "%s [%s]: " "$name" "$default" >&2
  else
    printf "%s: " "$name" >&2
  fi
  IFS= read -r value
  printf "%s" "${value:-$default}"
}

hcl_string() {
  python3 -c 'import json, sys; print(json.dumps(sys.argv[1]))' "$1"
}

need terraform
need python3
need gh

cat <<EOF
GitHub IaC bootstrap for ${repo_owner}/${repo_name}

You must create two fine-grained GitHub PATs manually. GitHub does not expose a safe API for scripts
to mint user PATs.

1. Terraform PAT (github_token)
   Repository: ${repo_owner}/${repo_name}
   Permissions:
   - Administration: Read and write
   - Secrets: Read and write
   - Variables: Read and write
   - Metadata: Read

2. Release Please PAT (release_please_token)
   Repository: ${repo_owner}/${repo_name}
   Permissions:
   - Contents: Read and write
   - Pull requests: Read and write
   - Metadata: Read

Opening GitHub token settings now...
EOF

open_url "https://github.com/settings/personal-access-tokens/new"

github_token="${GITHUB_TOKEN_FOR_TERRAFORM:-}"
release_please_token="${RELEASE_PLEASE_TOKEN:-}"
netlify_auth_token="${NETLIFY_AUTH_TOKEN:-}"
netlify_site_id="${NETLIFY_SITE_ID:-}"

if [[ -z "$github_token" ]]; then
  github_token="$(read_secret "github_token (Terraform PAT)")"
fi
if [[ -z "$release_please_token" ]]; then
  release_please_token="$(read_secret "release_please_token")"
fi
if [[ -z "$netlify_auth_token" ]]; then
  netlify_auth_token="$(read_secret "netlify_auth_token")"
fi
if [[ -z "$netlify_site_id" ]]; then
  netlify_site_id="$(read_plain "netlify_site_id")"
fi

for name in github_token release_please_token netlify_auth_token netlify_site_id; do
  if [[ -z "${!name}" ]]; then
    echo "$name is required" >&2
    exit 1
  fi
done

mkdir -p "$tf_dir"
umask 077
cat > "$tfvars" <<EOF
github_token = $(hcl_string "$github_token")

netlify_auth_token   = $(hcl_string "$netlify_auth_token")
netlify_site_id      = $(hcl_string "$netlify_site_id")
release_please_token = $(hcl_string "$release_please_token")
EOF
chmod 600 "$tfvars"
echo "Wrote $tfvars (0600)"

terraform -chdir="$tf_dir" init

GITHUB_REPOSITORY="${repo_owner}/${repo_name}" TF_DIR="$tf_dir" ./scripts/import-github-infra.sh

terraform -chdir="$tf_dir" plan

cat <<EOF

Done. Review the plan above. If it is safe:

  terraform -chdir=$tf_dir apply

EOF
