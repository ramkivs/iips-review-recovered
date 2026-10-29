# CAP-03 — IPD-S1 publication reconciliation and remaining dependency handoff (2026-10-28)

> **RECORD ONLY.** This record makes no PA decision, adopts nothing, designates nothing, moves no gate and records no acceptance. It reconciles one published IPD result into IRR and hands off every remaining dependency with its owner and closure evidence.
>
> **P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.**

**Repository boundary.** IRR writes only to `ramkivs/iips-review-recovered`. IPD (`ramkivs/iips-production-market-data`) was read only in this pass.

---

## 0. Baseline verified before this pass (read-only, 2026-10-28)

| Ref | Value | Verification |
|---|---|---|
| IRR `main` | `82b3f4a5d31134e40fd3a1a23169a0ca8d638dfc` (unchanged) | `git ls-remote`. Does not contain §16.176 or the CAP-03 pass-2/3 records; they live on PR #353 only. |
| IRR session branch | `arena/b776c15a-iips-review-recovered`, `822ef100b2f24f5d54f2aa7e22bea19040cf8476` before this pass | `git ls-remote`; matched local HEAD. |
| PR #353 | OPEN, not draft, base `main`, head `822ef100`, **not merged** | `gh pr view`. No merge authorization exists. |
| IPD `main` | `b9dd6fce48fafba8ca6095debefb62fd54234f85` | `git ls-remote`. Parents `0edadb2d…` (first) and `bda1f057…` (PR #108 head). |
| IPD PR #108 | MERGED `2026-10-28T15:47:00Z`; merge `b9dd6fce`; head `bda1f057386b89221194e3a1d83f608d9c7cc0a7`; head tree `34ee1a3b97b787a4bdbc6d27943c6c4cfb1f6f6f` | `gh pr view 108`; `git rev-parse bda1f057^{tree}`. |
| IPD CI | `bda1f057` and `b9dd6fce`: "typecheck · build · test" success; "executed test count" success | Check-runs API. |

---

## 1. IPD-S1 pointer publication — verified remotely

| Item | Verified value |
|---|---|
| PR #108 change set (first parent `0edadb2d` → `b9dd6fce`) | 3 paths: `A` the S1 act; `M` the §12.2 determination; `M` the IPD tracker. No code, test, script, manifest or workflow path. |
| S1 act | `evidence/cross-repository/IIPS_V3_CAP03_S1_POINTER_ACT_01_EFFECTIVE_2026-10-28.md`, blob `5afe4236eacd6c223305955df411c50b85f46c4b` |
| Record ID | `IIPS-V3-CAP03-S1-POINTER-ACT-01-2026-10-28-01` |
| Pointer location | Dated block appended under §12.2 of `evidence/cross-repository/IIPS_V3_CAP02_S1_IDENTITY_VALUE_DETERMINATION_EFFECTIVE_2026-10-24.md`, blob `845ee551…` |
| Pointer change size | `+25 / −0` lines (`git diff --numstat`). No removed or altered line. §12.2 text preserved verbatim. |
| Publication receipt | IPD execution tracker `evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md`, blob `b46dce34…`; section "CAP-03 — IPD-S1 pointer act executed"; `+63 / −0` |
| Prompt identity cited by the act | IRR `docs/integration/IIPS_v3.0_CAP03_IPD_PROMPT_S1_POINTER_2026-10-28.md`, blob `d6d4fbe658d0c172c1f79e59705728c7b047ff2d` (1,200 bytes). Verified at `caca0213`. |
| Governing text identified (not executed) | Gate 4 target-host qualification act `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-23-01`, §6 "Q5", row **S1** = "Gate A′ provisioning execution on `desktop-no0nhtp` — **BLOCKED**". |
| Status after publication | S1 remains **BLOCKED**; Gate A′ provisioning **NOT AUTHORIZED**; Gate 4 **AUTHORIZED — NOT STARTED**; `H-12` as stated in the IPD texts (see §5, F4). |

**Distinction preserved.** The pointer identifies which text governs S1 and records a measured `10/12` discrepancy in §12.2. It does not execute S1. The act's own §4 says the S1 *step* is not executed.

**Consistency with A-Q5.** PR #108 changes no code path, so the A-Q5 designated-blob state at `0edadb2d` carries to `b9dd6fce` (`0edadb2d` is the first parent). The pointer's statement that items 10 and 12 were re-designated by the A-Q5 act is consistent with `IRR …IPD_A-Q5_RESULT_RECORD_2026-10-28.md`. A-Q5 and A-GAP1 were not reopened and not re-investigated.

---

## 2. IRR reconciliation performed in this pass

| Record | Action | Reason |
|---|---|---|
| `docs/integration/IIPS_v3.0_CAP03_IPD_A-Q5_RESULT_RECORD_2026-10-28.md` §5 | Status corrected from "PENDING, not published" to "PUBLISHED, verified" with the IPD references | This is the current IRR record of IPD-S1, and its status was stale. |
| `docs/integration/IIPS_v3.0_CAP03_PA_RULINGS_RECORD_PASS2_2026-10-28.md` §9 | Dated pointer | The §5 "still open" line names IPD-S1 as open. Historical text is not rewritten. |
| `docs/integration/IIPS_v3.0_CAP03_PA_DESIGNATION_RECORD_PASS2_2026-10-28.md` §8 | Dated pointer | Designation record states the S1 dependency. |
| `docs/integration/IIPS_v3.0_CAP03_P1_PA_RULING_SESSION_ADDENDUM_1_2026-10-28.md` §7 | Dated pointer for P-3 (IPD-S1) status | Addendum §7 row P-3 is a trigger table; pointers only, per its own convention. |
| `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` §16.177 | New section with the publication receipt, verification register and handoff pointer | Tracker reconciliation required by the task. Appended after §16.176. |

**Deliberately not edited:**
- The S1 prompt (`IIPS_v3.0_CAP03_IPD_PROMPT_S1_POINTER_2026-10-28.md`). The IPD act cites its blob `d6d4fbe6`; editing it would break that published reference.
- The R5 H-12 adoption act (effective on IRR `main`). Its tracker receipt is the place for cross-locus status; the act is not amended (see F5).
- The PA status matrix and the formal decision record. Their dated statements are superseded by pointer in §5 below.
- The user's Library tracker. Not modified.

---

## 3. Dependency matrix

Type key: **DOC** = documentation only; **REPO** = repository-executable by IRR; **IPD** = requires a separate IPD prompt (IRR does not write IPD); **OP** = operator-executable on the host; **PA** = Program Authority decision.

### 3.1 IRR reconciliation of the completed IPD-S1 publication — **COMPLETE** (this pass)
- **Governing records:** the S1 act, the §12.2 pointer and the IPD receipt (§1 above).
- **Status:** complete and remotely verified. Type: DOC.
- **Owner:** IRR. No dependency. Parallel: n/a.
- **Next action:** none in IRR for S1. S1 *execution* is a separate, currently BLOCKED step (§3.11).
- **Closure evidence:** met by this record and the tracker §16.177.

### 3.2 Gate 4 §4.6 step 5 (reconciliation of the designated pin) — **OPEN**
- **Governing record:** `docs/integration/IIPS_v3.0_CAP03_PA_DESIGNATION_RECORD_PASS2_2026-10-28.md` §1 (designation A, G4P-1, `a891802e` / tree `76f083d7`; blobs `5f49936b`, `1f666216`).
- **Status:** steps 1, 2, 4 satisfied. Step 3 Linux CI satisfied, native-Windows not claimed (the record says the act's requirement for native Windows is not established). **Step 5 NOT satisfied** (fresh S2 and H-12 at `a891802e` not produced). Step 6 open until step 5.
- **Designated pin vs. adopted pin:** a designated pin is not an accepted pin. No dependent acceptance or execution may rely on `a891802e` until steps 5 and 6 are complete.
- **Owner:** IRR determination record after operator and IPD/IRR evidence.
- **Prerequisites:** §3.3 (native S2) and §3.4 (H-12 at the pin).
- **Parallel:** n/a (it is the join point).
- **Next action:** none until §3.3 and §3.4 evidence exists.
- **Closure evidence:** (i) verified fresh native S2 transcript at `a891802e`/`76f083d7`; (ii) verified H-12 regeneration and validation at `a891802e`; (iii) IRR determination record applying step 5 and step 6 identity check.
- **Type:** DOC (after evidence).

### 3.3 Native S2 at the designated pin (route (c), fresh L2a) — **ELIGIBLE, NOT STARTED**
- **Governing records:** `docs/integration/IIPS_v3.0_CAP03_PA_RULINGS_RECORD_PASS2_2026-10-28.md` Q-S2-2 (route (c) recorded); designation A (G4P-1).
- **Status:** the pin is designated, so the route (c) prerequisite is met. **No S2 run at `a891802e` exists.** Nothing has been run. Type: OP.
- **Required environment (from the records):** designated host `desktop-no0nhtp`; native Windows 11 (`process.platform === 'win32'`); non-elevated operator (Ramki); Node `>=22.13.0 <23`, flag-free `node:sqlite`; clean full-history checkout of `ramkivs/iips-production-market-data` at `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` / tree `76f083d7058e170d8212455c03bad1033136ee68`.
- **Host confirmation for this pin:** the designation record does not name the host for the `a891802e` run. The host and procedure are taken from the 2026-10-25/26 S2 records and must be confirmed by the PA before the run.
- **Prior host history (verified in IPD):** the 2026-10-25 record `IIPS_V3_CAP03_S2_HOST_PRECONDITION_BLOCKER_2026-10-25.md` (IPD blob at `b9dd6fce`) records `S2 NOT EXECUTED` because the designated host was unreachable from the executing environment, with no substitution. The deposited 2026-10-26 checkout-verification header records `Host: DESKTOP-NO0NHTP`. That 2026-10-26 run is at `8eec74ae`, not `a891802e`, and is not a substitute for this run. Its raw transcripts were not re-verified in this pass.
- **Required command sequence:** the S2 sequence used in the 2026-10-26 run (evidence files `s2-01` to `s2-05` in `evidence/integration/cap03-s2-…`). The current S2 procedure text for `a891802e` has not been re-checked in this pass and must be confirmed.
- **Do not confuse with the Gate 4 act's S2 row.** The act's row S2 is "Limb A implementation → PR → CI → `--merge` → read-back → native-Windows canonical `npm test` at the post-merge commit", status NOT STARTED. Limb A is at `a52b47b0`, not this pin. G4P-1 expressly does not authorize the Limb A run.
- **Evidence required to close:** native transcript with host identity, `win32` platform, Node version, the commit and tree `a891802e`/`76f083d7`, each step exit code and output; the operator's R-1 47-entry output (non-blocking per Q-S2-1); a checkout-verification digest for this run that reproduces from its own file (see §3.5 for why this matters).
- **Parallel:** yes, with §3.4 and §3.5. **Blocked by:** no IRR-side dependency. Operator availability and host reachability are the external blockers. PA confirmation of host and procedure (above) is required first.
- **Next action (operator):** confirm `desktop-no0nhtp` reachability from the operator's machine and run the route (c) S2 at `a891802e` under the confirmed procedure. Do not substitute Linux, WSL, CI or an alternate commit.

### 3.4 H-12 at the designated pin (L2c) — **NOT ADOPTED AT THIS PIN**
- **Governing records:** `docs/integration/IIPS_v3.0_CAP03_G4_H12_R5_PA_ADOPTION_ACT_EFFECTIVE_2026-10-25.md` (R5, adopted); designation A.
- **Status by pin:**
  - **Pin `8eec74ae` / `ba64b2d5` (R5):** adopted, effective on IRR `main` via PR #279, merge `ae82be857a554d96e6c2cffc0d519e99135effdd`. IPD mirror receipt published at IPD `cddee59` ("registration only", see F5).
  - **Pin `a891802e` / `76f083d7` (designation A):** **not adopted.** H-12 regeneration at this pin is not started.
- **Path and tooling (verified on IRR `main`):** the R5 generator `evidence/integration/cap03-dq6b-path-a-2026-10-25/23-h12-r5-generator.py`; the R5 validator `evidence/integration/cap03-h12-r5-adoption-2026-10-25/21-h12-r5-adoption-criteria-validator.py`; and validation output `…/22-h12-r5-adoption-criteria-validation.txt`. The path and tooling have been established and run at `8eec74ae`. They have **not** been assessed for `a891802e`; no record of such an assessment was found.
- **Owner per matrix:** IPD, with IRR.
- **Prerequisites:** a PA direction that regeneration is to be run at `a891802e` (the R5 adoption does not carry over by itself; the designation record's step 5 names H-12 regeneration at the designated commit).
- **Parallel:** yes, with §3.3. The two do not depend on each other for step 5 (see the ordering point in §5, F6).
- **Next action:** PA direction on regeneration at `a891802e`, then the IPD/IRR regeneration run. No H-12 claim may be made until its evidence exists.
- **Evidence required to close:** regeneration output and validation at `a891802e`/`76f083d7`; an adoption act at that pin; re-verification of identities at regeneration (formal I-7).
- **Type:** PA, then REPO/IPD.

### 3.5 R-2 integrity discrepancy (`s2-checkout-verification.txt`) — **OPEN**
Verified facts (this pass):
- `evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26/s2-post-run-pin.txt`: LF only (0 CR bytes); SHA-256 `2a611a7a…`; git blob `e16450af540dcfda0bc72da8570edd8b5852939d`. Its CRLF form hashes to `84e823ae9c9aeb1a…`, which matches `SHA256SUMS.txt` line 45 (`84E823AE…`). **This pin-file digest reproduces only with CRLF**, as the rulings record states.
- `s2-checkout-verification.txt` (same folder): LF only (47 LF, 0 CR); SHA-256 `0df30bc6901dd23c…`; git blob `918764b836ef4d18…`. `SHA256SUMS.txt` line 22 records `3FD31FE6D3186C1DC76C1407656BFC72A1987118F8912687702662F8C7B84B2F`.
- **The CRLF form of the deposited checkout-verification file hashes to `3fdda19b1f7e9698…`, not `3FD31FE6`.** CRLF therefore does not explain this second mismatch. The recorded digest `3FD31FE6` also appears in the S2 read-back JSON and the acceptance records.
- **Resolution path:** the operator's original file (the bytes from which `3FD31FE6` was computed), plus a PA ruling on which artifact is the artifact of record. IRR must not normalize line endings, replace a digest or choose between the deposited copy and the original without that evidence.
- **Owner:** operator (original file); PA (ruling). Type: OP, then PA.
- **Parallel:** yes. **Needed before:** any reliance on the 2026-10-26 S2 candidate evidence. It is not a blocker for the new run in §3.3, which must produce its own reproducible checkout verification.

### 3.6 D-INST candidate, D-2 effective-write check, PA identity adoption and A6 — **CANDIDATE; NOTHING ESTABLISHED**
- **Governing records:** `evidence/integration/cap03-p1-d-inst-d2-candidate-2026-10-28/01-CANDIDATE_RECORD.md` ("Not parsed, not run, not adopted") and `02-p1-d2-effective-write-check-CANDIDATE.ps1` (SHA-256 `3bb714a4e977cb21…`).
- **Status of each element:**
  - (a) Parse and line-by-line review: **not performed.** This sandbox has no PowerShell (`pwsh`/`powershell` absent). A parse would need a PowerShell parser on a machine the PA designates. This is not a host action, but it is still outside this pass.
  - (b) D-2 effective-write check: **not established.** The static checks run on the candidate (balance, no file-writing cmdlets, required checks present) are not the effective-write check.
  - (c) PA identity adoption: **not granted** (E4). Adoption of an unparsed identity is not permitted.
  - (d) A6 runtime test on the designated host: **NOT RUN.** The A6 method is recorded as CONFORMED in procedure revision `2026-10-28c` §4.4 (status matrix §10). The runtime test itself is a host action.
  - (e) D-1 ACL dump (supporting evidence): not performed.
- **Order:** (a) → (b) → (c) → (d) per the candidate record. A6 must run on the host before use.
- **Owner:** PA (a, c); operator (d); REPO/OP for (b) once parsed.
- **Parallel:** (a) can run in parallel with §3.3 and §3.4 once a PowerShell-capable reviewer exists.
- **Next action:** none executable in this pass. Next is a designated PowerShell-capable parse and PA line review.
- **Closure evidence:** parse log; PA adoption act for the instrument identity under DB-B1; A6 runtime transcript from the host; (b) effective-write check result.

### 3.7 P-1 prerequisites — statuses unchanged
- **P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.**
- **PA-1 (H-12 is not a P-1 prerequisite): ADOPTED** (formal record §3, 2026-10-28). This supersedes the DQ-4 sequencing "H-12 → S2 → P-1" for P-1 provisioning only (F6).
- **ADP-D2 (receipt executing identity): accepted at `a891802e`** for the P-1 receipt element only (rulings record §6). P1-F remains blocked by its other conditions.
- **Still blocking P-1 authorization (per status matrix, not reopened here):** the act-designated pin mechanics (§8 step 0 undefined term); the PA-1 alternate reading (not adopted, so not applicable); D-INST adoption (§3.6); A6 runtime (§3.6 d); the capture authorization (PA + operator); the E10 act (not rendered); V1102 (OPEN); and S2 and H-12 evidence at the pin (§3.2 step 5, which is a gate for B-1 effectiveness).
- **Owner:** PA (authorization); operator (capture, A6, host items).
- **Label note:** "P-1" also labels a manifest item (the A-IPD step, §3.10). That step is complete and is not the P-1 attempt.

### 3.8 P-2 — IPD-C2 (future C′ implementation) — **TRIGGER PARTIAL; NOT ISSUED**
- **Governing records:** Addendum §7.4 P-2 ("B-Q1 chosen; scope per Table 1"); IPD execution tracker at `b9dd6fce` (IPD-C2 row, line ~2434: "**B-Q1 resolved** *and* a separate IPD implementation prompt issued"); Table 1 row 74 (`SEPARATE-ACT`).
- **Status:** B-Q1 is **ruled** (B-1 at `a891802e`). B-1 is **not effective for reliance** until fresh S2 and H-12 at the pin exist (designation B). **No separate IPD implementation prompt has been issued.** The tracker requires both conditions. Type: IPD.
- **Open PA question (not decided here):** whether IPD-C2 may be prompted before B-1 is effective. No IPD-C2 prompt has been drafted in this pass.
- **Owner:** PA (the question); IPD (the implementation act).

### 3.9 P-3 — IPD-S1 pointer — **COMPLETE**
- Published at IPD `b9dd6fce` (PR #108). See §1. Type: IPD (done).

### 3.10 P-1 (A-IPD manifest label) — A-Q5 designated-blob act — **COMPLETE**
- IPD act `…AMEND-01-DESIGNATED-BLOBS-2026-10-28-01` at `0edadb2d`. Designated-blob limb cleared; basis limb cleared under PA reading (ii). See `IIPS_v3.0_CAP03_IPD_A-Q5_RESULT_RECORD_2026-10-28.md`. Type: IPD (done). Matter A closed on the act §7 test.

### 3.11 S1 provisioning execution — **BLOCKED**
- Gate 4 act §6 row S1: "BLOCKED — successor act effective, but its identity values are unresolved (successor act §4) and no store exists."
- The identity values (`PRINCIPAL_LABEL`, `TENANT_ID`, `CANONICAL_OWNER_ID`) are still `null`. A separate PA identity-value determination is required. Gate A′ provisioning **NOT AUTHORIZED.**
- **[Correction CV-CORR-158, 2026-10-28, §16.178 — the two bullets above are stale.]** The PA's S1 identity-value determination of 2026-10-24 names the values (`ramki-personal-local`, `ipd-personal-local`, `ipd-owner-ramki-personal`). Binding commit `f9ec0c5` sets them as non-null compiled constants; it is an ancestor of IPD `main` `b9dd6fce` and of the pin `a891802e`. The identity value limb is resolved. S1 provisioning execution remains **BLOCKED / NOT EXECUTED** (successor act §8). See `IIPS_v3.0_CAP03_S2_RECONCILIATION_RECORD_2026-10-28.md` §2.
- Type: PA, then IPD. Not started, and no action is authorized by this record.

### 3.12 P-5 — FRM-D1C (IPD row 7 citation correction) — **UNTRIGGERED**
- **Governing record:** formal record §8; Addendum §7.4 P-5 (trigger: "separate IPD authority").
- **Status:** the trigger is not recorded. PR #108 did not address FRM-D1C. The S1 act's §4 scope does not mention it. Type: IPD (separate IPD prompt).
- **Owner:** PA (authority); IPD (correction).
- **Next action:** none until PA renders the authority.

### 3.13 Host capture root `D:\cap03-p1-capture-20261028-01` — **EXISTENCE NOT VERIFIED**
- **Governing records:** procedure `IIPS_v3.0_CAP03_P1C_P1D_FRESH_CAPTURE_PROCEDURE_2026-10-27.md` (revision `2026-10-28d`, root literal and PF-14 parent check); rulings record §6 (E8 root and parent).
- **Status:** the root is designated. No host evidence for it exists in IRR or IPD. The only references are the procedure and the rulings record. **Not created and not claimed to exist.** Type: OP.
- **Blocked by:** the E10 act (not rendered); V1102 (OPEN); and E3 is applied, so that prerequisite is met.
- **Evidence required to close:** operator-side listing of the root (for example, a read-only existence check on the host) recorded in an evidence folder.

### 3.14 PF preflight, PowerShell execution, store probing, A6, host capture — **NOT EXECUTED**
- All blocked on E10 and the host. Operator-executable only. Nothing in this record runs or authorizes them.

### 3.15 DQ4, Gate 4, Gate 5, G14 — **NOT CLOSED**
- DQ4: criteria 7 and 8 not met (Addendum §7.5). Gate 4 is not declared complete and Gate 5 is not granted. G14 is not declared complete.

### 3.16 PR #353 merge — **NOT AUTHORIZED**
- No separate merge authorization is recorded. Branch protection could not be read (HTTP 403 with this token; Addendum §7.5). PR #353 remains open.

---

## 4. Critical path

**Independent of each other (can start now, in parallel):**
1. **Operator, §3.3:** confirm host reachability and the S2 procedure for `a891802e`, then the native S2 run. This is the only path that can move §3.2 step 5.
2. **PA, §3.4:** direction on H-12 regeneration at `a891802e`.
3. **Operator, §3.5:** the original `s2-checkout-verification.txt` file.
4. **PA, §3.8:** whether IPD-C2 may be prompted before B-1 is effective.
5. **PowerShell-capable reviewer, §3.6 (a):** parse and line review of the D-INST candidate. Not a host action.

**Joins:** §3.2 step 5 needs §3.3 and §3.4 evidence. Then the IRR determination (§3.2 step 6).

**After §3.2 is closed:** B-1 becomes effective for reliance. P-1 still requires the other conditions in §3.7, including D-INST adoption (§3.6), A6 (§3.6 d) and the E10 act. None of them is ready now.

**Separate, not on the Gate 4 path:** P-5 (PA authority, then IPD prompt); P-2 (PA question, then IPD prompt); IPD-S1 is complete.

---

## 5. Integrity findings

- **F1 — R-2 (§3.5).** The pin-file digest reproduces with CRLF. The checkout-verification digest does not (`3fdda19b` vs recorded `3FD31FE6`). This is an open evidence-integrity issue. Only the operator's original file can resolve it.
- **F2 — "S2" is used for four different runs.** (a) The 2026-10-26 native run at `8eec74ae` (candidate-scoped acceptance `8eee2957`); (b) the Gate 4 act's Limb A row S2 (native `npm test` after Limb A implementation; NOT STARTED); (c) the route (c) fresh S2 at `a891802e` (L2a; ELIGIBLE, NOT STARTED); (d) the R5 act's S2 target at `8eec74ae`. Every record that says "S2" must name which run it means.
- **F3 — The R5 H-12 pins differ from the designated pin.** R5 binds `8eec74ae` (IPD) and `ba64b2d5` (IRR). G4P-1 designates `a891802e`. The formal record's statement that "no pin is designated" (PA-2) predates G4P-1 and is superseded by it.
- **F4 — H-12 adoption is stated differently by locus.** The IRR R5 act says ADOPTED on IRR `main`. The IPD mirror receipt says "PUBLISHED IN IPD — registration only; no IPD decision." The IPD S1 act and Gate 4 act say "H-12 NOT ADOPTED." These statements are consistent only if "adopted" is read per locus and per pin. None of them is an adoption at `a891802e`. No locus may be read as adoption at the designated pin.
- **F5 — Stale statement in an effective IRR act (pointer only).** R5 act §13.2 says the IPD mirror receipt is "PREPARED — NOT PUBLISHED". It was published in IPD at `cddee59` (`2026-10-25`): `evidence/cross-repository/IIPS_V3_CAP03_G4_H12_R5_ADOPTION_IPD_MIRROR_RECEIPT_2026-10-25.md`, receipt ID `IIPS-V3-CAP03-G4-H12-R5-ADOPTION-IPD-MIRROR-RECEIPT-2026-10-25-01`, verified an ancestor of IPD `main`. The act is effective and is not amended. This pointer and the tracker §16.177 record the correction.
- **F6 — Ordering of H-12 and S2.** The R5 act's DQ-4 lists `H-12 adoption → S2 → P-1 provisioning`. PA-1 (2026-10-28) adopts that H-12 is not a prerequisite for P-1 provisioning. Gate 4 §4.6 step 5 requires both as evidence at the pin, but neither record fixes the order between them for the pin. This is an open PA point, not a decided one.
- **F7 — A-Q5 prompt header.** The header on `IIPS_v3.0_CAP03_IPD_PROMPT_A-Q5_2026-10-28.md` was added in `822ef100`, after `caca0213`. The A-Q5 IPD act cites that prompt by path and by commit `caca0213`, not by blob. No published reference is broken. Disclosed here.
- **F8 — S1 prompt unchanged** (blob `d6d4fbe6` is cited by the published IPD act; see §2).
- **F9 — Status matrix PA-5.** The matrix (`IIPS_v3.0_CAP03_P1_PA_STATUS_MATRIX_2026-10-28.md`) lists PA-5 as OPEN. ADP-D2 accepts the receipt element at `a891802e`. The matrix predates that ruling; P1-F is still blocked.
- **F10 — Branch-only records.** The §16.176 tracker section and the CAP-03 pass-2 and pass-3 records exist on this branch only. IRR `main` (`82b3f4a5`) does not contain them until PR #353 is merged, which is not authorized.

---

## 6. Status boundary

S1 is **published and verified** as a pointer. S1 **execution** is BLOCKED. Gate A′ provisioning is **NOT AUTHORIZED**. Gate 4 is **AUTHORIZED — NOT STARTED**. The Gate 4 §4.6 step 5 is **NOT satisfied**. B-1 is **NOT effective**. H-12 is **NOT adopted at `a891802e`**. The D-INST candidate is **NOT adopted, NOT parsed, NOT run**. The A6 runtime is **NOT RUN**. The E8 host root is **NOT verified**. R-2 is **OPEN**. PR #353 is **NOT merged**. No host, capture, A6, PF preflight, PowerShell, store, IPD write or P-1 action was performed in this pass.

**P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.**
