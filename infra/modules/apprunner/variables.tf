variable "service_name" {
  type = string
}

variable "ecr_repository_url" {
  type = string
}

variable "database_url_secret_arn" {
  type = string
}

variable "nextauth_secret_arn" {
  description = "Secret ARN for NEXTAUTH_SECRET"
  type        = string
}

variable "public_site_url" {
  description = "Public URL used by the app for absolute links and SEO"
  type        = string
}

variable "instance_role_arn" {
  type = string
}

variable "access_role_arn" {
  type = string
}

variable "cpu" {
  type    = string
  default = "1024"
}

variable "memory" {
  type    = string
  default = "2048"
}


