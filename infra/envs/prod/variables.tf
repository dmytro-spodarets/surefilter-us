variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "placeholder_db_host" {
  description = "Temporary DB host for building DATABASE_URL SSM param (can be updated later)"
  type        = string
  default     = "localhost"
}

variable "tinymce_api_key" {
  description = "TinyMCE API key for rich text editor"
  type        = string
  sensitive   = true
}

variable "enable_mcp_waf" {
  description = "Attach a WAFv2 web ACL with rate-based rules to the MCP CloudFront distribution. Adds ~$5/mo base cost; leave false until MCP traffic warrants it."
  type        = bool
  default     = false
}
