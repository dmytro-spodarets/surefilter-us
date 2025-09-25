# Variables specific to backup bucket
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "backup_bucket_name" {
  description = "Name of the S3 bucket for database backups"
  type        = string
  default     = "surefilter-db-backups-prod"
}

variable "database_url_parameter" {
  description = "SSM parameter name for production database URL"
  type        = string
  default     = "/surefilter/DATABASE_URL"
}

variable "staging_database_url_parameter" {
  description = "SSM parameter name for staging database URL"
  type        = string
  default     = "/surefilter/staging/DATABASE_URL"
}

variable "github_actions_user_name" {
  description = "IAM user name for GitHub Actions"
  type        = string
  default     = "surefilter-github-actions"
}

# S3 bucket for database backups
resource "aws_s3_bucket" "db_backups" {
  bucket = var.backup_bucket_name
  
  tags = {
    Name        = "SureFilter DB Backups"
    Environment = var.environment
    Purpose     = "database-backups"
  }
}

# Versioning configuration
resource "aws_s3_bucket_versioning" "db_backups" {
  bucket = aws_s3_bucket.db_backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "db_backups" {
  bucket = aws_s3_bucket.db_backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Public access block
resource "aws_s3_bucket_public_access_block" "db_backups" {
  bucket = aws_s3_bucket.db_backups.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle configuration for automatic cleanup
resource "aws_s3_bucket_lifecycle_configuration" "db_backups" {
  bucket = aws_s3_bucket.db_backups.id

  rule {
    id     = "manual_backups_cleanup"
    status = "Enabled"

    filter {
      prefix = "backups/manual/"
    }

    expiration {
      days = 90  # 3 months for manual backups
    }
  }

  rule {
    id     = "pre_restore_cleanup"
    status = "Enabled"

    filter {
      prefix = "pre-restore/"
    }

    expiration {
      days = 30
    }
  }

  rule {
    id     = "metadata_cleanup"
    status = "Enabled"

    filter {
      prefix = "metadata/"
    }

    expiration {
      days = 90
    }
  }

  rule {
    id     = "multipart_upload_cleanup"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

# IAM policy for GitHub Actions to access backup bucket
resource "aws_iam_policy" "github_actions_backup" {
  name        = "surefilter-github-actions-backup"
  description = "Policy for GitHub Actions to manage database backups"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.db_backups.arn,
          "${aws_s3_bucket.db_backups.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter"
        ]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter${var.database_url_parameter}",
          "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter${var.staging_database_url_parameter}"
        ]
      }
    ]
  })
}

# Create GitHub Actions IAM user if it doesn't exist
resource "aws_iam_user" "github_actions" {
  name = var.github_actions_user_name
  path = "/"

  tags = {
    Name        = "SureFilter GitHub Actions"
    Environment = var.environment
    Purpose     = "ci-cd-automation"
  }
}

# Create access key for GitHub Actions user
resource "aws_iam_access_key" "github_actions" {
  user = aws_iam_user.github_actions.name
}

# Attach backup policy to GitHub Actions user
resource "aws_iam_user_policy_attachment" "github_actions_backup" {
  user       = aws_iam_user.github_actions.name
  policy_arn = aws_iam_policy.github_actions_backup.arn
}

# Also attach backup policy to existing github-cli user (if it exists)
resource "aws_iam_user_policy_attachment" "github_cli_backup" {
  user       = "github-cli"
  policy_arn = aws_iam_policy.github_actions_backup.arn
}

# CloudWatch alarm for backup failures
resource "aws_cloudwatch_log_group" "backup_logs" {
  name              = "/aws/github-actions/db-backups"
  retention_in_days = 30

  tags = {
    Environment = var.environment
    Purpose     = "backup-monitoring"
  }
}

# SNS topic for backup notifications (optional)
resource "aws_sns_topic" "backup_notifications" {
  name = "surefilter-backup-notifications"

  tags = {
    Environment = var.environment
    Purpose     = "backup-alerts"
  }
}

# Output bucket name for reference
output "backup_bucket_name" {
  description = "Name of the S3 bucket for database backups"
  value       = aws_s3_bucket.db_backups.id
}

output "backup_bucket_arn" {
  description = "ARN of the S3 bucket for database backups"
  value       = aws_s3_bucket.db_backups.arn
}

# Output GitHub Actions credentials (sensitive)
output "github_actions_access_key_id" {
  description = "Access Key ID for GitHub Actions user"
  value       = aws_iam_access_key.github_actions.id
}

output "github_actions_secret_access_key" {
  description = "Secret Access Key for GitHub Actions user"
  value       = aws_iam_access_key.github_actions.secret
  sensitive   = true
}

# Data sources
data "aws_caller_identity" "current" {}
