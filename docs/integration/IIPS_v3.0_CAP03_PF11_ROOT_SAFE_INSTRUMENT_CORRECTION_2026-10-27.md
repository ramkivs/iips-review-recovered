# CAP-03 — PF-11 root-safe ancestor-walk correction and procedure supplement (`2026-10-27`)

> **STATUS: IRR-SIDE SOURCE CORRECTION + PROCEDURE/EVIDENCE PUBLICATION ONLY.** The historical instrument and the existing capture are preserved. This correction does not invoke the instrument, create a capture directory, access or change F4, provision anything, perform host observations, accept the existing attempt, authorize P-1, or change any gate. **P-1 remains NOT EXECUTED / UNSPENT / NOT AUTHORIZED.** The new procedure is not yet eligible for a subsequent capture until its stated native-Windows prerequisites pass.

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP03-PF11-ROOT-SAFE-CORRECTION-2026-10-27-01` |
| Record type | Versioned instrument correction and procedure supplement; not a PA act, host receipt, capture acceptance, or execution authorization |
| Repository | `ramkivs/iips-review-recovered` only; IPD is read-only and production is out of scope |
| Baseline IRR `main` | Commit `cf6e0af50c984b8fc04ba76a70ec3a3e401fb200`, tree `0a0918f0e1f816c970a44860763d32c32fc44f2b` (GitHub Branches API and local objects agreed before edits) |
| Published procedure | `IIPS-V3-CAP03-P1C-P1D-FRESH-CAPTURE-PROCEDURE-2026-10-27-01`; tracker §16.153 / `CV-CORR-133`; source `docs/integration/IIPS_v3.0_CAP03_P1C_P1D_FRESH_CAPTURE_PROCEDURE_2026-10-27.md`, baseline blob `f585cd3a8a3ff8f68422336b66956b085a646392`, SHA-256 `db6ba4633e11987ce57ff0264e61dca391620bb487b45d663d7274d8ad55e544` |
| Governing acceptance review | `IIPS-V3-CAP03-P1C-P1D-EVIDENCE-HANDOFF-ACCEPTANCE-REVIEW-2026-10-27-01`; tracker §16.152 / `CV-CORR-132`; review blob `e1dd0f86cb2ca358aa76358c4067ea3ab81bd89d`, SHA-256 `9b83d9fda30ade8074c18fa6339b6f49b797337685beb0e66d4272d9acf86f76` |
| Evidence bundle | `evidence/integration/cap03-pf11-root-safe-correction-2026-10-27/` |

## 1. Defect and root cause

The published PF-11/PF-12/PF-13 instrument has a worktree check that begins at `Split-Path -Parent $StorePath`, tests `Join-Path $w '.git'`, and repeatedly advances with `Split-Path -Parent $w`. At a filesystem root the parent operation can return an empty path; the next `Join-Path`/`Split-Path` receives that empty value and raises an error instead of terminating with a worktree result. The original logic can therefore fail before it emits the required `InsideGitWorktree` observation. The relevant prior acceptance record is §16.152 (`CV-CORR-132`), which found the every-worktree limb insufficient and required an explicit per-ancestor `.git` result.

The historical source is not edited or replaced in place. The new exact artifact path is protected by a path-specific `.gitattributes` `text eol=lf` rule so its published bytes remain canonical on Windows. Its baseline identity remains:

- `evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1`
- Git blob `eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb`; 10,231 bytes, LF
- SHA-256 `85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b`

The existing capture named by the operator, `D:\iips-evidence\cap03-p1-20261027T110433Z-3569c5ceff28428c8293c442c9436649`, is preserved and remains **unaccepted**. This IRR-only work did not access, overwrite, modify, or rewrite it. No second capture directory was created.

## 2. Versioned correction and minimal change

**Corrected instrument:** `evidence/integration/cap03-pf11-root-safe-correction-2026-10-27/02-p1c-p1d-readonly-preflight-pf11-root-safe-v2.ps1`.

The correction adds a single root-safe function, `Find-GitWorktreeAncestor`, and replaces only the defective PF-11 loop with a call to that function. The walker:

1. tests `.git` at the supplied ancestor and each lexical parent, including the filesystem root;
2. uses `Test-Path -LiteralPath` on the `.git` entry, recognizing both directory and file forms;
3. advances with `[System.IO.Directory]::GetParent()`, whose `$null` parent at the root ends the walk before another `Join-Path` call; and
4. returns the matching ancestor or `$null`, preserving `InsideGitWorktree=True at <ancestor>` / `InsideGitWorktree=False` output.

It does not normalize, resolve, create, or modify `$StorePath`. The caller still takes the exact same parent with `Split-Path -Parent $StorePath`; F4 remains exactly `C:\iips-data\iips\user-portfolio.sqlite` (39 UTF-8 bytes; SHA-256 of the path string `4c8da37b3a837a6d0c51b2508b85c482108c7686ffa6657dc72cf078882d364b`). PF-12 absence checks and the PF-13 nearest-existing-ancestor / volume / ACL / sync observations are byte-for-byte unchanged. The patch introduces no store, sidecar, or parent creation; no ACL or environment changes; and no provisioning or execution-mode invocation. The exact inserted/replaced source blocks and original/corrected identities are retained as `07-minimal-change-record.json`; the portable source-integrity test reconstructs the corrected bytes from the original plus those exact edits.

The standalone test helper `01-Find-GitWorktreeAncestor.ps1` is byte-identical to the helper embedded in the corrected instrument. It makes that exact function independently testable without invoking or dot-sourcing the full capture instrument.

## 3. Tests and results

The reproducible test artifacts are in the evidence bundle:

- `03-test_pf11_root_safe.ps1` — native PowerShell fixture harness for the six requested cases plus a before/after fixture-tree fingerprint; designed to run with Windows PowerShell 5.1.
- `04-test_pf11_root_safe.py` — portable Linux runtime tests of the same lexical parent-walk contract and source-integrity/non-mutation constraints.
- `05-python-test-results.txt` and `06-runtime-availability.txt` — verbatim result/availability records.

**Executed in this sandbox:** `python evidence/integration/cap03-pf11-root-safe-correction-2026-10-27/04-test_pf11_root_safe.py` — **8 tests passed**, including ordinary existing parent, missing intermediate path, filesystem root termination, `.git` directory, `.git` file, outside-worktree result, source/F4 identity and no added store-mutation behavior, and unchanged test-fixture tree. The root case exercised the Linux filesystem root `/`, not a Windows drive root.

Tree-sitter PowerShell grammar parsing passed for the standalone helper and the native PowerShell test harness. This is a syntax check, not a PowerShell runtime test. The sandbox is Linux x86_64 and has neither `powershell` nor `pwsh`; no Windows PowerShell runtime was available. Therefore the native harness was **not run** here. Windows PowerShell 5.1 execution of all six cases, including a real Windows drive root, is an explicit prerequisite before any subsequent capture; portable tests and parser inspection are not substituted for that requirement.

No PF-11/PF-12/PF-13 instrument was invoked. The test fixtures are isolated temporary test directories and are removed by their harness; no F4 path or evidence capture root was targeted.

## 4. Relationship to the published CAP-03 procedure

The correction is a separately versioned source artifact because the published CAP-03 procedure restricts an ordinary derivative to parameter-only substitutions. This is not presented as a parameter-only derivative of the old instrument, and the old published bytes are neither silently replaced nor reclassified. This supplement is the governed source/procedure update: it designates the new v2 artifact for a future attempt and supersedes only the source-identity/derivative instructions in the earlier procedure that pointed to the defective instrument. All unrelated pins, PF responsibilities, stop gates, evidence requirements, ordering, F4/F5 values, and scope remain governed by the existing procedure and are unchanged.

For a future capture, the operator must start from the exact published v2 bytes and may make only the established raw-byte parameter substitutions for `$RunId`, `$IpdRoot`, and `$IrrRoot` (with `$EvidenceRoot` derived from the fresh `$RunId` as in the existing procedure). The executing bytes, self-digest, confined byte diff, and run parameters remain required. The v2 source identity in the final publication receipt is authoritative; an older `85AC…` digest or any previously generated derivative is not a substitute.

## 5. Acceptance conditions before a subsequent capture

This correction does not authorize or initiate the next capture. Before a subsequent capture may be considered, all of the following must be verified:

1. The v2 artifact and this procedure supplement are effective on IRR `main`, and their exact commit/tree/blob/SHA-256 identities have been independently read back remotely.
2. On the designated Windows host, the native PowerShell 5.1 harness passes all six required path cases without empty-path errors; its test-fixture fingerprint is unchanged. A Windows drive-root result and `.git` file result are explicitly evidenced.
3. The operator rechecks the current effective authority, current IRR/IPD designations, PF-17 consumption register, procedure prerequisites, host/session/environment, and all fresh-root conditions from the published CAP-03 procedure. Any changed pin, prior P-1 receipt/attempt, mismatch, or failed criterion is a STOP.
4. The existing capture remains preserved and unaccepted; no reuse or overwrite. Only after the prerequisites are verified may the designated operator consider one separately governed fresh capture. This correction task did not make that capture directory or invoke the instrument.
5. The fresh capture is independently reviewed against PF-01…PF-17, exact source/derivative bytes, timestamps, complete raw outputs, evidence manifest, and the CAP-03 acceptance criteria. Publication of a correction alone never changes acceptance status.

The exact F4 value remains `C:\iips-data\iips\user-portfolio.sqlite`; F5 and `DISP-01`–`03` / `OBS-01` are unchanged. **P-1 remains NOT EXECUTED / UNSPENT / NOT AUTHORIZED.** No authorization boundary, single-use fence, PA-rendered value, host state, or acceptance determination is amended here.
