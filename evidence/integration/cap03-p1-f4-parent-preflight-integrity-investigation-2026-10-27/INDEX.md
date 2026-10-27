# Evidence — `IIPS-V3-CAP03-P1-F4-PARENT-PREFLIGHT-INTEGRITY-INVESTIGATION-2026-10-27-01`

Companion bundle for tracker **§16.149** (`CV-CORR-129`, `CHG-2026-10-27-05`, `V993`–`V1002`) and
`docs/integration/IIPS_v3.0_CAP03_P1_F4_PARENT_PREFLIGHT_INTEGRITY_INVESTIGATION_2026-10-27.md`.

**Character of this bundle:** integrity investigation and remediation only. **No host contact. No P-1 execution. Zero IPD writes. Zero artifacts on the F4 store path.** Every file here is reproducible from the two referenced commits via `git cat-file -p`, `gh api`, and `sha256sum`.

| File | Purpose |
|---|---|
| `00-investigation-inputs.json` | Verified Windows-host observations (commits, trees, blobs, manifest hash, Windows `Get-FileHash`, receipt `all_match`) |
| `01-blob-byte-analysis.json` | Exact byte counts, SHA-256 for LF canonical (`85AC…`, `10,231 B`) vs CRLF Windows (`7C6D…`, `10,425 B`), GitHub API corroboration, reproducible commands |
| `02-gitattributes-defect.json` | Before/after `.gitattributes` (blob `ca1ec60…` → corrected), `git ls-files --eol` before/after, root-cause explanation |
| `03-publication-procedure-analysis.json` | Why PR #315 generation + read-back produced `all_match=true` yet missed the Windows CRLF mismatch; PowerShell extraction failure |
| `04-safety-checks.txt` | Non-execution safety transcript: `verify_reconciliation.py` 39/39 PASS, manual instrument inspection, `git diff --check`, store-artifact census |
| `verify_investigation.py` | Recomputes every assertion checkable from repository content (blob hashes, gitattributes entry, manifest, safety) |
| `SHA256SUMS.txt` | Digests for this bundle |

## The discrepancy, stated exactly

- Git blob `eaea3f7f…` = `10,231 B`, LF-only, SHA-256 `85AC7271…` — matches manifest.
- Windows checkout with `core.autocrlf=true` and no `eol=lf` → `10,425 B`, CRLF, SHA-256 `7C6D44B8…`.
- Delta = 194 LF→CRLF conversions (+194 B). The match is deterministic.

## Correction

`.gitattributes` single-line addition:

```
evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1 text eol=lf
```

Preserves the instrument blob; makes Windows checkout LF-identical to the manifest.

## Reproduction

```bash
cd evidence/integration/cap03-p1-f4-parent-preflight-integrity-investigation-2026-10-27
python3 verify_investigation.py   # expects: INVESTIGATION VERIFIED, exit 0
sha256sum -c SHA256SUMS.txt        # bundle integrity
# independent blob checks:
git cat-file -p eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb | sha256sum
# expected: 85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b
python3 -c "import subprocess,hashlib; b=subprocess.check_output(['git','cat-file','-p','eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb']); print(hashlib.sha256(b.replace(b'\n', b'\r\n')).hexdigest().upper())"
# expected: 7C6D44B89723C09A0AA356E6735CACAFAF7BF032BED80D3AE0A99A2ACFE35924
```

## Status this bundle supports

| Item | State |
|---|---|
| `P-1-A` formal S2 acceptance | `SATISFIED` (§16.144) — unchanged |
| `P-1-B` execution basis | `SATISFIED` candidate-scoped `001c3c80…`/`399fa44a…` (§16.143) — unchanged |
| `P-1-C` host preflight | `NOT ESTABLISHED` — instrument now Windows-verifiable; transcript still outstanding |
| `P-1-D` F4 store-path facts | `DESIGNATED; NOT VERIFIED` — structural blocker removed; host capture outstanding |
| `P-1` | `UNSPENT`, **not authorized** — unchanged |
| `S3`/`QE`/`DQ-4`/Gate 4/Gate 5 | `NOT REACHED`/`0/11`/`8/10`/`AUTHORIZED — NOT STARTED`/`NOT INITIATED` — unchanged |

**Next action:** Ramki fetches the IRR `main` merge that carries this correction, confirms `Get-FileHash` yields `85AC7271…` (`10,231 B` LF), then runs the published instrument in the intended P-1 session. Any STOP aborts; do not pre-create `C:\iips-data\iips`.

