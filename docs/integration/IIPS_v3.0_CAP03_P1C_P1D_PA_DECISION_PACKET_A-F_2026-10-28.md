# CAP-03 P-1-C / P-1-D — IRR-Owned PA Decision Packet A–F, Dependency Plan, and IRR Execution Checklist (`2026-10-28`)

> **STATUS: DECISION PACKET ONLY. NO DECISION IS MADE OR IMPLIED. P-1 IS NOT EXECUTED / UNSPENT / NOT AUTHORIZED.**
> **P-1-C = NOT ESTABLISHED. P-1-D = DESIGNATED; NOT VERIFIED FOR THE ATTEMPT.**
>
> **Current-ref note (2026-10-28, IPD PR #102):** IPD `main` is now `a9cd18e8ef3ad0543794da0a1abaaae5814c0bfe` (tree `546c8cea…`). Sections 0–13 record the state as of IRR PR #348 and are retained as history. Where §14 names a superseded statement, §14 governs for the refs it names.
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

---

## 14. Reconciliation addendum — IPD PR #102 and current refs (2026-10-28)

**Scope.** Additive. Sections 0–13 are not rewritten. This section (a) records the current authoritative refs, (b) recomputes the successor act's twelve designated blobs at each relevant ref, (c) corrects or supersedes the statements the new evidence affects, (d) classifies the procedural conflicts, and (e) states the minimum decision each open matter needs. It decides nothing. No option is selected, and no commit, pin, or `C′` is designated.

**Supersession pointer (`CV-CORR-149`, `2026-10-28`).** Statements in §§14.4–14.7 are corrected in §15.8. The S-14 "merge outstanding" statement, the §14.5 out-of-set rows, the §14.6 line references, and the §14.6 Matter B "pass locally" wording are superseded as stated there. §14 text is retained unchanged.

### 14.1 Authoritative refs (read-only this pass; not taken from reports)

> **Pointer (addendum 3, §16.1, `2026-10-28`).** The refs in this subsection are historical. Current IRR `main` is `758478be3bc020f78444bebf1e98f108e3770c12`; current IPD `main` is `aa43dec2df76cc5dd5077c9806b3c97ea8e428b6`.

| Item | Identity | Verification |
|---|---|---|
| IRR `main` | `54a67d227889e14748afd16eda6beedcd9b4d5d3` (PR #348 merge; `2026-10-28T06:27:23Z`) | `git ls-remote origin refs/heads/main`; tree `5b5e1677…` (local `HEAD^{tree}`) |
| IRR open PRs | none | `gh pr list --state open` |
| IRR session branch | `arena/a1f161ca-iips-review-recovered` local at `54a67d22`; the remote session branch did not exist before this pass | `git ls-remote`; `git branch --show-current` |
| IPD `main` | `a9cd18e8ef3ad0543794da0a1abaaae5814c0bfe`, tree `546c8cea0f578116dcff5e19b5c78a0e9692ed05`; parents `db84ac12…` and `a58dbc42…` | `git ls-remote` (read-only); blobless read-only clone |
| IPD PR #102 | title "CAP-03: Gate A′ designated-blob factual correction and D2 publication record (append-only)"; head `a58dbc42b3b0f51715de03ba37d6014b959ff949` (tree `546c8cea…`); merged `2026-10-28T06:30:22Z` | `gh pr list --state all` |
| IPD PR #102 exact-head CI | run `40644087712` on `a58dbc42…`: SUCCESS | `gh pr checks 102`; `gh run list --branch arena/24771bc4-iips-production-market-data` |
| IPD PR #102 post-merge CI | run `40644264937` on `a9cd18e8…`: SUCCESS | `gh run list --branch main` |
| IPD open PRs | none | `gh pr list --state open` |
| IPD tracker blob | `62576970…` at `a9cd18e8…` (was `8a2a4e45…` at `db84ac12…`) | `git rev-parse a9cd18e8:<path>` |

**Scope of PR #102.** `db84ac12..a9cd18e8` changes exactly one file: `evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md` (+168 lines, a new appended section). PR #102 did not change any runtime, test, script, package, or pin file.

**Earlier IPD refs (historical; label as such).** `5fc74085…` (tree `7226ef00…`) is the act's and the compiled basis, `BASIS_COMMIT`/`BASIS_TREE`. `001c3c80…` (tree `399fa44a…`) is the DA-A1 pin of record. `a891802e…` (tree `76f083d7…`) is the PR #100 merge. `f722d7d…` (tree `76f083d7…`) is the PR #100 head. `d2782f2…` (tree `831f00e0…`) is the PR #101 head. `db84ac12…` (tree `831f00e0…`) is the PR #101 merge.

### 14.2 Commit identity and tree identity

- The **executable content** of the D2 candidate is unchanged between `db84ac12` and `a9cd18e8`. Runtime blobs are identical: `gateAPrimeProvisioning.ts` `9b15eca3…`, the g3 successor test `0ea47e8f…`, and `gateAPrimeValidation.ts` `df5d48a5…`.
- The **tree identity** has changed. `831f00e0…` is the tree of `db84ac12` and `d2782f2`. `546c8cea…` is the tree of `a9cd18e8` and `a58dbc42`. Each statement that gives `831f00e0` as the current D2 tree is correct for `db84ac12` and `d2782f2` only.
- The rule of record stands. Equal trees are not interchangeable commit identities. Commit and tree must be designated together, and the designation must name the commit the final IPD pass reports.
- Current candidate identities, none designated: `db84ac12…` (merge; tree `831f00e0…`), `d2782f2…` (head; tree `831f00e0…`), `a9cd18e8…` (merge; tree `546c8cea…`), `a58dbc42…` (head; tree `546c8cea…`). Recency is not a basis for choosing among them.

### 14.3 Successor-act §2.1 designated blobs, recomputed at each ref (this pass)

The act's basis is `5fc74085ade980846ff4a07b36415b6d49446486` (tree `7226ef00…`). Each column is a separate ref. Values were read with `git rev-parse <ref>:<path>`. "MATCH" means the blob equals the §2.1 designation.

| # | Path | Designated (§2.1) | @ basis `5fc74085` | @ `001c3c80` (DA-A1) | @ `a891802e` (PR #100 merge) | @ `db84ac12` (PR #101 merge) | @ `a9cd18e8` (PR #102 merge) |
|---|---|---|---|---|---|---|---|
| 1 | `src/persistence/provisioning.ts` | `dc844189` | MATCH | MATCH | MATCH | MATCH | MATCH |
| 2 | `src/persistence/binding.ts` | `96d0079d` | MATCH | MATCH | MATCH | MATCH | MATCH |
| 3 | `src/persistence/audit.ts` | `273ccd3b` | MATCH | MATCH | MATCH | MATCH | MATCH |
| 4 | `src/persistence/connection.ts` | `5169e402` | MATCH | MATCH | MATCH | MATCH | MATCH |
| 5 | `…/migrations/001_initial_schema.ts` | `f594a182` | MATCH | MATCH | MATCH | MATCH | MATCH |
| 6 | `…/migrations/002_audit_event_sequence.ts` | `932af8e6` | MATCH | MATCH | MATCH | MATCH | MATCH |
| 7 | `…/migrations/003_local_principal_bindings.ts` | `32b125bf` | MATCH | MATCH | MATCH | MATCH | MATCH |
| 8 | `…/migrations/004_portfolio_contribution_provenance.ts` | `6bad5a50` | MATCH | MATCH | MATCH | MATCH | MATCH |
| 9 | `src/ipc/dispatch.ts` | `27becc76` | MATCH | MATCH | MATCH | MATCH | MATCH |
| 10 | `src/persistence/portfolio_store.ts` | `4a005b73` | MATCH | DIFFERS (`540d49f2`) | DIFFERS (`540d49f2`) | DIFFERS (`540d49f2`) | DIFFERS (`540d49f2`) |
| 11 | `package.json` | `51796e63` | MATCH | MATCH | MATCH | MATCH | MATCH |
| 12 | `tests/g3_startup_validation.test.ts` | `9a5fd9e3` | MATCH | DIFFERS (`edd0305e`) | DIFFERS (`edd0305e`) | DIFFERS (`edd0305e`) | DIFFERS (`edd0305e`) |
| | **Result** | | **12/12** | **10/12** | **10/12** | **10/12** | **10/12** |

**What this establishes.** The act's §2.1 designations are exact at the act's own basis. The divergence begins after the basis. Item 12 changed at `c62dee8` (2026-10-23), and item 10 changed at `bc144b9` (2026-10-25). The prior statement that the designation "is accurate for its own basis" is therefore confirmed, not contradicted.

### 14.4 Corrections and supersessions

| # | Statement (record and location) | Status | Correction |
|---|---|---|---|
| S-1 | §0 "IPD `main` `db84ac12…`; unchanged since the last pass" | **Superseded as current** | IPD `main` is `a9cd18e8…`. The §0 statement was correct as of IRR PR #348. |
| S-2 | §4.2 and §4 candidate rows naming tree `831f00e0…` as the D2 tree | **Superseded for `a9cd18e8`** | `a9cd18e8` has tree `546c8cea…`. `831f00e0…` still applies to `db84ac12` and `d2782f2`. |
| S-3 | §4 "Do not designate `db84ac12` or `d2782f2` merely because they are the current heads" | **Superseded** | Current heads are `a9cd18e8` (merge) and `a58dbc42` (head). The rule is unchanged. |
| S-4 | §3.2 "`4a005b73` is carried only by `95f1dcc` (2026-10-23)" | **Imprecise; corrected** | `4a005b73` was introduced at `95f1dcc` (2026-10-23). It was unchanged through the path's history until `bc144b9` (2026-10-25), the next commit that touched the file. The path history since the basis is `bc144b9` alone. |
| S-5 | §3.2 S1 row: S1 wording "not re-read in this pass" | **Now read; recorded** | S1 determination line 79 and §12.2 lines 330–334 state the 12 designated blobs resolve "as designated" / "12/12 identical at this baseline". S1 readiness request line 79 says the same. Both enumerate item 12 as `edd0305e…`, and at `db84ac12` only 10 of 12 match. The IPD tracker section added by PR #102 (§2 of that section) identifies these statements as overstated and leaves them in place. IRR records them and does not amend them. |
| S-6 | §3.2 "Other ten designated blobs match at `001c3c80` and at `db84ac12`" | **Extended** | Also true at the act's basis, where all 12 match (§14.3). |
| S-7 | §3.3 Option A-1: "row 12 should name the post-addition blob, since §5.1 item 4 contemplates that addition" | **Strengthened, still a PA choice** | §5.1 item 4 of the act reads "modified (bounded)". The act therefore authorizes the modification that makes row 12 differ from its own §2.1 designation. This is an internal inconsistency within the act. Which blob to designate remains a PA decision. |
| S-8 | §3.5 Q1: whether `bc144b9` (DR-2) "falls inside the act's intended comparison set" | **Sharpened** | The IPD tracker names the DR-2 record's "Authorized change manifest" (`portfolio_store.ts` and `tests/q1_ipc_read_contract_conformance.test.ts`) as the claimed authority. The question is whether that record is the "further act" that §5.1 requires for `portfolio_store.ts` and for the q1 test. |
| S-9 | §4.2 "Delta `001c3c80..db84ac12`: 62 files" | **Extended** | `001c3c80..a9cd18e8` is also 62 files, and the set of changed paths is identical. `db84ac12..a9cd18e8` is 1 file (the IPD tracker). |
| S-10 | §4.2 step-0 row `gateAPrimeProvisioning.ts` `9b15eca…` at `db84ac12` | **Still correct at `a9cd18e8`** | Blob unchanged. |
| S-11 | Tracker §16.167 `V1167` "CARRIED" (blob table) | **Superseded by rerun** | Rerun this pass: §14.3, rows `V1178`–`V1182` of the tracker. |
| S-12 | Tracker §16.167 `V1172` "PENDING" and `V1169`–`V1171` "to be re-confirmed at exact head" | **Superseded by receipts** | Receipts recorded in tracker §16.168 (`V1190`). |
| S-13 | Post-D2 pointers that name `db84ac12` as current: packet §11; formal record; status matrix; consolidated package; tracker §16.166.7 | **Dated; supersession pointer appended** | Each pointer is dated as of PR #101. A one-line pointer to §14 and tracker §16.168 has been appended to each. |
| S-14 | §11 "Limb A" naming: IRR formal record treats Gate 4 Limb A merge as outstanding | **Source conflict recorded** | IPD tracker (Gate 4 Limb A table row) says "Implemented on this session branch"; the mandatory `tests/g4_run_tests_summary_parsing.test.ts` was created on `main` at `c62dee8` (2026-10-23). Relationship not reconciled. No Gate 4 movement. |

### 14.5 Newly established facts (factual; source-verified this pass)

Post-basis changes to files outside the act's §2.1 designated set. The act's §5.1 heading reads "File set (exhaustive — no other path may change)".

| File | Change (commit, date) | Size | Authority named in the IPD record | Status in this record |
|---|---|---|---|---|
| `src/persistence/gateAPrimeProvisioning.ts` | **created** at `c62dee8` (2026-10-23); modified at `f9ec0c5` (S1 binding), `f722d7d` (D2), `d2782f2` (D2 follow-up) | new file | Act §5.1 item 1 lists it as **new**; not in the §2.1 blob table | Creation authorized by the act. Subsequent modifications: the D2 changes rely on PA-5 Option B (adopted). Blob not designated. |
| `src/persistence/gateAPrimeValidation.ts` | `c62dee8`; `f9ec0c5` (+25/−4, S1 binding) | existing module | Act §5.2: compiled constants fixed by the act and changed only by a later act. The S1 determination is the claimed later act. Identity constants went from `null` to `ramki-personal-local`, `ipd-personal-local`, and `ipd-owner-ramki-personal` at `f9ec0c5`. | `BASIS_COMMIT`/`BASIS_TREE` unchanged. Identity-constant change: authority chain not re-audited this pass. |
| `tests/g4_run_tests_summary_parsing.test.ts` | **created** at `c62dee8` (+125) | new file | IPD tracker (Gate 4 Limb A rows, lines 322, 407, 470) | Not in the act's §5.1 set. Documented under the Gate 4 authority. Whether that authority covers the act's "no other path may change" is a PA question. |
| `tests/portfolio_ui_package.test.ts` | `001c3c80` (+2/−2) | existing test | **None found** in the IPD tracker. The change is a Windows import-URL fix (`pathToFileURL`) in T-PKG-4. | Not in the act's §5.1 set. Not mentioned in the IPD tracker. Not in any procedure check. Factual gap; PA to decide whether it needs a record. |
| `tests/q1_ipc_read_contract_conformance.test.ts` | `bc144b9` (+1264/−121) | existing test | DR-2 record "Authorized change manifest" (IPD tracker lines 1371, 1842) | Act §5.1 prohibits any other existing test "without a further act". Same question as S-8. |
| `src/persistence/portfolio_store.ts` | `bc144b9` (+274) | existing module | DR-2 record (as above) | Same question as S-8. |

**Two observations.** First, the act's file set is exhaustive by its own heading, but later records (S1, DR-2, Gate 4 Limb A, and the portfolio UI fix) changed files outside it. Second, the act's §8.2 stop condition is written in terms of "designated blob", so a change to a non-designated file does not by its own wording trigger §8.2. Whether it breaches the §5.1 scope is a separate question.

### 14.6 Classification of procedural and record conflicts

| Conflict (where first recorded) | Classification | Minimum next action |
|---|---|---|
| Matter A: blob comparison, items 10 and 12 (§3) | **Factual inconsistency** (blob table vs later commits); **reserved authority decision** (re-pin vs fresh act) | PA ruling per item (§14.7). Not inferred. |
| S-7: item 12 pre-modification blob vs act §5.1 item 4 "modified (bounded)" | **Ambiguous / overlapping requirement** within the act | PA ruling: which blob the act designates for row 12. |
| S-5: S1 and readiness-request statements "12/12 as designated" | **Factual inconsistency** (statements vs enumeration and measurement) | IPD owns the correction. IRR records it. No IRR amendment of IPD records. |
| §14.5 out-of-set post-basis changes | **Ambiguous / overlapping requirement** (exhaustive §5.1 vs later records) and **reserved authority decision** | PA ruling on whether later records cover each item. |
| Matter B: execution-commit designation; DA-A1 receipt element (§4) | **Reserved authority decision**; the receipt element is a **factual** precondition. Unmet at `001c3c80`. At `db84ac12` and later the D2 fields and T-10…T-16 are present and pass locally (§14.1, V1185–V1187), but whether that satisfies the DA-A1 element is a **PA determination**, not made here | PA ruling after the IPD final-commit report. |
| D2 expected-pin limitation: the expected pin is caller-supplied (`--execution-commit` / `--execution-tree`); the module reads no governed pin artifact | **Factual** (confirmed by static grep at `a9cd18e8`); the consequence for authority is a **reserved decision** | Designation act (PA) must name the commit. Any change to the module is an IPD pass. |
| Step-0 covers 3 of the act's 12 files (procedure lines 413–415) | **Procedure correction requiring prior decisions** (Matter A) | Revise after A. Not before. |
| Procedure pins `001c3c80` / `399fa44a` (lines 77–80, 121–122, 405–406) | **Procedure correction requiring prior decisions** (Matter B) | Revise after B. Not before. |
| PF-10 coverage: instrument checks four named flags (lines 91–98); procedure also checks `GATE_A_PRIME_*` (lines 146–148) | **Ambiguous requirement**; resolution is either a **procedure narrowing** (PA) or an **instrument change** with its own identity and validation | PA choice first. |
| Native harness wording: evidence bundle vs procedure §4.3a (DC-C2) | **Ambiguous / overlapping requirement** | Reserved PA ruling (E7). |
| Root hard-coded `D:` (lines 150, 154, 193, 440, 486); 10-27-02 run used `C:` | **Procedure correction requiring a prior decision** (root choice); PF-14 transcript is a **host/attempt-session condition** | PA chooses root; then procedure revision; then host observation in the attempt session. |
| S2 naming (CAP-03 candidate-scoped S2 vs Gate 4 S2 Limb A) | **Ambiguous terminology**; the two must not be combined | PA names which S2 each requirement means. |
| §4.6 step 5 bundles fresh S2 (L2a) and H-12 (L2c); PA-1 says H-12 is not a P-1 precondition | **Ambiguous / overlapping requirement** | Reserved PA ruling. H-12 is not treated as a P-1 prerequisite in this record without that ruling. |
| Limb A: IRR "merge outstanding" vs IPD "implemented on session branch" and `c62dee8` on `main` (S-14) | **Factual inconsistency**; the authority question is **reserved** (Gate 4) | Gate 4 owner records the relationship. No Gate 4 movement from this record. |
| PF-17 anchor: procedure checks `## §16.153` (line 228); register limb recorded at §16.160.4 | **Procedure correction requiring prior decisions** (anchor text) | Confirm the authoritative anchor; revise after decisions. |
| PF-11 native `92d931fb`: NOT PASSED, undiagnosed | **Host/attempt-session condition** and a **reserved** decision on any diagnostic | No diagnostic is run by this record. |
| A6 runtime NOT RUN; DC-a/DC-b (V1102) OPEN | **Host/attempt-session conditions** | Separate host authorization. Not performed. |
| Writability method (D) and object of the criterion | **Reserved authority decision**; an instrument change would need its own identity and validation | PA ruling (Matter D). |

### 14.7 Minimum decision required per open matter (refined by this pass)

- **Matter A (blob disposition).** Four PA rulings, none inferred. (a) Item 10: is the DR-2 record (`bc144b9`) the "further act" that §5.1 requires for `portfolio_store.ts`? If yes, does PA re-designate `540d49f2…` by act? If no, does PA order a fresh rendering? (b) Item 12: does PA designate the pre-modification blob (`9a5fd9e3…`, as written) or the §5.1-authorized post-modification blob (`edd0305e…`)? (c) Does the §5.1 "exhaustive" scope cover the out-of-set changes in §14.5, and if so, on what record? (d) Does PA require any record for the `portfolio_ui_package` change in §14.5?
- **Matter B (execution commit).** Requires (a) a final IPD commit report, which the IPD tracker's "none designated" status confirms is still outstanding, and (b) Matter A. The minimum decision is one commit identity and its tree, from the candidates in §14.2, or deferral. The runtime content is identical across `db84ac12` and `a9cd18e8`. The choice therefore changes the tree and the tracker blob, not the executable content. The designation must still name the commit and tree it names.
- **Matter C, D, E, F.** Unchanged from §§5–8. No explicit governing decision is present in the record that changes them.

### 14.8 Non-grants (this addendum)

No PA decision, approval, or signature. No option selected in any matter. No execution pin, `C′`, Gate 4 QE/H-12 pin, or successor-act designation changed. No change to `BASIS_COMMIT` or `BASIS_TREE`. No procedure, instrument, or successor-act edit. No IPD write. No host, capture, PowerShell, `pwsh`, A6 runtime, V1102, PF-11 rerun, compatibility script, store action, or provisioning. No P-1 execution, authorization, or spending. P-1-C NOT ESTABLISHED. P-1-D DESIGNATED; NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.

*End of §14 (`IIPS-V3-CAP03-P1C-P1D-PA-DECISION-PACKET-AF-2026-10-28-01`, addendum).*

## 15. Reconciliation addendum 2 — candidate identity, Matter A and B refinement, and conflict classification (`2026-10-28`)

**Scope.** Additive. Sections 0–14 are not rewritten. This section (a) verifies the refs and candidate identities used by Matters A and B, (b) corrects §14 where verified facts differ, and (c) states the minimum PA ruling per open question. It makes no decision. It designates no commit, pin, or `C′`; changes no successor act, procedure, instrument, or compiled constant; and performs no IPD write, host action, capture, PowerShell run, or P-1 step. Tracker counterpart: `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` §16.169 (`CV-CORR-149`; `CHG-2026-10-28-13`; `V1193`–`V1206`).

> **Pointer (addendum 3, §16, `2026-10-28`).** The §15.1 refs are historical as current refs (§16.1). The wording of §15.10 is qualified by §16.2 C-11 (existing CV-CORR-123 coordinate). The §15.8 C-3 and §15.5 Q-A4 statements are qualified by §16.2 C-12 and §16.8. §15 text is otherwise retained.

### 15.1 Refs verified this pass (read-only)

| Repository | Ref | Identity | Verification |
|---|---|---|---|
| IRR | `main` | `f45cfaf122e9b042da53a71942996af7a3d03a61` (tree `a4201f26…`) | `git ls-remote`; PR #349 merge; open IRR PRs 0 |
| IRR | `arena/a1f161ca-iips-review-recovered` | `f45cfaf1…` | `git ls-remote` |
| IRR | `arena/3930db71-iips-review-recovered` (this session) | local HEAD `f45cfaf1`, clean at start | `git status`; no remote branch of this name existed before this pass |
| IPD | `main` | `a9cd18e8ef3ad0543794da0a1abaaae5814c0bfe` (tree `546c8cea…`) | `git ls-remote`; open IPD PRs 0 |
| IPD | PR #89 (DR-2 provider envelope) | head `bc144b95649aec88c3bfd0fc2a9c68e828d4839a`; merge `79d06e3c5da60da2a234b7ac18c35df848bf9d11`, merged `2026-10-25T13:03:28Z` | `gh pr view 89 --repo ramkivs/iips-production-market-data` (read-only) |
| IPD | scratch clone `/tmp/ipd-ro3` | blobless, `--no-checkout`; ephemeral; read-only | `git merge-base --is-ancestor`, `git rev-parse`, `git show`, `git diff --numstat` |

**Carried, not re-measured this pass:** the 12-blob comparison in §14.3 (carried from the same ref `a9cd18e8`); the D2 runtime results in §14.1 other than the static greps listed in §15.6 (B-F3).

### 15.2 Malformed strings and correct identity

| Item | Result |
|---|---|
| Malformed candidate `001c3c803844469164b4756d613a82202906d7b8` and malformed tree `399fa44a6871e15c1c44f3c1f91d16a424b7a104` | Absent. 0 files in IRR (`git grep`); 0 matches in the IPD execution tracker at `a9cd18e8`; 0 commits on `origin/main` (`git log -S`); neither resolves in the IPD blobless clone (`upload-pack: not our ref`). Treated as nonexistent, not transient. No correction pointer is needed: no record contains them. |
| Correct candidate | `001c3c80618f2ee1d40e9a90912237e1a06e7b58`, tree `399fa44a5f1953c0f61b452420fefb5985426ef1`, parent `8eec74ae27cda09f3c368b9c299895eae41554db`; ancestor of `a9cd18e8` (verified) |
| Usage in IRR records | Full candidate: 140 occurrences in 64 files. Full tree: 104 occurrences in 58 files (`git grep -o` / `-l`) |

### 15.3 Candidate identity table (factual; not a designation)

Every commit below is an ancestor of `a9cd18e8` (verified). Equal trees are not interchangeable commit identities (formal record §4.6). No row is preferred by recency, by being on `main`, or by tree.

| Role | Commit | Tree | Parent(s) | Date (UTC) | Record that names it |
|---|---|---|---|---|---|
| Compiled basis (successor act §2) | `5fc74085ade980846ff4a07b36415b6d49446486` | `7226ef0033b3a7049169d8fcf9bcbc9908e2590b` | `de2bb063…`, `07946ce6…` (PR #66 merge) | 2026-10-23 | Successor act §2; not an execution pin (procedure line 127) |
| Sole parent of the DA-A1 candidate | `8eec74ae27cda09f3c368b9c299895eae41554db` | `4eba2902…` | `743a2840…`, `4c0a0da9…` (PR #91 merge) | 2026-10-25 | Designated-not-established (§16.122.7, carried) |
| Gate 4 Limb A commit | `c62dee81748aaed6416956b2e323ce77d1ff1f3c` | `1467802e…` | `7f64d37a…` | 2026-10-23T16:33:13Z | Gate 4 act §4.2 (Limb A paths); CAP-02 Limb A commit title |
| Gate 4 Limb A merge (PR #68), pre-binding literal QE candidate | `a52b47b0f8ca448c8c9c195cf261e83ecf813ba3` | `1467802e…` (equal to `c62dee81`) | `7f64d37a…`, `c62dee81` | 2026-10-23T16:34:51Z (22:04:51 +05:30) | Formal record line 29 (`pre-binding`); §4.5 L2c |
| DA-A1 candidate: PR #96 head | `001c3c80618f2ee1d40e9a90912237e1a06e7b58` | `399fa44a5f1953c0f61b452420fefb5985426ef1` | `8eec74ae…` | 2026-10-26 | CV-CORR-123 §2 (candidate-scoped designation) |
| PR #96 merge on `main` | `1e76f4cf9e9ca7d385a8345c9b6f438ae1ad6745` | `7003a2828bde51985393348fa6e657a6cb8d4eed` | `f5eddbc2…`, `001c3c80` | 2026-10-26T10:12:18Z | CV-CORR-123 §2 (listed as merge identity; not designated) |
| D2 candidate 1: PR #100 head | `f722d7d46e056d4eb3039e9d3df8045b1cce4e1c` | `76f083d7…` | `888eb375…` | 2026-10-28 | Packet §4.2 (candidate; not designated) |
| D2 candidate 2: PR #100 merge | `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` | `76f083d7…` | `888eb375…`, `f722d7d4` | 2026-10-28 | Packet §4.2 |
| D2 candidate 3: PR #101 head | `d2782f235a9b11a9716128b8b8b70ddedf6775ab` | `831f00e0…` | `a891802e` | 2026-10-28 | Packet §4.2; §14.2 |
| D2 candidate 4: PR #101 merge | `db84ac12f297eec2bb159ae785c3cc584f7d7e34` | `831f00e0…` | `a891802e`, `d2782f23` | 2026-10-28 | Packet §4.2; §14.2 |
| D2 candidate 5: PR #102 head | `a58dbc42b3b0f51715de03ba37d6014b959ff949` | `546c8cea…` | `db84ac12` | 2026-10-28 | §14.2 |
| D2 candidate 6: PR #102 merge (current `main`) | `a9cd18e8ef3ad0543794da0a1abaaae5814c0bfe` | `546c8cea…` | `db84ac12`, `a58dbc42` | 2026-10-28 | §14.2 |
| DR-2 head (PR #89) | `bc144b95649aec88c3bfd0fc2a9c68e828d4839a` | `e8d361c9…` | `4b5c65a7…` | 2026-10-25 | DR-2 record (line 11 manifest) |
| DR-2 merge (PR #89) | `79d06e3c5da60da2a234b7ac18c35df848bf9d11` | `e8d361c9…` (equal to `bc144b95`) | `4b5c65a7…`, `bc144b95` | 2026-10-25T13:03:28Z | IRR locus document §1 (line 24) |

Equal-tree pairs: `831f00e0…` (rows 3–4); `546c8cea…` (rows 5–6); `76f083d7…` (rows 1–2); `1467802e…` (Gate 4 Limb A commit and merge); `e8d361c9…` (DR-2 head and merge). The "four later candidates" named in §14.2 are rows 3–6.

### 15.4 Matter A — refined facts

| ID | Fact | Source (verified this pass unless marked carried) |
|---|---|---|
| A-F1 | Item 10, `src/persistence/portfolio_store.ts`: designated `4a005b73…`; actual `540d49f2…`, changed by `bc144b9` (DR-2, PR #89). It is the only post-basis commit on that path. | Successor act §2.1 item 10; `git rev-parse` on the path (prior pass, carried) |
| A-F2 | DR-2's stated authority. DR-2 record (`IIPS_V3_CAP03_DR2_IPD_PROVIDER_EXECUTION_2026-10-25.md`), line 9: governing act is PA decision `IIPS-V3-CAP03-DR2-DQ1-PA-DECISION-2026-10-25-01` §2 (IRR locus `docs/integration/IIPS_v3.0_CAP03_ONE_PASS_PA_DECISION_AND_IRR_EXECUTION_2026-10-25.md` §2, Option A). Line 11: "Authorized change manifest: `src/persistence/portfolio_store.ts`, `tests/q1_ipc_read_contract_conformance.test.ts` — exactly these two". The DR-2 record does not mention the successor act, `GATE_A_PRIME`, or §5.1 (0 matches). | DR-2 record at `bc144b9`; IRR locus document (exists in IRR `main`) |
| A-F3 | Successor act §5.1 prohibits, "without a further act", "any existing `src/` module (including … `portfolio_store.ts`)" and "any existing test other than item 4". The DR-2 PA decision (2026-10-25) post-dates the act's effective date (2026-10-23). It is not written as an amendment of the act. Whether it is "a further act" is a PA determination. | Successor act §5.1 (blob `528de6ae…`, identical at `a9cd18e8`) |
| A-F4 | Item 12, `tests/g3_startup_validation.test.ts`: designated `9a5fd9e3…` (pre-modification); actual `edd0305e…`, changed by `c62dee8` (+12/−8). §5.1 item 4 authorizes "modified (bounded)". The `c62dee8` diff extends the existing static import-edge regression to the Gate A′ provisioning module and adds `src/index.ts` and `frontend/src/main.tsx` to the scanned set. That matches the purpose item 4 states. Whether the change is "bounded" is a PA judgment. §2.1 still designates the pre-modification blob. | Successor act §2.1 item 12, §5.1 item 4; `git show c62dee8 -- tests/g3_startup_validation.test.ts` |
| A-F5 | Successor act §8.2: "Basis commit/tree or any designated blob differs" is a stop. Items 10 and 12 differ at `001c3c80`, `a891802e`, `db84ac12` and `a9cd18e8` (10 of 12 match at each). The act's literal §8.2 stop is therefore currently met at each of those refs, independent of the authority question. At the act's basis `5fc74085`, 12 of 12 match. | Successor act §8.2 (act file, lines 283–289); §14.3 (carried) |
| A-F6 | Scope wording. §5.1 heading: "File set (exhaustive — no other path may change)". Its prohibitions name `package.json` (including `scripts`), the lockfile, tsconfig, vite config, workflows, migrations, existing `src/` modules, "any existing test other than item 4", and "any IRR path". §3 defines supersession with no workstream qualifier. The literal reading is repository-wide. No IPD record found states a narrower reading. | Successor act §3, §5.1 |
| A-F7 | Post-basis changes to files inside the §5.1 set (path-allowed, so not out of set by path): `gateAPrimeProvisioning.ts` (item 1; created `c62dee8`; modified `f9ec0c5`, `f722d7d`, `d2782f2`); `gateAPrimeValidation.ts` (item 2; created `c62dee8`; `f9ec0c5` +25/−4, identity constants); `tests/g3_gate_a_prime_successor_provisioning.test.ts` (item 3; created `c62dee8`). Act §5.2 states that compiled constants change only by a later act. The S1 determination is the claimed later act; it is not re-audited here. | `git show --numstat`; §14.5 (carried) |

**A-F8 — post-basis changes outside the §5.1 set.**

| Path | Commit (change) | Authority cited in the record | Status under the literal reading |
|---|---|---|---|
| `scripts/run-tests.mjs` | `c62dee8` (M, +5/−5) | Gate 4 act §4.2 row 1 (Limb A summary-parsing region) | Outside §5.1 set. The Gate 4 act authorizes a Limb A region, not the successor act's set |
| `scripts/test-summary-parser.mjs` | `c62dee8` (A, +19) | Gate 4 act §4.2 row 3 (conditional; present-with-digest). IPD execution tracker row for it (line 465) records blob `15c849fa…`, sha256 `a88e2289…` (carried; digest not verified) | Outside §5.1 set; conditional in the Gate 4 act |
| `tests/g4_run_tests_summary_parsing.test.ts` | `c62dee8` (A, +125) | Gate 4 act §4.2 row 2 ("Mandatory new file") | Outside §5.1 set |
| `scripts/verify-public-package.mjs` | `001c3c80` (M, +7/−3) | None located. 0 IPD tracker hits for `#96`, `pull/96` or `portfolio_ui_package`. IRR CV-CORR-123 §2 describes the change; CV-CORR-123 states it is "not … an implementation grant" | Outside §5.1 set; no IPD record located |
| `tests/portfolio_ui_package.test.ts` | `001c3c80` (M, +2/−2) | Same as above | Outside §5.1 set ("any existing test other than item 4"); no IPD record located |
| `src/persistence/portfolio_store.ts` | `bc144b9` (M, +274) | DR-2 (A-F2) | Outside §5.1 set; see A-F3 |
| `tests/q1_ipc_read_contract_conformance.test.ts` | `bc144b9` (M, +1264/−121) | DR-2 (A-F2) | Outside §5.1 set ("any existing test other than item 4"); see A-F3 |
| IPD execution tracker `evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md` | `c62dee8` (M, +87/−1) and later | Documentation | The act does not say whether evidence records are inside its "file set" |

### 15.5 Matter A — options and minimum rulings (none selected)

IRR cannot amend the successor act, its §2.1 table, or any IPD path. Every IPD-side option below needs a separate IPD pass.

| Option | Effect | Limits |
|---|---|---|
| A-O1 Record only (this section) | Records A-F1 to A-F8 as facts | Changes nothing in the act. §8.2 stays literally met. Unlocks no execution |
| A-O2 PA ruling on DR-2 as the "further act" for item 10 and the q1 test | Settles authority for the two DR-2 paths if the answer is yes | Does not by itself re-designate any blob |
| A-O3 Amended designated-blob list (IPD-side act) naming the observed blobs for items 10 and 12 at a named commit | Would clear §8.2 for those items at that commit | Needs A-O2 "yes" for item 10. Item 12 needs Q-A2 |
| A-O4 Fresh act rendering (new IPD-side act superseding §2.1 and §5.1 for a chosen commit) | Covers items 10 and 12 and the out-of-set paths in one instrument | Largest change. Needs a separate IPD pass |
| A-O5 Reversion (IPD change restoring the designated blobs) | Would restore the act's literal match | An IPD code change. Outside IRR |

**Minimum PA ruling per question (Matter A):**

- **Q-A1.** Is DR-2 (`IIPS-V3-CAP03-DR2-DQ1-PA-DECISION-2026-10-25-01` §2, with the two-path manifest in the DR-2 record) a "further act" under §5.1 for `portfolio_store.ts` and the q1 test? Yes or no.
- **Q-A2.** Item 12: does PA designate `9a5fd9e3…` (as §2.1 is written) or `edd0305e…` (the §5.1 item 4 modification)?
- **Q-A3.** Is the §5.1 "exhaustive" statement repository-wide (the literal reading) or limited to the successor-act pass? If repository-wide, for each path in A-F8: authorized by which record, or not.
- **Q-A4.** PR #96 (two files): does PA require an authorizing record? CV-CORR-123 states it is not an implementation grant.
- **Q-A5.** Mechanism: A-O1, A-O2 with A-O3, A-O4, or A-O5. If an IPD-side act is needed, which commit it names.
- **Q-A6.** §8.2: does PA rule that the stop is cleared by the outcome of Q-A1 to Q-A5, or that any execution needs a fresh designation first?

### 15.6 Matter B — refined facts

| ID | Fact | Source |
|---|---|---|
| B-F1 | CV-CORR-123 (2026-10-26, Program Authority direction) designates `001c3c80…` / `399fa44a…` as the "operative execution basis", with an exact two-file change set (§2). Its §5 grants it as the "P-1 execution-pin coordinate for the P-1 attempt of record, candidate-scoped" and states "P-1 execution is not authorised". | `docs/integration/IIPS_v3.0_CAP03_S2_CANDIDATE_SCOPED_BASELINE_DISPOSITION_2026-10-26.md` §§2, 5 |
| B-F2 | The formal record (L2a) states that `001c3c80` "does not carry `executingCommit`/`executingTree`". The DA-A1 receipt element is therefore unmet at the designated candidate. Carried: the receipt code at `001c3c80` is byte-identical to `888eb375` (one-pass packet §7.B; not re-read this pass). | Formal record row L2a (line 101); packet §4.2 |
| B-F3 | Capability versus receipt, static at `a9cd18e8` (`git grep`, this pass): `executionCommit` is declared (`src/persistence/gateAPrimeProvisioning.ts` lines 82–83); the expected pin is supplied by `--execution-commit` / `--execution-tree` (lines 277–304). The capability is present. No test was run this pass. No receipt exists at any commit, because no provisioning has been executed. | `git grep` at `a9cd18e8` |
| B-F4 | The expected pin is caller-supplied. The module reads no governed pin artifact (carried from the prior static read; line 277 re-anchored this pass). A designation therefore binds only through the operator's arguments and the designation act. | As B-F3 |
| B-F5 | Candidate pin versus execution pin. `5fc74085` is the compiled basis, not an execution pin (procedure line 127). `001c3c80` is the candidate-scoped DA-A1 coordinate (B-F1). No other D2 commit is designated. | Procedure line 127; CV-CORR-123 |
| B-F6 | Head versus merge. `001c3c80` (PR #96 head; tree `399fa44a`) and `1e76f4cf` (merge on `main`; tree `7003a282`) have different trees. CV-CORR-123 names the head commit and its tree. | §15.3 |
| B-F7 | Equal trees (§15.3) are not interchangeable commit identities (formal record §4.6). | Formal record §4.6 |
| B-F8 | Commit-dependent evidence. The candidate-scoped S2 evidence is bound to `001c3c80` / `399fa44a` (CV-CORR-123). Any other commit needs fresh S2 (L2a) and H-12 regeneration (L2c) before it is designated (§4.6 step 5). Step-0 blob `gateAPrimeProvisioning.ts` `9b15eca…` at `db84ac12` (carried; unchanged at `a9cd18e8`, §14.4 S-10). | Packet §4.2; §14.4 (carried) |
| B-F9 | Conflict. PA-1 (formal record line 42) adopts "H-12 adoption is not a prerequisite for P-1 provisioning". Formal record line 149 (§4.6 step 5) and row L2a (line 101) require "fresh S2 evidence (L2a) and H-12 regeneration with full validation (L2c)" at the designated commit. | Formal record lines 42, 101, 149 |
| B-F10 | Two different "S2"s. (a) Gate 4 act §6 (IPD, line 197): S2 = Limb A implementation, PR, CI, merge, read-back, then native-Windows canonical `npm test` at the post-merge commit ("AUTHORIZED — NOT STARTED"). (b) CV-CORR-123: the already-passing CAP-03 package-consumer candidate run (`evidence/integration/cap03-s2-published-evidence-readback-2026-10-26/`). Formal record row 272 reads "S2 acceptance (Gate 4 S2, Limb A) — OUTSTANDING". | Gate 4 act (IPD, `a9cd18e8`) line 197; CV-CORR-123 |
| B-F11 | Gate 4 QE pin. `a52b47b0` (pre-binding literal) and `c62dee81` share tree `1467802e`. C-1 / C-2 / C-3 remain open. The QE pin must not be designated as a side effect of B-1. | Formal record §§4.4–4.5 |

**Options (Matter B; none selected):**

- **B-0 Retain `001c3c80` as the P-1 coordinate.** The attempt would record no executing identity. The DA-A1 receipt element needs a waiver or deferral ruling (formal L2a). The PA-5 correction would not apply to that attempt.
- **B-1 Designate one D2 commit, or a later `C′`.** Candidates: §15.3 rows 3–6, or `C′` after IPD implementation. Designation must follow Matter A (items 10 and 12 differ at all four candidates). Requires fresh S2 and H-12 at that commit unless Q-B4 says otherwise. Names the commit and its tree.
- **B-2 Defer.** No designation until IPD reports a post-correction commit `C′` (separate IPD implementation prompt). P-1 remains not authorized; L2a is not executable.

**Minimum PA ruling per question (Matter B):**

- **Q-B1.** Which of B-0, B-1, or B-2 is accepted? One choice. IRR will not infer it.
- **Q-B2.** If B-0: does PA waive or defer the DA-A1 receipt element, and does the coordinate name the head `001c3c80` or the merge `1e76f4cf` (B-F6)?
- **Q-B3.** If B-1: which commit and tree from §15.3 rows 3–6 (or `C′`), and only after Q-A1 to Q-A6 are answered?
- **Q-B4.** Does H-12 regeneration (L2c) gate L2a, or does it belong to a later act (PA-1)?
- **Q-B5.** Naming (B-F10): PA states which "S2" each requirement refers to. No substantive decision is needed for this.
- The Gate 4 QE pin (C-1 / C-2 / C-3, B-F11) is a separate ruling and is not part of Matter B.

### 15.7 Matters C–F and procedure conflicts (classified)

| Conflict | Verified source | Classification | Minimum PA ruling or action |
|---|---|---|---|
| PF-10 coverage | Instrument `evidence/integration/cap03-pf11-root-safe-correction-2026-10-27/02-p1c-p1d-readonly-preflight-pf11-root-safe-v2.ps1` lines 91–98 check four named flags. Procedure line 146 (`$present`) checks the write-flag set; line 147 (`$primeFlags`) checks the `GATE_A_PRIME_*` wildcard; line 148 is the STOP | Ambiguous or overlapping requirement; instrument identity question | PA: narrow the procedure to the four named flags, or keep the wildcard and change the instrument (which needs its own identity and validation). Not inferred |
| Native harness | Bundle `06-runtime-availability.txt` line 6 and `10-powershell-static-parse-results.txt` line 8: native PowerShell execution "remains required before a subsequent capture". Procedure §4.3a line 172: DC-C2 "replaces the native PowerShell 5.1 harness prerequisite … for that attempt only". Formal record: DC-C2 adopted for the next capture | Documentary conflict between an older bundle statement and the later adopted DC-C2 scope | PA: confirm that DC-C2 replaces, rather than supplements, the native prerequisite for the next attempt |
| Root path | Procedure `D:\iips-evidence` at lines 131, 150, 167, 193, 440, 486; line 154 checks that `D:` is local fixed NTFS. Reported 10-27-02 root: `C:\IIPS-EVIDENCE\cap03-p1-20261027-02`. PF-14 INSUFFICIENT | Procedure correction requiring a prior decision; attempt-session condition | PA: choose the root. Then a procedure revision. PF-14 is observed in the attempt session |
| S2 naming | B-F10 | Ambiguous terminology | PA: name which S2 each requirement refers to |
| H-12 dependency | B-F9 | Ambiguous or overlapping requirement (adopted PA-1 versus adopted §4.6 step 5) | PA: whether H-12 regeneration gates L2a |
| Gate 4 Limb A status | Merge present: `a52b47b0` (PR #68 merge; parents `7f64d37a`, `c62dee81`); formal record row 29 (`pre-binding`). S2 Limb A acceptance OUTSTANDING: formal row 272; Gate 4 act line 197. IPD execution tracker line 407: "Implemented on this session branch" (not updated after the merge; carried) | Factual. The earlier "merge outstanding" statements are incorrect (C-1) | Gate 4 owner records the relationship. No Gate 4 movement from IRR |
| Matters C, D, E, F | Carried from packet §§5–8 | No source checked this pass changes their classification | None new. Each remains as in §§5–8 |
| V1183, V1186, V1187 | Tracker §16.168 | V1183 rerun and passes. V1186 and V1187 are not reproduced (no build or test executed in a session that can support them) | Corrected in tracker §16.169 (pointer under §16.168). No PA ruling |

### 15.8 Corrections to §14 (additive; §14 text is retained)

| # | §14 statement | Status | Correction |
|---|---|---|---|
| C-1 | §14.4 S-14; §11 ("Limb A merge (formal record: outstanding)"); §14.6 Limb A row | **Incorrect** | The merge exists: `a52b47b0` (merge of PR #68; parents `7f64d37a`, `c62dee81`). Formal record row 29 lists it. The formal record's OUTSTANDING item is S2 Limb A acceptance (row 272) |
| C-2 | §14.5: `src/persistence/gateAPrimeValidation.ts` "existing module" | **Incorrect** | It is successor act §5.1 item 2 (new). Created at `c62dee8` (+382). Modified at `f9ec0c5` (+25/−4, identity constants) |
| C-3 | §14.5: "`001c3c80` (+2/−2)" for the portfolio UI test only | **Incomplete** | PR #96 changed two files: `scripts/verify-public-package.mjs` (+7/−3) and `tests/portfolio_ui_package.test.ts` (+2/−2). Both are outside the §5.1 set. Neither appears in the IPD tracker |
| C-4 | §14.5: `tests/g4_run_tests_summary_parsing.test.ts` "documented under the Gate 4 authority" | **Incomplete** | Gate 4 act §4.2 row 2 names it as a "Mandatory new file". The Gate 4 Limb A paths are `scripts/run-tests.mjs` (row 1), the g4 test (row 2), and conditional `scripts/test-summary-parser.mjs` (row 3). Whether Gate 4 §4.2 is authority under the successor act's exhaustive set is Q-A3 |
| C-5 | §14.6: root references "lines 150, 154, 193, 440, 486" | **Incorrect citation** | Lines 131, 150, 167, 193, 440, 486 (grep of `D:\iips-evidence`). Line 154 is the local fixed NTFS check |
| C-6 | §14.6 PF-10 citation ("instrument lines 91–98") | **Confirmed; identity added** | Instrument: `02-p1c-p1d-readonly-preflight-pf11-root-safe-v2.ps1`. Procedure `GATE_A_PRIME_*` check at line 147 |
| C-7 | §14.6 Matter B row: "the D2 fields and T-10…T-16 are present and pass locally (§14.1, V1185–V1187)" | **Overstated** | Presence is static (this pass). "Pass locally" is withdrawn: V1186 and V1187 are not reproduced (V1203) |
| C-8 | §14.5 second observation on §8.2 | **Incomplete** | §8.2 is literally met now for items 10 and 12 (A-F5). The statement about non-designated files is correct and is kept |
| C-9 | §4.2 "DA-A1 pin of record" | **Clarified** | The basis of the pin is the candidate-scoped CV-CORR-123 designation (B-F1); it is not an unused candidate |
| C-10 | §14.7 Matter A option wording ("re-pin" versus "fresh act") | **Replaced** | See §15.5 (A-O1 to A-O5) |

### 15.9 Independent and blocked work

**Independent (no PA ruling needed; not host or P-1 work):** this section and tracker §16.169 (IRR documentation only). Nothing else in IRR is independent of the rulings below.

**Blocked:**

- Any P-1-C or P-1-D host observation, PF-11 diagnostic, DC-a / DC-b (V1102), or A6 runtime check: blocked by host authorization. `pwsh` is absent. Not performed.
- Any designation, pin change, or `C′`: blocked by Q-A1 to Q-A6 and Q-B1 to Q-B4.
- IPD receipt implementation (`C′`): separate IPD prompt. Not started.
- Gate 4 S2 native `npm test`: IPD and the Gate 4 owner. Not started.
- H-12 v3 regeneration: blocked by Matter A and Matter B.
- Capture: blocked by the PA capture authorization (not rendered) and by PF-01 to PF-17 status.

### 15.10 Non-grants and status boundary (this section)

No PA decision, approval, or signature. No option selected in any matter. No execution pin, `C′`, Gate 4 QE / H-12 pin, or successor-act designation set or changed. No change to `BASIS_COMMIT` or `BASIS_TREE`. No procedure, instrument, successor-act, or compiled-constant edit. No IPD write. No host, capture, PowerShell, `pwsh`, A6 runtime, V1102, PF-11 rerun, compatibility script, store action, or provisioning. No P-1 execution, authorization, or spending.

**P-1-C NOT ESTABLISHED. P-1-D DESIGNATED; NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.**

*End of §15 (`IIPS-V3-CAP03-P1C-P1D-PA-DECISION-PACKET-AF-2026-10-28-01`, addendum 2; `CV-CORR-149`).*

## 16. Reconciliation addendum 3 — current refs, PF-15 literal integrity, S2 status, IPD `aa43dec2`, naming, and corrections (`2026-10-28`)

**Scope.** Additive. Sections 0–15 are not rewritten. Pointers are inserted at §14.1 and at the head of §15 only. This section (a) records refs and facts verified in this pass, (b) corrects §15 where verified facts differ, (c) classifies the new conflicts, and (d) states the minimum PA ruling per open question. It makes no decision. It designates no commit, pin, `C′`, or Gate 4 QE/H-12 pin; changes no successor act, procedure, instrument, or compiled constant; and performs no IPD write, host action, capture, PowerShell run, or P-1 step. Tracker counterpart: `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` §16.170 (`CV-CORR-150`; `CHG-2026-10-28-14`; `V1207`–`V1222`).

### 16.1 Refs verified this pass (read-only)

| Repository | Ref | Identity | Verification |
|---|---|---|---|
| IRR | `main` | `758478be3bc020f78444bebf1e98f108e3770c12` (PR #350 merge, `2026-10-28T07:52:57Z`) | `git ls-remote`; open IRR PRs 0 |
| IRR | `arena/f1566976-iips-review-recovered` (this session) | local HEAD `758478be`; no remote branch of this name existed before this pass | `git ls-remote 'refs/heads/arena/f1566976*'` → 0 lines |
| IRR | `arena/3930db71-iips-review-recovered` | `a8a72aeb…` (PR #350 head; merged; historical) | `git ls-remote` |
| IPD | `main` | `aa43dec2df76cc5dd5077c9806b3c97ea8e428b6`, tree `244f87bfa13a060247e8dd6cd4cca07a0f71971e`; PR #103 merge; parents `a9cd18e8…`, `753017d2…` | `git ls-remote`; `gh pr view 103` (MERGED; head `753017d2`); open IPD PRs 0 |
| IPD | PR #103 head | `753017d2487ff2c6125eda47719e2ce48b061901`, tree `244f87bf…` | blobless clone `git rev-parse` |
| IPD | `a9cd18e8` (former `main`, §15.1) | tree `546c8cea…` | ancestor of `aa43dec2` (verified) |

**Supersession.** The §15.1 refs are historical as current refs: IRR `main` `f45cfaf1` is now `758478be`; IPD `main` `a9cd18e8` is now `aa43dec2`. Both are still ancestors of their successors.

**Carried, not re-run this pass:** the D2 `tsc` and focused-run results (§14.1, V1204); the 12-blob comparison at `a9cd18e8` (§14.3; the two differing blobs were re-read this pass at `aa43dec2` and match); the PR #97 and CV-CORR-123 readings (§15.1 carried wording).

### 16.2 Corrections to §15 (additive; §15 text is retained)

| # | §15 statement | Status | Correction |
|---|---|---|---|
| C-11 | §15.10 "No execution pin … set or changed"; read with "no pin designated" | **Too loose** | CV-CORR-123 §§2, 5 designates `001c3c80` / `399fa44a` as the candidate-scoped operative basis and as the P-1 execution-pin coordinate for the P-1 attempt of record. That is an existing record and is not changed here. This pass designates no new pin, `C′`, or Gate 4 QE/H-12 pin, and does not convert the existing coordinate into a §4.6 designation. |
| C-12 | §15.8 C-3 "Neither appears in the IPD tracker" | **Superseded** | IPD `aa43dec2` (PR #103) adds a 120-line PR #96 record to the IPD execution tracker (§16.4). It is documentation only and grants no authority. The authorizing-record question is restated as Q-A4 (§16.8). |
| C-13 | §15.4 A-F6 and §15.5 Q-A3: "No IPD record found states a narrower reading" | **Superseded in part** | IPD PR #103 §6 says the scope question was "returned to the Program Authority on 2026-10-28 as **Matter A Q4**". No IRR record uses that label (grep: 0 hits). It is mapped to Q-A3 (§16.5 I-2). IPD states no narrower reading. |
| C-14 | §15.6 B-F8 and B-F10 (S2 evidence) | **Incomplete** | Adds the candidate-scoped S2 acceptance and its residuals (§16.6 S-1 to S-6). "S2" is used for four different requirements (§16.7 N-2). |
| C-15 | §15.7 "No source checked this pass changes [Matters C–F]" | **Incomplete** | Adds the PF-15 literal-integrity item (§16.7 P-1 and P-2) and the naming collision (§16.7 N-1). Matters C–F are otherwise unchanged. |
| C-16 | §15.1 current refs | **Historical** | Superseded as current refs by §16.1 (see the supersession note above). |

### 16.3 Candidate identity addition (factual; not a designation)

| Role | Commit | Tree | Parent(s) | Date (UTC) | Record that names it |
|---|---|---|---|---|---|
| IPD PR #103 head (evidence-only) | `753017d2487ff2c6125eda47719e2ce48b061901` | `244f87bf…` | `a9cd18e8…` | 2026-10-28 | IPD PR #103 |
| IPD PR #103 merge = current IPD `main` (evidence-only) | `aa43dec2df76cc5dd5077c9806b3c97ea8e428b6` | `244f87bf…` (equal to `753017d2`) | `a9cd18e8…`, `753017d2` | 2026-10-28T07:44:32Z | IPD PR #103 |

Verified facts for `aa43dec2`:
- It is a descendant of the compiled basis `5fc74085`, of DA-A1 `001c3c80`, and of every candidate in §15.3 (ancestry verified, §16.9 V1208).
- The only file changed since `a9cd18e8` is the IPD execution tracker (`git diff --numstat`: +120/−0).
- The three runtime blobs that matter for Matter A are identical to `a9cd18e8`: `src/persistence/portfolio_store.ts` `540d49f2…`; `tests/g3_startup_validation.test.ts` `edd0305e…`; `src/persistence/gateAPrimeProvisioning.ts` `9b15eca3…`.
- Its IPD check runs (`executed test count`; `typecheck · build · test`) report `success`. These are CI check-run results read through the GitHub API. No build or test was run locally in this pass.

Status: recorded as an option only (§16.8 B-O4). It adds no runtime change, no receipt, no S2 run and no H-12 regeneration. Equal trees are not interchangeable commit identities (formal record §4.6). The tree of `aa43dec2` equals that of `753017d2`, not that of `a9cd18e8`.

### 16.4 IPD PR #96 record at `aa43dec2` (factual)

- It records the PR #96 two-file change: `scripts/verify-public-package.mjs` (+7/−3; blob `e556afde…`) and `tests/portfolio_ui_package.test.ts` (+2/−2; blob `ecbc365d…`). Both are unchanged since `1e76f4cf` (IPD record §2).
- Its status line reads: full S2 evidence acceptance **NOT RENDERED**; D1 **PENDING**; D4 **NOT RENDERED**; D2 closed only as a reported fact (IPD record, status table).
- It states that it is "historical evidence only", grants no authority, and designates no commit, pin, or QE/H-12 pin (its §7).
- Four of its statements need classification (§16.5). The IPD record is IPD-owned. It is not edited in this pass.

### 16.5 IPD PR #103 statements — classification (IPD-owned; not edited)

| # | IPD statement (record at `aa43dec2`) | Checked against | Classification |
|---|---|---|---|
| I-1 | §5.1 "does not name `scripts/` or `tests/portfolio_ui_package.test.ts`" (§6) | Successor act §5.1 prohibits "any existing test other than item 4" and "any IRR path", and declares the set "exhaustive" | Literally true but incomplete. §5.1 bars every existing test except item 4, which covers the PR #96 test path. The `scripts/` path is not named, but it falls under the exhaustive clause (A-F6). |
| I-2 | "Matter A Q4" (§6) | IRR grep: 0 hits. The IRR packet's scope question is Q-A3 (§15.5) | Label cannot be resolved as written. For this packet only, it is mapped to Q-A3. |
| I-3 | "neither repository tree contains them" (raw bytes of the 47 manifest-listed files; §8) | IRR `main` contains 51 files from the PR #310 deposit under `evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26/` (for example `s2-05-package-consumer.txt`). CV-CORR-124 A2 reports 46/47 digests reproduced from those committed bytes | Accurate only for the host originals. IRR holds transferred copies. Conflicts with the IRR record (S-2). |
| I-4 | D1 "PENDING"; the 47 files "have not been independently re-hashed" (§8) | CV-CORR-124 A2: "46/47 digests reproduced from committed bytes (9/9 required)"; R-2 open | Different objects: IPD refers to host originals, IRR to committed copies. The record should say so. Not reconciled. |

### 16.6 S2 status — reconciled facts and conflicts (no ruling)

| ID | Fact | Source |
|---|---|---|
| S-1 | IRR CV-CORR-124 (§16.144; `CHG-2026-10-26-26`) renders the record `IIPS-V3-CAP03-S2-EVIDENCE-ACCEPTANCE-2026-10-26-01` as "ACCEPTED — CANDIDATE-SCOPED" on `001c3c80` / `399fa44a` (A9 RENDERED). A4 and A8 are SATISFIED (candidate-scoped). A6 (DQ-4 criterion 7) and A7 (DQ-4 criterion 8, native-Windows canonical evidence) are NOT MET. | `docs/integration/IIPS_v3.0_CAP03_S2_EVIDENCE_ACCEPTANCE_2026-10-26.md`; `evidence/integration/cap03-s2-published-evidence-readback-2026-10-26/07-acceptance-outcome.json` (carried) |
| S-2 | Acceptance record A2: 46/47 digests reproduced (9/9 required); R-2 open (`s2-checkout-verification.txt` digest does not reproduce). A3: "NOT AVAILABLE — recorded as R-1, not waived". The 47-entry verification output that reported PASS is absent from the deposit and from IRR `main`, and is user-reported. | Same record, A2, A3, R-1, R-2 |
| S-3 | IRR tracker top state (line 16) says the 47-entry verification is "COMPLETE AND CLOSED on the user's reported Windows `PASS`". The acceptance record (A3, R-1) says the output is not available. | Tracker line 16; acceptance record A3 |
| S-4 | IRR unified status reconciliation (IPD PR #98; registered §16.139, `CV-CORR-126`) states "full S2 evidence acceptance NOT RENDERED" and D1 "PENDING" (its lines 55, 103–104, 123). IPD PR #103 repeats this. | `docs/integration/IIPS_v3.0_CAP02_CAP03_UNIFIED_AUTHORITATIVE_STATUS_RECONCILIATION_2026-10-26.md` |
| S-5 | The acceptance record's `deposit.post_merge_ci_run` reads `40360279234 … in_progress null`. The run is now `completed` / `success` on `47133fe4`. The field is stale. No record was edited. | `gh api` read this pass; acceptance record `07` |
| S-6 | PR #310 deposit: merge `47133fe489e80de2af5f1b537d67865a6a7235b9`; exact-head CI `40359958909` success (carried from §16.144). The merge is on IRR `main`. | Tracker §16.144; this pass (ancestry, post-merge check) |

**Conflicts (classified; not resolved here).**
- "Full S2 evidence acceptance NOT RENDERED" (S-4) and "ACCEPTED — CANDIDATE-SCOPED" (S-1) are consistent only if "full" means unscoped. No record defines the term.
- The tracker's "CLOSED" (S-3) is stronger than the acceptance record's R-1 (S-2).
- D1 "PENDING" (IPD) and the 46/47 committed-copy reproduction (IRR A2) concern different objects (I-4).
- The ruling needed is Q-S2-1 (§16.11).

### 16.7 PF-15 literal integrity and naming conflicts (classified)

| ID | Fact | Classification | Minimum PA action |
|---|---|---|---|
| P-1 | The PF-15 act `-02` (blob `3fe9a2dd`) is on IRR `main` via PR #304 (head `8ca8e874155193142bf1393011c9c64629d6a7fd`; merge `6e080f89d0cec40ebbc0656f27435588c97a7278`, `2026-10-26T13:41:29Z`). Exact-head check `Typecheck · Test · Build` run `121605234743`: success. Post-merge check run `121606348075` on the merge: success. The act makes itself effective on those conditions. Those conditions appear met. | Receipts verified | None for effectiveness |
| P-2 | `-02` states that `-01` (PR #302; head and merge `59bd379` / `e15b700`) published F2, F4 and F5 "with excess literal backslashes", and that the bytes "do not equal" the approved strings. Measured bytes: `-01` (`59bd379`) and `-02` (`3fe9a2dd`) are identical for F2 (`\\.\pipe\iips-user-portfolio-v1`, 4 backslashes, 31 B), F4 (`C:\iips-data\iips\user-portfolio.sqlite`, single backslashes, 39 B, 3 separators) and F5 (`C:\iips-evidence\cap03-gate4`, single backslashes, 28 B). `8ca8e87` changed the title, status, correction section and header, not the F-rows. The 10-26 literal-integrity file (`evidence/integration/cap02-cap03-unified-reconciliation-2026-10-26/05-pf15-literal-integrity.txt`) reports the `-01` and `-02` F-rows identical. The 10-27 host reconciliation (line 20) records F4 as 39 bytes, 3 × U+005C, hex `433a5c69…`; decoded, this is `C:\iips-data\iips\user-portfolio.sqlite`. | The "excess backslash" premise is **not reproduced** in any committed byte. The operative F2/F4/F5 values are the same under `-01` and `-02`. Whether the PA's approved strings are these bytes is a PA confirmation item. The directive text is not in the repository, so no agent can confirm it. | Q-P1 |
| N-1 | Label collision. "C-1/C-2/C-3" names both the Matter C options (§5.3, lines 161–163) and the Gate 4 QE/H-12 pin choices (§4.4 line 121; formal record §4.5 lines 137–139; §15.6 B-F11). The two sets have different meanings. | Naming conflict | Q-N1 |
| N-2 | "S2" and "npm test". The CAP-03 candidate run at `001c3c80` is the canonical guarded `npm test` (`924 / 920 pass / 0 fail / 4 skip`; guard OK; exit 0; acceptance record line 42). Gate 4 act §6 (IPD `a9cd18e8`, line 197) requires the native-Windows canonical `npm test` at the **post-merge Limb A commit**. These are the same command at different commits. Acceptance A7 (DQ-4 criterion 8) is NOT MET. No record establishes that the 924 run satisfies Gate 4 S2 Limb A. | Naming and acceptance-scope conflict | Q-S2-2 |
| H-N | Carried unchanged from §15.7: native harness (DC-C2 replaces the native prerequisite for the next attempt only); root path (`D:` procedure vs reported `C:`); PF-10 coverage (instrument checks four named flags; procedure checks the write-flag set and the `GATE_A_PRIME_*` wildcard); H-12 dependency (PA-1 versus formal §4.6 step 5 and L2a). | Unchanged | Carried minimum rulings (§15.7; §16.11) |

**Naming proposal (labels only; not a decision).** Matter C options: "Matter C-1 / C-2 / C-3". Gate 4 QE/H-12 pin options: "QE-pin C-1 / C-2 / C-3". The original text is not renamed.

### 16.8 Matters A and B — updated options and dependencies (none selected)

**Matter A (successor act §5.1 and the out-of-set paths):** the options A-O1 to A-O5 (§15.5) are unchanged. Two new facts bear on them:
- IPD PR #103 provides no further act (I-1, I-2). It cannot satisfy Q-A1 or Q-A2.
- The PR #96 record exists on `main` at `aa43dec2` (§16.4). It does not answer whether an authorizing act is required (Q-A4).

**Matter B (candidate identity and receipts):** options B-0, B-1 and B-2 (§15.6) are unchanged. One new option:
- **B-O4 (new; option only; not selected).** Add the evidence-only successor `aa43dec2` (tree `244f87bf`; §16.3) as a candidate row in B-1. It has the same runtime as `a9cd18e8`. Every Matter A dependency, and the S2 and H-12 requirements of §4.6 step 5, apply to it exactly as they apply to `a9cd18e8`. It satisfies none of them.

**Receipt capability versus receipt (carried; unchanged).** The D2 receipt capability (`executionCommit` declared; expected pin supplied by `--execution-commit` / `--execution-tree`) is present at `a9cd18e8`. The runtime is identical at `aa43dec2`. No receipt exists at any commit, because no provisioning has been executed. The DA-A1 receipt element is unmet (formal record L2a).

**Candidate pin versus designated execution pin.** `5fc74085` is the compiled basis, not an execution pin (procedure line 127). `001c3c80` is the candidate-scoped operative basis and P-1 coordinate under CV-CORR-123. No new execution pin is designated.

**Commit-dependent evidence and deferral.** Evidence is bound to the commit that produced it. Any other commit requires fresh S2 (L2a) and H-12 regeneration (L2c) before it is designated (§4.6 step 5). Deferral is option B-2.

### 16.9 Verification register

Rows `V1207`–`V1222` are in tracker §16.170.3. They are not duplicated here. Each row names the ref, command or record it was checked against, and its result. Carried results are labelled as carried. `V1186` and `V1187` remain WITHDRAWN (`V1203`, tracker §16.169). `V1192` remains deferred.

### 16.10 Independent and blocked work (updated)

**Independent (IRR documentation only; no PA ruling needed):** this section and tracker §16.170.

**Blocked:**
- Any P-1-C or P-1-D host observation, PF-11 diagnostic, DC-a / DC-b (V1102), or A6 runtime check: blocked by host authorization. `pwsh` absent. Not performed.
- Any designation, new pin, `C′`, or pin change: blocked by Q-A1 to Q-A6, Q-B1 to Q-B7.
- Any host use of F2 / F4 / F5 (including the P-1 `$StorePath`): blocked by Q-P1 (confirmation of the approved bytes) and by the P-1 authorization that is NOT granted.
- Gate 4 S2 Limb A evidence: blocked by Q-S2-2 and by the Gate 4 owner. Not started.
- IPD correction of the PR #103 record (I-1 to I-4): IPD-owned; not authorized in this session; not started.
- IPD receipt implementation (`C′`): separate IPD prompt; not started.
- H-12 v3 regeneration: blocked by Matters A and B.
- Capture: blocked by the PA capture authorization (not rendered) and by PF-01 to PF-17 status.

### 16.11 Minimum PA ruling per open question

| Question | Minimum ruling needed | Blocks |
|---|---|---|
| Q-A1 | Is DR-2 (`…DR2-DQ1-PA-DECISION-2026-10-25-01` §2) a "further act" under §5.1 for `portfolio_store.ts` and the q1 test? Yes or no | Matter A; §8.2 |
| Q-A2 | Item 12: designate `9a5fd9e3…` (as §2.1 is written) or `edd0305e…` (§5.1 item 4)? | Matter A |
| Q-A3 (= IPD "Matter A Q4", I-2) | Is the §5.1 "exhaustive" clause repository-wide or workstream-scoped? If repository-wide, which record authorizes each path in §15.4 A-F8? | Matter A |
| Q-A4 | Does PA require an authorizing act for the two PR #96 paths? If yes, does the IPD evidence record at `aa43dec2` (documentation only) satisfy it? | Matter A |
| Q-A5 | Mechanism: A-O1, A-O2 with A-O3, A-O4 or A-O5. If an IPD-side act is needed, which commit does it name? | Matter A |
| Q-A6 | §8.2: is the stop cleared by Q-A1 to Q-A5, or does any execution need a fresh designation first? | Matter A |
| Q-B1 | Which option is accepted: B-0, B-1 or B-2? One choice. | Matter B |
| Q-B2 | If B-0: waive or defer the DA-A1 receipt element? Does the coordinate name the head `001c3c80` or the merge `1e76f4cf` (B-F6)? | Matter B |
| Q-B3 | If B-1: which commit and tree (§15.3 rows 3–6, §16.3, or `C′`), and only after Q-A1 to Q-A6? | Matter B |
| Q-B4 | Does H-12 regeneration (L2c) gate L2a, or does it belong to a later act (PA-1)? | Matter B; H-12 conflict |
| Q-B5 | Naming: which "S2" each requirement refers to (N-2). No substantive decision. | Naming |
| Q-B6 (new) | Is `aa43dec2` (B-O4) eligible as a B-1 candidate row at all? Yes or no. The default is that §4.6 step 5 applies. | Matter B |
| Q-B7 (new) | Does the 924/920/0/4 run at `001c3c80` count toward Gate 4 S2 Limb A (N-2)? Yes or no. IRR does not infer it. | Gate 4; Q-S2-2 |
| Q-S2-1 (new) | Which S2 record is the acceptance of record for L2a? Is "full S2 evidence acceptance" (S-4) distinct from candidate-scoped acceptance (S-1)? Is D1 open or closed (S-2, I-4)? Is the R-1 "PASS" closed or open (S-3)? | S2 status; Matter B |
| Q-S2-2 (new) | Does the CAP-03 candidate `npm test` run at `001c3c80` satisfy Gate 4 S2 Limb A at the post-merge commit? If not, a separate native run at the Gate 4 commit is required under the Gate 4 act. | Gate 4 S2 |
| Q-P1 (new) | Confirm the approved byte-level F2, F4 and F5 values: F2 `\\.\pipe\iips-user-portfolio-v1` (31 B); F4 `C:\iips-data\iips\user-portfolio.sqlite` (39 B, single backslashes); F5 `C:\iips-evidence\cap03-gate4` (28 B, single backslashes). Or issue a further act. | Any host use of F2 / F4 / F5 |
| Q-N1 (new) | Adopt the naming in §16.7 (N-1), or name the options otherwise. Labels only. | Naming |
| Native harness | Confirm DC-C2 replaces, rather than supplements, the native PowerShell prerequisite for the next attempt (§15.7). | Next capture |
| Root path | Choose the root (`D:` procedure or `C:` reported); then a procedure revision. PF-14 is observed in the attempt session. | Next capture |
| PF-10 | Narrow the procedure to the four named flags, or keep the wildcard and change the instrument (own identity and validation). | Next capture |
| H-12 dependency | Confirm whether H-12 regeneration gates L2a (Q-B4). | Matter B |

### 16.12 Non-grants and status boundary (this section)

No PA decision, approval, or signature. No option selected in any matter. No execution pin, `C′`, Gate 4 QE/H-12 pin, or successor-act designation set or changed. No change to `BASIS_COMMIT` or `BASIS_TREE`. No procedure, instrument, successor-act, or compiled-constant edit. No IPD write (no IPD edit, branch, PR, or push). No host, capture, PowerShell, `pwsh`, A6 runtime, V1102, PF-11 rerun, compatibility script, store action, or provisioning. No build or test run in this pass. No S3, QE, DQ-4, Gate 4, or Gate 5 movement. Production out of scope.

**P-1-C NOT ESTABLISHED. P-1-D DESIGNATED; NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.**

*End of §16 (`IIPS-V3-CAP03-P1C-P1D-PA-DECISION-PACKET-AF-2026-10-28-01`, addendum 3; `CV-CORR-150`; `CHG-2026-10-28-14`; `V1207`–`V1222`).*
