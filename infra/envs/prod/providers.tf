terraform {
  backend "remote" {
    hostname     = "surefilter.scalr.io"
    organization = "env-v0ov5hse3tb6q91df"
    workspaces {
      name = "SureFilter"
    }
  }

  required_version = ">= 1.10.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}


