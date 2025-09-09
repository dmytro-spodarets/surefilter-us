terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

locals {
  database_url = "postgresql://${var.username}:${urlencode(var.password)}@${var.host}:5432/${var.db_name}?schema=public"
}

resource "aws_secretsmanager_secret" "database_url" {
  name        = var.secret_name
  description = "DATABASE_URL for surefilter"
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = local.database_url
}

output "secret_arn" {
  value = aws_secretsmanager_secret.database_url.arn
}


