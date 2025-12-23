#!/usr/bin/env bash
set -euo pipefail

cd "$HOME/Dev/NGOL-D/Backend"

if [[ ! -f package.json ]]; then
  echo "❌ package.json missing" >&2
  exit 1
fi

echo "🔄 Regenerating package-lock.json..."
npm install --package-lock-only --ignore-scripts

if [[ -f package-lock.json ]]; then
  echo "✅ package-lock.json updated"
  head -n 5 package-lock.json | grep -q '"lockfileVersion"' && echo "   Lockfile version OK"
else
  echo "❌ Failed to generate package-lock.json" >&2
  exit 1
fi
