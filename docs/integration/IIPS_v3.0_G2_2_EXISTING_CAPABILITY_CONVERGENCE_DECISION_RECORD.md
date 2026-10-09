# IIPS v3.0 — G2-2 Existing Capability Convergence Decision Record (R2)

| Field | Value |
|---|---|
| Record type | Program Authority decision record, additive candidate R2. Records decisions, scoped admissions and scoped consumer designations. Grants no implementation authority. |
| Status | **CANDIDATE R2, REVISION 2 (PROGRAM AUTHORITY DIRECTIONS Q1 TO Q3 AND P1 TO P5; CORRECTIONS K1 TO K9) — NOT APPROVED FOR MERGE — NOT PUBLISHED — NOT AUTHORITATIVE — PENDING PROGRAM AUTHORITY APPROVAL** |
| Effectiveness | Each decision in this record takes effect only when this record is merged to `refs/heads/main` of `ramkivs/iips-review-recovered` and that merged state is independently verified there (§10). A decision whose scope states a different condition says so in §1. PA direction P5 confirms this rule for AD-01, AD-02, AD-03 and AD-04 (§1B, §10 item 7). |
| Base | `800789957f2a3cf4e28d5dfff49d92f29d6a7671` (IRR `main`) |
| Head under review | Session branch `arena/1dcbe88d-iips-review-recovered`. Identifiers of the head commits are in the pull request and the completion report, not in this file, because a file cannot contain its own commit identifier. |
| Supersedes | R1 and R2 revision 1. Neither was merged and neither is approved. Revision 1's wording is superseded only where §14A records a correction. The R1 transfer set is superseded and is not a route for R2. |
| Environment | Non-production. Production is out of scope. |

## 0. Provenance of wording

- **Operative decision scope** (AD-01 to AD-05, AD-06, AD-20, E-4 to E-7): previously recorded Program Authority decisions and scope boundaries, as relayed by the requester in the G2-2 recovery instruction of 2026-10-09. They are recorded here as relayed. The original Program Authority option text was lost and is not reproduced.
- **Program Authority directions Q1 to Q3 (2026-10-09)**: relayed by the requester and recorded as given in §1A. They change no decision except as Q3 states for AD-01.
- **Program Authority directions P1 to P5 (2026-10-09)**: relayed by the requester after the final read-only review of revision 1, and recorded as given in §1B. They add boundary statements and directed the corrections listed in §14A. They change no decision in §1 except through the boundary statements recorded in §1B.
- **Session-note labels**: option letters (A, B, C) and "category (iii)" come from the session notes. They are labels only and are not operative on their own.
- **Verbatim quotations**: copied from the named files on IRR `main` at base `800789957…`. Blob identities of the G1 record, the B2 record and the G1 boundary record are checked by C03, C04 and C16.
- **Explanatory text**: marked *Explanatory*. Written by the agent. Non-operative. It is not an approval and changes no decision.
- **Not recovered and not reconstructed**: the text of E-4 to E-7, and the original option wording of AD-01 to AD-05.

## 1. Decisions

| ID | Decision as recorded | Operative scope | Effectiveness | Not granted |
|---|---|---|---|---|
| AD-01 | Bounded Reports presence ratification (PA direction Q3) | Ratifies the presence on IRR `main` of exactly the 13 Reports paths listed in Annex A §A2 (merged to `main` through PR #42; blobs unchanged on `main`). Presence only. | §10 | Implementation, promotion, UI, runtime or end-to-end acceptance authority; any supersession of D-3 §11 for implementation or promotion authority; admission of the 10 other PR #42 paths in Annex A §A3; admission of the Reports or PIT dispatch wiring in `executive-transport.ts` or of its excluded dependencies (§1A, Q1); any pin admission; G3 membership; promotion. |
| AD-02 | PIT and D114 prepared admission, recorded at its exact scope | Non-production admission of the PIT and D114 surfaces, admitted symbols, admitted consumers, locus and data exactly as recorded in §2, at pin `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` only. | **Effective only after this record is durably published to `main` and independently verified there (§10). Until then PIT and D114 remain NOT ADMITTED.** | Any other pin; `0dab1221…`; `6828155…`; IPD `main` `4d3e1cd…`; any consumer, export, symbol, data set, locus or browser import beyond §2; any identity, tenancy or D115 use; production data; any network acquisition path; any runtime acceptance claim; runtime correctness, route protection or end-to-end behaviour (UNPROVEN, B2 §5 item 4); **the live `/api/pit/` dispatch in `executive-transport.ts` or its route wiring, including `pit-transport.ts` (PA direction P4, §1B)**. |
| AD-03 | Reference designation for IRR non-production G-2 consumption | Designates `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` as the reference for IRR non-production G-2 consumption only. Distinguished from the G1 record in §3. | §10 | Admission of the commit to IPD `main`; any IRR pin change; promotion authority; merge; implementation authority; any other consumption; production; runtime behaviour of any consumption (UNPROVEN); **the `/api/user-portfolios/` dispatch in `executive-transport.ts` or any of its dependencies — `admin-transport.ts`, `secured-executor.ts`, `frontend/src/core/auth/keycloakAdapter.ts`, `iips-platform/src/distributed/EnterpriseRuntime.ts` (PA direction P3, §1B)**. |
| AD-04 | Bounded non-production G-2 consumer designation, preserved | Preserves the bounded non-production G-2 consumer designation **only** (PA direction P2, §1B). The identification of the consumer is explanatory (§5). It does not ratify IRR commit `a0ab5a34…`, does not authorize G-2 implementation admission to IPD `main`, and does not establish that a promotion act covers that commit. | §10 | Implementation authority; production use; any conclusion on promotion coverage (AD-20 OPEN); runtime behaviour of the consumer (UNPROVEN); ratification of IRR commit `a0ab5a34…`; G-2 implementation admission to IPD `main`; any inference of authority from commit presence or from a commit subject line; **the `/api/user-portfolios/` dispatch or any of its dependencies (PA direction P3, §1B)**. |
| AD-05 | Tenant membership deferred; AUTHORITY REQUIRED retained | Tenant membership is deferred. Disposition C (AUTHORITY REQUIRED) is retained. No decision in this record relies on tenant behaviour. | §10 | No authentication, identity, multi-user or membership implementation authority. G3 membership admission; creation or activation of a Company Identity Authority; reliance on tenant behaviour (runtime tenant behaviour UNPROVEN); use of the field `companyId` as an identity source. |
| AD-06 | OPEN | Provenance of the IRR pin `2e11fa3b…`. No decision is made. | Not applicable | Closure. No outcome is inferred. |
| AD-20 | OPEN | Promotion coverage of the G-2 consumer on IRR `main`. No decision is made. | Not applicable | Closure. No outcome is inferred. The earlier note "no promotion act located" is not consistent with the verified presence of act `2606185…` (§7). The act's verified scope and exclusions are quoted at §1A, Q2 and §7. This record draws no conclusion from them about coverage of the G-2 consumer or of PR #42 (§14A, K1). Does not resolve the PR #42 title condition (§1A, Q2). |
| E-4 to E-7 | UNAPPLIED | Text lost; not reconstructed. | Not applicable | Application requires separate Program Authority direction and the exact text. |

## 1A. Program Authority directions Q1 to Q3 (2026-10-09)

*Provenance.* The requester relayed these directions from the Program Authority on 2026-10-09, in response to the final review of the previous candidate. They are recorded as given. They change no decision in §1 except as Q3 states for AD-01. Evidence references are to Annex A §A8 and §A9 and to checks C23 to C35 in `verify_g2_2_checks.sh`.

**Q1. Existing Reports and PIT wiring on IRR `main`. Direction: RETAIN THE EXISTING REPOSITORY STATE; NO NEW ADMISSION.**

- *Recorded fact (source-level; presence only).* On `main` at base `800789957…`, `frontend/server/executive-transport.ts` contains the `/api/reports/` dispatch (lines 778–793), the `/api/pit/` dispatch (condition at line 824; call at lines 827–828) and the server listen guard (lines 1024–1025). The Reports dispatch block is byte-identical to the PR #42 head and to the D-3 qualified commit `39dd43eb…` (C23). The block is absent at `0b961fe…`, the first parent of the PR #42 merge, and present at the merge (Annex A §A9).
- *Excluded dependencies, named and not admitted.* (i) The Reports executor is built by `createLiveAdminExecutor` (`admin-transport.ts`, line 298), which the ratified `reports-transport.ts` imports at line 181. `admin-transport.ts` is excluded by AD-01. (ii) That executor's tenant resolution constructs `FileTenantDirectory` (`admin-transport.ts`, lines 307–312), which is defined in `tenant-membership-store.ts` (line 88). That file is excluded by AD-01 and AD-05. (iii) The ratified `reports-transport.ts` has a value import of `TransportError` from `admin-transport.ts` (line 49), used at runtime, and a type-only import of `SecuredExecutor` from `secured-executor.ts` (line 50). (iv) `getPitReadPort()` (lines 689–700) imports `pit/ipdPitReadAdapter.ts`, which is excluded by AD-01 as a PR #42 path and is an AD-02 consumer, and `pit/nonProductionRuntimePitStore.ts`, which is an AD-02 consumer (lines 695–696). (v) The PIT dispatch calls `pit-transport.ts`. That file is not a PR #42 path and is not an AD-02 consumer. It was introduced by commit `acd1556d…` (2026-09-29). No decision in this record classifies it. (vi) The ratified `reports-transport.ts` has a **value** import of `AuthError` from `frontend/src/core/auth/keycloakAdapter.ts` (line 47), used at line 530, and a type-only import of `Principal` from `iips-platform/src/distributed/EnterpriseRuntime.ts` (line 48). The ratified `frontend/server/reports/persistence.ts` has a type-only import of `Principal` from the same `iips-platform` module (line 19). None of those targets is a PR #42 path; all are unclassified by this record, and no authentication or identity authority is granted. (vii) Two ratified files reach the pinned IPD package through a **computed** specifier rather than a static import: `frontend/server/reports/persistence-port.ts` line 289 (`['iips-production-market-data', 'persistence'].join('/')`) and `frontend/server/reports/reports-persistence.test.ts` line 795 (the same expression, under `/* @vite-ignore */`). These are pin-package edges inside ratified files, not PR #42 paths, and AD-01 ratifies presence only (C35; Annex A §A8).
- *Retention is not admission.* This record does not change the existing state. It grants no implementation, removal, disablement, revert or other remediation authority. It grants no authority to rely on the excluded tenant-membership or admin-executor dependencies. G1 decision 1 is unchanged: its scope remains governed Reports persistence through `./persistence`. Retention of the Reports dispatch does not extend that scope.
- *Not admitted.* Runtime behaviour, runtime correctness, route protection, security properties, UI behaviour and end-to-end acceptance of either dispatch are UNPROVEN. They remain UNPROVEN unless separate evidence establishes them. No runtime test was run for this record. The presence of the PIT dispatch is not a G2 use of PIT or D114, and this record authorizes none.
- *G-2 user-portfolio dispatch.* In revision 1 the `/api/user-portfolios/` dispatch block (condition at line 802; dynamic import of `./user-portfolio-transport` at line 805; handler call at line 811) was recorded only as "not addressed". PA direction P3 now disposes of it: it is **NOT ADMITTED** by AD-03 or AD-04, together with its verified dependency edges (§1B, P3; §6; Annex A §A8; C31). It is not removed, disabled, reverted or modified by this record. Its runtime behaviour is UNPROVEN.
- *Later action.* Any later removal, disablement or admission of these surfaces requires its own explicit Program Authority decision and separate, verified execution.

**Q2. PR #42 title condition. Direction: SATISFACTION NOT ESTABLISHED; MERGE RECORDED AS A LINEAGE FACT.**

- *Recorded facts.* PR #42 is titled "Promotion candidate: Governed Reports onto current main (DO NOT MERGE without promotion act)". Its state is MERGED, merged 2026-10-06T21:09:33Z, with merge commit `47edf6f3db79c6c443caed148121406f33a158b7` (C12, C24, C27). The published lineage package records the merge commits of PR #42 and other PRs as ancestors of IRR `main`, and records a "Title and state conflict, recorded as a lineage fact" (`CAPABILITY-LINEAGE-RECOVERY-INVESTIGATION.md`, note on PR titles).
- *Promotion-authority act.* An act is located: commit `2606185923f6cbd3f4df5c3af200f54d40ed4bbc`, file `evidence/np04/NP04-PROMOTION-AUTH-TARGET-DESIGNATION-AND-AUTHORITY-ACT.md`, on IPD branch `arena/01a0f839-iips-production-market-data` (C13). Its verified wording is quoted below. **No conclusion is drawn from it about coverage of PR #42.**
  - Header: act identifier `np04-promotion-auth-target-designation-2026-10-01-001`; authority "RAMKI (Program Authority)"; recorded at 2026-10-01; "Recording Agent: Arena (recording only — no promotion executed, no implementation change, no PR, no merge)"; repository `ramkivs/iips-production-market-data`; "Nature: AUTHORITY / DESIGNATION ACT (governance artifact only)".
  - §3 target: `NP04 PROMOTION TARGET = arena/01a0e6d9-iips-production-market-data`.
  - §4 promotion scope: `SOURCE = 6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4`; `TARGET = arena/01a0e6d9-iips-production-market-data`; "PROMOTION UNIT = the already-qualified and already-accepted NP04 Phase-A lineage `0dab1221…` → `8c99627…` → `d4fdb33…` → `6828155…`". "Authorized by this act (subject to a separate execution gate): promotion of exactly the above unit, by fast-forward, into the designated target branch."
  - §4 "Explicitly NOT authorized by this act", quoted in full: "`main → 0dab1221` (baseline promotion)"; "baseline promotion into `main` in any form"; "P01 / IU / PIT / D114 promotion into `main`"; "promotion into `main` of the NP04 lineage"; "any production functionality"; "Watchlists, Reports, Collaboration, Settings, Governed Screener persistence"; "unrelated persistence work"; "modification of any protected foundation"; "any implementation change, including any change to the accepted artifact"; "any change to the accepted tree `eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5`".
  - §5 table rows, quoted: "This act executes promotion | **NO**"; "Promotion execution requires | a **separate subsequent execution gate**"; "`main` | **NOT AUTHORIZED** by this act"; "Baseline promotion into `main` | **NOT AUTHORIZED** by this act"; "Merge, cherry-pick, rebase, copy | **NOT AUTHORIZED** — promotion is limited to fast-forward of the designated target ref"; "Implementation changes | **NONE authorized** under this act".
  - §6, quoted: this act does **NOT** authorize, among others, "opening a `main`-targeted PR" and "interpreting NP04 acceptance as `main`-integration authorization". It closes: "Any future main integration requires its own authority decision."
  - §9, quoted: "This act does not: execute or schedule promotion; … designate `main` as a target or create any `main`-related authority; …".
  - *Verified search (C29).* The act contains **no** occurrence of `IRR`, `iips-review`, `iips-review-recovered`, `pull request`, `PR #42`, `governed reports`, `G-2`, `G2 `, `user portfolio` or `companion`. Its only occurrence of the string `Reports` is the §4 exclusion line quoted above. Its other occurrences of `PR` refer to IPD pull requests #5 and #6 (§3 item 4 and §7).
  - *Conclusion drawn: none.* The act is an IPD-to-IPD branch designation act for the NP04 Phase-A lineage. Whether it covers, or does not cover, the IRR PR #42 merge is NOT ESTABLISHED by this record. Q2 remains NOT ESTABLISHED and AD-20 remains OPEN.
- *Consequence.* The condition is not claimed satisfied. It is not claimed violated by the absence of an act, because an act exists and this record draws no conclusion from its verified wording about coverage of PR #42 (K1). The merge is recorded as a historical fact and, under PA direction P1, as an unresolved authority conflict against D-1 (§1B, P1). AD-20 is not used to resolve it. No revert, remediation or retrospective promotion is authorized.

**Q3. Operative effect of AD-01. Direction: AD-01 IS A BOUNDED PRESENCE RATIFICATION ONLY.**

- AD-01 ratifies the presence on IRR `main` of exactly the 13 Reports paths in Annex A §A2. It grants no implementation, promotion, UI, runtime or end-to-end acceptance authority.
- *D-3 §10.* D-3 §10 states that "Current IRR main does NOT contain the Reports implementation". The verified presence of the 13 paths on `main` (C17, C28) and of the Q1 wiring (C23, C25) is inconsistent with that clause read as a statement of presence. This record reconciles the two by recording presence as fact. D-3 is not edited (§8, H-4).
- *D-3 §11.* AD-01 does not supersede the D-3 §11 statements "Implementation authority: NOT GRANTED", "Promotion authority: NOT GRANTED" and "Main admission: NOT GRANTED" for implementation or promotion authority.
- *G1 decision 1.* Preserved as recorded, with its bounded acceptance and scope and its status ACCEPTED / BRANCH-ONLY. Presence on `main` is not acceptance on `main`.
- *Other PR #42 paths.* The other ten paths (Annex A §A3) remain outside AD-01.
- *Dispatch wiring.* The Q1 wiring and its excluded dependencies are identified under Q1. AD-01 does not admit them.

## 1B. Program Authority directions P1 to P5 (2026-10-09)

*Provenance.* The requester relayed these directions from the Program Authority on 2026-10-09, after the final read-only review of revision 1. They are recorded as given. They add boundary statements and directed the corrections in §14A. They change no decision in §1 except through the boundary statements recorded here.

**P1. D-1 and PR #42.**

- D-1 remains unaffected by AD-01. D-1 is `docs/integration/PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md`, commit `80a4dc95a37a4945ffd07d6cc71a6b716c9e0847`, 2026-10-06T19:56:49Z, on IRR `main` (C33), record ID `D-1-PERSISTENCE-DOMAIN-OWNERSHIP-DECISION-01`, D-1 Option C, authority "Ramki — Program Authority / application owner", authoritative ref `refs/heads/main`.
- AD-01 does not supersede D-1's statements concerning main admission, promotion authority, or branch-scoped lineage. Quoted from D-1: §6 "PROMOTION ≠ MAIN ADMISSION" and "MAIN ADMISSION ≠ CONVERGENCE"; §11 "No promotion authority granted. Neither persistence lineage is promoted by this decision, to any ref."; §12 "No mainline admission created by this decision. The main refs of both repositories are unaffected in capability content; existing branch/main status remains unchanged."; §15 "This decision does NOT authorize: … promotion; main capability admission; merge of implementation branches; final convergence; …"; §2 standing "main admission explicitly prohibited by the recorded promotion-authority act"; §3 standing "no qualification, acceptance, or promotion act; no main admission".
- The PR #42 merge (`47edf6f3db79c6c443caed148121406f33a158b7`, merged 2026-10-06T21:09:33Z; C12, C24, C27) is recorded as a historical fact **and as an unresolved authority conflict against the prior decision**: D-1 is an ancestor of that merge (C33) and records no promotion or main-admission authority for either persistence lineage, while the merge placed the 13 Reports paths on `main`.
- AD-01 is not characterized as retrospective authorization for that merge.
- No revert, remediation or retrospective promotion is authorized (§1A, Q2; §6; §11).

**P2. G-2 presence on IPD `main`.**

- AD-04 preserves the previously selected non-production G-2 consumer designation **only**.
- AD-04 does not ratify commit `a0ab5a344d1ca2cb7c07a8fa6ae2090b2535852c`; does not authorize G-2 implementation admission to IPD `main`; and does not establish that a promotion act covers that commit.
- *Explanatory.* The commit identified in the session notes, `a0ab5a34…`, is an IRR commit and an ancestor of IRR `main` (C10); it is not an IPD commit. The direction is recorded as given, and this distinction is recorded as fact. No conclusion is drawn from it.
- *Conflict recorded as evidence (§8, H-15; Annex A §A10; C34).* Commit `a0ab5a34…`, subject "Promote G-2 non-production durable user portfolio to main (G-2-PROMO-2026-10-07)", author date 2026-10-07T11:18:26Z, added 14 paths, +3651/−0, including the `/api/user-portfolios/` dispatch block in `executive-transport.ts` (+31/−0) and the G-2 implementation record `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_IMPLEMENTATION_RECORD.md` (213 lines). That record states at §8 item 5: "Main admission of this implementation — NOT AUTHORIZED by this act (session branch only); G24 main admission remains PROHIBITED per D-1 standing." The same file, with the same blob `8486a5708c6a3f616718a6021afa13508a4227ef`, is present on `main`. The conflict is recorded as evidence.
- No authority is inferred from commit presence or from a commit subject line.
- AD-20 remains OPEN.

**P3. G-2 user-portfolio dispatch.**

- The `/api/user-portfolios/` dispatch and its dependencies are **NOT ADMITTED** by AD-03 or AD-04.
- The dispatch and its verified dependency edges are recorded explicitly in the not-granted boundary at §6, and in Annex A §A8 (C31).
- The verified dependencies include edges to `admin-transport.ts`, `secured-executor.ts`, `frontend/src/core/auth/keycloakAdapter.ts` and `iips-platform/src/distributed/EnterpriseRuntime.ts`.
- This direction grants no implementation authority and no runtime-remediation authority. The existing dispatch is not removed, disabled, reverted or modified (§11).

**P4. PIT route.**

- AD-02 does **NOT** admit the live `/api/pit/` dispatch or its route wiring.
- AD-02 remains bounded to its explicitly identified consumers, symbols, pin and non-production scope (§2). It is not extended by implication from import edges or from route presence.
- The distinction between the specifically admitted PIT/D114 surfaces (§2) and the unadmitted dispatch wiring (§1A, Q1) is preserved.
- The route is not modified or disabled by this record (§11).

**P5. Effectiveness.**

- AD-01, AD-02, AD-03 and AD-04 become authoritative through this record only after this record is merged to authoritative `main` and independently verified remotely (§10).
- Until then, this candidate remains non-authoritative.
- This effectiveness rule does not grant merge authorization. Merge requires a separate, explicit authorization after review (§10).

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
- *Effectiveness rule for AD-02 — attributed to the Program Authority direction, not to the B2 sentence.* AD-02 is effective only after this record is durably published on IRR `main`, independently verified there, and the decision is recorded (PA direction P5; §10). B2 §6 states, for the B2 record: "**PIT and D114: BLOCKED from G2** until this record is durably published on IRR `main`, verified there, and the Program Authority has recorded the decision. No G2 work touches PIT or D114 consumers before then." The words "this record" in that sentence denote **the B2 record**, not this G2-2 record. The two agree in effect for AD-02: PIT and D114 are not admitted for G2 until the §10 steps have occurred. The rule applied to AD-02 is the Program Authority direction recorded at P5 and §10; it is not inferred from the B2 sentence, and the B2 sentence is not restated as if it referred to this record (§14A, K6).
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
- No IRR runtime consumption of `6828155…` is established by this record. Any such consumption is UNPROVEN.
- AD-03 does not admit the commit to IPD `main` (verified: C19). It does not change the IRR pin, which is `2e11fa3b…`. It does not authorize promotion or merge.
- G1 §6, B2 item 3 asked which commit is the admitted reference for IRR consumption. That item is resolved for IRR non-production G-2 consumption only. It stays unresolved for any other consumption.
- *Existing consumption mechanism, recorded as fact and not approved (§14A, K7).* No approved decision **establishes** how IRR consumes a reference that is not the pin. An existing HTTP mechanism does exist in the code on `main`, and this record records it as a fact without approving, ratifying or modifying it (C30):
  - `frontend/server/user-portfolio-transport.ts` declares `export const G2_IPD_BASE_URL_ENV = 'G2_IPD_BASE_URL'` (line 80) and reads it in `createLiveUserPortfolioConfig()` with `process.env[G2_IPD_BASE_URL_ENV]` (line 157).
  - That function returns `null` when the value is absent, empty after trimming, unparsable as a URL, or not http(s) (function body at lines 156–167; `null` is returned at lines 158, 163 and 165). The file comment at lines 150–154 states it "NEVER substitutes a local, in-memory, or test-only implementation" and that callers receiving `null` "must fail closed (durable surfaces answer 503)".
  - The handler throws `TransportError(503, 'upstream-unavailable', …)` when the resolved configuration is `undefined` or `null` (lines 429–435). The `G2_IPD_BOUNDARY` descriptor (lines 92–115) names the same variable as `runtimeBaseUrlEnv` (line 109) and states that the durable surfaces "answer 503: no substitute store is ever created" (line 105).
  - The dispatch that reaches this handler is `/api/user-portfolios/` in `executive-transport.ts` (condition at line 802; dynamic import at line 805). It is NOT ADMITTED (§1B, P3).
  - The G-2 contract names the AD-03 reference: `frontend/server/user-portfolio/userPortfolioContract.ts` lines 92–94 record `repository: 'ramkivs/iips-production-market-data'`, `branch: 'refs/heads/arena/01a0e6d9-iips-production-market-data'`, `commit: '6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4'`.
- *UNPROVEN.* Which build, commit or process answers at a configured `G2_IPD_BASE_URL` is UNPROVEN. No HTTP request was made for this record and no deployment configuration was read. Naming a commit in a contract is not evidence that the answering service runs that commit. This record creates, approves and modifies no mechanism (§14 item 1).

## 4. AD-01: Reports ratification and reconciliation with historical records

Scope and evidence:

- Ratified set: the 13 paths in Annex A §A2. Each one's blob at the PR #42 merge `47edf6f3db79c6c443caed148121406f33a158b7` (an ancestor of IRR `main`, C12) is unchanged on `main` (C17).
- Excluded from this ratification: the 10 other PR #42 paths in Annex A §A3. C18 confirms that the 23 PR #42 changed paths partition exactly into the 13 ratified and 10 excluded paths.
- Two excluded paths, `frontend/server/admin-transport.ts` and `frontend/server/executive-transport.ts`, differ on `main` from their PR #42 merge blobs. The Reports dispatch block of `executive-transport.ts` is identical to the PR #42 head (C23). The other differences are not reviewed here. The live wiring and its excluded dependencies are identified under §1A, Q1.

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

- The verified presence of the 13 paths on `main` (C17; each blob equals the PR #42 merge and the D-3 qualified commit, C28) and of the Q1 wiring (C23, C25) is inconsistent with the D-3 §10 clause quoted above, read as a statement of presence. This record records presence as fact. It does not edit D-3, and it does not treat D-3 §10 as correct on presence. D-3 may have been accurate when it was written.
- AD-01 is a bounded presence ratification only (Q3). It does not supersede the D-3 §11 statements "Implementation authority: NOT GRANTED", "Promotion authority: NOT GRANTED" or "Main admission: NOT GRANTED" for implementation or promotion authority. A corrective additive errata to D-3 is a follow-up (§8, H-4) and is not made here.
- G1 decision 1 is not altered. Its bounded scope and its "ACCEPTED / BRANCH-ONLY" status stand as recorded. Presence on `main` of the 13 paths is not acceptance on `main`. A clarifying G1 errata is optional and PA-directed (§8, H-5) and is not made here.
- G1 §6, B2 item 9 states: "Main publication of the Reports implementation is not recorded." The PR #42 merge is recorded in the published lineage package and verified (§1A, Q2), so that statement is inconsistent with the recorded merge. An additive G1 errata is a follow-up (§8, H-12) and is not made here.

Not resolved by this record:

- Satisfaction of the PR #42 title condition: NOT ESTABLISHED (§1A, Q2). It is not inferred from AD-20, and no authority basis for the PR #42 merge is recorded beyond the presence ratification in AD-01.
- The runtime behaviour, route protection, security properties and acceptance of the Q1 wiring: UNPROVEN.
- D-3 §11 "Final convergence: NOT ESTABLISHED" and "Production: excluded". They are not addressed. The §11 implementation and promotion statements stand (Q3). "Promotion executed: NO" is a follow-up (§8, H-11).
- The UI08 exclusion in D-3 §10. It is not addressed.
- The 10 excluded PR #42 paths (Annex A §A3).
- PR #42's change to `frontend/server/pit/ipdPitReadAdapter.ts` (+6/−4 against the first parent of the merge). Stated precisely: AD-01 **excludes** the file, because it is one of the 10 excluded PR #42 paths (Annex A §A3). The file, at its current content on `main`, is also an AD-02 consumer (§2: it imports `PitReadService` and the types `DataProvenanceDTO` and `PointInTimeStore` from `iips-production-market-data/pit`, lines 28–29). AD-02, once effective, admits that pin consumption at the §2 scope; **AD-02 does not ratify PR #42's change to the file**, and this record does not review the content of that change. Whether that change falls inside or outside the §2 scope is NOT ESTABLISHED (§14A, K2).
- The G1 status block (§8).

## 5. AD-04 and AD-05 (explanatory)

- **AD-04.** The label "category (iii)" is a session-note label. Its definition is not in any repository source examined. This record applies the directed scope text, "preserve the bounded non-production G-2 consumer designation". It does not decide whether the label means more or less than that text. The session notes identify the consumer as IRR commit `a0ab5a344d1ca2cb7c07a8fa6ae2090b2535852c`. C10 verifies only that this commit is an ancestor of IRR `main`. The identification is explanatory and is not operative text. Runtime behaviour of the consumer is UNPROVEN. PA direction P2 bounds AD-04 further (§1B, P2): it preserves the designation **only**; it does not ratify that commit, does not authorize G-2 implementation admission to IPD `main`, and does not establish that a promotion act covers that commit. No authority is inferred from the commit's presence on `main` or from its subject line. The conflict between the commit and the G-2 implementation record is recorded as evidence only (§8, H-15; Annex A §A10; C34). AD-20 remains OPEN.
- **AD-05.** The item list in the lost draft is not recovered. The directed scope names one subject, tenant membership. No other AD-05 item is identified in this record. No authentication, identity, multi-user or membership implementation authority is granted (§6).

## 6. Authority granted and not granted

Granted, effective per §1 and §10:

1. Recording of AD-01 to AD-05 at the scopes in §1 to §5.
2. AD-01: ratification of the presence on IRR `main` of the 13 paths in Annex A §A2, presence only (Q3), and nothing else.
3. AD-02: non-production admission of the PIT and D114 surfaces, consumers, symbols and data in §2, at pin `2e11fa3b…` only.
4. AD-03: designation of `6828155…` as the reference for IRR non-production G-2 consumption only.
5. AD-04: preservation of the bounded non-production G-2 consumer designation.

The directions in §1A and §1B grant nothing beyond items 2 to 5. Recording them is not a grant. The §1B directions P1 to P5 are boundary statements; they remove authority rather than add it, and P5 confirms that none of items 2 to 5 is in force before §10 is satisfied.

Not granted:

- Implementation authority of any kind. G2 implementation: NONE. G2(a): NONE.
- Any IRR pin change. The pin remains `2e11fa3b…`. No re-pin to `0dab1221…`, `6828155…` or IPD `main`.
- Any merge, revert or cherry-pick, including of candidate branches. The merge of this record's pull request requires separate approval (§10).
- Any promotion authority, and any promotion of `6828155…`, the G24 line or another IPD line into IPD `main`.
- Universal IPD provider authority for any IPD line. G1 §6, B2 item 1 remains unresolved by design.
- Production authority, production data, live Dhan, live OIDC/Keycloak certification, or production readiness.
- Runtime route-protection claims from source alone; runtime acceptance; full end-to-end acceptance.
- G3 tenant membership admission; creation or activation of a Company Identity Authority; reliance on tenant behaviour.
- UI or runtime admission of Reports, and any admission of the Reports or PIT dispatch wiring in `executive-transport.ts` (§1A, Q1).
- Reliance on the excluded tenant-membership store or admin-executor dependencies (§1A, Q1).
- Removal, disablement, revert or other remediation of the live wiring (§1A, Q1); any revert, remediation or retrospective promotion of PR #42 (§1A, Q2).
- Any statement that the PR #42 title condition is satisfied (§1A, Q2).
- Any implementation, promotion, UI, runtime or end-to-end acceptance authority under AD-01, and any supersession of D-3 §11 for implementation or promotion authority (§1A, Q3).
- Runtime correctness, route protection, security properties and end-to-end behaviour of any surface named in this record: UNPROVEN.
- No authentication, identity, multi-user or membership implementation authority.
- Admission of the `/api/user-portfolios/` dispatch, or of any of its dependencies: `admin-transport.ts`, `secured-executor.ts`, `frontend/src/core/auth/keycloakAdapter.ts`, `iips-platform/src/distributed/EnterpriseRuntime.ts` (PA direction P3, §1B; Annex A §A8; C31). Removal, disablement, revert or modification of that dispatch (§11).
- Admission of the live `/api/pit/` dispatch or of its route wiring, including `pit-transport.ts`, by AD-02 or by implication from import edges or route presence (PA direction P4, §1B). Removal, disablement or modification of that route (§11).
- Any supersession of D-1 (`docs/integration/PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md`) concerning main admission, promotion authority or branch-scoped lineage; any characterization of AD-01 as retrospective authorization for the PR #42 merge (PA direction P1, §1B).
- Ratification of IRR commit `a0ab5a34…`; G-2 implementation admission to IPD `main`; any conclusion that a promotion act covers that commit; any inference of authority from commit presence or from a commit subject line (PA direction P2, §1B).
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
| AD-04 consumer | `ramkivs/iips-review-recovered` | ancestor of `main` | `a0ab5a344d1ca2cb7c07a8fa6ae2090b2535852c` | Preserved designation only (C10). Commit not ratified; no authority inferred from its presence or subject line (§1B, P2; C34). AD-20 OPEN. |
| Acceptance reference | `ramkivs/iips-production-market-data` | `arena/01a0f839-…` | `12c480b5bf5cfbe0f296fcd12c9189328b915417` | Reference only (C08). |
| Promotion-authority act | `ramkivs/iips-production-market-data` | on `arena/01a0f839-…` | `2606185923f6cbd3f4df5c3af200f54d40ed4bbc` | Presence and wording verified (C13, C29). Scope and exclusions quoted verbatim at §1A, Q2. Coverage of the G-2 consumer and of PR #42: NOT ESTABLISHED; no conclusion is drawn (§1B, P2; §14A, K1). |
| D-1 persistence-domain ownership decision | `ramkivs/iips-review-recovered` | `main` | commit `80a4dc95a37a4945ffd07d6cc71a6b716c9e0847`; file `docs/integration/PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md` | Present on `main` and an ancestor of the PR #42 merge (C33). Unaffected and not superseded by AD-01 (§1B, P1). Conflict with the PR #42 merge recorded as unresolved. |
| PR #42 (Reports promotion candidate, merged to `main`) | `ramkivs/iips-review-recovered` | ancestor of `main` | PR head `4906a6b71f5133d714f0f4c29c89dba22ded37f5`; merge `47edf6f3db79c6c443caed148121406f33a158b7` (parents `0b961fecbe29ed643c86c1a223fc22ac6d30a115` and `4906a6b…`) | Ancestry verified (C11, C12); parents (C24); title and state in the published lineage raw snapshot (C27). Title condition NOT ESTABLISHED (§1A, Q2). |
| Live Reports and PIT dispatch wiring (Q1) | `ramkivs/iips-review-recovered` | `main` | `frontend/server/executive-transport.ts`, blob `1883120bac36d22c26fbc7c40c31c5072a189e84` | Presence verified (C23, C25). Retained and not admitted (§1A, Q1). |
| G1 decision record | `ramkivs/iips-review-recovered` | `main` | blob `857d14513c3fc2c45f9015145fc7f36cd7ad6141` | Verified (C03). |
| G1 B2 admission | `ramkivs/iips-review-recovered` | `main` | blob `2803c1c219a91230750cb18f2c52a7d4ace314db` | Verified (C04). |
| G1 boundary record (predecessor) | `ramkivs/iips-review-recovered` | `main` | blob `5f341ac68f1307d77e9827bedb42ed5a136b2705` | Verified (C16). Unchanged. |

*Explanatory, AD-20 earlier note.* An earlier session note said that no promotion-authority act had been located. That note is not consistent with the verified presence of act `2606185…` on `arena/01a0f839` (C13). The act's scope and exclusions are quoted verbatim at §1A, Q2 and are verified by C29; they are an IPD-to-IPD branch designation for the NP04 Phase-A lineage and name no IRR repository, pull request, Reports or G-2 subject. AD-20 remains OPEN. Presence of an act is not coverage, and no inference about AD-20 is drawn from its wording. The act does not resolve the PR #42 title condition (§1A, Q2).

## 8. Historical records: required follow-on additive records (not made here)

No published record is edited by this candidate. Each item below needs a separate additive record under the applicable authority, with wording directed by the Program Authority. None is produced here.

| Ref | Record and location | Issue (quoted where stated) | Required follow-on |
|---|---|---|---|
| H-1 | G1 record, rows 8 and 9 | Row 8 reads "PARTIALLY CLOSED" and "Decisions are recorded on the session branch." Row 9 reads "Session-branch copy only. **Not yet authoritative.**" Both are stale: the file is on `main` (C03). | Additive G1 errata, PA-directed. |
| H-2 | G1 record, lines 144 and 146; B2 record, line 111 | G1: "IRR `main`: NOT PUBLISHED." and "Next execution gate (G1-PUB)". B2: "NOT PUBLISHED by the agent". All are stale: publication is verified (C03, C04). | Additive G1 and B2 status errata, PA-directed. |
| H-3 | B2 record, status row | "PREPARED — NOT IN FORCE" becomes stale when AD-02 is effective (§10). | Additive B2 status errata after effectiveness. |
| H-4 | D-3 §10 | The clause "Current IRR main does NOT contain the Reports implementation" is inconsistent with the verified presence of the 13 paths and of the Q1 wiring (§4, Q3). The D-3 §11 implementation and promotion statements are not superseded by AD-01. | Additive D-3 errata, PA-directed. |
| H-5 | G1 record, decision 1 | Preserved as recorded (Q3). Presence of the 13 paths on `main` is not acceptance on `main`; the status line is not changed by AD-01. | Optional clarifying errata, PA-directed. |
| H-6 | B2 record, §6 | "Scopes with an authoritative basis already on `main`: Reports under D-3 (qualified branch scope)". Inconsistent with the "ACCEPTED / BRANCH-ONLY" status in D-3 §10 and G1 decision 1. | Additive B2 errata, PA-directed. |
| H-7 | G-2 implementation record, `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_IMPLEMENTATION_RECORD.md`, lines 39 and 175 | "Evidence (all at the pinned tip `6828155e`)"; "G24 live suite at the pinned tip". The pin is `2e11fa3b…`. `6828155` is a reference (AD-03), not a pin. | Additive clarifying errata, PA-directed. |
| H-8 | UI-consumer readiness record, `docs/integration/G2-UI-CONSUMER-IMPLEMENTATION-READINESS-2026-10-08.md`, lines 12 and 82 | "**G24 pinned upstream:** IPD `refs/heads/arena/01a0e6d9-iips-production-market-data@6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4`"; "G24 durable service (the seam's pinned upstream)". Same issue as H-7. | Additive clarifying errata, PA-directed. |
| H-9 | G1 record, line 55 | "The requester did not designate `6828155…` as an admitted commit." Historically accurate. | None required for accuracy. Any pointer to §3 of this record is PA-directed. |
| H-10 | G1 §6, B2 item 3 | Resolved for IRR non-production G-2 consumption only (AD-03). | Additive status note, PA-directed. |
| H-11 | D-3 §11 | "Promotion executed: NO" is not reconciled, in any published record, with the PR #42 merge to `main` (`47edf6f3db79c6c443caed148121406f33a158b7`; C12, C24, C27). | Additive D-3 clarifying errata, PA-directed. No revert or retrospective promotion is implied. |
| H-12 | G1 record, §6 item 9 | "Main publication of the Reports implementation is not recorded." The PR #42 merge is recorded in the published lineage package. | Additive G1 errata, PA-directed. |
| H-13 | PR #42 title condition (§1A, Q2) | Satisfaction is NOT ESTABLISHED. | None, unless the Program Authority directs a determination. Any determination would be a separate additive record. |
| H-14 | B2 record, `docs/integration/IIPS_v3.0_G1_B2_PIT_D114_CAPABILITY_ADMISSION_DECISION.md`, line 106 | "**Scopes whose G1 basis is still session-only:** the B1 host decision, the B2 Reports and G-2 capability admissions, and the B3 taxonomy decision. They become authoritative only with G1 publication." G1 is now published on `main` (C03, C04), so the row is stale as to the B2 Reports and G-2 capability admissions and to the B1 and B3 decisions. | Additive B2 status errata, PA-directed. |
| H-15 | G-2 implementation record, `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_IMPLEMENTATION_RECORD.md`, lines 10–14, 183–186 and 196–197, read against IRR commit `a0ab5a34…` | Lines 196–197: "Main admission of this implementation — NOT AUTHORIZED by this act (session branch only); G24 main admission remains PROHIBITED per D-1 standing." The same file is present on IRR `main` with blob `8486a5708c6a3f616718a6021afa13508a4227ef`, the blob introduced by that commit (C34), whose subject is "Promote G-2 non-production durable user portfolio to main (G-2-PROMO-2026-10-07)". Lines 10–14 record the G-2 implementation authorization; lines 183–186 record the diff against IRR `main` as "+31/−0". | Additive errata, PA-directed. Recorded as evidence only; no authority is inferred (§1B, P2). |
| H-16 | D-1, `docs/integration/PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md` | D-1 §2–§3, §11 and §15 record standing that no main admission, no promotion and no merge of implementation branches is authorized for either persistence lineage. The PR #42 merge (C12) placed the 13 Reports paths on `main` after D-1 (C33). AD-01 does not supersede D-1 (§1B, P1). No published record reconciles the two. | Additive D-1 or D-3 clarifying errata, PA-directed. No revert or retrospective promotion is implied. |
| H-17 | This record, §6 and §11 as they stood in revision 1 | The `/api/user-portfolios/` dispatch and its dependency edges were not named in the not-granted boundary; §1A, Q1 recorded them only as "not addressed". | Resolved additively in revision 2 by §1B, P3 and by the §6 entries. |

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
| 9 | "Reports acceptance is branch-only." | Presence on `main` ratified for the 13 paths (AD-01; presence only, Q3). Acceptance status unchanged. The Q1 wiring is recorded and not admitted. Other Reports scope unchanged. |
| 10 | "Identity and tenant." | Unchanged. No identity, tenant or CompanyId mapping is created. AD-05 defers tenant membership. |
| 11 | "D-2 §13 Durability" is `PENDING` on IRR `main`. | Unchanged. Not in this candidate's scope. |
| 12 | "Tenant authority." | Unchanged. D115 tenancy remains unresolved. AD-05 defers tenant membership. |

## 10. Effectiveness, publication and gates

1. **Route.** The head under review is the session branch `arena/1dcbe88d-iips-review-recovered`. The session policy fixes that branch, so no separate publication branch is created. The divergence of the session branch from `main` is resolved by a non-destructive merge of `800789957…` into the session branch. The merged tree is identical to `main`'s tree (Annex A §A4). No history is rewritten, reset or force-pushed.
2. **Pull request.** The pull request is opened as a draft, from the session branch to `main`. It stays unmerged until the gates in 3 and 4 pass.
3. **Pre-merge gates.** (a) Program Authority review and approval of this candidate. (b) The default checks C01 to C35 pass, with C14 and C15 NOT-VERIFIED by design; and the route checks R01 to R04 pass on the pull-request head. (c) The candidate verifies against a fresh clone of `800789957…`. (d) `main` is unchanged from `800789957…`, or the checks are re-run against the new `main`.
4. **Merge.** Only on explicit approval, after gates 3(a) to 3(d).
5. **Post-merge gates.** (a) `origin/main` contains the five files. The record, checks output and checks script are at the identities in Annex A §A5. The annex and `SHA256SUMS` cannot record their own identities, so theirs are recorded in the completion report. (b) The default checks pass against `origin/main`. (c) Only then do the decisions in §1 take effect, and AD-02 becomes effective.
6. **Publication.** PUBLICATION = PASS only after gates 5(a) and 5(b).
7. **Effectiveness rule confirmed (PA direction P5).** AD-01, AD-02, AD-03 and AD-04 each become authoritative through this record only after gate 4 has occurred and the post-merge gates 5(a) and 5(b) pass. Before that, this candidate is non-authoritative and no decision in §1 is in force. This rule is not a merge authorization: gate 4 requires a separate, explicit authorization given after review.

## 11. Blocked scopes

- All G2 implementation, including G2(a) and later gates.
- PIT and D114: "No G2 work touches PIT or D114 consumers before then" (B2 §6), that is, before this record is durably published on `main`, verified there, and recorded by the Program Authority (§10). Any PIT or D114 use outside §2 (B2 §3.4). The existing PIT dispatch is retained under Q1 and is not a G2 use authorized by this record.
- Any use of `6828155…` beyond the IRR non-production G-2 consumption reference in AD-03, including admission to IPD `main`, merge, promotion or re-pin.
- Reports UI or runtime admission, and any of the 10 excluded PR #42 paths (Annex A §A3).
- Reliance on the Q1 Reports or PIT dispatch wiring, or on its excluded dependencies; removal, disablement, revert or remediation of that wiring without separate authority (§1A, Q1).
- Any claim that the PR #42 title condition is satisfied; any revert or retrospective promotion of PR #42 (§1A, Q2).
- Admission of the `/api/user-portfolios/` dispatch or of any of its dependencies — `admin-transport.ts`, `secured-executor.ts`, `frontend/src/core/auth/keycloakAdapter.ts`, `iips-platform/src/distributed/EnterpriseRuntime.ts`; any approval, acceptance, security or runtime claim for that dispatch; and any removal, disablement, revert or modification of it (PA direction P3, §1B).
- Admission by AD-02, or by implication from import edges or route presence, of the live `/api/pit/` dispatch or its route wiring; and any removal, disablement or modification of that route (PA direction P4, §1B).
- Any supersession of D-1 concerning main admission, promotion authority or branch-scoped lineage; any characterization of AD-01 as retrospective authorization for the PR #42 merge (PA direction P1, §1B).
- Ratification of IRR commit `a0ab5a34…`; G-2 implementation admission to IPD `main`; any conclusion that a promotion act covers that commit; any inference of authority from commit presence or from a commit subject line (PA direction P2, §1B).
- G3 tenant membership, and any reliance on tenant behaviour.
- Closure of AD-06 or AD-20; application of E-4 to E-7.
- Production, production data, live Dhan, live OIDC/Keycloak certification, production readiness.
- Runtime route-protection claims from source alone; runtime or full end-to-end acceptance claims.

## 12. Explicit prohibition

Nothing in this record authorizes an automatic pin change, merge, revert, promotion or implementation. Each of these requires a separate, explicit Program Authority decision and separate, verified execution.

## 13. Verification

- **Default checks**: `evidence/integration/g2-2-decision-gate/2026-10-09/verify_g2_2_checks.sh` (C01 to C35). Output: `g2_2_checks_output.txt`. Result at generation: 33 PASS, 0 FAIL, 2 NOT-VERIFIED (C14 and C15, by design). C23 to C28 were added in revision 1; C29 to C35 were added in revision 2 and verify the facts newly recorded in §1B and §14A (Annex A §A6).
- **Route checks**: `verify_g2_2_checks.sh --route` (R01 to R04), run against the pull-request head after the push. Results are recorded in the pull request and the completion report, not in this file.
- **Hashes**: `SHA256SUMS` covers this record, `EVIDENCE-ANNEX.md`, the checks output and the checks script. Annex A §A5 lists the blob identities and SHA-256 values of this record, the checks output and the checks script. The identities of the annex and of `SHA256SUMS` are in the completion report.
- **Fresh clone**: the candidate is verified against a fresh clone of `800789957…` before any merge. The result is recorded in the pull request and the completion report.

## 14. Remaining ambiguities and open items

1. **Consumption mechanism for the AD-03 reference.** No approved decision *establishes* how IRR consumes a reference that is not the pin. An existing HTTP mechanism exists in the code and is recorded as fact, not approved, at §3: the server-owned environment variable `G2_IPD_BASE_URL`, read by `createLiveUserPortfolioConfig()` in `frontend/server/user-portfolio-transport.ts` (lines 80 and 157), with a 503 fail-closed path on the durable surfaces when it is unset or unusable (lines 156–167 and 429–435). Which build answers at a configured URL is UNPROVEN. The pin remains `2e11fa3b…`, and a pin change is excluded. This record creates, approves and modifies no mechanism (§14A, K7).
2. **AD-01 scope.** Presence only (Q3). The authority basis for the PR #42 merge and the satisfaction of its title condition are NOT ESTABLISHED (Q2). The 10 excluded paths stay unratified. PR #42's change to the AD-02 consumer `ipdPitReadAdapter.ts` (+6/−4 against the first parent of the merge) is **not** governed by AD-02: AD-01 excludes the file, AD-02 admits only the pin consumption recorded in §2 once effective, AD-02 does not ratify the change, and this record does not review its content. Whether the change falls inside or outside the §2 scope is NOT ESTABLISHED (§4). The PR #42 merge is additionally recorded as an unresolved authority conflict against D-1 (§1B, P1).
3. **AD-02 content.** The five consumer files' current content is not reviewed against the pin. Export keys (C20) and symbol presence (C21) are checked, not runtime behaviour. The `NON_PRODUCTION_D114_*` constants named in B2 §3.2 are not checked. The comment at `ipdPitReadAdapter.ts:21` is unsupported (B2 §5 item 3) and is not relied on.
4. **AD-04.** The meaning of the label "category (iii)" cannot be recovered. The directed scope text is applied.
5. **AD-05.** The lost item list cannot be recovered. The directed subject is tenant membership.
6. **AD-06 and AD-20.** OPEN.
7. **E-4 to E-7.** Text not recovered. Unapplied.
8. **B2 items 2 and 4** (two `src/persistence` implementations; IPD baseline designation conflict). Unresolved.
9. **Lineage supporting scripts.** Before the sync, six lineage supporting scripts were mode 100755 on the session branch and mode 100644 on `main` (Annex A §A4). The sync resolved them to `main`'s mode. The pull request changes nothing in the published lineage package. This is disclosed here for the reviewer to confirm before any merge.
10. **Q1 runtime and security properties.** Runtime behaviour, runtime correctness, route protection, security properties, UI behaviour and end-to-end acceptance of the Reports and PIT dispatch wiring are UNPROVEN. No runtime test was run for this record.
11. **Import edges of the ratified set.** The ratified `reports-transport.ts` imports excluded or unclassified modules: `admin-transport.ts` (value import of `TransportError` at line 49; dynamic import of `createLiveAdminExecutor` at line 181), `secured-executor.ts` (type-only import of `SecuredExecutor` at line 50), `frontend/src/core/auth/keycloakAdapter.ts` (**value** import of `AuthError` at line 47, used at line 530) and `iips-platform/src/distributed/EnterpriseRuntime.ts` (type-only import of `Principal` at line 48). The ratified `reports/persistence.ts` has a type-only import of `Principal` from the same `iips-platform` module (line 19). **Four** ratified test files have import edges to excluded or unclassified modules (C32): `frontend/server/reports-api.test.ts` (lines 21, 25, 26, 27), `frontend/server/reports-transport.test.ts` (lines 21, 29, 30, 302), `frontend/server/reports/reports-artifact.test.ts` (line 10) and `frontend/server/reports/reports-persistence.test.ts` (lines 29, 30, and the computed pin specifier at line 795). The fifth ratified test file, `frontend/server/reports/reports-canonical.test.ts`, has none. Two ratified files reach the pinned package through a computed specifier rather than a static import: `reports/persistence-port.ts` line 289 and `reports/reports-persistence.test.ts` line 795 (C35). AD-01 ratifies the presence of these files, not those edges, and no reliance on them is authorized. This record grants no authentication authority.
12. **Unclassified PIT transport.** `pit-transport.ts`, the dispatch target of the PIT route, is not a PR #42 path and is not an AD-02 consumer. It was introduced by commit `acd1556d…` (2026-09-29). Its provenance beyond that commit is not examined (Annex A §A8).
13. **D-1 and the PR #42 merge (PA direction P1).** D-1 is unaffected by AD-01 and is not superseded. The PR #42 merge is recorded as an unresolved authority conflict against D-1 (§1B, P1; C33; §8, H-16). No determination, revert, remediation or retrospective promotion is made or authorized. AD-01 is not retrospective authorization.
14. **G-2 consumer commit `a0ab5a34…` (PA direction P2).** AD-04 preserves the designation only. The commit's presence on `main` and its subject line are recorded as evidence, not as authority. The conflict with the G-2 implementation record §8 item 5 is recorded (§8, H-15; C34). AD-20 is OPEN.
15. **G-2 user-portfolio dispatch and PIT route (PA directions P3 and P4).** Neither the `/api/user-portfolios/` dispatch nor the `/api/pit/` dispatch is admitted. Both are retained; neither is removed, disabled, reverted or modified by this record. The runtime behaviour, route protection, security properties and end-to-end acceptance of both are UNPROVEN. No runtime test was run for this record.

## 14A. Corrections applied in revision 2 (K1 to K9)

Revision 1 was reviewed read-only and returned as BLOCKED — RECORD CORRECTION REQUIRED. The nine corrections directed by that review are applied here. Each is a correction of this candidate's own wording or inventory. No published record is edited, no lost text is reconstructed, and no new authority decision is made.

| Ref | Location corrected | Defect in revision 1 | Correction applied in revision 2 | Evidence |
|---|---|---|---|---|
| K1 | §1 AD-20 row; §1A Q2 "Promotion-authority act"; §7 table row and explanatory note; Annex A §A9 | "Coverage of PR #42 has not been evaluated" and "coverage NOT evaluated" were incomplete: revision 1 did not state the act's verified scope and exclusions, leaving the reader to infer that nothing was known about the act. | The act's verified wording is quoted verbatim at §1A, Q2: identifier `np04-promotion-auth-target-designation-2026-10-01-001`, authority RAMKI, §3 target, §4 `SOURCE`/`TARGET`/promotion unit, the complete §4 "Explicitly NOT authorized by this act" list, the §5 rows ("This act executes promotion \| **NO**", "`main` \| **NOT AUTHORIZED**", "Merge, cherry-pick, rebase, copy \| **NOT AUTHORIZED**"), and §6 ("opening a `main`-targeted PR", "interpreting NP04 acceptance as `main`-integration authorization", "Any future main integration requires its own authority decision."). The verified search result is stated: no occurrence of `IRR`, `iips-review`, `pull request`, `PR #42`, `governed reports`, `G-2`, `G2 `, `user portfolio` or `companion`; the only `Reports` occurrence is the §4 exclusion line. Conclusion drawn: none. Q2 stays NOT ESTABLISHED and AD-20 stays OPEN. | C13; C29; the act file read from IPD commit `2606185…` |
| K2 | §4 "Not resolved by this record"; §14 item 2 | "PR #42's change to `frontend/server/pit/ipdPitReadAdapter.ts` … is governed by AD-02's scope" was unsupported: AD-02 is not effective until §10, and AD-02 admits pin consumption, not a diff. | Replaced with the bounded distinction: AD-01 **excludes** the file (excluded PR #42 path, Annex A §A3); the file is an AD-02 consumer at its current content (§2, lines 28–29); AD-02, once effective, admits that pin consumption at the §2 scope; **AD-02 does not ratify PR #42's change**; the change (+6/−4) is not reviewed; whether it falls inside or outside the §2 scope is NOT ESTABLISHED. | Annex A §A3; `git diff 47edf6f3^1 47edf6f3 -- frontend/server/pit/ipdPitReadAdapter.ts` |
| K3 | §1A Q1 "Excluded dependencies" | The dependency inventory omitted the value import of `AuthError` from `frontend/src/core/auth/keycloakAdapter.ts` and the type imports of `Principal` from `iips-platform/src/distributed/EnterpriseRuntime.ts`, although both appeared in Annex A §A8. | Added as items (vi) and (vii): `reports-transport.ts` line 47 (value import, used at line 530) and line 48 (type-only); `reports/persistence.ts` line 19 (type-only). Also added the computed pin specifier edges at `reports/persistence-port.ts` line 289 and `reports/reports-persistence.test.ts` line 795. | Annex A §A8; C35; files read at base |
| K4 | §14 item 11 | "two ratified test files import excluded or unclassified modules" understated the count. | Corrected to **four**, with the verified paths and line numbers: `reports-api.test.ts` (21, 25, 26, 27), `reports-transport.test.ts` (21, 29, 30, 302), `reports/reports-artifact.test.ts` (10), `reports/reports-persistence.test.ts` (29, 30, 795). Recorded that `reports/reports-canonical.test.ts` has none. | C32 |
| K5 | Annex A §A8 | The import-edge inventory omitted the computed Reports persistence specifier, the G-2 dispatch's import edges, and four test-file import lines. | Annex A §A8 now lists: the two computed `['iips-production-market-data', 'persistence'].join('/')` edges; the G-2 dispatch row with its condition, dynamic import and handler call; the G-2 dependency edges (`user-portfolio-transport.ts` lines 51–54 and 142); and the omitted test imports (`reports-api.test.ts` 25–27, `reports-transport.test.ts` 29–30, `reports/reports-persistence.test.ts` 29–30, `reports/reports-artifact.test.ts` 10). | Annex A §A8; C31, C32, C35 |
| K6 | §2, last explanatory bullet | B2 §6 was quoted as if "this record" denoted this G2-2 record. In B2 it denotes the B2 record. | The rule is now attributed to the Program Authority direction (P5, §10) and the B2 sentence is quoted with its referent stated: "The words 'this record' in that sentence denote **the B2 record**, not this G2-2 record." Both are stated to agree in effect for AD-02. | B2 record line 104, blob `2803c1c2…` (C04) |
| K7 | §3 last bullet; §14 item 1 | "No approved decision says how a reference that is not the pin is consumed by IRR" stated absence of a mechanism and did not record the mechanism that exists in the code. | §3 now records the existing HTTP mechanism as fact, not approval: `G2_IPD_BASE_URL` declared at `user-portfolio-transport.ts` line 80, read at line 157, `null` on unset/empty/invalid (156–167; null at 158, 163, 165), `TransportError(503, 'upstream-unavailable', …)` at 429–435, fail-closed comments at 150–154 and in `G2_IPD_BOUNDARY` (92–115); `G2_LINEAGE.commit = '6828155…'` at `userPortfolioContract.ts` lines 92–94. The identity of the answering build is recorded as UNPROVEN. This record creates, approves and modifies no mechanism. | C30; files read at base |
| K8 | §8 follow-up table | The table lacked four identified follow-ups, and H-7 and H-8 named line numbers without the full source path. | Added H-14 (B2 line 106 stale after G1 publication), H-15 (G-2 implementation record lines 10–14, 183–186, 196–197 against commit `a0ab5a34…`), H-16 (D-1 §2–§3/§11/§15 standing against AD-01 and the PR #42 merge) and H-17 (the §6/§11 gap this revision closes). H-7 now names `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_IMPLEMENTATION_RECORD.md`; H-8 now names `docs/integration/G2-UI-CONSUMER-IMPLEMENTATION-READINESS-2026-10-08.md`. | B2 line 106; G-2 implementation record; D-1; C33, C34 |
| K9 | §15 final status block | `G2-2_DECISION_STATUS` and `NEXT_GATE` described revision 1 as final and ready. | The block now names REV2, records the P1–P5 directions and the applied corrections, adds the P3 and P4 and D-1 and `a0ab5a34…` entries to `G2_BLOCKED_SCOPES`, and states `NEXT_GATE` as review of the revision-2 head followed by separate explicit merge authorization. | This section |

Not done, and not reconstructed: the text of E-4 to E-7; the original option wording of AD-01 to AD-05; the definition of the AD-04 label "category (iii)"; the AD-05 item list.

## 15. Final status block

```
G2-2_DECISION_STATUS=CANDIDATE-R2-REV2; DECISIONS RECORDED AS DIRECTED (AD-01 TO AD-05; AD-01 PRESENCE ONLY); PA DIRECTIONS Q1 RETAINED-NO-ADMISSION, Q2 SATISFACTION-NOT-ESTABLISHED, Q3 AD-01-BOUNDED-PRESENCE; PA DIRECTIONS P1 D-1-UNAFFECTED-WITH-PR42-CONFLICT-UNRESOLVED, P2 AD-04-DESIGNATION-ONLY-NO-COMMIT-RATIFICATION, P3 G-2-USER-PORTFOLIO-DISPATCH-NOT-ADMITTED, P4 PIT-ROUTE-NOT-ADMITTED, P5 EFFECTIVE-ONLY-AFTER-MERGE-AND-REMOTE-VERIFICATION; CORRECTIONS K1..K9 APPLIED (§14A); AD-06 OPEN; AD-20 OPEN; E-4..E-7 UNAPPLIED; NOT APPROVED FOR MERGE; NOT PUBLISHED; NOT AUTHORITATIVE; PENDING PROGRAM AUTHORITY APPROVAL
G2_IMPLEMENTATION_AUTHORITY=NONE
G2_BLOCKED_SCOPES=all G2 implementation incl. G2(a); pin changes (2e11fa3b…, 6828155ec6e8…); merges; reverts; promotion of 6828155… or the G24 line into IPD main; PIT/D114 use before §10 effectiveness or outside §2; admission of the /api/pit/ dispatch or its route wiring; admission of the /api/user-portfolios/ dispatch or its dependencies (admin-transport, secured-executor, keycloakAdapter, iips-platform); removal, disablement, revert or modification of the G-2 or PIT dispatch; Reports UI or runtime admission; G3 tenant membership; supersession of D-1 on main admission, promotion authority or branch-scoped lineage; characterization of AD-01 as retrospective authorization for PR #42; ratification of IRR commit a0ab5a34… or G-2 implementation admission to IPD main; inference of authority from commit presence or subject line; AD-06; AD-20; E-4..E-7 application; production; live Dhan; live OIDC/Keycloak; runtime or full E2E acceptance claims; removal, disablement, revert or remediation of the Q1 wiring; reliance on its excluded dependencies; revert or retrospective promotion of PR #42; any claim that the PR #42 title condition is satisfied
NEXT_GATE=Program Authority review of the revision-2 pull-request head; then separate explicit merge authorization only after the §10 pre-merge gates; then post-merge verification of origin/main; AD-01, AD-02, AD-03 and AD-04 effective only after that verification
```
