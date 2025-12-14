#!/bin/bash
# NGO Logistics Management System - Startup Script (Nix-native)
# Upgraded: replaces 'node' & 'npm' with 'nix run'
echo "🚀 Starting NGO Logistics Management System (Nix-native)..."
echo "========================================================="
if [ ! -d "Backend" ] || [ ! -d "App" ]; then
    echo "❌ Error: Must run from project root"
    echo "💡 Current: $(pwd)"
    exit 1
fi
echo "✅ Project root: $(pwd)"
echo ""
echo "🔄 Cleaning up..."
pkill -f "ngol-backend\|vite" 2>/dev/null || true
sleep 3

echo ""
echo "📦 Starting backend via Nix..."
nix run .#Backend &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

echo "⏳ Waiting for backend..."
for i in {1..12}; do
  if timeout 1s curl -sf http://localhost:3000/api/health; then
    echo "✅ Backend up on :3000"
    break
  fi
  sleep 1
  [[ $i -eq 12 ]] && { echo "❌ Backend timeout"; kill $BACKEND_PID 2>/dev/null; exit 1; }
done

echo ""
echo "📦 Starting frontend (npm for now)..."
(cd App && npm run dev) &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo "⏳ Waiting for frontend..."
for i in {1..15}; do
  if timeout 1s curl -sf http://localhost:5173; then
    echo "✅ Frontend up on :5173"
    break
  fi
  sleep 1
  [[ $i -eq 15 ]] && { echo "❌ Frontend timeout"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 1; }
done

echo ""
echo "🎯 SYSTEM READY!"
echo "   🔗 http://localhost:5173"
echo "   🔐 ngoadmin@logistics.org / NgoAdmin123!"
echo ""
echo "🛑 Press Ctrl+C to stop..."
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo; echo '✅ Stopped.'; exit 0" INT TERM
wait
