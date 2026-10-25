#!/usr/bin/env bash
# NP-06 Reports — reproduction script for the pass-2 evidence annex.
#
# Authority: `IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01` §2(4)
# (testing and qualification evidence for the work actually restored). This script runs the
# repository's own checks; it grants no authority and admits nothing.
#
# Prerequisites: Node 22 / npm 10, `npm ci` in `frontend/` (as CI does). If the sandbox needs a
# custom CA bundle for the GitHub-pinned dependencies, export NODE_EXTRA_CA_CERTS before running —
# that is an environment workaround, is not a repository change, and is not used in CI.
#
# Usage: bash REPRODUCE.sh   (from anywhere; paths are resolved relative to the repository root)
set -u

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$repo_root/frontend" || exit 1

echo "== baseline =="
git rev-parse HEAD

echo
echo "== focused Reports suites (integration / canonical / artifact / fence / composed route) =="
npx vitest run \
  server/reports/reports-persistence-integration.test.ts \
  server/reports/reports-canonical.test.ts \
  server/reports/reports-artifact.test.ts \
  server/reports-transport.test.ts \
  server/reports-api.test.ts

echo
echo "== separate-process restart suite =="
npx vitest run server/reports-restart.test.ts

echo
echo "== full CI suite + zero-test guard =="
npm run test:ci
node .ci/assert-tests.js .vitest-report.json

echo
echo "== typechecks =="
npm run typecheck
npm run typecheck:replay-server
npx tsc --noEmit --strict --target ES2020 --module ESNext --moduleResolution bundler \
  --esModuleInterop --skipLibCheck --types node \
  server/reports/persistence-port.ts server/reports/persistence.ts \
  server/reports/np04-adapter.ts server/reports/index.ts server/reports-restart-harness.ts

echo
echo "== build =="
npm run build

echo
echo "NOTE: none of the above is F-7, capability acceptance, admission or production readiness."
