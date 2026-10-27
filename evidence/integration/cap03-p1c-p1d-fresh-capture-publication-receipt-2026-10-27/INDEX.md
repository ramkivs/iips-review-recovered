# CAP-03 Fresh-Capture Procedure — Publication Read-Back Receipt

**Receipt ID:** `IIPS-V3-CAP03-P1C-P1D-FRESH-CAPTURE-PUBLICATION-READBACK-2026-10-27-01`

**Procedure:** `docs/integration/IIPS_v3.0_CAP03_P1C_P1D_FRESH_CAPTURE_PROCEDURE_2026-10-27.md`

**Remote authority at read-back:** `ramkivs/iips-review-recovered`, `refs/heads/main`, commit `56098372f74a41f5f8e8dde851c9ee419a1875ee`, tree `0a32f9383621188aa22fabd900650ce8e40eb8c5` (2026-10-27T09:32:21Z).

**Procedure SHA-256:** `db6ba4633e11987ce57ff0264e61dca391620bb487b45d663d7274d8ad55e544` (44,262 bytes; Git blob `f585cd3a8a3ff8f68422336b66956b085a646392`). All eight publication/tracker/bundle paths plus the unchanged instrument were independently fetched from the merge tree; all nine remote blobs matched the local bytes at read-back. The instrument remains blob `eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb`, 10,231 bytes, SHA-256 `85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b`.

## Documented operator command and output location

The procedure’s exact invocation is:

```powershell
& $ExecutingScript
```

with `$ExecutingScript = Join-Path $EvidenceRoot '02-executed-instrument.ps1'`. The designated output root is `D:\iips-evidence\<RunId>\`; `<RunId>` is generated on the host as `cap03-p1-<UTC timestamp>-<GUID>` and is never reused. This is a documented next action only: **no host command was run, no RunId was generated, and no host output directory exists from this work.**

## Publication / CI

IRR PR #329 merged by regular merge at `2026-10-27T09:31:35Z` as `56098372f74a41f5f8e8dde851c9ee419a1875ee`. Exact-head CI run `40481209745` and post-merge `main` push CI run `40481448142` both succeeded. The primary evidence bundle’s `SHA256SUMS.txt` and `verify_procedure.py` passed before publication; the decoded remote bundle files re-hash to their recorded SHA-256 values.

## Current boundary and blockers

This is publication/remote-readback evidence, **not** host capture, preflight acceptance, or execution authority. The reported old launcher and raw STOP outputs remain unavailable and unverified. PowerShell grammar parsing and GitHub CI passed, but a Windows PowerShell 5.1 engine/runtime validation was not available here. The operator must follow the published procedure exactly, preserve prior checkouts/failure outputs, and return the complete raw output set for independent review. P-1 remains **NOT EXECUTED / UNSPENT / NOT AUTHORIZED**; no IPD write, store/sidecar action, provisioning, or production operation occurred.

## Files

- `00-publication-readback.json` — merge commit/tree, PR, exact-head and post-merge CI, and nine decoded remote blob identities/digests/sizes.
- `verify_publication.py` — read-only GitHub API verifier for the receipt, remote bundle checksum, publication artifacts, instrument identity, PR/CI, and main-branch ancestry.
- `SHA256SUMS.txt` — receipt-bundle checksums excluding this file.
