#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/.."
BACKEND_DIR="$PROJECT_ROOT/Backend"

cd "$BACKEND_DIR"

echo "🔧 Fixing seed.js dependencies (MariaDB-only, safe mode)..."

# 1. Ensure seed.js exists
if [[ ! -f seed.js ]]; then
  echo "❌ seed.js not found in $BACKEND_DIR"
  exit 1
fi

# 2. Add MariaDB-compatible dependencies (only if missing)
echo "📦 Checking/adding required deps..."
npm install --save --no-save --no-audit --no-fund \
  mysql2@^3.10.0 \
  dotenv@^16.4.5 \
  bcryptjs@^2.4.3 \
  || { echo "❌ npm install failed"; exit 1; }

# 3. Regenerate lockfile safely (required for reproducible Nix build)
echo "🔒 Regenerating package-lock.json (safe)..."
npm install --package-lock-only --ignore-scripts --no-fund --no-audit \
  || { echo "❌ lockfile regeneration failed"; exit 1; }

# 4. Verify critical files exist for Nix build
for f in server.js socket.js package.json package-lock.json schema.sql seed.js; do
  if [[ ! -f "$f" ]]; then
    echo "⚠️ $f missing — may cause Nix build failure"
  else
    echo "✅ $f present"
  fi
done

# 5. Optional: lint check (non-blocking)
if command -v nix &>/dev/null && [[ -f "$PROJECT_ROOT/flake.nix" ]]; then
  echo "🔍 Optional: nix fmt (non-blocking)..."
  nix fmt --check 2>/dev/null || true
fi

echo -e "\n🎉 fix-seed-deps-safe.sh completed."
echo "➡️ Next: ./scripts/run-full-stack-safe.sh"
