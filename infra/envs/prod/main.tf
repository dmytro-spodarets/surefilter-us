module "ecr" {
  source          = "../../modules/ecr"
  repository_name = "surefilter"
}

locals {
  # Optional: discover default VPC and two subnets if not provided via variables
  vpc_id     = var.vpc_id != "" ? var.vpc_id : data.aws_vpc.default.id
  subnet_ids = length(var.subnet_ids) > 0 ? var.subnet_ids : slice(data.aws_subnets.default.ids, 0, 2)
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

module "rds" {
  source               = "../../modules/rds"
  name                 = "surefilter-prod"
  engine_version       = "15"
  instance_class       = "db.t4g.micro"
  allocated_storage    = 20
  db_name              = "surefilter"
  db_username          = "surefilter"
  vpc_id               = local.vpc_id
  subnet_ids           = local.subnet_ids
  ingress_cidrs        = var.public_ingress_cidrs
  publicly_accessible  = true
  backup_retention_days = 7
  skip_final_snapshot  = false
  deletion_protection  = true
}

module "secrets" {
  source     = "../../modules/secrets"
  secret_name = "surefilter/prod/DATABASE_URL"
  host       = module.rds.address
  username   = module.rds.db_username
  password   = module.rds.password
  db_name    = module.rds.db_name
}

module "iam" {
  source                     = "../../modules/iam"
  github_oidc_role_name      = "surefilter-github-oidc"
  github_repo                = var.github_repo
  apprunner_task_role_name   = "surefilter-apprunner-task"
  apprunner_instance_role_name = "surefilter-apprunner-instance"
  secretsmanager_secret_arns = [module.secrets.secret_arn]
}

module "apprunner" {
  source                   = "../../modules/apprunner"
  service_name             = "surefilter-prod"
  ecr_repository_url       = module.ecr.this_repository_url
  database_url_secret_arn  = module.secrets.secret_arn
  access_role_arn          = module.iam.apprunner_task_role_arn
  instance_role_arn        = module.iam.apprunner_instance_role_arn
  cpu                      = "1024"
  memory                   = "2048"
}

module "apprunner_domain" {
  source         = "../../modules/apprunner_domain"
  service_arn    = module.apprunner.service_arn
  domain_name    = "app.new.surefilter.us"
  hosted_zone_id = "Z003662317J6SYETHU44S"
}

module "acm" {
  source         = "../../modules/acm"
  domain_name    = "new.surefilter.us"
  hosted_zone_id = "Z003662317J6SYETHU44S"
}

module "cloudfront" {
  source          = "../../modules/cloudfront"
  domain_name     = "new.surefilter.us"
  certificate_arn = module.acm.certificate_arn
  origin_domain   = module.apprunner.service_url
  hosted_zone_id  = "Z003662317J6SYETHU44S"
}

output "rds_endpoint" {
  value = module.rds.address
}

output "database_url_secret_arn" {
  value = module.secrets.secret_arn
}

output "github_oidc_role_arn" {
  value = module.iam.github_oidc_role_arn
}


