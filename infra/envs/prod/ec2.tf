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
