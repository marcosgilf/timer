resource "github_repository" "this" {
  name        = var.repository_name
  description = "Track tasks, workouts or run pomodoros in a Progressive Web Application"
  visibility  = "public"

  # PR merge strategy: squash + rebase only, no merge commits.
  allow_squash_merge          = true
  allow_rebase_merge          = true
  allow_merge_commit          = false
  squash_merge_commit_title   = "PR_TITLE"
  squash_merge_commit_message = "COMMIT_MESSAGES"

  # Cleanup
  delete_branch_on_merge = true

  # Features
  has_issues   = true
  has_projects = false
  has_wiki     = false
}

resource "github_repository_vulnerability_alerts" "this" {
  repository = github_repository.this.name
}

resource "github_repository_ruleset" "main" {
  name        = "main"
  repository  = github_repository.this.name
  target      = "branch"
  enforcement = "active"

  conditions {
    ref_name {
      include = ["~DEFAULT_BRANCH"]
      exclude = []
    }
  }

  rules {
    deletion                = true
    non_fast_forward        = true
    required_linear_history = true

    pull_request {
      allowed_merge_methods             = ["squash", "rebase"]
      dismiss_stale_reviews_on_push     = false
      require_code_owner_review         = false
      require_last_push_approval        = false
      required_approving_review_count   = 0
      required_review_thread_resolution = false
    }

    required_status_checks {
      strict_required_status_checks_policy = true

      required_check {
        context = "qa / qa"
      }

      required_check {
        context = "deploy-dev / deploy-dev"
      }
    }
  }
}
