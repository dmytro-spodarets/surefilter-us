# =============================================================================
# CloudFront Distribution for 301 redirects → surefilter.us
# Pure edge redirect via CloudFront Function — no origin needed
# Covers: surefilter.eu, surefilter.co, surefilter.net (+ www variants)
# =============================================================================

# CloudFront Function: 301 redirect preserving path and query string
resource "aws_cloudfront_function" "redirect_to_us" {
  name    = "surefilter-redirect-to-us"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = <<-EOT
    function handler(event) {
      var request = event.request;
      var qs = Object.keys(request.querystring).map(function(key) {
        var param = request.querystring[key];
        return param.multiValue
          ? param.multiValue.map(function(mv) { return key + '=' + mv.value; }).join('&')
          : key + '=' + param.value;
      }).join('&');
      var location = 'https://surefilter.us' + request.uri + (qs ? '?' + qs : '');
      return {
        statusCode: 301,
        statusDescription: 'Moved Permanently',
        headers: {
          'location': { value: location },
          'cache-control': { value: 'max-age=31536000, immutable' }
        }
      };
    }
  EOT
}

# Minimal cache policy — redirect is handled at the edge, but CloudFront
# still needs a cache policy. We cache the 301 responses aggressively.
resource "aws_cloudfront_cache_policy" "redirect" {
  name        = "surefilter-redirect"
  default_ttl = 86400
  max_ttl     = 31536000
  min_ttl     = 86400
  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_gzip   = false
    enable_accept_encoding_brotli = false
    headers_config { header_behavior = "none" }
    cookies_config { cookie_behavior = "none" }
    query_strings_config { query_string_behavior = "all" }
  }
}

resource "aws_cloudfront_distribution" "redirect" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "surefilter 301 redirect → surefilter.us"

  aliases = [
    "surefilter.eu",
    "www.surefilter.eu",
    "surefilter.co",
    "www.surefilter.co",
    "surefilter.net",
    "www.surefilter.net",
  ]

  # Dummy origin — CloudFront requires at least one, but the CF Function
  # returns a 301 before the request ever reaches the origin.
  origin {
    domain_name = aws_s3_bucket.static.bucket_regional_domain_name
    origin_id   = "dummy-origin"
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    target_origin_id       = "dummy-origin"
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = aws_cloudfront_cache_policy.redirect.id
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.redirect_to_us.arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.redirect.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name    = "surefilter-redirect"
    Purpose = "301 redirect to surefilter.us"
  }
}

output "redirect_cloudfront_domain" {
  value       = aws_cloudfront_distribution.redirect.domain_name
  description = "CloudFront domain for redirect distribution"
}
