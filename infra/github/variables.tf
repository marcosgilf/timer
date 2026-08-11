variable "github_token" {
  type        = string
  description = "Fine-grained GitHub PAT used by Terraform to manage the repository"
  sensitive   = true
}

variable "github_owner" {
  type        = string
  description = "GitHub owner"
  default     = "marcosgilf"
}

variable "repository_name" {
  type        = string
  description = "GitHub repository name"
  default     = "timer"
}

variable "netlify_auth_token" {
  type        = string
  description = "Netlify PAT stored as NETLIFY_AUTH_TOKEN Actions secret"
  sensitive   = true
}

variable "netlify_site_id" {
  type        = string
  description = "Netlify site API ID stored as NETLIFY_SITE_ID Actions variable"
}

variable "release_please_token" {
  type        = string
  description = "GitHub PAT stored as RELEASE_PLEASE_TOKEN Actions secret, so Release Please PRs trigger CI"
  sensitive   = true
}
