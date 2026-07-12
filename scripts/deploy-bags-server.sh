#!/usr/bin/env bash

set -euo pipefail

branch="${DEPLOY_BRANCH:-main}"
process_name="${PM2_APP_NAME:-store-picture-bag}"

git pull --ff-only origin "$branch"
npm ci
npm run build
pm2 restart "$process_name" --update-env
pm2 save
