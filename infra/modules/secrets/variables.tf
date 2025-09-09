variable "secret_name" {
  type        = string
  description = "Name of the secret"
}

variable "host" {
  type = string
}

variable "username" {
  type = string
}

variable "password" {
  type      = string
  sensitive = true
}

variable "db_name" {
  type = string
}


