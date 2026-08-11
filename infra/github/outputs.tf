output "repository_full_name" {
  value       = github_repository.this.full_name
  description = "Full repository name"
}

output "repository_html_url" {
  value       = github_repository.this.html_url
  description = "Repository URL"
}
