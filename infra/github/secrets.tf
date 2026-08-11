resource "github_actions_secret" "netlify_auth_token" {
  repository  = github_repository.this.name
  secret_name = "NETLIFY_AUTH_TOKEN"
  value       = var.netlify_auth_token
}

resource "github_actions_variable" "netlify_site_id" {
  repository    = github_repository.this.name
  variable_name = "NETLIFY_SITE_ID"
  value         = var.netlify_site_id
}

resource "github_actions_secret" "release_please_token" {
  repository  = github_repository.this.name
  secret_name = "RELEASE_PLEASE_TOKEN"
  value       = var.release_please_token
}
