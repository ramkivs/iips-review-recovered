# IIPS v3.0 — G2-2 Existing Capability Convergence Decision Record (R2)

| Field | Value |
|---|---|
| Record type | Program Authority decision record, additive candidate R2. Records decisions, scoped admissions and scoped consumer designations. Grants no implementation authority. |
| Status | **CANDIDATE R2 — NOT APPROVED FOR MERGE — NOT PUBLISHED — NOT AUTHORITATIVE — PENDING PROGRAM AUTHORITY REVIEW** |
| Effectiveness | Each decision in this record takes effect only when this record is merged to `refs/heads/main` of `ramkivs/iips-review-recovered` and that merged state is independently verified there (§10). A decision whose scope states a different condition says so in §1. |
| Base | `800789957f2a3cf4e28d5dfff49d92f29d6a7671` (IRR `main`) |
| Head under review | Session branch `arena/1dcbe88d-iips-review-recovered`. Identifiers of the head commits are in the pull request and the completion report, not in this file, because a file cannot contain its own commit identifier. |
| Supersedes | R1. R1 was never committed and is not approved. Its transfer set is superseded and is not a route for R2. |
| Environment | Non-production. Production is out of scope. |

## 0. Provenance of wording

- **Operative decision scope** (AD-01 to AD-05, AD-06, AD-20, E-4 to E-7): previously recorded Program Authority decisions and scope boundaries, as relayed by the requester in the G2-2 recovery instruction of 2026-10-09. They are recorded here as relayed. The original Program Authority option text was lost and is not reproduced.
- **Session-note labels**: option letters (A, B, C) and "category (iii)" come from the session notes. They are labels only and are not operative on their own.
- **Verbatim quotations**: copied from the named files on IRR `main` at base `800789957…`. Blob identities of the G1 record, the B2 record and the G1 boundary record are checked by C03, C04 and C16.
- **Explanatory text**: marked *Explanatory*. Written by the agent. Non-operative. It is not an approval and changes no decision.
- **Not recovered and not reconstructed**: the text of E-4 to E-7, and the original option wording of AD-01 to AD-05.

## 1. Decisions

| ID | Decision as recorded | Operative scope | Effectiveness | Not granted |
|---|---|---|---|---|
| AD-01 | Bounded Reports ratification | Ratifies the presence on IRR `main` of the 13 Reports paths listed in Annex A §A2 (the Reports paths merged to `main` through PR #42, with their merge blobs unchanged on `main`). | §10 | Any pin admission; G3 membership; UI admission; runtime admission; admission of the 10 other PR #42 paths in Annex A §A3; promotion. |
| AD-02 | PIT and D114 prepared admission, recorded at its exact scope | Non-production admission of the PIT and D114 surfaces, admitted symbols, admitted consumers, locus and data exactly as recorded in §2, at pin `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` only. | **Effective only after this record is durably published to `main` and independently verified there (§10). Until then PIT and D114 remain NOT ADMITTED.** | Any other pin; `0dab1221…`; `6828155…`; IPD `main` `4d3e1cd…`; any consumer, export, symbol, data set, locus or browser import beyond §2; any identity, tenancy or D115 use; production data; any network acquisition path; any runtime acceptance claim. |
| AD-03 | Reference designation for IRR non-production G-2 consumption | Designates `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` as the reference for IRR non-production G-2 consumption only. Distinguished from the G1 record in §3. | §10 | Admission of the commit to IPD `main`; any IRR pin change; promotion authority; merge; implementation authority; any other consumption; production. |
| AD-04 | Bounded non-production G-2 consumer designation, preserved | Preserves the bounded non-production G-2 consumer designation. The consumer is identified in the session notes as IRR commit `a0ab5a344d1ca2cb7c07a8fa6ae2090b2535852c`, an ancestor of IRR `main` (C10). | §10 | Implementation authority; production use; any conclusion on promotion coverage (AD-20 OPEN). |
| AD-05 | Tenant membership deferred; AUTHORITY REQUIRED retained | Tenant membership is deferred. Disposition C (AUTHORITY REQUIRED) is retained. No decision in this record relies on tenant behaviour. | §10 | G3 membership admission; creation or activation of a Company Identity Authority; reliance on tenant behaviour; use of the field `companyId` as an identity source. |
| AD-06 | OPEN | Provenance of the IRR pin `2e11fa3b…`. No decision is made. | Not applicable | Closure. No outcome is inferred. |
| AD-20 | OPEN | Promotion coverage of the G-2 consumer on IRR `main`. No decision is made. | Not applicable | Closure. No outcome is inferred. The earlier note "no promotion act located" is superseded (§7). |
| E-4 to E-7 | UNAPPLIED | Text lost; not reconstructed. | Not applicable | Application requires separate Program Authority direction and the exact text. |

## 2. AD-02: exact prepared PIT and D114 admission scope

Source: `docs/integration/IIPS_v3.0_G1_B2_PIT_D114_CAPABILITY_ADMISSION_DECISION.md` on IRR `main`, blob `2803c1c219a91230750cb18f2c52a7d4ace314db`. Quoted verbatim:

> **Consumers on IRR `main`** (import statements; all server-side; no browser import):
>
> | File | Imports from the pin |
> |---|---|
> | `frontend/server/pit/ipdPitReadAdapter.ts` | `PitReadService`; types `DataProvenanceDTO`, `PointInTimeStore` (`./pit`) |
> | `frontend/server/pit/nonProductionPitStore.ts` | `PointInTimeStore`; types `CanonicalEnvelope`, `DataDomain` (`./pit`) |
> | `frontend/server/pit/nonProductionRuntimePitStore.ts` | `PointInTimeStore` (`./pit`); `populateNonProductionD114Pit` (`./d114-non-production`) |
> | `frontend/server/pit/pitRuntimeIntegration.test.ts` (test) | `PointInTimeStore`, `PitReadService` (`./pit`) |
> | `frontend/server/pit/pitD114RuntimeIntegration.test.ts` (test) | `PointInTimeStore`, `PitReadService` (`./pit`); `createNonProductionD114PitStore`, `populateNonProductionD114Pit`, `ingestNonProductionD114Archives`, `NON_PRODUCTION_D114_*` constants (`./d114-non-production`) |
>
> No `frontend/src` module imports the IPD package. `frontend/src/api/pit.test.ts` mentions it in comments only.

> ### 3.1 PIT: PREPARED — ADMIT (narrow)
> - **Surface:** `iips-production-market-data/pit`, at the exact pin in the control table.
> - **Admitted symbols:** exactly those imported by the consumers in §1 (`PitReadService`, `PointInTimeStore`, and the types `DataProvenanceDTO`, `CanonicalEnvelope`, `DataDomain`).
> - **Admitted consumers:** the five files in §1 only (three runtime, two test).
> - **Admitted locus:** IRR server side (Node). No browser import.
> - **Admitted data:** non-production only. This means the `MOCK_FIXTURE` set (`nonProductionPitStore.ts`) and the D114 non-production population, written and read through the public `PointInTimeStore` API inside the existing single-store composition.
> - **Authority boundary:** PIT authority remains IPD-owned. IRR resolves no vintage, selects no series, and does not decide which record is latest (as documented in `nonProductionRuntimePitStore.ts`).
>
> ### 3.2 D114: PREPARED — ADMIT (narrow)
> - **Surface:** `iips-production-market-data/d114-non-production`, at the exact pin.
> - **Admitted symbols:** exactly those imported by the consumers in §1 (`populateNonProductionD114Pit`, `createNonProductionD114PitStore`, `ingestNonProductionD114Archives`, and the `NON_PRODUCTION_D114_*` constants as used by the tests).
> - **Admitted consumers:** `nonProductionRuntimePitStore.ts` (runtime) and `pitD114RuntimeIntegration.test.ts` (test).
> - **Admitted inputs:** local, offline, non-production inputs only. No network acquisition path is admitted.
> - **Evidence basis:** the IPD `main` Stage-5 act in §2 (gate CLOSED in `NON_PRODUCTION`; production historical data eligibility NOT AUTHORIZED).
>
> ### 3.3 Conditions (apply to both)
> 1. **Exact pin only:** `2e11fa3b…`. Not admitted by this record: `0dab1221…`, `6828155…` (G24 candidate), or IPD `main` `4d3e1cd…` (no entrypoints for these surfaces on main).
> 2. **Branch scope:** these surfaces exist only on the pin branch. This record makes them consumable for IRR non-production composition. It does not make IPD `main` authoritative for them.
> 3. **No universal IPD provider authority.** No pin change. No G24 merge. This record changes no implementation.
> 4. **No new consumer, export, or symbol** beyond §3.1 and §3.2. Any addition requires a new decision.
> 5. **No PIT reopening, no IU-7 or IU-8 work, no D91 or NP-12 changes.** This preserves the "NOT AUTHORIZED" rows of the D115 implementation-authorization record.
> 6. **Non-production writes only.** The fixture append (`appendNonProductionFixtures`) and the D114 population are the only admitted write paths. No production persistence, no live provider, no credentials, no network.
> 7. **Not identity or tenancy authority.** PIT and D114 are not identity, tenant, CompanyId, or D115 binding authority. Fixture keys are test or market-data identities only.
> 8. **Not Reports or G-2 persistence.** The Reports (`./persistence`) and G-2 admissions are unchanged by this record.
> 9. **No acceptance claim.** No runtime, full-E2E, live-IdP, production, or certification acceptance is claimed or granted.
>
> ### 3.4 Explicit non-authorizations (NOT ADMITTED)
> - Production market data; live NSE or Dhan access; production historical acquisition; closure of `OI-HIST-01` or `G-004`.
> - `ReplayService` runtime equivalence and runtime byte identity (both NOT VERIFIED in the IPD Stage-5 act).
> - A universal IPD provider designation; a re-pin to `0dab1221…` or `6828155…`; a G24 merge.
> - Any PIT or D114 consumer beyond §1, and any browser-side import.
> - Any use of PIT or D114 for identity, tenancy, or the D115 binding.

*Explanatory: conditions carried into AD-02 from the same source.*

- The B2 status row ("PREPARED — NOT IN FORCE") stays as written. It becomes stale when AD-02 is effective, and its correction is a separate additive record (§8). The B2 file is not edited.
- B2 §5 item 3 applies to the code comment at `frontend/server/pit/ipdPitReadAdapter.ts:21`: "Treat that comment as unsupported until a record exists." AD-02 does not rely on that comment. Correcting it is a separate, later item and is not part of R2.
- B2 §5 item 4 applies: "Runtime evidence for the PIT and D114 consumers is UNPROVEN for this record." AD-02 records a non-production admission. It claims no runtime acceptance.
- B2 §6 applies: "PIT and D114: BLOCKED from G2 until this record is durably published on IRR `main`, verified there, and the Program Authority has recorded the decision." This is satisfied for AD-02 only when the steps in §10 have occurred.
- Verified at base: the five consumer files exist (C22); the pin's export map contains `./pit`, `./d114-non-production` and `./persistence` (C20); the eight named symbols are present in the pin's source tree (C21). The `NON_PRODUCTION_D114_*` constants named in §3.2 were not checked.

## 3. AD-03: reference designation, and its relation to G1

G1 record, quoted verbatim (blob `857d14513c3fc2c45f9015145fc7f36cd7ad6141`):

> 2. **User-portfolio / durable-persistence domain.** The G-2 architectural direction associated with baseline `0dab1221…` and the G24 candidate line continues, strictly within the user-portfolio / durable-persistence capability scope covered by that decision.
>
> This adopts option (i) of the narrow B2 question in the boundary record (§3.4). The G-2 side is expressed as the baseline `0dab1221…` and the G24 candidate line. The requester did not designate `6828155…` as an admitted commit.
>
> 3. **G-2 baseline designation conflict.** The G-2 record names `0dab1221…` as the IPD architecture baseline. IRR's G2 consumer and readiness records name `6828155…` as the G24 pinned upstream. Which commit is the admitted reference for IRR consumption is unresolved.

*Explanatory:*

- G1 recorded, accurately as of its date, that the requester had not designated `6828155…` as an admitted commit. That statement stays as written. This record does not edit it and does not treat it as wrong.
- G1 decision 2 gave the G-2 direction associated with the G24 candidate line a capability-scoped continuation. It did not designate the commit `6828155…` as an admitted commit. AD-03 is a separate, later, scoped decision: the commit is designated as the reference for IRR non-production G-2 consumption only.
- AD-03 does not admit the commit to IPD `main` (verified: C19). It does not change the IRR pin, which is `2e11fa3b…`. It does not authorize promotion or merge.
- G1 §6, B2 item 3 asked which commit is the admitted reference for IRR consumption. That item is resolved for IRR non-production G-2 consumption only. It stays unresolved for any other consumption.
- No approved decision says how a reference that is not the pin is consumed by IRR. This record does not create such a mechanism (§14).

## 4. AD-01: Reports ratification and reconciliation with historical records

Scope and evidence:

- Ratified set: the 13 paths in Annex A §A2. Each one's blob at the PR #42 merge `47edf6f3db79c6c443caed148121406f33a158b7` (an ancestor of IRR `main`, C12) is unchanged on `main` (C17).
- Excluded from this ratification: the 10 other PR #42 paths in Annex A §A3. C18 confirms that the 23 PR #42 changed paths partition exactly into the 13 ratified and 10 excluded paths.
- Two excluded paths, `frontend/server/admin-transport.ts` and `frontend/server/executive-transport.ts`, differ on `main` from their PR #42 merge blobs. Their current state is not reviewed here, and no inference is drawn from the difference.

Historical records, quoted verbatim and not edited.

D-3 (`docs/integration/GOVERNED-REPORTS-ACCEPTANCE-DECISION.md`), §10 and §11:

> ## 10. Acceptance Scope and Status
>
> - Acceptance scope: the current qualified Governed Reports branch scope only.
> - Branch status: **REPORTS CURRENT STATUS: ACCEPTED / BRANCH-ONLY.**
> - Current IRR main does NOT contain the Reports implementation; current IPD main does NOT contain the
>   Reports implementation. Acceptance changes neither main.
> - UI08 Reports is explicitly excluded: separate lineage, non-interchangeable, unaccepted unless
>   separately decided, not promoted, not main-admitted.
>
> ## 11. Authority Exclusions
>
> - Implementation authority: NOT GRANTED. Promotion authority: NOT GRANTED. Promotion executed: NO.
> - Main admission: NOT GRANTED. Final convergence: NOT ESTABLISHED. Production: excluded.
> - This acceptance does not constitute production eligibility, universal persistence admission,
>   universal identity authority, live-IdP qualification, or independently reproduced process-restart
>   certification. Any future promotion requires a separate governance act and separate authorization.

G1 record, decision 1 (blob `857d14513c3fc2c45f9015145fc7f36cd7ad6141`):

> 1. **Reports / persistence boundary.** The PA-accepted Reports binding associated with IPD pin `2e11fa3b…` continues, strictly within the capability and scope for which it was accepted. That scope is governed Reports persistence through the `./persistence` export and `GovernedArtifactStore`. The acceptance status is ACCEPTED / BRANCH-ONLY.

*Explanatory: reconciliation.*

- The evidence is that the PR #42 merge is an ancestor of IRR `main`, and that its Reports paths are on `main` unchanged. The D-3 §10 statement that IRR `main` does not contain the Reports implementation is therefore inconsistent with the present state of `main`. It may have been accurate when D-3 was written. D-3 is not edited.
- AD-01 resolves that inconsistency for the ratified set only. Presence on `main` of those 13 paths is ratified. For that set, D-3 §10, and the D-3 §11 statement that main admission is not granted, are superseded. A corrective additive errata to D-3 is required (§8) and is not made here.
- G1 decision 1 records the Reports acceptance as "ACCEPTED / BRANCH-ONLY". For the ratified set that status no longer describes `main`. A corrective additive errata to G1 is required (§8) and is not made here.
- G1 §6, B2 item 9 states that main publication of the Reports implementation is not recorded. AD-01 records it for the ratified set only.

Not resolved by this record:

- Any authority basis for the PR #42 merge beyond AD-01's ratification of the 13 paths. No separate authorizing act for that merge was examined in preparing this record.
- D-3 §11 items other than main admission: promotion authority, promotion execution, implementation authority and production. They are not addressed.
- The UI08 exclusion in D-3 §10. It is not addressed.
- The 10 excluded PR #42 paths (Annex A §A3).
- PR #42's change to `frontend/server/pit/ipdPitReadAdapter.ts`, an AD-02 consumer. It is governed by AD-02's scope, and this record does not review its content.
- The G1 status block (§8).

## 5. AD-04 and AD-05 (explanatory)

- **AD-04.** The label "category (iii)" is a session-note label. Its definition is not in any repository source examined. This record applies the directed scope text, "preserve the bounded non-production G-2 consumer designation". It does not decide whether the label means more or less than that text.
- **AD-05.** The item list in the lost draft is not recovered. The directed scope names one subject, tenant membership. No other AD-05 item is identified in this record.

## 6. Authority granted and not granted

Granted, effective per §1 and §10:

1. Recording of AD-01 to AD-05 at the scopes in §1 to §5.
2. AD-01: ratification of the presence on IRR `main` of the 13 paths in Annex A §A2, and nothing else.
3. AD-02: non-production admission of the PIT and D114 surfaces, consumers, symbols and data in §2, at pin `2e11fa3b…` only.
4. AD-03: designation of `6828155…` as the reference for IRR non-production G-2 consumption only.
5. AD-04: preservation of the bounded non-production G-2 consumer designation.

Not granted:

- Implementation authority of any kind. G2 implementation: NONE. G2(a): NONE.
- Any IRR pin change. The pin remains `2e11fa3b…`. No re-pin to `0dab1221…`, `6828155…` or IPD `main`.
- Any merge, revert or cherry-pick, including of candidate branches. The merge of this record's pull request requires separate approval (§10).
- Any promotion authority, and any promotion of `6828155…`, the G24 line or another IPD line into IPD `main`.
- Universal IPD provider authority for any IPD line. G1 §6, B2 item 1 remains unresolved by design.
- Production authority, production data, live Dhan, live OIDC/Keycloak certification, or production readiness.
- Runtime route-protection claims from source alone; runtime acceptance; full end-to-end acceptance.
- G3 tenant membership admission; creation or activation of a Company Identity Authority; reliance on tenant behaviour.
- UI or runtime admission of Reports.
- Closure of AD-06 or AD-20.
- Application of E-4 to E-7.

## 7. Repositories, refs and commits

| Role | Repository | Ref | Identifier | Status |
|---|---|---|---|---|
| Base | `ramkivs/iips-review-recovered` | `main` | `800789957f2a3cf4e28d5dfff49d92f29d6a7671` | Authoritative. Verified (C01). |
| Head under review | `ramkivs/iips-review-recovered` | `arena/1dcbe88d-iips-review-recovered` | Pull request and completion report | Not authoritative until merged. Earlier session commits preserved. No rewrite, reset or force-push. |
| IRR pin | `ramkivs/iips-production-market-data` | `np04-governed-persistence-windows` | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` | Pin in `frontend/package.json` (C02, C06). Provenance OPEN (AD-06). |
| AD-02 surfaces | `ramkivs/iips-production-market-data` | at the pin | `2e11fa3b…` | Export keys and symbols checked (C20, C21). Not on IPD `main` (B2 §5 item 1). |
| IPD main | `ramkivs/iips-production-market-data` | `main` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | Non-authoritative (C05). |
| G-2 baseline | `ramkivs/iips-production-market-data` | in history | `0dab1221fb0f89e2e0601ea905d642bfe72d5f9c` | Scope reference (C09). Not admitted for consumption by this record. |
| AD-03 reference | `ramkivs/iips-production-market-data` | `arena/01a0e6d9-…`, `arena/01a0f308-…` | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` | Reference for IRR non-production G-2 consumption only. Tips (C07). Not an ancestor of IPD `main` (C19). |
| AD-04 consumer | `ramkivs/iips-review-recovered` | ancestor of `main` | `a0ab5a344d1ca2cb7c07a8fa6ae2090b2535852c` | Preserved designation (C10). AD-20 OPEN. |
| Acceptance reference | `ramkivs/iips-production-market-data` | `arena/01a0f839-…` | `12c480b5bf5cfbe0f296fcd12c9189328b915417` | Reference only (C08). |
| Promotion-authority act | `ramkivs/iips-production-market-data` | on `arena/01a0f839-…` | `2606185923f6cbd3f4df5c3af200f54d40ed4bbc` | Presence verified (C13). Coverage of the G-2 consumer NOT evaluated. |
| D-3 contradiction | `ramkivs/iips-review-recovered` | ancestor of `main` | `4906a6b71f5133d714f0f4c29c89dba22ded37f5`; PR #42 merge `47edf6f3db79c6c443caed148121406f33a158b7` | Ancestry verified (C11, C12). |
| G1 decision record | `ramkivs/iips-review-recovered` | `main` | blob `857d14513c3fc2c45f9015145fc7f36cd7ad6141` | Verified (C03). |
| G1 B2 admission | `ramkivs/iips-review-recovered` | `main` | blob `2803c1c219a91230750cb18f2c52a7d4ace314db` | Verified (C04). |
| G1 boundary record (predecessor) | `ramkivs/iips-review-recovered` | `main` | blob `5f341ac68f1307d77e9827bedb42ed5a136b2705` | Verified (C16). Unchanged. |

*Explanatory, AD-20 earlier note.* An earlier session note said that no promotion-authority act had been located. That note is superseded by the verified presence of act `2606185…` on `arena/01a0f839` (C13). AD-20 itself remains OPEN, and coverage of the G-2 consumer is not evaluated.

## 8. Historical records: required follow-on additive records (not made here)

No published record is edited by this candidate. Each item below needs a separate additive record under the applicable authority, with wording directed by the Program Authority. None is produced here.

| Ref | Record and location | Issue (quoted where stated) | Required follow-on |
|---|---|---|---|
| H-1 | G1 record, rows 8 and 9 | Row 8 reads "PARTIALLY CLOSED" and "Decisions are recorded on the session branch." Row 9 reads "Session-branch copy only. **Not yet authoritative.**" Both are stale: the file is on `main` (C03). | Additive G1 errata, PA-directed. |
| H-2 | G1 record, lines 144 and 146; B2 record, line 111 | G1: "IRR `main`: NOT PUBLISHED." and "Next execution gate (G1-PUB)". B2: "NOT PUBLISHED by the agent". All are stale: publication is verified (C03, C04). | Additive G1 and B2 status errata, PA-directed. |
| H-3 | B2 record, status row | "PREPARED — NOT IN FORCE" becomes stale when AD-02 is effective (§10). | Additive B2 status errata after effectiveness. |
| H-4 | D-3 §10 and §11 | Superseded for the ratified set by AD-01 (§4). | Additive D-3 errata, PA-directed. |
| H-5 | G1 record, decision 1 | "ACCEPTED / BRANCH-ONLY" no longer describes `main` for the 13 ratified paths. | Additive G1 errata, PA-directed. |
| H-6 | B2 record, §6 | "Scopes with an authoritative basis already on `main`: Reports under D-3 (qualified branch scope)". Inconsistent with the "ACCEPTED / BRANCH-ONLY" status in D-3 §10 and G1 decision 1. | Additive B2 errata, PA-directed. |
| H-7 | G-2 implementation record, lines 39 and 175 | "Evidence (all at the pinned tip `6828155e`)"; "G24 live suite at the pinned tip". The pin is `2e11fa3b…`. `6828155` is a reference (AD-03), not a pin. | Additive clarifying errata, PA-directed. |
| H-8 | UI-consumer readiness record, lines 12 and 82 | "G24 pinned upstream"; "the seam's pinned upstream". Same issue as H-7. | Additive clarifying errata, PA-directed. |
| H-9 | G1 record, line 55 | "The requester did not designate `6828155…` as an admitted commit." Historically accurate. | None required for accuracy. Any pointer to §3 of this record is PA-directed. |
| H-10 | G1 §6, B2 item 3 | Resolved for IRR non-production G-2 consumption only (AD-03). | Additive status note, PA-directed. |

## 9. G1 §6 "B2 — unresolved" items: disposition

Headings quoted from G1 §6, "B2 — unresolved":

| Item | Heading (quoted) | Disposition in this record |
|---|---|---|
| 1 | "No universal IPD provider authority." | Unchanged. Granted to no line. |
| 2 | "Two `src/persistence` implementations." | Unchanged. No reconciliation is authorized. |
| 3 | "G-2 baseline designation conflict." | Resolved for IRR non-production G-2 consumption only (AD-03). Unresolved for any other consumption. |
| 4 | "IPD baseline designation conflict across IRR records." | Unchanged. Not resolved by this record. |
| 5 | "Branch-tip dependency." | Unchanged. AD-06 OPEN. |
| 6 | "PIT and D114 surfaces have no recorded admission basis." | Admission basis recorded by AD-02 at the §2 scope, effective per §10. |
| 7 | "G24 candidate implementation is not admitted for merge into any protected baseline." | Unchanged. AD-03 is neither a merge nor an admission. |
| 8 | "NP04 governance record is candidate-only." | Unchanged. No decision in this record relies on that record. |
| 9 | "Reports acceptance is branch-only." | Presence on `main` ratified for the 13 paths in §4 (AD-01). Other Reports scope unchanged. |
| 10 | "Identity and tenant." | Unchanged. No identity, tenant or CompanyId mapping is created. AD-05 defers tenant membership. |
| 11 | "D-2 §13 Durability" is `PENDING` on IRR `main`. | Unchanged. Not in this candidate's scope. |
| 12 | "Tenant authority." | Unchanged. D115 tenancy remains unresolved. AD-05 defers tenant membership. |

## 10. Effectiveness, publication and gates

1. **Route.** The head under review is the session branch `arena/1dcbe88d-iips-review-recovered`. The session policy fixes that branch, so no separate publication branch is created. The divergence of the session branch from `main` is resolved by a non-destructive merge of `800789957…` into the session branch. The merged tree is identical to `main`'s tree (Annex A §A4). No history is rewritten, reset or force-pushed.
2. **Pull request.** The pull request is opened as a draft, from the session branch to `main`. It stays unmerged until the gates in 3 and 4 pass.
3. **Pre-merge gates.** (a) Program Authority review and approval of this candidate. (b) The default checks C01 to C22 pass, with C14 and C15 NOT-VERIFIED by design; and the route checks R01 to R04 pass on the pull-request head. (c) The candidate verifies against a fresh clone of `800789957…`. (d) `main` is unchanged from `800789957…`, or the checks are re-run against the new `main`.
4. **Merge.** Only on explicit approval, after gates 3(a) to 3(d).
5. **Post-merge gates.** (a) `origin/main` contains the five files at the blob identities in Annex A §A5. (b) The default checks pass against `origin/main`. (c) Only then do the decisions in §1 take effect, and AD-02 becomes effective.
6. **Publication.** PUBLICATION = PASS only after gates 5(a) and 5(b).

## 11. Blocked scopes

- All G2 implementation, including G2(a) and later gates.
- PIT and D114 use before §10 effectiveness, and any PIT or D114 use outside §2 (B2 §6; B2 §3.4).
- Any use of `6828155…` beyond the IRR non-production G-2 consumption reference in AD-03, including admission to IPD `main`, merge, promotion or re-pin.
- Reports UI or runtime admission, and any of the 10 excluded PR #42 paths (Annex A §A3).
- G3 tenant membership, and any reliance on tenant behaviour.
- Closure of AD-06 or AD-20; application of E-4 to E-7.
- Production, production data, live Dhan, live OIDC/Keycloak certification, production readiness.
- Runtime route-protection claims from source alone; runtime or full end-to-end acceptance claims.

## 12. Explicit prohibition

Nothing in this record authorizes an automatic pin change, merge, revert, promotion or implementation. Each of these requires a separate, explicit Program Authority decision and separate, verified execution.

## 13. Verification

- **Default checks**: `evidence/integration/g2-2-decision-gate/2026-10-09/verify_g2_2_checks.sh` (C01 to C22). Output: `g2_2_checks_output.txt`. Result at generation: 20 PASS, 0 FAIL, 2 NOT-VERIFIED (C14 and C15, by design).
- **Route checks**: `verify_g2_2_checks.sh --route` (R01 to R04), run against the pull-request head after the push. Results are recorded in the pull request and the completion report, not in this file.
- **Hashes**: `SHA256SUMS` covers this record, `EVIDENCE-ANNEX.md`, the checks output and the checks script. Annex A §A5 lists blob identities. The SHA-256 of `SHA256SUMS` is in the completion report.
- **Fresh clone**: the candidate is verified against a fresh clone of `800789957…` before any merge. The result is recorded in the pull request and the completion report.

## 14. Remaining ambiguities and open items

1. **Consumption mechanism for the AD-03 reference.** No approved decision says how IRR consumes a reference that is not the pin. The pin is `2e11fa3b…`, and a pin change is excluded. This record creates no mechanism.
2. **AD-01 scope.** The authority basis for the PR #42 merge, beyond ratification of the 13 paths, was not examined. The 10 excluded paths stay unratified. PR #42's change to an AD-02 consumer file is not reviewed.
3. **AD-02 content.** The five consumer files' current content is not reviewed against the pin. Export keys (C20) and symbol presence (C21) are checked, not runtime behaviour. The `NON_PRODUCTION_D114_*` constants named in B2 §3.2 are not checked. The comment at `ipdPitReadAdapter.ts:21` is unsupported (B2 §5 item 3) and is not relied on.
4. **AD-04.** The meaning of the label "category (iii)" cannot be recovered. The directed scope text is applied.
5. **AD-05.** The lost item list cannot be recovered. The directed subject is tenant membership.
6. **AD-06 and AD-20.** OPEN.
7. **E-4 to E-7.** Text not recovered. Unapplied.
8. **B2 items 2 and 4** (two `src/persistence` implementations; IPD baseline designation conflict). Unresolved.
9. **Lineage supporting scripts.** On the session branch, six lineage supporting scripts are mode 100755. On `main` they are mode 100644. The sync resolved them to `main`'s mode, so the pull request changes nothing in the published lineage package. This is disclosed here for the reviewer to confirm before any merge.

## 15. Final status block

```
G2-2_DECISION_STATUS=CANDIDATE-R2; DECISIONS RECORDED AS DIRECTED (AD-01 TO AD-05); AD-06 OPEN; AD-20 OPEN; E-4..E-7 UNAPPLIED; NOT APPROVED FOR MERGE; NOT PUBLISHED; NOT AUTHORITATIVE; PENDING PROGRAM AUTHORITY REVIEW
G2_IMPLEMENTATION_AUTHORITY=NONE
G2_BLOCKED_SCOPES=all G2 implementation incl. G2(a); pin changes (2e11fa3b…, 6828155ec6e8…); merges; reverts; promotion of 6828155… or the G24 line into IPD main; PIT/D114 use before §10 effectiveness or outside §2; Reports UI or runtime admission; G3 tenant membership; AD-06; AD-20; E-4..E-7 application; production; live Dhan; live OIDC/Keycloak; runtime or full E2E acceptance claims
NEXT_GATE=Program Authority review of the pull-request head; then explicit merge authorization only after the §10 pre-merge gates; then post-merge verification of origin/main; AD-02 effective only after that verification
```
