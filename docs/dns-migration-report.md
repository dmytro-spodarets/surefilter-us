# DNS Migration Report: surefilter.us
## HostGator → AWS Route53

**Comparison Date:** 2026-03-04 15:46:17 PST

**Old NS at registrar (HostGator):** hgns1.hostgator.com, hgns2.hostgator.com
**Old NS in zone file:** ns8003.hostgator.com, ns8004.hostgator.com
**New NS (Route53):** ns-482.awsdns-60.com, ns-659.awsdns-18.net, ns-1492.awsdns-58.org, ns-1570.awsdns-04.co.uk

**Terraform config:** `infra/envs/prod/route53.tf`
**Route53 Zone ID:** output from `tofu output route53_zone_id`

---

## Summary

| Status | Count |
|--------|-------|
| ✅ Match | 50 |
| ⚠️ Expected difference | 1 |
| ❌ Mismatch | 0 |
| **Total** | **51** |

**✅ SAFE TO SWITCH NS — all records match or have documented expected differences.**

### Expected Difference

| Record | Type | Reason |
|--------|------|--------|
| surefilter.us | MX | Updated from 5 legacy `aspmx.l.google.com` records to single `smtp.google.com` (new Google Workspace format, both fully supported) |

### Notes on DKIM Records

Three DKIM TXT records (`default._domainkey` for root, aapex, special) have identical content but different string split points. DNS TXT records >255 chars must be split into multiple character-strings. HostGator and Route53 split at different positions, but the concatenated values are byte-identical. DKIM validators concatenate all strings before processing — no functional difference.

---

## Detailed Comparison

| # | Record | Type | Status | Value / Notes |
|---|--------|------|--------|---------------|
| 1 | surefilter.us | A | ✅ | 216.172.190.75 |
| 2 | surefilter.us | MX | ⚠️ | OLD: 5 aspmx records → NEW: 1 smtp.google.com |
| 3 | surefilter.us | TXT | ✅ | SPF + Google site verification |
| 4 | www.surefilter.us | CNAME | ✅ | surefilter.us |
| 5 | ftp.surefilter.us | CNAME | ✅ | surefilter.us |
| 6 | aapex.surefilter.us | A | ✅ | 192.185.16.232 |
| 7 | special.surefilter.us | A | ✅ | 192.185.16.232 |
| 8 | mail.surefilter.us | A | ✅ | 192.185.16.232 |
| 9 | test.surefilter.us | A | ✅ | 52.29.72.131 |
| 10 | autoconfig.surefilter.us | A | ✅ | 192.185.16.232 |
| 11 | autodiscover.surefilter.us | A | ✅ | 192.185.16.232 |
| 12 | cpanel.surefilter.us | A | ✅ | 192.185.16.232 |
| 13 | webdisk.surefilter.us | A | ✅ | 192.185.16.232 |
| 14 | webmail.surefilter.us | A | ✅ | 192.185.16.232 |
| 15 | whm.surefilter.us | A | ✅ | 192.185.16.232 |
| 16 | autoconfig.aapex.surefilter.us | A | ✅ | 192.185.16.232 |
| 17 | autodiscover.aapex.surefilter.us | A | ✅ | 192.185.16.232 |
| 18 | cpanel.aapex.surefilter.us | A | ✅ | 192.185.16.232 |
| 19 | webdisk.aapex.surefilter.us | A | ✅ | 192.185.16.232 |
| 20 | webmail.aapex.surefilter.us | A | ✅ | 192.185.16.232 |
| 21 | whm.aapex.surefilter.us | A | ✅ | 192.185.16.232 |
| 22 | www.aapex.surefilter.us | A | ✅ | 192.185.16.232 |
| 23 | autoconfig.special.surefilter.us | A | ✅ | 192.185.16.232 |
| 24 | autodiscover.special.surefilter.us | A | ✅ | 192.185.16.232 |
| 25 | cpanel.special.surefilter.us | A | ✅ | 192.185.16.232 |
| 26 | webdisk.special.surefilter.us | A | ✅ | 192.185.16.232 |
| 27 | webmail.special.surefilter.us | A | ✅ | 192.185.16.232 |
| 28 | whm.special.surefilter.us | A | ✅ | 192.185.16.232 |
| 29 | www.special.surefilter.us | A | ✅ | 192.185.16.232 |
| 30 | _dmarc.surefilter.us | TXT | ✅ | v=DMARC1;p=none |
| 31 | default._domainkey.surefilter.us | TXT | ✅ | DKIM (1024-bit, content identical) |
| 32 | default._domainkey.aapex.surefilter.us | TXT | ✅ | DKIM (2048-bit, content identical, split differs) |
| 33 | default._domainkey.special.surefilter.us | TXT | ✅ | DKIM (2048-bit, content identical, split differs) |
| 34 | aapex.surefilter.us | TXT | ✅ | SPF |
| 35 | special.surefilter.us | TXT | ✅ | SPF |
| 36 | eo._domainkey.surefilter.us | CNAME | ✅ | eoidentity.com |
| 37 | eom.surefilter.us | CNAME | ✅ | eoidentity.com |
| 38 | eot.surefilter.us | CNAME | ✅ | eoidentity.com |
| 39 | 37808040.surefilter.us | CNAME | ✅ | eoidentity.com |
| 40 | ziqf6nyxctab.surefilter.us | CNAME | ✅ | Google domain verification |
| 41 | _acme-challenge.surefilter.us | TXT | ✅ | Let's Encrypt |
| 42 | _acme-challenge.aapex.surefilter.us | TXT | ✅ | Let's Encrypt |
| 43 | _acme-challenge.www.surefilter.us | TXT | ✅ | Let's Encrypt |
| 44 | _acme-challenge.cpcalendars.surefilter.us | TXT | ✅ | Let's Encrypt |
| 45 | _acme-challenge.cpcontacts.surefilter.us | TXT | ✅ | Let's Encrypt |
| 46 | _cpanel-dcv-test-record.surefilter.us | TXT | ✅ | cPanel DCV |
| 47 | new.surefilter.us | NS | ✅ | Delegated to Route53 sub-zone |
| 48 | assets.surefilter.us | NS | ✅ | Delegated to Route53 sub-zone |
| 49 | _autodiscover._tcp.surefilter.us | SRV | ✅ | 0 0 443 cpanelemaildiscovery.cpanel.net |
| 50 | _autodiscover._tcp.aapex.surefilter.us | SRV | ✅ | 0 0 443 cpanelemaildiscovery.cpanel.net |
| 51 | _autodiscover._tcp.special.surefilter.us | SRV | ✅ | 0 0 443 cpanelemaildiscovery.cpanel.net |

---

## Next Steps

1. Update NS records at domain registrar to Route53 nameservers
2. Wait for propagation (up to 48h, typically 1-4h)
3. Verify with `dig surefilter.us NS` that Route53 servers are responding
4. After propagation confirmed, old HostGator DNS can be decommissioned
