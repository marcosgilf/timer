#!/usr/bin/env bash
set -euo pipefail

tf_dir="${TF_DIR:-infra/github}"
repo="${GITHUB_REPOSITORY:-marcosgilf/timer}"
repo_name="${repo##*/}"

import_if_missing() {
  local address="$1"
  local id="$2"
  if terraform -chdir="$tf_dir" state list 2>/dev/null | grep -qx "$address"; then
    echo "$address already in state"
  else
    terraform -chdir="$tf_dir" import "$address" "$id"
  fi
}

ruleset_id="$(gh api "repos/${repo}/rulesets" --jq '.[] | select(.name == "main" and .target == "branch") | .id' | head -1)"

import_if_missing github_repository.this "$repo_name"
import_if_missing github_repository_ruleset.main "${repo_name}:${ruleset_id}"
import_if_missing github_repository_vulnerability_alerts.this "$repo_name"
import_if_missing github_actions_secret.netlify_auth_token "${repo_name}:NETLIFY_AUTH_TOKEN"
import_if_missing github_actions_secret.release_please_token "${repo_name}:RELEASE_PLEASE_TOKEN"
import_if_missing github_actions_variable.netlify_site_id "${repo_name}:NETLIFY_SITE_ID"
