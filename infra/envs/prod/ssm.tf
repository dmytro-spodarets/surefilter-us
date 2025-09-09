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
  value = "postgresql://surefilter:${urlencode("${random_password.dbpw.result}")}@${aws_db_instance.surefilter.address}:5432/surefilter?schema=public"
}

resource "aws_ssm_parameter" "nextauth_secret" {
  name  = "/surefilter/NEXTAUTH_SECRET"
  type  = "SecureString"
  value = random_password.nextauth.result
}


