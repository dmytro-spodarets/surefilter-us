# =============================================================================
# ACM Certificate for mcp.surefilter.us
# Used by the dedicated CloudFront distribution that fronts the MCP server
# at mcp.surefilter.us → App Runner /api/mcp/* (rewritten by CF Function).
# =============================================================================

resource "aws_acm_certificate" "mcp" {
  domain_name       = "mcp.surefilter.us"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "SureFilter MCP Certificate"
  }
}

resource "aws_route53_record" "mcp_acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.mcp.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  # mcp.surefilter.us is a subdomain of the main zone (no delegation)
  zone_id = aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "mcp" {
  certificate_arn         = aws_acm_certificate.mcp.arn
  validation_record_fqdns = [for r in aws_route53_record.mcp_acm_validation : r.fqdn]

  timeouts {
    create = "10m"
  }
}

output "mcp_acm_certificate_arn" {
  value = aws_acm_certificate.mcp.arn
}
