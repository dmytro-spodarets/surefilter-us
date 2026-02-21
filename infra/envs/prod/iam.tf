# IAM Role for App Runner ECR Access
resource "aws_iam_role" "apprunner_ecr_role" {
  name = "surefilter-apprunner-ecr-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{ Action = "sts:AssumeRole", Effect = "Allow", Principal = { Service = "build.apprunner.amazonaws.com" } }]
  })
}

resource "aws_iam_role_policy_attachment" "apprunner_ecr_access" {
  role       = aws_iam_role.apprunner_ecr_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# IAM Role for App Runner Service (runtime)
resource "aws_iam_role" "apprunner_service_role" {
  name = "surefilter-apprunner-service-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{ Action = "sts:AssumeRole", Effect = "Allow", Principal = { Service = "tasks.apprunner.amazonaws.com" } }]
  })
}

# Allow App Runner to read SSM parameters under /surefilter/*
resource "aws_iam_policy" "ssm_parameter_access" {
  name        = "surefilter-ssm-parameter-access"
  description = "Allow App Runner to read SSM parameters under /surefilter"
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect: "Allow",
        Action: [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ],
        Resource: [
          "arn:aws:ssm:${var.aws_region}:*:parameter/surefilter/*",
          "arn:aws:ssm:${var.aws_region}:*:parameter/surefilter"
        ]
      },
      {
        Effect: "Allow",
        Action: [
          "kms:Decrypt"
        ],
        Resource: "arn:aws:kms:${var.aws_region}:*:key/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "apprunner_service_ssm_attach" {
  role       = aws_iam_role.apprunner_service_role.name
  policy_arn = aws_iam_policy.ssm_parameter_access.arn
}

# Allow App Runner to invalidate CloudFront cache on content updates
resource "aws_iam_policy" "cloudfront_invalidation" {
  name        = "surefilter-cloudfront-invalidation"
  description = "Allow App Runner to create CloudFront cache invalidations"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect   = "Allow",
      Action   = ["cloudfront:CreateInvalidation"],
      Resource = aws_cloudfront_distribution.site.arn
    }]
  })
}

resource "aws_iam_role_policy_attachment" "apprunner_service_cloudfront_attach" {
  role       = aws_iam_role.apprunner_service_role.name
  policy_arn = aws_iam_policy.cloudfront_invalidation.arn
}

