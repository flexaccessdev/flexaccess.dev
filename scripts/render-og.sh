#!/usr/bin/env bash
# Renders scripts/og/og.html to public/og.png (1200x630) with headless Chrome.
# Dev-only: run it when the social-preview design changes, then commit the PNG.
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="${CHROME:-$(command -v google-chrome || command -v chromium || command -v chromium-browser)}"
"$CHROME" --headless=new --no-sandbox --disable-gpu --hide-scrollbars \
  --window-size=1200,630 --virtual-time-budget=5000 \
  --screenshot="$PWD/public/og.png" "file://$PWD/scripts/og/og.html"
echo "wrote public/og.png"
