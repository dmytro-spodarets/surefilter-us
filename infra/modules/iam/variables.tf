// OIDC inputs removed; static credentials are used in CI

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


