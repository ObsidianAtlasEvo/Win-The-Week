#!/usr/bin/env bash
# Build the weekly flyer from week.json -> <file>.pptx (+ preview PNG)
set -e
cd "$(dirname "$0")"
CFG=${1:-week.json}
python3 compose.py "$CFG"
python3 - "$CFG" <<'PY'
import sys
from PIL import Image
for f in ["bestbuy_logo.png", "lg_logo.png"]:
    im = Image.open("assets/" + f).convert("RGBA")
    im.resize((im.width * 4, im.height * 4), Image.LANCZOS).save("build/" + f)
PY
node build.js "$CFG"
