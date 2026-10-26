# Evidence — `IIPS-V3-CAP03-P1-PREFLIGHT-CAPTURE-ACCEPTANCE-ASSESSMENT-2026-10-27-01`

Companion bundle for tracker **§16.148** (`CV-CORR-128`, `CHG-2026-10-27-03`, `V982`–`V991`) and
`docs/integration/IIPS_v3.0_CAP03_P1_PREFLIGHT_CAPTURE_ACCEPTANCE_ASSESSMENT_2026-10-27.md`.

**Character of this bundle:** assessment of already-published evidence only. **No host contact. No
recapture. No re-verification of the completed publication chain. Zero IPD writes.** Every byte assessed
here is reproducible from `evidence/integration-/cap03-p1-reconcile-20261026T201328Z/` at IRR `main`
`ff29734b877f018b207385e0e375a8d0bbf5b3e0` / tree `e96fa8ac60f97e8111a9c46d456473464fb047a3`.

| File | Purpose |
|---|---|
| `00-capture-inventory.json` | The 11 assessed files with byte sizes and SHA-256 recomputed from the published tree; four-file (§16.147) subset marked; generating-script identity; key pin coordinates |
| `01-acceptance-mapping.json` | Per-requirement criterion source, evidence files, observed facts, status (`SATISFIED` / `SATISFIED_AT_CAPTURE` / `NOT_SATISFIED` / `INSUFFICIENT` / `NOT_APPLICABLE`), blockers `T-1`–`T-4`, resulting `P-1-C`/`P-1-D` status and the single next action |
| `verify_assessment.py` | Recomputes the inventory and re-derives the mechanical findings (baseline-pin capture vs §16.143 designation, flags, store absence, NTFS, PF-15 blob, verdict) from transcript contents; checks documentation integrity |
| `SHA256SUMS.txt` | Digests for this bundle |

## Outcome supported by this bundle

| Item | State |
|---|---|
| Preflight acceptance (run `cap03-p1-reconcile-20261026T201328Z`) | **NOT ACCEPTED** |
| `PF-07` | **NOT SATISFIED** — clean checkout at superseded baseline `8eec74ae…`/`4eba2902…`, not the §16.143 basis `001c3c80…`/`399fa44a…` |
| `P-1-C` / `P-1-D` | `NOT ESTABLISHED` / `DESIGNATED; NOT VERIFIED` for the attempt |
| `P-1` | `UNSPENT`, not authorized to execute |
| Preserved verdict | `PREFLIGHT CAPTURED — NOT AUTHORIZATION TO EXECUTE P-1` |

## Reproduction

```bash
cd evidence/integration/cap03-p1-preflight-capture-assessment-2026-10-27
python3 verify_assessment.py        # expects: ASSESSMENT VERIFIED, exit 0
shasum -a 256 -c SHA256SUMS.txt     # bundle integrity
```
