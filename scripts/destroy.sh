#!/usr/bin/env bash
# Tear down the entire cloud environment.
# Removes ECR images first (so force_delete on the repo isn't strictly required),
# then runs terraform destroy.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INFRA_DIR="$REPO_ROOT/infrastructure"

log()  { printf '\n[destroy] %s\n' "$*"; }
fail() { printf '\n[destroy][error] %s\n' "$*" >&2; exit 1; }

command -v terraform >/dev/null || fail "terraform not installed"
command -v aws        >/dev/null || fail "aws cli not installed"

cd "$INFRA_DIR"

if [[ ! -d .terraform ]]; then
  fail "No .terraform/ here. Did you run scripts/bootstrap.sh first?"
fi

AWS_REGION="$(terraform output -raw aws_region 2>/dev/null || echo us-east-1)"

log "Step 1/2: empty ECR repos"
for repo in chat-user-service chat-message-service; do
  if aws ecr describe-repositories --region "$AWS_REGION" --repository-names "$repo" >/dev/null 2>&1; then
    images="$(aws ecr list-images --region "$AWS_REGION" --repository-name "$repo" --query 'imageIds[*]' --output json)"
    if [[ "$images" != "[]" ]]; then
      aws ecr batch-delete-image --region "$AWS_REGION" --repository-name "$repo" \
        --image-ids "$images" >/dev/null
      log "  emptied $repo"
    fi
  fi
done

log "Step 2/2: terraform destroy"
terraform destroy -input=false -auto-approve

log "Done. Cloud environment removed."
