# Evidence bundle — 51 × 17 capability matrix reconstruction (`2026-10-27`)

Record: `IIPS-V3-CAPMATRIX-51X17-RECONSTRUCTION-2026-10-27-01`
Report: [`docs/integration/IIPS_v3.0_CAPABILITY_MATRIX_51X17_RECONSTRUCTION_2026-10-27.md`](../../../docs/integration/IIPS_v3.0_CAPABILITY_MATRIX_51X17_RECONSTRUCTION_2026-10-27.md)
Tracker overlay: §16.150 (`CV-CORR-130`, `CHG-2026-10-27-06`, `V1003`–`V1014`)
Scope: documentation and reconciliation only — no acceptance, qualification, admission or release decision;
no fence moved; nothing provisioned; `P-1` remains **UNSPENT**.

## Contents

| File | What it is |
|---|---|
| `matrix_data.py` | **Single source of truth** — 17 headers + 51 rows. Every cell is this pass's own finding; the vocabulary is documented in the module docstring |
| `disposition.py` | The one-bucket-per-row disposition map (assigned explicitly, never inferred) + dimension counts |
| `build_matrix.py` | Generates the CSV, the XLSX (deterministic: fixed member timestamps and pinned `modified`), `section-H-matrix.md`, and `00-artefact-checks.json`; fails closed on any arity/numbering/emptiness/`NA`-rationale defect |
| `sectionE.py` → `section-E-counts.md` | Section E of the report, computed from the same source |
| `report-body.md`, `section-FG.md` | Hand-authored sections A–D and F–G |
| `build_report.py` | Assembles the published report from the four parts and runs 12 internal checks |
| `IIPS_V3_CAPABILITY_MATRIX_51x17_2026-10-27.csv` | The matrix, `QUOTE_ALL`, 51 data rows × 17 columns |
| `IIPS_V3_CAPABILITY_MATRIX_51x17_2026-10-27.xlsx` | The same matrix with a `Provenance` sheet; frozen panes; wrapped cells |
| `00-artefact-checks.json` | Machine receipt for the matrix (rows, numbering, header order, arity, empty cells, `NA` rationales, CSV round-trip) |
| `01-execution-log.md` | Every command executed in this pass with its exact result |
| `02-probe-matrix.md` | The 30-request live HTTP probe of the composed transport, with the reading rules for `404`/`503`/`502` |
| `verify_publication.py` | Verifier — `--local` re-derives and re-hashes; `--remote` reads every blob back from GitHub and compares |
| `make_sums.py` → `SHA256SUMS.txt` | Hash manifest (bundle + report + tracker) |
| `03-publication-readback.json` | Remote read-back receipt — 20/20 PASS at merged `d49d4f33…` (PR #322), every artefact byte-identical to the manifest published in that commit (the PR #321 read-back at `52f295a2…` is recorded in `04-`) |
| `04-readback-remediation.md` | Why the first read-back reported 17/18 and how it was corrected: the Contents API omits `content` for blobs over 1 MB; the verifier now uses the Git blobs API and compares against the manifest published in the same commit |

## Reproduce

```bash
cd evidence/integration/capability-matrix-51x17-2026-10-27
python3 build_report.py            # regenerates CSV/XLSX/§E/§H and the report, then self-checks
python3 make_sums.py               # rewrites SHA256SUMS.txt
python3 verify_publication.py --local
python3 verify_publication.py --remote --commit d49d4f3384b76addf48c71de5cccdeb6f9e340a2
```

The build is deterministic: two consecutive runs produce byte-identical CSV, XLSX and report, which is what
`verify_publication.py --local` asserts before publication and after it.

## Non-claims

This bundle evidences an *investigation*. It does not create authority, does not accept or qualify any
capability, does not admit the G24 lineage, does not lift the Reports or owner-context fences, and does not
touch `P-1`. Disposition buckets and `V` cells describe what was executed or read in this pass and nothing
more.
