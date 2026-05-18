# App Runner deployment version.
# This is the only place to bump the production image tag — `tofu apply`
# picks it up and rolls out the new ECR image.
#
# CI override (no edit needed):
#   tofu apply -var="app_runner_image_version=v1.3.0"
#
# Or commit a new default:
#   sed -i '' 's/default = "v[0-9.]*"/default = "v1.3.0"/' image-versions.tf

variable "app_runner_image_version" {
  description = "ECR image tag deployed to App Runner (e.g. v1.2.0)"
  type        = string
  default     = "v1.3.3"
}
