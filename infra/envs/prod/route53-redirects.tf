# =============================================================================
# Route53 Hosted Zones for redirect domains → surefilter.us
# Domains: surefilter.eu, surefilter.co, surefilter.net
# =============================================================================

# --- Hosted Zones ---

resource "aws_route53_zone" "redirect_eu" {
  name    = "surefilter.eu"
  comment = "Redirect zone — 301 to surefilter.us"

  tags = {
    Name        = "surefilter.eu"
    Environment = "production"
    Purpose     = "redirect"
  }
}

resource "aws_route53_zone" "redirect_co" {
  name    = "surefilter.co"
  comment = "Redirect zone — 301 to surefilter.us"

  tags = {
    Name        = "surefilter.co"
    Environment = "production"
    Purpose     = "redirect"
  }
}

resource "aws_route53_zone" "redirect_net" {
  name    = "surefilter.net"
  comment = "Redirect zone — 301 to surefilter.us"

  tags = {
    Name        = "surefilter.net"
    Environment = "production"
    Purpose     = "redirect"
  }
}

# --- DNS Records: root domains → CloudFront redirect distribution ---
# TODO: Uncomment after CloudFront redirect distribution is created
#       (requires validated ACM certificate → NS delegation at registrar first)

# # surefilter.eu
# resource "aws_route53_record" "redirect_eu_a" {
#   zone_id = aws_route53_zone.redirect_eu.zone_id
#   name    = "surefilter.eu"
#   type    = "A"
#   alias {
#     name                   = aws_cloudfront_distribution.redirect.domain_name
#     zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
#     evaluate_target_health = false
#   }
# }
#
# resource "aws_route53_record" "redirect_eu_aaaa" {
#   zone_id = aws_route53_zone.redirect_eu.zone_id
#   name    = "surefilter.eu"
#   type    = "AAAA"
#   alias {
#     name                   = aws_cloudfront_distribution.redirect.domain_name
#     zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
#     evaluate_target_health = false
#   }
# }
#
# # www.surefilter.eu
# resource "aws_route53_record" "redirect_www_eu_a" {
#   zone_id = aws_route53_zone.redirect_eu.zone_id
#   name    = "www.surefilter.eu"
#   type    = "A"
#   alias {
#     name                   = aws_cloudfront_distribution.redirect.domain_name
#     zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
#     evaluate_target_health = false
#   }
# }
#
# resource "aws_route53_record" "redirect_www_eu_aaaa" {
#   zone_id = aws_route53_zone.redirect_eu.zone_id
#   name    = "www.surefilter.eu"
#   type    = "AAAA"
#   alias {
#     name                   = aws_cloudfront_distribution.redirect.domain_name
#     zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
#     evaluate_target_health = false
#   }
# }
#
# # surefilter.co
# resource "aws_route53_record" "redirect_co_a" {
#   zone_id = aws_route53_zone.redirect_co.zone_id
#   name    = "surefilter.co"
#   type    = "A"
#   alias {
#     name                   = aws_cloudfront_distribution.redirect.domain_name
#     zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
#     evaluate_target_health = false
#   }
# }
#
# resource "aws_route53_record" "redirect_co_aaaa" {
#   zone_id = aws_route53_zone.redirect_co.zone_id
#   name    = "surefilter.co"
#   type    = "AAAA"
#   alias {
#     name                   = aws_cloudfront_distribution.redirect.domain_name
#     zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
#     evaluate_target_health = false
#   }
# }
#
# # www.surefilter.co
# resource "aws_route53_record" "redirect_www_co_a" {
#   zone_id = aws_route53_zone.redirect_co.zone_id
#   name    = "www.surefilter.co"
#   type    = "A"
#   alias {
#     name                   = aws_cloudfront_distribution.redirect.domain_name
#     zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
#     evaluate_target_health = false
#   }
# }
#
# resource "aws_route53_record" "redirect_www_co_aaaa" {
#   zone_id = aws_route53_zone.redirect_co.zone_id
#   name    = "www.surefilter.co"
#   type    = "AAAA"
#   alias {
#     name                   = aws_cloudfront_distribution.redirect.domain_name
#     zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
#     evaluate_target_health = false
#   }
# }
#
# # surefilter.net
# resource "aws_route53_record" "redirect_net_a" {
#   zone_id = aws_route53_zone.redirect_net.zone_id
#   name    = "surefilter.net"
#   type    = "A"
#   alias {
#     name                   = aws_cloudfront_distribution.redirect.domain_name
#     zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
#     evaluate_target_health = false
#   }
# }
#
# resource "aws_route53_record" "redirect_net_aaaa" {
#   zone_id = aws_route53_zone.redirect_net.zone_id
#   name    = "surefilter.net"
#   type    = "AAAA"
#   alias {
#     name                   = aws_cloudfront_distribution.redirect.domain_name
#     zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
#     evaluate_target_health = false
#   }
# }
#
# # www.surefilter.net
# resource "aws_route53_record" "redirect_www_net_a" {
#   zone_id = aws_route53_zone.redirect_net.zone_id
#   name    = "www.surefilter.net"
#   type    = "A"
#   alias {
#     name                   = aws_cloudfront_distribution.redirect.domain_name
#     zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
#     evaluate_target_health = false
#   }
# }
#
# resource "aws_route53_record" "redirect_www_net_aaaa" {
#   zone_id = aws_route53_zone.redirect_net.zone_id
#   name    = "www.surefilter.net"
#   type    = "AAAA"
#   alias {
#     name                   = aws_cloudfront_distribution.redirect.domain_name
#     zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
#     evaluate_target_health = false
#   }
# }

# -----------------------------------------------------------------------------
# Outputs — NS servers to set at each domain registrar
# -----------------------------------------------------------------------------

output "redirect_eu_name_servers" {
  value       = aws_route53_zone.redirect_eu.name_servers
  description = "NS servers for surefilter.eu — set at domain registrar"
}

output "redirect_co_name_servers" {
  value       = aws_route53_zone.redirect_co.name_servers
  description = "NS servers for surefilter.co — set at domain registrar"
}

output "redirect_net_name_servers" {
  value       = aws_route53_zone.redirect_net.name_servers
  description = "NS servers for surefilter.net — set at domain registrar"
}
