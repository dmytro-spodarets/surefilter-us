terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

resource "aws_apprunner_custom_domain_association" "this" {
  domain_name          = var.domain_name
  service_arn          = var.service_arn
  enable_www_subdomain = false
}

resource "aws_route53_record" "validation" {
  for_each = { for r in aws_apprunner_custom_domain_association.this.certificate_validation_records : r.name => r }
  zone_id  = var.hosted_zone_id
  name     = each.value.name
  type     = each.value.type
  ttl      = 60
  records  = [each.value.value]
}

resource "aws_route53_record" "app" {
  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "CNAME"
  ttl     = 60
  records = [aws_apprunner_custom_domain_association.this.dns_target]
}

output "domain_status" {
  value = aws_apprunner_custom_domain_association.this.status
}


