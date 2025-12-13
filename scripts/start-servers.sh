#!/bin/bash
# NGO Logistics Management System - Startup Script (Nix-native)
# Upgraded from your original: replaces 'node' & 'npm run' with 'nix run'
echo "🚀 Starting NGO Logistics Management System..."
echo "=============================================="
if [ ! -d "Backend" ] || [ ! -d "App" ]; then
    echo "❌ Error: Must run from project root with Backend/ and App/ directories"
    echo "💡 Current directory: $(pwd)"
    exit 1
fi
echo "✅ Running from project root: $(pwd)"
echo ""
echo "🔄 Cleaning up existing processes..."
pkill -f "ngol-backend\|vite" 2>/dev/null || true
sleep 3
echo ""
echo "📦 Starting backend..."
# ⬇️ REPLACED: node consistent-dashboard.js → nix run .#backend
nix run .#backend &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
echo "⏳ Waiting for backend to start..."
sleep 5
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:3000"
else
    echo "❌ Backend failed to start on port 3000"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi
echo ""
echo "📦 Starting frontend..."
# ⬇️ REPLACED: (cd App && npm run dev) → nix run .#app
nix run .#app &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
echo "⏳ Waiting for frontend to start..."
sleep 8
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:5173"
else
    echo "❌ Frontend failed to start on port 5173"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi
echo ""
echo "🎯 BOTH SERVERS ARE RUNNING!"
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "📋 Important URLs:"
echo "   🔧 Backend API: http://localhost:3000/api/health"
echo "   🖥️  Frontend App: http://localhost:5173"
echo "   🔐 Login: http://localhost:5173"
echo ""
echo "📋 Default Credentials:"
echo "   Email: ngoadmin@logistics.org"
echo "   Password: NgoAdmin123!"
echo ""
echo "🛑 To stop servers: pkill -f 'ngol-backend\|vite'"
echo ""
echo "Press Ctrl+C to stop servers..."
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo; echo '✅ Stopped.'; exit 0" INT TERM
wait
