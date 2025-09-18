locals {
  origin_domain = replace(replace(aws_apprunner_service.surefilter.service_url, "https://", ""), "/", "")
}

data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

resource "aws_cloudfront_cache_policy" "static_long" {
  name        = "surefilter-static-long"
  default_ttl = 31536000
  max_ttl     = 31536000
  min_ttl     = 86400
  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
    headers_config { header_behavior = "none" }
    cookies_config { cookie_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
  }
}

// Removed image optimizer specific policies to fully passthrough to App Runner

data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewer"
}

resource "aws_cloudfront_origin_request_policy" "app_runner_min" {
  name    = "surefilter-app-runner-min"
  comment = "Forward cookies and all query strings; do not forward viewer headers (prevents Host forwarding)"
  headers_config {
    # Forward ONLY the x-forwarded-host header (set by our CloudFront Function) to origin.
    # This avoids forwarding the viewer Host header (which previously caused issues),
    # but still lets Next.js Server Actions validate matching Origin/x-forwarded-host.
    header_behavior = "whitelist"
    headers         = ["x-forwarded-host"]
  }
  cookies_config {
    cookie_behavior = "all"
  }
  query_strings_config {
    query_string_behavior = "all"
  }
}

data "aws_cloudfront_response_headers_policy" "security_headers" {
  name = "Managed-SecurityHeadersPolicy"
}

// Removed unused custom origin request policy

# CloudFront Function: normalize x-forwarded-host to viewer Host to satisfy Next.js Server Actions origin checks
resource "aws_cloudfront_function" "set_x_forwarded_host" {
  name    = "surefilter-set-x-forwarded-host"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = <<EOT
function handler(event) {
  var request = event.request;
  var hostHeader = request.headers.host && request.headers.host.value;
  if (hostHeader) {
    request.headers['x-forwarded-host'] = { value: hostHeader };
  }
  return request;
}
EOT
}

resource "aws_cloudfront_distribution" "site" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "surefilter new.surefilter.us"

  aliases = ["new.surefilter.us"]

  origin {
    domain_name = local.origin_domain
    origin_id   = "apprunner-origin"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
    custom_header {
      name  = "X-Origin-Secret"
      value = aws_ssm_parameter.origin_secret.value
    }
  }

  origin {
    domain_name = aws_s3_bucket.static.bucket_regional_domain_name
    origin_id   = "static-origin"
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    target_origin_id       = "apprunner-origin"
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.app_runner_min.id
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]

    # Ensure x-forwarded-host equals viewer Host for Server Actions validation
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.set_x_forwarded_host.arn
    }
  }

  // keep static from S3
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    target_origin_id       = "static-origin"
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = aws_cloudfront_cache_policy.static_long.id
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
  }

  // route image optimizer to App Runner without special policies
  ordered_cache_behavior {
    path_pattern                 = "/_next/image*"
    target_origin_id             = "apprunner-origin"
    viewer_protocol_policy       = "redirect-to-https"
    cache_policy_id              = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id     = aws_cloudfront_origin_request_policy.app_runner_min.id
    allowed_methods              = ["GET", "HEAD", "OPTIONS"]
    cached_methods               = ["GET", "HEAD"]
  }

  # Ensure API/auth gets all headers/cookies and methods forwarded, no cache
  ordered_cache_behavior {
    path_pattern                 = "/api/*"
    target_origin_id             = "apprunner-origin"
    viewer_protocol_policy       = "redirect-to-https"
    cache_policy_id              = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id     = aws_cloudfront_origin_request_policy.app_runner_min.id
    allowed_methods              = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods               = ["GET", "HEAD"]

    # Also normalize x-forwarded-host for any API routes that might be used by Next internals
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.set_x_forwarded_host.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/images/*"
    target_origin_id       = "static-origin"
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = aws_cloudfront_cache_policy.static_long.id
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  # logging can be re-enabled later if needed
}

# CloudFront access logs bucket (standard logs)
// removed logs bucket to simplify

resource "aws_route53_record" "alias_a" {
  zone_id = "Z003662317J6SYETHU44S"
  name    = "new.surefilter.us"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "alias_aaaa" {
  zone_id = "Z003662317J6SYETHU44S"
  name    = "new.surefilter.us"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}


