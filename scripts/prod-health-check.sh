#!/usr/bin/env bash
set -euo pipefail

echo "🏥 NGOL-D Production Health Check"

# Backend service
if systemctl is-active --quiet ngol-d-backend; then
  echo "✅ ngol-d-backend: active"
else
  echo "❌ ngol-d-backend: inactive"
  systemctl status ngol-d-backend || true
fi

# DB connectivity
if mysqladmin ping -u root -ppassword -h 127.0.0.1 --silent; then
  echo "✅ MariaDB: reachable"
else
  echo "❌ MariaDB: unreachable"
fi

# Frontend (static) — check files exist
if [[ -f /srv/ngol-d/frontend/index.html ]]; then
  echo "✅ Frontend: deployed"
else
  echo "❌ Frontend: missing"
fi

# API endpoint
if curl -sf http://localhost:5000/api/health >/dev/null; then
  echo "✅ API /health: ok"
else
  echo "❌ API /health: failed"
fi
