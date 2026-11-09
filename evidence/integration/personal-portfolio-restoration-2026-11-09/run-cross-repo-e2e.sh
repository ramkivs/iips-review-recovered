#!/usr/bin/env bash
#
# Cross-repository end-to-end verification for the Personal Portfolio restoration.
#
# Clones the authoritative IPD repository (read-only; never modified), compiles
# it, then runs the harness against the REAL IPD IPC server over a real unix
# socket with this repository's transport as the HTTP layer.
#
# Usage:
#   bash run-cross-repo-e2e.sh
#
# Environment overrides:
#   IPD_REPO       IPD clone URL (default: the authoritative repository)
#   IPD_DIR        IPD checkout directory (default: /tmp/ipd)
#   IPD_BUILD_DIR  IPD compiled output directory (default: /tmp/ipd-build)
#   IRR_DIR        IRR frontend directory (default: the sibling frontend/ tree)
#
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IPD_REPO="${IPD_REPO:-https://github.com/ramkivs/iips-production-market-data.git}"
IPD_DIR="${IPD_DIR:-/tmp/ipd}"
IPD_BUILD_DIR="${IPD_BUILD_DIR:-/tmp/ipd-build}"
IRR_DIR="${IRR_DIR:-$(cd "$HERE/../../../frontend" && pwd)}"

echo "== cloning the authoritative IPD repository (read-only) =="
rm -rf "$IPD_DIR"
git clone --depth 20 "$IPD_REPO" "$IPD_DIR"
git -C "$IPD_DIR" log --oneline -1

echo "== installing IPD dependencies =="
( cd "$IPD_DIR" && npm install --no-audit --no-fund >/dev/null )

echo "== compiling IPD =="
( cd "$IPD_DIR" && npx tsc -p tsconfig.json --outDir "$IPD_BUILD_DIR" \
    --declaration false --declarationMap false --sourceMap false )

echo "== running the cross-repository harness =="
cd "$IRR_DIR"
IPD_DIR="$IPD_DIR" IPD_BUILD_DIR="$IPD_BUILD_DIR" IRR_DIR="$IRR_DIR" \
  npx tsx "$HERE/cross-repo-e2e-harness.mjs"
