#!/usr/bin/env bash
# ============================================================
# Pakistan MCQs Hub - Linux desktop build (AppImage + deb)
# Requires: Node.js + npm
# Usage:   bash scripts/build-linux.sh
# ============================================================
set -e
cd "$(dirname "$0")/.."
if [ ! -d desktop/node_modules ]; then
  echo "[1/4] Installing desktop build tool..."
  (cd desktop && npm install --no-audit --no-fund)
fi
echo "[2/4] Building AppImage + deb..."
(cd desktop && npm run dist:linux)
echo "[3/4] Done. Artifacts in desktop/release/"
echo "[4/4] Release summary:"
ls -1 desktop/release/ 2>/dev/null || true
