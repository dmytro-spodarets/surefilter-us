resource "random_password" "dbpw" {
  length  = 24
  special = true
}
resource "random_password" "nextauth" {
  length  = 32
  special = true
}

resource "aws_ssm_parameter" "database_url" {
  name  = "/surefilter/DATABASE_URL"
  type  = "SecureString"
  # SSL is configured in application code (src/lib/prisma.ts) with certificate verification
  # sslmode parameter is not needed as pg Pool handles SSL via ssl config object
  value = "postgresql://surefilter:${urlencode("${random_password.dbpw.result}")}@${aws_db_instance.surefilter.address}:5432/surefilter?schema=public"
}

resource "aws_ssm_parameter" "nextauth_secret" {
  name  = "/surefilter/NEXTAUTH_SECRET"
  type  = "SecureString"
  value = random_password.nextauth.result
}

resource "random_password" "origin_secret" {
  length  = 32
  special = false
}

resource "aws_ssm_parameter" "origin_secret" {
  name  = "/surefilter/ORIGIN_SECRET"
  type  = "SecureString"
  value = random_password.origin_secret.result
}

# TinyMCE API Key - loaded from secrets.tfvars
resource "aws_ssm_parameter" "tinymce_api_key" {
  name  = "/surefilter/TINYMCE_API_KEY"
  type  = "SecureString"
  value = var.tinymce_api_key
}

