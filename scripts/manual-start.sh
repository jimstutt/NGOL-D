#!/bin/bash
# manual-start.sh - Debug individual components

echo "🔧 Manual Startup Debug Mode"
echo ""

echo "1. Starting Backend..."
cd Backend
echo "   Directory: $(pwd)"
echo "   Running: npm run dev"
npm run dev &
BACKEND_PID=$!
cd ..

echo "2. Backend PID: $BACKEND_PID"
echo "   Waiting 5 seconds for backend to start..."
sleep 5

echo "3. Checking if backend is running..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "   ✅ Backend is responding"
else
    echo "   ❌ Backend not responding on port 3000"
    echo "   💡 Check Backend logs above for errors"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "4. Starting Frontend..."
cd App
echo "   Directory: $(pwd)" 
echo "   Running: npm run dev"
npm run dev
