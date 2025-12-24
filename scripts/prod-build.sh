#!/usr/bin/env bash
# ~/Dev/NGOL-D/scripts/prod-build.sh
set -euo pipefail

OUT_DIR="/tmp/ngol-d-prod-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT_DIR"

echo "📦 Building NGOL-D production artifacts..."

# Build backend (Nix)
nix build .#Backend --out-link "$OUT_DIR/backend"

# Build frontend (Nix)
nix build .#App --out-link "$OUT_DIR/app"

# Verify
ls -l "$OUT_DIR/backend/bin/ngol-d-backend"
ls -l "$OUT_DIR/app" | head -5

echo -e "\n✅ Production artifacts:"
echo "   Backend: $OUT_DIR/backend"
echo "   Frontend: $OUT_DIR/app"
echo "➡️ Next: ./scripts/prod-deploy.sh $OUT_DIR"
