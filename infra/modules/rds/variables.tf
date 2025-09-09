variable "name" {
  description = "RDS instance identifier prefix"
  type        = string
}

variable "engine_version" {
  type        = string
  default     = "15"
}

variable "instance_class" {
  type        = string
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  type        = number
  default     = 20
}

variable "db_name" {
  type        = string
  default     = "surefilter"
}

variable "db_username" {
  type        = string
  default     = "surefilter"
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "ingress_cidrs" {
  type        = list(string)
  description = "CIDRs allowed to connect to Postgres"
}

variable "publicly_accessible" {
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  type        = number
  default     = 7
}

variable "skip_final_snapshot" {
  type        = bool
  default     = true
}

variable "deletion_protection" {
  type        = bool
  default     = true
}


