output "user_service_ecr_url" {
  value = aws_ecr_repository.user_service.repository_url
}

output "message_service_ecr_url" {
  value = aws_ecr_repository.message_service.repository_url
}