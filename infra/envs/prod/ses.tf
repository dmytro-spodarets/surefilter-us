# =============================================================================
# Amazon SES — email sending from news.surefilter.us
# Best practices: DKIM (2048-bit), custom MAIL FROM, SPF, DMARC,
#                 dedicated IP pool, tracking, default config set
# =============================================================================

# -----------------------------------------------------------------------------
# Dedicated IP Pool (managed) — isolated reputation for newsletters
# -----------------------------------------------------------------------------

resource "aws_sesv2_dedicated_ip_pool" "newsletter" {
  pool_name    = "surefilter-newsletter"
  scaling_mode = "MANAGED"

  tags = {
    Name    = "surefilter-newsletter"
    Purpose = "newsletter"
  }
}

# -----------------------------------------------------------------------------
# SES Domain Identity
# -----------------------------------------------------------------------------

resource "aws_sesv2_email_identity" "news" {
  email_identity         = "news.surefilter.us"
  configuration_set_name = aws_sesv2_configuration_set.newsletter.configuration_set_name

  dkim_signing_attributes {
    next_signing_key_length = "RSA_2048_BIT"
  }

  tags = {
    Name        = "news.surefilter.us"
    Environment = "production"
    Purpose     = "newsletter"
  }
}

# -----------------------------------------------------------------------------
# DKIM — 3 CNAME records for Easy DKIM verification
# -----------------------------------------------------------------------------

resource "aws_route53_record" "ses_dkim" {
  count   = 3
  zone_id = aws_route53_zone.main.zone_id
  name    = "${aws_sesv2_email_identity.news.dkim_signing_attributes[0].tokens[count.index]}._domainkey.news.surefilter.us"
  type    = "CNAME"
  ttl     = 3600
  records = ["${aws_sesv2_email_identity.news.dkim_signing_attributes[0].tokens[count.index]}.dkim.amazonses.com"]
}

# -----------------------------------------------------------------------------
# Custom MAIL FROM domain — for SPF alignment
# Without this, the envelope sender is amazonses.com and SPF won't align
# -----------------------------------------------------------------------------

resource "aws_sesv2_email_identity_mail_from_attributes" "news" {
  email_identity         = aws_sesv2_email_identity.news.email_identity
  mail_from_domain       = "bounce.news.surefilter.us"
  behavior_on_mx_failure = "USE_DEFAULT_VALUE"
}

# MX record for MAIL FROM domain — SES needs to receive bounces
resource "aws_route53_record" "ses_mail_from_mx" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "bounce.news.surefilter.us"
  type    = "MX"
  ttl     = 3600
  records = ["10 feedback-smtp.${var.aws_region}.amazonses.com"]
}

# SPF record for MAIL FROM domain
resource "aws_route53_record" "ses_mail_from_spf" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "bounce.news.surefilter.us"
  type    = "TXT"
  ttl     = 3600
  records = ["v=spf1 include:amazonses.com -all"]
}

# DMARC: inherited from _dmarc.surefilter.us (CNAME → hosteddmarc.dmarc-dns.com)
# No subdomain override needed — organizational policy applies automatically.

# -----------------------------------------------------------------------------
# Custom tracking domain — HTTPS click/open tracking via link.news.surefilter.us
# CloudFront fronts SES tracking endpoint to enable HTTPS
# -----------------------------------------------------------------------------

resource "aws_acm_certificate" "ses_tracking" {
  domain_name       = "link.news.surefilter.us"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name    = "SES Tracking Domain Certificate"
    Purpose = "newsletter"
  }
}

resource "aws_route53_record" "ses_tracking_acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.ses_tracking.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "ses_tracking" {
  certificate_arn         = aws_acm_certificate.ses_tracking.arn
  validation_record_fqdns = [for r in aws_route53_record.ses_tracking_acm_validation : r.fqdn]

  timeouts {
    create = "10m"
  }
}

resource "aws_cloudfront_distribution" "ses_tracking" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "HTTPS proxy for SES tracking — link.news.surefilter.us"

  aliases = ["link.news.surefilter.us"]

  origin {
    domain_name = "r.${var.aws_region}.awstrack.me"
    origin_id   = "ses-tracking"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "ses-tracking"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      headers      = ["Host"]
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.ses_tracking.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name    = "surefilter-ses-tracking"
    Purpose = "newsletter"
  }
}

# DNS: link.news.surefilter.us → CloudFront (not direct CNAME to awstrack.me)
resource "aws_route53_record" "ses_tracking_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "link.news.surefilter.us"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.ses_tracking.domain_name
    zone_id                = aws_cloudfront_distribution.ses_tracking.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "ses_tracking_aaaa" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "link.news.surefilter.us"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.ses_tracking.domain_name
    zone_id                = aws_cloudfront_distribution.ses_tracking.hosted_zone_id
    evaluate_target_health = false
  }
}

# -----------------------------------------------------------------------------
# Configuration Set — tracking, dedicated IP pool & reputation management
# -----------------------------------------------------------------------------

# VDM (Virtual Deliverability Manager) — must be enabled at account level first
resource "aws_sesv2_account_vdm_attributes" "main" {
  vdm_enabled = "ENABLED"

  dashboard_attributes {
    engagement_metrics = "ENABLED"
  }

  guardian_attributes {
    optimized_shared_delivery = "ENABLED"
  }
}

resource "aws_sesv2_configuration_set" "newsletter" {
  configuration_set_name = "surefilter-newsletter"

  depends_on = [aws_sesv2_account_vdm_attributes.main]

  delivery_options {
    tls_policy        = "REQUIRE"
    sending_pool_name = aws_sesv2_dedicated_ip_pool.newsletter.pool_name
  }

  reputation_options {
    reputation_metrics_enabled = true
  }

  sending_options {
    sending_enabled = true
  }

  tracking_options {
    custom_redirect_domain = "link.news.surefilter.us"
  }

  # Suppression list — automatically suppress bounced and complained addresses
  suppression_options {
    suppressed_reasons = ["BOUNCE", "COMPLAINT"]
  }

  # TODO: Auto Validation options — enabled manually via AWS Console (threshold: HIGH).
  # Assesses deliverability likelihood before sending; suppresses if below threshold.
  # Not yet supported in Terraform AWS provider / CLI as of March 2026.
  # Move to Terraform when provider adds support.

  # VDM per-config-set: engagement tracking + optimized shared delivery
  vdm_options {
    dashboard_options {
      engagement_metrics = "ENABLED"
    }
    guardian_options {
      optimized_shared_delivery = "ENABLED"
    }
  }

  tags = {
    Name    = "surefilter-newsletter"
    Purpose = "newsletter"
  }
}

# -----------------------------------------------------------------------------
# SNS Topic — unified bounce & complaint notifications → listmonk webhook
# -----------------------------------------------------------------------------

resource "aws_sns_topic" "ses_notifications" {
  name = "surefilter-ses-notifications"

  tags = {
    Name    = "surefilter-ses-notifications"
    Purpose = "newsletter"
  }
}

# SNS → listmonk webhook (HTTPS subscription, raw delivery OFF per listmonk docs)
resource "aws_sns_topic_subscription" "listmonk_webhook" {
  topic_arn              = aws_sns_topic.ses_notifications.arn
  protocol               = "https"
  endpoint               = "https://newsletters.surefilter.us/webhooks/service/ses"
  endpoint_auto_confirms = true
  raw_message_delivery   = false
}

# SES identity-level notifications (bounce + complaint feedback with original headers)
# Using identity-level (not config set event destinations) — listmonk expects
# the standard SES notification format, not the config set event format.
resource "aws_ses_identity_notification_topic" "bounce" {
  topic_arn                = aws_sns_topic.ses_notifications.arn
  notification_type        = "Bounce"
  identity                 = aws_sesv2_email_identity.news.email_identity
  include_original_headers = true
}

resource "aws_ses_identity_notification_topic" "complaint" {
  topic_arn                = aws_sns_topic.ses_notifications.arn
  notification_type        = "Complaint"
  identity                 = aws_sesv2_email_identity.news.email_identity
  include_original_headers = true
}

# -----------------------------------------------------------------------------
# SMTP Credentials — IAM user for SES SMTP (listmonk)
# -----------------------------------------------------------------------------

resource "aws_iam_user" "ses_smtp" {
  name = "surefilter-ses-smtp"

  tags = {
    Name    = "surefilter-ses-smtp"
    Purpose = "newsletter"
  }
}

resource "aws_iam_user_policy" "ses_smtp" {
  name = "surefilter-ses-send"
  user = aws_iam_user.ses_smtp.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "ses:SendRawEmail"
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_access_key" "ses_smtp" {
  user = aws_iam_user.ses_smtp.name
}

# =============================================================================
# Amazon SES — transactional emails from mail.surefilter.us
# Dedicated IP pool, DKIM, custom MAIL FROM, suppression, VDM
# No tracking domain, no SNS notifications (suppression list is sufficient)
# =============================================================================

# -----------------------------------------------------------------------------
# Dedicated IP Pool (managed) — isolated reputation for transactional emails
# -----------------------------------------------------------------------------

resource "aws_sesv2_dedicated_ip_pool" "transactional" {
  pool_name    = "surefilter-transactional"
  scaling_mode = "MANAGED"

  tags = {
    Name    = "surefilter-transactional"
    Purpose = "transactional"
  }
}

# -----------------------------------------------------------------------------
# SES Domain Identity — mail.surefilter.us
# -----------------------------------------------------------------------------

resource "aws_sesv2_email_identity" "mail" {
  email_identity         = "mail.surefilter.us"
  configuration_set_name = aws_sesv2_configuration_set.transactional.configuration_set_name

  dkim_signing_attributes {
    next_signing_key_length = "RSA_2048_BIT"
  }

  tags = {
    Name        = "mail.surefilter.us"
    Environment = "production"
    Purpose     = "transactional"
  }
}

# -----------------------------------------------------------------------------
# DKIM — 3 CNAME records for Easy DKIM verification
# -----------------------------------------------------------------------------

resource "aws_route53_record" "ses_mail_dkim" {
  count   = 3
  zone_id = aws_route53_zone.main.zone_id
  name    = "${aws_sesv2_email_identity.mail.dkim_signing_attributes[0].tokens[count.index]}._domainkey.mail.surefilter.us"
  type    = "CNAME"
  ttl     = 3600
  records = ["${aws_sesv2_email_identity.mail.dkim_signing_attributes[0].tokens[count.index]}.dkim.amazonses.com"]
}

# -----------------------------------------------------------------------------
# Custom MAIL FROM domain — for SPF alignment
# -----------------------------------------------------------------------------

resource "aws_sesv2_email_identity_mail_from_attributes" "mail" {
  email_identity         = aws_sesv2_email_identity.mail.email_identity
  mail_from_domain       = "bounce.mail.surefilter.us"
  behavior_on_mx_failure = "USE_DEFAULT_VALUE"
}

# MX record for MAIL FROM domain
resource "aws_route53_record" "ses_mail_mail_from_mx" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "bounce.mail.surefilter.us"
  type    = "MX"
  ttl     = 3600
  records = ["10 feedback-smtp.${var.aws_region}.amazonses.com"]
}

# SPF record for MAIL FROM domain
resource "aws_route53_record" "ses_mail_mail_from_spf" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "bounce.mail.surefilter.us"
  type    = "TXT"
  ttl     = 3600
  records = ["v=spf1 include:amazonses.com -all"]
}

# -----------------------------------------------------------------------------
# Configuration Set — transactional: dedicated IP pool, suppression, VDM
# No tracking domain (not needed for form notifications)
# -----------------------------------------------------------------------------

resource "aws_sesv2_configuration_set" "transactional" {
  configuration_set_name = "surefilter-transactional"

  depends_on = [aws_sesv2_account_vdm_attributes.main]

  delivery_options {
    tls_policy        = "REQUIRE"
    sending_pool_name = aws_sesv2_dedicated_ip_pool.transactional.pool_name
  }

  reputation_options {
    reputation_metrics_enabled = true
  }

  sending_options {
    sending_enabled = true
  }

  # Suppression list — automatically suppress bounced and complained addresses
  suppression_options {
    suppressed_reasons = ["BOUNCE", "COMPLAINT"]
  }

  # VDM per-config-set: engagement tracking + optimized shared delivery
  vdm_options {
    dashboard_options {
      engagement_metrics = "ENABLED"
    }
    guardian_options {
      optimized_shared_delivery = "ENABLED"
    }
  }

  tags = {
    Name    = "surefilter-transactional"
    Purpose = "transactional"
  }
}

# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------

output "ses_identity_arn" {
  value       = aws_sesv2_email_identity.news.arn
  description = "SES identity ARN for news.surefilter.us"
}

output "ses_mail_identity_arn" {
  value       = aws_sesv2_email_identity.mail.arn
  description = "SES identity ARN for mail.surefilter.us"
}

output "ses_transactional_configuration_set" {
  value       = aws_sesv2_configuration_set.transactional.configuration_set_name
  description = "SES configuration set name for transactional emails"
}

output "ses_configuration_set" {
  value       = aws_sesv2_configuration_set.newsletter.configuration_set_name
  description = "SES configuration set name for newsletters"
}

output "ses_dedicated_ip_pool" {
  value       = aws_sesv2_dedicated_ip_pool.newsletter.pool_name
  description = "Dedicated IP pool for newsletters"
}

output "ses_smtp_host" {
  value       = "email-smtp.${var.aws_region}.amazonaws.com"
  description = "SES SMTP endpoint"
}

output "ses_smtp_user" {
  value       = aws_iam_access_key.ses_smtp.id
  description = "SES SMTP username (IAM Access Key ID)"
}

output "ses_smtp_password" {
  value       = aws_iam_access_key.ses_smtp.ses_smtp_password_v4
  sensitive   = true
  description = "SES SMTP password — retrieve: tofu output -raw ses_smtp_password"
}
