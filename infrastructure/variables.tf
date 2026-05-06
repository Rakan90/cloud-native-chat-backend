variable "aws_region" {
  default = "us-east-1"
}

variable "project_name" {
  default = "cloud-chat-app"
}

variable "user_service_image" {}
variable "message_service_image" {}
variable "db_password" {
  sensitive = true
}
variable "jwt_secret" {
  sensitive = true
}