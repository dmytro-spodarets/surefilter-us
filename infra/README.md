# Infra (OpenTofu + AWS via Scalr)

## Overview
- **IaC Tool:** OpenTofu (open-source Terraform fork)
- **Region:** us-east-1
- **Components:** ECR (surefilter), RDS PostgreSQL, SSM Parameter Store (DATABASE_URL), App Runner (surefilter-prod), IAM roles
- **Orchestration:** Scalr (remote runs, state, RBAC) — connect repo and create prod workspace.

## Structure
- modules/
  - ecr/ — ECR repo "surefilter"
  - rds/ — PostgreSQL 15, db.t4g.micro, 20GB, public access allowed (0.0.0.0/0) for initial import
  - secrets/ — "surefilter/prod/DATABASE_URL"
  - iam/ — roles: GitHub OIDC (push to ECR), App Runner (pull ECR + read secret)
  - apprunner/ — service "surefilter-prod" from ":release"
- envs/prod/ — wiring; default VPC/subnet discovery if not provided

## Prerequisites
- AWS account with permissions to create IAM/ECR/RDS/Secrets/App Runner
- Scalr organization/workspace configured for OpenTofu in "us-east-1" (remote runs)
- GitHub secrets: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (for ECR push)

## First Run (prod)
1) In Scalr, create workspace "prod" pointing to path infra/envs/prod. State is stored in Scalr via Terraform remote backend (see providers.tf).
2) Create secrets file:
   ```bash
   cd envs/prod
   cp secrets.tfvars.example secrets.tfvars
   # Edit secrets.tfvars and add your TinyMCE API key
   ```
3) Set variables as needed:
   - aws_region = "us-east-1"
   - vpc_id, subnet_ids (optional; fallback to default VPC)
4) Plan → Apply:
   ```bash
   tofu plan -var-file="secrets.tfvars"
   tofu apply -var-file="secrets.tfvars"
   ```
5) Note outputs:
   - rds_endpoint
   - database_url_secret_arn

**Important:** `secrets.tfvars` is gitignored. See `envs/prod/SECRETS.md` for details.

## CI (GitHub Actions)
- Workflow .github/workflows/ci-build-push.yml builds surefilter-ui/Dockerfile and pushes to ECR with tags ${sha} and release.
- Requires secrets: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.

## Database import (temporary public access)
- Local dump (example):
  - pg_dump -h localhost -U surefilter -d surefilter -Fc -f backup.dump
- Restore to RDS (example):
  - pg_restore -h <rds_endpoint> -U surefilter -d surefilter -Fc backup.dump
  - or: psql -h <rds_endpoint> -U surefilter -d surefilter -f seed.sql
- After import (optional hardening):
  - Replace 0.0.0.0/0 ingress with allowlist or move to private subnets + App Runner VPC connector.

## App Runner
- Auto-deploy from ECR tag "release".
- Instance: 1 vCPU / 2GB, port 3000, health "/".
- Env: DATABASE_URL from Secrets Manager.

## Reference
- Scalr — Terraform & OpenTofu Self-Service: https://scalr.com/
