#!/usr/bin/env bash
# Rebuild one work item of PR #508 as a standalone commit series on top of origin/main, in a scratch clone.
#
# This is the script that was executed for the reconciliation record. It creates **no branch**: it works on a detached
# HEAD inside /tmp/splitclone, so the session's branch authority is never touched, and nothing is pushed.
#
#   usage: rebuild.sh <wi9|l035|l037> <scratch-clone> <workspace-repo>
#
# The only manual step is the conflict every stacked work item produces: both shared registers are append-only, so each
# item's patch carries the previous item's tail as context. `resolve_docs.py` keeps the base version, re-applies the
# item's non-append hunks, and appends the item's own section at the new end of file.
set -u
ITEM=$1; CLONE=$2; REPO=$3
TR=IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md
RE=docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md
cd "$CLONE" || exit 1
git cherry-pick --abort >/dev/null 2>&1
git checkout -q --detach origin/main
git reset -q --hard origin/main && git clean -qfd
case $ITEM in
  wi9)  COMMITS="e145ecd 0ddf5c7";                            TESTS="tests/investment/wi9AssociatesResolution.test.ts tests/investment/cli.test.ts" ;;
  l035) COMMITS="451d790 fdbbae6";                            TESTS="tests/investment/nil-binding.test.ts tests/investment/cli.test.ts" ;;
  l037) COMMITS="42be412 9ed8dcf d673d34 32a9473 402c080 2514e69"; TESTS="tests/investment/retrieval-evidence.test.ts" ;;
  *) echo "unknown item $ITEM"; exit 2 ;;
esac
for c in $COMMITS; do
  git cherry-pick -x "$c" >/dev/null 2>&1 && { echo "  cherry-pick $c: clean"; continue; }
  echo "  cherry-pick $c: conflicts -> $(git diff --name-only --diff-filter=U | tr '\n' ' ')"
  python3 "$REPO/evidence/reconciliation/PR-RECONCILIATION-2026-11-07/split/resolve_docs.py" "$c" "$TR" "$RE" || exit 3
  git add -A && git -c core.editor=true cherry-pick --continue >/dev/null 2>&1 || exit 4
  echo "  cherry-pick $c: resolved (base documents kept, item sections re-appended)"
done
echo "  series:"; git log --format='    %h %T %s' "origin/main..HEAD" | cut -c1-110
cd iips-platform || exit 5
NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/e2b-ca.crt npm ci --silent >/dev/null 2>&1
echo "  tests: $TESTS"
npx tsx --test $TESTS 2>&1 | grep -E "^# (tests|pass|fail)" | sed 's/^/    /'
npx tsc --noEmit; echo "  tsc --noEmit exit=$?"
