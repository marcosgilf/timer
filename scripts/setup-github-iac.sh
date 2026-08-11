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

tfvar_value() {
  local key="$1"
  [[ -f "$tfvars" ]] || return 1
  python3 - "$tfvars" "$key" <<'PY'
import json
import re
import sys
from pathlib import Path

path, key = sys.argv[1:]
text = Path(path).read_text()
match = re.search(rf'^\s*{re.escape(key)}\s*=\s*("(?:\\.|[^"])*")\s*$', text, re.M)
if not match:
    sys.exit(1)
print(json.loads(match.group(1)))
PY
}

valid_github_repo_token() {
  local token="$1"
  [[ -n "$token" ]] || return 1
  GH_TOKEN="$token" gh api "repos/${repo_owner}/${repo_name}" >/dev/null 2>&1
}

valid_github_admin_token() {
  local token="$1"
  valid_github_repo_token "$token" && \
    GH_TOKEN="$token" gh api "repos/${repo_owner}/${repo_name}/rulesets" >/dev/null 2>&1
}

valid_netlify_token() {
  local token="$1"
  [[ -n "$token" ]] || return 1
  curl -fsS -H "Authorization: Bearer $token" https://api.netlify.com/api/v1/user >/dev/null 2>&1
}

valid_netlify_site() {
  local token="$1"
  local site_id="$2"
  [[ -n "$token" && -n "$site_id" ]] || return 1
  curl -fsS -H "Authorization: Bearer $token" "https://api.netlify.com/api/v1/sites/$site_id" >/dev/null 2>&1
}

value_from_env_or_tfvars() {
  local env_name="$1"
  local tf_name="$2"
  local value="${!env_name:-}"
  if [[ -z "$value" ]]; then
    value="$(tfvar_value "$tf_name" 2>/dev/null || true)"
  fi
  printf "%s" "$value"
}

need terraform
need python3
need gh
need curl

cat <<EOF
GitHub IaC bootstrap for ${repo_owner}/${repo_name}

You must create two fine-grained GitHub PATs manually. GitHub does not expose a safe API for scripts
to mint user PATs.

The script reuses existing values from $tfvars when they still validate. Expired or invalid tokens are
prompted again.

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
EOF

github_token="$(value_from_env_or_tfvars GITHUB_TOKEN_FOR_TERRAFORM github_token)"
release_please_token="$(value_from_env_or_tfvars RELEASE_PLEASE_TOKEN release_please_token)"
netlify_auth_token="$(value_from_env_or_tfvars NETLIFY_AUTH_TOKEN netlify_auth_token)"
netlify_site_id="$(value_from_env_or_tfvars NETLIFY_SITE_ID netlify_site_id)"

if valid_github_admin_token "$github_token"; then
  echo "Using existing github_token (valid)"
else
  echo "github_token missing or invalid/expired. Opening GitHub token settings..." >&2
  open_url "https://github.com/settings/personal-access-tokens/new"
  github_token="$(read_secret "github_token (Terraform PAT)")"
  valid_github_admin_token "$github_token" || {
    echo "github_token is invalid or lacks repository/ruleset access" >&2
    exit 1
  }
fi

if valid_github_repo_token "$release_please_token"; then
  echo "Using existing release_please_token (valid)"
else
  echo "release_please_token missing or invalid/expired. Opening GitHub token settings..." >&2
  open_url "https://github.com/settings/personal-access-tokens/new"
  release_please_token="$(read_secret "release_please_token")"
  valid_github_repo_token "$release_please_token" || {
    echo "release_please_token is invalid or expired" >&2
    exit 1
  }
fi

if valid_netlify_token "$netlify_auth_token"; then
  echo "Using existing netlify_auth_token (valid)"
else
  netlify_auth_token="$(read_secret "netlify_auth_token")"
  valid_netlify_token "$netlify_auth_token" || {
    echo "netlify_auth_token is invalid or expired" >&2
    exit 1
  }
fi

if valid_netlify_site "$netlify_auth_token" "$netlify_site_id"; then
  echo "Using existing netlify_site_id (valid for this Netlify token)"
else
  netlify_site_id="$(read_plain "netlify_site_id")"
  valid_netlify_site "$netlify_auth_token" "$netlify_site_id" || {
    echo "netlify_site_id is invalid or not accessible with netlify_auth_token" >&2
    exit 1
  }
fi

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

GH_TOKEN="$github_token" GITHUB_REPOSITORY="${repo_owner}/${repo_name}" TF_DIR="$tf_dir" ./scripts/import-github-infra.sh

terraform -chdir="$tf_dir" plan

cat <<EOF

Done. Review the plan above. If it is safe:

  terraform -chdir=$tf_dir apply

EOF
