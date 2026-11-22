#!/usr/bin/env bash
# Restore a backup made by scripts/backup.sh onto this machine's stack.
#
#   ./scripts/restore.sh            the newest dump, and the storage mirror
#   ./scripts/restore.sh animarka-20261122T030000Z.dump
#
# Stop the api and worker first so nothing writes while the database is replaced:
#   docker compose -f infra/compose/docker-compose.prod.yml --env-file infra/compose/.env stop api worker flower
# RESTORE_DB picks the database to restore into (default animarka); a test restore can use
# another name and leave the live data alone. SKIP_STORAGE=1 restores only the database.
set -euo pipefail

ENV_FILE=${ENV_FILE:-infra/compose/.env}
COMPOSE=${COMPOSE:-"docker compose -f infra/compose/docker-compose.prod.yml --env-file $ENV_FILE"}
STORAGE_VOLUME=${STORAGE_VOLUME:-animarka-prod_storage}
RCLONE_IMAGE=${RCLONE_IMAGE:-rclone/rclone:1.69}
DB=${RESTORE_DB:-animarka}

if [ -f "$ENV_FILE" ]; then
  set -a; . "$ENV_FILE"; set +a
fi

rclone_run() {
  local args=(--rm -i)
  [ -f "$ENV_FILE" ] && args+=(--env-file "$ENV_FILE")
  [ -n "${BACKUP_LOCAL_DIR:-}" ] && args+=(-v "$BACKUP_LOCAL_DIR:/remote")
  args+=(-v "$STORAGE_VOLUME:/storage")
  docker run "${args[@]}" "$RCLONE_IMAGE" "$@"
}

if [ -n "${BACKUP_LOCAL_DIR:-}" ]; then TARGET=/remote; else TARGET=${BACKUP_REMOTE:?set BACKUP_REMOTE or BACKUP_LOCAL_DIR}; fi
DUMP=${1:-$(rclone_run lsf "$TARGET/db" --files-only | sort | tail -1)}
[ -n "$DUMP" ] || { echo "no dump found in $TARGET/db" >&2; exit 1; }
echo "restoring $DUMP into database $DB"

$COMPOSE exec -T db psql -U animarka -d postgres -v ON_ERROR_STOP=1 \
  -c "DROP DATABASE IF EXISTS \"$DB\" WITH (FORCE)" -c "CREATE DATABASE \"$DB\" OWNER animarka"
rclone_run cat "$TARGET/db/$DUMP" | $COMPOSE exec -T db pg_restore -U animarka -d "$DB" --no-owner --exit-on-error

if [ "${SKIP_STORAGE:-0}" != "1" ]; then
  rclone_run sync "$TARGET/storage/current" /storage --quiet
  echo "storage restored"
fi
echo "restore done"
