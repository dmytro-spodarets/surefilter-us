resource "aws_s3_bucket" "static" {
  bucket = "surefilter-static-prod"
}

resource "aws_s3_bucket_public_access_block" "static" {
  bucket                  = aws_s3_bucket.static.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for surefilter static bucket"
}

resource "aws_s3_bucket_policy" "static" {
  bucket = aws_s3_bucket.static.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid    = "AllowCloudFrontAccess",
        Effect = "Allow",
        # Use IAM ARN form (matches how AWS normalizes the policy server-side) so
        # that `tofu plan` doesn't show a cosmetic Principal/Action/Resource drift
        # on every run. Functionally equivalent to the CanonicalUser form.
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
        },
        Action   = "s3:GetObject",
        Resource = "${aws_s3_bucket.static.arn}/*"
      }
    ]
  })
}

output "static_bucket_name" {
  value = aws_s3_bucket.static.bucket
}


