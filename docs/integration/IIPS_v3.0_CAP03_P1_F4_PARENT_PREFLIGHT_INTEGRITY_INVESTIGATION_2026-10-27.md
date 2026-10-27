# CAP-03 — P-1 Preflight Instrument Integrity Investigation: `CAP-03-P-1-INTEGRITY-2026-10-27` (`CV-CORR-129`)

> **STATUS: INTEGRITY INVESTIGATION AND REMEDIATION ONLY — NO P-1 EXECUTION.** This record investigates the
> `CAP-03-P-1` preflight instrument integrity discrepancy between the published manifest and the Windows host
> `Get-FileHash` observation, reproduces the exact byte-level cause, and publishes the smallest
> governance-compliant correction. **No P-1, P-1-C, P-1-D, F4, store, sidecar, provisioning, flag, pin, fence or
> gate is executed or moved.** Historical evidence is preserved; no silent replacement.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP03-P1-F4-PARENT-PREFLIGHT-INTEGRITY-INVESTIGATION-2026-10-27-01` |
| **Record type** | Integrity investigation + `.gitattributes` remediation. Not a re-publication of the instrument. |
| **Investigation scope** | `evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1` and its manifest `SHA256SUMS.txt` |
| **Prepared by** | Arena Agent Mode — investigation and remediation only; no host route to `desktop-no0nhtp` |
| **Governing locus** | `ramkivs/iips-review-recovered`, `refs/heads/main` |
| **Reviewed baselines** | Historical publication merge `4fd5a7c72db6aee9be1836e053f4bc427adee003` / tree `8b6249432662f6286c0242e3183bbd251ac48c73`; current `main` `3c3adf4ce2f8abd930dcc97b3fa9c8ad3ca903a7` / tree `010bfb4d535a5faa6edce255208ad341c614979b` |
| **Host contact** | **NONE** — reproduces Windows observation from repository bytes only |
| **IPD writes** | **0** |
| **Store-path creation** | **0 files, 0 directories** |

---

## 1. Authoritative inputs (verbatim)

| Observation | Value |
|---|---|
| Current `main` | `3c3adf4ce2f8abd930dcc97b3fa9c8ad3ca903a7`; tree `010bfb4d535a5faa6edce255208ad341c614979b` |
| Historical publication merge | `4fd5a7c72db6aee9be1836e053f4bc427adee003`; tree `8b6249432662f6286c0242e3183bbd251ac48c73` |
| Merge parents | `fd5dd32b3dd269c840efdd13fcd0f90317ef27e4` + `5bfb7a92977340b592be1ba146a0b204a7dbaabe` (PR #315 head `5bfb7a92977340b592be1ba146a0b204a7dbaabe`) |
| Script Git blob at both commits | `eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb` |
| Script history after publication | no changes (Git log shows none; blob identical at both trees) |
| Manifest-declared SHA-256 (historical + current) | `85AC7271C73469B6D5E454A3173FF3AAD944A645A2352BB77EE36BAEE976A30B` |
| Windows `Get-FileHash` (checked-out file) | `7C6D44B89723C09A0AA356E6735CACAFAF7BF032BED80D3AE0A99A2ACFE35924` |
| Historical receipt | `04-publication-readback.json` reports `all_match=true` (9/9) via GitHub Git Blobs API base64-decode + local re-hash |
| PowerShell exact-byte extraction | **failed** — no valid exact-byte comparison completed prior to this investigation |

---

## 2. One-pass action 1: Independent SHA-256 from exact Git blob bytes

**Method (no PowerShell text/encoding conversion):**

```bash
git cat-file -p eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb > /tmp/blob_raw.bin
sha256sum /tmp/blob_raw.bin
# and via GitHub API:
gh api repos/ramkivs/iips-review-recovered/git/blobs/eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb | python3 -c "import base64,hashlib,json,sys; d=json.load(sys.stdin); b=base64.b64decode(d['content']); print(hashlib.sha256(b).hexdigest())"
```

Executed on the `arena/210c304e-iips-review-recovered` sandbox (Linux, `3c3adf4`):

| Source | Byte count | SHA-256 (lower) | Upper |
|---|---|---|---|
| `git cat-file -p eaea3f7f…` (exact blob bytes) | **10,231** | `85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b` | `85AC7271C73469B6D5E454A3173FF3AAD944A645A2352BB77EE36BAEE976A30B` |
| Linux working-tree file `…/02-p1c-p1d-readonly-preflight.ps1` (LF) | 10,231 | `85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b` | identical |
| GitHub Git Blobs API `eaea3f7f…` base64-decoded | 10,231 | `85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b` | identical |
| Manifest entry (`SHA256SUMS.txt` line 3) | — | `85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b` | identical |

**Result:** Manifest is **byte-exact for the committed Git blob** at both `4fd5a7c` (tree `8b624943…`) and `3c3adf4` (tree `010bfb4d…`). The blob identity `eaea3f7f…` resolves at both trees; no post-publication change.

**CRLF-transformed bytes (simulating Windows `core.autocrlf=true` without `eol=lf`):**

```bash
python3 -c "import subprocess,hashlib; b=subprocess.check_output(['git','cat-file','-p','eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb']); c=b.replace(b'\n', b'\r\n'); print(len(c), hashlib.sha256(c).hexdigest().upper())"
```

| Variant | Byte count | SHA-256 | Matches Windows |
|---|---|---|---|
| CRLF (`\n` → `\r\n` for all 194 LF) | **10,425** | `7C6D44B89723C09A0AA356E6735CACAFAF7BF032BED80D3AE0A99A2ACFE35924` | **YES — exact match to `Get-FileHash` observation** |
| LF + BOM (`EF BB BF` + LF) | 10,234 | `F553EC7A…` | no |
| UTF-16LE | 20,462 | `0AB81F5D…` | no |

Line-ending census on the blob: **194 LF (`0x0A`), 0 CR (`0x0D`), 0 CRLF**. CRLF conversion adds exactly **194 bytes** (`10,425 - 10,231`), producing the Windows hash deterministically.

**Conclusion of Action 1:** The manifest hash is correct for the canonical LF Git blob; the Windows hash is correct for the CRLF working-tree rendering. The mismatch is not a manifest typo nor a script byte defect, but a **host-side representation divergence caused by Git line-ending conversion**.

---

## 3. One-pass action 2: Original publication-generation procedure and receipt — why `all_match=true`

**Publication generation (PR #315, commit `5bfb7a9…` → merge `4fd5a7c…`):**

- Manifest `SHA256SUMS.txt` (blob `5c39c7d4…`, 562 B) was generated on a Linux sandbox (Arena) by hashing files as checked out there (LF working-tree bytes). The generator is logically equivalent to:

  ```python
  hashlib.sha256(Path(p).read_bytes()).hexdigest()  # read_bytes() returns LF bytes on Linux
  ```

- On Linux, `git cat-file -p eaea3f7f…` and `Path.read_bytes()` yield identical 10,231-byte LF bytes, so the computed digest `85AC…` is the blob-faithful hash.

- `.gitattributes` at both `fd5dd32…` (parent) and `8b6249…` (merge tree) lists **8 LF-protected calibration paths + `NP-12-N4-CANONICAL-BYTE-GRAMMAR-DECISION-RECORD.md`** — it does **not** list any `*.ps1` instrument:

  ```
  evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1  → absent
  ```

  Therefore on a Windows host with `core.autocrlf=true` (the usual Windows default), Git converts LF→CRLF on checkout for unlisted text files. `Get-FileHash` hashes the CRLF working-tree bytes (`10,425 B`, `7C6D…`), not the Git blob bytes.

**Read-back (receipt `04-publication-readback.json`, blob `c17bd7b1…` at that merge):**

- Method: *GitHub Git Blobs API at the merge commit; base64-decoded bytes re-hashed locally* — identity and size.
- For the script: remote `blob eaea3f7f…` (10,231 B, `85AC…`) vs local `Path.read_bytes()` on Linux sandbox (10,231 B, `85AC…`) → `bytes_equal=true`, `match=true`.
- This validates **repository ↔ remote consistency (both LF)**, not **repository ↔ Windows working-tree consistency (LF vs CRLF)**. The receipt's `9/9 MATCH, byte-identical` claim is true for the server-side Git object store, but **incomplete as a host-verification claim** — it did not model `core.autocrlf` working-tree translation.

**Why the PowerShell extraction failed:** PowerShell's `Get-Content` and string pipelines perform encoding/line-ending normalization (UTF-8/BOM heuristics, `Out-File -Encoding utf8` with BOM/CR LF). Attempts to extract exact blob bytes via PowerShell therefore produced text-converted output, never the raw `10,231` bytes. No valid exact-byte comparison had been completed before this Linux `git cat-file -p` verification.

---

## 4. One-pass action 3: Fault determination (supported by exact IDs)

| Candidate fault | Verdict | Evidence |
|---|---|---|
| **Manifest bytes** | **NOT faulty as a committed-blob hash** — but **incomplete as a host-verification hash** without an `eol=lf` guarantee | Manifest `85AC…` equals `sha256(git cat-file -p eaea3f7f…)` (`10,231 B`) and equals Linux working-tree file (`10,231 B`) at both `4fd5a7c`/`8b6249…` and `3c3adf4`/`010bfb4…` |
| **Script bytes** | **NOT faulty** — canonical LF, correct size, correct blob | Blob `eaea3f7f…` present at both trees, size `10,231`, LF-only, no CRLF; `git ls-tree` shows `100644 blob eaea3f7f…` at both commits |
| **Hashing/readback procedure** | **Deficient (omission, not miscalculation)** — did not account for working-tree `autocrlf` translation | Generation: Linux `read_bytes()` → LF hash; Read-back: Git Blobs API → LF hash; both `all_match=true` for server bytes, but neither hashed the Windows CRLF rendering (`10,425 B`, `7C6D…`) |
| **Host-side representation** | **CRLF-transformed working-tree (expected given missing gitattributes)** | `7C6D44…` is exactly `sha256(LF bytes with \n→\r\n)` (+194 B); `.gitattributes` lacks `eol=lf` for `*.ps1`; Windows default `core.autocrlf=true` explains the transformation without any repository corruption |

**Root cause:** `.gitattributes` omission. The file is a **byte-exact canonical instrument** asserted by SHA-256 (its digest is published in `SHA256SUMS.txt` and referenced by the preflight procedure), but it was not listed as `text eol=lf`. The governing `.gitattributes` header states:

> *Byte-exact canonical files asserted by committed-blob or raw-byte hash tests. Keep LF working-tree bytes for these exact paths regardless of core.autocrlf, so raw SHA-256 and Git blob identities match the committed canonical content.*

The instrument meets that criterion and was omitted — a publication defect, not a script defect.

**Byte-count / ID table (independently reproducible):**

| Artifact | Git blob (SHA-1) | Size (B) | SHA-256 (LF canonical) | SHA-256 (CRLF Windows) |
|---|---|---|---|---|
| `02-p1c-p1d-readonly-preflight.ps1` (instrument) | `eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb` | 10,231 | `85AC7271C73469B6D5E454A3173FF3AAD944A645A2352BB77EE36BAEE976A30B` | `7C6D44B89723C09A0AA356E6735CACAFAF7BF032BED80D3AE0A99A2ACFE35924` |
| `SHA256SUMS.txt` | `5c39c7d46c993ff9d497fd3c99477ebf6deffaf7` | 562 | `63e8d1891b95638b2d3b88b1b703e1cecc2d99b6b203d2e4b233eb7ccf28fcc9` | — |
| Record doc | `8e35986afffcb5187a68347fd2f6209b4e259275` | 18,975 | `14723ffd6be83d1e7869c78fe410b689f89ae899f1d7ac012c30918ffe263eca` | — |

All three blobs resolve at `4fd5a7c` and `3c3adf4`; `git cat-file -p <blob>` reproduces the bytes above.

---

## 5. One-pass action 4: Smallest governance-compliant correction

**Principle:** Do not rewrite historical evidence or silently replace the instrument. Preserve the prior artifact; explain the correction.

**Prior artifact preservation:**

- Instrument file `02-p1c-p1d-readonly-preflight.ps1` is **not modified** — blob `eaea3f7f…` retained.
- Manifest `SHA256SUMS.txt` (blob `5c39c7d4…`) remains correct for the LF canonical bytes and is **not edited** in place.
- Historical receipt `04-publication-readback.json` is preserved; its `all_match=true` is now annotated as *server-side only*.

**Correction (this investigation):**

1. **`.gitattributes` — single-line addition (the only code change):**

   ```diff
   +evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1 text eol=lf
   ```

   Effect: on any Windows host with `core.autocrlf=true`, the instrument checks out as **LF (`10,231 B`)**, so `Get-FileHash` yields `85AC…`, matching the manifest and the Git blob. This satisfies the `.gitattributes` header's own guarantee for canonical files. No other file is affected.

   - Before (at `4fd5a7c` / `3c3adf4`): `git ls-files --eol …/02-*.ps1` → `i/lf w/lf attr/` (unprotected; autocrlf would produce `w/crlf` on Windows → `7C6D…`).
   - After (this correction): `i/lf w/lf attr/text eol=lf` — LF preserved regardless of `core.autocrlf`.

2. **New integrity record (this markdown)** — documents the discrepancy, the exact byte-level cause, the verification commands, and the fault attribution above.

3. **New evidence bundle** — `evidence/integration/cap03-p1-f4-parent-preflight-integrity-investigation-2026-10-27/` containing the investigation inputs, byte analysis, gitattributes defect record, publication-procedure analysis, safety-check transcript, and a verifier. This bundle is hashed independently; its `SHA256SUMS.txt` covers only the new bundle.

4. **Tracker update** — new §16.149 (`CV-CORR-129`, `V993`–`V1002`) records the investigation, the correction, and the preserved historical evidence.

No IPD write, no P-1 execution, no F4 parent/store/sidecar creation, no write-flag change, no baseline pin change (see §6).

---

## 6. One-pass action 5: Non-execution safety checks on the instrument source

Executed on this Linux sandbox at `3c3adf4` (and after the `.gitattributes` correction — no instrument byte change):

| Check | Method | Result |
|---|---|---|
| Instrument never invokes `--mode=execute` | `strip_powershell_comments` + scan for `gateAPrimeProvisioning` + `--mode=execute` on same executable line; also `node` + `--mode=execute` | **PASS** — no executable `gateAPrimeProvisioning` line carries `--mode=execute`; the flag appears only in comments / `Write-Host` display string |
| No store file / sidecar creation | Scan for `New-Item` outside `$EvidenceRoot`; check instrument declares `creates NO store file, no -wal, no -shm, no -journal` and `creates NO directory on $StorePath` | **PASS** — sole `New-Item` is `New-Item -ItemType Directory -Path $EvidenceRoot -Force` |
| No provisioning invocation | Scan for `gateAPrimeProvisioning.js` invocation | **PASS** — only `--mode=validate` documented in comments, never invoked |
| F4 parent not created by instrument | Ancestor walk only via `Test-Path`; no `mkdir` on `$StorePath` ancestors | **PASS** — `C:\iips-data\iips` is probed, never created |
| Write flags not enabled | Instrument's `PF-10` capture checks `IIPS_G3_IPC_BINDING_PROVISIONED`, `IIPS_ENABLE_WRITES`, `IIPS_G3_ENABLE_WRITES`, `GATE_E_OVERRIDE` as `<ABSENT>` | **PASS** — read-only; no env-var mutation |
| Repository free of sqlite artifacts | `find . -name "*.sqlite" -o -name "*.wal" …` + `EVIDENCE.rglob` in verifier | **PASS** — 0 files |
| Tracker still records `P-1 UNSPENT` | `verify_reconciliation.py` checks `UNSPENT` in doc + `P-1 UNSEPT` in reuse JSON | **PASS** |
| Full verifier | `python3 evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/verify_reconciliation.py` | **39/39 PASS — RECONCILIATION VERIFIED** |
| New investigation verifier | `python3 evidence/integration/cap03-p1-f4-parent-preflight-integrity-investigation-2026-10-27/verify_investigation.py` | **PASS** (see bundle) |
| `git diff --check` | whitespace / staged integrity | **PASS — clean** |

The operator's safety contract (PF-14 evidence root only; no store mutation) is preserved.

---

## 7. One-pass action 6: Authoritative tracker and evidence bundle update

**Tracker:** `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` — new **§16.149** (`CV-CORR-129`, `CHG-2026-10-27-05`, `V993`–`V1002`) records the discrepancy, the byte-level reproduction (`10,231 B` LF `85AC…` vs `10,425 B` CRLF `7C6D…`), the `.gitattributes` root cause, the correction scope, and the preserved states. No substantive gate/provisioning/pin change; `0` IPD writes asserted.

**Evidence bundle:** `evidence/integration/cap03-p1-f4-parent-preflight-integrity-investigation-2026-10-27/` — immutable investigation artifacts (`00`–`04`, `INDEX.md`, `SHA256SUMS.txt`, `verify_investigation.py`) referenced from the tracker.

**Historical bundle:** `evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/` — **preserved byte-identically**; its `SHA256SUMS.txt` and blobs remain authoritative for LF canonical bytes. A cross-reference in the investigation bundle links to it.

**Remote verification:** After publication, the correction must be verified by independent GitHub object/blob read-back at the merge commit (Git Blobs API base64-decode + `sha256`), plus CI. The prior publication's `4fd5a7c` / `8b6249…` evidence remains independently verifiable and is not invalidated.

---

## 8. Current P-1 / P-1-C / P-1-D state (unchanged)

| Item | State (from §16.146/§16.148, preserved) |
|---|---|
| **P-1-A** formal S2 acceptance | `SATISFIED` (candidate-scoped §16.144) |
| **P-1-B** execution basis | `SATISFIED` candidate-scoped `001c3c80…`/`399fa44a…` (§16.143) — pin unchanged |
| **P-1-C** host preflight | `NOT ESTABLISHED` — read-only instrument published and (after this correction) Windows-reproducible; no P-1-session transcript exists |
| **P-1-D** F4 store-path facts | `DESIGNATED; NOT VERIFIED` — structural blocker removed by `DISP-01` (§16.146); host facts outstanding |
| **P-1** | `UNSPENT`, **NOT AUTHORIZED TO EXECUTE** |
| **F4** | `C:\iips-data\iips\user-portfolio.sqlite` — unchanged (39 B, 3 separators, byte-identical to act `-02` blob `3fe9a2dd…`) |
| **PF-13/PF-12/S2/QE/DQ-4/Gate 4/Gate 5** | unchanged (S3 `NOT REACHED`, QE `0/11`, DQ-4 `8/10`, Gate 4 `AUTHORIZED — NOT STARTED`, Gate 5 `NOT INITIATED`) |
| **IPD writes** | `0` |

No acceptance is claimed. Governing acceptance conditions (§16.140.4 `P-1-C`, §16.146.3–§16.146.4, matrix §7, runbook §4) require a **fresh P-1-session host capture on `desktop-no0nhtp` with the instrument checked out at the corrected `.gitattributes` commit**, evidencing all PF criteria at the intended attempt time. The CRLF→LF remediation removes only the *reproducibility* blocker; every host fact remains outstanding until that capture.

---

## 9. Single next action

**Ramki (PA / designated non-elevated operator), in the intended P-1 session immediately before the authorized attempt and with the IPD worktree clean at `001c3c80…`/`399fa44a…`**, does:

1. **`git fetch` / `checkout` the IRR `main` commit that contains this investigation's merge** — thereby obtaining the corrected `.gitattributes` (`text eol=lf` for the instrument) — and confirms the Windows checkout hash:

   ```powershell
   Get-FileHash -LiteralPath evidence\integration\cap03-p1-f4-parent-preflight-reconciliation-2026-10-27\02-p1c-p1d-readonly-preflight.ps1 -Algorithm SHA256
   # expected: 85AC7271C73469B6D5E454A3173FF3AAD944A645A2352BB77EE36BAEE976A30B (LF, 10231 B)
   ```

   If it shows `7C6D…` (`10,425 B`, CRLF), stop — the host's Git is not honoring `eol=lf` (update Git or re-clone).

2. Runs the published instrument `02-p1c-p1d-readonly-preflight.ps1` in that session and supplies the transcripts for independent read-back.

**Any STOP aborts the attempt.** Do **not** execute P-1, do not use `--mode=execute`, do not create `C:\iips-data\iips`, do not enable write flags, and do **not** pre-create the store.

*End of `IIPS-V3-CAP03-P1-F4-PARENT-PREFLIGHT-INTEGRITY-INVESTIGATION-2026-10-27-01`. Integrity discrepancy resolved as a line-ending publication defect; instrument bytes preserved; `.gitattributes` correction published; P-1 unspent and unauthorized; no gate advanced.*

