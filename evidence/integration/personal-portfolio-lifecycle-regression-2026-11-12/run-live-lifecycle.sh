#!/usr/bin/env bash
#
# Live Personal Portfolio lifecycle regression — verification-only.
#
# Starts the REAL IPD IPC server as a sidecar process (compiled from the authoritative
# IPD checkout, read-only), then runs the lifecycle harness, which composes the REAL IRR
# transport over that socket and drives the REAL PersonalPortfolio React component
# against it. Persistence is a real SQLite store.
#
# Usage: bash run-live-lifecycle.sh
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IPD_REPO="${IPD_REPO:-https://github.com/ramkivs/iips-production-market-data.git}"
IPD_DIR="${IPD_DIR:-/tmp/ipd}"
IPD_BUILD_DIR="${IPD_BUILD_DIR:-/tmp/ipd-build}"
IRR_DIR="${IRR_DIR:-$(cd "$HERE/../../../frontend" && pwd)}"

if [ ! -d "$IPD_BUILD_DIR" ]; then
  echo "== cloning the authoritative IPD repository (read-only) =="
  rm -rf "$IPD_DIR"
  git clone --depth 20 "$IPD_REPO" "$IPD_DIR"
  ( cd "$IPD_DIR" && npm install --no-audit --no-fund >/dev/null )
  ( cd "$IPD_DIR" && npx tsc -p tsconfig.json --outDir "$IPD_BUILD_DIR" \
      --declaration false --declarationMap false --sourceMap false )
fi

SOCKFILE="$(mktemp)"
IPD_PID=""
cleanup() { [ -n "$IPD_PID" ] && kill "$IPD_PID" 2>/dev/null || true; rm -f "$SOCKFILE"; }
trap cleanup EXIT

echo "== starting the real IPD IPC server =="
IPD_BUILD_DIR="$IPD_BUILD_DIR" node "$HERE/liveStack.mjs" >"$SOCKFILE" 2>&1 &
IPD_PID=$!

for _ in $(seq 1 60); do
  if [ -s "$SOCKFILE" ]; then break; fi
  sleep 0.5
done
LIVE_IPC_PATH="$(head -n1 "$SOCKFILE" 2>/dev/null || true)"
if [ -z "$LIVE_IPC_PATH" ]; then
  echo "IPD sidecar failed to start:" >&2; cat "$SOCKFILE" >&2; exit 1
fi
echo "   IPC socket: $LIVE_IPC_PATH"

echo "== running the live lifecycle harness =="
cd "$IRR_DIR"
LIVE_IPC_PATH="$LIVE_IPC_PATH" \
  npx vitest run --config "$HERE/vitest.e2e.config.ts"
