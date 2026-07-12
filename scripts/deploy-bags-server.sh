#!/usr/bin/env bash

set -euo pipefail

branch="${DEPLOY_BRANCH:-main}"
process_name="${PM2_APP_NAME:-store-picture-bag}"
backup_dir=".next.rollback-$(date +%s)"

git pull --ff-only origin "$branch"
pm2 stop "$process_name"
if [[ -d .next ]]; then
  mv .next "$backup_dir"
fi

if ! npm ci || ! npm run build; then
  if [[ -d .next ]]; then
    mv .next ".next.failed-$(date +%s)"
  fi
  if [[ -d "$backup_dir" ]]; then
    mv "$backup_dir" .next
  fi
  pm2 restart "$process_name" --update-env
  pm2 save
  exit 1
fi

if [[ -d "$backup_dir" ]]; then
  rm -rf -- "$backup_dir"
fi

pm2 restart "$process_name" --update-env
pm2 save
