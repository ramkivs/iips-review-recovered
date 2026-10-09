# IIPS v3.0 — G1 B2 Capability Admission: PIT and D114 (non-production consumption)

| Field | Value |
|---|---|
| Record type | Program Authority capability-scoped admission decision. Additive. Narrow. Not a provider designation. |
| Status | **PREPARED — NOT IN FORCE.** Takes effect only when (1) the Program Authority records it, and (2) this file is durably published to `ramkivs/iips-review-recovered` `refs/heads/main` and independently verified there. This session-branch copy is not authoritative. |
| Classification before this record | PIT: **NOT ADMITTED**. D114: **NOT ADMITTED**. (§2) |
| Prepared disposition | PIT: ADMIT, narrow, non-production (§3.1). D114: ADMIT, narrow, non-production (§3.2). |
| Decision source | Requester instruction in session, 2026-10-09 (Part B): prepare one capability-scoped admission "covering only the evidence-supported scope" if neither surface has an authoritative admission basis. The Program Authority decision is the requester's to record. The agent renders no authority. |
| Authority anchor (exact pin) | IPD `iips-production-market-data` `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (branch `np04-governed-persistence-windows`). Consumed by IRR `main` at `frontend/package.json:15` and `frontend/package-lock.json:11` and `:2286` (identical SHA). |
| Predecessors | G1 decision record `docs/integration/IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_RECORD.md` (additive errata E-1, E-2 and verification note V-1, committed as `20b3e9a552c1c9befc81c5387721e8def66c1c92`; see its §10). G1 boundary record `docs/integration/IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_BOUNDARY.md` (unchanged; blob `5f341ac68f1307d77e9827bedb42ed5a136b2705`). |
| Execution mode | NON_PRODUCTION. Production is out of scope. |

## 1. Verified baseline

| Item | Identifier | Verification |
|---|---|---|
| IRR `main` | `8877382048802702484e4297eb73b900e40fa792` | `git ls-remote`, 2026-10-09 |
| IPD `main` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | `git ls-remote`, 2026-10-09 |
| IPD pin consumed by IRR `main` | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` | IRR `package.json` and lockfile (identical) |
| Pin exports | `./pit` → `dist/package/pit/package.js`; `./d114-non-production` → `dist/package/d114/non_production_package.js`; `./persistence` → `dist/package/persistence/package.js` | pin `package.json` |
| IPD `main` exports | none (no `exports` field) | `main` `package.json` |
| Surface source on IPD `main` | `src/pit/package.ts`: ABSENT. `src/d114/non_production_package.ts`: ABSENT. `src/d114/non_production_pit_population.ts`: ABSENT. All three are present on the pin only. | `git diff --name-status` (main vs pin) |
| Sibling line | `0dab1221fb0f89e2e0601ea905d642bfe72d5f9c` carries `./pit` and `./d114-non-production` (no `./persistence`). Neither it nor the pin is an ancestor of the other. | ancestry check (scratch mirror) |

**Consumers on IRR `main`** (import statements; all server-side; no browser import):

| File | Imports from the pin |
|---|---|
| `frontend/server/pit/ipdPitReadAdapter.ts` | `PitReadService`; types `DataProvenanceDTO`, `PointInTimeStore` (`./pit`) |
| `frontend/server/pit/nonProductionPitStore.ts` | `PointInTimeStore`; types `CanonicalEnvelope`, `DataDomain` (`./pit`) |
| `frontend/server/pit/nonProductionRuntimePitStore.ts` | `PointInTimeStore` (`./pit`); `populateNonProductionD114Pit` (`./d114-non-production`) |
| `frontend/server/pit/pitRuntimeIntegration.test.ts` (test) | `PointInTimeStore`, `PitReadService` (`./pit`) |
| `frontend/server/pit/pitD114RuntimeIntegration.test.ts` (test) | `PointInTimeStore`, `PitReadService` (`./pit`); `createNonProductionD114PitStore`, `populateNonProductionD114Pit`, `ingestNonProductionD114Archives`, `NON_PRODUCTION_D114_*` constants (`./d114-non-production`) |

No `frontend/src` module imports the IPD package. `frontend/src/api/pit.test.ts` mentions it in comments only.

## 2. Classification before this record

| Surface | Classification | Basis located | Why this is not an admission |
|---|---|---|---|
| **PIT** (`./pit`) for IRR consumption | **NOT ADMITTED** | None on IRR `main` or IPD `main` that admits an IRR PIT consumer. | (a) IRR D115 implementation-authorization record (`docs/integration/NP-08-D115-IMPLEMENTATION-AUTHORIZATION-DECISION-RECORD.md`, main): "PIT/IU-8/IU-7 reopening — NOT AUTHORIZED". This restricts PIT work. It neither admits nor addresses consumption. (b) IRR D115 closure act (main): "PIT storage != D115 binding persistence". (c) IU-1 implementation authority act §7 (IPD, **pin only, branch-only**): "This act does **not** authorize… an IRR PIT consumer." (d) IRR NP-15 investigation record (main) records IU-5 and IU-6 PIT integration in its timeline. It is a read-only investigation record, not an admission. (e) The code comment "the authorized IU-5A package boundary" (`ipdPitReadAdapter.ts:21`) has no authority record. "IU-5A" appears only in code and in the NP-15 timeline. |
| **D114** (`./d114-non-production`) for IRR consumption | **NOT ADMITTED** | IPD `main` `evidence/d114/stage5-authority-decision.md` (Authority Act `d114-stage5-auth-2026-09-20-001`, effective `2026-09-20T15:00:00.000Z`): closes `GATE-D114-STAGE5-PIT-INGESTION-AND-UI-QUALIFICATION` in `NON_PRODUCTION / OFFLINE_BOOTSTRAP`. | The act is an IPD gate closure. It names no consumer, no package export, and not IRR. It expressly does not authorize production historical acquisition, closure of `OI-HIST-01` or `G-004`, resolution of `AD-17 / M-2`, `ReplayService` runtime equivalence, runtime byte identity, NSE entitlement, or production deployment or live network. Production historical data eligibility is NOT AUTHORIZED (act §4). The D114 package export exists only on the pin. |
| Conflict | none | not applicable | No two effective authoritative acts conflict. The only explicit exclusion (IU-1 §7) sits in a branch-only act, and it does not prohibit a later decision. The classification is therefore NOT ADMITTED, not CONFLICTED. |

**Supporting evidence (not authority):**
- IPD `main` P15 certification (`evidence/p15/p15-certification-report.md`): CERTIFIED. Its certified scope includes Hop 3, "Append-only PIT Store persistence with zero-lookahead `asOf` query semantics." This supports PIT store semantics inside IPD. It does not name IRR and does not admit a consumer.
- IPD `main` `evidence/d114/stage5-ui-read-only-qualification-report.md` is an Arena-prepared report. It is non-authoritative regardless of location.
- Scratch runs (NON-AUTHORITATIVE, not acceptance evidence): the four IRR PIT suites passed in the logged vitest run (`pitReadBoundary` 48, `pitRuntimeIntegration` 28, `pitD114RuntimeIntegration` 27, `src/api/pit` 10; 113 tests). The IPD compiled suite passed 542/542. An unauthenticated dev-mode probe of `/api/pit/market-data` returned a fixture record (`found:true`).

## 3. Prepared decision: capability-scoped admission (non-production)

### 3.1 PIT: PREPARED — ADMIT (narrow)
- **Surface:** `iips-production-market-data/pit`, at the exact pin in the control table.
- **Admitted symbols:** exactly those imported by the consumers in §1 (`PitReadService`, `PointInTimeStore`, and the types `DataProvenanceDTO`, `CanonicalEnvelope`, `DataDomain`).
- **Admitted consumers:** the five files in §1 only (three runtime, two test).
- **Admitted locus:** IRR server side (Node). No browser import.
- **Admitted data:** non-production only. This means the `MOCK_FIXTURE` set (`nonProductionPitStore.ts`) and the D114 non-production population, written and read through the public `PointInTimeStore` API inside the existing single-store composition.
- **Authority boundary:** PIT authority remains IPD-owned. IRR resolves no vintage, selects no series, and does not decide which record is latest (as documented in `nonProductionRuntimePitStore.ts`).

### 3.2 D114: PREPARED — ADMIT (narrow)
- **Surface:** `iips-production-market-data/d114-non-production`, at the exact pin.
- **Admitted symbols:** exactly those imported by the consumers in §1 (`populateNonProductionD114Pit`, `createNonProductionD114PitStore`, `ingestNonProductionD114Archives`, and the `NON_PRODUCTION_D114_*` constants as used by the tests).
- **Admitted consumers:** `nonProductionRuntimePitStore.ts` (runtime) and `pitD114RuntimeIntegration.test.ts` (test).
- **Admitted inputs:** local, offline, non-production inputs only. No network acquisition path is admitted.
- **Evidence basis:** the IPD `main` Stage-5 act in §2 (gate CLOSED in `NON_PRODUCTION`; production historical data eligibility NOT AUTHORIZED).

### 3.3 Conditions (apply to both)
1. **Exact pin only:** `2e11fa3b…`. Not admitted by this record: `0dab1221…`, `6828155…` (G24 candidate), or IPD `main` `4d3e1cd…` (no entrypoints for these surfaces on main).
2. **Branch scope:** these surfaces exist only on the pin branch. This record makes them consumable for IRR non-production composition. It does not make IPD `main` authoritative for them.
3. **No universal IPD provider authority.** No pin change. No G24 merge. This record changes no implementation.
4. **No new consumer, export, or symbol** beyond §3.1 and §3.2. Any addition requires a new decision.
5. **No PIT reopening, no IU-7 or IU-8 work, no D91 or NP-12 changes.** This preserves the "NOT AUTHORIZED" rows of the D115 implementation-authorization record.
6. **Non-production writes only.** The fixture append (`appendNonProductionFixtures`) and the D114 population are the only admitted write paths. No production persistence, no live provider, no credentials, no network.
7. **Not identity or tenancy authority.** PIT and D114 are not identity, tenant, CompanyId, or D115 binding authority. Fixture keys are test or market-data identities only.
8. **Not Reports or G-2 persistence.** The Reports (`./persistence`) and G-2 admissions are unchanged by this record.
9. **No acceptance claim.** No runtime, full-E2E, live-IdP, production, or certification acceptance is claimed or granted.

### 3.4 Explicit non-authorizations (NOT ADMITTED)
- Production market data; live NSE or Dhan access; production historical acquisition; closure of `OI-HIST-01` or `G-004`.
- `ReplayService` runtime equivalence and runtime byte identity (both NOT VERIFIED in the IPD Stage-5 act).
- A universal IPD provider designation; a re-pin to `0dab1221…` or `6828155…`; a G24 merge.
- Any PIT or D114 consumer beyond §1, and any browser-side import.
- Any use of PIT or D114 for identity, tenancy, or the D115 binding.

## 4. Relation to other records
- **IU-1 §7 (pin, branch-only).** IU-1 states that it does not itself authorize an IRR PIT consumer. It does not prohibit a later decision. This record is that separate, later decision, and only for the scope in §3.1. IU-1 is not amended.
- **IU-2 (pin, branch-only).** Silent on IRR consumption. It states "No IRR journal migration." It is not an admission and is not modified.
- **NP-15 (IRR main, investigation).** Records the IU-5 and IU-6 history, and the IU-6 repin to `0dab1221`, which the pin later superseded with `2e11fa3b`. An investigation record, not an admission.
- **D115 records (IRR main).** Preserved unchanged.
- **Reports (D-3) and G-2 direction (main).** Unchanged. D-3 cites D-1 (`561cc85fdbc929e68e798b1e97dda76a64262b9e`) and D-2 (`f89f1904d619eb7bad01db0e2ead4bcb5c91414d`) as IRR `main` merges. Both are ancestors of `main`.
- **Reports (D-3) dependency check.** No material dependency on the NP-04 transfer copy was found (G1 decision record §10, V-1). This record's scope is unchanged by that check.
- **Errata to the predecessor record (now applied in the G1 decision record as additive errata E-1, §10; this bullet is retained for traceability).** G1 decision record §6 item 11 states that D-2 §13 is PENDING and that its PR and merge commit are pending. That statement is incorrect. D-2 is durably published. Merge `f89f1904d619eb7bad01db0e2ead4bcb5c91414d` (PR #39, adds the 197-line D-2 record) is an ancestor of IRR `main`, and the D-2 file header states "durably published". The §13 "Durability" fields still read PENDING in the file on `main`. Those are stale self-referential placeholders, not an open publication question. Corrected statement: "D-2 is durably published (merge `f89f1904…`). Its §13 fields are stale placeholders."

## 5. Unresolved items preserved (PIT and D114)
1. **Surface location.** Both surfaces exist only on the pin. IPD `main` lacks `src/pit/package.ts`, `src/d114/non_production_package.ts`, and `src/d114/non_production_pit_population.ts`. Whether and how these reach IPD `main` is unresolved.
2. **Sibling lines.** `0dab1221…` and `2e11fa3b…` both carry `./pit` and `./d114-non-production`, and neither is an ancestor of the other. The reason for the IU-6 repin (`0dab1221` → `2e11fa3b`) is not recorded in an authority act (UNPROVEN).
3. **Unsupported code assertion.** `ipdPitReadAdapter.ts:21` calls the boundary "the authorized IU-5A package boundary." No authority record for IU-5A was located. Treat that comment as unsupported until a record exists. Correcting the comment is a separate, later item.
4. **Runtime evidence** for the PIT and D114 consumers is UNPROVEN for this record. The scratch results in §2 are not acceptance evidence.
5. **D114 UI read-only qualification** is Arena-prepared and non-authoritative.
6. **IU-1 (branch-only)** remains in force on the pin for its own scope. It would need reconciliation if the pin were ever moved onto IPD `main`.

## 6. G2 boundary (Part C)
- **PIT and D114: BLOCKED from G2** until this record is durably published on IRR `main`, verified there, and the Program Authority has recorded the decision. No G2 work touches PIT or D114 consumers before then.
- **Scopes with an authoritative basis already on `main`:** Reports under D-3 (qualified branch scope), and the G-2 architectural direction.
- **Scopes whose G1 basis is still session-only:** the B1 host decision, the B2 Reports and G-2 capability admissions, and the B3 taxonomy decision. They become authoritative only with G1 publication.
- **G2 implementation:** not started by this record.

## 7. Status, publication and verification
- **Session branch:** this record is committed to `arena/1dcbe88d-iips-review-recovered` only. Commit and blob identifiers are in the completion report, not in this file.
- **IRR `main`:** NOT PUBLISHED by the agent (operator session policy).
- **Publication set:** this file, published together with the G1 decision record and the G1 boundary record, so that the predecessor references resolve on `main`. Publish as one change, without content modification.
- **Verification after publication:** `origin/main` contains each file at its path with the blob recorded in the completion report. Local equals remote. The worktree is clean.
- **Until verification:** PIT and D114 remain NOT ADMITTED for G2 purposes.

*Prepared by Arena Agent Mode. The agent renders no Program Authority decision. This record becomes effective only on recording by the Program Authority and durable publication to IRR `main`.*
