resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
}

resource "aws_security_group" "ecs_sg" {
  name   = "${var.project_name}-ecs-sg"
  vpc_id = data.aws_vpc.default.id

  ingress {
    from_port   = 3001
    to_port     = 3002
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

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.project_name}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_task_definition" "user_service" {
  family                   = "${var.project_name}-user-service"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "user-service"
      image     = var.user_service_image
      essential = true

      portMappings = [{
        containerPort = 3001
        hostPort      = 3001
      }]

      environment = [
        { name = "PORT", value = "3001" },
        { name = "DB_HOST", value = aws_db_instance.postgres.address },
        { name = "DB_PORT", value = "5432" },
        { name = "DB_USER", value = "chatuser" },
        { name = "DB_PASSWORD", value = var.db_password },
        { name = "DB_NAME", value = "chatdb" },
        { name = "JWT_SECRET", value = var.jwt_secret }
      ]
    }
  ])
}

resource "aws_ecs_task_definition" "message_service" {
  family                   = "${var.project_name}-message-service"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "message-service"
      image     = var.message_service_image
      essential = true

      portMappings = [{
        containerPort = 3002
        hostPort      = 3002
      }]

      environment = [
        { name = "PORT", value = "3002" },
        { name = "DB_HOST", value = aws_db_instance.postgres.address },
        { name = "DB_PORT", value = "5432" },
        { name = "DB_USER", value = "chatuser" },
        { name = "DB_PASSWORD", value = var.db_password },
        { name = "DB_NAME", value = "chatdb" }
      ]
    }
  ])
}

resource "aws_ecs_service" "user_service" {
  name            = "${var.project_name}-user-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.user_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }
}

resource "aws_ecs_service" "message_service" {
  name            = "${var.project_name}-message-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.message_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }
}