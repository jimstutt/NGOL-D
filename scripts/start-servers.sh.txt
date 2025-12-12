#!/bin/bash

# NGO Logistics Management System - Startup Script
# Fixed version with proper error handling

echo "🚀 Starting NGO Logistics Management System..."
echo "=============================================="

# Check if we're in the correct directory
if [ ! -d "Backend" ] || [ ! -d "App" ]; then
    echo "❌ Error: Must run from project root with Backend/ and App/ directories"
    echo "💡 Current directory: $(pwd)"
    exit 1
fi

echo "✅ Running from project root: $(pwd)"

# Clean up any existing processes
echo ""
echo "🔄 Cleaning up existing processes..."
pkill -f "node.*3000" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 3

# BACKEND STARTUP
echo ""
echo "📦 Starting backend..."
cd Backend

# Start backend directly
node consistent-dashboard.js &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Test backend
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:3000"
else
    echo "❌ Backend failed to start on port 3000"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

cd ..

# FRONTEND STARTUP
echo ""
echo "📦 Starting frontend..."
cd App

# Start frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 8

# Test frontend
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
echo "   🔐 Login: http://localhost:5173 (should show login form)"
echo ""
echo "📋 Default Credentials:"
echo "   Email: ngoadmin@logistics.org"
echo "   Password: NgoAdmin123!"
echo ""
echo "🛑 To stop servers: pkill -f 'node.*3000\|vite'"
echo ""

# Wait for user interrupt
echo "Press Ctrl+C to stop servers..."
wait
