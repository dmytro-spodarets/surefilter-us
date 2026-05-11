# Infra (OpenTofu + AWS)

## Overview
- **IaC Tool:** OpenTofu (open-source Terraform fork)
- **Region:** us-east-1
- **AWS Profile:** `surefilter-local`
- **State:** Local (`terraform.tfstate`)
- **Secrets:** `secrets.tfvars` (gitignored)

## Components

| Service | Resource | Details |
|---------|----------|---------|
| **Compute** | App Runner `surefilter-prod` | 1 vCPU / 2 GB, port 3000, ECR image |
| **Compute** | EC2 `surefilter-prod` | t4g.medium, Ubuntu 24.04 LTS ARM64, Elastic IP |
| **Database** | RDS PostgreSQL 15 | db.t4g.micro, 20 GB, public (temporary) |
| **CDN** | CloudFront (3 distributions) | site (surefilter.us), assets (assets.surefilter.us), SES tracking (link.news.surefilter.us) |
| **CDN** | CloudFront redirect (commented) | 301 redirect surefilter.eu/.co/.net → surefilter.us |
| **Storage** | S3 (3 buckets) | static-prod, files-prod, db-backups-prod |
| **Email** | SES | news.surefilter.us — DKIM 2048-bit, MAIL FROM, dedicated IP pool, VDM |
| **Registry** | ECR `surefilter` | Docker images |
| **DNS** | Route53 (4+ zones) | surefilter.us + surefilter.eu/.co/.net (redirect) |
| **SSL** | ACM (3 certificates) | site, assets, SES tracking |
| **Secrets** | SSM Parameter Store | DATABASE_URL, NEXTAUTH_SECRET, ORIGIN_SECRET, etc. |

## Structure

```
infra/envs/prod/
├── acm.tf                  # SSL certificates (site + assets)
├── acm-redirects.tf        # SSL certificate for redirect domains
├── app-runner.tf           # App Runner service
├── image-versions.tf       # Container image tags (App Runner ECR version)
├── cloudfront.tf           # Main CloudFront distribution + DNS records
├── cloudfront-assets.tf    # Assets CDN (assets.surefilter.us)
├── cloudfront-redirect.tf  # 301 redirect distribution (commented until NS delegation)
├── ec2.tf                  # EC2 instance + Elastic IP + SSH key + newsletters DNS
├── ecr.tf                  # Container registry
├── iam.tf                  # IAM roles (App Runner ECR + service)
├── iam-file-manager.tf     # File manager IAM
├── main.tf                 # Root config
├── providers.tf            # OpenTofu providers (aws, random, tls)
├── rds.tf                  # PostgreSQL database
├── route53.tf              # DNS — surefilter.us (main zone)
├── route53-redirects.tf    # DNS — redirect domains (eu/co/net zones)
├── s3.tf                   # Static assets bucket
├── s3-backup-bucket.tf     # DB backup bucket
├── s3-file-manager.tf      # File manager bucket
├── ses.tf                  # Amazon SES (email sending)
├── ssm.tf                  # Secrets and parameters
└── variables.tf            # Input variables
```

## Domains

| Domain | Target | Purpose |
|--------|--------|---------|
| `surefilter.us` | CloudFront → App Runner | Main site |
| `www.surefilter.us` | CloudFront → App Runner | www alias |
| `new.surefilter.us` | CloudFront → App Runner | Legacy alias |
| `assets.surefilter.us` | CloudFront → S3 | CDN for files |
| `newsletters.surefilter.us` | EC2 Elastic IP | Newsletter server |
| `news.surefilter.us` | SES domain identity | Email sending |
| `bounce.news.surefilter.us` | SES MAIL FROM | Bounce handling |
| `link.news.surefilter.us` | CloudFront → awstrack.me | Click/open tracking (HTTPS) |
| `surefilter.eu` | CloudFront redirect (pending) | 301 → surefilter.us |
| `surefilter.co` | CloudFront redirect (pending) | 301 → surefilter.us |
| `surefilter.net` | CloudFront redirect (pending) | 301 → surefilter.us |

## Quick Start

```bash
cd infra/envs/prod

# Init (first time or after adding providers)
tofu init

# Plan & Apply
tofu plan -var-file="secrets.tfvars"
tofu apply -var-file="secrets.tfvars"
```

## EC2 Access

```bash
# Save SSH key (after first apply)
tofu output -raw ec2_private_key > ~/.ssh/surefilter-prod.pem
chmod 600 ~/.ssh/surefilter-prod.pem

# Connect
ssh -i ~/.ssh/surefilter-prod.pem ubuntu@$(tofu output -raw ec2_public_ip)
```

## SES (Email)

- **Sending domain:** `news.surefilter.us`
- **Configuration set:** `surefilter-newsletter`
- **DKIM:** Easy DKIM 2048-bit (auto-rotation)
- **SPF:** Custom MAIL FROM `bounce.news.surefilter.us`
- **DMARC:** Inherited from `_dmarc.surefilter.us`
- **Tracking:** HTTPS via CloudFront (`link.news.surefilter.us`)
- **Dedicated IP pool:** Managed (auto-scaling)
- **VDM:** Enabled (engagement metrics + optimized delivery)
- **Suppression:** BOUNCE + COMPLAINT
- **Auto Validation:** HIGH (enabled via console — not yet in Terraform)
- **SMTP IAM user:** `surefilter-ses-smtp` (`ses:SendRawEmail` on `*`)
- **Bounce handling:** identity-level SNS notifications (Bounce + Complaint with original headers) → `surefilter-ses-notifications` SNS topic → HTTPS subscription → listmonk webhook
- **Webhook:** `https://newsletters.surefilter.us/webhooks/service/ses`

### SMTP Credentials (for listmonk)

```bash
cd infra/envs/prod

tofu output ses_smtp_host            # email-smtp.us-east-1.amazonaws.com
tofu output ses_smtp_user            # AKIA... (SMTP username)
tofu output -raw ses_smtp_password   # SMTP password (sensitive)
```

listmonk Settings → SMTP:
- **Host:** `email-smtp.us-east-1.amazonaws.com`
- **Port:** `587`
- **Auth:** `login`
- **Username/Password:** from outputs above
- **TLS:** STARTTLS

## Redirect Domains (pending)

Route53 zones created for `surefilter.eu`, `.co`, `.net`. Next steps:
1. Set NS servers at each registrar (`tofu output redirect_eu_name_servers`, etc.)
2. Wait for DNS propagation
3. Uncomment resources in `acm-redirects.tf`, `cloudfront-redirect.tf`, `route53-redirects.tf`
4. `tofu apply`

## Deploying a new App Runner image

The production image tag lives in `image-versions.tf` (variable `app_runner_image_version`). To roll out a new build:

```bash
# Option 1 — commit a new default
sed -i '' 's/default = "v[0-9.]*"/default = "v1.3.0"/' image-versions.tf
tofu apply -var-file=secrets.tfvars

# Option 2 — one-off override (no edit)
tofu apply -var-file=secrets.tfvars -var="app_runner_image_version=v1.3.0"
```

App Runner picks up the new tag and rolls the service in-place. `auto_deployments_enabled = false` keeps every release explicit.

## Known cosmetic drift

After `apply`, four resources keep showing a diff on every `plan` — this is provider-level normalization, not a real change:

- `aws_s3_bucket_policy.static` — AWS stores the OAI principal in legacy `Principal.AWS` ARN form; Terraform writes the equivalent `Principal.CanonicalUser`. Same OAI, same access.
- `aws_sesv2_configuration_set.{newsletter,mail,transactional}` — `tracking_options.https_policy: "OPTIONAL"` is the AWS default; the provider tries to write `null`.

Safe to ignore. To silence: add `lifecycle { ignore_changes = [policy] }` / `[tracking_options[0].https_policy]`, or migrate S3 access from OAI to OAC (TODO).

## CI/CD

- **Workflow:** `.github/workflows/ci-build-push.yml`
- **Build:** Docker image from `surefilter-ui/Dockerfile` (`NEXT_BUILD_SKIP_DB=1`)
- **Push:** ECR with tags `${SHA}` + `release`
- **Deploy:** App Runner watches ECR tag
- **Post-deploy:** `scripts/warm-up.sh` → `/api/warm-up`

## Database

```bash
# Backup
pg_dump -h <rds_endpoint> -U surefilter -d surefilter -Fc -f backup.dump

# Restore
pg_restore -h <rds_endpoint> -U surefilter -d surefilter -Fc backup.dump
```

## All Outputs Reference

```bash
cd infra/envs/prod

# EC2
tofu output ec2_public_ip                  # Elastic IP
tofu output ec2_ami_name                   # Ubuntu AMI used
tofu output -raw ec2_private_key           # SSH private key (sensitive)

# SES / SMTP
tofu output ses_smtp_host                  # SMTP endpoint
tofu output ses_smtp_user                  # SMTP username
tofu output -raw ses_smtp_password         # SMTP password (sensitive)
tofu output ses_identity_arn               # SES identity ARN
tofu output ses_configuration_set          # Config set name
tofu output ses_dedicated_ip_pool          # IP pool name

# DNS — redirect domains (NS servers for registrar)
tofu output redirect_eu_name_servers       # surefilter.eu NS
tofu output redirect_co_name_servers       # surefilter.co NS
tofu output redirect_net_name_servers      # surefilter.net NS

# Infrastructure
tofu output route53_zone_id               # Main zone ID
tofu output route53_name_servers           # Main zone NS
tofu output rds_endpoint                   # PostgreSQL host
tofu output acm_certificate_arn            # Site SSL cert
tofu output assets_acm_certificate_arn     # Assets SSL cert
```
