#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <deploy-dir>"
  echo "Example: $0 /srv/ngol-d"
  exit 1
fi

DEPLOY_DIR="$1"

echo "🚀 Deploying NGOL-D to $DEPLOY_DIR..."

# Ensure systemd user session has ngol-d user
if ! id ngol-d >/dev/null 2>&1; then
  sudo useradd -r -s /bin/false ngol-d
fi

# Copy build
sudo mkdir -p "$DEPLOY_DIR"
sudo cp -r ./prod-build/backend "$DEPLOY_DIR/"
sudo cp -r ./prod-build/frontend "$DEPLOY_DIR/"

# Set ownership
sudo chown -R ngol-d:ngol-d "$DEPLOY_DIR"

echo "✅ Deployed to $DEPLOY_DIR"
echo "   Next: configure systemd or nginx (see INSTALL.md)"
