terraform {
  backend "local" {
    path = "terraform.tfstate"
  }

  required_version = ">= 1.10.6"
  required_providers {
    aws = {
      source  = "opentofu/aws"
      version = "6.12.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.5"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = "surefilter-local"
}


