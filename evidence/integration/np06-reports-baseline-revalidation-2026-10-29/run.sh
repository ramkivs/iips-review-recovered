#!/usr/bin/env bash
# Read-only verification at IRR main 8292fe1c (tree d5b92bdd). Scratch worktree /tmp/irr-main.
set -u
OUT=/tmp/evidence-run
cd /tmp/irr-main/frontend
export NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/e2b-ca.crt
run() { # name, command...
  local name="$1"; shift
  local log="$OUT/$name.log"
  local start=$(date -u +%FT%TZ)
  { echo "# cmd: $*"; echo "# cwd: $(pwd)"; echo "# started_utc: $start"; echo "# ---- raw output ----"; } > "$log"
  "$@" >> "$log" 2>&1
  local rc=$?
  { echo "# ---- end raw output ----"; echo "# exit_code: $rc"; echo "# finished_utc: $(date -u +%FT%TZ)"; } >> "$log"
  echo "$name exit=$rc sha256=$(sha256sum "$log" | cut -c1-64)" >> "$OUT/summary.txt"
}
: > "$OUT/summary.txt"
run 01-typecheck npm run typecheck
run 02-typecheck-replay-server npm run typecheck:replay-server
run 03-reports-focused npx vitest run --reporter=verbose \
  server/reports-restart.test.ts \
  server/reports/reports-persistence-integration.test.ts \
  server/reports/reports-artifact.test.ts \
  server/reports/reports-canonical.test.ts \
  server/reports-transport.test.ts \
  server/reports-api.test.ts \
  server/reports-owner-carrier.test.ts \
  server/reports-owner-resolver.test.ts \
  src/api/reports.test.ts \
  src/features/reports/Reports.test.tsx \
  src/app/App.test.tsx
run 04-full-suite-test-ci npm run test:ci
run 05-assert-tests node .ci/assert-tests.js .vitest-report.json
run 06-build npm run build
echo DONE >> "$OUT/summary.txt"
