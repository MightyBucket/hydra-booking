#!/usr/bin/env bash
set -euo pipefail

export PGPASSWORD="${PROD_PASSWORD}"
PROD_URL="postgresql://${PROD_USER}@${PROD_HOST}:${PROD_PORT}/${PROD_DB}"

export PGPASSWORD="${DEV_PASSWORD}"
DEV_URL="postgresql://${DEV_USER}@${DEV_HOST}:${DEV_PORT}/${DEV_DB}"

DUMPFILE="/tmp/prod_dump.dump"

echo "=== $(date -Iseconds) Starting refresh ==="

echo "Dumping prod..."
export PGPASSWORD="${PROD_PASSWORD}"
pg_dump --format=custom --no-owner --no-acl --file "$DUMPFILE" "$PROD_URL"

echo "Dropping/recreating dev schema..."
export PGPASSWORD="${DEV_PASSWORD}"
psql "$DEV_URL" -v ON_ERROR_STOP=1 <<'SQL'
-- Recreate public schema (keeps DB itself; fastest/least permissions hassle in containers)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
SQL

echo "Restoring into dev..."
pg_restore --dbname "$DEV_URL" --no-owner --no-acl --jobs "${JOBS:-2}" "$DUMPFILE"

if [[ -n "${MASK_SQL_PATH:-}" && -f "${MASK_SQL_PATH}" ]]; then
  echo "Masking with ${MASK_SQL_PATH}..."
  psql "$DEV_URL" -v ON_ERROR_STOP=1 -f "$MASK_SQL_PATH"
else
  echo "No mask file found (skipping)."
fi

echo "Analyzing..."
vacuumdb --analyze-in-stages --dbname "$DEV_URL"

echo "=== $(date -Iseconds) Done ==="
