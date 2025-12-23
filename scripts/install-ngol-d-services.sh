#!/usr/bin/env bash
set -euo pipefail

# Install NGOL-D services on Ubuntu (systemd + Nix-built binaries)
# Run as root or with sudo

INSTALL_ROOT="/opt/ngol-d"
USER="ngol-d"

# Create user
id "$USER" &>/dev/null || useradd --system --home-dir "$INSTALL_ROOT" --shell /bin/false "$USER"

# Build & install
cd ~/Dev/NGOL-D
nix build .#Backend --out-link "$INSTALL_ROOT/backend"
install -Dm644 Backend/migrate.js "$INSTALL_ROOT/migrate.js"
install -Dm755 Backend/seed.js "$INSTALL_ROOT/seed.js" 2>/dev/null || true

# systemd service
cat > /etc/systemd/system/ngol-d-backend.service <<EOF
[Unit]
Description=NGOL-D Backend
After=network.target mariadb.service
Requires=mariadb.service

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$INSTALL_ROOT
Environment=MARIADB_HOST=127.0.0.1
Environment=MARIADB_PORT=3306
Environment=MARIADB_USER=ngol
Environment=MARIADB_PASSWORD=ngol
Environment=MARIADB_DATABASE=NGOL_D
Environment=NODE_ENV=production
ExecStartPre=$INSTALL_ROOT/backend/bin/ngol-d-backend --migrate  # ← add --migrate flag support
ExecStart=$INSTALL_ROOT/backend/bin/ngol-d-backend
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Enable
systemctl daemon-reload
systemctl enable ngol-d-backend

echo "✅ Installed to $INSTALL_ROOT"
echo "✅ Service: sudo systemctl start ngol-d-backend"
echo "✅ Logs: journalctl -u ngol-d-backend -f"
