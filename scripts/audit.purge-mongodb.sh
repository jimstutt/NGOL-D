#!/usr/bin/env bash
set -euo pipefail

LOG="/tmp/-audit-$(date +%Y%m%d-%H%M%S).log"
BACKUP_DIR="/tmp/-backups-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

exec > >(tee -a "$LOG") 2>&1

echo "🔍  Audit & Purge — $(date)"
echo "📁 Log: $LOG"
echo "📦 Backups: $BACKUP_DIR"

# 1. Audit: list all  traces
echo -e "\n=== 🕵️ AUDIT: Detected  Traces ==="

# APT sources
echo "APT Repos:"
ls -la /etc/apt/sources.list.d/ | grep -i mongo || echo "  (none)"
grep -r "\|mongo" /etc/apt/sources.list* 2>/dev/null || echo "  (none)"

# Installed packages
echo -e "\nInstalled Packages:"
dpkg -l | grep -iE 'mongo|ferret' || echo "  (none)"

# Services
echo -e "\nServices:"
systemctl list-units --type=service | grep -i mongo || echo "  (none)"

# Processes
echo -e "\nRunning Processes:"
ps aux | grep -i '[m]ongo\|[f]erret' || echo "  (none)"

# Files (non-NGOL-D)
echo -e "\nFiles (excluding ~/Dev/NGOL-D):"
sudo find / -path "$HOME/Dev/NGOL-D" -prune -o \
  \( -name "*mongo*" -o -name "*ferret*" \) \
  -type f -exec ls -la {} \; 2>/dev/null | head -20 || echo "  (none)"

# 2. Confirm before purge
read -p "⚠️ Proceed with purge? (y/N): " -n 1 -r
echo
[[ ! $REPLY =~ ^[Yy]$ ]] && { echo "❌ Aborted."; exit 1; }

# 3. Purge
echo -e "\n=== 🧹 PURGE ==="

# A. Remove APT repos
echo "🗑️ Removing APT repos..."
sudo find /etc/apt/sources.list.d/ -name "*mongo*" -print -exec cp {} "$BACKUP_DIR/" \; -exec rm {} \; 2>/dev/null || true
sudo sed -i.bak '/\|mongo/d' /etc/apt/sources.list /etc/apt/sources.list.d/* 2>/dev/null || true

# B. Remove packages
echo "📦 Removing /FerretDB packages..."
sudo apt remove --purge -y \
  -org -org-server -org-shell -org-mongos -org-tools \
  -clients -server-core -server-core-noarch \
  ferretdb ferretdb-* \
  2>/dev/null || true

sudo apt autoremove -y

# C. Remove data & config
echo "🗑️ Removing data & config..."
for dir in /var/lib/ /var/log/ /etc/mongod.conf /etc/*; do
  [[ -e "$dir" ]] && { 
    sudo cp -r "$dir" "$BACKUP_DIR/" 2>/dev/null || true
    sudo rm -rf "$dir"
    echo "  Removed $dir"
  }
done

# D. Remove services
echo "🔧 Cleaning up services..."
sudo systemctl stop mongod  ferretdb 2>/dev/null || true
sudo systemctl disable mongod  ferretdb 2>/dev/null || true
sudo rm -f /etc/systemd/system/mongod.service /lib/systemd/system/mongod.service 2>/dev/null || true

# E. Clean dpkg
echo "🧹 Purging residual config..."
sudo dpkg -l | grep '^rc' | awk '{print $2}' | grep -i mongo | xargs sudo dpkg --purge 2>/dev/null || true

# 4. Final check
echo -e "\n=== ✅ POST-PURGE STATUS ==="
echo "APT repos:"
grep -r "" /etc/apt/ 2>/dev/null || echo "  (clean)"
echo "Packages:"
dpkg -l | grep -iE 'mongo|ferret' || echo "  (none)"
echo "Services:"
systemctl list-units --type=service | grep -i mongo || echo "  (none)"

echo -e "\n🎉  purge complete."
echo "📦 Backups saved to: $BACKUP_DIR"
echo "🔍 Full log: $LOG"
