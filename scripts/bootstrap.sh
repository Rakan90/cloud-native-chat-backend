#!/usr/bin/env bash
# Bootstrap the entire cloud environment from scratch.
# 1. Provisions all AWS resources via Terraform.
# 2. Builds and pushes initial container images to ECR.
# 3. Forces a fresh ECS deployment so tasks pick up the just-pushed images.
# 4. Waits until the ALB reports healthy.
#
# Idempotent: safe to re-run.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INFRA_DIR="$REPO_ROOT/infrastructure"

log()  { printf '\n[bootstrap] %s\n' "$*"; }
fail() { printf '\n[bootstrap][error] %s\n' "$*" >&2; exit 1; }

command -v terraform >/dev/null || fail "terraform not installed"
command -v aws        >/dev/null || fail "aws cli not installed"
command -v docker     >/dev/null || fail "docker not installed"

[[ -f "$INFRA_DIR/terraform.tfvars" ]] || fail "Missing $INFRA_DIR/terraform.tfvars (copy from terraform.tfvars.example)"

log "Step 1/4: terraform init + apply"
cd "$INFRA_DIR"
terraform init -input=false
terraform apply -input=false -auto-approve

AWS_REGION="$(terraform output -raw aws_region)"
USER_REPO="$(terraform output -raw ecr_user_service_url)"
MSG_REPO="$(terraform output -raw ecr_message_service_url)"
CLUSTER="$(terraform output -raw ecs_cluster_name)"
USER_SVC="$(terraform output -raw ecs_user_service_name)"
MSG_SVC="$(terraform output -raw ecs_message_service_name)"
ALB_DNS="$(terraform output -raw alb_dns_name)"
REGISTRY="${USER_REPO%/*}"

log "Step 2/4: build + push images to ECR"
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY"

docker build --platform linux/amd64 -t "$USER_REPO:latest" "$REPO_ROOT/user-service"
docker push "$USER_REPO:latest"

docker build --platform linux/amd64 -t "$MSG_REPO:latest" "$REPO_ROOT/message-service"
docker push "$MSG_REPO:latest"

log "Step 3/4: force new ECS deployments"
aws ecs update-service --cluster "$CLUSTER" --service "$USER_SVC" \
  --force-new-deployment --no-cli-pager >/dev/null
aws ecs update-service --cluster "$CLUSTER" --service "$MSG_SVC" \
  --force-new-deployment --no-cli-pager >/dev/null

log "Step 4/4: wait for services to stabilize (this can take ~3 min)"
aws ecs wait services-stable --cluster "$CLUSTER" --services "$USER_SVC"
aws ecs wait services-stable --cluster "$CLUSTER" --services "$MSG_SVC"

log "Done."
echo
echo "  ALB:                  http://$ALB_DNS"
echo "  user-service health:  curl http://$ALB_DNS/health"
echo "  message-service:      curl http://$ALB_DNS/messages/1/2"
echo
