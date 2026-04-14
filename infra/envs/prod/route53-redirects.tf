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

# surefilter.eu
resource "aws_route53_record" "redirect_eu_a" {
  zone_id = aws_route53_zone.redirect_eu.zone_id
  name    = "surefilter.eu"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "redirect_eu_aaaa" {
  zone_id = aws_route53_zone.redirect_eu.zone_id
  name    = "surefilter.eu"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

# www.surefilter.eu
resource "aws_route53_record" "redirect_www_eu_a" {
  zone_id = aws_route53_zone.redirect_eu.zone_id
  name    = "www.surefilter.eu"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "redirect_www_eu_aaaa" {
  zone_id = aws_route53_zone.redirect_eu.zone_id
  name    = "www.surefilter.eu"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

# surefilter.co
resource "aws_route53_record" "redirect_co_a" {
  zone_id = aws_route53_zone.redirect_co.zone_id
  name    = "surefilter.co"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "redirect_co_aaaa" {
  zone_id = aws_route53_zone.redirect_co.zone_id
  name    = "surefilter.co"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

# www.surefilter.co
resource "aws_route53_record" "redirect_www_co_a" {
  zone_id = aws_route53_zone.redirect_co.zone_id
  name    = "www.surefilter.co"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "redirect_www_co_aaaa" {
  zone_id = aws_route53_zone.redirect_co.zone_id
  name    = "www.surefilter.co"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

# surefilter.net
resource "aws_route53_record" "redirect_net_a" {
  zone_id = aws_route53_zone.redirect_net.zone_id
  name    = "surefilter.net"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "redirect_net_aaaa" {
  zone_id = aws_route53_zone.redirect_net.zone_id
  name    = "surefilter.net"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

# www.surefilter.net
resource "aws_route53_record" "redirect_www_net_a" {
  zone_id = aws_route53_zone.redirect_net.zone_id
  name    = "www.surefilter.net"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "redirect_www_net_aaaa" {
  zone_id = aws_route53_zone.redirect_net.zone_id
  name    = "www.surefilter.net"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

# --- DMARC ---

resource "aws_route53_record" "redirect_net_dmarc" {
  zone_id = aws_route53_zone.redirect_net.zone_id
  name    = "_dmarc.surefilter.net"
  type    = "CNAME"
  ttl     = 3600
  records = ["_dmarc.05x2kgkdk1ym8wzy-surefilter-net.hosteddmarc.dmarc-dns.com"]
}

# Google Workspace DKIM for surefilter.net (TXT record >255 chars — AWS auto-splits)
resource "aws_route53_record" "redirect_net_google_dkim" {
  zone_id = aws_route53_zone.redirect_net.zone_id
  name    = "google._domainkey.surefilter.net"
  type    = "TXT"
  ttl     = 3600
  records = [
    "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyktx2xFaZulSAeeFlik4NfWgKJqmaoyXGKZp/oZNuG4odBV9SaMRF7m8K5LQd8gDHdmC+UT3qY4AEVrPjAzFnjRJVQpmjVKgMOdDD7LX/NuyIPOmP3ryGBEBGN9JO+SX0lcecK9aKTo66QWHqpXmm\" \"SP2tpO8IkOjBRHpn0kKvqyrx1n7ypqFkBNqLDmFGWJj8Ev+OcEMKE/f5L3ZPQZlrWy/MgERE0HUyrjaq11i3lbB9YopuuldrvHbhlW9Bc2thLsXK6f/x98IXKOdptlv4FM8Y+KO/Y0HZGYKJG8RCtWyCBNy7e+9tAkNPEfTC9ypPtk8M0gQpAQVLoeCdnlNSwIDAQAB",
  ]
}

# --- Apollo.io tracking domain ---

resource "aws_route53_record" "link_net_cname" {
  zone_id = aws_route53_zone.redirect_net.zone_id
  name    = "link.surefilter.net"
  type    = "CNAME"
  ttl     = 3600
  records = ["jolly-kale.aploconnect.com"]
}

# --- Google Workspace: MX, SPF, verification for redirect domains ---

# surefilter.eu — MX + SPF (no verification data yet)
resource "aws_route53_record" "redirect_eu_mx" {
  zone_id = aws_route53_zone.redirect_eu.zone_id
  name    = "surefilter.eu"
  type    = "MX"
  ttl     = 3600
  records = ["1 smtp.google.com"]
}

resource "aws_route53_record" "redirect_eu_txt" {
  zone_id = aws_route53_zone.redirect_eu.zone_id
  name    = "surefilter.eu"
  type    = "TXT"
  ttl     = 3600
  records = [
    "v=spf1 include:_spf.google.com ~all",
  ]
}

# surefilter.co — MX + SPF + Google verification
resource "aws_route53_record" "redirect_co_mx" {
  zone_id = aws_route53_zone.redirect_co.zone_id
  name    = "surefilter.co"
  type    = "MX"
  ttl     = 3600
  records = ["1 smtp.google.com"]
}

resource "aws_route53_record" "redirect_co_txt" {
  zone_id = aws_route53_zone.redirect_co.zone_id
  name    = "surefilter.co"
  type    = "TXT"
  ttl     = 3600
  records = [
    "v=spf1 include:_spf.google.com ~all",
    "google-site-verification=K7nLgcTHQHlQZyNLzFcE8VXG04ZUIQuPorJuWzSQmKk",
  ]
}

resource "aws_route53_record" "redirect_co_google_verify" {
  zone_id = aws_route53_zone.redirect_co.zone_id
  name    = "xt37bcifelsr.surefilter.co"
  type    = "CNAME"
  ttl     = 3600
  records = ["gv-rh7uvzxnnljing.dv.googlehosted.com"]
}

# surefilter.net — MX + SPF + Google verification
resource "aws_route53_record" "redirect_net_mx" {
  zone_id = aws_route53_zone.redirect_net.zone_id
  name    = "surefilter.net"
  type    = "MX"
  ttl     = 3600
  records = ["1 smtp.google.com"]
}

resource "aws_route53_record" "redirect_net_txt" {
  zone_id = aws_route53_zone.redirect_net.zone_id
  name    = "surefilter.net"
  type    = "TXT"
  ttl     = 3600
  records = [
    "v=spf1 include:_spf.google.com ~all",
    "google-site-verification=3YL5pRSPc-ez5-Rx-_vMNCzIZ2IqCPGJ-vl2IeyNkbs",
  ]
}

resource "aws_route53_record" "redirect_net_google_verify" {
  zone_id = aws_route53_zone.redirect_net.zone_id
  name    = "stvas6m7dejt.surefilter.net"
  type    = "CNAME"
  ttl     = 3600
  records = ["gv-udrsjqgsu2ww2m.dv.googlehosted.com"]
}

# --- DNS Records: SES subdomains → CloudFront redirect distribution ---
# Browser visits to SES-only domains redirect to surefilter.us via CloudFront Function.
# news.surefilter.us and mail.surefilter.us are SES-only domains (no web content).
# These records redirect browser visits to surefilter.us via CloudFront Function.

# news.surefilter.us
resource "aws_route53_record" "redirect_news_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "news.surefilter.us"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "redirect_news_aaaa" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "news.surefilter.us"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

# mail.surefilter.us
resource "aws_route53_record" "redirect_mail_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "mail.surefilter.us"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "redirect_mail_aaaa" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "mail.surefilter.us"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

# notify.surefilter.us
resource "aws_route53_record" "redirect_notify_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "notify.surefilter.us"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "redirect_notify_aaaa" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "notify.surefilter.us"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.redirect.domain_name
    zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

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
