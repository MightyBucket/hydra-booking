#!/usr/bin/env bash
set -euo pipefail

apt-get update -qq
apt-get install -y -qq cron >/dev/null

# Install cron job
echo "${CRON} /scripts/refresh.sh >> /var/log/refresh.log 2>&1" > /etc/cron.d/db_refresh
chmod 0644 /etc/cron.d/db_refresh
crontab /etc/cron.d/db_refresh

touch /var/log/refresh.log
echo "db_refresh running with CRON='${CRON}'"
cron -f
