# =============================================================================
# ACM Certificate for redirect domains
# Single certificate covers all 3 domains + www variants
# =============================================================================

resource "aws_acm_certificate" "redirect" {
  domain_name = "surefilter.eu"
  subject_alternative_names = [
    "www.surefilter.eu",
    "surefilter.co",
    "www.surefilter.co",
    "surefilter.net",
    "www.surefilter.net",
    "news.surefilter.us",
    "mail.surefilter.us",
    "notify.surefilter.us",
  ]
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name    = "SureFilter Redirect Domains Certificate"
    Purpose = "redirect"
  }
}

# DNS validation records — each domain's record goes to its own Route53 zone
resource "aws_route53_record" "redirect_acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.redirect.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = (
    contains(["surefilter.eu", "www.surefilter.eu"], each.key)
    ? aws_route53_zone.redirect_eu.zone_id
    : contains(["surefilter.co", "www.surefilter.co"], each.key)
    ? aws_route53_zone.redirect_co.zone_id
    : contains(["surefilter.net", "www.surefilter.net"], each.key)
    ? aws_route53_zone.redirect_net.zone_id
    : aws_route53_zone.main.zone_id  # news/mail.surefilter.us → main zone
  )

  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "redirect" {
  certificate_arn         = aws_acm_certificate.redirect.arn
  validation_record_fqdns = [for r in aws_route53_record.redirect_acm_validation : r.fqdn]

  timeouts {
    create = "30m"
  }

  depends_on = [aws_route53_record.redirect_acm_validation]
}

output "redirect_acm_certificate_arn" {
  value = aws_acm_certificate.redirect.arn
}
