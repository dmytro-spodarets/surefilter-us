# S3 bucket for file manager uploads
resource "aws_s3_bucket" "file_manager" {
  bucket = "surefilter-files-prod"

  tags = {
    Name        = "SureFilter File Manager"
    Environment = "production"
    Purpose     = "file-uploads"
  }
}

# Enable versioning for file manager bucket
resource "aws_s3_bucket_versioning" "file_manager" {
  bucket = aws_s3_bucket.file_manager.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption for file manager bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "file_manager" {
  bucket = aws_s3_bucket.file_manager.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access for file manager bucket
resource "aws_s3_bucket_public_access_block" "file_manager" {
  bucket = aws_s3_bucket.file_manager.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CORS configuration for file manager bucket (for direct uploads)
resource "aws_s3_bucket_cors_configuration" "file_manager" {
  bucket = aws_s3_bucket.file_manager.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "POST", "PUT", "DELETE", "HEAD"]
    allowed_origins = [
      "https://new.surefilter.us",
      "https://assets.surefilter.us",
      "http://localhost:3000"
    ]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Lifecycle configuration for file manager bucket
resource "aws_s3_bucket_lifecycle_configuration" "file_manager" {
  bucket = aws_s3_bucket.file_manager.id

  rule {
    id     = "cleanup_multipart_uploads"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }

  rule {
    id     = "cleanup_old_versions"
    status = "Enabled"

    filter {}

    # Delete old versions after 30 days to save storage costs
    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# Update IAM policy to use the new bucket
resource "aws_iam_policy" "apprunner_file_manager_s3_policy" {
  name        = "surefilter-apprunner-file-manager-s3-policy"
  description = "Policy for App Runner to access S3 file manager bucket"

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
          aws_s3_bucket.file_manager.arn,
          "${aws_s3_bucket.file_manager.arn}/*"
        ]
      }
    ]
  })
}

# Attach file manager S3 policy to App Runner service role
resource "aws_iam_role_policy_attachment" "apprunner_file_manager_s3_policy" {
  role       = aws_iam_role.apprunner_service_role.name
  policy_arn = aws_iam_policy.apprunner_file_manager_s3_policy.arn
}

# Bucket policy to allow CloudFront access to file manager bucket
resource "aws_s3_bucket_policy" "file_manager_cloudfront" {
  bucket = aws_s3_bucket.file_manager.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontAccess"
        Effect    = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.file_manager.arn}/*"
      }
    ]
  })
}
