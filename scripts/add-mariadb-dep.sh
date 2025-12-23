#!/usr/bin/env bash
set -euo pipefail

PKG_JSON="$HOME/Dev/NGOL-D/Backend/package.json"

if [[ ! -f "$PKG_JSON" ]]; then
  echo "❌ $PKG_JSON not found" >&2
  exit 1
fi

# Use jq to safely add dependency
if command -v jq >/dev/null; then
  jq '.dependencies.mariadb = "^3.3.0"' "$PKG_JSON" > "$PKG_JSON.tmp" && mv "$PKG_JSON.tmp" "$PKG_JSON"
  echo "✅ Added \"mariadb\": \"^3.3.0\" to $PKG_JSON"
else
  # Fallback: manual edit (crude but safe for known structure)
  sed -i '/"dependencies": {/a \    "mariadb": "^3.3.0",' "$PKG_JSON"
  echo "⚠️ Added mariadb dep (manual edit — verify $PKG_JSON)"
fi
