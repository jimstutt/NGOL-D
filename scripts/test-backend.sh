#!/bin/bash

# NGO Logistics Management System - Backend Testing Script

echo "Testing NGO Logistics Backend API..."

# Check if backend is running
if curl -f http://localhost:5000/api/health >/dev/null 2>&1; then
    echo "✅ Backend is running"
    
    # Test authentication endpoint
    echo "Testing authentication..."
    response=$(curl -s -X POST http://localhost:5000/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@example.org","password":"password123"}')
    
    if echo "$response" | grep -q "token"; then
        echo "✅ Authentication test passed"
        
        # Extract token for further tests
        token=$(echo "$response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        
        # Test shipments endpoint
        echo "Testing shipments endpoint..."
        if curl -s -H "Authorization: Bearer $token" http://localhost:5000/api/shipments | grep -q "shipments"; then
            echo "✅ Shipments endpoint test passed"
        else
            echo "❌ Shipments endpoint test failed"
        fi
        
        # Test inventory endpoint
        echo "Testing inventory endpoint..."
        if curl -s -H "Authorization: Bearer $token" http://localhost:5000/api/inventory | grep -q "inventory"; then
            echo "✅ Inventory endpoint test passed"
        else
            echo "❌ Inventory endpoint test failed"
        fi
        
    else
        echo "❌ Authentication test failed"
        echo "Response: $response"
    fi
else
    echo "❌ Backend is not running"
    echo "Please start the backend server first: cd Backend && npm run dev"
fi

echo ""
echo "================================================"
echo "Backend testing completed"
echo "================================================"
