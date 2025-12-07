# CloudFront distribution for assets.surefilter.us  
# Dedicated subdomain for static files uploaded via File Manager

resource "aws_cloudfront_distribution" "assets" {
  comment = "Assets CDN for SureFilter - images, videos, documents"
  
  aliases = ["assets.surefilter.us"]

  origin {
    domain_name = aws_s3_bucket.file_manager.bucket_regional_domain_name
    origin_id   = "file-manager-origin"
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    target_origin_id       = "file-manager-origin"
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = aws_cloudfront_cache_policy.static_long.id
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
  }

  # Cache images for 1 year
  ordered_cache_behavior {
    path_pattern           = "images/*"
    target_origin_id       = "file-manager-origin"
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = aws_cloudfront_cache_policy.static_long.id
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
  }

  # Cache videos for 1 year
  ordered_cache_behavior {
    path_pattern           = "videos/*"
    target_origin_id       = "file-manager-origin"
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = aws_cloudfront_cache_policy.static_long.id
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = false  # Don't compress videos
  }

  # Cache documents for 1 year
  ordered_cache_behavior {
    path_pattern           = "documents/*"
    target_origin_id       = "file-manager-origin"
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = aws_cloudfront_cache_policy.static_long.id
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
  }

  # Don't cache 404 errors - prevents caching missing images
  custom_error_response {
    error_code            = 404
    error_caching_min_ttl = 10  # Cache 404 for only 10 seconds
  }

  # Don't cache 403 errors either
  custom_error_response {
    error_code            = 403
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.assets.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  depends_on = [aws_acm_certificate_validation.assets]

  tags = {
    Name        = "SureFilter Assets CDN"
    Environment = "production"
    Purpose     = "file-manager-assets"
  }
}

# Route53 record for assets subdomain
resource "aws_route53_record" "assets" {
  zone_id = "Z082426231T6TCGJMQI1G"  # assets.surefilter.us zone
  name    = "assets.surefilter.us"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.assets.domain_name
    zone_id                = aws_cloudfront_distribution.assets.hosted_zone_id
    evaluate_target_health = false
  }
}

# Output the assets CDN URL
output "assets_cdn_url" {
  value = "https://assets.surefilter.us"
}
