#!/usr/bin/env bash
set -euo pipefail

MARIADB_DATA_DIR="${MARIADB_DATA_DIR:-$HOME/.local/share/mariadb}"
MARIADB_SOCKET_DIR="${MARIADB_SOCKET_DIR:-$HOME/.local/run}"
MARIADB_PORT="${MARIADB_PORT:-3306}"

mkdir -p "$MARIADB_DATA_DIR" "$MARIADB_SOCKET_DIR"

if [ ! -f "$MARIADB_DATA_DIR/mysql/db.opt" ]; then
  echo "🆕 Initializing MariaDB data directory..."
  mysql_install_db --datadir="$MARIADB_DATA_DIR" --user="$USER" >/dev/null
fi

echo "🚀 Starting MariaDB on port $MARIADB_PORT..."
mysqld \
  --datadir="$MARIADB_DATA_DIR" \
  --socket="$MARIADB_SOCKET_DIR/mariadb.sock" \
  --port="$MARIADB_PORT" \
  --bind-address=127.0.0.1 \
  --skip-networking=0 \
  --skip-grant-tables=0 \
  --standalone \
  --console
