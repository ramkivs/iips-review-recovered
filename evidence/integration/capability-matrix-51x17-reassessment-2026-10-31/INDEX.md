# Evidence bundle — 51×17 capability-matrix reassessment (2026-10-31)

Record: `IIPS-V3-CAPMATRIX-51X17-REASSESSMENT-2026-10-31-01`
Report: `docs/integration/IIPS_v3.0_CAPABILITY_MATRIX_51X17_REASSESSMENT_2026-10-31.md`
Tracker overlay: §16.231 (`CV-CORR-211`, `CHG-2026-10-31-10`, `V1818`–`V1829`)

## Main deliverables

| File | Purpose |
|---|---|
| `IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.xlsx` | Updated workbook: Sheet 1 updated 51×17 matrix; Sheet 2 outstanding/pending register; supporting reconciliation/evidence/census/validation sheets |
| `IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.csv` | Updated matrix CSV, 51 rows × 17 columns |
| `IIPS_V3_OUTSTANDING_PENDING_2026-10-31.csv` | 40-item pending register (post consolidated resolution; P-11/P-18/P-19/P-20 closed) CSV, 16 columns |
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
