#!/bin/bash
# NGO Logistics — Verified working hybrid mode
echo "🚀 Starting NGO Logistics (Hybrid mode)..."
echo "=========================================="
if [ ! -d "Backend" ] || [ ! -d "App" ]; then
    echo "❌ Must run from project root"
    exit 1
fi

# Kill old processes
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f vite 2>/dev/null || true
sleep 2

# Start Backend
echo "📦 Starting backend..."
(cd Backend && node server.js) &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait + health check
for i in {1..12}; do
  if timeout 1s curl -sf http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "✅ Backend up on :3000"
    break
  fi
  sleep 1
  [[ $i -eq 12 ]] && { echo "❌ Backend failed"; kill $BACKEND_PID 2>/dev/null; exit 1; }
done

# Start Frontend
echo "📦 Starting frontend..."
(cd App && npm run dev) &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait + frontend check
for i in {1..10}; do
  if timeout 1s curl -sf http://localhost:5173 >/dev/null 2>&1; then
    echo "✅ Frontend up on :5173"
    break
  fi
  sleep 1
  [[ $i -eq 10 ]] && { echo "❌ Frontend failed"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 1; }
done

echo "🎯 SYSTEM READY — Login first at http://localhost:5173"
echo "   Email: ngoadmin@logistics.org"
echo "   Password: NgoAdmin123!"
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ Stopped.'; exit 0" INT TERM
wait
