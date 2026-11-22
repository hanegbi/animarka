#!/usr/bin/env bash
# Nightly backup: a Postgres dump and the poster storage, copied off the server, 14 days kept.
#
# Run from the repo root on the server, for example from cron at 03:00:
#   0 3 * * * cd /srv/animarka && ./scripts/backup.sh >> /var/log/animarka-backup.log 2>&1
#
# Where backups go is set in infra/compose/.env (see .env.example):
#   BACKUP_REMOTE   rclone target, for example "bucket:animarka-backups" for a remote named
#                   "bucket" defined with RCLONE_CONFIG_BUCKET_* variables in the same file.
#   BACKUP_LOCAL_DIR  instead of a remote, a directory on this machine (tests, a mounted disk).
#   BACKUP_KEEP_DAYS  default 14.
# rclone and pg_dump run in containers, so the server needs only Docker.
set -euo pipefail

ENV_FILE=${ENV_FILE:-infra/compose/.env}
COMPOSE=${COMPOSE:-"docker compose -f infra/compose/docker-compose.prod.yml --env-file $ENV_FILE"}
STORAGE_VOLUME=${STORAGE_VOLUME:-animarka-prod_storage}
RCLONE_IMAGE=${RCLONE_IMAGE:-rclone/rclone:1.69}

if [ -f "$ENV_FILE" ]; then
  set -a; . "$ENV_FILE"; set +a
fi
KEEP=${BACKUP_KEEP_DAYS:-14}

rclone_run() {
  local args=(--rm -i)
  [ -f "$ENV_FILE" ] && args+=(--env-file "$ENV_FILE")
  [ -n "${BACKUP_LOCAL_DIR:-}" ] && mkdir -p "$BACKUP_LOCAL_DIR" && args+=(-v "$BACKUP_LOCAL_DIR:/remote")
  args+=(-v "$STORAGE_VOLUME:/storage:ro")
  docker run "${args[@]}" "$RCLONE_IMAGE" "$@"
}

if [ -n "${BACKUP_LOCAL_DIR:-}" ]; then TARGET=/remote; else TARGET=${BACKUP_REMOTE:?set BACKUP_REMOTE or BACKUP_LOCAL_DIR}; fi
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
log() { printf '{"ts":"%s","msg":"%s"}\n' "$(date -u +%FT%TZ)" "$*"; }

log "backup start $STAMP"
# 1. Database: a custom format dump, streamed straight to the target, no file left on disk.
$COMPOSE exec -T db pg_dump -U animarka -d animarka -Fc --no-owner \
  | rclone_run rcat "$TARGET/db/animarka-$STAMP.dump"
log "database dumped"

# 2. Storage: a mirror, and files changed or deleted since last night go to a dated folder.
rclone_run sync /storage "$TARGET/storage/current" --backup-dir "$TARGET/storage/changed-$STAMP" --quiet
log "storage synced"

# 3. Keep $KEEP days.
rclone_run delete "$TARGET/db" --min-age "${KEEP}d" --quiet
for d in $(rclone_run lsf "$TARGET/storage" --dirs-only | grep '^changed-' || true); do
  day=${d#changed-}; day=${day%%T*}
  if [ "$(date -u -d "$day" +%s 2>/dev/null || echo 0)" -lt "$(date -u -d "-$KEEP days" +%s)" ]; then
    rclone_run purge "$TARGET/storage/$d"
  fi
done
log "backup done $STAMP"
