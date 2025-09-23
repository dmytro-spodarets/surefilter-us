# IAM роль для App Runner для работы с S3 (файловый менеджер)
resource "aws_iam_role" "file_manager" {
  name = "surefilter-file-manager-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "file_manager_s3" {
  name        = "surefilter-file-manager-s3-policy"
  description = "Policy for file manager to access S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetObjectAttributes"
        ]
        Resource = [
          aws_s3_bucket.static.arn,
          "${aws_s3_bucket.static.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "file_manager_s3" {
  role       = aws_iam_role.file_manager.name
  policy_arn = aws_iam_policy.file_manager_s3.arn
}

# Outputs для использования в App Runner
output "file_manager_role_arn" {
  value = aws_iam_role.file_manager.arn
}
