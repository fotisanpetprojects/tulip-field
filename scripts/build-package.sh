#!/bin/zsh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
NAME="tulip-field"
VERSION="$(python3 - <<'PY'
import json
from pathlib import Path
manifest = json.loads(Path("manifest.json").read_text())
print(manifest["version"])
PY
)"

mkdir -p "$DIST"
ZIP_PATH="$DIST/${NAME}-${VERSION}.zip"
rm -f "$ZIP_PATH"

cd "$ROOT"
zip -qr "$ZIP_PATH" \
  manifest.json \
  background.js \
  content.js \
  assets/icons \
  PRIVACY_POLICY.md

echo "Created $ZIP_PATH"
