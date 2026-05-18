# =============================================================================
# Route53 records for mcp.surefilter.us → MCP CloudFront distribution
# =============================================================================

resource "aws_route53_record" "mcp_alias_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "mcp.surefilter.us"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.mcp.domain_name
    zone_id                = aws_cloudfront_distribution.mcp.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "mcp_alias_aaaa" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "mcp.surefilter.us"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.mcp.domain_name
    zone_id                = aws_cloudfront_distribution.mcp.hosted_zone_id
    evaluate_target_health = false
  }
}
