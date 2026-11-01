# P-08 / REG-06 IRR reconciliation evidence — 2026-11-01

Record: `IIPS-V3-P08-REG06-IRR-RECONCILIATION-2026-11-01-01`
Tracker: §16.238 / `CV-CORR-218` / `CHG-2026-11-01-17` / `V1888`–`V1899`
Outcome: **RESOLVED — CONTINUED DEFERRAL (REG-06)** — not product admission.

| Artifact | Purpose |
|---|---|
| `raw/ipd-pr115.json`, `raw/ipd-merge-commit.json`, `raw/ipd-main-ref.json` | Remote PR/merge/main identity |
| `raw/ipd-remote-artifacts.json`, `raw/ipd-p08-deferral-section.md` | Tracker blob/raw-byte verification and merged deferral section |
| `raw/ipd-*-ci.json`, `raw/ipd-main-check-runs.json` | Exact-head/merge CI and executed count |
| `raw/technical-verification.json`, package/build/pack logs | E018/E026 export, emitted-build, caller and identifier verification |
| `raw/pre-correction-state.json` | Original tracker/PA blobs and exact prior matrix/register rows |
| `raw/irr-*-search.txt`, `raw/ipd-manual-ingestion-search.txt` | Requirement/consumer census; negative findings are not approvals |
| `verify_reconciliation.py`, `00-reconciliation-checks.json` | Reproducible local consistency checks and receipt |
| `publication-readback.json` | Post-merge IRR PR/main/CI/blob receipt, populated only after actual publication |
| `SHA256SUMS.txt` | Bundle integrity manifest |

The IPD source/build inspection used a clean exported snapshot outside the IPD checkout. No IPD tracked file or remote ref was modified. The living matrix/register is in `../capability-matrix-51x17-reassessment-2026-10-31/`; its own verifier checks workbook/CSV consistency.

## Verify locally

```bash
python evidence/integration/p08-reg06-irr-reconciliation-2026-11-01/verify_reconciliation.py
python evidence/integration/capability-matrix-51x17-reassessment-2026-10-31/verify_reassessment.py  # requires openpyxl==3.1.5
python docs/integration/cap03-p1-f9/validate_windows10_host_profile.py
git diff --check origin/main...HEAD
```

No production authorization, product admission, export/runtime exposure, host execution or IPD write is conferred.
