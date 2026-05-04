output "alb_dns_name" {
  description = "Public DNS of the application load balancer"
  value       = aws_lb.main.dns_name
}

output "ecr_user_service_url" {
  description = "ECR repo URL for user-service (image push target)"
  value       = aws_ecr_repository.user_service.repository_url
}

output "ecr_message_service_url" {
  description = "ECR repo URL for message-service (image push target)"
  value       = aws_ecr_repository.message_service.repository_url
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_user_service_name" {
  description = "Name of the user-service ECS service"
  value       = aws_ecs_service.user_service.name
}

output "ecs_message_service_name" {
  description = "Name of the message-service ECS service"
  value       = aws_ecs_service.message_service.name
}

output "rds_endpoint" {
  description = "RDS Postgres endpoint (host only)"
  value       = aws_db_instance.postgres.address
}

output "aws_region" {
  description = "AWS region these resources are in"
  value       = var.aws_region
}
