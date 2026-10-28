# CAP-03 P-1-C / P-1-D — One-Pass Reconciliation after the IPD D2 Merge, and Reserved PA Decision Packet (`2026-10-28`)

> **STATUS: RECORD AND DECISION PACKET ONLY. P-1 IS NOT EXECUTED / UNSPENT / NOT AUTHORIZED.**
> **P-1-C = NOT ESTABLISHED. P-1-D = DESIGNATED; NOT VERIFIED FOR THE ATTEMPT.**
>
> This record reconciles the authoritative CAP-03 records with the IPD D2 publication, classifies the evidence for P-1-C and P-1-D, and prepares decision-ready packets for the matters that are reserved to Program Authority (PA). It **designates nothing**, **approves nothing**, and **supplies no signature**. The D2 commit is recorded as a candidate that exists on IPD `main`; it is **not** an execution pin, is **not** designated, and its correctness is **not** judged here.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP03-P1C-P1D-RECONCILIATION-PA-PACKET-2026-10-28-01` |
| **Tracker** | §16.166 (`CV-CORR-146`, `CHG-2026-10-28-09`, `V1153`–`V1160`) |
| **Scope** | IRR governance only. IPD read-only. No host, capture, PowerShell, PF-11, V1102, A6 runtime, compatibility-script, or store action |
| **Supersedes** | Nothing. Historical records remain as written. Stale existence statements are corrected by additive pointers (§3) |

---

## 1. Verified baselines (this pass)

| Repository | Ref | Value | Verification |
|---|---|---|---|
| IRR | `origin/main` | `981020f01d30bccd5f55173ebdc2d5d298858ea0` (PR #345 merge; head `ca537c76`, merged `2026-10-28T04:54:52Z`) | `git ls-remote`; `gh pr view 345` |
| IRR | session branch | `arena/45bc9d78-iips-review-recovered` at `981020f` before this pass; working tree clean | `git status` |
| IPD | `main` | `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` (merge of PR #100, `2026-10-28T05:48:27Z`) | `git ls-remote` (read-only) |
| IPD | D2 PR head | `f722d7d46e056d4eb3039e9d3df8045b1cce4e1c`; parent `888eb375`; tree `76f083d7058e170d8212455c03bad1033136ee68` | `git cat-file`; blobless clone `/tmp/ipd-ro` |
| IPD | prior `main` | `888eb375eebee01640e44ccdcbb138a71e8c4513` (tree `cf3b9048…`) | prior pass |
| IPD | compiled basis | `5fc74085ade980846ff4a07b36415b6d49446486` (tree `7226ef0033b3a7049169d8fcf9bcbc9908e2590b`); `BASIS_COMMIT` / `BASIS_TREE` constants in `gateAPrimeValidation.ts` lines 25–26, identical at `001c3c80` and `f722d7d` | `git show` |
| IPD | DA-A1 candidate pin of record | `001c3c80618f2ee1d40e9a90912237e1a06e7b58` (tree `399fa44a5f1953c0f61b452420fefb5985426ef1`); ancestor of `main` and of `f722d7d` | `git merge-base --is-ancestor` |
| IPD | S1 baseline / binding | `6d8f161` (S1 baseline) / `f9ec0c5` (S1 binding; ancestor of `001c3c80`) | prior pass |
| IRR | consumer pins (on `main`) | R1 `ba64b2d5927c2f872560710cf1474c25a5cde0d5` (tree `5e4262f1…`; §16.122.7, §16.152.4); R2 `4740ba21…` (tree `23c5ca4a…`; Gate 4 §3.1) | prior pass |
| Both | open PRs | IRR `0`; IPD `0` | `gh pr list --state open` |

**Observed movement.** IPD `main` moved from `888eb375` to `a891802e` during the work (PR #100). IRR `main` did not move. The verification targets in the one-pass directive were checked against these live values, not assumed.

---

## 2. IPD D2 publication receipt and §4.6 classification

### 2.1 Publication facts (read-only)

| Item | Value | Evidence |
|---|---|---|
| PR | IPD PR #100, "CAP-03 D2: record executing identity separately from the compiled basis in the Gate A' provisioning receipt" | `gh pr view 100` |
| PR head | `f722d7d46e056d4eb3039e9d3df8045b1cce4e1c` | PR metadata |
| Merge | `a891802e2691bd9c65a67d6abff20d8ce0c26d7d`, `2026-10-28T05:48:27Z`, state MERGED | PR metadata |
| Exact-head CI | run `40639983508` (event `pull_request`, head `f722d7d`): **success**; job "typecheck · build · test" **pass** (53 s); check "executed test count" **pass** | `gh pr checks 100`; `gh run list` |
| Post-merge CI | run `40640127958` (event `push`, head `a891802e`): **success** | `gh run list --branch main` |
| Files | 2: `src/persistence/gateAPrimeProvisioning.ts`; `tests/g3_gate_a_prime_successor_provisioning.test.ts`; `527` insertions, `6` deletions vs `888eb375` | `git diff --stat` |
| Blob change | `gateAPrimeProvisioning.ts` `2cbce83f…` (`001c3c80`) → `5f49936b…` (`f722d7d`). `provisioning.ts` (`dc844189…`) and `binding.ts` (`96d0079d…`) **unchanged** | `git rev-parse` |
| Dist set | D2 changes **no** `dist` file. The H-12 runtime dist count (1,140) was **not** re-measured in this pass | diff file list |

### 2.2 Factual description of the receipt change (no judgment of correctness)

- `GateAPrimeExecutionResult` gains `executingCommit` and `executingTree` (`gateAPrimeProvisioning.ts` lines ~103–104, ~123–124), separate from `basisCommit` / `basisTree`.
- `readExecutionHead(repoRoot, env)` reads the executing HEAD and tree, with a 40-hex check, and refuses with `EXECUTING_HEAD_UNRESOLVED` (lines ~211–220).
- New arguments `--repo-root`, `--execution-commit`, `--execution-tree`; mismatch refuses with `EXECUTION_PIN_MISMATCH` (lines ~228–249, ~421–424).
- Audit detail remains `{ tenantId, canonicalOwnerId }` (line ~487). Persistence logic is not changed by the diff.
- Tests: names `T-10` (line 426), `T-11` (469), `T-12` (538), `T-13` (559) are present by name. The header comment of the test file (line 10) states "T-10…T-15"; **no `T-14` or `T-15` test name was found** in this pass. This is recorded as a discrepancy for the IPD owner to reconcile. It is not a finding on D2's sufficiency.

### 2.3 Delta from the DA-A1 candidate

| Measure | Value |
|---|---|
| Commits from `001c3c80` to `f722d7d` (exclusive of `001c3c80`) | **18** (17 on `main` plus D2) |
| Files changed `001c3c80..f722d7d` | **62**: 60 under `evidence/cross-repository/` (documentation and evidence only) and **2** runtime or test files (D2's two files) |
| Runtime `src/` change in that range | `gateAPrimeProvisioning.ts` only (D2). No other `src/` file changed between `001c3c80` and `f722d7d` |
| Compiled-basis constants | unchanged (`gateAPrimeValidation.ts` not in the delta) |

### 2.4 §4.6 pin-selection status (adopted rule; `IIPS_v3.0_CAP03_P1_PA_FORMAL_DECISION_RECORD_2026-10-28.md` §4.6)

| Step | Requirement | Status at this record |
|---|---|---|
| 1 | Commit on IPD `main` with green CI | **Evidence present** for `a891802e` (post-merge `40640127958`) and `f722d7d` (`40639983508`). Recorded; **not a designation** |
| 2 | Delta classified | **Factual classification given in §2.3.** Acceptance of the delta is a PA question (§7.B). Not performed as an IPD review |
| 3 | Designated tests at the candidate | **Not designated.** CI passed at `f722d7d` but no designation names the test set that the PA would accept |
| 4 | Separate PA designation act naming commit, tree, blob identities, purpose | **NOT RENDERED** |
| 5 | Fresh S2 (L2a) and H-12 (L2c) at the designated commit | **NOT STARTED**; no designation exists to run them against |

---

## 3. Authoritative statements corrected by additive pointer (no historical text rewritten)

The following statements were accurate on the date they were written. D2 landing makes their **existence** statements stale. Their **designation** statements remain accurate: no commit is designated.

| Record | Stale statement (quoted in part) | Corrected position |
|---|---|---|
| Formal decision record (`…_FORMAL_DECISION_RECORD_2026-10-28.md`) | L2a: "The post-correction commit `C′` … **Does not yet exist**" (line ~101); PA-5 resulting pin "**Not existing**" (lines ~219, ~254–278) | `C′` **candidate exists** on IPD `main` (`f722d7d` / `a891802e`). **Not designated.** Pointer appended (§8) |
| PA status matrix (`…_PA_STATUS_MATRIX_2026-10-28.md`) §11, PA-5 row | "`C′` not existing" | Same correction. Pointer appended as matrix §12 |
| Consolidated package (`…_CONSOLIDATED_DECISION_PACKAGE_2026-10-28.md`) | P2-C "Commit not yet created" (line ~101); "changes the execution commit … to `C′`" (line ~115) | Existence corrected; designation unchanged. Pointer appended |
| Tracker §16.165.6 | "`C′` (**not existing**; identity recorded only after it exists)" | Corrected in §16.166.3 |
| D2 handoff (`…D2_IPD_RECEIPT_HANDOFF_2026-10-28.md`, blob `74939dc6`) and IPD execution prompt | Pre-implementation instructions | **Historical; unchanged.** The receipt is recorded in §16.166.2 |
| Procedure (`…FRESH_CAPTURE_PROCEDURE_2026-10-27.md`, rev `2026-10-28c`) | Execution pin of record `001c3c80` (DA-A1) and step-0 hashes at `001c3c80` (lines ~413–415) | **Not changed.** These are correct for the DA-A1 candidate and are stale for any `C′` only once `C′` is designated (§7.B). No procedure edit is published without a designation |

---

## 4. P-1-C — preflight and capture integrity (`NOT ESTABLISHED`)

**Governing requirement.** A **complete raw capture of successor §8 step 0 and PF-01…PF-10, plus PF-14, PF-16, PF-17, taken in the attempt session immediately before the intended attempt, on `DESKTOP-NO0NHTP`, with an independent byte read-back** (tracker §16.140.4, §16.151). Any failure is STOP. Repository evidence cannot close P-1-C.

**Source for every status below:** the authoritative table in `IIPS_v3.0_CAP03_P1C_P1D_HOST_EVIDENCE_RECONCILIATION_2026-10-27.md` §5.2, re-read in this pass against the 2026-10-26 raw capture directory (`evidence/integration-/cap03-p1-reconcile-20261026T201328Z/`, files 00–08 and 98–99). Repository-side checks made in this pass are marked **[R]**.

| Item | Requirement (short) | Evidence now | Status | Gap | Next permissible action |
|---|---|---|---|---|---|
| PF-01 | `hostname` = `desktop-no0nhtp` | 10-26 capture reported `DESKTOP-NO0NHTP` | Satisfied at reported capture; **not read back** | Raw bytes and read-back; attempt-session observation | Attempt-session capture (host; needs capture authority) |
| PF-02 | Windows 11 Home Single Language | Not in supplied summary | **NOT EVIDENCED** | Observation | Same |
| PF-03 | Non-elevated; account SID recorded | Reported `DESKTOP-NO0NHTP\USER`, SID `S-1-5-21-1872737340-673410177-2240931581-1001` | Satisfied at reported capture; **not read back** | Raw read-back | Same |
| PF-04 | `win32`; Node `>=22.13.0 <23` | Not in supplied summary | **NOT EVIDENCED** | Observation | Same |
| PF-05 | Flag-free `node:sqlite`; full output verbatim | Not in supplied summary. **[R]** the published v2 instrument's probe (`191f5828`, line 66) is flag-free as written: `node --input-type=module -e` importing `node:sqlite` | **NOT EVIDENCED** for the host | Host run | Same |
| PF-06 | Invoked Node path; no install or switch | Not in supplied summary | **NOT EVIDENCED** | Observation | Same |
| PF-07 | Clean full-history IPD checkout at the §16.143 pin `001c3c80` / `399fa44a` | No pin observation. Prior capture was an affirmative **wrong pin** (`8eec74ae` / `4eba2902`) | **UNVERIFIED — prior mismatch not cured** | Depends on the execution-pin designation (§7.B). A host checkout at `001c3c80` cannot be recorded as the attempt pin until PA resolves §7.B | PA decision §7.B first |
| PF-08 | IRR clean at R1 `ba64b2d5…` / `5e4262f1…` | Not in supplied summary. **[R]** R1 is an ancestor of IRR `main` and is the §16.122.7 designation | **NOT EVIDENCED** on host | Host observation of a clean consumer worktree at R1 | Host observation (attempt session) |
| PF-09 | `is-shallow-repository=false` (IPD) | Not in supplied summary | **NOT EVIDENCED** | Observation | Host observation |
| PF-10 | Write and binding flags and `GATE_A_PRIME_*` absent | Not in supplied summary. **[R] Mismatch:** the procedure's PF-10 step (line ~148) checks the four names **and** `GATE_A_PRIME_*`; the published v2 instrument (line 93) checks **only the four names** | **NOT EVIDENCED**; **instrument–procedure coverage mismatch** | The `GATE_A_PRIME_*` family is not checked by the published instrument | Record in §7.D. Correction needs a new instrument version (DB-B1) or a procedure correction; neither is made here |
| PF-14 | Evidence root absolute, writable, outside every worktree, non-synchronized, not the store path | Reported root `C:\IIPS-EVIDENCE\cap03-p1-20261027-02`. Published default `D:\iips-evidence\cap03-p1-20261027-01`; F5 `C:\iips-evidence\cap03-gate4`. **No property transcript** | **INSUFFICIENT** | Root-property transcript; documented deviation from the default | Attempt-session transcript; operator documents the chosen root |
| PF-15 | Effective designation read verbatim | PF-15 corrected act (`IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md`, blob `3fe9a2dd…`, 11,860 B). **[R]** blob re-read in IRR tree; F4 literal `C:\iips-data\iips\user-portfolio.sqlite` | **SATISFIED (repository-side)** | None for the designation text itself. Its host-side properties are P-1-D (§5) | None |
| PF-16 | Exact act IDs, pins, store, order, digests; successor §8 step-0 source hashes | **[R]** step-0 hashes at `001c3c80` recomputed and match procedure lines 413–415 (`gateAPrimeProvisioning.ts` `2cbce83f…`, `provisioning.ts` `dc844189…`, `binding.ts` `96d0079d…`). **[R]** at `f722d7d` the first differs (`5f49936b…`). The act's own table lists 12 blobs (§6); 2 do not match at either commit | **UNVERIFIED** | Pin designation (§7.B) and the blob conflict (§7.A) | PA decisions §7.A and §7.B |
| PF-17 | Single attempt, unspent | Register limb: **VERIFIED** (tracker §16.160.4; no `--mode=execute`, no receipt, no store). Capture limb: no consumption-register observation line | Register limb **VERIFIED**; capture limb **NOT EVIDENCED** | Dedicated register observation in the attempt session | Attempt-session observation |
| Capture envelope | Reproducible generator and raw verdicts | Reported generator SHA-256 `B5D58F7F…` ≠ the reference `85AC7271…` used by the host reconciliation (blob `eaea3f7f`, the v1 instrument; **[R]** re-hashed this pass). The published v2 instrument (`191f5828`) is `13783385…`. No `STOP.txt`. **Zero raw bytes** received by Arena | **INSUFFICIENT** | Published generator for the capture; raw bytes; reproducibility | Publish or reuse a reproducible generator, then attempt-session capture |
| Session freshness and read-back | Complete raw capture immediately before the intended attempt; independent byte read-back | `cap03-p1-20261027-02` exists; no UTC timestamps, no declared attempt session, no raw bytes, no read-back | **NOT ESTABLISHED** | All of the above | Attempt-session capture under separate authority |
| Successor §8 step 0 | Source hashes of the designated source set before invocation | Procedure checks **3** files. Act §8.2 stops on **any** designated blob difference (12 designated). Scope mismatch (§7.D) | **INSUFFICIENT (scope)** | Step-0 scope | §7.D after §7.A and §7.B |

**P-1-C conclusion: `NOT ESTABLISHED`.** Existing evidence is historical (10-26 and 10-27 captures), session-bound, unread-back, or unpublished in generator form. None of it is a complete attempt-session capture. Historical captures do not satisfy a future attempt.

---

## 5. P-1-D — F4 store and parent (`DESIGNATED; NOT VERIFIED FOR THE ATTEMPT`)

**Designation.** The PF-15 corrected act (`3fe9a2dd…`) designates F4 `C:\iips-data\iips\user-portfolio.sqlite` (39 bytes, SHA-256 `4c8da37b…`, verified literal in the prior pass). **F5 `C:\iips-evidence\cap03-gate4` is not the P-1 store.** The designation is effective only on its publication conditions and is a store identity, not an execution pin.

**Identity.** Artifact: the F4 path and its SHA-256 (above). Receipt: the 10-26 capture (historical; unaccepted; `99-final-verdict.txt` states "PREFLIGHT CAPTURED — NOT AUTHORIZATION TO EXECUTE P-1"). The attempt directory `D:\iips-evidence\cap03-p1-20261027T110433Z-…` is preserved, not accessed, and not accepted (§16.154.1).

**Applicability.** The designation applies to the intended attempt only if the attempt-session observations below are made in that session.

| Limb | Exact criterion | Evidence now | Status | Gap |
|---|---|---|---|---|
| F4 identity | Effective PF-15 F4, verbatim | Act `3fe9a2dd…` re-read | **SATISFIED (repository-side)** | None |
| Local fixed NTFS | Local, fixed NTFS volume | 10-26 capture: `C:` `FileSystemType: NTFS`, `DriveType: Fixed`; ancestors not reparse points | Satisfied at reported capture; **not read back** | Raw transcript; attempt session |
| Outside every Git worktree | No `.git` on `C:\iips-data\iips`, `C:\iips-data`, `C:\` | Walk reached `C:\` without error. **No per-ancestor `.git` result.** The worktree inventory is scoped to the enumerated IPD/IRR worktrees (`OutsideEnumeratedIPDIRRWorktrees=True`; the capture states it does not assert exclusion from other repositories) | **INSUFFICIENT** | Explicit per-ancestor `.git` result (`InsideGitWorktree=False`) |
| Non-synchronized, non-network | Not a synced folder; not network | Outside the configured `C:\Users\USER\OneDrive`; `C:` fixed local; no reparse point. Other sync clients not evidenced | Satisfied at reported capture; **not read back** | Raw transcript; sync-client attestation (§7.C item 3) |
| Writable without elevation | Operator-writable, non-elevated | `Authenticated Users` → `Modify, Synchronize` reported; identity is a member and non-elevated. **No effective-access probe** in the published instrument. See §7.C | **Method unresolved** (§7.C) | Verification method decision |
| Store and sidecars absent (PF-12) | `Test-Path = False` verbatim for store, `-wal`, `-shm`, `-journal` | 10-26 capture (file 06): all four `False`; `StoreParentExists=True` | Satisfied at capture; **session-bound**; must be re-observed in the attempt session | Re-observation |
| PF-13 / `DISP-01` | Nearest existing ancestor local fixed NTFS, non-synced; parent need not pre-exist | Nearest existing ancestor `C:\iips-data\iips` | Satisfied at reported capture under `DISP-01`; **not read back**. Existence of the parent is not a STOP | Read-back |
| Directory provenance | Not a criterion | Creation dates `2026-10-26`; creator unknown | **Recorded as unknown**; immaterial to the criteria | None |
| Validator no-create | Validation must not create a store | **[R]** `validateStoreAtPath` pre-checks existence (`STORE_NOT_FOUND`), then opens `new DatabaseSync(path, { readOnly: true })`. It cannot create the store | **Confirmed** | None |
| Attempt-session declaration and timestamp | Declared session; UTC timestamps | None | **NOT ESTABLISHED** | Attempt-session declaration |
| Independent read-back | Raw bytes read back independently | None | **NOT ESTABLISHED** | Read-back |

**P-1-D conclusion: `DESIGNATED; NOT VERIFIED FOR THE ATTEMPT`.** The F4 designation is stable. The F4 host limbs are supported at the reported capture but are session-bound and not read back. Three limbs are open: the per-ancestor `.git` result, the sync attestation, and the writability method.

---

## 6. Designated blob and step-0 matrix (act §2.1 / §8.2 versus IPD lineage)

Verified this pass against `001c3c80` (DA-A1 candidate) and `a891802e` (`main`). The act's designated table has 12 rows (4 of them "new" or "modified (bounded)").

| # | Path | Act-designated blob | At `001c3c80` | At `a891802e` | Result | History on the main lineage |
|---|---|---|---|---|---|---|
| 1 | `src/persistence/provisioning.ts` | `dc844189` | `dc844189` | `dc844189` | MATCH | unchanged |
| 2 | `src/persistence/binding.ts` | `96d0079d` | `96d0079d` | `96d0079d` | MATCH | unchanged |
| 3 | `src/persistence/audit.ts` | `273ccd3b` | `273ccd3b` | `273ccd3b` | MATCH | — |
| 4 | `src/persistence/connection.ts` | `5169e402` | `5169e402` | `5169e402` | MATCH | — |
| 5 | `…/migrations/001_initial_schema.ts` | `f594a182` | `f594a182` | `f594a182` | MATCH | — |
| 6 | `…/migrations/002_audit_event_sequence.ts` | `932af8e6` | `932af8e6` | `932af8e6` | MATCH | — |
| 7 | `…/migrations/003_local_principal_bindings.ts` | `32b125bf` | `32b125bf` | `32b125bf` | MATCH | — |
| 8 | `…/migrations/004_portfolio_contribution_provenance.ts` | `6bad5a50` | `6bad5a50` | `6bad5a50` | MATCH | — |
| 9 | `src/ipc/dispatch.ts` | `27becc76` | `27becc76` | `27becc76` | MATCH | — |
| 10 | `src/persistence/portfolio_store.ts` | **`4a005b73`** | **`540d49f2`** | **`540d49f2`** | **DIFF** | `4a005b73` carried only by `95f1dcc` (`2026-10-23`, "feat(cap02): implement governed U2 broker import boundary"). Replaced by `bc144b9` (`2026-10-25`, "feat(cap03): implement DR-2 Option A IPD provider read envelope", 274-line change to this file), which is an ancestor of `001c3c80` |
| 11 | `package.json` | `51796e63` | `51796e63` | `51796e63` | MATCH | — |
| 12 | `tests/g3_startup_validation.test.ts` | **`9a5fd9e3`** | **`edd0305e`** | **`edd0305e`** | **DIFF** | `9a5fd9e3` carried by `673ec75` (`2026-10-20`). `edd0305e` introduced by `c62dee8` (`2026-10-23`, "CAP-02: implement bounded Gate A prime and Limb A work"). `edd0305e` contains the bounded import-edge regression for `gateAPrimeProvisioning` / `provisioning` (line ~352). `9514e4ce` (`5412330`, `2026-10-22`) is **not** on `main` |
| — | `src/persistence/gateAPrimeProvisioning.ts` (act "new") | not designated | `2cbce83f` (procedure step 0) | `5f49936b` (D2 `f722d7d` and `main`) | Changed by D2 | Procedure step-0 hash is stale for any `C′` |
| — | `src/persistence/gateAPrimeValidation.ts` (act "new") | not designated | (file present) | (file present) | — | Holds `BASIS_COMMIT` / `BASIS_TREE` constants |

**Observations.**
- The act's table lists a **pre-implementation** blob for the g3 test (`9a5fd9e3`, `673ec75`). The act's own §5.1 item 4 contemplates a bounded addition to that file. The addition is present in `edd0305e`. The act therefore does not designate the post-addition blob it contemplates.
- `portfolio_store.ts` changed on the main lineage **after** the act's table was written (`bc144b9`, `2026-10-25`; the act is effective `2026-10-23`). Under the act's own §5.1, changes to `portfolio_store.ts` are prohibited "without a further act." That prohibition applies to the successor work, and the `bc144b9` change is not the successor work. Whether the act is amended or the blob is held is a PA question (§7.A).
- **[R]** On the IPD `main` lineage, `portfolio_store.ts` carries `4a005b73` only from `95f1dcc` up to, but not including, `bc144b9` (no other path-touching commit carries that blob). Every commit that descends from `bc144b9`, including `001c3c80` and `a891802e`, carries `540d49f2`. No such descendant can satisfy §8.2 for that path.

---

## 7. Reserved PA decision packets

No option below is selected. Each packet lists the authoritative text, the facts, the options, and the consequences. Routine global approval is not a substitute for any of them.

### 7.A — Designated-blob conflict and the §8.2 stop rule (`portfolio_store.ts`; g3 startup test; S1 §12.2)

**Governing text.**
- Successor act (IPD `evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md`, blob `528de6ae…`, identical at `001c3c80` and `a891802e`): §2.1 designates 12 blobs; §5.1 is the exhaustive file set and prohibits change to "any existing `src/` module (including … `portfolio_store.ts` …)" without a further act; §8.2 stops "if … any designated blob differs."
- S1 identity determination (IPD `evidence/cross-repository/IIPS_V3_CAP02_S1_IDENTITY_VALUE_DETERMINATION_EFFECTIVE_2026-10-24.md`), §12.2: "`12/12` of the successor act §2.1 paths resolve as designated" while listing `tests/g3_startup_validation.test.ts` as `edd0305e…` and `portfolio_store.ts` as `4a005b73…`. **The §12.2 statement is internally inconsistent**: `edd0305e` is not the act's designated blob.
- Procedure step 0 (lines ~413–415) checks **3** files. It does not cover the act's 12-blob designated set. The procedure is narrower than §8.2.

**Existing decisions.** None of the adopted or formal records (DA-A1, DB-B1, DC-C2, PA-1, PA-2, PA-5, PA-3d) disposes of the blob table. The adoption reconciliation (D1–D5) does not address it. **The conflict is unresolved under existing authority.**

**Options (not selected).**

| Option | Description | Consequences | Requires |
|---|---|---|---|
| **A-1 Amend the act's designation** | Re-designate `portfolio_store.ts` at the blob of the chosen execution commit (`540d49f2…` on the current lineage) and the g3 test at its post-addition blob (`edd0305e…`), with an express acceptance of the `bc144b9` change. Extend step 0 to every designated blob at the designated commit | Amends a rendered act. Changes the §8.2 comparison set. The S1 §12.2 correction is an IPD-side determination (separate IPD pass). Step 0 in the procedure changes once the designation is made (§7.D) | PA act (amendment) |
| **A-2 Retain the act as rendered** | `4a005b73` can match only in commits before `bc144b9` on the main lineage. None of those carries the DA-A1 candidate or a PA-5 receipt | Effectively requires a **different execution commit** (before `bc144b9`), which conflicts with the DA-A1 lineage and the PA-5 receipt element. Under A-2 the P-1 attempt cannot proceed on the current lineage | PA act (new pin) and a receipt ruling |
| **A-3 Hold** | Make no blob or pin decision. P-1 stays NOT AUTHORIZED | No consequence beyond delay; PF-16 and step 0 stay open | None |

**Minimum change for A-1 (if chosen):** a new amendment paragraph replacing rows 10 and 12 of §2.1, a stated acceptance scope, and an extension of §8.2 step 0 to all designated blobs. No IRR procedure edit before the designation.

### 7.B — Execution identity: `001c3c80` (DA-A1) versus a D2-based commit `C′` (PA-5 Option B; formal record §4.6)

**Facts.**
- **DA-A1 receipt element is unmet at `001c3c80`.** The receipt code at `001c3c80` is byte-identical to `888eb375` (`gateAPrimeProvisioning.ts` `2cbce83f…`). It records no executing identity. (Verified this pass.)
- **D2 (`f722d7d`) implements the PA-5 Option B receipt.** It changes only `gateAPrimeProvisioning.ts` and the g3 test. Its CI at the PR head and on `main` passed.
- **Two commits share one tree.** `f722d7d` (tree `76f083d7…`) and `a891802e` (merge, tree `76f083d7…`) are different commits with the same tree. Equal trees are not interchangeable commit identities. A designation names a commit.
- **The compiled basis is unchanged** (`5fc74085…` / `7226ef00…`).
- **Delta from the candidate:** 18 commits, 62 files (§2.3).

**Options (not selected).**

| Option | Identity | Consequences | Requires |
|---|---|---|---|
| **E-0 Retain `001c3c80`** | Commit `001c3c80…`, tree `399fa44a…` | The PA-5 / DA-A1 receipt element stays unmet. A PA ruling on that element is required (DA-A1 amended, or the receipt element deferred). Host capture at `001c3c80` then becomes the pin of record for PF-07 and PF-16 | PA ruling on the receipt element |
| **E-1 Designate `f722d7d`** | Commit `f722d7d46e056d4eb3039e9d3df8045b1cce4e1c`, tree `76f083d7058e170d8212455c03bad1033136ee68` | §4.6 steps 2–5 required (§2.4). Step-0 table at the designated commit (`gateAPrimeProvisioning.ts` `5f49936b…`). Fresh S2 (L2a) and H-12 (L2c). Act blob conflict resolved first (§7.A) | PA designation act under §4.6 |
| **E-2 Designate `a891802e`** | Commit `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` (merge), tree `76f083d7…` | Same as E-1 with the merge commit. The directive forbids choosing a commit because it is newer. The record has no basis to prefer the merge over the PR head | PA designation act under §4.6 |
| **E-3 Defer** | None | P-1 remains NOT AUTHORIZED. Gate 4 QE/H-12 pin remains undesignated (dependent choice, formal record §4.5) | None |

**Dependent choice (not made here).** The IPD Gate 4 QE/H-12 pin is a dependent scope choice: C-1 (accept the post-binding commit with express scope acceptance), C-2 (Limb A-only commit, new authority), or C-3 (defer). **It is not designated by this record and must not be designated as a side effect of E-1 or E-2.**

**Open question for PA.** Whether host verification of PF-07 / PF-16 may precede any `C′` designation. The record does not decide it. Until it is decided, the host checkout cannot be fixed to a commit.

### 7.C — Write-access verification method for the "operator-writable without elevation" limb

**Facts.**
- Criterion (IPD host-readiness packet and F4 reconciliation): "operator-writable without elevation."
- Published v2 instrument (`evidence/integration/cap03-pf11-root-safe-correction-2026-10-27/02-…-v2.ps1`, SHA-256 `13783385…`): its header states it "creates nothing inside any Git worktree; writes only under `$EvidenceRoot`" (line 12). Its writability check is a **read-only ACL dump** (`Get-Acl`, line 164). **It has no effective-access probe.**
- Historical REV2 generator (SHA-256 `CB7E674E…`, `C:\Users\USER\Downloads\CAP03_P1_ReadOnly_Preflight_Reconciliation_REV2.ps1`): **not published** in any repository ref. Its 10-26 output (file 06) records `EffectiveWriteProbe=PASS`, `WriteProbeCleanup=PASS`, `ProbeFileRemains=False`. **The probe location is not stated.** It cannot be reproduced from the repository.
- The 10-26 DACL (`Authenticated Users` → `Modify, Synchronize`) is strong non-mutating support but is not an effective-access result.

**Options (not selected).**

| Option | Description | Consequences |
|---|---|---|
| **W-1 ACL inspection as sufficient** | Accept the v2 `Get-Acl` dump plus identity and group analysis as satisfying the criterion | Non-mutating. The record already states this is not an effective-access probe; PA must accept that gap explicitly |
| **W-2 Published non-mutating effective-rights check** | Evaluate the store-parent DACL against the attempt account's token groups in a published instrument revision, with raw output verbatim. No file is created | Needs a new instrument revision (DB-B1 identity change) and a host run under capture authority. Non-mutating. **Recommended for PA's consideration** |
| **W-3 Create-and-remove probe** | Create and remove a uniquely named sentinel in the evidence root or parent, with before and after observation | **Mutates** a directory. If it targets the P-1 store parent, it writes into that parent, which the v2 check design (read-only, line 164) does not do. Requires express PA authorization and a proven no-leftover read-back |
| **W-4 Rely on the 10-26 REV2 probe** | Treat `EffectiveWriteProbe=PASS` as the evidence | **Not verifiable**: the generator is unpublished, the probe location is unstated, and no transcript is in a repository ref. **Not recommended as sole evidence** |

**Recommendation (decision-ready, not a decision).** Prefer **W-2** for the method, retaining W-1 only as supporting evidence. Do not rely on **W-4**. Use **W-3** only if PA declines W-2 and expressly authorizes a bounded probe.

### 7.D — Step-0 scope and procedure revision (dependent on §7.A and §7.B)

- The procedure's step 0 covers 3 files (lines ~413–415). Act §8.2 covers the designated set. The procedure is narrower than the act.
- The procedure's PF-10 check (line ~148, includes `GATE_A_PRIME_*`) is broader than the published v2 instrument's flag list (line 93, four names). **Mismatch recorded.**
- **No procedure edit is published by this record.** After §7.A and §7.B are decided, a procedure revision (additive, same pattern as rev `2026-10-28c`) can align step 0 to the designated set and designated commit, and align the PF-10 coverage.

---

## 8. Evidence establishable now versus blocked

| Item | Establishable now (repository) | Blocked on |
|---|---|---|
| IPD D2 publication receipt; CI | **Yes** (recorded §2; §16.166.2) | — |
| Delta classification (§4.6 step 2, factual) | **Yes** (§2.3) | PA acceptance (§7.B) |
| Designated-blob matrix (12 blobs) and history | **Yes** (§6) | PA decision §7.A |
| Step-0 hashes at `001c3c80` and `f722d7d` | **Yes** (recomputed) | Designation (§7.B) before any hash is "the pin" |
| F4 designation (PF-15) | **Yes** (repository-side) | — |
| F4 host limbs (ancestor `.git`, sync attestation, writability) | **No** (host-dependent, session-bound) | §7.C; attempt-session observation under capture authority |
| PF-01…PF-10, PF-14, PF-16, PF-17 capture | **No** | Capture authorization (separate PA act); designation (§7.B); attempt-session capture |
| Independent read-back of raw bytes | **No** | Capture |
| A6 runtime test | **No** | Host with `pwsh` and authorization (`NOT RUN`) |
| V1102 host checks | **No** | Host authorization (PA-3d deferred; V1102 **OPEN**) |
| PF-11 native run `92d931fb` | **No** (`NOT PASSED`; undiagnosed; not reopened) | Separate authority |
| S2 (L2a), H-12 (L2c) at a designated commit | **No** | §7.B designation; S2 authorization |
| Gate 4 QE/H-12 pin | **No** (undesignated) | Dependent choice C-1 / C-2 / C-3 |

**Answer to "does verification of P-1-D have to wait for the D2 output?"** The D2 output **exists** on `main` (`f722d7d`; `a891802e`). The P-1-D designation is **not** blocked on that existence. The **attempt-level** verification is blocked on a PA **execution-commit designation** (§7.B), because PF-07, PF-16, and step 0 are commit-keyed; on the **blob decision** (§7.A); and on the **write-access method** (§7.C). The F4 store and parent limbs are commit-independent, but PA must decide whether they may be observed before a designation (§7.B open question).

---

## 9. Minimal next-step sequence (dependency order)

1. **PA decides §7.A** (designated-blob disposition: A-1 amend, A-2 retain with a receipt ruling, or A-3 hold).
2. **PA decides §7.B** (execution commit: E-0, E-1, E-2, or E-3; and whether host verification may precede designation). The Gate 4 QE/H-12 pin is decided separately (C-1 / C-2 / C-3) and is not a side effect.
3. **If a commit is designated:** IPD-side §4.6 step 3 (designated tests at the candidate) and the S1 §12.2 correction, as a separate IPD pass. The IPD test-file header discrepancy (`T-10…T-15` versus names `T-10`–`T-13`) goes to the IPD owner. IRR does not write to IPD.
4. **PA designation act** (§4.6 step 4) naming commit, tree, blob identities, and purpose.
5. **Fresh S2 (L2a) and H-12 (L2c)** at the designated commit (§4.6 step 5). Each needs its own authorization where it involves host execution.
6. **IRR procedure revision** (additive, after steps 1–5): execution pin, PF-07 / PF-08 expectations, step-0 table and scope (§7.D), PF-10 coverage.
7. **PA decides §7.C** (write-access method). If W-2 is chosen, the published instrument revision follows under DB-B1 and is reviewed in IRR.
8. **Capture authorization** (separate PA act; matrix row 82 remains BLOCKED until rendered).
9. **Attempt-session capture** on `DESKTOP-NO0NHTP`: full PF list, raw bytes, read-back, PF-14 root properties, PF-12 re-observation, PF-17 register line, and the per-ancestor `.git` result.
10. **P-1-C / P-1-D acceptance review** (IRR) on that capture only.
11. **P-1 authorization act** (§5.5 and §4.6 met; not rendered). P-1 remains NOT AUTHORIZED until then.

Parallel and independent: the A6 runtime test, V1102, and the PF-11 native diagnosis remain separate and are not advanced by this record.

---

## 10. Non-grants and confirmation

- No PA decision, designation, approval, or signature is made or implied. §7 lists options only.
- No execution pin, Gate 4 QE/H-12 pin, or `C′` is designated. No commit or tree is invented.
- No change to `BASIS_COMMIT` or `BASIS_TREE`. No change to the compiled basis.
- No procedure edit. No change to the successor act, S1, PF-15 act, or any historical record other than the additive pointers in §8 of this record and the tracker.
- No capture, host preflight, PowerShell, `pwsh`, PF-11 rerun, V1102, A6 runtime test, compatibility script, host diagnostic, database open, or store probe was executed.
- No IPD write. IPD `main` was observed read-only.
- No S3, S2, QE, DQ-4, Gate 4, Gate 5, H-12, or PF-17 movement.
- P-1-C remains **NOT ESTABLISHED**. P-1-D remains **DESIGNATED; NOT VERIFIED FOR THE ATTEMPT**. P-1 remains **NOT EXECUTED / UNSPENT / NOT AUTHORIZED**.

*End of record `IIPS-V3-CAP03-P1C-P1D-RECONCILIATION-PA-PACKET-2026-10-28-01`. Tracker §16.166 (`CV-CORR-146`; `CHG-2026-10-28-09`; `V1153`–`V1160`).*
