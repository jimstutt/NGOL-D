#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
echo "🚀 Safe Full-Stack Start (NGOL-D)"
echo ""
if ! node Backend/seed.js 2>/dev/null; then
  echo "❌ seed.js failed — run ./scripts/fix-seed-deps-safe.sh first"
  exit 1
fi
if [[ ! -d result-App ]] || [[ ! -d result-Backend ]]; then
  echo "📦 Building App & Backend..."
  nix build .#App .#Backend --no-link --out-link result-App result-Backend || {
    echo "❌ Build failed — check flake.nix and Backend/default.nix"
    exit 1
  }
fi
echo "🧪 Running integration tests..."
nix run .#check || {
  echo "❌ Tests failed — check Backend/seed.js and server.js"
  exit 1
}
echo "🌐 Starting servers..."
nix run .#Backend &
BACKEND_PID=$!
sleep 5
(cd App && npm run dev) &
FRONTEND_PID=$!
echo ""
echo "✅ Ready! http://localhost:5173 (login modal first)"
echo "   Users: admin@example.org / password123"
echo ""
echo "Press Ctrl+C to stop."
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
