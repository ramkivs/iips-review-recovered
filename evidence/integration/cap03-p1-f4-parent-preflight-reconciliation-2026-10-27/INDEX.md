# Evidence — `IIPS-V3-CAP03-P1-F4-PARENT-PREFLIGHT-RECONCILIATION-2026-10-27-01`

Companion bundle for tracker **§16.146** (`CV-CORR-127`, `CHG-2026-10-27-01`, `V971`–`V980`) and
`docs/integration/IIPS_v3.0_CAP03_P1_F4_PARENT_PREFLIGHT_RECONCILIATION_2026-10-27.md`.

**Character of this bundle:** preparation and citation only. **No host contact. No execution. Zero IPD writes.
Zero artifacts on the F4 store path.** Every file here is reproducible from the two public repositories.

| File | Purpose |
|---|---|
| `00-cited-records-and-blobs.json` | Immutable citation set: locus, commit, path, blob, byte size, SHA-256, and the verbatim cited lines (PF-11, PF-12, PF-13, packet provenance, successor step 1/2, `mkdirSync`, `STORE_NOT_FOUND`, CLI parser, runbook invocation, F4 designation and §4 deferral) |
| `01-pf11-pf12-pf13-reconciliation.json` | The deadlock, its decomposition, and dispositions `DISP-01`/`DISP-02`/`DISP-03` + `OBS-01`, with the explicit non-change list |
| `02-p1c-p1d-readonly-preflight.ps1` | **Operator instrument.** Read-only with respect to the store: creates no store file, no `-wal`/`-shm`/`-journal`, no directory on `$StorePath` or any ancestor; writes only under `$EvidenceRoot`; never invokes `--mode=execute`. **Not executed by Arena.** |
| `03-reuse-determination.json` | Per-PF reuse classification against the §16.140.4 `P-1-C` rule (not overturned), what this pass completed, what remains, and the post-record status |
| `verify_reconciliation.py` | Recomputes every repository-checkable assertion (F4 bytes, citations, dispositions, instrument safety, non-movement, tracker state, `git diff --check`) |
| `SHA256SUMS.txt` | Digests for this bundle |

## F4 (unchanged, verbatim)

```
C:\iips-data\iips\user-portfolio.sqlite
```

39 bytes · 3 × `U+005C` · hex `433a5c696970732d646174615c696970735c757365722d706f7274666f6c696f2e73716c697465`

Byte-identical to the effective act `IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-PA-ACT-2026-10-26-02`
span (blob `3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d`). Not normalized, not substituted, not re-selected.

## Reproduction

```bash
cd evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27
python3 verify_reconciliation.py      # expects: RECONCILIATION VERIFIED, exit 0
shasum -a 256 -c SHA256SUMS.txt       # bundle integrity
```

## Status this bundle supports

| Item | State |
|---|---|
| `P-1-A` formal S2 acceptance | `SATISFIED` (§16.144) |
| `P-1-B` execution basis | `SATISFIED` candidate-scoped (§16.143) |
| `P-1-C` host preflight | **`NOT ESTABLISHED`** — instrument prepared; no P-1-session transcript exists |
| `P-1-D` F4 store-path facts | **`DESIGNATED; NOT VERIFIED`** — structural blocker removed by `DISP-01`; host capture outstanding |
| `P-1` | **`UNSPENT`**, not authorized to execute |
| `S3` / `QE` / `DQ-4` / Gate 4 / Gate 5 | `NOT REACHED` / `0/11` / `8/10` / `AUTHORIZED — NOT STARTED` / `NOT INITIATED` |

**Next action:** Ramki runs `02-p1c-p1d-readonly-preflight.ps1` on `desktop-no0nhtp` immediately before the
intended attempt and supplies the transcripts for independent read-back. Any STOP aborts the attempt. Do not
pre-create `C:\iips-data\iips`.
