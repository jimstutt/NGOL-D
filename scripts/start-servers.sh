#!/bin/bash
# NGO Logistics — Nix-native, spec-compliant
echo "🚀 Starting NGO Logistics (Nix-native)..."
echo "=========================================="
if [ ! -d "Backend" ] || [ ! -d "App" ]; then
    echo "❌ Must run from project root"
    exit 1
fi
pkill -f "ngol-d-backend\|vite" 2>/dev/null || true
sleep 2

# Backend via Nix (CJS, Express 4.18.2)
nix run .#Backend &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend
for i in {1..12}; do
  if timeout 1s curl -sf http://localhost:3000/api/health; then
    echo "✅ Backend up on :3000"
    break
  fi
  sleep 1
  [[ $i -eq 12 ]] && { kill $BACKEND_PID 2>/dev/null; exit 1; }
done

# Frontend: dev (for now — Nixify later if desired)
(cd App && npm run dev) &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend
for i in {1..10}; do
  if timeout 1s curl -sf http://localhost:5173; then
    echo "✅ Frontend up on :5173"
    break
  fi
  sleep 1
  [[ $i -eq 10 ]] && { kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 1; }
done

echo "🎯 SYSTEM READY — Login first at http://localhost:5173"
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ Stopped.'; exit 0" INT TERM
wait
