# IIPS v3.0 — Gate B Reports Owner-Binding Investigation

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-REG11-GATE-B-OWNER-BINDING-INVESTIGATION-2026-10-13-01` |
| Record type | Bounded, additive evidence and status reconciliation. **Not** a Program Authority (PA) decision, identity/translation contract, qualification, implementation authorization, product admission, or promotion act. |
| Date | 2026-10-13 (UTC) |
| Scope | One-pass, read-only Gate B investigation of the accepted non-production F-3 owner pair, Reports `(tenantId, userId)`, D-1 / PR #42 / IPD act scope, Reports qualification, runtime configuration, UI, and existing authority/publication claims. |
| IRR comparison baseline | `ramkivs/iips-review-recovered` `refs/heads/main` at `39d03d6c293076dbac2fb4173c9482849e0c234b`, tree `3ae236e180f7cf0bfe2f970217ffe991d85f6b56` (PR #78 / AD-20 publication). |
| IPD comparison baseline | `ramkivs/iips-production-market-data` `refs/heads/main` at `4d3e1cdca3a33da0ec3be8b336b17128108a502c`. |
| Gate result | **BOUNDED INVESTIGATION COMPLETE; GATE B REMAINS BLOCKED / REPORTS DEFERRED.** No deterministic F-3-to-Reports identity binding is proven. Direct field aliasing conflicts with the governing value semantics. |
| Change boundary | Documentation-only publication. No application/test code, schema, package, dependency, pin, persistence, route, UI, data, or IPD change is authorized or made by this record. |
| Publication | See the canonical tracker §8.8 and its linked GitHub PR metadata. The PR/merge/tree coordinates are self-referential to the publication that contains this record. |

> **Bottom line.** The NP-04 artifact/report persistence domain is the technically compatible store for Reports, and the current IRR package physically pins the NP-04 commit. That establishes a persistence-domain fit only. It does **not** establish a translation from F-3 `OwnerContext { tenantId, ownerUserId }` to Reports/NP-04 `AuthenticatedOwner { tenantId, userId }`, does not grant use of that pin for Reports, and does not satisfy Reports’ F-4/F-7 scope. Keep every known Reports operation fail-closed at `503 owner-context-unavailable` until separately governed binding, qualification, and admission gates are met.

## 1. Findings and classifications

The classifications below apply to the exact refs and evidence cited in this record; they do not imply authority beyond that scope.

| Question | Finding | Classification |
|---|---|---|
| What is the accepted F-3 pair? | The effective F-3 mechanism and its implementation use `ownerUserId = owner-7f3a91c2` and `tenantId = irr-domain-4b82d6e1`. These are server-owned, fixed, opaque partition/equality values—not a principal, authentication credential, membership, or universal identity. | **PROVEN / DECIDED** for the F-3 baseline and its authorized NP-09/10/11 use. |
| Can those values be copied directly into Reports `userId` and `tenantId`? | No. The F-3 act excludes equivalence to a Reports `userId` or tenant identifier; D-2 requires a separately governed translation contract. The matching field name `tenantId` is not evidence of matching authority or semantics. | Direct aliasing is **CONFLICTING** with the explicit exclusions. A different governed mapping is **UNPROVEN / NOT CREATED**. |
| Does D-1 select the Reports persistence domain? | Yes. D-1 designates the Artifact/Report Domain and the NP-04 `./persistence` lineage. The IRR package currently names commit `2e11fa3b…`, the same artifact/report lineage. | Domain designation and technical lineage fit are **DECIDED / PROVEN**. Reports consumer admission and package-edge authority are separate and **NOT ESTABLISHED**. |
| Does D-1 authorize PR #42 or its merge to IRR `main`? | No such authority is recorded in D-1. D-1 is explicitly non-executable and withholds promotion, main admission, package/API reconciliation, and implementation authority. PR #42 says a separate promotion act is required, but it merged. | Historical merge and prior constraint are **PROVEN**; the authority status is **CONFLICTING / UNRESOLVED (P1)**. No retrospective authorization or remediation is inferred. |
| Does IPD act `2606185923f6cbd3f4df5c3af200f54d40ed4bbc` cover PR #42? | No. Its stated source/target are IPD refs; it explicitly excludes Reports and promotion to `main`, and it does not authorize an IRR PR. It calls source `6828155…` an NP-04 Phase-A lineage even though D-1/AD-20 classify that ref as the G24 portfolio/tenancy lineage. | Its exclusions and source/target are **PROVEN**; its nomenclature versus the D-1/AD-20 lineage classification is **CONFLICTING**. Coverage by any *other* act remains **NOT ESTABLISHED**. |
| Is AD-01 an operative Reports-presence ratification? | The merged G2-2 file claims AD-01 but still labels itself a candidate, unapproved, unpublished, and non-authoritative; its own effectiveness rule requires independent verification. PR #53’s post-merge run records a C01 failure due to baseline drift and no passing post-merge closure was found. | Physical merge/presence of that candidate is **PROVEN**; operative AD-01 effect is **NOT ESTABLISHED**. The canonical tracker’s prior “13 files ratified” wording was too strong and is corrected additively here. |
| Is Reports deferred under the current F-3 baseline? | The effective PR #68 F-3 mechanism/implementation-authority record expressly keeps Reports and Portfolios deferred and unconditionally unavailable. Its F-7 bar is per capability. | **DECIDED / DEFERRED** for Reports under the current F-3 scope. |
| Does existing Reports qualification prove an F-3 owner binding? | No. It qualifies a different, authenticated-principal implementation at a branch-only scope. The no-auth F-3-to-Reports positive path is absent. Its process-restart claim and D-3’s conditional/unproven treatment also differ. | No F-3 Reports qualification is **PROVEN**; existing evidence is **SCOPE-LIMITED**, with a **CONFLICTING** restart-status claim. |
| Are Reports routes enabled now? | Current IRR source validates known path/method pairs and then returns `503 owner-context-unavailable` before invoking Reports domain or persistence code. No live request was made in this investigation. | Source-level fail-closed behavior is **PROVEN**; current deployment behavior/configuration is **UNPROVEN**. |
| Is there a Reports UI or no-auth UI port at current main or the accepted D-3 branch tip? | No Reports UI component was found in either complete tree, and PR #42’s 23-path manifest contains no frontend Reports UI path. D-3 separately excludes UI08 Reports. | Absence at those exact refs is **PROVEN**; UI/no-auth port admission is **DEFERRED / NOT ESTABLISHED**. |

## 2. INVESTIGATE — evidence set and method

### 2.1 Refs and durable artifacts examined

- IRR `main@39d03d6c293076dbac2fb4173c9482849e0c234b` (tree `3ae236e180f7cf0bfe2f970217ffe991d85f6b56`), the baseline containing the published AD-20 record (PR #78). The initial local worktree was clean and shallow; historical PR #42 objects were therefore verified through GitHub rather than inferred from the local object database.
- IRR accepted Reports branch `arena/01a0f1b3-iips-review-recovered@6a8afbb2bb73ca02d2b22e6f45e9f7d27a4a4b9b`, tree `0e25371229eff5cb8ae4e6bdc2615260ddf0629c`. GitHub’s recursive tree response was complete (`truncated: false`, 1,265 entries).
- IRR PR #42: base `0b961fec…`, head `4906a6b71f5133d714f0f4c29c89dba22ded37f5`, merge `47edf6f3db79c6c443caed148121406f33a158b7`, merged `2026-10-06T21:09:33Z`. Its GitHub API file manifest contains 23 paths; reviews and comments were empty when queried. [PR #42](https://github.com/ramkivs/iips-review-recovered/pull/42)
- IRR PR #51 / #53 and the exact G2-2 candidate record, to determine whether AD-01’s status claim became operative. [PR #51](https://github.com/ramkivs/iips-review-recovered/pull/51); [PR #53](https://github.com/ramkivs/iips-review-recovered/pull/53).
- IPD remote refs re-queried with `git ls-remote`: `main@4d3e1cd…`; `np04-governed-persistence-windows@2e11fa3…`; G24 branches `arena/01a0e6d9…@6828155…` and `arena/01a0f308…@6828155…`; act branch `arena/01a0f839…@12c480b…`.
- IPD act file read directly at commit `2606185923f6cbd3f4df5c3af200f54d40ed4bbc`; file blob `832003c6e31999d05df44951038b97862fae9961`. [Exact act at the recorded commit](https://github.com/ramkivs/iips-production-market-data/blob/2606185923f6cbd3f4df5c3af200f54d40ed4bbc/evidence/np04/NP04-PROMOTION-AUTH-TARGET-DESIGNATION-AND-AUTHORITY-ACT.md).

### 2.2 Governing IRR records and source blobs at the baseline

| Record / source | Exact evidence at IRR `main@39d03d6…` | Relevant limit |
|---|---|---|
| [D-1 Persistence Domain Ownership](PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md) | Blob `0c4f27b365c47839ec66f4ec6b34ec1c0f72ad2a`; PR #38 merge `561cc85f…` | Domain ownership only; no promotion, main admission, implementation, mapping, package/API reconciliation, or pin change. |
| [D-2 Identity/Tenant Domain Scope](IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md) | Blob `ec80ef89aba3deb2ef1c7ae26afb52e9b8085ee9`; PR #39 merge `f89f1904…` | Domain-scoped identity. §8 requires a separate translation contract and grants no mapping work. |
| [D-3 Governed Reports Acceptance](GOVERNED-REPORTS-ACCEPTANCE-DECISION.md) | Blob `3b24b9c93821dca9cabb6ae81505eacb39f19aae`; PR #40 merge `e13e543a…` | Accepted branch scope only; no implementation/promotion/main admission; UI08 excluded; restart/recovery and live-IdP evidence expressly conditional/unproven. |
| [Reports Promotion Scope](GOVERNED-REPORTS-PROMOTION-SCOPE-DECISION.md) | Blob `0e383adccfdabac93ddc951242ea3c9c75ee7fbe`; PR #41 merge `0b961fec…` | Future promotion requires separate implementation and promotion-execution acts; no actual promotion or main admission. |
| [AD-20 lineage/identity decision](IIPS_v3.0_AD20_PERSISTENCE_LINEAGE_IDENTITY_CONTRACT_DECISION_2026-10-13.md) | Published with PR #78 / baseline `39d03d6…` | Gate B remains open; direct identity mapping is not created; preserve P1 and act coverage as unresolved/not established. |
| [F-1/F-2 value act](IIPS_v3.0_OWNER_CONTEXT_F1_F2_VALUE_ACT.md) | Blob `f90c9325f49d33f378f3fc0936c28f4979164b2e`; post-publication closure records PR #66 and effectiveness | Values and explicit equivalence exclusions; no implementation or capability admission. |
| F-3 mechanism/implementation authority | Blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`; PR #68 merge `a95949571ebec598d941edd13f26f6726dc1dc59` | Effective only for bounded NP-09/10/11 work; §§5, 8, 9 preserve no-auth boundaries, Reports/Portfolios deferral, and separate F-7 qualification. |
| F-3 implementation/qualification record | Blob `ad2a27937695b324673fe43b7499523d3b4feb49`; PR #69 merge `2f6ee7a0…` | Qualification is per capability; Reports/Portfolios remain deferred and fail-closed. |
| F-3 browser acceptance | Blob `0c7d41869966da7d49981991ae0a3f5a7996e09e`; PR #70 merge `0ff644ed…` | Browser evidence applies to the authorized F-3 capability set, not a Reports UI. |

### 2.3 Separation of evidence channels

- **Arena/Linux and local Git:** initial worktree was on `arena/b7b3c81e-iips-review-recovered`, clean at the IRR baseline. The clone is shallow. Current source and governance files were read from that baseline. No branch switch, IPD checkout, or history rewrite was performed.
- **Remote GitHub:** PR state, changed-file manifests, remote branch tips/trees, and the IPD act were checked directly through `gh` / GitHub API. These are remote observations, not local test results.
- **Windows/PowerShell:** not accessed in this investigation. Any Windows-side assertions cited below are prior documentary evidence only; they were not re-executed or upgraded.
- **Runtime / data:** no server was started; no HTTP request, live IdP call, database open, environment-variable read, data-path lookup, or user-data inspection was performed.

## 3. VERIFY — identity domains and binding gap

### 3.1 F-3 source pair

The effective F-3 mechanism declares `OwnerContext` with `tenantId` and `ownerUserId` (`frontend/server/owner-context-resolver.ts`, blob `9738e9b393656eec33f849d78f18c606322a4462`, lines 60–64). Its comment states that the pair has partition semantics only and is not an authorization credential. The effective value act records:

- `ownerUserId = owner-7f3a91c2` — opaque, fixed, server-owned equality/partition key only; not equivalent to or derived from a principal, Reports `userId`, G24 application user, browser identity, or company identity.
- `tenantId = irr-domain-4b82d6e1` — a domain-scoped partition value only; not a membership, tenancy, entitlement, or Reports/G24 tenant authority.

The F-3 implementation and qualification record authorizes and qualifies this pair only in the bounded NP-09 Watchlists, NP-10 Collaboration, and NP-11 Settings scopes. Its effective mechanism decision expressly forbids inferring an owner from a principal or another domain and says future cross-domain binding requires a governed D-2 §8 contract.

### 3.2 Reports target pair

The current Reports persistence port (`frontend/server/reports/persistence-port.ts`, blob `16d787ea77fab1b2d1d2826b9077d17eebd2fd93e`) declares `Np04AuthenticatedOwner { tenantId, userId }`. The Reports persistence implementation documents ownership as `(tenantId, userId)` derived only from the authenticated principal. At the accepted Reports branch tip, the Reports transport obtains a server-derived `Principal { userId, tenantId, roles }`, resolves tenancy through its authenticated path, and passes principal-derived ownership to NP-04. It rejects client-supplied identity. This is not the F-3 owner-context contract.

The field spelling `tenantId` is shared; the source authorities, identifier meanings, lifecycle, and security semantics are not. The F-3 value act explicitly excludes equivalence to a Reports tenant identifier and Reports `userId`. Therefore:

- `ownerUserId → Reports userId` by direct copy is **CONFLICTING** with the governed semantics.
- `tenantId → Reports tenantId` by direct copy is **CONFLICTING** with the governed semantics.
- An explicit, governed F-3-to-Reports mapping (or a new Reports-specific non-auth owner contract) is **UNPROVEN / NOT CREATED**.
- No principal, client claim, `companyId`, G24 `TenantScope`, membership record, provisioning rule, or ownership record is invented by this investigation.

### 3.3 Minimum D-2 §8 content still absent

D-2 §8 requires a separately governed translation contract with at least: **source authority; target authority; source identifier; target identifier; mapping lifecycle; provisioning authority; revocation authority; tenant boundary; ownership boundary; authorization boundary; audit requirements; failure behavior; security/trust model; durable storage; and package/API contract**. D-2 does not authorize that work. No Reports-specific contract with those elements was found in the reviewed records or refs.

This is the immediate identity blocker. A same-field-name comparison, existing NP-04 store, branch proximity, path resemblance, or prior authenticated Reports qualification cannot substitute for the contract.

## 4. VERIFY — persistence boundary, deployment configuration, and current route

### 4.1 Persistence-domain fit is not Reports admission

D-1 assigns artifact/report persistence to the Artifact/Report Domain and identifies the GovernedArtifactStore / NP-04 lineage. Current IRR `frontend/package.json` and `frontend/package-lock.json` physically pin IPD commit `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`, whose package exports `./persistence`. Current source `reports/persistence-port.ts` dynamically resolves `iips-production-market-data/persistence`, expects NP-04's `openDatabase` and `GovernedArtifactStore`, and validates the five-operation Reports port. The chosen persistence domain is therefore a **PROVEN technical fit** for Reports artifacts.

That statement is intentionally narrower than authority:

1. D-1 expressly grants no main admission, promotion, implementation, package/API reconciliation, or cross-domain mapping.
2. PR #42's package/lockfile edits are outside the 13 Reports paths that the G2-2 candidate later labeled AD-01; those two package files are in its separate ten-path list.
3. The later AD-02 scope admits only named PIT/D114 consumers and explicitly excludes `./persistence`; it is not Reports admission.
4. The G2-2 AD-01 status is **not established as operative** (see §5); in any event its text claims presence-only, not Reports persistence use, runtime, or pin admission.
5. Current code still physically names the pin; physical presence is not retrospective authorization.

Accordingly, `PERSISTENCE_DOMAIN_FIT=PROVEN` and `REPORTS_CONSUMER_ADMISSION/AUTHORITY=NOT ESTABLISHED` are separate findings. No pin, dependency, or package change is made.

### 4.2 Runtime database configuration is not verified

`reports/persistence-port.ts` declares `IIPS_NP04_DATABASE_PATH` as a server-owned process-environment setting. If the Reports persistence loader is called, it reads that value, imports the authoritative NP-04 `./persistence` subpath, opens the governed database with the supplied path and NP-04's own migration/open routine, constructs the store, and fails closed (`null`) if the path or any composition step is unavailable. The configuration description requires an absolute path.

This investigation did **not** read the process environment, inspect any deployment, resolve any actual filesystem path, open a database, or inspect data. Whether a deployment supplies the required path or successfully initializes a live store is **UNPROVEN**. In any event, the current Reports transport does not reach this loader.

### 4.3 Current IRR transport behavior

At IRR `main@39d03d6…`:

- `frontend/server/executive-transport.ts` dispatches the Reports namespace to `handleReportsRequest` (lines 698–706).
- `frontend/server/reports-transport.ts` (blob `981470541812a64c733309f1debec75455d85bee`, lines 45–73) validates known route/method combinations and calls `respondOwnerContextUnavailable` for each valid owner-scoped operation. It does not call `resolveOwnerContext`, Reports domain composition, or NP-04 persistence.
- Its tracked test `frontend/server/reports-transport.test.ts` asserts `503 owner-context-unavailable` for the covered Reports routes. That test was inspected, **not run** here.
- The User Portfolios transport also returns `503 owner-context-unavailable` for valid owner-scoped routes (`frontend/server/user-portfolio-transport.ts`, blob `51704c12a467cd2f718a030b5036bc55c9afa73f`, lines 44–69). It was not changed.

This proves the source-level fail-closed path. It does **not** prove the current live deployment response; no runtime probe occurred. The no-auth route remains unavailable and no owner-scoped persistence operation is invoked by this source path.

## 5. VERIFY — D-1, PR #42, AD-01, and the IPD act

### 5.1 PR #42 and D-1: technical compatibility versus authority conflict

PR #42 is titled **“Promotion candidate: Governed Reports onto current main (DO NOT MERGE without promotion act)”**. Its body says: **“NOT authorized for merge — separate promotion act required.”** GitHub records it as merged at `47edf6f3db79c6c443caed148121406f33a158b7` on 2026-10-06. The direct PR API returned no reviews and no comments.

Its 23 changed paths divide as follows:

**13 Reports backend/domain/test paths:**

1. `frontend/server/reports-api.test.ts`
2. `frontend/server/reports-transport.test.ts`
3. `frontend/server/reports-transport.ts`
4. `frontend/server/reports/artifact.ts`
5. `frontend/server/reports/canonical.ts`
6. `frontend/server/reports/composition.ts`
7. `frontend/server/reports/index.ts`
8. `frontend/server/reports/np04-adapter.ts`
9. `frontend/server/reports/persistence-port.ts`
10. `frontend/server/reports/persistence.ts`
11. `frontend/server/reports/reports-artifact.test.ts`
12. `frontend/server/reports/reports-canonical.test.ts`
13. `frontend/server/reports/reports-persistence.test.ts`

**10 other paths:**

1. `frontend/package.json`
2. `frontend/package-lock.json`
3. `frontend/server/admin-live-composition.test.ts`
4. `frontend/server/admin-transport.test.ts`
5. `frontend/server/admin-transport.ts`
6. `frontend/server/executive-transport.ts`
7. `frontend/server/pit/ipdPitReadAdapter.ts`
8. `frontend/server/secured-executor.ts`
9. `frontend/server/tenant-directory.test.ts`
10. `frontend/server/tenant-membership-store.ts`

The PR #42 Reports transport is the older Bearer/Keycloak, authoritative-tenant, server-derived-Principal, resource-gated implementation. It is not a no-auth F-3 owner-context consumer and is not a UI implementation. The package files and shared/admin/auth/tenant/dispatch/PIT paths are outside the 13 Reports-only list.

D-1 (published before PR #42) designated the artifact/report persistence domain but expressly did **not** promote either lineage to main, authorize implementation, create an identity mapping, reconcile package/API or security boundaries, or authorize a consumer migration. PR #42's selection of the D-1 artifact/report store is technically coherent with the domain designation; PR #42's physical merge and package edit do not follow from that designation. Thus:

- **PROVEN:** persistence-domain selection aligns with D-1.
- **PROVEN:** PR #42 merged the 23-path change despite its own stated merge condition and the pre-existing D-1 boundaries.
- **CONFLICTING / UNRESOLVED (P1):** historical merge authority and main-admission status.
- **NOT ESTABLISHED:** any separate act that authorized PR #42 or retrospectively resolved P1.

No rollback, reconciliation, ratification, or retrospective authorization is performed or proposed here.

### 5.2 The exact IPD act does not cover PR #42

The directly inspected act at IPD commit `2606185923f6cbd3f4df5c3af200f54d40ed4bbc` records:

- `SOURCE = 6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4`;
- `TARGET = arena/01a0e6d9-iips-production-market-data`;
- promotion of that stated Phase-A unit only, subject to a separate execution gate;
- `main` / promotion to `main` is **not authorized**;
- **Reports** and unrelated persistence work are explicitly listed as not authorized.

The act contains no authorization of IRR, PR #42, or a Reports merge. Its label calls the source “NP04 Phase-A”; however D-1 and AD-20 separately classify `2e11fa3…` as the artifact/report pin and `6828155…` as the G24 portfolio/tenancy reference. That cross-record lineage/name conflict is preserved; this investigation does not relabel either ref or reconcile the act. Regardless of that nomenclature discrepancy, the act itself does not cover PR #42. Coverage by any different act remains **NOT ESTABLISHED**.

### 5.3 G2-2 / AD-01 status claim and tracker correction

The current canonical tracker previously stated that 13 PR #42 paths were “ratified for presence only (`AD-01`).” The source behind that statement needs a status qualification:

- The G2-2 decision file (blob `2f89bbc94c0040e33a354893e99f8761636d526e`) labels itself **candidate / not approved for merge / not published / not authoritative / pending PA approval**. Its §10 says its decisions become effective only after durable publication to `main` **and independent verification**.
- PR #51, which added that file, is merged at `eb05e25f19dfc5fda79fee4b89ba3c36b9b61464`, but its title is **“G2-2 decision record R2 — candidate for Program Authority review (DRAFT: not approved; do not merge)”**. A Git merge is a publication mechanic, not proof that the stated approval/effectiveness conditions were satisfied.
- PR #53 added a post-merge check output only. Its body records `SUMMARY mode=default pass=32 fail=1 not_verified=2`; the sole fail is C01 because `main` had drifted from the record's base. C14/C15 remain not verified by design. No passing post-merge status closure for AD-01 was located.
- The candidate's text records a relayed Q3 direction to ratify presence, but its own status/effectiveness clauses remain unsatisfied or unverified in the reviewed remote evidence. This report does not elevate that candidate or infer authority from its presence on `main`.

Therefore the exact physical presence of PR #42 paths at historical refs is distinct from an operative AD-01 ratification. **AD-01 operative effect is NOT ESTABLISHED.** The tracker row is corrected to say so; the historical G2-2 file, PRs, D-1, and AD-20 are preserved unchanged. This correction is limited to REG-11 / Reports and does not reopen REG-02, REG-03, REG-08, REG-09, or any other decision.

### 5.4 Time-scoped D-3 status and Reports UI evidence

D-3 was published by PR #40 before PR #42. Its statement that current IRR `main` did not contain the Reports implementation was correct at its recorded snapshot; after PR #42 it became stale if read as a current physical-presence statement. This later physical merge did not expand D-3's branch-only acceptance, grant main admission, or promote UI08.

The accepted Reports tree at `6a8afbb2…` is complete and contains no `Reports.tsx` or Reports UI component. Current IRR `main@39d03d6…` likewise has no Reports frontend feature/component, and PR #42's 23-path manifest has no Reports UI path. D-3 §10 explicitly excludes UI08 Reports as a separate, unaccepted lineage. An earlier tracker pointer to `Reports.tsx` on the accepted branch is not reproducible from that exact tree and is corrected in the tracker as a source-pointer discrepancy.

**UI finding:** no no-auth Reports UI port, component, browser acceptance, or Reports UI admission was found at the refs inspected. This is not authority to create one.

## 6. VERIFY — F-4, F-7, prior Reports authority, and qualification

### 6.1 F-4 and the scope of effective F-3 authority

The F-3 mechanism/implementation authority record became effective through PR #68. Its binding invariants and explicit non-authorizations say:

- Reports (NP-06) and Portfolios (G-2) remain deferred and must keep unconditional owner-context unavailability;
- no identity may be inferred from a principal, request, company identifier, IPD `applicationUserId`, G24/Reports `userId`, or another domain;
- any future cross-domain binding requires a governed D-2 §8 translation contract;
- the record authorizes bounded work only for NP-09 Watchlists, NP-10 Collaboration, and NP-11 Settings; it grants no Reports implementation, admission, enablement, or qualification.

The separate `IIPS_v3.0_OWNER_CONTEXT_PA_DECISION_FINAL.md` still carries a preparation-time `NOT PUBLISHED — NOT EFFECTIVE` status and has no post-publication closure in the reviewed tree. Its F-4/F-7 policy approval text is not treated here as sole operative authority. The effective PR #68 mechanism record independently repeats the relevant Reports deferral and fail-closed limits; that is the operative scope relied upon in this finding.

### 6.2 NP-06-R1 is not authority for the proposed F-3 binding

The remote accepted Reports branch contains `PROGRAM_v3.0_NP06_REPORTS_IMPLEMENTATION_AUTHORITY_ACTIVATION.md` at blob `b5302c5b9172f73a742b03e7c5c863e732a0e3bc`, on branch `arena/01a0f1b3…@6a8afbb2…`. NP-06-R1 activated bounded non-production authority for the then-authenticated Reports implementation, including Reports API/UI and principal-derived `(tenantId, userId)` ownership. It expressly excludes replacing the established authentication/authorization architecture; its governance ref and implementation qualification remain branch-scoped.

That historical authority does not establish a conversion from the later F-3 non-auth `OwnerContext` to the principal-derived Reports owner pair, does not authorize removing/replacing the auth-based ownership contract, and does not override the effective F-3 deferral. D-3 acceptance itself is branch-only and grants no implementation, promotion, or main-admission authority. **No separate implementation authority for the proposed F-3-to-Reports binding/no-auth port was found.**

### 6.3 Existing NP-06 qualification is scope-limited and contains a durability-status conflict

The accepted Reports branch's `PROGRAM_v3.0_NP06_REPORTS_FINAL_QUALIFICATION.md` reports **32/32 requirements** and **228/228 tracked tests** for its authenticated-principal `(tenantId, userId)` implementation. It also reports Process A / Process B persistence and recovery results. Those are historical claims about that old scope, not a test of the F-3 owner pair.

D-3 §9 explicitly retains separate-process restart/recovery and live-IdP evidence as **conditional / unproven**, because the relevant execution harness was not committed as reproducible evidence. D-3 says those claims are not independently reproduced or upgraded to proven certification. These records therefore have a **CONFLICTING** status presentation for restart evidence; this investigation preserves D-3's explicit acceptance limitation rather than treating the final-qualification claim as independently established.

Against F-7 for the requested F-3/no-auth Reports scope:

| F-7 component | Reports result for F-3/no-auth scope | Classification / reason |
|---|---|---|
| 1. Positive ownership-boundary tests | No valid Reports operation uses the F-3 pair; the current transport returns 503 before domain/persistence access. | **UNPROVEN** |
| 2. Negative ownership-boundary tests | Prior principal/client-claim rejection tests exercise the authenticated Reports contract, not the proposed F-3 translation or its negative boundary. | **UNPROVEN** for the requested binding |
| 3. Failure-mode tests | Current source and tracked transport tests specify fail-closed 503 behavior; tests were not run in this investigation. F-7 expressly says fail-closed tests alone do not qualify a capability. | **PROVEN at source/test-definition level only; insufficient for qualification** |
| 4. Separate-process durability/restart | Prior authenticated-scope report claims a Process A/B test, but D-3 retains it conditional/unproven for missing reproducible harness. No F-3-to-Reports process evidence exists. | **CONFLICTING historical status; UNPROVEN for F-3 Reports** |
| 5. No cross-domain equivalence absent D-2 §8 | Effective F-3 constraints prohibit equivalence without a governed contract; no such Reports contract was found. | **PROVEN as a preserved prohibition; does not qualify a mapping** |

F-7 is per capability. No amount of NP-09/10/11 qualification transfers to Reports. No qualification decision is made by this investigation.

## 7. Separate status layers — do not collapse

| Layer | Current result | What this result does not establish |
|---|---|---|
| Persistence-boundary designation | **DECIDED:** D-1 assigns artifact/report persistence to the NP-04 `./persistence` domain; `2e11fa3…` is the physical IRR package pin. | Reports consumer admission, package/pin authorization, identity translation, runtime configuration, or promotion. |
| Persistence implementation compatibility | **PROVEN:** the current Reports port is shaped for NP-04's five operations and uses the designated artifact/report lineage. | A valid F-3 identity argument to those operations. |
| Owner identity binding | **NOT PROVEN:** no D-2 §8 Reports mapping or Reports-specific F-3 owner contract. Direct field copy conflicts with the F-3 value semantics. | No synthetic principal, equality, provisioning, or membership rule is permitted. |
| Implementation authority | NP-06-R1 was limited to the old authenticated Reports scope on its branch. Effective F-3 implementation authority is limited to NP-09/10/11. | No implementation authorization for an F-3-to-Reports adapter, no-auth route, or UI port. |
| Qualification | Old authenticated branch qualification is not F-3 Reports qualification; F-7 for the requested scope is incomplete. | No Reports feature qualification or durability claim. |
| Acceptance | D-3 accepts the historical authenticated Reports branch scope only. | No current no-auth acceptance or main admission. |
| Product admission / promotion | **NOT GRANTED / NOT ESTABLISHED** for a no-auth F-3 Reports capability; P1 remains open. | No main or production activation. |
| Route enablement | Current valid Reports operations return source-level `503 owner-context-unavailable`. | No live deployment claim; no request reaches domain or persistence through this transport. |
| UI enablement | No Reports UI/no-auth port at the refs examined; D-3 excludes UI08. | No rendering, navigation, browser acceptance, or UI admission. |
| Runtime configuration | `IIPS_NP04_DATABASE_PATH` is the declared server-owned seam. Actual path, environment value, and live DB state were not inspected. | No claim that a live NP-04 database is configured or initialized. |
| Publication | This is a documentation-only investigation intended for durable publication with the tracker. | Publication is not a PA decision or product authority. Verify through the remote PR/merge metadata. |

## 8. RE-VERIFY, RECTIFY, ACT, PROVE

### 8.1 RE-VERIFY — evidence gaps after the initial read

Before any future Reports work, re-verify against the then-current remote refs (not this historical snapshot):

1. the exact effective IRR main/Reports branch and current D-1/D-2/AD-20/owner-context records;
2. any new, directly applicable PA act for a Reports F-3 binding and any separate disposition of P1;
3. the exact IPD pin, export, and Reports consumer admission scope—without treating the G24 `6828155…` reference as interchangeable with the NP-04 `2e11fa3…` pin;
4. F-7 reproducible evidence for the precise chosen Reports owner contract, including separate-process durability;
5. Reports UI source, no-auth port, and separate UI/browser admission, if a UI is later authorized;
6. the actual authorized runtime configuration only if a separately authorized runtime check is requested.

This one-pass investigation did not find or create those items. No D-1 convergence work is a prerequisite to Gate B; Gate A remains separate.

### 8.2 RECTIFY — bounded tracker corrections

The tracker update accompanying this record is additive and limited to REG-11 / Reports:

- replace the unqualified statement “13 files ratified for presence only (AD-01)” with the exact distinction: PR #42’s 13 Reports paths are a historical path-set fact; the merged G2-2 candidate’s operative AD-01 effect is **NOT ESTABLISHED**;
- replace the unverified accepted-branch `Reports.tsx` pointer with the complete-tree result: no Reports UI component/no-auth port found at current main or the exact D-3 branch tip;
- record D-1 persistence-domain fit separately from Reports package-consumer authority, F-3 identity binding, qualification, and admission;
- retain P1 as unresolved; retain the exact IPD act’s non-coverage and broader “other act” status as **NOT ESTABLISHED**;
- leave the 503 boundary, application code, IPD refs, pin, data, REG-08, and REG-09 unchanged.

No historical governance file is edited or rewritten by this rectification.

### 8.3 ACT — what this record authorizes and does not authorize

The user's task authorizes this bounded investigation and additive documentary publication only. It does not create a PA binding decision, a new owner/tenant value, an identity translation, qualification, implementation authority, Reports admission, promotion, route/UI activation, or an exception to any existing safeguard. Application-code changes for this task: **zero**.

### 8.4 PROVE — checks performed and not performed

| Check | Result |
|---|---|
| Initial repository status / branch | Clean at `arena/b7b3c81e-iips-review-recovered`; local baseline `39d03d6…`; shallow clone. |
| Remote IRR baseline and relevant refs | Queried directly; see §2.1. PR #42 and PR #51/#53 metadata read remotely. |
| IPD refs and exact act | Queried directly; exact act content read at `26061859…`; no IPD ref changed. |
| Source boundary | Read current transport, resolver, persistence port, owner-pair, and dispatch sources; no runtime call from Reports transport to F-3 resolver or NP-04 persistence. |
| Reports UI tree | Complete recursive accepted-branch tree plus current-main source tree examined; no Reports UI component at those refs. |
| Application tests | **NOT RUN** — no application code changed; existing test definitions were inspected only. |
| Runtime / live HTTP / database | **NOT RUN** — no server, environment, path, DB, or user data was accessed. |
| Windows / PowerShell | **NOT RUN** — no Windows environment was available or invoked. |
| Publication | Verify the linked PR’s merged state, changed-file manifest, `main` inclusion, and unchanged IPD refs after merge. The exact self-referential merge commit/tree are recorded by GitHub PR metadata and in the completion verification. |

## 9. Minimum next governance action and preserved blockers

The smallest substantive action that advances Gate B is a PA decision that either:

1. defines a Reports-specific non-auth owner contract compatible with the selected NP-04 persistence boundary; or
2. creates a D-2 §8 translation contract from the accepted F-3 source into the Reports target identifiers.

The decision must state every D-2 §8 element listed in §3.3, make no implicit identity claim from field names, and preserve fail-closed behavior. This investigation selects neither option and grants no authority to implement it.

P1 is an independent, unresolved historical authority issue. The exact IPD act above is not its resolution; any different act coverage remains **NOT ESTABLISHED**. A separate PA disposition is needed before the conflict may be described as closed. After a binding is governed, implementation authority, reproducible F-7 qualification, Reports/UI acceptance, product admission, and any route/UI enablement remain separate gates. Until each applicable gate is explicitly met, Reports and User Portfolios remain unavailable at `503 owner-context-unavailable`.

**Final state:** persistence-domain fit **PROVEN**; identity binding **NOT PROVEN** (direct aliasing **CONFLICTING**); Reports F-4 **DEFERRED**; F-7 no-auth Reports qualification **NOT SATISFIED**; D-1/PR #42 P1 **UNRESOLVED**; exact act `26061859…` **DOES NOT COVER PR #42**; coverage by any other act **NOT ESTABLISHED**; current source route **FAIL-CLOSED**; Reports UI/no-auth port **NOT FOUND / NOT ADMITTED**; implementation scope **ZERO**.
