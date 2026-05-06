resource "aws_ecr_repository" "user_service" {
  name = "${var.project_name}-user-service"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "message_service" {
  name = "${var.project_name}-message-service"

  image_scanning_configuration {
    scan_on_push = true
  }
}