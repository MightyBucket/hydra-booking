#!/usr/bin/env bash
set -euo pipefail

# ---- config you likely change ----
# DB_NAME="${DB_NAME:-hydra_db}"
# DB_HOST="${DB_HOST:-localhost}"
# DB_PORT="${DB_PORT:-5433}"
# DB_USER="${DB_USER:-dev}"

# rclone remote + folder (folder will be created if it doesn't exist)
RCLONE_REMOTE="${RCLONE_REMOTE:-personaldrive}"
DRIVE_FOLDER="${DRIVE_FOLDER:-Hydra/backups}"

# local temp dir for dumps
LOCAL_DIR="${LOCAL_DIR:-/tmp/pg_backups}"
# ----------------------------------

ts="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$LOCAL_DIR"

dump_file="${LOCAL_DIR}/${DB_NAME}_${ts}.dump"     # custom-format archive
sha_file="${dump_file}.sha256"

# Make sure required tools exist
command -v pg_dump >/dev/null
command -v rclone  >/dev/null
command -v sha256sum >/dev/null

# Tip: avoid putting passwords in the script. Use .pgpass or env vars.
# pg_dump custom format (-Fc) is flexible and works with pg_restore.
# Add --no-owner/--no-privileges if you want portability across environments.
pg_dump \
  -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
  -Fc \
  --no-owner --no-privileges \
  -f "$dump_file" \
  "$DB_NAME"

sha256sum "$dump_file" > "$sha_file"

# Upload single files using rclone copyto
rclone copyto "$dump_file" "${RCLONE_REMOTE}:${DRIVE_FOLDER}/$(basename "$dump_file")"
rclone copyto "$sha_file" "${RCLONE_REMOTE}:${DRIVE_FOLDER}/$(basename "$sha_file")"

echo "Uploaded:"
echo "  ${RCLONE_REMOTE}:${DRIVE_FOLDER}/$(basename "$dump_file")"
echo "  ${RCLONE_REMOTE}:${DRIVE_FOLDER}/$(basename "$sha_file")"