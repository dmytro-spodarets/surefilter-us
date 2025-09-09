output "github_oidc_role_arn" {
  value = aws_iam_role.github_oidc.arn
}

output "apprunner_task_role_arn" {
  value = aws_iam_role.apprunner_task.arn
}

output "apprunner_instance_role_arn" {
  value = aws_iam_role.apprunner_instance.arn
}


