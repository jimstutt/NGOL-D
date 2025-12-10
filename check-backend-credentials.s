#!/bin/bash
# check-backend-credentials.sh

echo "🔍 Checking Backend Credentials"
cd Backend

echo "📄 Checking backend login endpoint..."
grep -A10 -B5 "ngoadmin@logistics.org\|admin@example.org" consistent-dashboard.js

echo ""
echo "🧪 Testing current backend credentials..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ngoadmin@logistics.org","password":"NgoAdmin123!"}' \
  || echo "❌ First set failed"

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.org","password":"password123"}' \
  || echo "❌ Second set failed"

	cd ..
	
