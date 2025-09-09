variable "domain_name" {
  type = string
}

variable "certificate_arn" {
  type = string
}

variable "origin_domain" {
  description = "App Runner service domain or custom subdomain pointing to it"
  type        = string
}

variable "hosted_zone_id" {
  type = string
}


