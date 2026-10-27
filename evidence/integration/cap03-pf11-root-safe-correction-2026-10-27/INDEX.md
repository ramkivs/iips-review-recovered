# Evidence bundle — CAP-03 PF-11 root-safe correction

Record: `IIPS-V3-CAP03-PF11-ROOT-SAFE-CORRECTION-2026-10-27-01`
Scope: IRR only; no IPD writes, no production scope, no host capture, no execution.

| File | Purpose |
|---|---|
| `00-authoritative-baseline.json` | Pre-change IRR main commit/tree; published procedure/instrument and acceptance-review blob/SHA identities; exact F4 and preserved capture status |
| `01-Find-GitWorktreeAncestor.ps1` | Standalone root-safe PowerShell function, byte-identical to embedded corrected function |
| `02-p1c-p1d-readonly-preflight-pf11-root-safe-v2.ps1` | Versioned corrected read-only PF-11/PF-12/PF-13 instrument; not invoked |
| `03-test_pf11_root_safe.ps1` | Reproducible native Windows PowerShell 5.1 fixture tests (six requested cases plus fixture immutability) |
| `04-test_pf11_root_safe.py` | Reproducible standard-library portable runtime/source checks |
| `05-python-test-results.txt` | Actual Linux sandbox execution transcript: 8/8 tests passed |
| `06-runtime-availability.txt` | Actual runtime availability check; Windows and PowerShell unavailable here |
| `07-minimal-change-record.json` | Source identities and exact inserted/replaced PF-11 blocks; test reconstructs the corrected bytes from these exact edits |
| `08-publication-readback.json` | PR #331 exact-head/merge/CI, IRR main tree, and decoded remote artifact read-back (16/16 matched) |
| `09-procedure-supplement-checks.json` | Procedure/source consistency and scope assertions |
| `10-powershell-static-parse-results.txt` | Exact parser versions and static parse results for helper and Windows test harness |
| `verify_correction.py` | Bundle-integrity and source-identity verifier |
| `SHA256SUMS.txt` | SHA-256 manifest for bundle files (excluding this manifest) |

## Test status

The portable Python suite passed 8 tests, covering the six required path scenarios plus source/F4 integrity and no fixture mutation. The native PowerShell harness is supplied but is **not run** because this Linux sandbox has no Windows PowerShell or `pwsh`. Its successful Windows execution is a mandatory prerequisite before any subsequent capture. This bundle records that limit rather than asserting Windows runtime acceptance.

The existing capture `D:\iips-evidence\cap03-p1-20261027T110433Z-3569c5ceff28428c8293c442c9436649` was preserved; it was not accessed or modified. No capture instrument was invoked and no capture directory was created.
