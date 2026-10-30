# CAP-03 — P-1 authorization act `P1-F` and prerequisite decisions: `PD-1` (§4.6 designation), `PA-06` (L2a admission), `PA-13` (E10), `PA-15` (identity limb)

**Repository:** IRR `ramkivs/iips-review-recovered`. **Scope:** IIPS v3.0 CAP-03, non-production, single-user. **Base:** `db6f2711ac7e9c4e9c919bdb51f10c95f2863439`.
**Record ID:** `IIPS-V3-CAP03-P1-AUTHORIZATION-ACT-2026-10-29-01`. **Tracker:** §16.206 (`CV-CORR-186`, `CHG-2026-10-29-28`, `V1522`–`V1536`).

**Status classes used below:** `DECIDED` (PA decision rendered in this record) · `COMPLETED` (a formal step satisfied by verified evidence) · `NOT APPLICABLE` (the step does not apply to this purpose) · `UNCHANGED` (status deliberately untouched).

**What this record is.** The single act that completes the P-1 authorization chain in dependency order: the formal pin designation for the P-1 execution coordinate (`PD-1`), the L2a admission (`PA-06`), the identity-limb determination (`PA-15`), the capture-authorization act (`PA-13` / E10), and the P-1 authorization act itself (`P1-F`).

**Authority.** The Program Authority (Ramki; PA and sole user) by the express CAP-03 one-pass direction of 2026-10-29 authorizing completion of the P-1 authorization chain under existing governance authority, together with the adopted decisions it applies: `ADP-D1` (rulings §6), `PA-1` (formal §3.1), `PA-5` (formal §5), `PA-08a/08b/08c` (2026-10-29, §16.204), `PA-19` (§16.202) and `PA-20` (§16.205). No new policy is created; no recommendation is adopted by silence.

**What this record does not do.** It executes no provisioning, creates no store, row, binding, membership or audit event, contacts no host, runs no PowerShell, regenerates no H-12, designates no Gate 4 coordinate, and writes nothing to IPD. It does not assert that any P-1 attempt occurred or that any capture or verification observation exists.

---

## 1. Layer separation (the four things this record keeps apart)

| Layer | What it is | State after this record |
|---|---|---|
| **1. PA decision authority** | The PA's choice of coordinate, reading and admission | **EXERCISED** — `PA-08a/b/c` (previously), `PA-06`, `PA-15`, and `P1-F` (this record) |
| **2. Formal pin designation (formal §4.6)** | A PA act naming commit, tree, per-path blob identities and purpose, with steps 1–6 satisfied | **COMPLETE for purpose L2a** — `PD-1`, §2 below, steps 1–6 each evidenced |
| **3. P-1 execution authorization** | The act that authorizes the one provisioning attempt | **RENDERED** — `P1-F`, §6 below |
| **4. Execution** | The attempt itself and its receipt | **NOT PERFORMED.** No attempt, no receipt, no store. P-1 remains **UNSPENT** |

Layer 2 does not authorize; layer 3 does not execute; layer 4 has not happened.

---

## 2. `PD-1` — formal pin designation for the P-1 execution coordinate (formal §4.6 step 4)

### 2.1 The designation act, as rendered

> **`PD-1` (PA designation act, 2026-10-29; formal §4.6 step 4).** The designated P-1 execution pin is IPD commit **`a891802e2691bd9c65a67d6abff20d8ce0c26d7d`** (tree **`76f083d7058e170d8212455c03bad1033136ee68`**), **purpose `L2a` — P-1 provisioning execution**. The per-path blob identities designated at that commit are those in §2.3. This designation is made for the L2a purpose only. It designates no Gate 4 §8 / QE / H-12 coordinate (that is `PA-09`), does not move the step-0 coordinate `001c3c80618f2ee1d40e9a90912237e1a06e7b58` (tree `399fa44a5f1953c0f61b452420fefb5985426ef1`, `PA-08b`), and does not authorize execution by itself (`P1-F`, §6).

### 2.2 The six formal steps

| Step | Requirement | Result | Evidence (verified this pass) |
|---|---|---|---|
| 1 | Commit exists on IPD `main` (or a PR merged `--merge`), exact-head and post-merge CI green, remote read-back | **COMPLETED** | IPD PR #100 merged `--merge` at `2026-10-28T05:48:27Z` as `a891802e…`; check-runs at that commit `typecheck · build · test` = **success** and `executed test count` = **success**; commit is an ancestor of IPD `main` |
| 2 | Non-evidence delta from the prior pin classified in/out of scope | **COMPLETED** | From `001c3c80…` to `a891802e…`: 19 commits, 62 changed paths; the only two non-evidence paths are `src/persistence/gateAPrimeProvisioning.ts` and `tests/g3_gate_a_prime_successor_provisioning.test.ts`, **both in scope** (the `PA-5` Option B receipt correction). No out-of-scope path is present, so the §4.5 scope decision is not engaged |
| 3 | Designated tests at the candidate | **COMPLETED** | Linux CI at the candidate: `typecheck · build · test` success and the non-zero-executed-count gate success, both at `a891802e…`. Native-Windows execution is **PA-WAIVED — NOT A BLOCKER** (`PA-20`) and is not a condition of this step |
| 4 | PA act naming commit, tree, blob identities and purpose | **COMPLETED** | `PD-1`, §2.1 and §2.3 |
| 5 | Evidence at the designated commit | **COMPLETED for L2a** | The S2 run `s2-a891802e-20261028T192516Z` was executed **at this commit** (recorded pin `a891802e…` / tree `76f083d7…`; §16.180), independently published and verified, and conditionally accepted by PA act `S2-ACC-A1`; admitted as L2a by `PA-06` (§3). The H-12 / L2c element of step 5 is **NOT APPLICABLE** to this purpose: L2c is a Gate 4 chain item (PA-09), and H-12 adoption is not a P-1 prerequisite (adopted `PA-1`) |
| 6 | Receipt, designation and evidence reference the same identities; executing identity = designated pin | **COMPLETED for the designation** | The run's recorded checkout identity is `a891802e…` / `76f083d7…` (§16.180 `V1312`–`V1318`, including the live IPD pin-provenance check); the D2 receipt records the measured executing HEAD/tree from `--repo-root` and refuses `EXECUTION_PIN_MISMATCH` otherwise. The run-level receipt element is satisfied by the future attempt's receipt, which must equal this pin — that obligation is stated in `P1-F`, not claimed as performed |

**Step 1 note on generalised CI.** The `pending` combined-status value on the commit object reflects an absent third-party status context, not a failing check; both check-runs that the repository actually uses are `success` at the commit.

### 2.3 Designated per-path blob identities at `a891802e…`

Verified this pass against the IPD Git object database (contents API at the full commit SHA), not copied from any record.

| # | Path | Blob at `a891802e` | Role | Versus successor act §2.1 |
|---|---|---|---|---|
| 1 | `src/persistence/provisioning.ts` | `dc844189a1c92f00acc3d7572c22f3e28e138eb6` | library-only mutator | unchanged |
| 2 | `src/persistence/binding.ts` | `96d0079dd04b75c6f257a2001c8f7eff1ffc560a` | in-transaction revalidation | unchanged |
| 3 | `src/persistence/audit.ts` | `273ccd3be29d7aca971933b6a28a4b4703504bf2` | hash-chained audit | unchanged |
| 4 | `src/persistence/connection.ts` | `5169e402707cf1a73f16bfb15ffe0b1d395165ff` | `node:sqlite` connection + guard | unchanged |
| 5 | `src/persistence/migrations/001_initial_schema.ts` | `f594a18264c45ccdcbfa2381592820a72d3c453b` | frozen migration 001 | unchanged |
| 6 | `src/persistence/migrations/002_audit_event_sequence.ts` | `932af8e603c4be41c9f0d8a6b051f41836c1fee8` | migration 002 | unchanged |
| 7 | `src/persistence/migrations/003_local_principal_bindings.ts` | `32b125bf962bb76a6ae59d3b262203dbbb988197` | bindings + memberships | unchanged |
| 8 | `src/persistence/migrations/004_portfolio_contribution_provenance.ts` | `6bad5a5095b6bb94ce91a86a4b65f7ab915c516c` | migration 004 | unchanged |
| 9 | `src/ipc/dispatch.ts` | `27becc76749f5b11a37ca4e6254d58132620f57f` | W-1 refusal before mutation | unchanged |
| 10 | `src/persistence/portfolio_store.ts` | `540d49f2deb2c8d600b5b866675d145cf76a1e46` | `evaluatePortSaveGuard()` hard-false | **changed** — the A-Q1 designated blob (executed by IPD act `0edadb2d`) |
| 11 | `package.json` | `51796e63280c1abb368c27bf8811cc6bad46e132` | runtime manifest | unchanged |
| 12 | `tests/g3_startup_validation.test.ts` | `edd0305e3e5891020b2b045ab2cf082cd6cf788f` | static-unreachability regression | **changed** — the A-Q2 designated blob (executed by IPD act `0edadb2d`) |
| 13 | `src/persistence/gateAPrimeProvisioning.ts` | `5f49936b61efd07cc7b151d8f028f1020e48aee0` | the act-bound provisioning entrypoint (`PA-5` Option B) | **changed** vs the act's creation blob `2cbce83f…` |
| 14 | `src/persistence/gateAPrimeValidation.ts` | `df5d48a583c9aaed51af90a90225c15c408fbd33` | read-only V-A2 validator; basis and identity constants | unchanged since creation |
| 15 | `tests/g3_gate_a_prime_successor_provisioning.test.ts` | `1f66621690f724d5c17f2f035dbdaceb9e7348db` | T-1…T-15 at the candidate | **changed** (T-10…T-15 added by `PA-5`) |

**Consistency result.** Ten of the successor act's twelve §2.1 blobs are byte-identical at the designated commit. The only two that differ are exactly the two blobs the PA designated separately by rulings A-Q1 and A-Q2 and executed in IPD act `0edadb2d`. The three CAP-03 files carry only the `PA-5` Option B correction and its tests. No undesignated change sits inside the designated surface.

### 2.4 Non-applicable element, stated explicitly

Formal §4.6 step 5 names H-12 regeneration because it covers both purposes. For a **L2a** designation it does not apply: H-12 is the Gate 4 §8 content artifact (L2c), its pin is undesignated (PA-09), and its adoption is not a P-1 prerequisite (adopted `PA-1`, `PA-10c`). Nothing in this record regenerates, adopts or references H-12 as a P-1 input.

---

## 3. `PA-06` — L2a admission and sequencing (`DECIDED`)

> **`PA-06`: option (a), scoped.** The S2 run `s2-a891802e-20261028T192516Z`, executed at `a891802e…` / `76f083d7…` on `2026-10-28T19:25:17Z`–`19:29:15Z`, is **ADMITTED as L2a evidence for the P-1 chain**. The pre-designation sequencing of that run — it ran before the designation act that fixed its pin — is **expressly waived for this purpose**, the designation now existing (`PD-1`, §2) and the run's recorded identity equalling the designated pin. The run is **not** admitted as a Gate 4 Limb A S2 result; that question belongs to the Gate 4 chain and to `PA-09`, and the Gate 4 pin remains undesignated.

**Evidence relied on.** `S2-ACC-A1` (formal conditional acceptance at pin `a891802e…`, conditions A-i…A-iv; content-level, with the host originals the byte authority); the publication-verification record and §16.180 (seal `9D3C09DB…`, independent verification `ALL CHECKS MATCH`, run-recorded pin and tree matching the live IPD commit); `ADP-D2` (receipt executing identity accepted at `a891802e`).

**Why this resolves rather than defers.** Route (c)'s sequencing requirement exists to prevent a run from being retro-fitted to a pin chosen after the fact. Here the reverse is demonstrable on the record: the run recorded the pin and tree before the designation act, the pin is the commit the run actually executed at, and the designation names exactly that identity. The waiver is therefore a waiver of sequencing only, expressly stated; it does not re-date the run, does not extend its scope, and does not convert any Git copy into host bytes.

**What is unchanged.** `R-1` (the 2026-10-26 47-entry output) remains separate and, per `S2-ACC-A1` §5, unaddressed by this run's seal design; `PA-20` removes it as a blocker on the same footing as the other operator-evidence items, and this record supplies no new evidence for it. `F-A-1` / `F-A-2` remain recorded as publication findings.

---

## 4. `PA-15` — identity limb (`DECIDED`)

> **`PA-15`: the identity limb is CLEARED for the P-1 chain.** The three identity values are fixed by an effective PA instrument — `IIPS-V3-CAP02-S1-IDENTITY-VALUE-DETERMINATION-2026-10-24-01`, which names them verbatim and discharges successor act §4 — and are materialised as compiled constants at the designated commit. The `S1` row of the Gate 4 act that describes them as "unresolved" predates that determination and is superseded as to its stated reason. No IRR or IPD file is edited by this determination.

**Values, and where they are fixed.**

| Constant | Value | Locus |
|---|---|---|
| `PRINCIPAL_LABEL` | `ramki-personal-local` | `src/persistence/gateAPrimeValidation.ts`, blob `df5d48a5…`, identical at `f9ec0c5` (the binding commit) and at `a891802e` |
| `TENANT_ID` | `ipd-personal-local` | same blob |
| `CANONICAL_OWNER_ID` | `ipd-owner-ramki-personal` | same blob |

**Authority chain.** The Gate A′ successor provisioning act §4 reserved value selection to a separate PA determination; `IIPS-V3-CAP02-S1-IDENTITY-VALUE-DETERMINATION-2026-10-24-01` **is** that determination ("RENDERED — EFFECTIVE ON PUBLICATION", effective on its merge with binding commit `f9ec0c5`). Its own statement of the residual gate is *host and store*, not values: "the value-selection blocker is discharged".

**Record reconciliation.** Three records still read as if the values were unresolved: rulings §8 ("Identity values still unresolved"), Gate 4 act row `S1` ("BLOCKED — … identity values are unresolved"), and the `PA-14` pass-4 prerequisite list. Each predates, or repeats a pre-`f9ec0c5` statement. IRR already recorded the correction earlier (`CV-CORR-158`, A-Q5 result record §4: "already resolved … this record's reading of them as unresolved was stale"); this determination adopts that correction as the governing reading rather than leaving it as a note.

**Scope and limits.** The determination clears the identity limb only. It does not create a store, authorize execution (that is `P1-F`), clear the P-1 or V-A2 limbs (properties of a run), or change act row `S1` — whose text is IPD-owned and remains a documentary follow-up; no IPD write is made here. Because row `S1` also cites the absence of a store, note that a non-existent store at P-1 is a **precondition of the operation** (the entrypoint refuses a pre-existing store), not an unmet governance condition.

---

## 5. `PA-13` — E10 capture-authorization act (`RENDERED`)

> **`PA-13` / E10 (2026-10-29).** The capture-authorization act is rendered for **one** pre-execution attempt session, non-production, single-user:
> **Host:** the operator's native Windows host — the same class of host recorded for the S2 run (`DESKTOP-NO0NHTP`, Windows 11 build 26300, non-elevated), restated as *the operator's host of record*. Host availability and operator presence are **PA-WAIVED — NOT A BLOCKER** (`PA-20`).
> **Session:** one attempt session for P-1-C capture and P-1-D verification, run only under the published procedure `IIPS_v3.0_CAP03_P1C_P1D_FRESH_CAPTURE_PROCEDURE_2026-10-27.md` revision `2026-10-28d`.
> **Root:** `D:\cap03-p1-capture-20261028-01`; **parent:** `D:` (E8, rulings §7; the procedure refuses a pre-existing root at runtime).
> **Identity:** the three values in §4 (fixed by `f9ec0c5`, verified at the designated commit).
> **Pins:** IPD step-0 pin `001c3c80…` / `399fa44a…` (unchanged by `PA-08b`); the P-1 execution pin `a891802e…` / `76f083d7…` (`PD-1`); IRR consumer per the procedure (PF-08).
> **Window:** the single attempt session; no second session without a further PA act.
> **Operator:** the Program Authority as sole operator.

**What E10 is and is not.** E10 authorizes the *capture and verification session*. It is **not** P-1 authorization (formal §5; packet E10 row) and it is not a precondition of `P1-F`: `P-1-C` and `P-1-D` observations are `PA-WAIVED — NOT A BLOCKER` (`PA-20`), so a P-1 attempt does not depend on E10 being executed. Rendering E10 removes the last documentary gap in the attempt path without creating a new dependency.

**Evidence reuse.** No new capture is required or requested. The E3 procedure revision, the E7/E8 determinations and the `PA-12` A6 authority route are reused as recorded; `T-1` remains triggered only by a successor D-2 instrument (`PA-11`), which is not adopted.

---

## 6. `P1-F` — P-1 authorization act (`RENDERED`)

> **`P1-F` (PA authorization act, 2026-10-29).** **P-1 IS AUTHORIZED — ONE ATTEMPT, NOT YET MADE.**
>
> The Program Authority authorizes **one** execution of the Gate A′ successor provisioning entrypoint, in the non-production, single-user IPD environment, under the following fixed identity:
>
> | Element | Required value |
> |---|---|
> | Entry point | `node dist/persistence/gateAPrimeProvisioning.js --mode execute` (the only act-bound path; the file at designated blob `5f49936b…`) |
> | `--act-id` | `IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01` |
> | `--repo-root` | an absolute path to an IPD checkout **at** the designated pin |
> | `--execution-commit` | `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` |
> | `--execution-tree` | `76f083d7058e170d8212455c03bad1033136ee68` |
> | Identity values | the three values in §4 (also compiled; supplied verbatim, never from the environment) |
> | `--store` | an absolute path that **does not exist** at invocation; no store path is pre-designated by this act |
>
> **Conditions of the authorization.**
> 1. **Pin equality is enforced, not assumed.** The entrypoint measures `HEAD`/`HEAD^{tree}` from `--repo-root` and refuses `EXECUTION_PIN_MISMATCH` before any connection is opened. A different executing identity is not this authorization.
> 2. **One attempt, single-use.** The act is spent by the first attempt, whether it succeeds or fails; a failed or partial attempt is not re-run under this act and consumes it, in line with successor act §8. No second attempt without a further PA act.
> 3. **Runtime gates stay in force.** The entrypoint's own preconditions — `win32`, Node `>=22.13.0 <23`, flag-free `node:sqlite`, non-existent store, no pre-existing binding/membership row — are properties of the operation and are enforced by the code. Under `PA-20` their *host-side availability* is not a governance blocker; this act does not waive, alter or pre-satisfy any of them.
> 4. **The receipt is the record.** The receipt produced must record the compiled basis (`5fc74085…` / `7226ef00…`) and the measured executing HEAD/tree, which must equal the designated pin.
> 5. **No observation is presumed.** `P-1-C` remains **NOT ESTABLISHED** and `P-1-D` remains **NOT VERIFIED FOR THE ATTEMPT**; the waiver means their absence does not block, not that they exist. A capture under E10 is optional, not a condition.
>
> **Scope of authorization.** P-1 provisioning execution only, as defined by the successor act, at the designated pin, one attempt.
>
> **Not authorized by this act:** any second attempt or re-run; any IPD write outside the provisioning operation's own effects on the store it creates; QE item `1`–`11`; Gate 4 execution, result acceptance or pin designation; Gate 5 admission; H-12 adoption or regeneration; S3; the DQ-4 freeze; any `durable:true` enablement; any `503` lift; production; `V1295`; any change to `BASIS_COMMIT`/`BASIS_TREE`; any IRR write beyond documentation.

---

## 7. Prerequisite ledger (what each prior condition now is)

| Prior condition | Old state | Now | Basis |
|---|---|---|---|
| `B-DESIG` | incomplete | **COMPLETE for L2a** | `PD-1`, §2 |
| Formal §4.6 steps 1–3 | unmet | **COMPLETE** | §2.2 |
| Formal §4.6 step 4 | not rendered | **COMPLETE** | `PD-1` |
| Formal §4.6 step 5 (L2a element) | unmet | **COMPLETE** | `PA-06` admission of the run at the pin |
| Formal §4.6 step 5 (L2c element) | unmet | **NOT APPLICABLE** to L2a; Gate 4 chain unchanged | `PA-1`, `PA-10c`, `PA-09` |
| Formal §4.6 step 6 | unmet | **COMPLETE for the designation**; run-level obligation carried into `P1-F` condition 4 | §2.2 |
| `L2a` admission (`PA-06`) | not rendered | **ADMITTED** | §3 |
| `PA-15` identity limb | unresolved | **CLEARED** | §4 |
| `PA-13` E10 | not rendered | **RENDERED** | §5 |
| `P1-F` | not rendered | **RENDERED — P-1 AUTHORIZED, one attempt, unspent** | §6 |
| `P-1-C` / `P-1-D` observations (`T-2`, `T-4`, H-8) | listed as prerequisites | **PA-WAIVED — NOT A BLOCKER** | `PA-19`, `PA-20` |
| `L2c` / `S2a` as P-1 prerequisites | listed | **not P-1 prerequisites** | adopted `PA-1` / `PA-10c` |
| `T-1` successor instrument | conditional | **not triggered** (`PA-11` not adopted) | unchanged |
| `T-3` H-12 artifact | conditional | **not triggered** (H-12 path not advanced) | unchanged |

---

## 8. Status after this record

- **P-1: AUTHORIZED — NOT EXECUTED — UNSPENT.** No attempt has been made; no store, row or receipt exists.
- `P-1-A` / `P-1-B`: satisfied candidate-scoped, unchanged (§16.153).
- `P-1-C`: **NOT ESTABLISHED** (no capture performed) — **not a blocker** (`PA-20`).
- `P-1-D`: **DESIGNATED; NOT VERIFIED FOR THE ATTEMPT** — **not a blocker** (`PA-20`).
- Designation: **COMPLETE for L2a**; the step-0 coordinate and the DA-A1 receipt rule are unchanged (`PA-08b`).
- **Unchanged:** Gate 4 `AUTHORIZED — NOT STARTED`; Gate 4 QE/H-12 pin **undesignated** (`PA-09` open, §4.5 C-1/C-2/C-3 unchosen); QE **0/11**; H-12 **NOT ADOPTED**, no baseline effective; Gate 5 **NOT INITIATED / NOT ADMITTED**; S3 not started; DQ-4 freeze not performed; production / `durable:true` / `503` / `V1295` not granted; `IMMUTABLE` fences unchanged; **IPD not written**.
- **Open PA items not on the P-1 path:** `PA-01` (A-Q4 / G4P-1 record conflict, unchanged and precisely stated), `PA-02`, `PA-03`, `PA-07`, `PA-09`, `PA-11`, `PA-17`. None is a P-1 prerequisite.

---

## 9. Non-establishments

This record establishes none of the following and must not be read as establishing any of them: that P-1 ran; that a store, row, binding, membership or audit event exists; that `P-1-C` or `P-1-D` observations exist; that A6 ran; that any H-12 artifact exists; that any gate, acceptance, qualification or admission status moved; that the Gate 4 pin is designated; that `C′` extends to any purpose other than L2a; that `R-1` or `F-A-1`/`F-A-2` are resolved; that the S2 host originals were re-read.

*End of `IIPS-V3-CAP03-P1-AUTHORIZATION-ACT-2026-10-29-01`.*

---

## Post-record operational handoff — F9 Windows fixture results (2026-10-30)

> **NON-AUTHORIZING SUPPLEMENT.** This dated operational note records subsequent operator-supplied fixture results; it does not amend this act, change any designation or prerequisite, grant new authority, or establish P-1 readiness or execution. The operative status in §8 remains **P-1 AUTHORIZED — NOT EXECUTED — UNSPENT**. F9 did not invoke Host Preflight, Execute, the P-1 entrypoint, provisioning, or an IPD write.

The detailed result matrix, all local evidence paths, runner defect/correction history, and fixture boundaries are recorded in [`docs/integration/cap03-p1-f9/README.md`](cap03-p1-f9/README.md). Arena cannot access the operator's Windows temporary directories or independently inspect their contents; the outcomes are attributed to the operator.

| F9 disposition | Status on 2026-10-30 | Handoff meaning |
|---|---|---|
| F9-2 | **PASS** | StrictMode/S00 refusal fixture passed. |
| F9-3 | **PASS** | Fourteen canonicalization cases passed after the runner expectation was corrected to the first production refusal code. |
| F9-4 | **PASS** | Probe creation and separately injected cleanup failure were reported. |
| F9-5 | **PASS** | Concurrent disposable claim race behaved as expected. |
| F9-6 | **PARTIAL** | Available cases, including a non-elevated directory junction, passed; file-entry symbolic-link branch remains **NOT TESTED**. No reparse-point control is weakened. |
| F9-7 | **PASS** | Post-forensics isolation, seal/no-overwrite, exact catch AST marker recognition and marker recovery passed; no Node process or entrypoint was started. |
| F9-8 GIT | **PASS** | Controlled `GIT_DIR` refusal, clean-environment pass, and restoration of two inherited process variables. |
| F9-8 HOST | **BLOCKED** | Host identity and non-elevation passed, but `DESKTOP-NO0NHTP` reported `Windows 10 Home Single Language`. Production `S01-PRODUCT` compares `ProductName` exactly against `Windows 11 Home Single Language` required by base Act §8; it correctly stopped before entrypoint invocation. |
| F9-9 initial | **FAIL — runner defect** | Function-scoped `$MyInvocation.MyCommand.Path` access failed because the object was `FunctionInfo`. |
| F9-9 corrected rerun | **PARTIAL** | The runner correction captured `$PSCommandPath` at script scope (IRR commit `3f08ce3780e9ab1a9fa29b617fe431dc67a08d18`). D-14 parser, U-2 read-only host facts, and U-3 fixture-only checks were reported; U-4/U-5/U-10 remain **NOT RUN / PARTIAL** under the no-IPD-write boundary. |

The unchanged production script's expected host is `DESKTOP-NO0NHTP`; its `S01-PRODUCT` check reads `HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProductName` and uses case-sensitive exact equality against `$ExpectedProductName = 'Windows 11 Home Single Language'`. The F9-8 host outcome is therefore a real prerequisite block, not a failing GIT test or a fixture defect. No relaxation is authorized. F9 does not perform the required Windows 11 product check in an authorized Host Preflight and does not clear the block.

### F9-9 U-4/U-5/U-10 handoff boundary

The Revision 5 source-to-script verification record defines these items and assigns host-side work to the operator (U-4 in S02; U-5 in S04; U-10 in S04/S09). The intended assertions and evidence limits are:

- **U-4 — local checkout identity (read-only):** expected IPD commit/tree `a891802e…` / `76f083d7…`, clean local checkout, and all 15 designated blobs present at local `HEAD`. Remote-tree inspection and F9 fixtures do not establish the local checkout state. Evidence belongs to the local repository checks, not the P-1 store. Owner: operator with the designated local IPD checkout. Collection through S02 is not part of this task and requires the otherwise applicable authorization for that route.
- **U-5 — build and emitted identity:** `npm ci`, `npm run build`, emitted entrypoint closure, and emitted migration identity. This is S04 evidence; the commands write dependency/build outputs in the IPD checkout (`node_modules`, `dist`, `dist-frontend`), though not the P-1 store. Owner: operator. Route is blocked pending resolution/designation of `$BuildAuthorityRef` (Q-BUILD/D-9) and explicit authorization for those IPD checkout writes; the base act §8 does not itself add the build step. It remains **NOT RUN**.
- **U-10 — host Node runtime behavior:** run the emitted-migration probe and dump JavaScript on the designated host's Node 22.x runtime and inspect outputs (S04/S09). Linux syntax checking is not Windows runtime evidence. S09's dump is read-only against the store and writes only evidence, but it is in the P-1 execution sequence. Owner: operator through the separately applicable authorized host/P-1 route. It is not run by F9 and remains **NOT RUN**.

F9-9's U-2 host facts and U-3 disposable fixture checks do not substitute for these items. Arena has no local IPD checkout and performed no U-4/U-5/U-10 action. Under the present task boundary there is no request to run them, no IPD write, and no P-1 entrypoint invocation. No completed Windows fixture test is requested again. F9-6's symlink branch remains PARTIAL/NOT TESTED; F9-8 HOST remains BLOCKED; F9-9 remains PARTIAL.

*End of non-authorizing operational handoff. No change to the decision or status in §§8–9.*

---

## PA direction — scoped waivers for personal non-production use (2026-10-30)

> **PA DECISION; SCOPE-LIMITED.** At the PA's written direction dated 2026-10-30, five specific test/evidence or host-prerequisite conditions are **WAIVED — NOT A BLOCKER** for personal, single-user, non-production progression only: F9-6's file-entry symlink fixture branch, the F9-8 Windows 11 product prerequisite, and F9-9 U-4, U-5 and U-10. The dispositions are WV-01 (F9-6), WV-02 (F9-8 HOST), WV-03 (U-4), WV-04 (U-5), and WV-05 (U-10). Detailed requirement/result/alternative/risk/control entries are in the F9 README's “PA-scoped waivers” section and master tracker §16.207 (`CV-CORR-187`). Actual statuses remain F9-6 **PARTIAL / NOT TESTED**, F9-8 HOST **BLOCKED**, and U-4/U-5/U-10 **NOT RUN**. No waiver is a test PASS. Existing technical ownership is unchanged: the operator owns any future F9-6 fixture-host run and F9-8 host observation; the operator owns U-4 in S02, U-5 in S04 after build authority, and U-10 in S04/S09 under the applicable authorized host/P-1 route. The PA owns the waiver decisions and any separate implementation authorization. No completed Windows test is to be repeated.

The F9-6 branch has no practical equivalent under the existing host conditions: the alternatives require symlink privilege, a system capability change, or another Windows host; a junction, mock, or Linux symlink does not establish the file-entry Windows reparse branch. The waiver leaves the acceptance criterion and reparse checks intact.

For F9-8, the Windows 10 observation is preserved. Act Section 8 and `S01-PRODUCT` still require Windows 11 Home Single Language; the current script reads registry `ProductName` and will refuse on Windows 10. The waiver changes neither that check nor production applicability. A documentation-only waiver cannot create a runtime pass. The appropriate treatment is not to override the host check: do not run the existing P-1 script on Windows 10. Actual personal Windows 10 use would require a separately authorized, clearly labeled non-P-1 local application path, not a wrapper around or copy of the P-1 script; it must not invoke the P-1 entrypoint or touch the P-1 store/evidence and must use a separately designated non-production data boundary. **This PA direction does not grant implementation authority for that path.** Explicit PA implementation authority must define its files, allowed side effects, data boundary, non-P-1 isolation and verification before any implementation or use.

For U-4, remote blob review cannot establish the absent local checkout's clean state; for U-5, the necessary build writes IPD outputs and Q-BUILD remains unresolved; for U-10, host runtime/dump work depends on unavailable emitted artifacts and a prohibited P-1 sequence. Their waivers remove only their validation-evidence status as a blocker to the scoped non-production progression. No IPD activity is performed, and the waivers cannot satisfy production/P-1 requirements.

**Effect:** the named validation/host conditions cease to block governance progression within the scoped personal non-production use, but deployment through the current production script remains blocked on Windows 10 because its unchanged runtime check stops. No actual non-production execution path is established here. No other P-1 requirement is waived. **P-1 remains AUTHORIZED — NOT EXECUTED — UNSPENT.** Sections 8–9 and the one-attempt production authorization remain unchanged. No test reruns, Host Preflight, Execute, entrypoint invocation, provisioning, or IPD write occurred.
