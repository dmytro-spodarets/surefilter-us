variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "placeholder_db_host" {
  description = "Temporary DB host for building DATABASE_URL SSM param (can be updated later)"
  type        = string
  default     = "localhost"
}


