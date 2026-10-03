# NP-12 A8-S-03 — FAILED Branch Governance & Canonical Result Identity Authority Decision Record

- **Record Identifier:** `NP-12-A8-S-03`
- **Artifact Path:** `NP-12-A8-S-03-FAILED-BRANCH-AUTHORITY-DECISION-RECORD.md`
- **Record Type:** Program Authority Governance Decision Record — Durable Publication Act
- **Workstream:** `NP-12` — Governed Cross-Sector Screener
- **Gate:** `NP-12 A8-S-03` — `FAILED` Branch Governance & Canonical Result Identity Gate
- **Program Authority / Signer:** Ramki (Ramakrishnan) — IIPS Application Owner & Program Authority
- **Decision Date:** `2026-10-03`
- **Approved Disposition:** **`OPTION A — APPROVE`** (*Keep `FAILED` Result Identity Undefined; `N4-A6 §10.5` Governs*)
- **Decision Status:** `CLOSED / ACCEPTED — OPTION A APPROVED BY PROGRAM AUTHORITY`
- **Implementation Authority:** **NONE GRANTED BY THIS RECORD** (Option A requires zero changes to `N4-A6`, `N4-A10`, or `N4-A13`)
- **Authoritative Repository:** `ramkivs/iips-review-recovered` (`refs/heads/main`)
- **Authoritative Preparation Baseline (`origin/main`):** `4285235314d9b60467ef91f19c6590e0f4ade65f` (root tree `aee5ad16e33179bf8d9345533023fafd689cbfbd`)
- **IPD (`ramkivs/iips-production-market-data`):** Reference-only; zero mutations
- **Production:** OUT OF SCOPE; zero mutations

---

## 1. Gate Identity & Governing Authority Basis

This record durably records the Program Authority decision resolving the remaining independent specification-level governance item identified at `N4-A8`:

> **`A8-S-03` — `FAILED` Result Branch Identity & Canonical Result Semantics**

### 1.1 Immutable Governing Context (Not Reopened)

This decision treats the following completed gates and frozen specifications as immutable governing context and does not reopen, amend, or reinterpret any of them:

1. **N1, N2 (`G1`–`G5`), N3 (`blob c2402d36b7610cb4ce52abf1d071d3d46f136f62`), N4, N4-SD (`ScreenDefinition.ts`), N4 Identifier Governance, and N4 Canonical Byte Grammar (`NP12DEF v01`).**
2. **N4-A1** (`NP-12-N4-A1-BASELINE-BINDING-AUTHORITY-DECISION-RECORD.md`, bound baseline `f2886a5af43ad8df8676589daef86836039150f5` / tree `46c1a15bbcd1291701484457d1fe9815d8538888`).
3. **N4-A3** (`NP-12-N4-A3-AUTHORITY-DECISION-RECORD.md`, decisions `D-A2-1` through `D-A2-5` and `N4-A3-C1`).
4. **N4-A5** (`NP-12-N4-A5-AUTHORITY-DECISION-RECORD.md`, decisions `A5-D01` through `A5-D09`).
5. **N4-A6** (`NP-12-N4-A6-CONTRACT-SPECIFICATION.md`, decisions `A6-DR-01` through `A6-DR-06` and frozen formats `NP12MBR v01`, `NP12EXE v01`, `NP12RES v01`).
6. **N4-A8** (`NP-12-N4-A8-IMPLEMENTATION-READINESS-DETERMINATION.md`, isolating `A8-S-03`).
7. **N4-A9** (`NP-12-N4-A9-IMPLEMENTATION-AUTHORITY-DECISION.md`, deferring `A8-S-03` under §9 and §11.6 `D8`).
8. **N4-A10** (`NP-12-N4-A9-IMPLEMENTATION-RECORD.md` and the Increment 1 Screen runtime under `iips-platform/src/sector-engines/cross-sector/screen/`).
9. **N4-A12** (`NP-12-N4-A12-AUTHORITY-DECISION-RECORD.md`, blob `e37433d8eb4bf5436bbb4fffc8a873e3538df057`, decisions `GDS-01` through `GDS-12`).
10. **N4-A13** (`NP-12-N4-A13-IMPLEMENTATION-RECORD.md` and `ScreenProducerAdapter.ts`, preserving the `COMPLETED`-branch boundary).

---

## 2. Reconstruction of `A8-S-03`

1. **Origin (`N4-A8` §4.3, line 145):**
   - `NP-12-N4-A6-CONTRACT-SPECIFICATION.md` §10.2 declares `executionStatus ∈ { "COMPLETED", "FAILED" }` and §10.3 writes `T(executionStatus)` inside the `NP12RES v01` `resultPreimage` (alongside `T(executionId)`, `U32BE(totalPopulationCount)`, `U32BE(matchedCount)`, and `U32BE(memberResultCount)`).
   - At the same time, `N4-A6` §10.5 (*Required result shapes*, line 578) normatively specifies for a **Structurally failed execution**:
     - `executionStatus`: `FAILED`
     - `Member results`: **none emitted**
     - `matchedCount`: `n/a`
     - `Identity`: **"the execution fails before result identity; no partial result is canonical"**
   - `A8-S-03` recorded that without an explicit Program Authority ruling, an implementer could read §§10.2–10.5 as either (i) emitting no canonical result / result identity on structural failure (§10.5), or (ii) emitting a zero-member `FAILED` envelope under §10.3.
2. **Prior Deferrals (`N4-A9`, `N4-A10`, `N4-A12`, `N4-A13`):**
   - `N4-A9` (§9, §11.6 `D8`) classified `A8-S-03` as a material contract ambiguity requiring Program Authority disposition and prohibited Increment 1 from emitting, defining, or hashing any `executionStatus = "FAILED"` result.
   - `N4-A10` implemented the `COMPLETED` branch only (`CanonicalFormats.ts`, `ScreenExecution.ts`, `ScreenResult.ts:assertCompletedBranch`, and `np12-n4-a9-screen-runtime.test.ts` Subtest 41).
   - `N4-A12` (§2.2, §12.1) and `N4-A13` (`ScreenProducerAdapter.ts`) preserved `A8-S-03` untouched as an independent governance item.

---

## 3. Summary of Investigation Findings (`A8-S-03` Gate Phases 3 & 4)

1. **Structural Failures Precede Valid `NP12EXE v01` and `NP12RES v01` Preimage Construction:**
   - Under `N4-A6` §7.4 and §9.2, the six structural failure conditions (`EXECUTION_CONTRACT_MALFORMED`, `EXECUTION_DEFINITION_INVALID`, `EXECUTION_IDENTITY_INVALID`, `EXECUTION_POPULATION_MISMATCH`, `EXECUTION_DUPLICATE_MEMBER`, `EXECUTION_SECTOR_INVALID`) occur **before** a valid `ScreenDefinition` (`definitionDigest`, `populationIdentity`) and a complete, G5-ordered, population-matched set of `NP12MBR v01` member `inputHash` bindings exist.
   - Conversely, once all `NP12EXE v01` inputs pass admission and population binding, predicate evaluation (`ScreenEvaluator.ts`) is pure, total, and infallible — always yielding a `COMPLETED` `ScreenResult`.
   - Therefore, no structural failure can produce a valid `NP12EXE v01` `executionId` without inventing placeholder/sentinel fields, and `NP12RES v01` (§10.3) cannot be formed without a valid 64-lowercase-hex `executionId` and integer population/match counts.
2. **Member-Level Invalidity Is Already Governed Inside `COMPLETED` Executions (`D-A2-4`, `A5-D08`, `N4-A6` §§7.4, 10.4, 10.5):**
   - Any member whose structural identity and provenance fields are valid (`sector`, `referenceId`, `engineId`, `engineVersion`, `calibrationVersion`, `snapshotId`, `evidenceId`), but whose evaluand values (`conviction`, `quality`, `growthAvailability`, `growth`) violate admission rules, is admitted as `INVALID_MEMBER` with a deterministic `MemberErrorCode` (`MEMBER_VALUE_MISSING`, `MEMBER_VALUE_NON_NUMERIC`, `MEMBER_VALUE_NON_FINITE`, `MEMBER_VALUE_OUT_OF_RANGE`, `MEMBER_VALUE_OVER_PRECISION`, `MEMBER_GROWTH_INVALID`).
   - Such executions complete normally (`executionStatus = "COMPLETED"`) and receive deterministic `NP12MBR v01` `inputHash`, `NP12EXE v01` `executionId`, and `NP12RES v01` `resultId`.
3. **Full Consistency with `N4-A3 D-A2-5` and `N4-A6 §10.5`:**
   - `N4-A3 D-A2-5` (§8.1/§8.2) specifies that `ScreenResult` binds *"result identity/digest **where required**"*, and `N4-A6 §10.5` specifies that a structurally failed execution *"fails before result identity; no partial result is canonical"*.

---

## 4. Program Authority Decision (`A8-S-03`)

### 4.1 Explicit Program Authority Selection

**Authority Holder:** Ramki (Ramakrishnan) — IIPS Application Owner & Program Authority

> **`OPTION A — APPROVE`**

### 4.2 Normative Terms of the Approved Decision (`Option A`)

1. **`N4-A6 §10.5` Governs the `FAILED` Branch Authoritatively:**
   - A structurally failed Screen execution fails closed with a deterministic typed error (`ScreenExecutionError` with `ExecutionErrorCode` at the Screen boundary, or `ScreenProducerError` with `ScreenProducerErrorCode` at the producer boundary) **before** any `ScreenExecution` or `ScreenResult` identity is minted.
2. **No `NP12EXE v01` `executionId` or `NP12RES v01` `resultId` for Structural Failures:**
   - No `NP12EXE v01` `executionId` is created for a structurally failed execution.
   - No `NP12RES v01` `resultId` is created for a structurally failed execution.
   - No partial, synthetic, or zero-member `FAILED` `ScreenResult` is canonical or emitted.
3. **Disposition of the `"FAILED"` Token in `N4-A6 §10.2`:**
   - Within `N4-A6 §10.2`, `"FAILED"` is a lifecycle/error outcome classification only (denoting the §10.5 structural failure state that aborts before result identity) and **never** enters an `NP12RES v01` hash preimage.
   - `NP12RES v01` (§10.3) is exclusively the canonical result identity format for `executionStatus = "COMPLETED"`.
4. **Preservation of the Six-State Distinction:**
   - **State 1 (Member-level invalid result):** Represented inside a `COMPLETED` execution with `memberResultStatus = "INVALID_MEMBER"` and `memberErrorCode = MEMBER_*`; receives canonical `inputHash`, `executionId`, and `resultId`.
   - **State 2 (Structural execution failure):** Fails closed with a typed error before `ScreenExecution` or `ScreenResult` construction; receives no `executionId` and no `resultId`.
   - **State 3 (Completed execution with zero matches):** Completes with `executionStatus = "COMPLETED"`, `matchedCount = 0`, all valid members `NO_MATCH`, and canonical `executionId` and `resultId`.
   - **State 4 (Completed execution with invalid member(s)):** Completes with `executionStatus = "COMPLETED"`, `matchedCount + nonMatchCount + invalidCount = totalPopulationCount`, and canonical `executionId` and `resultId`.
   - **State 5 (Failed execution with no result):** The sole governed runtime realization of State 2 under `N4-A6 §10.5` and this decision.
   - **State 6 (Failed execution requiring an identity):** Rejected; not part of the IIPS Governed Screener contract.
5. **Audit-Only Provenance Invariant Preserved (`A6-DR-02`, `A6-DR-03`):**
   - `timestamp` and `requestId` remain strictly audit-only provenance and never enter any canonical identity preimage.
6. **Zero-Touch on `N4-A6`, `N4-A10`, `N4-A13`, and Frozen `v01` Formats:**
   - No amendment to `NP-12-N4-A6-CONTRACT-SPECIFICATION.md` is required or authorized.
   - `NP12DEF v01`, `NP12MBR v01`, `NP12EXE v01`, and `NP12RES v01` remain frozen as published.
   - No modification to N4-A10 (`iips-platform/src/sector-engines/cross-sector/screen/{ScreenMemberInput,CanonicalFormats,ScreenEvaluator,ScreenExecution,ScreenResult,index}.ts` and `np12-n4-a9-screen-runtime.test.ts`) is required or authorized; N4-A10's existing `COMPLETED`-only enforcement (`assertCompletedBranch` and `ScreenExecutionError`) is confirmed as fully conformant with this decision.
   - No modification to N4-A13 (`ScreenProducerAdapter.ts` and `np12-n4-screen-producer.test.ts`) is required or authorized.

---

## 5. Explicit Scope Exclusions

This decision record does **not** authorize:

1. Any modification to `NP-12-N4-A6-CONTRACT-SPECIFICATION.md` or any closed `N1`–`N4`, `N4-SD`, `N4-A1`–`N4-A10`, `N4-A12`, or `N4-A13` artifact;
2. Any modification to the N4-A10 Screen runtime modules or N4-A13 `ScreenProducerAdapter.ts`;
3. Any modification to any of the 13 certified sector engines, `renorm()`, CSIP (`OntologyMapper.ts`, `ScreeningPopulation.ts`, `CrossSectorEngine.ts`, `CrossSectorPlugin.ts`), `EngineRegistry.ts`, `EngineApiAdapter.ts`, or `frontend/server/executive-transport.ts`;
4. Any persistence, storage, transport, API, or UI implementation;
5. Any certification or conformance claim beyond existing boundaries;
6. Any mutation in IPD (`ramkivs/iips-production-market-data`) or Production.

---

## 6. Durability & Verification Metadata

| Item | Value |
|---|---|
| **Authoritative Repository** | `ramkivs/iips-review-recovered` |
| **Authoritative Target Ref** | `refs/heads/main` |
| **Preparation Baseline (`origin/main`)** | `4285235314d9b60467ef91f19c6590e0f4ade65f` |
| **Preparation Baseline Tree** | `aee5ad16e33179bf8d9345533023fafd689cbfbd` |
| **Artifact Path** | `NP-12-A8-S-03-FAILED-BRANCH-AUTHORITY-DECISION-RECORD.md` |
| **Effectiveness Condition** | Effective upon publication to `ramkivs/iips-review-recovered` `refs/heads/main` and independent remote verification of commit, tree, blob SHA, and raw SHA-256 |

---

**End of NP-12 A8-S-03 Authority Decision Record.**
