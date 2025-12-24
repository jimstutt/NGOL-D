# NGOL-D Installation — Ubuntu + Home-Manager

## 1. Install Nix
sh <(curl -L https://nixos.org/nix/install) --no-daemon
mkdir -p ~/.config/nix
echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf

## 2. Install Home-Manager
nix-shell -p nixFlakes --run "nix run github:nix-community/home-manager -- switch --flake .#$(whoami)"

## 3. MariaDB
sudo apt update && sudo apt install mariadb-server
sudo systemctl enable --now mariadb
sudo mysql_secure_installation

## 4. DB Setup
sudo mysql -e "
  CREATE DATABASE IF NOT EXISTS ngol_d;
  CREATE USER IF NOT EXISTS 'ngol'@'localhost' IDENTIFIED BY 'ngol-secret';
  GRANT ALL PRIVILEGES ON ngol_d.* TO 'ngol'@'localhost';
  FLUSH PRIVILEGES;
"

## 5. Build
git clone https://github.com/jimstutt/NGOL-D.git ~/Dev/NGOL-D
cd ~/Dev/NGOL-D
git add . && git commit -m "build" || true
nix build .#ngol-d-backend .#ngol-d-frontend

## 6. Home-Manager Config
# Add to ~/.config/home-manager/home.nix:
#   imports = [ ./ngol-d-service.nix ];

## 7. Deploy
home-manager switch
systemctl --user daemon-reload
systemctl --user enable --now ngol-d-backend

## 8. Frontend (dev)
cd ~/Dev/NGOL-D/App && npm install && npm run dev
