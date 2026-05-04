variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short name used to prefix resource names"
  type        = string
  default     = "chat"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.20.0.0/16"
}

variable "db_username" {
  description = "Master username for the RDS Postgres instance"
  type        = string
  default     = "chatuser"
}

variable "db_password" {
  description = "Master password for the RDS Postgres instance (min 8 chars, no '/', '@', '\"' or spaces)"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Initial database name"
  type        = string
  default     = "chatdb"
}

variable "jwt_secret" {
  description = "Secret used by user-service to sign JWTs"
  type        = string
  sensitive   = true
}

variable "user_service_image" {
  description = "Container image for user-service. Defaults to nginx so the first apply succeeds before any image is pushed; CI later replaces this via aws ecs update-service."
  type        = string
  default     = "public.ecr.aws/docker/library/nginx:alpine"
}

variable "message_service_image" {
  description = "Container image for message-service. See note on user_service_image."
  type        = string
  default     = "public.ecr.aws/docker/library/nginx:alpine"
}

variable "user_service_desired_count" {
  type    = number
  default = 1
}

variable "message_service_desired_count" {
  type    = number
  default = 1
}
