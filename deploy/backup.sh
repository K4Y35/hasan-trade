#!/usr/bin/env bash
set -euo pipefail

# Scheduled MySQL dump + uploads copy. Point BACKUP_DIR at durable storage.
BACKUP_DIR="${BACKUP_DIR:-./backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

docker compose exec -T mysql mysqldump \
  -u"${MYSQL_USER:-shopstack}" \
  -p"${MYSQL_PASSWORD:?MYSQL_PASSWORD required}" \
  "${MYSQL_DATABASE:-shopstack}" \
  > "${BACKUP_DIR}/db-${STAMP}.sql"

if [[ -d ./uploads ]]; then
  tar -czf "${BACKUP_DIR}/uploads-${STAMP}.tar.gz" ./uploads
fi

echo "Wrote ${BACKUP_DIR}/db-${STAMP}.sql"
