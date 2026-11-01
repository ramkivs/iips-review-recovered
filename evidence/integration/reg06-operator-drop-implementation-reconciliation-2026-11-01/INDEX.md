# REG-06 Operator Drop implementation reconciliation evidence — 2026-11-01

Record: `IIPS-V3-REG06-OPERATOR-DROP-IMPLEMENTATION-IRR-RECONCILIATION-2026-11-01-01`
Tracker: §16.242 / `CV-CORR-222` / `CHG-2026-11-01-21` / `V1936`–`V1949`
Outcome: **IPD product admission/implementation COMPLETED; IRR RECONCILED.** Production/AD-17/M-2 not authorized; O-05 OPEN; P-1 gates unchanged.

| Artifact | Purpose |
|---|---|
| `raw/ipd-pr117.json`, `raw/ipd-merge-commit.json`, `raw/ipd-main-ref.json` | Remote PR/merge/main identity |
| `raw/ipd-remote-artifacts.json`, `raw/ipd-reg06-admission-section.md` | 23 changed/protected artifact byte checks and merged admission record |
| `raw/ipd-*-ci*.json`, `raw/ipd-main-check-runs.json` | Exact-head/post-merge CI and executed count |
| `raw/technical-verification.json` | Source/package/export/protected-path/boundary summary |
| `raw/ipd-exact-checkout-*.log.txt`, `raw/ipd-reg06-focused-compiled-tests.log.txt` | Full 987/986/0/1, focused 46/46, build/typecheck/package-consumer |
| `raw/ipd-pack*.json`, `raw/ipd-tarball-smoke.*` | 151-entry tarball and independent installed-package runtime smoke |
| `raw/ipd-contract-test-diff.patch` | Exact-contract assertions updated, not weakened |
| `raw/irr-pre-correction-state.json`, `raw/pre-correction-*.csv`, `raw/amendment-changed-cells.json` | Historical preservation and only row 29/P-08 amended |
| `verify_reconciliation.py`, `00-reconciliation-checks.json` | Reproducible local consistency checks |
| `publication-readback.json` | Post-merge IRR PR/main/CI/blob receipt, populated only after actual publication |
| `SHA256SUMS.txt` | Bundle integrity manifest |

The IPD checkout was used read-only for verification; no IPD tracked file or remote ref was modified. The living matrix/register is `../capability-matrix-51x17-reassessment-2026-10-31/`; its verifier checks workbook/CSV consistency. The earlier P-08 bundle `../p08-reg06-irr-reconciliation-2026-11-01/` remains historical.

## Verify locally

```bash
python evidence/integration/reg06-operator-drop-implementation-reconciliation-2026-11-01/verify_reconciliation.py
python evidence/integration/capability-matrix-51x17-reassessment-2026-10-31/verify_reassessment.py  # openpyxl==3.1.5
python docs/integration/cap03-p1-f9/validate_windows10_host_profile.py
git diff --check origin/main...HEAD
```

No production admission/deployment, AD-17/M-2 authorization, IRR acceptance, route/runtime registration, package-pin change, host execution or IPD write is conferred.
