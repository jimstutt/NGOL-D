#!/bin/bash
# start-servers.sh — Nix-native, resilient, logs to files
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 Starting NGO Logistics (Nix-native mode)..."
echo "=============================================="

# Ensure data dir exists (for SQLite)
mkdir -p data

# Cleanup
echo "🔄 Cleaning up..."
pkill -f 'ngol-backend\|vite' 2>/dev/null || true
sleep 2

# Launch backend via Nix-built binary
echo "📦 Starting backend..."
nix run .#backend > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID (log: backend.log)"

# Wait + health-check
for i in {1..10}; do
  if curl -sf http://localhost:3000/api/health; then
    echo -e "\n✅ Backend ready"
    break
  fi
  sleep 2
  [[ $i -eq 10 ]] && { echo "❌ Backend timeout"; kill $BACKEND_PID 2>/dev/null; exit 1; }
done

# Launch frontend
echo "📦 Starting frontend..."
nix run .#app > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID (log: frontend.log)"

# Wait for Vite
for i in {1..12}; do
  if curl -sf http://localhost:5173; then
    echo -e "\n✅ Frontend ready"
    break
  fi
  sleep 3
  [[ $i -eq 12 ]] && { echo "❌ Frontend timeout"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 1; }
done

echo
echo "🎯 SYSTEM READY!"
echo "   🔗 http://localhost:5173"
echo "   📋 Logs: backend.log, frontend.log"
echo
echo "🛑 Press Ctrl+C to stop..."
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo; echo '✅ Stopped.'; exit 0" INT TERM
wait
