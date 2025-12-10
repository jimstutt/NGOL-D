#!/bin/bash

echo "Cleaning up NGO Logistics Management System project..."

# Remove root level duplicates
echo "Removing root level duplicates..."
rm -rf middleware models routes utils views public static
rm -f ngo-logistics.service TokenDS.txt

# Remove App backup/debug files
echo "Cleaning App directory..."
cd App
rm -f index.html~ App.vue~ main.js~
rm -f diagnose.js diagnose.mjs
rm -rf dist/
cd ..

# Remove Backend backup/debug files
echo "Cleaning Backend directory..."
cd Backend
rm -f complete-dashboard.js consistent-dashboard.js consistent-dashboard.js~
rm -f consistent-dashboard.js.backup debug-server.js fixed-dashboard.js
rm -f production-server.js robust-server.js simple-dashboard.js working-auth-server.js
rm -rf nix/ scripts/
cd ..

# Clean scripts directory (keep only essential)
echo "Cleaning scripts directory..."
mkdir -p scripts_keep
mv scripts/check-backend-credentials.sh scripts_keep/
mv scripts/start-servers.sh scripts_keep/
mv scripts/start-sqlite.sh scripts_keep/
mv scripts/test-backend.sh scripts_keep/
mv scripts/manual-start.sh scripts_keep/ 2>/dev/null || true
mv scripts/maintenance.sh scripts_keep/ 2>/dev/null || true
rm -rf scripts
mv scripts_keep scripts

# Remove NGOLogisticsD-complete directory
echo "Removing complete directory copy..."
rm -rf NGOLogisticsD-complete

# Remove unnecessary spec file
echo "Removing duplicate spec file..."
rm -f NGOlogisticsFunctionalSpec.md

# Remove duplicate package.json if exists at root
if [ -f "package.json" ] && [ -f "App/package.json" ]; then
    echo "Note: package.json exists at both root and App/. Consider removing root level."
fi

echo ""
echo "Cleanup complete!"
echo "Remaining essential structure:"
echo ""
echo "NGOLogisticsD/"
echo "├── App/                    # Frontend Vue.js application"
echo "├── Backend/               # Node.js backend API"
echo "├── scripts/               # Essential startup scripts"
echo "├── start-servers.sh       # Main startup script"
echo "├── start-sqlite.sh        # Database script"
echo "├── test-backend.sh        # Test script"
echo "├── README.md"
echo "├── INSTALL.md"
echo "└── cleanup.sh             # This script"
echo ""
echo "Total size before cleanup:"
du -sh .
