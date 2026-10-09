#!/bin/bash
# Validation pass 4: claims checked ad hoc in session, captured here for reproducibility. Read-only.
IRR=/tmp/inv/irr.git; IPD=/tmp/inv/ipd.git; P=/home/user/lineage-investigation-2026-10-08
echo "== P4-0a ref counts (report 0: IRR 122 = 70 heads/50 pull/2 tags; IPD 42 = 32/6/4; commits 427/618) =="
for n in irr ipd; do echo "$n: heads=$(git -C /tmp/inv/$n.git for-each-ref refs/heads | wc -l) pull=$(git -C /tmp/inv/$n.git for-each-ref refs/pull | wc -l) tags=$(git -C /tmp/inv/$n.git for-each-ref refs/tags | wc -l) commits=$(git -C /tmp/inv/$n.git rev-list --all | wc -l)"; done
echo "== P4-0b heads compared with investigation snapshot (out/*_refs.tsv): differing lines (report: no ref moved) =="
awk -F'\t' 'NR>1 && $1 ~ /refs\/heads/ {print $1"\t"$2}' /tmp/inv/out/irr_refs.tsv | sort > /tmp/inv/_s_irr; git -C $IRR for-each-ref --format='%(refname)%09%(objectname)' refs/heads | sort > /tmp/inv/_n_irr; echo "IRR: $(comm -3 /tmp/inv/_s_irr /tmp/inv/_n_irr | wc -l)"
awk -F'\t' 'NR>1 && $1 ~ /refs\/heads/ {print $1"\t"$2}' /tmp/inv/out/ipd_refs.tsv | sort > /tmp/inv/_s_ipd; git -C $IPD for-each-ref --format='%(refname)%09%(objectname)' refs/heads | sort > /tmp/inv/_n_ipd; echo "IPD: $(comm -3 /tmp/inv/_s_ipd /tmp/inv/_n_ipd | wc -l)"
echo "== P4-0c PR base refs (report: IPD 4 to main, 2 to arena/01a0e6d9) =="
python3 -c "import json,collections;d=json.load(open('$P/raw/ipd_prs.json'));print(collections.Counter(x.get('baseRefName') for x in d))"
echo "== P4-0d branch pins: IPD arena/01a0f308 and arena/01a0e6d9 =="
echo "01a0e6d9=$(git -C $IPD rev-parse refs/heads/arena/01a0e6d9-iips-production-market-data) 01a0f308=$(git -C $IPD rev-parse refs/heads/arena/01a0f308-iips-production-market-data)"
echo "== P4-16 P3 AG-5 lines (report: L44 and L106) =="
git -C $IRR show refs/heads/main:evidence/integration/convergence/2026-10-07/P3-persistence-durability.md | grep -n 'AG-5 company-level' | cut -c1-120

IRR=/tmp/inv/irr.git; IPD=/tmp/inv/ipd.git
echo "== P4-1 C21 phase13-next App.tsx routes L75-77 (Opportunities/Risks/Rankings) =="
git -C $IRR show refs/heads/phase13-next:frontend/src/app/App.tsx | grep -n 'intelligence' | cut -c1-170
echo "== P4-2 C28 IPD main inventory row 7 (PRUNED) =="
git -C $IPD show refs/heads/main:evidence/target-shell-integration/IIPS-HISTORICAL-CURRENT-CONVERGENCE-INVENTORY.md | grep -n -E '^\| 7 \|' | cut -c1-120
echo "== P4-3 C30 IPD 01a0d1d3 inventory line 36 quote =="
git -C $IPD show refs/heads/arena/01a0d1d3-iips-production-market-data:docs/IIPS_REMAINING_PRODUCT_SURFACE_INVENTORY.md | grep -n -i 'no implementation in any lineage' | cut -c1-120
echo "== P4-4 C34 ConsumerEngine files on IRR main =="
git -C $IRR ls-tree -r --name-only refs/heads/main -- iips-platform/src/sector-engines/consumer | wc -l
echo "== P4-5 C39/C40 G24 header on 01a0e6d9 (lines 3,14,16) =="
git -C $IPD show refs/heads/arena/01a0e6d9-iips-production-market-data:src/app_identity/service.ts | sed -n '3p;14p;16p' | cut -c1-160
echo "== P4-6 C41 translationBoundary.ts IRR never supplies/selects applicationUserId (lines 20,45,46) =="
git -C $IRR show refs/heads/main:frontend/server/user-portfolio/translationBoundary.ts | sed -n '20p;45p;46p' | cut -c1-160
echo "== P4-7 C42 P5 row 12 quote =="
git -C $IRR show refs/heads/main:evidence/integration/convergence/2026-10-07/P5-capability-sweep.md | grep -c 'governed `(issuer,subject)→applicationUserId`'
echo "== P4-8 C47 notes/notifications on phase13-next; PF-2 on gai-impl-canonical; absent on main =="
for p in frontend/src/features/notes/NotesDrawer.tsx frontend/src/features/notifications/NotificationDrawer.tsx; do git -C $IRR cat-file -e refs/heads/phase13-next:$p && echo "phase13-next has $p"; done
for p in frontend/server/directory/roster-directory.ts frontend/server/directory/idp-sync.ts; do git -C $IRR cat-file -e refs/heads/gai-impl-canonical:$p && echo "gai-impl-canonical has $p"; done
for p in frontend/server/notes/notes-service.ts frontend/server/directory/roster-directory.ts; do git -C $IRR cat-file -e refs/heads/main:$p 2>/dev/null && echo "UNEXPECTED main has $p" || echo "main lacks $p"; done
echo "== P4-9 C48 E2E-018 screenshot files on phase13-next =="
git -C $IRR ls-tree -r --name-only refs/heads/phase13-next | grep -c 'e2e-018-screenshots/.*\.png'
echo "== P4-10 C49 NP-06 final qualification + governance decisions: branch vs main =="
for b in refs/heads/arena/01a0f1b3-iips-review-recovered refs/heads/main; do for p in docs/v3.0/g3-build/PROGRAM_v3.0_NP06_REPORTS_FINAL_QUALIFICATION.md docs/integration/IIPS_v3.0_NP06_REPORTS_GOVERNANCE_DECISIONS.md; do git -C $IRR cat-file -e $b:$p 2>/dev/null && echo "$b has $p" || echo "$b lacks $p"; done; done
echo "== P4-11 C50 G3 tenant-membership docs: count on 01a0f1b3 vs main =="
echo "01a0f1b3: $(git -C $IRR ls-tree -r --name-only refs/heads/arena/01a0f1b3-iips-review-recovered | grep -c 'PROGRAM_v3.0_G3_TENANT_MEMBERSHIP\|G3B_TENANTDIRECTORY\|G3_PRODUCT_TENANT_REGISTRY')  main: $(git -C $IRR ls-tree -r --name-only refs/heads/main | grep -c 'PROGRAM_v3.0_G3_TENANT_MEMBERSHIP\|G3B_TENANTDIRECTORY\|G3_PRODUCT_TENANT_REGISTRY')"
echo "== P4-12 C51 D-3 Governed Reports ACCEPTED record on main =="
git -C $IRR show refs/heads/main:docs/integration/GOVERNED-REPORTS-ACCEPTANCE-DECISION.md | grep -n 'D-3' | head -2 | cut -c1-160
echo "== P4-13 C52 IPD main inventory rows 38-40 =="
git -C $IPD show refs/heads/main:evidence/target-shell-integration/IIPS-HISTORICAL-CURRENT-CONVERGENCE-INVENTORY.md | grep -n -E '^\| (38|39|40) \|' | cut -c1-200
echo "== P4-14 C46 tracked WorkflowView on any IRR head =="
n=0; for b in $(git -C $IRR for-each-ref --format='%(refname)' refs/heads); do c=$(git -C $IRR ls-tree -r --name-only $b | grep -c 'features/workflow/WorkflowView'); n=$((n+c)); done; echo "tracked WorkflowView entries across all IRR heads: $n"
echo "== P4-15 C53 session branch and IRR main on remote (ls-remote, at run time) =="
git -C /home/user/iips-review-recovered ls-remote origin refs/heads/main refs/heads/arena/1dcbe88d-iips-review-recovered
