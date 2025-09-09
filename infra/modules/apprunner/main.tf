terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

resource "aws_apprunner_service" "this" {
  service_name = var.service_name

  source_configuration {
    authentication_configuration {
      access_role_arn = var.access_role_arn
    }

    image_repository {
      image_identifier      = "${var.ecr_repository_url}:release"
      image_repository_type = "ECR"
      image_configuration {
        port = "3000"
        runtime_environment_variables = {
          NODE_ENV              = "production"
          PORT                  = "3000"
          HOSTNAME              = "0.0.0.0"
          NEXT_PUBLIC_SITE_URL = var.public_site_url
          NEXTAUTH_URL         = var.public_site_url
        }
        runtime_environment_secrets = {
          DATABASE_URL = var.database_url_secret_arn
          NEXTAUTH_SECRET = var.nextauth_secret_arn
        }
      }
    }

    auto_deployments_enabled = false
  }

  network_configuration {
    egress_configuration {
      egress_type = "DEFAULT"
    }
    ingress_configuration {
      is_publicly_accessible = true
    }
  }

  health_check_configuration {
    protocol               = "HTTP"
    path                   = "/api/health"
    interval               = 5
    healthy_threshold      = 1
    unhealthy_threshold    = 3
    timeout                = 2
  }

  instance_configuration {
    cpu    = var.cpu
    memory = var.memory
    instance_role_arn = var.instance_role_arn
  }
}

output "service_arn" {
  value = aws_apprunner_service.this.arn
}

output "service_url" {
  value = aws_apprunner_service.this.service_url
}


