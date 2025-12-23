#!/usr/bin/env bash
set -euo pipefail
cd ~/Dev/NGOL-D
echo "1️⃣ Building App & Backend..."
nix build .#App .#Backend
echo "2️⃣ Running integration tests (auto-seeds users)..."
nix run .#check
echo "3️⃣ Starting full stack (dev)..."
nix run .#Backend &
BACKEND_PID=$!
sleep 3
(cd App && npm run dev) &
FRONTEND_PID=$!
echo "🌍 Ready!"
echo "   Frontend: http://localhost:5173 (login modal first)"
echo "   Backend:  http://localhost:3000/api/health"
echo "   Users:    admin@example.org / password123"
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit" INT TERM
wait
