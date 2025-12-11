#!/bin/bash
# /home/jim/Dev/NGOLogisticsD/scripts/deploy-ubuntu.sh
set -euo pipefail

APP_USER="$USER"
INSTALL_ROOT="/home/$APP_USER/.local/ngol-d"
DATA_DIR="/home/$APP_USER/.local/share/ngol-d"
CONFIG_DIR="/home/$APP_USER/.config/ngol-d"

echo "🚀 Deploying NGOLogisticsD to Ubuntu..."

# 1. Create directories
mkdir -p "$INSTALL_ROOT" "$DATA_DIR" "$CONFIG_DIR"

# 2. Build & install frontend
echo "📦 Building frontend..."
cd /home/jim/Dev/NGOLogisticsD/App
npm ci >/dev/null
npm run build >/dev/null
cp -r dist/* "$INSTALL_ROOT/frontend/"

# 3. Build & install backend
echo "📦 Building backend..."
cd /home/jim/Dev/NGOLogisticsD/Backend
npm ci >/dev/null
mkdir -p "$INSTALL_ROOT/backend"
cp -r . "$INSTALL_ROOT/backend/"
rm -rf "$INSTALL_ROOT/backend/node_modules"  # let nix handle deps

# 4. Install Nix-managed dependencies
echo "📦 Installing Nix dependencies..."
nix profile install nixpkgs#nodejs_20 nixpkgs#nginx nixpkgs#sqlite

# 5. Create config
cat > "$CONFIG_DIR/env" <<EOF
NODE_ENV=production
PORT=3001
SQLITE_DB_PATH=$DATA_DIR/ngol.db
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
EOF

# 6. Initialize SQLite DB
mkdir -p "$DATA_DIR"
sqlite3 "$DATA_DIR/ngol.db" < /home/jim/Dev/NGOLogisticsD/Backend/scripts/sqlite-schema.sql 2>/dev/null || true

# 7. Create systemd user service
mkdir -p "$HOME/.config/systemd/user"
cat > "$HOME/.config/systemd/user/ngol-d-backend.service" <<EOF
[Unit]
Description=NGOLogisticsD Backend
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$INSTALL_ROOT/backend
EnvironmentFile=$CONFIG_DIR/env
ExecStart=$(nix eval --raw nixpkgs#nodejs_20)/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=default.target
EOF

# 8. Create nginx config (user-level)
cat > "$CONFIG_DIR/nginx.conf" <<EOF
user $APP_USER;
worker_processes 1;
error_log $DATA_DIR/nginx-error.log;
pid $DATA_DIR/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include $(nix eval --raw nixpkgs#nginx)/conf/mime.types;
    
    server {
        listen 8080;
        server_name localhost;
        root $INSTALL_ROOT/frontend;
        index index.html;

        location /api/ {
            proxy_pass http://127.0.0.1:3001;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }

        location / {
            try_files \$uri \$uri/ /index.html;
        }
    }
}
EOF

# 9. Enable services
systemctl --user daemon-reload
systemctl --user enable --now ngol-d-backend.service

# 10. Start nginx (user-level)
nginx -c "$CONFIG_DIR/nginx.conf" -p "$DATA_DIR/nginx"

echo
echo "✅ Deployment complete!"
echo "   Frontend: http://localhost:8080"
echo "   Backend:  http://localhost:3001"
echo "   Data:     $DATA_DIR/ngol.db"
echo
echo "➡️ To stop: systemctl --user stop ngol-d-backend && pkill -f nginx"
