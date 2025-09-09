variable "github_oidc_role_name" {
  description = "IAM role name for GitHub Actions OIDC"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository in format owner/repo"
  type        = string
}

variable "apprunner_task_role_name" {
  description = "IAM role for App Runner to pull from ECR and read Secrets Manager"
  type        = string
}

variable "apprunner_instance_role_name" {
  description = "IAM instance role for App Runner to access Secrets Manager at runtime"
  type        = string
}

variable "secretsmanager_secret_arns" {
  description = "List of Secrets Manager secret ARNs accessible by App Runner"
  type        = list(string)
  default     = []
}


