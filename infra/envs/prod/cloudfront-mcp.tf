# =============================================================================
# CloudFront Distribution for mcp.surefilter.us
# Fronts the MCP server (Phase 0–3, plan: ~/.claude/plans/dazzling-whistling-walrus.md).
# Path rewrite: mcp.surefilter.us/mcp/* → App Runner /api/mcp/mcp/* (via CF Function).
# /.well-known/oauth-protected-resource is passed through to App Runner unchanged.
# Cache disabled (JSON-RPC + SSE responses are per-request); all writes pass straight to origin.
# =============================================================================

# ─────────── CloudFront Function: path rewrite + x-forwarded-host ───────────
# Runs at viewer-request:
#   - /mcp                          → /api/mcp/mcp
#   - /mcp/anything                 → /api/mcp/mcp/anything
#   - /.well-known/oauth-protected-resource → passthrough (route is at app root)
#   - any other path                → passthrough (will 404 at origin)
# Sets x-forwarded-host = mcp.surefilter.us so withMcpAuth builds the correct
# resource_metadata URL in WWW-Authenticate headers.
resource "aws_cloudfront_function" "mcp_path_rewrite" {
  name    = "surefilter-mcp-path-rewrite"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = <<-EOT
    function handler(event) {
      var request = event.request;
      var uri = request.uri;
      var hostHeader = request.headers.host && request.headers.host.value;

      // Path rewrite: /mcp[/*] → /api/mcp/mcp[/*]
      // mcp-handler is mounted at basePath=/api/mcp with streamableHttpEndpoint=/mcp.
      if (uri === '/mcp') {
        request.uri = '/api/mcp/mcp';
      } else if (uri.indexOf('/mcp/') === 0) {
        request.uri = '/api/mcp/mcp' + uri.substring('/mcp'.length);
      }

      // Normalize x-forwarded-host so the route handler builds proper public URLs
      // (e.g. WWW-Authenticate resource_metadata). Origin Host is App Runner.
      if (hostHeader) {
        request.headers['x-forwarded-host'] = { value: hostHeader };
      }

      return request;
    }
  EOT
}

# ─────────── Cache policies ───────────

# No-cache policy for MCP traffic. JSON-RPC requests are per-call (auth + body),
# and SSE responses stream — neither benefits from edge caching. Authorization
# header is included in the cache key only for defense-in-depth; cache TTL=0
# means CloudFront never serves stale responses regardless.
resource "aws_cloudfront_cache_policy" "mcp_no_cache" {
  name        = "surefilter-mcp-no-cache"
  default_ttl = 0
  max_ttl     = 0
  min_ttl     = 0
  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
    headers_config {
      header_behavior = "whitelist"
      headers {
        items = [
          "Authorization",          # Bearer token differentiates clients
          "mcp-session-id",         # MCP session per spec 2025-11-25
          "MCP-Protocol-Version",   # client protocol announcement
          "Accept",                 # text/event-stream vs application/json
        ]
      }
    }
    cookies_config { cookie_behavior = "none" }
    query_strings_config { query_string_behavior = "all" }
  }
}

# Cache policy for /.well-known/oauth-protected-resource — tiny JSON, cache 1h.
# RFC 9728 metadata changes rarely (only when we add OAuth authorization servers
# in Phase 6); short cache is a fine trade-off.
resource "aws_cloudfront_cache_policy" "mcp_metadata_cache" {
  name        = "surefilter-mcp-metadata-cache"
  default_ttl = 3600
  max_ttl     = 86400
  min_ttl     = 60
  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
    headers_config { header_behavior = "none" }
    cookies_config { cookie_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
  }
}

# Origin request policy: forward everything we need to App Runner.
# Cannot whitelist Host (CloudFront always sends origin domain by default,
# and AWS does not allow overriding Host via this policy).
resource "aws_cloudfront_origin_request_policy" "mcp_origin" {
  name    = "surefilter-mcp-origin"
  comment = "Forward MCP-specific headers + cookies + query strings to App Runner"
  headers_config {
    header_behavior = "whitelist"
    headers {
      items = [
        "Authorization",
        "mcp-session-id",
        "MCP-Protocol-Version",
        "X-Forwarded-Host",       # Set by CF Function — used by withMcpAuth
        "Content-Type",
        "Content-Length",
        "Accept",
        "Origin",
        "Referer",
      ]
    }
  }
  cookies_config { cookie_behavior = "all" }
  query_strings_config { query_string_behavior = "all" }
}

# ─────────── (Optional) WAF web ACL — rate-based rule ───────────
# Disabled by default (var.enable_mcp_waf=false) — adds ~$5/mo base cost.
# Flip the variable when MCP traffic warrants paid protection.
resource "aws_wafv2_web_acl" "mcp" {
  count = var.enable_mcp_waf ? 1 : 0

  provider = aws
  name     = "surefilter-mcp"
  scope    = "CLOUDFRONT"

  default_action {
    allow {}
  }

  # Rate-based rule: 2000 requests / 5min per IP (configurable per AWS minimum).
  # MCP clients hit /mcp once per JSON-RPC call. 2000/5min = 400/min/IP burst headroom
  # well above the per-token quota; this only fires for runaway/brute-force IPs.
  rule {
    name     = "RateLimitPerIp"
    priority = 1
    action {
      block {}
    }
    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "surefilter-mcp-rate-limit"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "surefilter-mcp"
    sampled_requests_enabled   = true
  }

  tags = {
    Name = "surefilter-mcp-waf"
  }
}

# ─────────── CloudFront distribution ───────────

resource "aws_cloudfront_distribution" "mcp" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "surefilter MCP — mcp.surefilter.us → App Runner /api/mcp/*"

  aliases = ["mcp.surefilter.us"]

  origin {
    domain_name = local.origin_domain
    origin_id   = "apprunner-origin"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
      # SSE responses can stream for minutes; bump read timeout above the default 30s.
      origin_read_timeout    = 60
      origin_keepalive_timeout = 60
    }
    custom_header {
      name  = "X-Origin-Secret"
      value = aws_ssm_parameter.origin_secret.value
    }
  }

  # Catch-all: every request reaches /api/mcp/* on App Runner (after CF Function rewrite).
  default_cache_behavior {
    target_origin_id         = "apprunner-origin"
    viewer_protocol_policy   = "redirect-to-https"
    cache_policy_id          = aws_cloudfront_cache_policy.mcp_no_cache.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.mcp_origin.id
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.mcp_path_rewrite.arn
    }
  }

  # /.well-known/oauth-protected-resource — RFC 9728 metadata, cache 1h.
  ordered_cache_behavior {
    path_pattern             = "/.well-known/oauth-protected-resource"
    target_origin_id         = "apprunner-origin"
    viewer_protocol_policy   = "redirect-to-https"
    compress                 = true
    cache_policy_id          = aws_cloudfront_cache_policy.mcp_metadata_cache.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.mcp_origin.id
    allowed_methods          = ["GET", "HEAD", "OPTIONS"]
    cached_methods           = ["GET", "HEAD"]

    # Path-rewrite Function still applies here for the x-forwarded-host normalization
    # (the path-rewrite branch is a no-op for /.well-known/...).
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.mcp_path_rewrite.arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.mcp.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  web_acl_id = var.enable_mcp_waf ? aws_wafv2_web_acl.mcp[0].arn : null

  tags = {
    Name    = "surefilter-mcp"
    Purpose = "MCP server (mcp.surefilter.us)"
  }
}

output "mcp_cloudfront_domain" {
  value       = aws_cloudfront_distribution.mcp.domain_name
  description = "CloudFront domain name for the MCP distribution (used by Route53 alias)"
}

output "mcp_cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.mcp.id
  description = "Distribution ID — use with `aws cloudfront create-invalidation` if you ever need to purge MCP cache"
}
