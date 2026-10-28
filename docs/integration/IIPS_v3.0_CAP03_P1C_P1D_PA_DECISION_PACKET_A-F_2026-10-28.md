# CAP-03 P-1-C / P-1-D — IRR-Owned PA Decision Packet A–F, Dependency Plan, and IRR Execution Checklist (`2026-10-28`)

> **STATUS: DECISION PACKET ONLY. NO DECISION IS MADE OR IMPLIED. P-1 IS NOT EXECUTED / UNSPENT / NOT AUTHORIZED.**
> **P-1-C = NOT ESTABLISHED. P-1-D = DESIGNATED; NOT VERIFIED FOR THE ATTEMPT.**
>
> This record restructures the reserved matters of the one-pass reconciliation (`IIPS-V3-CAP03-P1C-P1D-RECONCILIATION-PA-PACKET-2026-10-28-01`, §§4–7) into six decision matters **A–F**. For each matter it separates source-supported facts, IRR recommendations, and unresolved questions. It does not select any option, designate any commit, approve any capture, or render any authorization. Recommendations are labelled as such and are for PA's consideration only.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP03-P1C-P1D-PA-DECISION-PACKET-AF-2026-10-28-01` |
| **Tracker** | §16.167 (`CV-CORR-147`, `CHG-2026-10-28-11`, `V1165`–`V1172`) |
| **Builds on** | `IIPS_v3.0_CAP03_P1C_P1D_ONE_PASS_RECONCILIATION_AND_PA_PACKET_2026-10-28.md` (§§2–7 and §11 addendum) |
| **Repository ownership** | IRR owns this record, the procedure, the tracker, and any IRR-published instrument revision. **IPD owns** the D2 final identity, the S1 §12.2 correction, any test-coverage change, and any IPD commit. IRR does not write to IPD. |

---

## 0. Verified state at the start of this pass (read-only)

| Item | Value | Verification |
|---|---|---|
| IRR `main` | `bb644a9877f7a13775253c7aee02632e937418db` (PR #347 merge; post-merge CI `40642779744` SUCCESS) | `git ls-remote`, `gh run list` |
| IRR open PRs | none | `gh pr list --state open` |
| IRR session branch | `arena/fa962375-iips-review-recovered` at `bb644a98`; worktree clean | `git status`, `git rev-list --count` (0 ahead, 0 behind) |
| IPD `main` | `db84ac12f297eec2bb159ae785c3cc584f7d7e34` (tree `831f00e0…`; PR #101 merge). **Unchanged** since the last pass | `git ls-remote` (read-only) |
| IPD open PRs | none | `gh pr list --repo …` |
| Movement since `bb644a98` | **None** in either repository | above |

**Consequence.** The published reconciliation packet and tracker §16.166 / §16.166.7 are current. No stale identity was found. No re-investigation of the designated-blob table, the candidate pins, or the PF statuses was needed, because nothing moved.

---

## 1. Legend

- **Source-supported:** stated by an authoritative record or verified by a read-back at the identities in §0.
- **Recommendation:** an IRR view, labelled as such. It is not a decision and binds nothing.
- **Open:** a question that no existing authority answers. PA must decide it or accept the stated consequence of deferral.

---

## 2. Summary of decisions

| Matter | Question | Status | Blocks |
|---|---|---|---|
| **A** | Disposition of the designated-blob conflict (`portfolio_store.ts`; g3 startup test; S1 §12.2) | **RESERVED — OPEN** | Commit designation (B); step-0 scope; procedure revision |
| **B** | Execution-commit designation (L2a) or deferral; DA-A1 receipt element | **RESERVED — OPEN**; no final IPD identity reported | Any commit-keyed host observation; S2 (L2a) at designated commit; P-1 authorization |
| **C** | May any P-1-D host observation precede commit designation? | **RESERVED — OPEN** | Sequencing of host qualification and observation |
| **D** | Acceptable non-mutating effective-write verification method | **RESERVED — OPEN** | P-1-D "operator-writable" limb; any instrument revision |
| **E** | Capture authorization boundary and prerequisites | **NOT RENDERED**; prerequisites listed in §7 | Any host capture |
| **F** | Evidence required to accept P-1-C and P-1-D | **Specified** (§8); no acceptance | Any P-1 authorization |

---

## 3. Matter A — designated-blob disposition

### 3.1 Question
The successor act's §2.1 designates twelve blobs. Two do not match the candidate or `main`. Which disposition applies, and what is the stop rule for the comparison set?

### 3.2 Source-supported facts

| Item | Fact | Source |
|---|---|---|
| `portfolio_store.ts` | Act designates `4a005b73…`. Candidate `001c3c80`, `db84ac12`, and all descendants of `bc144b9` carry `540d49f2…`. `4a005b73` is carried only by `95f1dcc` (2026-10-23). It was replaced by `bc144b9` (2026-10-25, DR-2 Option A, +274 lines) | Act §2.1 row 10; IPD `git log -- path`; one-pass packet §6 (re-verified this pass) |
| Act §5.1 | The file set is exhaustive. It prohibits change to existing `src/` modules, including `portfolio_store.ts`, without a further act | Successor provisioning act (IPD `evidence/cross-repository/`, effective 2026-10-23); identical at `001c3c80` and `db84ac12` (read-only check this pass) |
| Act §8.2 | Stop if the basis commit/tree or any designated blob differs | Successor provisioning act §8.2 |
| g3 startup test | Act designates `9a5fd9e3…`, which is the pre-implementation blob (`673ec75`, 2026-10-20). `edd0305e…` (`c62dee8`, 2026-10-23, titled "bounded Gate A prime and Limb A work") is the post-addition blob. `9514e4ce` (`5412330`) is not on `main` | Act §2.1 row 12 and §5.1 item 4 (as read in this pass); IPD history |
| S1 §12.2 | Cited by the one-pass packet as the IPD-side correction point for the blob table. Its wording was **not re-read in this pass**; any correction is IPD-owned | One-pass packet §6; IPD S1 determination |
| Procedure step 0 | Checks **three** files at lines 413–415 (`gateAPrimeProvisioning.ts`, `provisioning.ts`, `binding.ts`). The act's comparison set is wider | Procedure lines 413–415 |
| Other ten designated blobs | Match at `001c3c80` and at `db84ac12` | One-pass packet §6; re-verified this pass |
| Existing decisions | None of DA-A1, DB-B1, DC-C2, PA-1, PA-2, PA-5, PA-3d, or the adoption records (D1–D5) disposes of the blob table | Formal record §§3–8; adoption reconciliation |

**Conclusion (source-supported):** the conflict is **unresolved under existing authority**. The §8.2 stop rule is currently triggered at both designated mismatches for any execution commit on the current lineage.

### 3.3 Options (for PA; none selected)

| Option | Description | Downstream work unlocked | Dependencies / consequences |
|---|---|---|---|
| **A-1 Amend the act** | A successor-act amendment re-designates row 10 at the chosen commit's `portfolio_store.ts` blob (`540d49f2…` on the current lineage) with an express acceptance of `bc144b9`. It re-designates row 12 at its post-addition blob (`edd0305e…`). It extends step 0 to every designated blob at the designated commit | Procedure step-0 table and scope (§10); S1 §12.2 correction (IPD pass) | Requires PA act. Needs B (commit) before the amended table can be final. Changes the §8.2 comparison set |
| **A-2 Retain as rendered** | Keep `4a005b73…`. It is matchable only at commits before `bc144b9` on the main lineage | None on the current lineage. Requires a different execution commit that predates `bc144b9`, which conflicts with DA-A1 and the PA-5 receipt element | Requires a new PA pin decision (B) and a receipt ruling. Not compatible with DA-A1 as recorded |
| **A-3 Hold** | No blob decision. P-1 stays not authorized | Nothing unlocked | Delays B, procedure revision, and E |

### 3.4 Recommendation (IRR; not a decision)
Of the three, **A-1** is the only option that keeps the DA-A1 lineage executable. It should be decided **together with B**, because the amended table must name the commit's actual blobs. Row 12 should name the post-addition blob, since §5.1 item 4 contemplates that addition. The acceptance of `bc144b9` should be stated expressly, as an accepted change, not as a silent difference.

### 3.5 Open questions for PA
1. Does `bc144b9` (DR-2 Option A, a CAP-03 change) fall inside the act's intended comparison set, or is it outside the act's scope because it is not successor work?
2. For row 12, is the designated blob the pre-addition blob (as written) or the post-addition blob (as §5.1 item 4 contemplates)? The act as written designates the former.
3. Is the S1 §12.2 correction an IPD-side determination or an IRR-side note? (Source: S1 is an IPD evidence document.)

---

## 4. Matter B — execution-commit designation or deferral

### 4.1 Question
Which IPD commit (if any) is designated as the L2a P-1 execution pin, and does the DA-A1 receipt element require a ruling?

### 4.2 Source-supported facts

| Item | Fact | Source |
|---|---|---|
| DA-A1 pin of record | `001c3c80618f2ee1d40e9a90912237e1a06e7b58` (tree `399fa44a…`). Used by the procedure at lines 77–78 | Procedure; §16.143 |
| DA-A1 receipt element | **Unmet at `001c3c80`.** The receipt code there is byte-identical to `888eb375` and records no executing identity | One-pass packet §7.B; formal record §§3–8 |
| D2 receipt correction (PA-5 Option B) | Implemented on IPD `main`. Initial PR #100 (`f722d7d`, tree `76f083d7…`; merge `a891802e`). Follow-up PR #101 (head `d2782f2`, tree `831f00e0…`; merge `db84ac12`). CI on each head and merge: SUCCESS | IPD `gh pr view 100/101`; `gh run list` |
| Candidate status | Both D2 commits on `main` are **candidates**. None is designated. The D2 final identity is **not reported** by any authoritative record as final | Session rule of record (one-pass packet): any designation names the commit the final IPD D2 pass reports; the identity is recorded only after it exists |
| Equal trees | `d2782f2` and `db84ac12` share tree `831f00e0…`. Equal trees are not interchangeable commit identities (rule of record) | Formal record §4.6; one-pass packet §7.B |
| Compiled basis | `5fc74085…` (tree `7226ef00…`), unchanged; constants in `gateAPrimeValidation.ts` (`df5d48a…`), unchanged | Verified this pass |
| Step-0 hashes (for any C′) | `gateAPrimeProvisioning.ts` is now `9b15eca…` at `db84ac12` (was `5f49936b…` at `f722d7d`, `2cbce83f…` at `001c3c80`). `provisioning.ts` `dc844189…` and `binding.ts` `96d0079d…` unchanged | Verified this pass |
| Designation rule | §4.6: (1) green CI on `main`; (2) delta classified; (3) designated tests at candidate; (4) separate PA designation act naming commit, tree, blob identities, and purpose; (5) fresh S2 (L2a) and H-12 (L2c) at the designated commit | Formal record §4.6 (adopted) |
| Delta classification (§4.6 step 2, factual) | `001c3c80..db84ac12`: 62 files. Runtime code: two files (`gateAPrimeProvisioning.ts`; the g3 successor test). Other 60: under `evidence/cross-repository/` | Read-only diff this pass |

### 4.3 Options (for PA; none selected)

| Option | Description | Downstream work unlocked | Dependencies / consequences |
|---|---|---|---|
| **B-0 Retain `001c3c80`** | Keep `001c3c80` / `399fa44a…` as the execution pin | Procedure keeps current pins (no pin edit); host observations keyed to `001c3c80` become attempt-pin observations | **Requires an explicit PA ruling** that the DA-A1 receipt element is waived or deferred, because `001c3c80` does not satisfy it. Also requires A-2 or a blob ruling. Not a silent default |
| **B-1 Designate a final D2 commit** | Designate one specific commit reported as final by the IPD pass (currently `db84ac12` merge or `d2782f2` head; the IPD pass may name another) | §4.6 steps 2–3 (IPD side); step 4 (PA act); step 5 (fresh S2 at that commit); step-0 table at that commit; procedure pin revision (§10) | Blocked until the IPD pass reports a final commit. Requires A (blob disposition). Requires express statement of which of the equal-tree commits is designated, with the reason stated in the act. **Recency is not a basis** |
| **B-2 Defer** | No designation. P-1 stays not authorized | Nothing unlocked on the execution side | Gate 4 QE/H-12 pin remains undesignated. Any host observation keyed to a commit (PF-07, PF-09, PF-16) is blocked |

### 4.4 Dependent choice (not made here)
The IPD Gate 4 QE/H-12 pin is a separate dependent choice: C-1 (post-binding commit with express scope acceptance), C-2 (Limb A-only commit, new authority), or C-3 (defer). **It must not be designated as a side effect of B-1.** Source: formal record §4.5.

### 4.5 Recommendation (IRR; not a decision)
Decide **A and B together**. If the IPD pass has not reported a final commit, B cannot be decided, and **B-2** is the only available option. Do not designate `db84ac12` or `d2782f2` merely because they are the current heads of `main`.

### 4.6 Open questions for PA
1. Has the IPD D2 pass reported a final execution commit? If not, is B-2 the accepted consequence until it does?
2. If B-0, does PA waive, defer, or amend the DA-A1 receipt element? Which record carries that ruling?
3. Is the §4.6 step-5 "fresh S2 (L2a) and H-12 (L2c)" requirement one bundled requirement or two? PA-1 (formal record §3.1) states H-12 adoption is not a precondition for P-1 provisioning. Step 5 as written names both. PA should state which evidence is a precondition for L2a.

---

## 5. Matter C — may any P-1-D host observation precede commit designation?

### 5.1 Question
P-1-D observations (store, parent, volume, sync, writability) do not depend on the IPD commit. PF-07, PF-09, PF-16, and step 0 do. Are the first permitted before the second?

### 5.2 Source-supported facts

| Item | Keyed to commit? | Source |
|---|---|---|
| F4 path, parent existence, store and sidecar absence (PF-12), NTFS/fixed (PF-13), sync status | No | PF status record; procedure §4.3 (lines 150–154) |
| PF-14 evidence root properties | No | Procedure lines 150–166 (§4.3) |
| PF-15 designation | No (designation text) | PF-15 act (F4 literal verified in the PF-15 act) |
| DC-a / DC-b engine check (§4.3a) | No, but **must run in the attempt session** and is read-only | Procedure lines 170–185 |
| A6 runtime test | **Scope not yet confirmed**: must run on host before any capture (formal record §7). Whether it depends on the commit is not stated | Formal record §7; procedure §6.3 (`V1141` records that PowerShell parse/run is NOT RUN) |
| PF-07 (IPD checkout at the designated pin) | **Yes** | Procedure lines 77–78, 121, 405 |
| PF-09 (IPD `is-shallow-repository=false`) | **Yes** (IPD checkout) | PF status record |
| PF-08 (IRR consumer at R1 `ba64b2d5…`) | No. R1 is an IRR designation, not an IPD commit | Tracker §16.122.7; procedure lines 79–80 |
| PF-16 and step 0 | **Yes** | Procedure lines 413–417 |
| PF-17 register | No, but must be read **immediately before invocation** | Procedure §4.4 |
| V1102 (DC-a and DC-b host verification) | No, but host-only and **OPEN** | Formal record §6–§7 |
| Native PF-11 run `92d931fb` | No | **NOT PASSED; undiagnosed** (formal record §6) |

Also source-supported: the attempt session must observe every item itself. Historical observations are session-bound and not reusable (PF status record; procedure §1 status boundary). Any pre-designation observation is therefore **preparatory only**, not attempt evidence.

### 5.3 Options (for PA; none selected)

| Option | Description | Downstream work unlocked | Dependencies / consequences |
|---|---|---|---|
| **C-1 No host contact before designation and capture authorization** | All host contact occurs in one authorized attempt session | Simplest sequencing; no preparatory evidence | Delays A6 runtime, DC-a/DC-b, and V1102 until the capture-authorization step. Longest path to first capture |
| **C-2 Commit-independent host qualification first; commit-keyed observations and store contact only in the attempt session** | A6 runtime and DC-a/DC-b (and any instrument test PA requires) may run under their own authorization before designation. Store, parent, and PF-14 root observations, and all commit-keyed items, occur only in the attempt session | A6, DC-a/DC-b, and V1102 can progress in parallel with A and B. No store contact before the attempt session | The qualification results are not attempt evidence. The A6 scope must be confirmed as commit-independent (open, §5.2) |
| **C-3 Read-only F4 and PF-14 observations before designation, recorded as preparatory** | As C-2, plus read-only F4 and root observations before the attempt | More early evidence | Adds store-path contact before the attempt. Procedure PF-12 expects absence "at the capture observation." Still not attempt evidence. Increases the number of session-bound records to reconcile |

### 5.4 Recommendation (IRR; not a decision)
**C-2.** It separates host items that do not depend on the commit (qualification) from items that do (designation-keyed observation and store contact), and it keeps store contact inside the authorized attempt session. Under C-2, the A6 runtime scope must first be confirmed as commit-independent. If it is not, C-1 applies to A6.

### 5.5 Open questions for PA
1. Is A6 runtime commit-independent? (Source does not state it.)
2. Does PA accept that any pre-attempt observation is preparatory, and that it will be re-observed?

---

## 6. Matter D — non-mutating effective-write verification method

### 6.1 Question
The P-1-D limb "operator-writable without elevation" needs an accepted method. Which method is acceptable, and which object does the criterion apply to?

### 6.2 Source-supported facts

| Item | Fact | Source |
|---|---|---|
| Criterion | "operator-writable without elevation" | PF status record |
| Object of criterion | The record does not state explicitly whether it applies to the store's parent directory (`C:\iips-data\iips`) or to the store path (which must not exist). **Open** | PF status record |
| Published v2 instrument | Read-only ACL dump (`Get-Acl`, instrument line 164). Header (instrument line 12): creates nothing inside any Git worktree; writes only under `$EvidenceRoot`. **No effective-access probe** | v2 instrument `191f5828…` |
| Evidence-root writability | The procedure demonstrates it by creating the new root and procedure files (line 451). That is a write to the **evidence root**, not to the store parent | Procedure line 451 |
| 2026-10-26 DACL | `Authenticated Users` → `Modify, Synchronize`; identity is a member and non-elevated. Strong non-mutating support; not an effective-access result | PF status record |
| Historical REV2 probe | Recorded `EffectiveWriteProbe=PASS`, cleanup PASS, `ProbeFileRemains=False`. **Location unstated. Generator unpublished** (`CB7E674E…`) | Historical REV2 record (not in the repository) |
| Instrument identity | Changing the method by revising the instrument changes the capture-instrument identity; DB-B1 (adopted) identifies v2 as the current capture instrument | Procedure lines 82–83 |

### 6.3 Options (for PA; none selected)

| Option | Description | Downstream work unlocked | Dependencies / consequences |
|---|---|---|---|
| **D-1 ACL inspection as sufficient** | Accept the v2 `Get-Acl` dump plus identity and group analysis | No instrument change | PA must explicitly accept that no effective-access result is obtained |
| **D-2 Published non-mutating effective-rights check** | Evaluate the store parent's DACL against the attempt account's token groups in a published instrument revision; raw output verbatim; no file created | New instrument revision (new identity under DB-B1); IRR review and publication; **A6 runtime on host before use** | Recommended for PA's consideration (§6.4) |
| **D-3 Create-and-remove sentinel** | Create and remove a uniquely named sentinel with before/after observation | **Writes into a directory**. If in the store parent, it mutates the P-1 directory; v2's design avoids that | Requires express PA authorization and a no-leftover read-back |
| **D-4 Rely on the historical REV2 probe** | Accept `EffectiveWriteProbe=PASS` | None | **Not verifiable**: generator unpublished, probe location unstated, no transcript in a repository ref. **Not recommended as sole evidence** |

### 6.4 Recommendation (IRR; not a decision)
Prefer **D-2**, with **D-1** retained only as supporting evidence. Do not rely on **D-4**. Use **D-3** only if PA declines D-2 and expressly authorizes a bounded probe. Before D-2 is used, PA should first state the object of the criterion (§6.2).

---

## 7. Matter E — capture authorization boundary and prerequisites

### 7.1 Question
What must be settled before a separate PA capture-authorization act can be rendered? A capture is **not** P-1 authorization.

### 7.2 Source-supported prerequisites (each must hold before capture)

| # | Prerequisite | Current status | Source | Owner / authority |
|---|---|---|---|---|
| E1 | Execution-commit identity settled (B) or deferral accepted | **OPEN** | §4 | PA; IPD for final identity |
| E2 | Blob disposition settled (A), with procedure step-0 scope to match | **OPEN** | §3 | PA; IPD for S1 correction |
| E3 | Procedure revision to the settled pins, step-0 scope, PF-07/PF-08, PF-10, root, instrument identity, and acceptance criteria (§10) | **NOT DONE**. Deliberately not edited ahead of decisions | §10 | IRR, after A–D |
| E4 | Instrument identity settled. v2 `191f5828…` / SHA-256 `13783385…` is the current sole identity (DB-B1). A D-2 revision would create a new identity | **v2 current**; changes require PA adoption | Procedure lines 82–83, 257 | PA; IRR |
| E5 | A6 runtime test run on host and recorded | **NOT RUN** (no `pwsh` in sandbox) | Formal record §7 | Operator, under host authorization |
| E6 | DC-a and DC-b (V1102) run in the attempt session and pass | **OPEN**. Native run `92d931fb` **NOT PASSED**, undiagnosed. Its `Get-FileHash` failure is the DC-b class. Deferral (PA-3d) does **not** waive the check | Formal record §6; procedure §4.3a | Operator; PA on any diagnostic |
| E7 | Instrument native test (`03-test_pf11_root_safe.ps1`) status | **Wording conflict**: evidence bundle says native acceptance "remains required before a subsequent capture"; procedure §4.3a says DC-C2 "replaces the native PowerShell 5.1 harness prerequisite … for that attempt only." PA must state which governs | Evidence `…pf11-root-safe-correction-2026-10-27/INDEX.md`, `10-…`; procedure §4.3a | PA |
| E8 | Root selection and parameterization. Procedure hard-codes `D:\iips-evidence` (lines 150, 154, 193, 440, 486). The 10-27-02 run used `C:\IIPS-EVIDENCE\…` | **OPEN**; procedure edit needed | Procedure; PF-14 record | PA (choice of root); IRR (procedure) |
| E9 | Live IRR and IPD main identity check and PF-17 register read immediately before invocation | Procedure requirement; **not yet satisfiable** | Procedure §4.4, §4.5 | Operator |
| E10 | Separate PA capture-authorization act naming host, session, root, instrument identity, pins, time window, and operator | **NOT RENDERED** (formal record; status matrix) | Formal record §§3–8; status matrix | PA |
| E11 | Attempt-session declaration (procedure line 447 region) and UTC timestamps | Procedure requirement | Procedure §4.5 | Operator |

### 7.3 What capture authorization is not
A capture authorization does not authorize P-1 execution, does not spend the single-use attempt, does not satisfy P-1-C or P-1-D, and does not authorize provisioning. The procedure states, at line 435: "Do not continue into provisioning after this capture."

### 7.4 Open questions for PA
1. E7: which statement governs the native harness requirement?
2. E8: which root will be used, and does the instrument identity or procedure text change as a result?
3. Does the capture authorization name the operator and session, as E10 requires?

---

## 8. Matter F — evidence required to accept P-1-C and P-1-D

### 8.1 P-1-C acceptance requires (all, from one attempt session)

| # | Evidence | Acceptance criterion | Source |
|---|---|---|---|
| F1 | Complete raw bytes of every instrument output | Byte-for-byte, untouched; SHA-256 manifest matches | Procedure §4.5 |
| F2 | Host-generated `directory-listing.txt` and `SHA256SUMS.txt` | Complete; lists every raw file; self-excluded manifest | Procedure §4.5 |
| F3 | `16-step0-source-hashes.txt` for the **full designated set at the designated commit** (not three files) | Every hash equals the adopted designation | §3, §4, §10 |
| F4 | `17-pf17-consumption-register.txt` read immediately before invocation | Register unspent; confirmation string `UNSPENT - NO P-1 EXECUTION RECEIPT` | Procedure §4.4; PF-17 |
| F5 | `19-attempt-session-declaration.txt` with UTC timestamps | Session, host, account, SID, engine, pins, and time window match the authorization | Procedure §4.5 |
| F6 | PF-01…PF-10 raw transcripts in the attempt session | Each matches its expected value verbatim; any mismatch is STOP | PF status record |
| F7 | PF-14 root-property transcript (absolute, writable, outside every worktree, non-synced, ≠ store) and the operator's sync attestation | Matches §8.2(c) and (d) below | Procedure §4.3, lines 440–441 |
| F8 | Instrument self-digest (`99-script-digest.txt`) equal to the executing script SHA-256 | Equal | Procedure §4.5 |
| F9 | Instrument identity equal to `191f5828…` / `13783385…` (or the PA-adopted successor) | Equal | Procedure lines 82–83, 257 |
| F10 | Independent byte read-back by IRR of every returned file | Hash-verified read-back; no unexplained byte difference | Procedure §4.6 |
| F11 | Acceptance decision by IRR review | Recorded in tracker; no acceptance inferred from "Capture complete," absence of `STOP.txt`, or zero error matches | Procedure §4.6; procedure §5 |

### 8.2 P-1-D acceptance requires (attempt-session observations)

| Limb | Required evidence |
|---|---|
| (a) F4 identity | Path verbatim `C:\iips-data\iips\user-portfolio.sqlite`, 39 bytes, equal to the PF-15 act's literal |
| (b) Store and sidecars absent | `Test-Path` = `False` for store, `-wal`, `-shm`, `-journal`, verbatim, in the attempt session (PF-12) |
| (c) Per-ancestor `.git` result | An **explicit** `InsideGitWorktree=False` (or equivalent) for each ancestor of the store parent. The procedure's ancestor loop (lines 158–166) walks to the root and fails only if a `.git` is found; it records no per-ancestor result |
| (d) Local fixed NTFS and not synchronized | Volume, drive type, file-system type, reparse-point status, and OneDrive comparison verbatim; sync-client attestation as the operator's recorded NONE (procedure line 440 region) |
| (e) Writable without elevation | The result of the method accepted under §6 (D), applied to the object accepted under §6.2 |
| (f) Attempt session | Declaration with UTC timestamps; read-back of raw bytes |

### 8.3 Stop conditions for acceptance
Any of: a mismatch in F1–F11 or limbs (a)–(f); a pre-existing store or sidecar; a non-elevated test failure; an unexplained DC-a/DC-b result; a prior P-1 attempt or failure in the PF-17 register; an identity change in IRR or IPD `main` between the authorization and invocation.

---

## 9. Order of operations (dependency graph)

```
[now] IRR baseline verified (§0)
  │
  ├─► PA decisions, non-host:  A (blob)  ⇄  B (commit, or defer)   [together]
  │        │                      │
  │        │                      └─► requires IPD pass final commit report (IPD owns)
  │        └─► S1 §12.2 correction (IPD owns, if A-1)
  │
  ├─► PA decision: D (write method)  ──► if D-2: IRR instrument revision, publish, review
  ├─► PA decision: C (sequencing)    ──► if C-2: separate host qualification authorization
  ├─► PA clarifications: E7 (native wording), E8 (root), §4.6 step-5 scope, §6.2 object
  │
  ├─► Host qualification (separate authorization; commit-independent items per C):
  │       A6 runtime · DC-a/DC-b (V1102) · any instrument test PA requires
  │
  ├─► Designation act (PA; §4.6 step 4), only after A, B, and step 2–3 evidence exist
  │       └─► Fresh S2 (L2a) at designated commit (§4.6 step 5; scope per §4.6 Q3)
  │
  ├─► IRR procedure revision (§10), published after the decisions above
  │
  ├─► Capture authorization act (PA; E10)  — NOT P-1 authorization
  │
  ├─► Attempt-session capture (operator; F1–F11; §8.2 limbs a–f)
  │
  ├─► IRR read-back and acceptance review (P-1-C / P-1-D)  — only on that capture
  │
  └─► P-1 authorization act (PA; separate; not rendered)  — only after acceptance
          └─► P-1 execution — out of scope of this record
```

**Hard rules from this graph.**
- No capture before E1–E11 hold.
- No P-1 authorization before F1–F11 and §8.2 are accepted.
- No commit-keyed observation before B is designated, under C-2 or C-1.
- H-12 regeneration (L2c) and the Gate 4 QE/H-12 pin are not preconditions for P-1 under PA-1, unless PA's answer to §4.6 Q3 says otherwise.

---

## 10. IRR execution checklist (bounded; run only after the named decision)

No item below is performed by this record. The procedure is **not** edited now (it is an operative document whose contents depend on A–F).

| After decision | IRR-owned change | Exact location (procedure revision `2026-10-28c`) | Acceptance / read-back criterion |
|---|---|---|---|
| **B** (commit) | Replace execution pin and tree | Lines 77–78 (`$IpdCommit`, `$IpdTree`); line 127 (DA-A1 note); lines 351–353 (manifest label `IPDExecutionPinOfRecord`); lines 121, 405 (`Assert-Pin`); line 417 (step-0 log) | Pin equals the PA designation act; `Assert-Pin` checks the object and tree on the remote commit object |
| **A** (blob) | Replace step-0 table with **all** designated blobs at the designated commit; match act §2.1 rows and the amendment; add the act's §8.2 check | Lines 413–415 (three rows); line 417 | Each of 12 (or amended count) blobs matches; any difference is STOP |
| **A + B** | PF-07 expectation (IPD clean full-history checkout at the designated pin) | Lines 121, 405; PF-07 text | `IpdCommit` and `IpdTree` match designation; `is-shallow-repository=false` (PF-09) |
| **§4 / §5** | PF-08 expectation (IRR consumer at R1) | Lines 79–80, 122, 406 | Unchanged unless PA re-designates R1 (§16.122.7). Do not infer a change |
| **E7** | Native harness wording and any test step | §4.3a (lines 170–185); evidence-bundle wording | One statement; PA's text governs |
| **E8** (root) | Parameterize root and parent; align PF-14 text | Line 150 (`$EvidenceParent`); 154 (D: NTFS check); 193 (`$EvidenceRoot`); 440 (attestation text); 486 (output location); 451 (`EvidenceRootWritable`) | PF-14 transcript matches the chosen root; attestation text names that root |
| **E8 / D** | Confirm PF-14 and writability wording do not confuse evidence-root writability with store-parent writability | Line 451; PF-11 limb in §4.3 | Limb (e) in §8.2 is evidenced for the accepted object |
| **D-2** | Replace the writability check with the accepted method; publish the instrument revision; new identity | Instrument line 164 (`Get-Acl`); procedure lines 82–83 (blob, SHA-256), 257 (identity check), 318 (copy check) | New blob and SHA-256 recorded; DB-B1 amended by PA; A6 runtime on the new revision before use |
| **Any instrument change** | Update identity pins and the self-digest expectation | Procedure lines 82–83, 257, 318, 435; instrument identity pins | `99-script-digest.txt` equals executing-script SHA-256 |
| **C-2** | Record qualification as separate, session-bound, not attempt evidence | §4.3a and §6.3 | Result not cited as attempt evidence |
| **PF-10 coverage** | Reconcile the instrument's PF-10 capture (instrument lines 91–98: four named flags only) with the procedure's check (procedure lines 146–148: four named flags **and** `GATE_A_PRIME_*`) | Procedure lines 146–148; instrument lines 91–98 | Either instrument revised (DB-B1 amendment) or procedure narrowed by PA. Stated, not silent |
| **Acceptance** | Carry F1–F11 and §8.2 limbs into the procedure's acceptance text | §4.6 (line 484 onward); §5 (line 488) | Acceptance only by IRR review on read-back; no inference from capture completion |
| **Any decision** | Additive revision record and tracker entry | Procedure header table; tracker §16.x | Rev number, CHG, V-rows; no historical text rewritten |

**Procedure-level inconsistencies to correct once their decisions are made (not before):**
1. Step 0 covers three files; act §8.2 covers twelve (A).
2. Pins at lines 77–80 and 121–122 are the DA-A1 candidate; they stop being correct once B designates another commit.
3. The PF-14 attestation (line 440) and the root (line 193) hard-code `D:`; the 10-27-02 run used `C:` (E8).
4. PF-10 coverage differs between procedure and instrument (PF-10 coverage row).
5. The procedure's registration check (line 228) and comparison text (lines 329, 389) anchor on the tracker heading `## §16.153`; the PF-17 register limb is recorded at tracker §16.160.4 (per the session record). PA or IRR to confirm the authoritative anchor before publication.

---

## 11. Clarifying naming conflicts (no decision; flagged for PA)

- **"S2" is used for two things.** (i) CAP-03 S2 evidence, candidate-scoped, closed for the candidate and the P-1-A row (tracker §§16.138–16.144; formal record P-1-A). (ii) Gate 4 S2 Limb A, native-Windows `npm test` at a designated commit, **not started** (formal record §§3–8; tracker). §4.6 step 5 uses "S2 (L2a)". PA should state which S2 is meant.
- **"Limb A" is used for two things.** The Gate 4 Limb A merge (formal record: outstanding) and IPD commit `c62dee8` (titled "bounded Gate A prime and Limb A work"). The record does not state how these relate. No conclusion is drawn here.
- **"PF-11" is used for two things.** The F4 criterion (absolute; outside worktree; non-synced; local; writable) and the native run `92d931fb`. This packet labels items by criterion text where ambiguous.

---

## 12. Stop conditions for this packet

- No IPD final commit reported → B cannot be decided; B-2 is the only available option.
- A or B not decided → no commit-keyed observation, no designation act, no procedure pin revision.
- D not decided → no P-1-D limb (e) acceptance.
- C-1 or C-2 not decided → no host observation of any kind beyond the existing read-only record.
- E7 or E8 not decided → procedure revision and capture authorization are blocked.
- Any change to IRR or IPD `main` identity after this record → re-verify §0 before any decision is relied on.

---

## 13. Non-grants and boundary confirmation

- No option selected. No PA decision, approval, or signature is made or implied.
- No execution pin, `C′`, or Gate 4 QE/H-12 pin designated. No commit or tree is named as a designation.
- No operative procedure edit. No instrument edit. No change to `BASIS_COMMIT` or `BASIS_TREE`.
- No capture, host preflight, PowerShell, `pwsh`, PF-11 rerun, V1102, A6 runtime test, compatibility script, host diagnostic, store open or probe, or P-1 execution.
- No IPD write. IPD `main` observed read-only.
- No S2, QE, DQ-4, Gate 4, Gate 5, H-12, S3, or PF-17 movement.
- P-1-C remains **NOT ESTABLISHED**. P-1-D remains **DESIGNATED; NOT VERIFIED FOR THE ATTEMPT**. P-1 remains **NOT EXECUTED / UNSPENT / NOT AUTHORIZED**.

*End of record `IIPS-V3-CAP03-P1C-P1D-PA-DECISION-PACKET-AF-2026-10-28-01`. Tracker §16.167 (`CV-CORR-147`; `CHG-2026-10-28-11`; `V1165`–`V1172`).*
