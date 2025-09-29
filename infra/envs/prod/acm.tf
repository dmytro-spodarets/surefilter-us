resource "aws_acm_certificate" "site" {
  domain_name       = "new.surefilter.us"
  validation_method = "DNS"
}

resource "aws_route53_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.site.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  zone_id = "Z003662317J6SYETHU44S"
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "site" {
  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for r in aws_route53_record.acm_validation : r.fqdn]
}

# Separate certificate for assets subdomain
resource "aws_acm_certificate" "assets" {
  domain_name       = "assets.surefilter.us"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "SureFilter Assets Certificate"
  }
}

resource "aws_route53_record" "assets_acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.assets.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  zone_id = "Z082426231T6TCGJMQI1G"  # assets.surefilter.us zone
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "assets" {
  certificate_arn         = aws_acm_certificate.assets.arn
  validation_record_fqdns = [for r in aws_route53_record.assets_acm_validation : r.fqdn]

  timeouts {
    create = "10m"
  }

  depends_on = [aws_route53_record.assets_acm_validation]
}

output "acm_certificate_arn" {
  value = aws_acm_certificate.site.arn
}

output "assets_acm_certificate_arn" {
  value = aws_acm_certificate.assets.arn
}


