#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "🚀 NGOL-D Full Stack (Safe Mode)"

# Ensure MariaDB is available
command -v mariadbd >/dev/null || { echo "❌ Run inside 'nix develop'"; exit 1; }

DATA_DIR="./data/mariadb"
RUN_DIR="$DATA_DIR/run"
SOCKET_PATH="$RUN_DIR/mysqld.sock"
LOG_FILE="$DATA_DIR/mariadb.log"

mkdir -p "$DATA_DIR" "$RUN_DIR"

# Initialize (MariaDB 10.11+ syntax)
if [[ ! -f "$DATA_DIR/mysql/db.frm" ]]; then
  echo "🔧 Initializing MariaDB (10.11+)"
  mariadbd \
    --datadir="$DATA_DIR" \
    --user=$(id -un) \
    --initialize \
    --skip-grant-tables \
    --auth-root-authentication-method=normal \
    &> "$LOG_FILE.init" || {
      echo "❌ Initialization failed — see $LOG_FILE.init"
      exit 1
    }
fi

# Start MariaDB
echo "📡 Starting MariaDB..."
mariadbd \
  --datadir="$DATA_DIR" \
  --user=$(id -un) \
  --bind-address=127.0.0.1 \
  --port=3306 \
  --socket="$SOCKET_PATH" \
  --skip-networking=0 \
  --innodb-flush-method=fsync \
  &> "$LOG_FILE" &
MARIADB_PID=$!
trap "kill $MARIADB_PID 2>/dev/null || true" EXIT

# Wait for MariaDB
echo "⏳ Waiting for MariaDB..."
for i in {1..30}; do
  if mysqladmin ping -u root --socket="$SOCKET_PATH" --silent 2>/dev/null; then
    echo "✅ MariaDB ready"
    break
  fi
  sleep 1
  if ! kill -0 $MARIADB_PID 2>/dev/null; then
    echo "❌ MariaDB crashed — see $LOG_FILE"
    tail -10 "$LOG_FILE"
    exit 1
  fi
done

# Create DB (as in ci.yml.txt)
mysql -u root --socket="$SOCKET_PATH" -e "CREATE DATABASE IF NOT EXISTS NGOL_D;" 2>/dev/null || true
mysql -u root --socket="$SOCKET_PATH" -e "CREATE USER IF NOT EXISTS 'ngol'@'%' IDENTIFIED BY 'ngol';" 2>/dev/null || true
mysql -u root --socket="$SOCKET_PATH" -e "GRANT ALL PRIVILEGES ON NGOL_D.* TO 'ngol'@'%';" 2>/dev/null || true
mysql -u root --socket="$SOCKET_PATH" -e "FLUSH PRIVILEGES;" 2>/dev/null || true

# Set env (matches ci.yml.txt)
export MARIADB_HOST="127.0.0.1"
export MARIADB_PORT="3306"
export MARIADB_USER="ngol"
export MARIADB_PASSWORD="ngol"
export MARIADB_DATABASE="NGOL_D"
export NODE_ENV="development"

# Seed
if [[ -f Backend/seed.js ]]; then
  echo "🌱 Seeding test data..."
  cd Backend && node seed.js && cd ..
fi

# Start backend
echo "📡 Starting backend (nix build .#Backend)..."
nix run .#Backend &
BACKEND_PID=$!

# Start frontend
echo "🌐 Starting frontend (http://localhost:5173)..."
cd App && npm run dev -- --port=5173 &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID $MARIADB_PID 2>/dev/null || true" EXIT

# Wait & verify
echo "⏳ Waiting for services..."
for i in {1..20}; do
  if curl -sf http://localhost:3000/api/health >/dev/null && \
     curl -sf http://localhost:5173 >/dev/null; then
    echo -e "\n✅ Full stack ready!"
    echo "   🔹 Backend: http://localhost:3000/api/health"
    echo "   🔹 Frontend: http://localhost:5173 (Login.vue modal first)"
    echo "   🔹 MariaDB: NGOL_D @ localhost:3306"
    wait
    exit 0
  fi
  sleep 1
done

echo "❌ Timeout — check logs:"
echo "   - MariaDB: $LOG_FILE"
echo "   - Backend: console above"
exit 1
