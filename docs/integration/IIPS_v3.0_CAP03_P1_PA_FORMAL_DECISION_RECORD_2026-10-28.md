# CAP-03 — Formal PA Decision Record: PA-1, PA-2, PA-5, PA-3d, and Bounded IPD Implementation Authority (`2026-10-28`)

> **STATUS: FORMAL RECORD OF APPROVED DIRECTIONS AND BOUNDED IPD AUTHORITY. NO SIGNATURE, NO EXTERNAL APPROVAL, NO PRODUCTION AUTHORITY.** This record formalizes the four directions approved in the session instruction "CAP-03 — Formalize Approved PA Decisions and Authorize Bounded D2 Correction". It does not execute P-1, authorize P-1, perform capture or host preflight, run PowerShell, the harness, the compatibility script, or any host diagnostic, satisfy PF-17, S2, H-12, QE, Gate 4, Gate 5, S3, or DQ-4, change `BASIS_COMMIT` or `BASIS_TREE`, or write to IPD. **P-1 remains NOT EXECUTED / UNSPENT / NOT AUTHORIZED.**

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP03-P1-PA-FORMAL-DECISION-RECORD-2026-10-28-01` |
| **Tracker** | §16.165; `CV-CORR-145`; `CHG-2026-10-28-08`; `V1145`–`V1152` |
| **Approval source** | The express approval in the session instruction for this pass, treated as the Program Authority direction for the four items. This record does not add a signature or cite any other approval |
| **Supersedes (for the decisions below only)** | The "open" and "reserved" status of PA-1, PA-2, PA-5, and PA-3d in the consolidated package `IIPS_v3.0_CAP03_P1_PA_CONSOLIDATED_DECISION_PACKAGE_2026-10-28.md` and the status matrix §§9–10. The consolidated package itself is preserved unchanged |
| **Does not supersede** | DA-A1, DB-B1, DC (next capture only), the adopted DC-C2 scope, the historical package `62954f67`, the D2 handoff (preserved; its Option B text is the specification used in §5), Gate 4, the successor act, the S1 determination, or any effective act |

---

## 1. Verified baselines (this pass, read-only except IRR)

| Item | Verified value | Method |
|---|---|---|
| IRR `origin/main` | `012a4fc26dcfc04ad1804494b1b8c2fe687376ad` (merge of PR #344) | `git ls-remote`, `gh pr view 344` (merged `2026-10-27T20:54:48Z`) |
| IRR session branch | `arena/47d63390-iips-review-recovered` at `012a4fc2` (ancestor of `origin/main`) | `git` |
| IPD `main` | `888eb375eebee01640e44ccdcbb138a71e8c4513` (tree `cf3b90482fa7ed1f9780f20a9286164686885d2b`) | `git ls-remote`; blobless read-only clone at `/tmp` |
| Open PRs | IRR 0; IPD 0 | `gh pr list` |
| PR #343 receipt | Head `9cdb57ac`; exact-head CI `40579297048` SUCCESS; merge `e9cc38b3` (`2026-10-27T20:36:54Z`); post-merge CI `40579629376` SUCCESS | `gh pr view 343`, `gh run list` |
| PR #344 receipt | Head `af375f4e`; exact-head CI `40581929273` SUCCESS; merge `012a4fc2` (`2026-10-27T20:54:48Z`); post-merge CI `40582230546` SUCCESS | `gh pr view 344`, `gh run list` |
| Compiled basis | `5fc74085ade980846ff4a07b36415b6d49446486`, tree `7226ef0033b3…` | Gate 4 §3.1; `gateAPrimeValidation.ts` constants |
| P-1 execution pin of record (DA-A1; candidate-scoped) | `001c3c80618f2ee1d40e9a90912237e1a06e7b58`, tree `399fa44a5f1953c0f61b452420fefb5985426ef1`; ancestor of IPD `main` | DA-A1; ancestry |
| CAP-03 / Path A IPD primary | `8eec74ae27cda09f3c368b9c299895eae41554db`, tree `4eba29029f8d95cfe483e615a7047426b298ce50`; ancestor of IPD `main`; **designated, not established** (§16.122.7, §16.122.9) | Tracker §16.122.7 |
| CAP-03 / Path A IPD broker-import alias | `70b24f029842a7e9b7f615e4d9df7376fd4ff817`, tree `cc0f0117822850f9046e9a51bd05c1d45f80cd57`; ancestor of IPD `main`; designated, not established | Tracker §16.122.7 |
| Gate 4 Limb A final merge (pre-binding) | `a52b47b0f8ca448c8c9c195cf261e83ecf813ba3`, tree `1467802e9b94…` | Gate 4 §3.1; ancestry |
| S1 binding commit | `f9ec0c5…` (parent `6d8f161`); non-null identity constants | IPD history; S1 determination §7 |
| IRR consumer pin — CAP-03 / Path A | `ba64b2d5927c2f872560710cf1474c25a5cde0d5`, tree `5e4262f1cd75bf13b76ced5b45058f31434b5dad`; ancestor of IRR `main` | Tracker §16.122.7; procedure PF-08 expectation |
| IRR consumer pin — Gate 4 QE / H-12 | `4740ba21ea6103f1a7ebc9768269ae7795920698`, tree `23c5ca4ae1bfd481bcfc911c70b9e7dc090e1162`; ancestor of IRR `main` | Gate 4 §3.1 |

**Verification notes.** The IRR clone was unshallowed for ancestry checks in the previous pass and is full. Both IRR consumer pins resolve on IRR `main`. The IPD objects were read from a blobless read-only clone; no IPD write occurred.

---

## 2. Mapping of the four approved directions

| Approved direction | Disposition in this record | Section | Status after this record |
|---|---|---|---|
| **PA-1** — H-12 adoption is not a prerequisite for P-1 provisioning; separate meaning of host preflight | Formally adopted interpretation with a terminology decision | §3 | **ADOPTED** (interpretation and terminology). Independent prerequisites remain open and are not marked satisfied |
| **PA-2** — no designation of either existing pin without resolving the scope conflict; purpose-specific pinning model | Pinning model and selection process adopted. **No new IPD pin is designated in this record.** The Gate 4 QE/H-12 IPD pin is not designated pending a dependent scope choice (§4.5) | §4 | **MODEL ADOPTED.** Designations: **NOT MADE** |
| **PA-5** — Option B: correct the receipt to record execution identity separately from compiled-basis identity, preserving DA-A1 | Option B **selected**; bounded, non-production IPD authority recorded, subject to the IPD execution prompt | §5 | **ADOPTED** (Option B selected). Implementation **NOT STARTED** in IPD |
| **PA-3d** — defer additional diagnostics; retain adopted DC-C2 scope unless a concrete acceptance gap requires reconsideration | Deferred; no new diagnostic added | §6 | **ADOPTED** (deferral). No waiver of V1102 or any host check |

---

## 3. PA-1 — H-12 / P-1 sequencing and the terminology of "host preflight"

### 3.1 Decision (adopted)

**H-12 adoption is not a prerequisite for P-1 provisioning.** P-1 provisioning (S1) may proceed on its own authority once its P-1 authorization act exists and its own conditions are met. H-12 adoption is not a precondition of that authority.

**Basis.** The effective Gate 4 act (§6, dependency paragraph) states the structural dependencies: Limb A precedes the QE pin; H-12 adoption follows Limb A and precedes preflight; acceptance follows execution. That paragraph does not list P-1 provisioning as a precondition of H-12 adoption. The successor provisioning act contains no manifest or H-12 precondition (addendum D1-A; successor act §8 contains no manifest text). The Gate 4 §6 table orders S1 before S2a, but the table is a sequence of steps, not a statement that H-12 adoption depends on P-1.

**Consequence.** H-12 adoption (S2a) must be complete before S3 host/runtime preflight and before QE (S4). Its position relative to P-1 provisioning (S1) is not constrained by this decision, but S3 requires both S1 and S2a to be complete (Gate 4 §6).

### 3.2 Reconciliation of the S1 request wording (no effective act modified)

- The S1 decision request `IIPS_V3_CAP02_S1_IDENTITY_VALUE_AUTHORITY_H12_READINESS_DECISION_REQUEST_2026-10-24.md`, §7.6, states that H-12 adoption requires an executed P-1 with V-A2 evidence. That document is a **decision request, not an act**. Its §7.6 is **superseded for sequencing purposes by §3.1 of this record**, and it is not otherwise amended.
- The effective Gate 4 act, the successor provisioning act, and the S1 determination are **not modified** by this record. This record is the governing interpretation for the CAP-03 chain and does not change any IPD-side text. Any documentary alignment in IPD is out of scope for this pass and would require separate IPD authority.

### 3.3 Terminology — three distinct events (adopted)

| Term | Meaning in this record | Governing text | Separate authority needed |
|---|---|---|---|
| **P-1 provisioning** | The single Gate A′ provisioning execution on the designated Windows host (Gate 4 S1; successor act §8) | Successor act; Gate 4 §6 S1 | P-1 authorization act (not rendered) |
| **CAP-03 capture and read-only preflight** | The P-1-C and P-1-D capture procedure (`IIPS_v3.0_CAP03_P1C_P1D_FRESH_CAPTURE_PROCEDURE_2026-10-27.md`, purpose line "P-1-C/P-1-D read-only preflight only") | CAP-03 procedure; adopted DC §3.6 | Separate PA capture authorization; PF-17; host run |
| **S3 host / runtime preflight** | The Gate 4 S3 step: `win32`, non-elevated, Node `>=22.13.0 <23`, flag-free `node:sqlite`, clean trees at designated commits | Gate 4 §6 S3 | Blocked until S1 and S2a |

**Decision.** In Gate 4 text (§3.2(2) and §8), "host preflight" means **S3** as defined in Gate 4 §6. The CAP-03 procedure's read-only preflight capture is a different event and is not Gate 4 S3. New CAP-03 wording uses "P-1-C/P-1-D capture" rather than "host preflight". Neither event satisfies the other's prerequisites.

### 3.4 Independent prerequisites not satisfied by this decision

This decision settles ordering and terminology only. The following remain open:

- **Capture:** PA capture authorization (separate); PF-17 capture limb (**NOT EVIDENCED**); A6 host runtime test (**NOT RUN**); DC-a and DC-b host verification (**V1102 OPEN**); attempt-session raw bytes read back and accepted (P-1-C **NOT ESTABLISHED**; P-1-D **DESIGNATED, not verified for the attempt**).
- **H-12 adoption (S2a):** S2 Limb A merged, CI green, and native-Windows canonical `npm test` at the designated commit (**not started**); H-12 v3 regenerated and validated at that exact commit; the QE/H-12 IPD pin designated (§4.5); the IRR consumer pin reconciled (§4.4); a separate express PA adoption act.
- **S3:** S1 executed with V-A2 evidence; S2a adopted; clean trees at designated commits; host runtime checks on `desktop-no0nhtp`.
- **QE (S4):** S3 complete; QE pin designated; H-12 adopted; the QE authorization of Gate 4 §7 applies.

---

## 4. PA-2 — purpose-specific pinning model

### 4.1 Layers (adopted model)

| Layer | Identity | What it is | What it is not |
|---|---|---|---|
| **L0 Compiled basis** | `BASIS_COMMIT` `5fc74085…`, `BASIS_TREE` `7226ef00…` | The constants compiled into `gateAPrimeValidation.ts`. Unchanged by this record. Recorded in every receipt as `basisCommit`/`basisTree` | Not an execution pin. A receipt's basis value does not evidence the executing commit |
| **L1 Executing identity** | The HEAD commit and tree of the checkout from which the provisioning process actually executes, resolved at run time | Recorded in the receipt as `executingCommit`/`executingTree` (§5). A fact of one run | Not a designation. Must equal the designated pin for the purpose (L2) or the run fails closed |
| **L2 Purpose-specific IPD pin** | One designated IPD commit and tree per purpose (L2a–L2c below) | A PA designation act naming commit, tree, and blob identities | Not the compiled basis. Not inferred from "newest" |
| **L3 IRR consumer pin** | One designated IRR commit and tree per purpose (§4.4) | The IRR-side consumer for that purpose | Not interchangeable across purposes |
| **L4 Content and acceptance references** | H-12 manifest entries; `dist/**` set; S2 acceptance records; QE evidence | Evidence that binds content to a pin | Not a pin |

### 4.2 Purposes and their pins

| Purpose | IPD pin | IRR consumer pin | Status |
|---|---|---|---|
| **L2a — P-1 provisioning execution** | The post-correction commit `C′` that contains the receipt correction in §5. **Does not yet exist.** `001c3c80` is the DA-A1 candidate pin of record for the pre-correction execution and does not carry `executingCommit`/`executingTree` | IRR consumer per §4.4 (R1 for CAP-03) | **NOT DESIGNATED.** Designated only by a separate PA designation act after `C′` exists, with fresh S2 evidence at `C′` (DA-A1; D2 handoff §5) |
| **L2b — CAP-03 / Path A DR-track QE** (§16.122.7) | IPD primary `8eec74ae…` / `4eba2902…`; broker alias `70b24f02…` / `cc0f0117…` | R1 `ba64b2d5…` / `5e4262f1…` | Designated, **not established** (§16.122.9). Not changed by this record |
| **L2c — Gate 4 QE / H-12 content pin** (CAP-02 track) | The "final post-merge Limb A commit" (Gate 4 §3.2(2)). The literal candidate `a52b47b0` is pre-binding; see §4.5 | R2 `4740ba21…` / `23c5ca4a…` | **NOT DESIGNATED.** Dependent on the scope choice in §4.5 |

**Note on the procedure's IPD expectation.** The CAP-03 procedure's PF-08 expectation for IPD (`001c3c80…` / `399fa44a…`) is the DA-A1 candidate pin. It must be revised by a later procedure revision after `C′` is designated. This record does not revise it.

### 4.3 Resolution of the apparent IRR consumer conflict

The two IRR values are not in conflict as designations, because they belong to different purposes:

- **R1 `ba64b2d5…`** is the "IRR QE consumer" in the Path A table of tracker §16.122.7 and is carried as the expectation in the CAP-03 procedure. It applies to the CAP-03 and Path A chain.
- **R2 `4740ba21…`** is the "IRR consumer pin (QE)" in Gate 4 §3.1. It applies to the Gate 4 chain (CAP-02).

Each applies only to its purpose. Neither substitutes for the other. This is consistent with Gate 4 §3.1, which forbids silent substitution. Any use of R2 for H-12 or QE must be re-verified at H-12 regeneration. A move of the QE or H-12 IRR consumer to a different IRR commit requires an express PA re-designation under Gate 4 §3.2(4) and is **not** made by this record.

### 4.4 IRR consumer pin reconciliation — status

| Pin | Status | Required action |
|---|---|---|
| R1 `ba64b2d5…` | Designated for CAP-03 (§16.122.7); carried by the procedure | Re-verify at any future capture (PF-08). No change |
| R2 `4740ba21…` | Designated for Gate 4 (§3.1); re-verification at H-12 regeneration required | Re-verify at H-12 regeneration; any change is a PA re-designation |
| A new IRR commit for QE/H-12 | Not proposed | Only by express PA re-designation |

### 4.5 Scope conflict in the IPD QE/H-12 pin — dependent choice (not decided here)

The Gate 4 QE pin is defined as the "final post-merge Limb A commit" (Gate 4 §3.2(2)). The facts are:

1. `a52b47b0` is pre-binding. Its identity constants are `null`. A provisioning run cannot execute there. H-12 generated there would not cover the binding's changed entries or the `dist/**` files the S1 determination records as moved.
2. The binding `f9ec0c5` is **non-documentary drift** after the Gate 4 act. Gate 4 §3.2(4) requires explicit PA re-designation, so the literal pin cannot be kept silently.
3. `001c3c80` is post-binding and is the DA-A1 pin. Between `a52b47b0` and `001c3c80` it also carries **DR-2 Option A** (`bc144b9`, `src/persistence/portfolio_store.ts` +274 lines; `tests/q1_ipc_read_contract_conformance.test.ts` +1,385 lines), a PA disposition document, `scripts/verify-public-package.mjs`, `tests/portfolio_ui_package.test.ts`, and the **S2 package-consumer fix** (`001c3c80`). These are outside the Gate 4 §4.2 Limb A boundary.

**The conflict.** The Gate 4 QE pin is scoped to Limb A. The only post-binding commit in the record also contains CAP-03 DR-2 and S2 changes. Designating it as the Gate 4 QE pin would extend Gate 4 QE scope to content Gate 4 did not authorize.

**Why it is not decided here.** The approved directions do not state whether DR-2 and S2 content is in Gate 4 QE scope. Designating either candidate would be a new pin decision. Under the approved model, the dependent action stops and the exact choice is returned (§9).

**Exact choice for PA (for the record; not made).**
- **C-1:** Accept the post-binding commit `C′` (or `001c3c80` if it becomes the execution pin) as the Gate 4 QE/H-12 content pin with an express scope acceptance of the non-Limb-A content, and regenerate H-12 at that commit.
- **C-2:** Require a Limb A-only QE commit, which requires new IPD implementation authority and a new pin. Not authorized here.
- **C-3:** Keep the Gate 4 QE/H-12 pin undesignated until the CAP-03 chain has produced `C′`, and decide C-1 or C-2 then.

### 4.6 Pin-selection process and evidence obligations (adopted)

No pin is designated, and no dependent acceptance or execution authorization may rely on one, until all of the following exist and are recorded with commit and tree identity:

1. **Commit exists.** The implementation or correction commit is on IPD `main` (or a PR merged with `--merge`), with exact-head and post-merge CI green and a remote read-back.
2. **Delta classified.** The non-evidence changed-path list from the prior pin to the candidate is recorded and each path is classified as in-scope or out-of-scope for the designation's purpose. Out-of-scope paths require the scope decision in §4.5 first.
3. **Tests at the candidate.** The designated tests run at the candidate commit (Linux CI; native Windows where the governing act requires it, recorded separately).
4. **PA designation act.** A separate PA act names the commit, tree, and blob identities, and the purpose (L2a, L2c, or other).
5. **Evidence at the designated commit.** Fresh S2 evidence (L2a) and H-12 regeneration with full validation (L2c) at that commit.
6. **Recording.** The receipt, the designation, and the evidence reference the same identities. The executing identity recorded in the receipt must equal the designated pin for the run.

**No commit is predeclared.** The identity of `C′` is recorded only after the commit exists.

---

## 5. PA-5 — Option B and bounded, non-production IPD implementation authority

### 5.1 Decision (adopted)

**Option B is selected.** The IPD provisioning receipt is corrected to record **execution identity separately from compiled-basis identity**, preserving the adopted DA-A1 requirement that each provisioning receipt record both the compiled basis and the executing HEAD and tree.

Option A (operator-recorded bundle) is **not** used as a substitute for the adopted contract, and no amendment of DA-A1 is made.

### 5.2 Scope of the correction (authorized for the IPD pass, subject to §5.5)

The specification is the D2 handoff §4, as adjusted below.

| Element | Authorized | Notes |
|---|---|---|
| Files | `src/persistence/gateAPrimeProvisioning.ts` and `tests/g3_gate_a_prime_successor_provisioning.test.ts` only | D2 §4 |
| Files **not** to change | `src/persistence/gateAPrimeValidation.ts` (`BASIS_COMMIT`/`BASIS_TREE` unchanged); any migration, schema, persisted row, IPC, startup, composition, or frontend import graph (T-8) | Basis immutability; persistence contract |
| New files | **None** | Keeps the runtime `dist/**` set count unchanged (the 1,140-file gate in the H-12 and S1 records). No new compiled module, test file, or script |
| Execution identity resolution | New helper inside `gateAPrimeProvisioning.ts` (e.g. `readExecutionHead`). Runs `git -C <repoRoot> rev-parse --verify HEAD^{commit}` and `HEAD^{tree}` via `execFileSync` with a sanitized environment (drops `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_CEILING_DIRECTORIES`, `GIT_NAMESPACE`) | D2 §4.1 |
| New CLI argument | `--repo-root=<absolute path>` (required in `execute` mode) | D2 §4.1 |
| Fail-closed | Each resolved value must match `/^[0-9a-f]{40}$/`; otherwise refuse `EXECUTING_HEAD_UNRESOLVED` **before** any store is opened | D2 §4.1 |
| Pin enforcement (**authorized**) | `--execution-commit=<40 hex>` and `--execution-tree=<40 hex>`, both required in `execute` mode. A mismatch refuses `EXECUTION_PIN_MISMATCH` **before** any store is opened. The expected values are supplied **at execution time** and are not hard-coded | D2 §4.2 made mandatory because the mismatch test in §5.3 requires an expected value. The expected values are **not** designated by this record |
| Result and receipt | Extend `GateAPrimeExecutionResult` with `executingCommit` and `executingTree`. Return them from `executeWithAuthorization` beside the unchanged `basisCommit` and `basisTree`. Existing fields and values are unchanged | D2 §4.4 |
| Audit detail | **Unchanged.** `detail: { tenantId, canonicalOwnerId }` is not altered. Execution identity is not added to the audit event | User instruction; D2 §4.4 |
| Persistence | **Unchanged.** No new column, row, or migration | User instruction |
| Dirty-tree check (D2 §4.3) | **Excluded.** Not in DA-A1 and not in the approved scope. Not implemented | Smallest correct change |
| Windows runtime | Not verified by CI. Recorded separately under a later, separately authorized host step | D2 §4.6 |

**Note on the mismatch test.** The user's required test list includes "mismatched execution identity". That test requires a supplied expected identity, which is why the pin enforcement in the table is authorized. This does not designate any pin.

### 5.3 Required tests (existing file; additive)

- **Distinct basis and execution identities.** Success path with a fixture repository whose HEAD differs from the compiled basis. Assert `executingCommit`/`executingTree` equal the fixture's `git rev-parse` output, and `basisCommit`/`basisTree` equal the compiled constants (D2 T-11). Feasibility on the Linux CI runner (`node:sqlite`, real store) is **not yet verified**. If the test cannot be made to run on the CI runner, the IPD pass reports it and does **not** weaken or remove it.
- **Mismatched execution identity.** A supplied `--execution-commit` or `--execution-tree` that differs from the resolved HEAD or tree refuses `EXECUTION_PIN_MISMATCH` and creates no store (D2 T-12).
- **Unavailable identity.** A non-repository, or a repository with an unresolvable HEAD, refuses `EXECUTING_HEAD_UNRESOLVED` and creates no store (D2 T-10).
- **Basis immutability.** The compiled basis fields are unchanged by the correction and equal the constants in `gateAPrimeValidation.ts` (D2 T-11, and T-4 existing).
- **Redirecting environment.** `GIT_DIR` and related variables set in the process environment do not change the resolved HEAD (D2 T-13).
- **Existing tests.** T-1 to T-9 pass; their `args()` helper gains `repoRoot`, `executionCommit`, and `executionTree` where needed. T-8 (import graph) is unchanged and green.

### 5.4 Acceptance for the IPD pass

- `tsc --noEmit` (or `npm run build:tsc`) clean.
- `npm test` (`scripts/run-tests.mjs`) green on the Linux CI runner.
- T-8 unchanged and green.
- Changed-file list is exactly the two files in §5.2.
- No new file under `src/`, `tests/`, or `scripts/`.
- `dist/**` entry count is unchanged (this is the "dist entry-count gate" in the H-12 and S1 records).
- Changed-file diff recorded; no unrelated refactor.

### 5.5 Prerequisites (must all hold before the IPD pass begins)

1. This record and the IPD execution prompt are merged on IRR `main`, and the IPD pass cites that merge commit.
2. IPD `main` equals the verified baseline `888eb375…`, **or** the IPD pass re-verifies and stops if `main` has moved in a non-documentary way (Gate 4 §3.2(4)).
3. No P-1 authorization, execution, or receipt exists; P-1 remains UNSPENT.
4. The IPD pass has its own authorization to write to IPD, as stated in the IPD execution prompt.

### 5.6 Stop conditions

- A new pin-designation choice appears that §4 does not resolve. The IPD pass stops **only that dependent action** and returns the exact choice with evidence. Other authorized work continues.
- A required test cannot run on the CI runner. The item is reported, not weakened.
- Any need to add a file, change persistence, change audit detail, or change `gateAPrimeValidation.ts`. The IPD pass stops and returns to PA.

### 5.7 Commit identity (recorded after it exists)

- `C′` (the post-correction commit): **not yet existing.** It will be recorded in the IPD pass's report and in a separate tracker receipt, with commit, tree, and blob identities, after the commit is on IPD `main` (§4.6). It is not predeclared here.

---

## 6. PA-3d — diagnostics deferred; DC-C2 scope retained

- **Decision (adopted).** Additional diagnostics (`$PID`, `[Environment]::CommandLine`, `$env:PSModulePath` at §4.3a) are **deferred**. The adopted DC-C2 scope is retained. No new diagnostic is added to the procedure or to any evidence path.
- **Reconsideration trigger.** The DC-C2 scope is reconsidered only if a concrete acceptance gap is shown by authorized host evidence. None is shown now.
- **No waiver.** Deferral does not waive any host check. **V1102** (DC-a and DC-b on the Windows host) remains **NOT EXECUTED, OPEN**. The native PF-11 run `92d931fbb5204f74870aedf78610e29a` remains **NOT PASSED** and **undiagnosed**. Neither is turned into a passed result by this record.

---

## 7. A6 and DC-C2 reconciliation (procedure revision `2026-10-28c`)

| Item | Status | Evidence |
|---|---|---|
| A6 file-write and read-back (adopted) | **Conformed** in revision `2026-10-28c` §4.4 | Procedure header and §4.4; adoption record §10 |
| A6 runtime test | **NOT RUN.** Must run on the host before any capture | No `pwsh` in the sandbox; procedure §6.3 `V1141` |
| DC-C2(c) (MemoryStream `Get-FileHash`) | Unchanged | Procedure §4.4 |
| Comment clarification (this pass) | The DC-C2(c) comment now states that the `Get-FileHash` input is the in-memory stream only, and the A6 staging file is a separate artifact | Comment-only change; no executable text changed |
| DC-a and DC-b host verification (V1102) | **OPEN** | Tracker §16 V1102 |

**Claim discipline.** No record states that the A6 runtime check passed. The conformance is textual. The host test is a precondition for any capture.

---

## 8. Dependency and readiness matrix

Status key: **ADOPTED** = formally decided by this record. **DONE** = work completed and verified. **OUTSTANDING** = evidence or receipt still needed. **FUTURE** = implementation or act not yet started. **BLOCKED** = cannot proceed.

| Item | Status | Evidence | Owner | Next action | Dependency |
|---|---|---|---|---|---|
| **PA-1** H-12 / P-1 sequencing | **ADOPTED** | §3.1 | PA (recorded) | None | — |
| **PA-1** terminology ("host preflight") | **ADOPTED** | §3.3 | PA (recorded) | Use "P-1-C/P-1-D capture" in CAP-03 text | — |
| **PA-2** pinning model | **ADOPTED (model)** | §4.1–§4.4, §4.6 | PA (recorded) | None | — |
| **PA-2** IPD QE/H-12 pin | **NOT DESIGNATED** (dependent) | §4.5 | PA | Return choice C-1/C-2/C-3 after `C′` exists | `C′`; scope decision |
| **PA-2** IRR consumer pin reconciliation (R1 / R2) | **ADOPTED** (purpose split); R2 re-verification **OUTSTANDING** | §4.3–§4.4 | IRR (re-verify); PA (any change) | Re-verify R2 at H-12 regeneration | H-12 regeneration |
| **PA-5** Option B | **ADOPTED** | §5.1 | PA (recorded) | None | — |
| **PA-5** IPD implementation | **FUTURE** — authorized, not started | §5.2–§5.5 | IPD pass (separate authority) | Run the IPD execution prompt | §5.5 prerequisites |
| **PA-5** resulting execution pin `C′` | **FUTURE** — not existing | §4.6, §5.7 | IPD owner, then PA designation | Record after commit exists | IPD implementation |
| **PA-3d** diagnostics | **ADOPTED (deferred)** | §6 | PA (recorded) | None | Concrete acceptance gap (none) |
| **A6** host validation | **OUTSTANDING** (runtime NOT RUN) | §7 | Host operator (Ramki) under separate authority | Run the A6 test on the host before capture | Host access; capture authority |
| **DC-C2** host verification / **V1102** | **OUTSTANDING** — NOT EXECUTED | §6, §7 | Host operator under separate authority | Execute DC-a and DC-b on the host | Host access; capture authority |
| **D1** (H-12 vs P-1; H-12/QE pin) | D1-A **ADOPTED** (PA-1); D1-B **PARTIAL** (model adopted; designation dependent, PA-2); D1-C **RECORDED** (IPD row 7 citation defect; IRR cannot write IPD) | §3, §4, §9 | IPD owner (D1-C); PA (D1-B) | Correct IPD row 7 citation under separate IPD authority; PA designation | §4.5 |
| **D2** (receipt gap; DA-A1) | Option B **ADOPTED**; implementation **FUTURE** | §5 | IPD pass | Run the IPD execution prompt | §5.5 |
| **P-1-A** formal S2 acceptance | **SATISFIED** (candidate-scoped) | Tracker §16.144 | — | None | — |
| **P-1-B** execution-basis designation | **SATISFIED** (`001c3c80`, candidate-scoped) | Tracker §16.160.4 | — | Superseded for execution by `C′` (§4.2) | `C′` |
| **P-1-C** preflight-capture acceptance | **NOT ESTABLISHED** | Tracker §16.160.4; §16.148 | PA; operator | Fresh attempt-session raw bytes read back and accepted | PA capture authority; host run |
| **P-1-D** | **DESIGNATED**, not verified for the attempt | Tracker §16.160.4 | PA; operator | Verify for the attempt | PA capture authority |
| **P-1-E** PF-15 act | **SATISFIED** (act `-02`) | Tracker §16.160.4 | — | None | — |
| **P-1-F** P-1 authorization | **UNSPENT**; conditions incomplete; act **not rendered** | Tracker §16.160.4 | PA | Render only after PA-5 path and `C′` designation | §5.5; §4.6 |
| **PF-17** register limb | **VERIFIED** | Tracker §16.160.4 | — | None | — |
| **PF-17** capture limb | **NOT EVIDENCED** | Tracker §16.160.4 | PA; operator | Capture evidence under separate authority | Capture authority; host run |
| **S2 acceptance** (Gate 4 S2, Limb A) | **OUTSTANDING** — not started | Gate 4 §6 | IPD owner | Limb A merge and native-Windows `npm test` at the designated commit | §4.5 (scope); `C′` |
| **H-12 adoption** (S2a) | **BLOCKED** | Gate 4 §8; S1 determination §9 | PA | Regenerate and validate H-12 v3 at the designated commit; separate PA adoption | S2; §4.5; R2 re-verification |
| **QE acceptance** (S4) | **BLOCKED** | Gate 4 §6 | PA; Ramki (executor) | After S3 | S3; H-12; QE pin |
| **IPD implementation** (D2 correction) | **FUTURE** — bounded authority recorded | §5 | IPD pass | Run the IPD execution prompt | §5.5 |
| **Resulting execution pin** `C′` | **FUTURE** — not existing | §4.6, §5.7 | PA designation | Record after commit exists; fresh S2 at `C′` | IPD implementation |
| **IRR consumer pin reconciliation** | **ADOPTED** (purpose split); R2 re-verification **OUTSTANDING** | §4.3–§4.4 | IRR | Re-verify at H-12 regeneration | H-12 |
| **S2 / H-12 / QE evidence regeneration** | **FUTURE** — required after `C′` designation | §4.6 | IPD owner; IRR | Regenerate at designated commit | `C′`; PA designation |
| **P-1 authorization act** | **NOT RENDERED** | Tracker §16.160.4 | PA | Render after §5.5 and §4.6 are met | PA-5 path; `C′` |
| **Outstanding publication receipts** | **PR #343 and PR #344 receipts** recorded in tracker §16.165 in this pass. Future IPD and PA receipts pending | §9; tracker §16.165 | IRR | Record each future merge in the next substantive update | — |

---

## 9. Tracker identifier correction (genuine defect; corrected)

- **Defect.** `CHG-2026-10-15-06` was defined in two change-log rows for two unrelated events: the CV-53 D89 product acceptance (`CV-CORR-15`, §16.27) and the CPI row-preservation remediation (`CV-CORR-17`, §16.29).
- **Correction.** The CPI row, anchored to `CV-CORR-17`, is relabelled `CHG-2026-10-15-06B`. The D89 row, anchored to `CV-CORR-15`, keeps `CHG-2026-10-15-06`. The row text is otherwise unchanged. The choice follows the CV-CORR anchors because the table order alone does not establish which row was issued first. No plain-text citation of the ID exists.
- **Not corrected in this pass (recorded only).** Repeated verification identifiers across separate restated sections: `V680`–`V688` (§§16.121.4 and 16.121.11), `V697`–`V699` (§§16.122.5 and 16.122.12), and `V916` (two rows in §16.140.5, one a placeholder). These are reused numbers in restated tables. They are recorded here and in tracker §16.165, but **not renumbered**, because renumbering historical verification IDs would break existing references and the tracker's append-only rule. A repository-wide identifier census is a separate task.

---

## 10. Non-grants and boundary confirmation

- **No P-1 authorization, execution, consumption, or receipt.** P-1 remains NOT EXECUTED / UNSPENT / NOT AUTHORIZED.
- **No capture, host preflight, PowerShell, PF-11 rerun, harness, compatibility script, or host diagnostic** was executed or authorized by this record.
- **No advancement** of PF-17, S2, H-12, QE, Gate 4, Gate 5, S3, or DQ-4.
- **No change** to `BASIS_COMMIT` or `BASIS_TREE`.
- **No cross-repository write.** IRR-only writes. IPD read-only in this pass.
- **No pin designated** (L2a, L2c, or any new IRR commit). The IPD QE/H-12 pin is not designated (§4.5).
- **No signature or approval** added beyond the approval source stated in the header.

*End of formal decision record `IIPS-V3-CAP03-P1-PA-FORMAL-DECISION-RECORD-2026-10-28-01`. P-1 remains NOT EXECUTED, UNSPENT, and NOT AUTHORIZED.*


## Post-D2 status pointer (`CV-CORR-146`; `CHG-2026-10-28-09`; additive)

- **Existence correction.** After IPD PR #100 (D2) merged to IPD `main` as `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` (PR head `f722d7d46e056d4eb3039e9d3df8045b1cce4e1c`; tree `76f083d7058e170d8212455c03bad1033136ee68`; exact-head CI `40639983508` and post-merge CI `40640127958`, both SUCCESS), the post-correction commit `C′` **exists as a candidate**. The statements above that it "does not yet exist", "not existing", or "commit not yet created" were accurate on their dates and are superseded **as to existence only**.
- **Designation unchanged.** No commit is designated as `C′` or as any execution pin. The Gate 4 QE/H-12 pin is undesignated. D2 is not reviewed here for correctness.
- **Detail and decisions.** `IIPS_v3.0_CAP03_P1C_P1D_ONE_PASS_RECONCILIATION_AND_PA_PACKET_2026-10-28.md` (§§2, 6, 7.A–7.D) and tracker §16.166.
- **P-1 remains NOT EXECUTED / UNSPENT / NOT AUTHORIZED.** P-1-C remains NOT ESTABLISHED; P-1-D remains DESIGNATED; NOT VERIFIED FOR THE ATTEMPT.

- **Post-D2 follow-up (`CV-CORR-146` addendum).** IPD PR #101 merged to `main` as `db84ac12f297eec2bb159ae785c3cc584f7d7e34` (head `d2782f2`; tree `831f00e0…`; CI `40642066409` and `40642196820`, SUCCESS). The D2 candidate identity has moved. It is still **undesignated**. See the packet §11 and tracker §16.166.7.
