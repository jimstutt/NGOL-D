#!/bin/bash
# /home/jim/Dev/NGOLogisticsD/scripts/clean-prod.sh
set -euo pipefail

PROD_ROOT="/home/jim/Dev/NGOLogisticsD"

echo "🧹 Cleaning production environment..."

# Remove dev-only files
rm -f "$PROD_ROOT/check-backend-credentials.s"
rm -f "$PROD_ROOT/cleanup.sh"
rm -f "$PROD_ROOT/create-download-package.sh"
rm -f "$PROD_ROOT/default.nix"
rm -f "$PROD_ROOT/home.nix"
rm -f "$PROD_ROOT/logs/"*
rmdir --ignore-fail-on-non-empty "$PROD_ROOT/logs" 2>/dev/null || true
rm -f "$PROD_ROOT/nix/home-manager-module.nix"
rm -f "$PROD_ROOT/package.json"
rm -f "$PROD_ROOT/package-lock.json"
rm -f "$PROD_ROOT/scripts/check-backend-credentials.sh"
rm -f "$PROD_ROOT/scripts/maintenance.sh"
rm -f "$PROD_ROOT/scripts/manual-start.sh"
rm -f "$PROD_ROOT/scripts/start-sqlite.sh"
rm -f "$PROD_ROOT/scripts/test-backend.sh"
rm -f "$PROD_ROOT/sqlite-schema.md"

# Keep: data/ (if using SQLite in prod), LICENSE, INSTALL.md, README.md

echo "✅ Production cleanup complete."
echo "➡️ Next: Build frontend with 'cd App && npm run build'"
