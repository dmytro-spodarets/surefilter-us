resource "aws_apprunner_service" "surefilter" {
  service_name = "surefilter-prod"

  source_configuration {
    auto_deployments_enabled = false

    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_ecr_role.arn
    }

    image_repository {
      image_identifier      = "${aws_ecr_repository.surefilter.repository_url}:v0.0.19"
      image_repository_type = "ECR"
      image_configuration {
        port = "3000"
        runtime_environment_variables = {
          NODE_ENV              = "production"
          PORT                  = "3000"
          HOSTNAME              = "0.0.0.0"
          NEXT_PUBLIC_SITE_URL = "https://new.surefilter.us"
          NEXTAUTH_URL         = "https://new.surefilter.us"
          ENFORCE_ORIGIN       = "0"
          # Allow Next.js Server Actions behind CloudFront/App Runner (comma-separated hostnames)
          # Keep in sync with surefilter-ui/next.config.ts serverActions.allowedOrigins
          NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS = "new.surefilter.us,qiypwsyuxm.us-east-1.awsapprunner.com"
        }
        runtime_environment_secrets = {
          DATABASE_URL    = aws_ssm_parameter.database_url.arn
          NEXTAUTH_SECRET = aws_ssm_parameter.nextauth_secret.arn
          ORIGIN_SECRET   = aws_ssm_parameter.origin_secret.arn
        }
      }
    }
  }

  instance_configuration {
    cpu               = "1 vCPU"
    memory            = "2 GB"
    instance_role_arn = aws_iam_role.apprunner_service_role.arn
  }
}

output "service_url" { value = aws_apprunner_service.surefilter.service_url }



