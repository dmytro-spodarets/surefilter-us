# =============================================================================
# Route53 Hosted Zone for surefilter.us (main domain)
# Migration from HostGator DNS — full 1:1 copy of all records
# =============================================================================

resource "aws_route53_zone" "main" {
  name    = "surefilter.us"
  comment = "Primary zone for surefilter.us — migrated from HostGator"

  tags = {
    Name        = "surefilter.us"
    Environment = "production"
  }
}

# -----------------------------------------------------------------------------
# NS delegation for existing Route53 sub-zones
# -----------------------------------------------------------------------------

data "aws_route53_zone" "new" {
  zone_id = "Z003662317J6SYETHU44S"
}

data "aws_route53_zone" "assets" {
  zone_id = "Z082426231T6TCGJMQI1G"
}

resource "aws_route53_record" "ns_new" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "new.surefilter.us"
  type    = "NS"
  ttl     = 3600
  records = data.aws_route53_zone.new.name_servers
}

resource "aws_route53_record" "ns_assets" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "assets.surefilter.us"
  type    = "NS"
  ttl     = 3600
  records = data.aws_route53_zone.assets.name_servers
}

# -----------------------------------------------------------------------------
# A Records
# -----------------------------------------------------------------------------

# Root domain → CloudFront (alias records in cloudfront.tf: alias_a, alias_aaaa)

# Old site (HostGator) — accessible via old.surefilter.us
resource "aws_route53_record" "old_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "old.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["216.172.190.75"]
}

# Subdomains — active sites
resource "aws_route53_record" "aapex_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "aapex.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "special_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "special.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "mail_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "mail.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "test_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "test.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["52.29.72.131"]
}

# cPanel subdomains — root
resource "aws_route53_record" "autoconfig_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "autoconfig.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "autodiscover_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "autodiscover.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "cpanel_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "cpanel.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "webdisk_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "webdisk.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "webmail_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "webmail.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "whm_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "whm.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

# cPanel subdomains — aapex
resource "aws_route53_record" "autoconfig_aapex_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "autoconfig.aapex.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "autodiscover_aapex_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "autodiscover.aapex.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "cpanel_aapex_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "cpanel.aapex.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "webdisk_aapex_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "webdisk.aapex.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "webmail_aapex_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "webmail.aapex.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "whm_aapex_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "whm.aapex.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "www_aapex_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.aapex.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

# cPanel subdomains — special
resource "aws_route53_record" "autoconfig_special_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "autoconfig.special.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "autodiscover_special_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "autodiscover.special.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "cpanel_special_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "cpanel.special.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "webdisk_special_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "webdisk.special.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "webmail_special_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "webmail.special.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "whm_special_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "whm.special.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

resource "aws_route53_record" "www_special_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.special.surefilter.us"
  type    = "A"
  ttl     = 3600
  records = ["192.185.16.232"]
}

# -----------------------------------------------------------------------------
# MX Records (Google Workspace)
# -----------------------------------------------------------------------------

resource "aws_route53_record" "root_mx" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "surefilter.us"
  type    = "MX"
  ttl     = 3600
  records = [
    "1 smtp.google.com",
  ]
}

# -----------------------------------------------------------------------------
# CNAME Records
# -----------------------------------------------------------------------------

# www.surefilter.us → CloudFront (alias records in cloudfront.tf: www_alias_a, www_alias_aaaa)

resource "aws_route53_record" "ftp_cname" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "ftp.surefilter.us"
  type    = "CNAME"
  ttl     = 3600
  records = ["old.surefilter.us"]
}

# Email identity (eoidentity)
resource "aws_route53_record" "eoidentity_37808040_cname" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "37808040.surefilter.us"
  type    = "CNAME"
  ttl     = 3600
  records = ["37808040.bcc6186e7d.berenice.eoidentity.com"]
}

resource "aws_route53_record" "eo_domainkey_cname" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "eo._domainkey.surefilter.us"
  type    = "CNAME"
  ttl     = 3600
  records = ["eo._domainkey.bcc6186e7d.berenice.eoidentity.com"]
}

resource "aws_route53_record" "eom_cname" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "eom.surefilter.us"
  type    = "CNAME"
  ttl     = 3600
  records = ["eom.bcc6186e7d.berenice.eoidentity.com"]
}

resource "aws_route53_record" "eot_cname" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "eot.surefilter.us"
  type    = "CNAME"
  ttl     = 3600
  records = ["eot.bcc6186e7d.berenice.eoidentity.com"]
}

# Google domain verification
resource "aws_route53_record" "google_verify_cname" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "ziqf6nyxctab.surefilter.us"
  type    = "CNAME"
  ttl     = 3600
  records = ["gv-r2m2ggyvq4mhmc.dv.googlehosted.com"]
}

# -----------------------------------------------------------------------------
# TXT Records
# -----------------------------------------------------------------------------

# Root TXT — SPF + Google site verification (multiple values in one record)
resource "aws_route53_record" "root_txt" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "surefilter.us"
  type    = "TXT"
  ttl     = 3600
  records = [
    "v=spf1 a mx include:websitewelcome.com ~all",
    "google-site-verification=eTL6IP54rfesp4J4dTrIwl09v1QVaHtKYLyDu0PANXk",
  ]
}

# DKIM — root domain
resource "aws_route53_record" "dkim_default_txt" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "default._domainkey.surefilter.us"
  type    = "TXT"
  ttl     = 3600
  records = [
    "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7Shh5z+RhnyFU/KxbR6btK6kQRfTX0IW4VtOyaDBgK84+nwmFZWwEkfnlxw0FsBHiePKYiSy+cPNw6TYmmaO1TuIJB4MEd8CeaG3AL20ZGWyz488aXfIHqjKTB5itd8IUliBAJozDp95szAxzk4QhCZX+uS3Qe5mwvcSd47lFKQIDAQAB;",
  ]
}

# DMARC
resource "aws_route53_record" "dmarc_txt" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_dmarc.surefilter.us"
  type    = "TXT"
  ttl     = 3600
  records = ["v=DMARC1;p=none"]
}

# aapex subdomain TXT — SPF
resource "aws_route53_record" "aapex_txt" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "aapex.surefilter.us"
  type    = "TXT"
  ttl     = 3600
  records = ["v=spf1 +a +mx +ip4:192.185.4.13 ~all"]
}

# DKIM — aapex
resource "aws_route53_record" "dkim_aapex_txt" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "default._domainkey.aapex.surefilter.us"
  type    = "TXT"
  ttl     = 3600
  records = [
    "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3/RtbQ8S1V8k5PxoBSilMuMhQWpLXojOysfj2SUAHCLRSlLXktecg/ikyQqBCqkqtnPQgOVAYeWYjhyRlcbDjP9nYICogeHScpWH60MnYD9RRcfZZtAG9nuWaseJgkaNbSSYUB6R3WbHTQwTLaYRv5TWOOCBEKiPdOTLJtIX644Pqk\" \"C2eC3qOQ/sM3tlNH95Wc7YiKV/FrB98gnBf1Ra+/QZjE43N/ycMyqWnEMGajOo42LW9Q65jj5riGEXomPIXqEW6NnfKtgeB+2DTbiTT4eH9zl5BDk6M0kq2O4PJ2hELi00oY/fUJwG5DN2eEPMJjeREVcn+yPbhS6lE7dlgwIDAQAB;",
  ]
}

# special subdomain TXT — SPF
resource "aws_route53_record" "special_txt" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "special.surefilter.us"
  type    = "TXT"
  ttl     = 3600
  records = ["v=spf1 +a +mx +ip4:192.185.4.13 ~all"]
}

# DKIM — special
resource "aws_route53_record" "dkim_special_txt" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "default._domainkey.special.surefilter.us"
  type    = "TXT"
  ttl     = 3600
  records = [
    "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtfw00bIFEzCpXXTFkD6NDX/0xcgBdNWYx5KLbokbxymmEvg8ZLxUi9pC3onQjjdgTidWlFTnz1DhaCh5RmwF9Fj5tz9/3cREuiCdKWL0YnR1hmyF29SFX7dolI6BcHkhU5ipn0rSQwAM1r0oPtq3FTZcsQd5BoVwJs3q1jeZBy1uyw59MyY8eSdUDX\" \"4oa4/ejgSChCKcgqH4YmdXNfb7buX4DUavqgf4iCP+k51cqQSxWnXLXtT98tAUWjxFpQDxJdBXvarWqpv94dTSz+jCCm595MvXvYSlMnbRNDc4MssnEXCYxOJ9cNmnPaLAoF13gMgeM6yXiZqi4ATfjncqFQIDAQAB;",
  ]
}

# ACME challenge records (Let's Encrypt / cPanel SSL)
resource "aws_route53_record" "acme_root_txt" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_acme-challenge.surefilter.us"
  type    = "TXT"
  ttl     = 3600
  records = ["hBDEf1vvWGq6zTQkxUhY3BhdfI0dvd6whnHhoxxi4Rg"]
}

resource "aws_route53_record" "acme_aapex_txt" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_acme-challenge.aapex.surefilter.us"
  type    = "TXT"
  ttl     = 3600
  records = ["7v7GEG5ZPvgeX_j3kufcN7pZUel0nHbT3VTJmvCURhI"]
}

resource "aws_route53_record" "acme_www_txt" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_acme-challenge.www.surefilter.us"
  type    = "TXT"
  ttl     = 3600
  records = ["bydROuQKE1DPZgY67xUwcveKNSO9gFHW64bK-vKa6w8"]
}

resource "aws_route53_record" "acme_cpcalendars_txt" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_acme-challenge.cpcalendars.surefilter.us"
  type    = "TXT"
  ttl     = 3600
  records = ["b8-JxuzczlKG6SNjKNf-BhalHUyCGHSKyKB-5QAhCbU"]
}

resource "aws_route53_record" "acme_cpcontacts_txt" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_acme-challenge.cpcontacts.surefilter.us"
  type    = "TXT"
  ttl     = 3600
  records = ["ROxnwLMYdYJlIgOxJLoaMnLzdQPbmDn0YUtCTkUDvHE"]
}

# cPanel DCV test record
resource "aws_route53_record" "cpanel_dcv_txt" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_cpanel-dcv-test-record.surefilter.us"
  type    = "TXT"
  ttl     = 3600
  records = ["_cpanel-dcv-test-record=5cITZV9Y_yroFET1R1V1SNy_AUUEvIkqO2e5PCeIBqXzxhNzWbfysxkxodZNovNC"]
}

# -----------------------------------------------------------------------------
# SRV Records (cPanel autodiscovery)
# -----------------------------------------------------------------------------

resource "aws_route53_record" "autodiscover_srv" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_autodiscover._tcp.surefilter.us"
  type    = "SRV"
  ttl     = 3600
  records = ["0 0 443 cpanelemaildiscovery.cpanel.net"]
}

resource "aws_route53_record" "autodiscover_aapex_srv" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_autodiscover._tcp.aapex.surefilter.us"
  type    = "SRV"
  ttl     = 3600
  records = ["0 0 443 cpanelemaildiscovery.cpanel.net"]
}

resource "aws_route53_record" "autodiscover_special_srv" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_autodiscover._tcp.special.surefilter.us"
  type    = "SRV"
  ttl     = 3600
  records = ["0 0 443 cpanelemaildiscovery.cpanel.net"]
}

# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------

output "route53_zone_id" {
  value       = aws_route53_zone.main.zone_id
  description = "Zone ID for surefilter.us — use for NS update at registrar"
}

output "route53_name_servers" {
  value       = aws_route53_zone.main.name_servers
  description = "NS servers to set at domain registrar"
}
