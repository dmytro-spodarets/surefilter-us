variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "github_repo" {
  description = "GitHub repository in format OWNER/REPO (e.g. spodarets/surefilter-us). Used for GitHub Actions OIDC trust."
  type        = string
  validation {
    condition     = can(regex("^[^/]+/[^/]+$", var.github_repo))
    error_message = "github_repo must be in format OWNER/REPO, e.g. 'spodarets/surefilter-us'."
  }
}

variable "public_ingress_cidrs" {
  type    = list(string)
  default = ["0.0.0.0/0"]
}

variable "vpc_id" {
  type    = string
  default = ""
}

variable "subnet_ids" {
  type    = list(string)
  default = []
}


