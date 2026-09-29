#!/usr/bin/env bash
# Build the weekly flyer from week.json -> <file>.pptx (dark) and <file>_Light.pptx
#   ./make.sh                    both themes
#   ./make.sh week.json light    one theme
set -e
cd "$(dirname "$0")"
CFG=${1:-week.json}
for THEME in ${2:-dark light}; do
  python3 compose.py "$CFG" "$THEME"
  node build.js "$CFG" "$THEME"
done
