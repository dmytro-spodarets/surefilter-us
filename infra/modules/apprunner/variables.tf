variable "service_name" {
  type = string
}

variable "ecr_repository_url" {
  type = string
}

variable "database_url_secret_arn" {
  type = string
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


