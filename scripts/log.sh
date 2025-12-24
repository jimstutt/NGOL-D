#!/usr/bin/env bash
set -euo pipefail

LOG_FILE="./PROJECT_LOG.md"
DATE=$(date '+%Y-%m-%d')

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 \"Brief summary\""
  echo "Example: $0 \"Fixed MariaDB init race in flake.nix\""
  exit 1
fi

SUMMARY="$1"
CHAT_TITLE="[NGOL-D] ${SUMMARY} — ${DATE}"

# Detect if inside git repo & get branch
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")

cat <<EOF >> "$LOG_FILE.tmp"

### ${DATE}: ${SUMMARY}
> **Goal**:  
> **Actions**:  
> **Outcome**:  
> **Next**:  
> **Branch**: \`${BRANCH}\`  
> **Chat**: \`${CHAT_TITLE}\`
EOF

# Prepend to Recent Activity table
awk -v entry="| ${DATE} | ${SUMMARY} | See \`### ${DATE}: ${SUMMARY}\` below | In Progress |" '
  /^## 📅 Recent Activity/ {
    print
    getline; print  # header row
    getline; print  # separator
    print entry
    while (getline) print
    next
  }
  { print }
' "$LOG_FILE" > "$LOG_FILE.tmp2" && mv "$LOG_FILE.tmp2" "$LOG_FILE"

# Append new section
cat "$LOG_FILE.tmp" >> "$LOG_FILE"
rm -f "$LOG_FILE.tmp"

echo "✅ Added log entry. Suggested chat title: ${CHAT_TITLE}"
echo "   → Review/edit: ${LOG_FILE}"
