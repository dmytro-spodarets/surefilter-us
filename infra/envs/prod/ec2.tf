# =============================================================================
# EC2 Instance — Ubuntu 24.04 LTS (ARM64 / Graviton)
# =============================================================================

# Latest Ubuntu 24.04 LTS AMI for arm64 (Graviton)
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-arm64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "architecture"
    values = ["arm64"]
  }
}

resource "tls_private_key" "ec2" {
  algorithm = "ED25519"
}

resource "aws_key_pair" "ec2" {
  key_name   = "surefilter-prod"
  public_key = tls_private_key.ec2.public_key_openssh
}

resource "aws_security_group" "ec2" {
  name        = "surefilter-ec2"
  description = "SSH access for EC2 instance"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description      = "All inbound traffic"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    description      = "All outbound traffic"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "surefilter-ec2"
  }
}

resource "aws_instance" "main" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t4g.medium"
  key_name               = aws_key_pair.ec2.key_name
  vpc_security_group_ids = [aws_security_group.ec2.id]
  subnet_id              = data.aws_subnets.default.ids[0]

  associate_public_ip_address = true

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
    encrypted   = true
  }

  tags = {
    Name        = "surefilter-prod"
    Environment = "production"
  }

  # Prevent instance recreation when AMI updates — listmonk data lives on root volume
  lifecycle {
    ignore_changes = [ami]
  }
}

# Elastic IP — static address so DNS stays valid across instance stop/start
resource "aws_eip" "main" {
  instance = aws_instance.main.id

  tags = {
    Name = "surefilter-prod"
  }
}

# DNS: newsletters.surefilter.us → EC2
resource "aws_route53_record" "newsletters_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "newsletters.surefilter.us"
  type    = "A"
  ttl     = 300
  records = [aws_eip.main.public_ip]
}

# =============================================================================
# AWS Backup — daily snapshots of EC2 instance (listmonk data protection)
# =============================================================================

resource "aws_backup_vault" "ec2" {
  name = "surefilter-ec2-backup"

  tags = {
    Name        = "surefilter-ec2-backup"
    Environment = "production"
  }
}

resource "aws_backup_plan" "ec2" {
  name = "surefilter-ec2-backup"

  # Daily snapshots — keep 7 days
  rule {
    rule_name         = "daily"
    target_vault_name = aws_backup_vault.ec2.name
    schedule          = "cron(0 5 * * ? *)" # Daily at 5:00 UTC (1:00 AM ET)

    lifecycle {
      delete_after = 7
    }
  }

  # Weekly snapshot (Sunday) — keep 30 days
  rule {
    rule_name         = "weekly"
    target_vault_name = aws_backup_vault.ec2.name
    schedule          = "cron(0 4 ? * 1 *)" # Sunday at 4:00 UTC

    lifecycle {
      delete_after = 30
    }
  }

  tags = {
    Name = "surefilter-ec2-backup"
  }
}

# IAM role for AWS Backup
resource "aws_iam_role" "backup" {
  name = "surefilter-backup-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "backup.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })

  tags = {
    Name = "surefilter-backup-role"
  }
}

resource "aws_iam_role_policy_attachment" "backup" {
  role       = aws_iam_role.backup.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}

resource "aws_iam_role_policy_attachment" "backup_restore" {
  role       = aws_iam_role.backup.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores"
}

# Assign EC2 instance to backup plan
resource "aws_backup_selection" "ec2" {
  name         = "surefilter-ec2"
  iam_role_arn = aws_iam_role.backup.arn
  plan_id      = aws_backup_plan.ec2.id

  resources = [
    aws_instance.main.arn,
  ]
}

output "ec2_public_ip" {
  value       = aws_eip.main.public_ip
  description = "Elastic IP of the EC2 instance"
}

output "ec2_ami_name" {
  value       = data.aws_ami.ubuntu.name
  description = "Ubuntu AMI used"
}

output "ec2_private_key" {
  value       = tls_private_key.ec2.private_key_openssh
  sensitive   = true
  description = "Private SSH key — save to file: tofu output -raw ec2_private_key > ~/.ssh/surefilter-prod.pem && chmod 600 ~/.ssh/surefilter-prod.pem"
}
