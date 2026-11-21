#!/usr/bin/env bash
# Local check: last frame of every scene of a script, as one contact sheet: ./preview.sh <module>
set -e
cd "$(dirname "$0")"
rm -rf scenes stills; python3 build.py "$1" >/dev/null
for s in scenes/*.json; do d=$(python3 -c "import json;print(json.load(open('$s'))['duration']-0.7)"); node render.mjs "$s" --stills "$d" >/dev/null; done
python3 - "$1" <<'PY'
import glob, sys
from PIL import Image
fs = sorted(glob.glob('stills/*.png')); W, H = 960, 540
sheet = Image.new('RGB', (W * 2, H * ((len(fs) + 1) // 2)), 'white')
for i, f in enumerate(fs): sheet.paste(Image.open(f).resize((W, H)), ((i % 2) * W, (i // 2) * H))
sheet.save(f'/tmp/sheet-{sys.argv[1]}.png'); print(f'/tmp/sheet-{sys.argv[1]}.png')
PY
