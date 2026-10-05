# NP-BASELINE-G0A — IRR / IPD Evidence Reconciliation

**Record date:** 2026-10-05 (Asia/Kolkata)
**Scope:** Non-production governance/baseline investigation for `ramkivs/iips-review-recovered` (IRR) and `ramkivs/iips-production-market-data` (IPD).
**Authority:** Ramki authorized G0A governance/baseline ratification and this additive record. This record does not enlarge implementation, integration, security, persistence, release, or production authority.
**Recording ref:** fixed Arena session branch `arena/01a10cce-iips-review-recovered`; this is not `main`.
**Production:** EXCLUDED.

> **Evidence rule.** This is a fresh reconciliation, not an adoption of a prior G0/G1 conclusion. Branch names, filenames, commit subjects, register claims, and older summaries are not evidence of completion, qualification, acceptance, currentness, or admissibility. Where the underlying record states a status, the report preserves that status at its exact scope and separately records its ref/tree, execution context, durability, current-tree consistency, authority, and limitations.

## A. G0A result

> **FINAL G0A CLASSIFICATION: D — RECONCILIATION REQUIRED.**

The present evidence does not establish one current, mutually consistent, convergence-admissible IRR/IPD baseline or select a shell. Several capabilities have credible bounded execution and explicit non-production qualification/acceptance records, but their records and/or implementations are branch-only; the current IPD package contract does not match IRR's pin; two materially different persistence candidates remain; identity/security scopes are not interchangeable; and several physically published artifacts retain internal “pending publication/not durable” wording. Those are reconciliation facts, not findings that the accepted bounded work did not occur.

**Decision recorded:** `SHELL SOURCE = NOT SELECTED`. No candidate branch is admitted for integration by this record. No source, package pin, schema, persistence, API, route, UI, or identity implementation is changed. G1 does not start here.

## B. Authority, scope, and decision boundary

- Ramki's authorization covers this G0A evidence pass, one additive governance record, its commit/push on the fixed session branch, and only a proven, minimum rectification if needed after investigation. No such source-code rectification was necessary.
- This record makes the one G0A readiness classification required by the supplied decision rules. It does **not** purport to decide unresolved product ownership, select an architecture, accept a capability, designate a security authority, or speak as Ramki on a reserved human decision.
- Historical records are left unchanged. Contradictions and stale status text are recorded, not silently rewritten.
- IRR `main` and IPD `main` are treated as the repositories' authoritative current refs for observed facts, not as proof that every branch-only feature is admitted to either mainline.
- The session branch is fixed to `arena/01a10cce-iips-review-recovered`; the record's remote publication is branch-scoped, not an authoritative-main publication.

## C. Evidence and status vocabulary

The following distinctions apply throughout this record:

- **FACT** — directly observed in a Git object, current source, test artifact, or immutable execution record.
- **DECISION** — a decision explicitly made by an authorized actor in an identified act; it is effective only within that act's stated scope.
- **CANDIDATE** — a branch, implementation, package, or architecture that exists and may merit a later authorized decision. Candidate does not mean selected, admitted, or integrated.
- **UNRESOLVED** — evidence, identity, authority, scope, or ref binding is insufficient or contradictory. This is not a finding of non-completion.
- **EXCLUDED** — expressly outside the present authority/scope; no action is authorized by this record.
- **IMPLEMENTATION AUTHORITY** — permission to implement; distinct from a design decision, implementation completion, qualification, acceptance, or publication.
- **COMPLETED** — the bounded work or artifact says its implementation/execution was completed. The word is not generalized beyond its recorded scope.
- **E2E-PROVEN** — an identified execution traversed the recorded integration boundary. Unit/UI tests, a static inspection, a mocked probe, and a browser-host execution are not treated as equivalent.
- **DURABLE** — the exact artifact/ref is present on a remote advertised ref and was independently read/verified. A durable branch is not automatically authoritative `main`.
- **CURRENT** — the relevant implementation/artifact is present at the current ref, with the cited blobs checked where stated.
- **QUALIFIED** — an explicit qualification act says so, at its bound implementation commit/tree and scope.
- **ACCEPTED** — a separate explicit acceptance act says so, at its bound subject and scope. Qualification is not acceptance.
- **CONVERGENCE-ADMISSIBLE** — expressly admitted by a G0A decision for use in the baseline assembled later. No ref is given this status here.

## D. Repository and current-ref facts

| Repository | Fresh remote `main` | Tree | Current observation |
|---|---|---|---|
| IRR | `d0c6f80ef4b5732772b64a67ef15cdfc5a44e18a` | `a98000d3e5536a236bdca10e2265b3e14ad6a6cd` | Current main contains the D08/Macro and D115 records/implementation and NP-12 certification artifacts; `/evidence` remains a placeholder. Parent `dbb19d38510239c817bd699c3ec4b5af3ef16c80` was independently confirmed from the fresh full remote mirror. |
| IPD | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | `db853dc21d01162e69b0e1211dbea1cb5c5f72b1` | Current main is the 2026-09-23 shell/portfolio baseline. Its package has no `exports` map and its frontend `PortfolioStore` keeps state in a JavaScript `Map`. |

The active IRR checkout was clean before this record, on the fixed session branch at the IRR `main` commit above. The checkout is shallow/grafted; its local `HEAD^` is unavailable. The parent value above comes from the independently fetched full remote mirror, not from an assumed local parent traversal. No IPD write was made.

## E. Ref census, ancestry, tags, and PR placement

### Fresh remote census

A final direct `git ls-remote --refs` snapshot matched the freshly fetched bare mirrors exactly:

| Repository | Heads | Tags | PR refs | Total refs | Sorted manifest SHA-256 |
|---|---:|---:|---:|---:|---|
| IRR | 53 | 2 | 36 | 91 | `831f2cd646cda291445cffe1f59fc255168c262a4bf97878b39df4eb0a7d4243` |
| IPD | 32 | 4 | 6 | 42 | `6d667e96d6b46b804b869f02afb0f3fd6eb67abaf1cdc3aa6284dfce488b158c` |

The direct manifests and mirror manifests were byte-for-byte equal at the final read. PR metadata shows IRR PRs #1–36 target `main`; IPD PRs #1–4 target `main`, while IPD PRs #5–6 target `arena/01a0e6d9-iips-production-market-data`. Ref/PR presence is not admission.

### Complete branch-tip ancestry census against each current `main`

Every advertised head tip was classified by commit ancestry/tree against the observed `main` tip:

| Repository | Equal tip | Different commit, identical tree | Ancestor of main | Main ancestor of tip | Diverged | Unrelated |
|---|---:|---:|---:|---:|---:|---:|
| IRR (53 heads) | 1 | 1 | 36 | 0 | 12 | 3 |
| IPD (32 heads) | 1 | 1 | 5 | 12 | 12 | 1 |

“Main ancestor of tip” means branch-only descendants, not merged. Diverged and unrelated histories are not import instructions. The counts are a commit/tree census, not a capability acceptance list.

### Peeled advertised tags

- IRR `program-v1.2.0` peels to `5decdca…`, an ancestor of current IRR `main`.
- IRR `v3.0-phase12-certified` peels to `7325aeda…`, not an ancestor of current IRR `main`.
- All four IPD advertised tags are not ancestors of current IPD `main`: `p14-r7-65b78f7`, `portfolio-option-a-cb969b6`, `post-cleanup-baseline-b46b4f4`, and `temporary-cleanup-caf73ba`.
- No advertised `v3.0-phase13-certified` tag exists. Phase 13 records describe an exported bundle/snapshot, but this G0A pass did not retrieve those exports independently.

### Relevant branch/tree identities

| Repository / ref | Tip (short) / tree (short) | Relation to current main | Evidence significance, not admission |
|---|---|---|---|
| IRR `arena/01a0f351-iips-review-recovered` | `3b5c54c…` / `72e16e1…` | Diverged | NP-07/09/10/11 qualification and acceptance material; separate NP-13 IA record. |
| IRR `arena/01a0f1b3-iips-review-recovered` | `6a8afbb…` / `0e25371…` | Diverged | NP-06 Reports qualification/authority records and implementation. |
| IRR `arena/01a0f64b-iips-review-recovered` | `a7c421a…` / `ae7b0e1…` | Diverged | Earlier branch-scoped evidence-landing implementation acceptance. |
| IRR `arena/01a1079e-iips-review-recovered` | `d908638…` / `a49ef04…` | Diverged | D115 completion lineage; not selected over current-main D115 artifacts. |
| IRR `arena/01a10b3c-iips-review-recovered` | `36e433a…` / `344a58a…` | Diverged | D89 Macro UI disclosure decision plus a separate UI component/test candidate. |
| IRR `arena/01a10c0e-iips-review-recovered` | `39bd90c…` / `a98000d…` | Different commit, identical tree | Content equals the current IRR main tree at the snapshot; commit identity/lineage is different. |
| IRR `arena/01a0e30f-iips-review-recovered` | `17c759c…` / `cdaf456…` | Diverged | GATE-Y governance corpus handoff. |
| IRR `arena/01a0f64b-iips-review-recovered` | as above | Diverged | Earlier accepted landing candidate; kept distinct from the later IA-only act. |
| IRR D7 refs `arena/01a03e3b…`, `arena/01a0ddff…` | `3c7568e…`, `ffa92db…` | Diverged | D7 Tier-3 independence/RAJI evidence; not the D07 source designation. |
| IPD `arena/01a0e6d9…` and `arena/01a0f308…` | `6828155…` / `eb07ea3…` | Main is ancestor; not merged | G24 portfolio persistence candidate, with a separate post-promotion acceptance ref. |
| IPD `arena/01a0f839…` | `12c480b…` / `79e0502…` | Main is ancestor; not merged | Post-promotion acceptance bound only to G24 commit `6828155…`. |
| IPD `np04-governed-persistence-windows` | `2e11fa3…` / `7c1d516…` | Main is ancestor; not merged | Common governed persistence candidate, used by the NP-06 Reports qualification. |
| IPD `arena/01a0ddae…` | `8c87317…` / `8b231c5…` | Main is ancestor; not merged | GATE-Y D06/D07 presentation-only integration branch. |
| IPD `arena/01a0d943…` | `224fc54…` / `ff70231…` | Main is ancestor; not merged | Development-only synthetic Dhan demonstration. |
| IPD `arena/01a0814b…` | `da43051…` / `f06b94b…` | Diverged | IPD D89/UI12 global data-mode branch. |
| IPD `arena/01a0853c…` | `b02acb1…` / `3e082c9…` | Diverged | R-2 provider-neutral market-data branch. |

No branch above is made convergence-admissible by the census.

## F. Current architecture and shell source

**DECISION: `SHELL SOURCE = NOT SELECTED`.** No shell is selected by code volume, branch label, history, or feature count.

- **IRR `main`** is a Vite/React client plus Node server transports, the `iips-platform` engine/screener code, server-side `SecuredExecutor` and selected Keycloak/OIDC paths, current Macro transport, and bounded D115 runtime code. It is the current IRR fact baseline, not an assembled cross-repository product baseline.
- **IPD `main`** is a separate portfolio/market-data UI/server repository with BI-03/04/05/07/08 broker-ingress work and a process-local portfolio store in the inspected `PortfolioStore`. The G24, NP04-common, Dhan demo, GATE-Y, D89/UI12, and R-2 branches have distinct scopes and histories.
- The 13-engine / evidence / replay core and the current IPD shell are not interchangeable repositories. A package pin or a visually similar UI is not a shell selection.
- No runtime assembly, merge, cherry-pick, or shell adoption was performed or authorized in G0A.

## G. Capability ownership and current status summary

| Capability/domain | Observed owner or placement | Current evidence/status boundary |
|---|---|---|
| N4 Cross-Sector Screen | IRR `iips-platform` | Bounded certification and acceptance record on current IRR `main`; source/test blobs checked against certified commit. Not a whole-product or production certification. |
| Reports | IRR product/API layer consuming an IPD persistence package in the qualified branch | Bounded qualification is strong and separately process-tested, but implementation and qualification are on a diverged IRR branch, pinned to an IPD candidate branch. No Reports capability acceptance act was found. |
| Research | IRR front-end/server | Three qualified surfaces (Company Intelligence, Cross-Sector Intelligence, Engine Registry) are byte-identical on current IRR `main`; branch-scoped qualification and acceptance records exist. Sector Intelligence is expressly outside that qualified scope. |
| Watchlists | IRR Server Tier, Gate-P Class C `journal.ndjson` | Branch-scoped owner designation, qualification and acceptance; current main has no NP-09 implementation paths. Process/journal reconstruction is not deployment-tier OS/container evidence. |
| Collaboration | IRR Server Tier, separate collaboration journal | Branch-scoped qualification and acceptance; no promotion to current main; out-of-process authenticated HTTP restart and production identity are not established. |
| Settings | IRR Server Tier, distinct `IIPS_DATA_DIR/settings/journal.ndjson` boundary | Branch-scoped qualification and acceptance; no current-main implementation; process-instance journal reconstruction only; G3 remains open. |
| User portfolios / holdings | IPD under G-2 | IPD main has broker ingestion/UI but the inspected `PortfolioStore` is a `Map`; a distinct G24 durable store is accepted on a non-main candidate branch. These are not the same implementation. |
| Governed Reports/artifacts | NP-04 persistence lineage / IPD common package candidate | `node:sqlite` common persistence candidate exists on a non-main IPD branch and is consumed by qualified Reports on an IRR branch. Current IRR NP-04 boundary act does not designate a current owner/ref or select it. |
| Macro datasets | IRR D08/Macro | MoSPI designated for NAS/CPI/IIP only; entitlement, reuse rights, production and M-3 provenance remain separate/ungranted or unresolved. |
| Company identity | IRR D115 runtime boundary, with G-2/IPD relationship dependency | Bounded implementation exists in current IRR main; no database, concrete Company Identity Authority, or durable binding store was selected/created. |
| Evidence landing/navigation | IRR | One old branch claims accepted landing implementation; a separate later branch accepts IA only; current IRR main still renders a placeholder at `/evidence`. |
| D06/D07 Intelligence corpus | IRR governance destination / IPD source corpus | GATE-Y governance placement is scoped to that corpus; IPD presentation-only wiring is branch-only. It does not establish a complete Intelligence product or universal authorization. |

## H. NP work-item reconciliation — 14 rows

**Method:** each item was checked against current main, the advertised branch/tag/PR snapshot, relevant tree paths, record status, and any stated execution coordinate. The first five and the fourteenth have no dedicated, exact-identifier qualification/acceptance record in the advertised repository corpus. That is an evidence/identity gap, **not** a determination that the work is incomplete. Existing BI/P01/Dhan/PIT records are not assigned to those numbers by resemblance.

| Work item | Durable artifact / exact execution evidence | Currentness, durability, authority, acceptance, and disposition |
|---|---|---|
| **NP-01** | No exact work-item artifact or row-bound commit/tree/test run was found on any advertised IRR/IPD head. | **UNRESOLVED.** No completion or non-completion finding; do not infer from an adjacent capability or a register assertion. |
| **NP-02** | No exact work-item artifact or row-bound execution coordinate was found. IPD has Dhan CSV adapter/schema evidence, but it is not identified by this work-item number in the repository. | **UNRESOLVED.** Dhan evidence is recorded separately in §L; no status is transferred to this item. |
| **NP-03** | No exact work-item artifact or row-bound execution coordinate was found. IPD has BI-07/browser and Operator Drop evidence, but no NP-03 identifier binding was found. | **UNRESOLVED.** Related IPD evidence remains separately scoped; no status is transferred to this item. |
| **NP-04** | IRR `main` contains `NP-04-PERSISTENCE-DOMAIN-BOUNDARY-ACT-01`, but the artifact labels itself “ARENA TRANSFER COPY — NOT AUTHORITATIVE” and “PENDING AUTHORITATIVE PUBLICATION,” despite physical presence on main. IPD has two distinct persistence candidates: G24 at `6828155…` with post-promotion acceptance at `12c480…`, and the common `node:sqlite` package at `2e11fa…`. | G24 records implementation complete and bounded post-promotion acceptance on its branch; common persistence is a candidate used by NP-06. No singular current NP-04 implementation/technology/ref is selected by the IRR boundary act. The G24 retest attempt in this pass stopped before test discovery because its direct TypeScript test imports missing built `.js` output; **zero test cases ran**. |
| **NP-05** | No exact NP-05 authority/qualification/acceptance artifact or ref binding was found. IPD current main has a BI-07 report and Operator Drop artifacts; the report claims 50 suites/299 tests and live Windows-browser verification at implementation commit `5c469a…`, in offline/local-fixture mode. The current-main `PortfolioStore` and Dhan adapter blobs differ from that implementation coordinate (the cited BI-07 UI integration test blob matches; the report file itself is not present at `5c469a…`). | Preserve BI-07's recorded “accepted/complete/browser verified” status for that workstream. Its report binds to an earlier implementation commit; current main has different `PortfolioStore` and Dhan-adapter blobs, and the current `PortfolioStore` is a `Map`. Thus the historical browser acceptance remains valid for its stated coordinate, but is not proof of current-tree identity or OS-process-restart durability for the current code path. BI-07 is not silently relabeled NP-05, and no live Dhan API or production access is established. |
| **NP-06** | `NP-06-R2` qualification binds IRR branch `arena/01a0f1b3…` commit `39dd43e…` / tree `3fdc29d…`, plus IPD `np04-governed-persistence-windows@2e11fa3…`. It reports Reports 228/228, typecheck exit 0, live HTTP/security checks and separate-OS-process recovery; full regression 543 passed / 2 failed / 25 skipped. | **Implementation authority activated and bounded; qualification = qualified.** The earlier NP-06 governance transcription is accepted as governance, not product acceptance. No separate Reports acceptance act was found. Reports implementation is absent from current IRR main and depends on a non-main IPD package/ref; not convergence-admissible. |
| **NP-07** | Qualification `NP-07-QUAL-01` and separate `NP-07-ACCEPT-01` are on `arena/01a0f351…`. The qualification records 22/22 focused tests, typecheck/build pass, and full suite 272 passed / 2 failed / 25 skipped at its exact execution coordinate. Its bounded surface is Company Intelligence, Cross-Sector Intelligence, and Engine Registry; Sector Intelligence is outside scope. | Preserve **qualified and accepted for the active non-production IRR feature baseline** as its separate branch-scoped acts state. Independently, all nine listed current-main source/test/route blobs match the qualified baseline at current IRR main. Its acceptance act discloses that the D0 authority record did not name this work item; its authority basis is a recorded reading of the general membership jurisdiction, not an explicit NP-07 enumeration. This is a scope/authority caveat, not a retraction. |
| **NP-08** | Multiple distinct subtracks exist. Current IRR main has D08 Macro code/acts, D115 code and completion report; GATE-Y corpus placement is also recorded on current main. Separate IPD GATE-Y wiring remains on a branch. | No unified NP-08 product qualification/acceptance is established. Macro's provider is designated for NAS/CPI/IIP, but entitlement/redistribution/caching/retention/production are not granted; M-3 remains separate. GATE-Y records M1–M3 governance/source placement for its bounded corpus; M4 remains unresolved and M5 conditional/out of scope. That placement is not general product admission. D115 is “implementation complete” only for its bounded runtime boundary; its completion record explicitly withholds qualification/acceptance/certification and concrete persistence. |
| **NP-09** | `NP-09-PROMO-01` and owner designation on IRR `arena/01a0f351…`; exact implementation commit `fbe76496…`. The acceptance act reports 77/77 Watchlists/persistence tests, typecheck and build pass, and journal reconstruction. | Preserve **accepted for the active non-production IRR feature baseline** as the branch act states. Persistence owner = IRR Server Tier, Class C append-only journal. The act excludes production OIDC, live providers, and deployment-tier/out-of-process restart proof. Implementation and act are not on current IRR main. |
| **NP-10** | Qualification `NP-10-QUAL-01` binds implementation `ba8ea1df…` on `arena/01a0f351…`; separate acceptance act records the branch baseline. It reconciles 88 NP-10 cases and a 94-case focused suite (88 + 6 existing App shell cases), 21/21 Gate-P, 56/56 Watchlists regression, +88 full-suite passes with zero new failures, typecheck/build pass. | Preserve **qualified and accepted** within the active non-production branch baseline. Acceptance expressly did not promote the implementation to main. Journal reconstruction is scoped to fresh service instances; out-of-process authenticated HTTP/OS/container restart, live production IdP and production remain excluded; G3 remains open. |
| **NP-11** | Qualification `NP-11-QUAL-01` binds `0feceafd…` on `arena/01a0f351…`; separate acceptance act. It reports 81/81, typecheck/build pass, full-suite 518 passed / 2 failed / 25 skipped with zero new failures. | Preserve **qualified and accepted** within the branch-scoped active non-production baseline. Settings has a distinct IRR journal boundary; current main contains zero NP-11 implementation paths. Evidence is in-process journal reconstruction, not out-of-process OS/container durability. G3/browser credential path and production OIDC remain open/excluded. |
| **NP-12** | Current-main certification/acceptance record `IIPS_NP-12_N4_SCREEN_CERTIFICATION.md` is present from commit `9c953867…` (blob `ae404dea…`). It binds certified implementation baseline `da410d067…`; the six inspected N4 source/test blobs match that baseline on current main. It reports 35/35 N4-SD, 45/45 N4-A10, 13/13 N4-A13 functional subtests; one protected-surface subtest was disposed; full platform suite 599/642 passed, 43 accounted failures (42 pre-existing, one disposition). | Preserve **certification and post-certification acceptance** for the exact N4 envelope only. Current remote main physically contains the record (Git blob `ae404dea79132ca1523f8b35a786da2236d23d9f`, raw SHA-256 `827c2bc94c0fe7f9eb66769ea59b4dcd3596ddf712440a01ff81ad1836f62a33`, 22,078 bytes), so its Git publication condition is met; the record's own pending-publication notice is stale/inconsistent, and no embedded post-publication attestation was found. `A6-IMPL-10` remains open. This is not E2E-030 or whole-product certification. |
| **NP-13** | Two distinct remote branch histories claim different things. `arena/01a0f64b…` has an earlier acceptance act for implementation `fa9862c…`, reporting a 13/13 governed-subject route probe and non-production acceptance. `arena/01a0f351…` has a later IA decision that accepts IA only and expressly grants no implementation/certification/release authority. | Preserve the earlier branch acceptance at its stated scope; do not erase it. It is not current-main admission: current IRR `/evidence` still renders a placeholder, while detail/replay routes exist. G3 remains open. Current-main D-series records are physically present despite self-labeling workspace-only/not-durable and withholding publication/implementation authority; physical presence does not resolve their separate authority/effectiveness text. Exactly one row is recorded here for this item. |
| **NP-14** | No dedicated item record was found. A branch-side authority record says this item's status was not re-evaluated. Current source has route-specific `SecuredExecutor`/OIDC boundaries and also a deliberately throttled no-auth Macro endpoint. | **UNRESOLVED / not re-evaluated**, not “incomplete.” No universal route-protection coverage review, acceptance act, or end-to-end security qualification is established by the evidence found. Do not infer universal auth from Phase 13 OIDC or D115. |

## I. Macro / D08 findings

**FACT — current IRR main.** The Macro transport, API client, and UI support NAS/CPI/IIP, with MoSPI/e-Sankhyiki as the designated provider for this bounded scope. The final current-main D08 comment rectification records that designation without expanding dataset scope. Comparison of the Macro implementation commit to current main shows only comments/documentation changed afterward in the Macro-related files; no G0A tests were run.

**DECISION — bounded source and legal scope.** Provider designation is not entitlement. The records leave commercial use, redistribution, caching, retention, and related legal terms ungranted or unresolved; M-3 provenance is not established. The route's intentionally unauthenticated, throttled GET/HEAD posture is a narrow transport decision and is not entitlement or production authority.

**CANDIDATE — UI disclosure.** A separate IRR branch (`arena/01a10b3c…`) contains a D89 Macro disclosure decision and `MacroSourceDisclosure` component/tests. That branch is diverged from current main; its decision states UI implementation authority was not granted by that gate. The candidate is not current-main UI implementation evidence.

**Current status:** keep provider designation, licensing/entitlement, attribution, M-3 provenance, UI disclosure implementation, and production authorization as distinct decisions. No Macro status is transferred to GATE-Y D07.

## J. Cross-repository package and API contract

| Contract fact | Current/candidate evidence | G0A interpretation |
|---|---|---|
| IRR current dependency | `frontend/package.json` pins `iips-production-market-data` to exact commit `0dab1221fb0f89e2e0601ea905d642bfe72d5f9c`; IRR imports `iips-production-market-data/pit`. The pin is not an ancestor of IPD main and remains in candidate branch history. | This is the existing pinned package coordinate, not a newly admitted convergence ref. No pin change was made. |
| IPD current `main` | `package.json` has no `exports` map; current `main` does not expose the PIT subpath IRR imports. | Current IPD main and IRR's pin are not interchangeable package contracts. A repin to IPD main would be a separate breaking/authority decision, not G0A work. |
| G24 IPD candidate | At `6828155…`, package exports `./pit` and `./d114-non-production`; `better-sqlite3@13.0.3` powers the G24 portfolio store. It does not expose the common `./persistence` subpath. | G24 is a distinct portfolio/tenancy package candidate with its own authorization and follow-up governance. |
| Common persistence candidate | At `2e11fa…`, package exports `./pit`, `./d114-non-production`, and `./persistence`; persistence implementation uses Node `node:sqlite`/`DatabaseSync`. | This is a different API/technology line from G24. It is not current IPD main and is not the G24 durable-store API. |
| NP-06 Reports consumer | The qualified IRR branch pins IPD `2e11fa…` and exercises the common persistence port. | This proves a bounded branch execution against that candidate, not a current-main integration or a general package admission. |

The G24 and common persistence branches share merge base `246cb944…` and are not ancestors of each other. Their tree comparison is 50 changed files (+1,842/−8,184 lines), including removal of the G24 server/authorization/OIDC-verifier surface on the common line. They are mutually distinct implementation candidates; no runtime assembly or package replacement is authorized.

## K. Persistence and data-plane ownership

| Data domain | Observed decision / owner | Actual evidence and remaining boundary |
|---|---|---|
| User portfolio/holdings | G-2 assigns the domain to IPD; the IRR NP-04 boundary act repeats that ownership while saying its own artifact/report owner/ref is not established. | IPD main's `PortfolioStore` is `Map<string, PortfolioRecord>`; its current blob differs from the BI-07 implementation coordinate `5c469a…` (as does the Dhan adapter; the referenced BI-07 UI integration test is byte-identical). No database export or separate-process restart proof was found on current main. The BI-07 report's atomic/browser acceptance must not be equated with the separate G24 database candidate. |
| G24 durable portfolio | IPD G24 branch records `better-sqlite3@13.0.3`, migrations/schema, fail-closed database behavior and bounded implementation completion; post-promotion acceptance is tied to exact IPD commit `6828155…`. | Durable/accepted at that branch-scoped, non-production coordinate; not current IPD main, not the common Reports persistence port, and tenant-authority follow-up remains open. |
| NP-04 governed artifacts/Reports | The common IPD persistence candidate uses `node:sqlite`; NP-06 Reports consumes it in a separate IRR branch. | This is not a single selected owner/ref in the current IRR NP-04 boundary act. Reports qualification does not ratify all NP-04 architecture or IPD main. |
| Watchlists | IRR Server Tier; Gate-P Class C append-only journal. | NP-09 acceptance/qualification is branch-scoped; deployment-tier durability is not proven. |
| Collaboration | IRR Server Tier, consumer-specific journal. | NP-10 branch qualification/acceptance; not a universal persistence API or IPD ownership transfer. |
| Settings | IRR Server Tier, separate settings journal consumer boundary. | NP-11 branch qualification/acceptance; does not reuse the Watchlists or Collaboration journal as an identity. |
| D115 identity bindings | No technology/DB selected. | Current IRR code implements logical repositories and injected Company Identity Authority contracts only; no durable binding repository or concrete authority exists. |
| Macro/source data | IRR transport consumes MoSPI/e-Sankhyiki. | Provider designation does not grant cache/retention/redistribution rights; no production source-data plane is authorized. |

The current NP-04 boundary act itself is physically on IRR main, but internally calls itself a non-authoritative transfer copy with publication pending. Its text expressly does not choose between `better-sqlite3` and `node:sqlite`, does not promote either historical line, and does not establish an artifact/report owner/ref. This G0A report does not silently upgrade that act's authority.

## L. Identity/security crosswalk — preserve non-equivalence

| Identifier/surface | Exact scope evidenced | Explicit non-equivalence / limit |
|---|---|---|
| **B1** | Older NP-15 material says B1 was not a durable workstream identifier; no canonical B1 authority artifact was found in the fresh advertised ref scan. | Do not equate B1 with BI-01, BI-07, D07, or a work-item number by similarity. |
| **D7** | IRR branch-only Tier-3 independence / RAJI adjudication lineage; records state Option-1 evidence was absent/not satisfied. | Not the IPD D07 data-source label; not current-main security acceptance. |
| **D07** | GATE-Y prospective-estimates/provenance corpus material; D06/D07 UI wiring is presentation-only on an IPD branch. | Not D7 Tier-3 independence, D115 identity, Macro entitlement, or Dhan ingestion. |
| **D115** | IRR Principal → Owner/Account → Tenant → Company Binding → canonical CompanyId request-boundary contract; current-main bounded runtime code. | No DB/ORM/schema/vendor, concrete Company Identity Authority, IPD implementation, durable binding store, qualification, acceptance, or production status is implied. |
| **IRR D89 Macro disclosure** | Separate NP-08/D08 product-transparency/disclosure decision, with a branch-only UI component candidate. | Not the IPD D89/UI12 global data-mode propagation work. |
| **IPD D89/UI12** | IPD branch `arena/01a0814b…` records global UI12 data-mode propagation for six frozen route families. | Diverged from IPD main; not an IRR Macro disclosure act, not a current universal auth decision, and not approved for porting here. |
| **NP-04** | Separate portfolio/tenancy and governed artifact/report persistence histories. | Not D115; neither persistence lineage becomes a Company Identity Authority by convenience. |
| **Operator Drop** | IPD manual/local CSV drop and parser path, including non-production single-operator identity-bypass evidence. | Not a live broker connection, production identity, durable portfolio database, or automatically an NP-05 acceptance. |
| **Phase 13 OIDC** | IRR AI Advisory / selected server transports use Keycloak/OIDC/JWKS → `SecuredExecutor` paths; the Phase 13 record reports 4/4 real-Keycloak advisory tests. | A route-specific read-only authorization chain is not universal protection, D115 company binding, or production deployment authorization. The advertised Phase-13 tag/snapshot lineage is separately qualified in §M. |
| **Dhan** | IPD offline Dhan Web UI Summary CSV format/adapter and BI-07 browser fixture path. | Not Dhan API connectivity, not R-2 market-data, and not the G24 durable portfolio store. |
| **R-2** | IPD provider-neutral NSE/CM-UDiFF/15-minute market-data branch, diverged from current IPD main. | Not IRR's historical “R2 engineVersions” E2E deviation and not Dhan. |
| **Macro** | IRR MoSPI/e-Sankhyiki NAS/CPI/IIP transport. | Not D07 GATE-Y prospective estimates, not Dhan, and not a licence grant. |

**Security fact:** current IRR has individually guarded server routes and real-OIDC test paths, while the Macro endpoint is intentionally throttled/no-auth and the client route table is not a universal server security boundary. NP-09/10/11 records keep G3/browser credential flow open; D115 is bounded and has no concrete durable identity source. No universal route-by-route protection certification was located. IPD current main remains non-production/offline in the inspected broker-import scope; the G24 OIDC verifier is branch-only.

## M. Historical lineage and status tensions

1. **Phase 13:** Current IRR main contains Phase 13 certification/durability documents and selected OIDC source/tests. The Phase 13.5 record names `v3.0-phase13-certified` and exported bundle/snapshot artifacts as recovery evidence. That tag is not among the advertised tags; the actual advertised `v3.0-phase12-certified` tag is not an ancestor of current main. The recorded export hashes were not independently retrieved in this pass. Preserve the scoped Phase 13 evidence; do not generalize it to universal route security or assume its historical tag lineage is current.
2. **NP-12:** The N4 record explicitly grants scoped certification and post-certification acceptance subject to durable publication/verification. It is now physically present on remote IRR main from `9c953867…`, current main contains the exact blob, and the certified source/test blobs match the certified baseline. Its pending-publication wording is therefore stale against observed Git state; no historical edit was made. The condition's physical Git publication is verified here; the record does not become whole-product acceptance.
3. **NP-04 boundary act:** The file is physically present on current IRR main but labels itself “ARENA TRANSFER COPY — NOT AUTHORITATIVE” and says publication is pending. Git durability and the act's stated authority/effectiveness are separate; no owner or technology is inferred.
4. **NP-13 D-series:** Multiple D-series files are physically present on current IRR main, while the combined determination says workspace-only/not durable and withholds publication/implementation authority. Physical presence is a durability fact, not a cure for the act's own authority/effectiveness limits.
5. **Evidence landing:** The earlier branch acceptance and the later branch IA-only decision are separate records on diverged refs. Current main remains a placeholder. Neither branch is erased or silently substituted for current main.
6. **NP-15 historical absence statement:** The October 3 NP-15 investigation said items 01–11 and 14 lacked artifacts at its then-observed baseline. Fresh refs now contain several later item-specific acts (including 06, 07, 09–13), so that old absence table is not current status. The still-unbound item identities are reported in §H rather than copied forward as a blanket conclusion.
7. **D08 comment rectification:** The latest current-main Macro comment rectification already records the MoSPI designation accurately while keeping entitlement separate. G0A makes no further code/comment change.

These are evidence reconciliations only. No prior record is silently rewritten, revoked, or promoted.

## N. Ref admissibility and convergence position

**DECISION:** No branch/ref is designated convergence-admissible by G0A. Current `main` refs remain the sources of current repository facts. The following are candidates only:

- IRR `arena/01a0f351…` for NP-07/09/10/11 and IA material; `arena/01a0f1b3…` for NP-06; `arena/01a0f64b…` for earlier accepted landing implementation; `arena/01a10b3c…` for D89 Macro UI candidate; and IPD `arena/01a0e6d9…` / `arena/01a0f308…` for G24 persistence.
- IPD `np04-governed-persistence-windows` for the common persistence API, `arena/01a0ddae…` for presentation-only GATE-Y wiring, and `arena/01a0d943…` for the development-only Dhan demonstration.
- IPD R-2 and D89/UI12 branches diverge from current main; no content is admitted from them.

This is not a negative judgment on the work performed on those refs. It means the G0A evidence does not resolve the source/package/ownership/authority conflicts needed to admit one of them into a composed baseline. A branch-only implementation or acceptance record is never described here as an IRR/IPD `main` publication.

## O. Rectifications and protected work

- **No minimum source rectification was proven necessary.** The Macro comment correction is already present on current IRR main. Other internal pending-publication wording is preserved and reported as a discrepancy.
- No historical record was edited, amended, deleted, or reclassified.
- No implementation, feature integration, wholesale merge, cherry-pick, runtime assembly, dependency/package pin change, schema, persistence, route, UI, or IPD source change was made.
- Protected work left untouched includes the certified IRR platform/engine and E2E-030 baseline, NP-12 N4 artifacts, PIT/IU-7 and D114 history, G-2 portfolio boundary, the reference portfolio, branch-scoped NP-06/07/09/10/11 work, and all production surfaces.

## P. Unresolved decisions and evidence required

1. Exact item-to-capability crosswalk and durable execution coordinates for NP-01–05 and NP-14; no completion claim is inferred from adjacent labels.
2. Whether current IRR `main` or any candidate ref is the future assembled shell; no shell selected.
3. Whether and how the IRR PIT package contract may track IPD after IPD main/package exports are authoritatively reconciled; no pin changes in G0A.
4. Which persistence line owns which domain: IPD G24 portfolio, IPD common NP-04 artifact store, IRR Gate-P consumer journals, and D115 logical identity records remain distinct.
5. Whether the two IPD persistence packages are to remain sibling contracts or be reconciled by a future explicit architecture decision; their current source trees differ substantially.
6. Authoritative tenant/Company Identity Authority, D115 durable binding implementation, and cross-repository identity version/provenance semantics.
7. Universal server-route security coverage and browser-to-transport credential path; current route-specific evidence does not close this.
8. GATE-Y's open/conditional subdecisions and the relationship (if any) to the wider Intelligence capability; no status transfer from Macro or D115.
9. Current-main status/effectiveness of NP-04 and D-series records whose text says publication is pending/not durable despite physical main presence.
10. Whether branch-scoped accepted features should be promoted to main or remain active only on their designated non-production branches. Those acts explicitly separate acceptance from promotion.
11. Independent retrieval/verification of the Phase 13 export artifacts if they are to be used as a durability anchor; no inference from a tag name.
12. Any production rights, deployment, external provider activation, live broker API, or live tenant authority; all remain excluded from this G0A.

## Q. G1 entry conditions

G1 may not start until a separate authorized gate has, at minimum:

1. received and bound the complete NP-01–NP-14 matrix titles/owners to exact artifact, execution, commit/tree, durability, qualification, and acceptance evidence;
2. explicitly selected a shell source and exact baseline ref/tree, or recorded that no shell is selected;
3. chosen and authorized package/API contract and cross-repository pin policy without assuming that a branch export equals current IPD main;
4. assigned persistence ownership by domain and resolved whether/how the distinct G24 and common NP-04 candidates can coexist;
5. established the authoritative Principal/Owner/Tenant/CompanyId and security boundaries, with route-level coverage and live/non-production scope identified;
6. reconciled the NP-04, NP-12, NP-13 and Phase 13 publication/status tensions without rewriting historical records;
7. bound each accepted capability to its exact implementation/evidence ref and stated currentness, qualification, acceptance, and promotion separately;
8. identified protected paths and excluded work, and authorized a narrowly scoped integration plan; and
9. published and independently verified the applicable G0A/G1 governance decision under the required durability convention.

The G0A report is remotely published only to the fixed session branch. No G1 implementation or convergence work began.

## R. Explicit exclusions

This G0A record does **not** authorize: production activity; deployment; external provider contact; live market-data or broker activation; licensing/redistribution/caching/retention; new OIDC/Keycloak configuration; persistence or identity-source implementation; schema/API/package changes; dependency pin changes; feature implementation; branch merging/rebasing/cherry-picking; candidate selection; runtime assembly; broad certification; release; or edits to prior governance artifacts.

## S. Evidence ledger, execution limits, and publication

### Evidence ledger

- Fresh direct remote ref manifests were captured for both repositories; their SHA-256 values and counts appear in §E and matched the bare-mirror manifests.
- Full advertised branch-tip ancestry/tree relations were computed against both current `main` refs; all advertised tags were peeled and ancestry-checked.
- Current package manifests, IRR PIT imports/pin, IPD `PortfolioStore`, Dhan/Operator Drop evidence, G24/common persistence branch code, NP-06/07/09/10/11/12/13 acts, D08/GATE-Y records, D115 records, Phase 13/OIDC paths, and current IRR `/evidence` route were inspected read-only.
- N4 certified implementation/test blobs and NP-07 source/test/route blobs were compared against their recorded execution baselines and current IRR main; matches are stated in §§H/M.

### Tests/builds

No IRR main or IPD main tests/builds were run and no dependency was installed. One necessary G24 candidate test attempt was made on the extracted read-only IPD branch target:

```text
node --experimental-strip-types --test tests/g24_c_portfolio_durability.test.ts
```

It stopped before test discovery with `ERR_MODULE_NOT_FOUND` for `src/portfolio/durable-store.js`; **zero cases ran**. This is a harness/build-artifact prerequisite issue, not a G24 assertion failure or pass. The attempt was not repeated unchanged. No NP-04-common test was run.

All other execution counts in this record are attributed to the identified source qualification/certification/acceptance records, not to a fresh G0A run.

### Publication boundary

This governance record is intended to be committed and remotely verified only on `arena/01a10cce-iips-review-recovered`. The fixed session branch was not among the 91 IRR refs in the pre-publication snapshot. Any resulting branch proof identifies this record as branch-durable only; it does not claim publication to IRR `main`. The exact post-push commit/tree/blob and independent remote read are reported in the G0A completion receipt. No push to IRR `main`, IPD, or any other branch is authorized or performed.

**G0A disposition:** complete as an evidence pass and branch-scoped additive record; final classification remains the single disposition in §A. **G1: NOT STARTED.**
