variable "aws_region" {
  type    = string
  default = "us-east-1"
}

// github_repo no longer required (CI uses static credentials)

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


