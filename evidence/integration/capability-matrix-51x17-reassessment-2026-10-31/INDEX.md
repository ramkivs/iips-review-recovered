# Evidence bundle — 51×17 capability-matrix reassessment (2026-10-31)

Record: `IIPS-V3-CAPMATRIX-51X17-REASSESSMENT-2026-10-31-01`
Report: `docs/integration/IIPS_v3.0_CAPABILITY_MATRIX_51X17_REASSESSMENT_2026-10-31.md`
Tracker overlays: original §16.231 (`CV-CORR-211`); historical P-08 amendment §16.238 (`CV-CORR-218`); current REG-06 implementation amendment §16.242 (`CV-CORR-222`, `CHG-2026-11-01-21`, `V1936`–`V1949`)

## Main deliverables

| File | Purpose |
|---|---|
| `IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.xlsx` | Updated workbook: Sheet 1 updated 51×17 matrix; Sheet 2 outstanding/pending register; supporting reconciliation/evidence/census/validation sheets |
| `IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.csv` | Updated matrix CSV, 51 rows × 17 columns |
| `IIPS_V3_OUTSTANDING_PENDING_2026-10-31.csv` | 40-entry register CSV, 16 columns: outstanding/conditional items plus P-08 explicitly classified as completed/reconciled (IPD REG-06 admission/implementation completed; IRR reconciled). Not a count of active implementation tasks. |
| `RECONCILIATION_REPORT.md` | Concise reconciliation summary |
| `00-reassessment-checks.json` | Machine receipt: shape, counts, hashes |
| `changed-cells.json` | Cell-level baseline→current diff |
| `raw/` | Executed validation logs, live probes, full branch/PR census JSON |

## Reproduce / verify

```bash
python -m pip install openpyxl==3.1.5
python build_reassessment.py
python verify_reassessment.py
```

## Boundaries

Documentation/evidence reassessment only. No PA decision, acceptance, qualification, admission, release, provisioning, host execution, `durable:true`, `503` lift or IPD write is created. Operator-reported host events are labeled. Production remains outside scope.

## Historical P-08 amendment (2026-11-01)

IPD PR #115 merge `e9c2eef6c82ba51814a72ce962cf227e9fd89d56`; outcome **RESOLVED — CONTINUED DEFERRAL (REG-06)** at that baseline. Evidence: `../p08-reg06-irr-reconciliation-2026-11-01/`. Preserved as history.

## Current REG-06 implementation amendment (2026-11-01)

IPD PR #117 merge `eb9289222e2bdfd0e79381d4d81f7f81715e019b`; tracker blob `c1c666149c2d907026df3d9a2d184d2b9a2383c0`. **IPD product admission/implementation COMPLETED; IRR RECONCILED.** Durable PIT, series-qualified ingestion, product runtime and emitted `./operator-drop` export verified. Row 29 and P-08 updated; unrelated rows/entries preserved. Production/AD-17/M-2 not authorized; O-05 OPEN; P-1 gates unchanged. Evidence: `../reg06-operator-drop-implementation-reconciliation-2026-11-01/`. IPD read-only.
