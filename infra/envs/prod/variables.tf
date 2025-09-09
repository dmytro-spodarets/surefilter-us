variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "github_repo" {
  description = "owner/repo"
  type        = string
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


