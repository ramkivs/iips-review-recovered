#!/usr/bin/env bash
# MoSPI live E2E reconciliation — repository-side verification (READ-ONLY).
#
# Establishes, from the repository itself: which URLs the application actually
# calls, whether the private NAS address or any alternative NAS access path has
# ever existed in history, where the `/api/macro` 502 is emitted, and whether
# the configured transport seam is reachable at runtime.
#
# Usage: bash run-repository-verification.sh   (from the repository root)
set -u
cd "$(dirname "$0")/../../../" || exit 1   # repository root

echo "############ 0. HEAD / REFS ############"
echo "branch   : $(git rev-parse --abbrev-ref HEAD)"
echo "head     : $(git rev-parse HEAD)"
echo "main     : $(git rev-parse origin/main)"
echo "commits reachable from any ref : $(git rev-list --count --all)"
echo "refs                           : $(git for-each-ref | wc -l)"
echo "shallow                        : $(git rev-parse --is-shallow-repository)"
echo

echo "############ 1. THE URLS THE APPLICATION ACTUALLY CALLS ############"
grep -n "MOSPI_REST_BASE_URL\|DATA_ENDPOINT\|IIP_FILTER_ENDPOINT\|NAS:\|CPI:\|IIP:" frontend/server/macro/mospi-source.ts | head -12
echo
echo "--- query builders (what the governed request emits) ---"
grep -n "base_year\|frequency_code\|indicator_code\|Format: 'JSON'\|limit: pageSize\|page," frontend/server/macro/mospi-source.ts | sed -n '1,30p'
echo

echo "############ 2. HAS THE PRIVATE NAS ADDRESS EVER EXISTED IN THIS REPOSITORY? ############"
echo -n "git log --all -S '10.24.89.9'  -> "; git log --all -S "10.24.89.9" --oneline | wc -l
echo -n "git log --all -S '10.24'       -> "; git log --all -S "10.24" --oneline | wc -l
echo -n "git log --all -S ':5000'       -> "; git log --all -S ":5000" --oneline | wc -l
echo -n "git grep across ALL refs       -> "
git rev-list --all | while read -r c; do git grep -l "10\.24\.89\.9" "$c" 2>/dev/null; done | head -3
echo "(empty above = never committed on any ref)"
echo

echo "############ 3. HISTORICAL ROUTE NAMES (documented route vs implemented route) ############"
for s in getIIPMonthly getIIPAnnual getIipData getIipFilter getItemIndex getCPIIndex getNASData; do
  printf '%-16s commits containing it: %s\n' "$s" "$(git log --all -S "$s" --oneline | wc -l)"
done
echo

echo "############ 4. WHERE THE HTTP 502 IS EMITTED (application wrapper, not a gateway) ############"
grep -n "sendJson(res, 502\|error: 'macro upstream failure'\|code: err.code\|dataset," frontend/server/macro/macro-transport.ts
echo
echo "--- upstream transport error taxonomy (which codes can produce a 502) ---"
grep -n "RETRY_BUDGET_EXHAUSTED\|'TIMEOUT'\|RATE_LIMITED\|REQUEST_FAILED\|INVALID_RESPONSE\|INCOMPLETE_PAGINATION" frontend/server/macro/mospi-source.ts | head -12
echo

echo "############ 5. RUNTIME CONFIGURABILITY OF THE UPSTREAM BASE URL ############"
echo "--- the seam exists in the adapter ... ---"
grep -n "interface MospiSourceConfig" -A 6 frontend/server/macro/mospi-source.ts | head -10
echo "--- ... but the route call site passes no deps ---"
grep -n "handleMacroRequest" frontend/server/executive-transport.ts
echo "--- and nothing in the macro chain reads an environment variable ---"
grep -rn "process\.env" frontend/server/macro/ frontend/src/api/macro.ts frontend/src/features/research/MacroContext.tsx || echo "(no process.env reference in the macro chain)"
echo

echo "############ 6. BROWSER-SIDE CALL PATH (client) ############"
grep -n "NAS:\|CPI:\|IIP:\|macro transport returned\|noAuthFetch" frontend/src/api/macro.ts | head -8
grep -n "'/api':" -A 2 frontend/vite.config.ts
echo

echo "############ 7. MACRO UNIT SUITES AT THIS HEAD (V21 reproduction) ############"
cd frontend && npx vitest run server/macro/mospi-source.test.ts server/macro/macro-transport.test.ts src/features/research/MacroContext.test.tsx 2>&1 | tail -12
echo "############ END ############"
