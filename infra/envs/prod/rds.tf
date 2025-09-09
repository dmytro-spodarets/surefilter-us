data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_db_subnet_group" "surefilter" {
  name       = "surefilter-prod-subnets"
  subnet_ids = slice(data.aws_subnets.default.ids, 0, 2)
}

resource "aws_security_group" "rds_public" {
  name        = "surefilter-rds-public"
  description = "Allow public Postgres access (temporary)"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "Postgres"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "surefilter" {
  identifier              = "surefilter-prod"
  engine                  = "postgres"
  engine_version          = "15"
  instance_class          = "db.t4g.micro"
  allocated_storage       = 20
  db_name                 = "surefilter"
  username                = "surefilter"
  password                = random_password.dbpw.result
  publicly_accessible     = true
  backup_retention_period = 7
  skip_final_snapshot     = true
  deletion_protection     = false

  db_subnet_group_name   = aws_db_subnet_group.surefilter.name
  vpc_security_group_ids = [aws_security_group.rds_public.id]
}

output "rds_endpoint" {
  value = aws_db_instance.surefilter.address
}


