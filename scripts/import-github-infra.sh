#!/usr/bin/env bash
# Import existing GitHub resources into Terraform state if they are present.
# Missing secrets/variables are skipped: Terraform will create them from TF_VAR_* on apply.
set -euo pipefail

tf_dir="${TF_DIR:-infra/github}"
repo="${GITHUB_REPOSITORY:-marcosgilf/timer}"
repo_name="${repo##*/}"

state_has() {
  terraform -chdir="$tf_dir" state list 2>/dev/null | grep -qx "$1"
}

import_if_missing() {
  local address="$1"
  local id="$2"
  if state_has "$address"; then
    echo "$address already in state"
  else
    terraform -chdir="$tf_dir" import "$address" "$id"
  fi
}

import_if_exists() {
  local address="$1"
  local id="$2"
  local check_path="$3"

  if state_has "$address"; then
    echo "$address already in state"
  elif gh api "$check_path" >/dev/null 2>&1; then
    terraform -chdir="$tf_dir" import "$address" "$id"
  else
    echo "$address not found in GitHub; Terraform will create it on apply"
  fi
}

import_if_missing github_repository.this "$repo_name"

ruleset_id="$(gh api "repos/${repo}/rulesets" --jq '.[] | select(.name == "main" and .target == "branch") | .id' | head -1)"
if [[ -z "$ruleset_id" ]]; then
  echo "main branch ruleset not found in ${repo}; Terraform will create it on apply" >&2
else
  import_if_missing github_repository_ruleset.main "${repo_name}:${ruleset_id}"
fi

import_if_exists github_repository_vulnerability_alerts.this "$repo_name" "repos/${repo}/vulnerability-alerts"
import_if_exists github_actions_secret.netlify_auth_token "${repo_name}:NETLIFY_AUTH_TOKEN" "repos/${repo}/actions/secrets/NETLIFY_AUTH_TOKEN"
import_if_exists github_actions_secret.release_please_token "${repo_name}:RELEASE_PLEASE_TOKEN" "repos/${repo}/actions/secrets/RELEASE_PLEASE_TOKEN"
import_if_exists github_actions_variable.netlify_site_id "${repo_name}:NETLIFY_SITE_ID" "repos/${repo}/actions/variables/NETLIFY_SITE_ID"
