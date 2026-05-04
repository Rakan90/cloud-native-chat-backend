# 15-Factor Analysis

This document maps each of the 15 factors to concrete evidence in this repository. Every factor cites a file path so the claim can be verified.

## 1. One codebase tracked in version control, many deploys

A single Git repository (`cloud-native-chat-backend`) contains all source code for every service plus its infrastructure-as-code. There are no per-environment forks or copies.

- Application sources: `user-service/src/`, `message-service/src/`
- Cloud infrastructure: `infrastructure/main.tf`, `variables.tf`, `outputs.tf`
- CI/CD pipeline: `.github/workflows/deploy.yaml`

The same codebase produces the local Docker Compose deploy and the AWS production deploy.

## 2. Explicitly declare and isolate dependencies

Each service declares its dependencies in its own `package.json` and `package-lock.json`. The Docker image installs them in isolation:

- `user-service/package.json:14-23`, `user-service/Dockerfile:5-6` (`COPY package*.json && RUN npm install --only=production`)
- `message-service/package.json:14-21`, `message-service/Dockerfile:5-6`

No system-wide packages are required at runtime — `node:20-alpine` plus the `npm install` output is the entire dependency surface.

## 3. Store config in the environment

All configuration that varies between deployments — database endpoint, port, credentials, JWT secret — is read from environment variables, never hard-coded in source.

- `user-service/src/db.js:5-12`, `message-service/src/db.js:5-12` (reads `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL`)
- `user-service/src/index.js:18`, `message-service/src/index.js:18` (`PORT` from env)
- ECS task definitions inject env at task launch: `infrastructure/main.tf` (`environment` and `secrets` blocks under each `aws_ecs_task_definition`)
- Sensitive values (`DB_PASSWORD`, `JWT_SECRET`) come from AWS Secrets Manager, not committed files: `infrastructure/main.tf` (`aws_secretsmanager_secret.db_password`, `aws_secretsmanager_secret.jwt_secret`)
- Local development uses `.env.example` as a template; real `.env` files are gitignored: `.gitignore`, `user-service/.env.example`, `message-service/.env.example`

## 4. Treat backing services as attached resources

Postgres is treated as an attached resource accessed only through its connection URL. The same code paths talk to local Docker Postgres and AWS RDS Postgres — only `DB_HOST` (and `DB_SSL`) change.

- Connection driver consumes URL pieces from env: `user-service/src/db.js:5-12`, `message-service/src/db.js:5-12`
- Local backing service: `docker-compose.yml:2-13` (Postgres container)
- Production backing service: `infrastructure/main.tf` (`aws_db_instance.postgres`), wired into the task definition via the `DB_HOST` env var pointing to `aws_db_instance.postgres.address`

Swapping backing services requires zero code changes, only environment changes.

## 5. Strictly separate build, release, and run stages

- **Build:** `docker build` produces an immutable image — `user-service/Dockerfile`, `message-service/Dockerfile`, executed in `.github/workflows/deploy.yaml` (`Build and push user-service image` step).
- **Release:** Push to ECR with two tags: the commit SHA (immutable, audit) and `latest` (deployable). See the same workflow file.
- **Run:** ECS Fargate pulls the image and runs it. The release step never recompiles.

The image cannot be modified once pushed — releases are by tag, not by mutation.

## 6. Execute the app as one or more stateless processes

Both services are stateless. They keep no in-memory session, file, or queue state between requests. The single source of truth is Postgres.

- `user-service/src/routes/users.js` — every endpoint reads or writes Postgres; nothing is cached in process memory.
- `message-service/src/routes/messages.js` — same.

Multiple ECS tasks of the same service can run concurrently behind the ALB without coordination.

## 7. Export services via port binding

Each service binds its own port and serves HTTP itself; no external web server is required.

- `user-service/src/index.js:18` (`app.listen(PORT, ...)` with `PORT=3001`)
- `message-service/src/index.js:18` (`PORT=3002`)
- `Dockerfile`s `EXPOSE 3001` / `EXPOSE 3002`
- ECS task definitions publish those ports as `containerPort` and the ALB target groups bind to them: `infrastructure/main.tf` (`aws_lb_target_group.user_service`, `aws_lb_target_group.message_service`)

## 8. Scale out via the process model

Concurrency is achieved by running more processes (ECS tasks), not threads. ECS Fargate launches each task as an isolated process.

- `infrastructure/main.tf` — `aws_ecs_service.user_service` and `aws_ecs_service.message_service` each take a `desired_count` that can be raised to scale horizontally.
- `variables.tf` — `user_service_desired_count`, `message_service_desired_count`.

Each task is a single Node.js process and is independently disposable.

## 9. Maximize robustness with fast startup and graceful shutdown

- **Fast startup:** `npm install --only=production` at build time means runtime startup is just `node src/index.js`.
- **Graceful shutdown:** both services capture the `server` returned by `app.listen` and call `server.close()` from a `SIGTERM` handler so in-flight HTTP requests are allowed to finish before exit. See `user-service/src/index.js:20-37`, `message-service/src/index.js:20-37`.
- ECS task definitions set `stopTimeout = 30` to give the handler time to drain: `infrastructure/main.tf` (each `container_definitions`).

## 10. Keep development, staging, and production as similar as possible

- Same Docker image runs locally and in production (`docker-compose.yml` builds the same `Dockerfile` that CI builds).
- Same Postgres major version: `postgres:16` locally (`docker-compose.yml:3`), `engine_version = "16.3"` on RDS (`infrastructure/main.tf` — `aws_db_instance.postgres`).
- Same env var surface in both environments — see Factor 3.
- Same source code ships to both environments via the same Git history.

## 11. Treat logs as event streams

Each service writes plain text log lines to stdout/stderr. No log files, no log rotation in the application.

- `user-service/src/index.js:21-29`, `message-service/src/index.js:21-29` (`console.log(...)` calls)
- ECS captures stdout/stderr via the `awslogs` log driver and ships to CloudWatch Logs: `infrastructure/main.tf` (`logConfiguration` blocks in each task definition; `aws_cloudwatch_log_group.user_service`, `aws_cloudwatch_log_group.message_service`).

The application does not know or care where logs end up — that is a deployment concern.

## 12. Run admin/management tasks as one-off processes

Schema bootstrap is performed by an idempotent admin task — `ensureSchema()` — that runs once at service startup against the same database and through the same code path the application uses.

- `user-service/src/db.js` (`ensureSchema()` runs `CREATE TABLE IF NOT EXISTS users ...`)
- `message-service/src/db.js` (same for `messages`)
- Invoked from `user-service/src/index.js:21-29`, `message-service/src/index.js:21-29` immediately after `app.listen`.

The local equivalent for first-time setup is `database/init/01-init.sql`, applied by the Postgres container's init mechanism.

## 13. API first

REST contracts are designed and documented before implementation; the documentation lives in the same repository.

- `docs/api-documentation.md` lists every endpoint, request shape, and response shape for both services.
- Both services are pure HTTP/JSON APIs — there is no UI in this repository, only the API.

## 14. Telemetry

Operational signals (logs, container metrics, request counts/latency) are collected centrally without the application doing anything special.

- Container stdout/stderr → CloudWatch Logs: `infrastructure/main.tf` (`awslogs` driver, log groups `/ecs/chat/user-service` and `/ecs/chat/message-service`).
- ALB request logs and target group health: built-in to `aws_lb` / `aws_lb_target_group` (CloudWatch metrics are emitted automatically).
- Health endpoints expose liveness: `GET /health` on each service; the ALB target group polls them every 30 s (`health_check { path = "/health" }` in `infrastructure/main.tf`).

## 15. Authentication and authorization

- User authentication: passwords are stored as bcrypt hashes, never in plaintext — `user-service/src/routes/users.js:12` (`bcrypt.hash(password, 10)`), `:36` (`bcrypt.compare`).
- Session: stateless JWT signed with a secret pulled from AWS Secrets Manager — `user-service/src/routes/users.js:42-46`, `infrastructure/main.tf` (`aws_secretsmanager_secret.jwt_secret` mounted into the task as `JWT_SECRET`).
- Network isolation enforces zero-trust between tiers: ALB security group only accepts 80/tcp from the internet; ECS tasks only accept their service port from the ALB security group; RDS only accepts 5432 from the ECS task security group — `infrastructure/main.tf` (`aws_security_group.alb`, `aws_security_group.ecs_tasks`, `aws_security_group.rds`).
- IAM least-privilege: the ECS execution role can read only the two specific Secrets Manager ARNs the tasks need, not all secrets — `infrastructure/main.tf` (`data.aws_iam_policy_document.ecs_secrets_read`).
- The CI deploy user has only ECR push and `ecs:UpdateService` permissions — see `chat-github-actions` IAM user policy `ChatGitHubActionsDeploy`.
