#!/usr/bin/env bash
# verify_g2_2_checks.sh -- G2-2 decision record R2: read-only reference checks.
# Reads GitHub only: git ls-remote and bare partial clones written under WORK.
# Writes to no repository, pushes nothing, applies nothing.
#   bash verify_g2_2_checks.sh [WORK_DIR]           default checks C01-C22 (published state)
#   bash verify_g2_2_checks.sh --route [WORK_DIR]   route checks R01-R04 (session head vs base; run after push)
# Exit 0 = no FAIL rows.
set -u

MODE="default"
if [ "${1:-}" = "--route" ]; then MODE="route"; shift; fi

IRR_URL="https://github.com/ramkivs/iips-review-recovered.git"
IPD_URL="https://github.com/ramkivs/iips-production-market-data.git"
IRR_BASE="800789957f2a3cf4e28d5dfff49d92f29d6a7671"
IRR_SESSION_REF="arena/1dcbe88d-iips-review-recovered"
IRR_PR42_MERGE="47edf6f3db79c6c443caed148121406f33a158b7"
IPD_MAIN="4d3e1cdca3a33da0ec3be8b336b17128108a502c"
IPD_PIN_BRANCH="np04-governed-persistence-windows"
IPD_PIN="2e11fa3b689d1a3674a5e4ba1f1de9a559e20494"
IPD_CAND="6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4"
IPD_CAND_BR1="arena/01a0e6d9-iips-production-market-data"
IPD_CAND_BR2="arena/01a0f308-iips-production-market-data"
IPD_ACC_BR="arena/01a0f839-iips-production-market-data"
IPD_ACC_TIP="12c480b5bf5cfbe0f296fcd12c9189328b915417"
IPD_BASELINE="0dab1221fb0f89e2e0601ea905d642bfe72d5f9c"
IRR_G2_CONSUMER="a0ab5a344d1ca2cb7c07a8fa6ae2090b2535852c"
IRR_D3_REF="4906a6b71f5133d714f0f4c29c89dba22ded37f5"
PROMO_ACT="2606185923f6cbd3f4df5c3af200f54d40ed4bbc"
G1_RECORD="docs/integration/IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_RECORD.md"
G1_B2="docs/integration/IIPS_v3.0_G1_B2_PIT_D114_CAPABILITY_ADMISSION_DECISION.md"
G1_BOUNDARY="docs/integration/IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_BOUNDARY.md"
PIN_PKG="frontend/package.json"

R2_FILES=(
  "docs/integration/IIPS_v3.0_G2_2_EXISTING_CAPABILITY_CONVERGENCE_DECISION_RECORD.md"
  "evidence/integration/g2-2-decision-gate/2026-10-09/EVIDENCE-ANNEX.md"
  "evidence/integration/g2-2-decision-gate/2026-10-09/SHA256SUMS"
  "evidence/integration/g2-2-decision-gate/2026-10-09/g2_2_checks_output.txt"
  "evidence/integration/g2-2-decision-gate/2026-10-09/verify_g2_2_checks.sh"
)
RATIFIED=(
  "frontend/server/reports-api.test.ts"
  "frontend/server/reports-transport.test.ts"
  "frontend/server/reports-transport.ts"
  "frontend/server/reports/artifact.ts"
  "frontend/server/reports/canonical.ts"
  "frontend/server/reports/composition.ts"
  "frontend/server/reports/index.ts"
  "frontend/server/reports/np04-adapter.ts"
  "frontend/server/reports/persistence-port.ts"
  "frontend/server/reports/persistence.ts"
  "frontend/server/reports/reports-artifact.test.ts"
  "frontend/server/reports/reports-canonical.test.ts"
  "frontend/server/reports/reports-persistence.test.ts"
)
EXCLUDED=(
  "frontend/package.json"
  "frontend/package-lock.json"
  "frontend/server/admin-live-composition.test.ts"
  "frontend/server/admin-transport.test.ts"
  "frontend/server/admin-transport.ts"
  "frontend/server/executive-transport.ts"
  "frontend/server/pit/ipdPitReadAdapter.ts"
  "frontend/server/secured-executor.ts"
  "frontend/server/tenant-directory.test.ts"
  "frontend/server/tenant-membership-store.ts"
)
AD02_CONSUMERS=(
  "frontend/server/pit/ipdPitReadAdapter.ts"
  "frontend/server/pit/nonProductionPitStore.ts"
  "frontend/server/pit/nonProductionRuntimePitStore.ts"
  "frontend/server/pit/pitRuntimeIntegration.test.ts"
  "frontend/server/pit/pitD114RuntimeIntegration.test.ts"
)
AD02_SYMBOLS=(PitReadService PointInTimeStore DataProvenanceDTO CanonicalEnvelope DataDomain populateNonProductionD114Pit createNonProductionD114PitStore ingestNonProductionD114Archives)

WORK="${1:-${TMPDIR:-/tmp}/g2-2-checks}"
mkdir -p "$WORK" || { echo "FATAL: cannot create $WORK"; exit 2; }
pass=0; fail=0; nv=0
row() { printf '%-4s %-13s %s | %s\n' "$1" "$2" "$3" "$4"; case "$2" in PASS) pass=$((pass+1));; FAIL) fail=$((fail+1));; *) nv=$((nv+1));; esac; }
remote_tip() { git ls-remote "$1" "refs/heads/$2" 2>/dev/null | awk '{print $1}' | head -1; }
resolve() { git -C "$1" rev-parse -q --verify "$2^{commit}" 2>/dev/null || true; }
is_anc() { git -C "$1" merge-base --is-ancestor "$2" "$3" 2>/dev/null; }
blob_at() { git -C "$1" rev-parse -q --verify "$2:$3" 2>/dev/null || echo NONE; }

echo "G2-2 REFERENCE CHECKS - CANDIDATE R2 (mode: $MODE)"
echo "run_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "IRR=$IRR_URL"
echo "IPD=$IPD_URL"
echo "----"

git clone -q --bare --filter=blob:none "$IRR_URL" "$WORK/irr.git" 2>"$WORK/irr.err" || { echo "FATAL: clone of IRR failed"; cat "$WORK/irr.err"; exit 2; }
git clone -q --bare --filter=blob:none "$IPD_URL" "$WORK/ipd.git" 2>"$WORK/ipd.err" || { echo "FATAL: clone of IPD failed"; cat "$WORK/ipd.err"; exit 2; }
IRRG="$WORK/irr.git"; IPDG="$WORK/ipd.git"

if [ "$MODE" = "route" ]; then
  S=$(remote_tip "$IRR_URL" "$IRR_SESSION_REF")
  mt=$(remote_tip "$IRR_URL" main)
  if [ -n "$S" ] && is_anc "$IRRG" "$IRR_BASE" "$S"; then row R01 PASS "session head descends from base $IRR_BASE" "$S"; else row R01 FAIL "session head does not descend from base" "${S:-none}"; fi
  diffset=$(git -C "$IRRG" diff --no-renames --name-only "$IRR_BASE" "${S:-0}" 2>/dev/null | sort | tr '\n' ' ')
  expset=$(printf '%s\n' "${R2_FILES[@]}" | sort | tr '\n' ' ')
  if [ -n "$S" ] && [ "$diffset" = "$expset" ]; then row R02 PASS "session head differs from base only in the five R2 paths" "5 paths"; else row R02 FAIL "session head differs from base by other paths" "$diffset"; fi
  ok=1; sums=$(git -C "$IRRG" show "$S:evidence/integration/g2-2-decision-gate/2026-10-09/SHA256SUMS" 2>/dev/null)
  while read -r h p; do [ -z "$h" ] && continue; got=$(git -C "$IRRG" show "$S:$p" 2>/dev/null | sha256sum | awk '{print $1}'); [ "$got" = "$h" ] || ok=0; done <<< "$sums"
  if [ "$ok" = 1 ] && [ -n "$sums" ]; then row R03 PASS "R2 files at session head match SHA256SUMS" "4 files"; else row R03 FAIL "R2 files at session head do not match SHA256SUMS" "-"; fi
  if [ "$mt" = "$IRR_BASE" ]; then row R04 PASS "IRR main unchanged at base" "$mt"; else row R04 FAIL "IRR main differs from base" "${mt:-none}"; fi
  echo "----"; echo "SUMMARY mode=route pass=$pass fail=$fail not_verified=$nv"
  [ "$fail" -eq 0 ]; exit $?
fi

# ---- default mode: published state ----
t=$(remote_tip "$IRR_URL" main)
if [ "$t" = "$IRR_BASE" ]; then row C01 PASS "IRR main tip is the base" "$t"; else row C01 FAIL "IRR main tip differs from base" "got ${t:-none}"; fi
if git -C "$IRRG" show "$IRR_BASE:$PIN_PKG" 2>/dev/null | grep -q "$IPD_PIN"; then row C02 PASS "frontend/package.json at base pins IPD $IPD_PIN" "$IRR_BASE"; else row C02 FAIL "pin not found in frontend/package.json at base" "$IRR_BASE"; fi
b=$(blob_at "$IRRG" "$IRR_BASE" "$G1_RECORD"); case "$b" in 857d1451*) row C03 PASS "G1 decision record blob is 857d1451" "$b";; *) row C03 FAIL "G1 decision record blob is not 857d1451" "got $b";; esac
b=$(blob_at "$IRRG" "$IRR_BASE" "$G1_B2"); case "$b" in 2803c1c2*) row C04 PASS "G1 B2 admission blob is 2803c1c2" "$b";; *) row C04 FAIL "G1 B2 admission blob is not 2803c1c2" "got $b";; esac
t=$(remote_tip "$IPD_URL" main); if [ "$t" = "$IPD_MAIN" ]; then row C05 PASS "IPD main tip" "$t"; else row C05 FAIL "IPD main tip differs" "got ${t:-none}"; fi
t=$(remote_tip "$IPD_URL" "$IPD_PIN_BRANCH"); if [ "$t" = "$IPD_PIN" ]; then row C06 PASS "IPD $IPD_PIN_BRANCH tip equals the IRR pin" "$t"; else row C06 FAIL "pin branch tip differs from the IRR pin" "got ${t:-none}"; fi
t1=$(remote_tip "$IPD_URL" "$IPD_CAND_BR1"); t2=$(remote_tip "$IPD_URL" "$IPD_CAND_BR2")
if [ "$t1" = "$IPD_CAND" ] && [ "$t2" = "$IPD_CAND" ]; then row C07 PASS "AD-03 reference $IPD_CAND is the tip of both candidate branches" "$t1"; else row C07 FAIL "candidate branch tips differ" "01a0e6d9=${t1:-none} 01a0f308=${t2:-none}"; fi
t=$(remote_tip "$IPD_URL" "$IPD_ACC_BR"); if [ "$t" = "$IPD_ACC_TIP" ]; then row C08 PASS "IPD acceptance branch tip" "$t"; else row C08 FAIL "acceptance branch tip differs" "got ${t:-none}"; fi
s=$(resolve "$IPDG" "$IPD_BASELINE"); if [ -n "$s" ]; then row C09 PASS "G-2 baseline resolves in IPD" "$s"; else row C09 FAIL "G-2 baseline does not resolve in IPD" "unresolved"; fi
s=$(resolve "$IRRG" "$IRR_G2_CONSUMER"); if [ -n "$s" ] && is_anc "$IRRG" "$s" "$IRR_BASE"; then row C10 PASS "AD-04 consumer commit is an ancestor of IRR base" "$s"; else row C10 FAIL "AD-04 consumer commit is not an ancestor of IRR base" "${s:-unresolved}"; fi
s=$(resolve "$IRRG" "$IRR_D3_REF"); if [ -n "$s" ] && is_anc "$IRRG" "$s" "$IRR_BASE"; then row C11 PASS "4906a6b is an ancestor of IRR base" "$s"; else row C11 FAIL "4906a6b is not an ancestor of IRR base" "${s:-unresolved}"; fi
s=$(resolve "$IRRG" "$IRR_PR42_MERGE"); if [ -n "$s" ] && is_anc "$IRRG" "$s" "$IRR_BASE"; then row C12 PASS "PR #42 merge is an ancestor of IRR base" "$s"; else row C12 FAIL "PR #42 merge is not an ancestor of IRR base" "${s:-unresolved}"; fi
s=$(resolve "$IPDG" "$PROMO_ACT"); acc=$(remote_tip "$IPD_URL" "$IPD_ACC_BR")
if [ -n "$s" ] && [ -n "$acc" ] && is_anc "$IPDG" "$s" "$acc"; then row C13 PASS "promotion-authority act is on $IPD_ACC_BR (coverage NOT evaluated)" "$s"; else row C13 FAIL "promotion-authority act not found on $IPD_ACC_BR" "${s:-unresolved}"; fi
row C14 NOT-VERIFIED "AD-06 pin provenance: OPEN, not checked by design" "pin $IPD_PIN"
row C15 NOT-VERIFIED "AD-20 G-2 consumer promotion coverage: OPEN, not checked by design" "$IRR_G2_CONSUMER"
b=$(blob_at "$IRRG" "$IRR_BASE" "$G1_BOUNDARY"); case "$b" in 5f341ac6*) row C16 PASS "G1 boundary record blob is 5f341ac6" "$b";; *) row C16 FAIL "G1 boundary record blob is not 5f341ac6" "got $b";; esac
ok=1; detail=""
for p in "${RATIFIED[@]}"; do
  bm=$(blob_at "$IRRG" "$IRR_PR42_MERGE" "$p"); bn=$(blob_at "$IRRG" "$IRR_BASE" "$p")
  if [ "$bm" = "$bn" ] && [ "$bm" != "NONE" ]; then :; else ok=0; detail="$detail $p"; fi
done
if [ "$ok" = 1 ]; then row C17 PASS "all ${#RATIFIED[@]} AD-01 paths on base equal their PR #42 merge blobs" "${#RATIFIED[@]} paths"; else row C17 FAIL "AD-01 path drift or missing:$detail" "-"; fi
pr_set=$(git -C "$IRRG" diff --no-renames --name-only "$IRR_PR42_MERGE^1" "$IRR_PR42_MERGE" 2>/dev/null | sort)
exp_set=$(printf '%s\n' "${RATIFIED[@]}" "${EXCLUDED[@]}" | sort)
n=$(printf '%s\n' "$pr_set" | grep -c .)
if [ "$pr_set" = "$exp_set" ] && [ "$n" -eq 23 ]; then row C18 PASS "PR #42 changed paths partition exactly into ${#RATIFIED[@]} ratified and ${#EXCLUDED[@]} excluded" "$n paths"; else row C18 FAIL "PR #42 path partition does not match" "count=$n"; fi
if ! is_anc "$IPDG" "$IPD_CAND" "$IPD_MAIN"; then row C19 PASS "AD-03 reference is not an ancestor of IPD main" "$IPD_MAIN"; else row C19 FAIL "AD-03 reference is an ancestor of IPD main" "$IPD_MAIN"; fi
pk=$(git -C "$IPDG" show "$IPD_PIN:package.json" 2>/dev/null)
if echo "$pk" | grep -q '"\./pit"' && echo "$pk" | grep -q '"\./d114-non-production"' && echo "$pk" | grep -q '"\./persistence"'; then row C20 PASS "pin export map contains ./pit, ./d114-non-production and ./persistence" "$IPD_PIN"; else row C20 FAIL "pin export map lacks an AD-02 subpath" "$IPD_PIN"; fi
miss=""
for sym in "${AD02_SYMBOLS[@]}"; do git -C "$IPDG" grep -q -w -e "$sym" "$IPD_PIN" -- src 2>/dev/null || miss="$miss $sym"; done
if [ -z "$miss" ]; then row C21 PASS "all ${#AD02_SYMBOLS[@]} AD-02 symbols are present in the pin source tree" "$IPD_PIN"; else row C21 FAIL "AD-02 symbols not found at pin:$miss" "$IPD_PIN"; fi
miss=""
for p in "${AD02_CONSUMERS[@]}"; do [ "$(blob_at "$IRRG" "$IRR_BASE" "$p")" = NONE ] && miss="$miss $p"; done
if [ -z "$miss" ]; then row C22 PASS "all ${#AD02_CONSUMERS[@]} AD-02 consumer files exist on base" "$IRR_BASE"; else row C22 FAIL "AD-02 consumer files missing on base:$miss" "$IRR_BASE"; fi
echo "----"
echo "SUMMARY mode=default pass=$pass fail=$fail not_verified=$nv"
[ "$fail" -eq 0 ]
