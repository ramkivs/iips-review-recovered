# CAP-03 — P-1-C / P-1-D Evidence-Reconciliation Integrity Correction (`2026-10-27`)

> **STATUS: ADDITIVE EVIDENCE-INTEGRITY CORRECTION ONLY — NO HOST CONTACT, NO CAPTURE, NO ACCEPTANCE, NO EXECUTION AUTHORITY.** This record repairs two demonstrable defects introduced into the authoritative record by PR #333 and restores byte-preserving storage of captured host evidence. It preserves every historical record, changes no instrument source, no execution pin, no procedure step, no PF-17 requirement, no F4/F5 value, and no gate. **P-1 remains `NOT EXECUTED`, `UNSPENT`, and `NOT AUTHORIZED`.**

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP03-P1C-P1D-EVIDENCE-RECONCILIATION-CORRECTION-2026-10-27-01` |
| **Record type** | Additive successor correction record; **not** a PA act, host receipt, acceptance, execution authorization, or PF-17 satisfaction |
| **Authority locus** | `ramkivs/iips-review-recovered`, `refs/heads/main` |
| **Base commit / tree** | `d8a4f77850ad0b45695282d6bfa20e51921f19e8` / `334702f9a98297ce3fa4cccd8f133839752955ca` — PR #333 merge, verified live before any edit |
| **IPD (read-only)** | `ramkivs/iips-production-market-data`, `refs/heads/main` at `888eb375eebee01640e44ccdcbb138a71e8c4513` / tree `cf3b90482fa7ed1f9780f20a9286164686885d2b`; **0 IPD writes** |
| **Records corrected** | §16.155 (`CV-CORR-135`, PR #333) — two conclusions superseded; §16.154.8 (`CV-CORR-134`) — **vindicated**, unchanged |
| **Evidence bundle** | `evidence/integration/cap03-p1c-p1d-evidence-reconciliation-correction-2026-10-27/` |
| **Tracker registration** | §16.156, `CV-CORR-136`, `CHG-2026-10-27-16` |
| **Precedent followed** | §16.137 (`CV-CORR-117`) — *preserve initial publication; corrected successor published*. Original files and PR remain unchanged. |

## 1. Scope and governing records reread

This correction is subordinate to, and amends none of, the following effective records. All were reread at the base commit before any edit:

1. **§16.143 / `CV-CORR-123`** — P-1/S2 execution basis: IPD `001c3c80618f2ee1d40e9a90912237e1a06e7b58` / tree `399fa44a5f1953c0f61b452420fefb5985426ef1`, parent `8eec74ae…`. **Unchanged and not re-designated.** The three §8 step-0 source blobs at that tree were re-read and match: `2cbce83f…`, `dc844189…`, `96d0079d…`.
2. **§16.122.7 / `CV-CORR-102`**, carried by §16.152.4 and §16.153.1 — IRR PF-08 QE consumer `ba64b2d5927c2f872560710cf1474c25a5cde0d5` / tree `5e4262f1cd75bf13b76ced5b45058f31434b5dad`. **Unchanged.** Current IRR `main` remains the publication/authority ref, not the PF-08 consumer coordinate.
3. **§16.152 / `CV-CORR-132`** — the governing acceptance review, including its four-way vocabulary and its split of PF-17 into a **register limb** (`VERIFIED` repository-side) and a **capture limb** (`NOT EVIDENCED`; the published instrument does not emit it). **Unchanged.** Residuals **R-1**–**R-7** carry forward unwaived.
4. **§16.153 / `CV-CORR-133`** — the fresh-capture procedure. **Unchanged, byte-for-byte.** Its PF-17 gate and the exact required confirmation string `UNSPENT - NO P-1 EXECUTION RECEIPT` are neither reworded, relaxed nor bypassed.
5. **§16.154 / `CV-CORR-134`** — the PF-11 root-safe correction, whose §16.154.3 designates the v2 artifact as the derivative source for a future attempt and supersedes only §16.153's source-identity references. **Unchanged, and its recorded identities are confirmed correct below.**
6. **IPD successor act** `IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01`, blob `528de6aeddbc8e5f3191be8792f3937d77de4037`, SHA-256 `df8e44f704814e2321b5134206b04f25097830bdc5dd53c4d907d1256e4c788d` — re-read at current IPD `main`, **byte-identical**. §9 remains: *"The authority is **consumed on completion whether the act succeeds or fails** … any re-attempt requires a fresh rendering."* No consumption is recorded.
7. **IPD execution tracker** `evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md`, blob `8a2a4e45615b84e517b65fe2700d4a09cde8c3f7`, SHA-256 `8f85ca5e1e4acc10e19fa77d8ab87c388567a88442c136f5388e76479841351c` — **byte-identical**. Still records Gate A′ P-1 provisioning execution as **`NOT EXECUTED`** and *"no store, no V-A2 receipt"*.

## 2. Defect A — the false instrument-digest invalidity claim

### 2.1 The contradiction

| Record | Value it states for the v2 instrument SHA-256 | Length |
|---|---|---|
| **§16.154.8** — publication receipt with 16/16 independent remote blob read-back | `13783385cb8a7964387868ad96f05956cceb9b7d4ead048c0cfe72b325e6748e` | **64 — valid** |
| **§16.155** and the PR #333 report (lines 31, 45) | `13783385cb8a7964387868ad96f05956cceb9b7d4ead0488c0cfe72b325e6748e` | **65 — invalid** |

§16.155 asserted: *"The earlier recorded purported SHA-256 string had 65 hex characters and is invalid."* §16.155 therefore declared a defect in §16.154.8 that does not exist, and left the designated derivative source's digest unrecorded and discredited in current `main`, while `assessment.json` carried the placeholder `"reported_sha256": "INVALID_65_HEX_CHARACTERS_DO_NOT_USE_AS_SHA256"`.

### 2.2 Re-verification from authoritative Git objects

Read live from the GitHub Contents/Git-Trees API at the exact base commit and recomputed, never transcribed (bundle `00`):

| Property | §16.154.8 records | Live re-verification | Result |
|---|---|---|---|
| Path | `evidence/integration/cap03-pf11-root-safe-correction-2026-10-27/02-p1c-p1d-readonly-preflight-pf11-root-safe-v2.ps1` | same | **MATCH** |
| Git blob | `191f5828461286b0f6fcb688b023da5dfc68a265` | `191f5828461286b0f6fcb688b023da5dfc68a265` (tree entry **and** recomputed from decoded bytes) | **MATCH** |
| Byte length | 10,990 B LF | 10,990 B, 215 LF, 0 CRLF | **MATCH** |
| SHA-256 | `13783385cb8a7964387868ad96f05956cceb9b7d4ead048c0cfe72b325e6748e` | `13783385cb8a7964387868ad96f05956cceb9b7d4ead048c0cfe72b325e6748e` | **MATCH** |
| Digest length | — | **64 hex characters, valid SHA-256 form** | **§16.154.8 CORRECT** |

The v1 original instrument is likewise unchanged: blob `eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb`, 10,231 B LF, SHA-256 `85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b`.

### 2.3 The transcription error, explained exactly

An exhaustive census of every `13783385`-prefixed string in all tracked text files at the base commit (bundle `01`):

| Digest string | Hex length | Valid SHA-256 | Occurrences | Where |
|---|---|---|---|---|
| `…d4ead048c0cfe72b325e6748e` | **64** | **yes** | **9** (5 files) | tracker **×4** — `CHG-2026-10-27-13` (line 364), `CHG-2026-10-27-14` (line 365), §16.154.2 (line 13573), §16.154.8 (line 13624); `cap03-pf11-root-safe-correction-2026-10-27/08-publication-readback.json` **×2**; **×1** each in that bundle's `07-minimal-change-record.json`, `09-procedure-supplement-checks.json`, `SHA256SUMS.txt` |
| `…d4ead0488c0cfe72b325e6748e` | **65** | **no** | **1** (whole tracked tree) | `cap03-p1c-p1d-evidence-reconciliation-2026-10-27/CAP03_P1C_P1D_EVIDENCE_RECONCILIATION_2026-10-27.md`, lines 31 and 45 (the PR #333 report) |

The two strings first diverge at index 47: the correct form reads `…b7d4ead048c0cfe72b32…`, the malformed form `…b7d4ead0488c0cfe72b3…`. The malformed string is the correct digest with **exactly one extra `8`** inserted into the `048c0cfe` run, making it `0488c0cfe`. Because the inserted character and the following character of the correct digest are both `8`, deleting either of the two adjacent `8`s (indices 46 or 47) reproduces the correct digest; the defect is therefore stated as one extra `8` in the doubled run rather than as a single unambiguous index. Single-deletion sufficiency is proved programmatically (`len(malformed) − len(correct) == 1`).

**Conclusion:** the 65-character string is PR #333's **own transcription**, not a value §16.154 ever recorded. §16.155's invalidity conclusion is **demonstrably false** and is **superseded**. §16.154.8 is **vindicated** and stands unchanged. §16.155 also left unperformed its own assessment's `required_next_repository_actions[0]` — *"From verified current IRR `main`, compare the exact remote blob/bytes of the designated PF-11 root-safe v2 instrument … and correct any stale identity references … based on live remote evidence"* — which this record now performs.

## 3. Defect B — reconciliation evidence-package integrity

### 3.1 The defect, reproduced at the exact authoritative commit

`verify_assessment.py`, run unmodified against base commit `d8a4f77850ad0b45695282d6bfa20e51921f19e8`:

```
FAIL
 - sha256 mismatch: captured_root_safe_instrument.ps1: 95aa38118066a5fafdb75ebb4676beeb5701a9b3385a07877b5b1cbd3a1d9532 != 804a832296f326dff5ea1a8b3b0c779c3a7721d2db931e9a462ead648f5f6bd7
EXIT=1
```

| Representation of `…/cap03-p1c-p1d-evidence-reconciliation-2026-10-27/captured_root_safe_instrument.ps1` | Bytes | Line endings | Git blob | SHA-256 |
|---|---|---|---|---|
| **Original evidence** — `02-executed-instrument.ps1` inside the preserved `root_safe_capture.zip`, and the value `SHA256SUMS.txt` published | **11,257** | **CRLF ×214** | `8a913f9a7223ef7c6d32d5a5274c84c21e8ec0d0` | `804a832296f326dff5ea1a8b3b0c779c3a7721d2db931e9a462ead648f5f6bd7` |
| **Committed by PR #333** at base | 11,043 | LF ×214 | `811c6b63194b72859d180236eb944548c649f00e` | `95aa38118066a5fafdb75ebb4676beeb5701a9b3385a07877b5b1cbd3a1d9532` |

Delta = **214 bytes = exactly the CRLF count**; the committed bytes equal the original with every CRLF stripped. So PR #333 committed a **line-ending-normalised copy of captured host evidence** while its manifest described the CRLF original. **The manifest was right and the committed file was wrong** — this is not a manifest error. Consequences at base: the committed bytes were not the evidence the manifest described, and `INDEX.md`'s *"byte-for-byte copy"* statement was false of them. **6 of 7** manifest lines matched; exactly **1** did not.

### 3.2 Mechanism — empirically reproduced, not assumed

`core.autocrlf` is unset in this correction environment, where `git add` of the CRLF bytes stages them unchanged. The mechanism was therefore reproduced directly (bundle `02`): the original CRLF evidence bytes were written into scratch repositories under stated settings and the resulting staged blob read back with `git ls-files -s`.

| `core.autocrlf` | Attribute | Staged blob |
|---|---|---|
| `true` | *(none)* | **`811c6b63194b72859d180236eb944548c649f00e`** ← **exactly PR #333's blob** |
| `input` | *(none)* | **`811c6b63194b72859d180236eb944548c649f00e`** |
| `false` | *(none)* | `8a913f9a7223ef7c6d32d5a5274c84c21e8ec0d0` |
| `true` | `-text` | `8a913f9a7223ef7c6d32d5a5274c84c21e8ec0d0` |
| `input` | `-text` | `8a913f9a7223ef7c6d32d5a5274c84c21e8ec0d0` |

CRLF→LF conversion active in the PR #333 authoring environment reproduces the committed blob **byte-for-byte**. The cause is established, not inferred.

### 3.3 The byte-preserving correction

- **Restored the original CRLF evidence bytes**, extracted read-only from the preserved `root_safe_capture.zip`: blob `811c6b63…` → **`8a913f9a7223ef7c6d32d5a5274c84c21e8ec0d0`**, 11,257 B, SHA-256 `804a8322…`. The restored file is **byte-identical** to the archive original.
- **Added one exact-path `-text` rule** to `.gitattributes` for this file, so the bytes are stored and checked out exactly regardless of any `core.autocrlf` — including on the designated Windows operator host, where `core.autocrlf=true` is the common default and would otherwise re-normalise the evidence on any future re-add.
- **`-text`, not `text eol=lf`.** The canonical evidence bytes *are* CRLF; an `eol=lf` rule would itself destroy the captured evidence. The repository's existing `text eol=lf` rules serve LF-canonical files; this path needs the opposite guarantee. Exact path only — no glob, no repository-wide policy, consistent with the file's own stated convention.
- **`SHA256SUMS.txt` line 4 was NOT changed** — it was already correct and now verifies. Only the `INDEX.md` line changed, because `INDEX.md`'s own content was corrected.
- **The manifest was not adjusted to conceal a mismatch.** The strongest available proof is that the **original, unmodified `verify_assessment.py` now passes**: `PASS: packaged input hashes and earlier archive manifest verified`, **exit 0**.

`INDEX.md` is corrected to describe accurately: the package's publication status (it *is* an effective IRR record, registered as §16.155 — the merged line saying otherwise was stale), the canonical CRLF line endings and restored identities, the checks actually performed and their results, and the two superseded conclusions.

**Both capture archives are untouched**: `earlier_capture.zip` `950857083cb73295cd3a1da1ac6f339e1adce8f6f210fdd98ec0efb4dc026146` and `root_safe_capture.zip` `1294c4d28713a38770da4e8b93d1a96b01b5379dda39534af2723a3436a42571` — unchanged, never opened for writing, not reconstructed, replaced, recombined or mixed. The PR #333 report, `assessment.json` and `verify_assessment.py` are likewise **preserved byte-for-byte**; the correction is additive.

## 4. Derivative findings and their confidence boundary

Read-only byte comparisons performed in this sandbox over authoritative bytes (bundle `03`). **No instrument was invoked, no executing copy was produced, no capture directory was created, and no host was contacted.**

### 4.1 Earlier capture → v1 source: **established byte-exactly**

`cap03-p1-20261027T110433Z-3569c5ceff28428c8293c442c9436649` / `02-executed-instrument.ps1` = 10,285 B, LF, SHA-256 `de763ba21be19d3a73e065c2683bc68f38d2bae3f1a885c4fc5784f01dbe2cfa` (matching its own self-recorded `99-script-digest.txt`).

Reconstructing v1 (`eaea3f7f…`, 10,231 B LF) plus exactly the three permitted parameter substitutions yields a **byte-exact match** with the captured file — each source pattern occurring exactly once, at lines **22** (`$RunId`), **27** (`$IpdRoot`), **28** (`$IrrRoot`). Its own `20-script-byte-diff.json` independently reproduces. **Confidence: ESTABLISHED byte-exactly.**

### 4.2 Root-safe capture → v2 source: **content-level established, byte provenance host-locus**

`cap03-p1-20261027T133547Z-edc19dfb4f0e4dc997ea15854187c50f` / `02-executed-instrument.ps1` = 11,257 B, CRLF ×214, SHA-256 `804a8322…` (matching its own self-recorded digest).

A line-level diff of v2 against the captured file yields **exactly three** non-equal opcodes: `replace` at line **22** (`$RunId`), `replace` at lines **27–28** (`$IpdRoot`/`$IrrRoot`), and one `delete` of the trailing empty line. **No logic, safety line, check, output name, ordering or `$StorePath` byte differs** — the F4 literal `$StorePath    = 'C:\iips-data\iips\user-portfolio.sqlite'` occurs exactly once in both. Reconstructing v2's CRLF form (11,205 B) plus the three substitutions gives 11,259 B, and **removing one trailing CRLF reproduces the captured 11,257 B byte-for-byte**.

**Confidence: CONTENT-LEVEL ESTABLISHED.** The differences are confined to the three designated parameter assignment lines plus one trailing newline.

**Residual — explicitly HOST-LOCUS and UNVERIFIED, and not cured by this repository-side reconstruction:**

1. the captured derivative is **CRLF**-terminated while the designated v2 published source is **LF** and is protected by an exact-path `text eol=lf` rule — a raw-byte substitution of the published LF bytes, as §16.152.3/§16.154 and procedure §4.4's `[IO.File]::WriteAllBytes` require, cannot by itself produce CRLF bytes;
2. the captured derivative **lacks the source's final trailing newline**;
3. **no in-session `20-script-byte-diff.json`** was supplied for this run, so the operator-side diff proof §16.152.3 requires remains absent;
4. the **provenance of the CRLF working-tree form on the host is unverified**.

**This does not establish that the root-safe capture executed the exact governing published instrument bytes, and does not close R-4** — it narrows it.

### 4.3 Separate identities preserved

The two captures used **different instrument lineages**, established from bytes: v1 has no `Find-GitWorktreeAncestor` helper and neither does the earlier derivative; v2 has it and so does the root-safe derivative. Run identities are distinct, and no run-specific evidence is relabelled, merged or treated as evidence for the other. The earlier run's PF-11 output still carries the empty-path `Join-Path`/`Split-Path` errors already recorded, so its `InsideGitWorktree=False` remains **not reliable proof**; the root-safe run's PF-11 remains the materially corrected observation. Neither is upgraded.

## 5. Verification register

| ID | Check | Result |
|---|---|---|
| `V-C1` | Base commit/tree verified live against `origin/main` before any edit | **PASS** — `d8a4f778…` / `334702f9…`; local `HEAD` identical; 0 open PRs at start |
| `V-C2` | v2 instrument live blob, byte length and SHA-256 re-read from authoritative Git objects | **PASS** — `191f5828…`, 10,990 B, `13783385…`, **64 hex**; §16.154.8 vindicated |
| `V-C3` | v1 instrument unchanged | **PASS** — `eaea3f7f…`, 10,231 B, `85ac7271…` |
| `V-C4` | Exhaustive digest census at base commit | **PASS** — 64-char ×9, 65-char ×1; single-extra-`8` relationship proved |
| `V-C5` | Package verifier failure reproduced at the exact base commit | **PASS** — `verify_assessment.py` **FAIL exit 1**, 1 of 7 manifest lines |
| `V-C6` | Normalisation mechanism empirically reproduced across 5 settings | **PASS** — `core.autocrlf=true`/`input` with no attribute reproduces blob `811c6b63…` exactly; `-text` preserves `8a913f9a…` under all |
| `V-C7` | Original evidence bytes restored byte-identically from the preserved archive | **PASS** — 11,257 B CRLF, `804a8322…`, blob `8a913f9a…` |
| `V-C8` | **Original unmodified `verify_assessment.py` passes** | **PASS** — exit **0** |
| `V-C9` | Corrected reconciliation manifest, all 7 listed files vs committed bytes | **PASS** — **7/7 MATCH** (`sha256sum -c`) |
| `V-C10` | Both capture archives byte-identical to PR #333 identities; never opened for writing | **PASS** — `950857083…` / `1294c4d2…` |
| `V-C11` | PR #333 report, `assessment.json`, `verify_assessment.py` preserved byte-for-byte | **PASS** — `aa068ddb…` / `0c27c832…` / `c673f509…` |
| `V-C12` | Derivative reconstruction of both captures | **PASS** — earlier vs v1 **byte-exact**; root-safe vs v2 **3 confined opcodes**, byte-exact after one trailing CRLF |
| `V-C13` | `verify_correction.py` read-only suite | **PASS** — **19/19 checks** |
| `V-C14` | Story consistency across report, `INDEX.md`, manifest, bundle and tracker | **PASS** — see §6 |
| `V-C15` | Diff reviewed for unrelated changes | **PASS** — 9 paths, all in scope; no instrument, pin, procedure, F4/F5, gate or unrelated path touched |
| `V-C16` | IPD read-only boundary | **PASS** — **0 IPD writes**; act and tracker blobs byte-identical |
| `V-C17` | No host contact, no capture, no invocation, no derivation for execution | **PASS** — repository-side byte comparison only |
| `V-C18` | Boundaries and non-grants | **PASS** — PF-17 unmodified and unsatisfied; no acceptance; no gate movement |

## 6. Consistency of the corrected record

The PR #333 report and `assessment.json` are preserved unedited as the historical decision trail, so they still contain the superseded 65-character string and the `INVALID_65_HEX_CHARACTERS_DO_NOT_USE_AS_SHA256` placeholder. That is intentional and is not concealed: the corrected `INDEX.md` — the package's entry point — names both superseded conclusions and points to §16.156, and bundle `01` records the exact occurrence census so a reader can locate every instance. From this record forward the authoritative identity of the designated v2 derivative source is the §16.154.8 value, live-verified in §2.2 above.

## 7. Status boundary and non-grants

| Item | Status after this correction |
|---|---|
| `P-1-A` / `P-1-B` | unchanged — S2 acceptance and execution-basis designation remain candidate-scoped/effective |
| **`P-1-C`** | **NOT ESTABLISHED** — unchanged. These are repository-side byte comparisons, not attempt-session acceptance |
| **`P-1-D`** | **DESIGNATED; SUBSTANTIVELY SUPPORTED AT REPORTED CAPTURE; NOT VERIFIED FOR THE ATTEMPT** — unchanged |
| **`P-1`** | **NOT EXECUTED / UNSPENT / NOT AUTHORIZED** — unchanged |
| **PF-17** | **NOT satisfied by this correction.** Wording, threshold and the exact confirmation string `UNSPENT - NO P-1 EXECUTION RECEIPT` are unchanged and unweakened. The **capture limb remains `NOT EVIDENCED`** and is host-locus; a repository correction is **not** host evidence |
| §16.154.5 native Windows PowerShell 5.1 harness | **STILL OUTSTANDING** (`V1053` NOT AVAILABLE) — prerequisite before any subsequent capture |
| F4 / F5 / PF-15 / `DISP-01`–`03` / `OBS-01` | unchanged; no store, sidecar or parent created, modified or deleted |
| Execution pins | unchanged; nothing re-designated on grounds of ancestry, recency or similarity |
| S3 / QE / DQ-4 / Gate 4 / Gate 5 | `NOT REACHED` / `0/11` / `8/10` / `AUTHORIZED — NOT STARTED` / `NOT INITIATED` — unchanged |
| IPD writes / store-path actions | **0 / 0** |

*End of `IIPS-V3-CAP03-P1C-P1D-EVIDENCE-RECONCILIATION-CORRECTION-2026-10-27-01`. §16.154.8's v2 digest is a valid 64-character value that reproduces from live authoritative bytes; §16.155's invalidity conclusion is superseded. Captured host evidence is again stored byte-exactly and the original package verifier passes unmodified. Both captures keep their separate identities, and the derivative findings are deliberately not upgraded into acceptance. This correction grants no execution authority and satisfies no PF-17 limb.*
