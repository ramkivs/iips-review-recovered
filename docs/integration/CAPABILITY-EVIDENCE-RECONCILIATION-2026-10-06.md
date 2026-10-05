# IRR / IPD Capability Evidence Reconciliation

- **Record date:** 2026-10-06 (Asia/Kolkata)
- **Repositories:** `ramkivs/iips-review-recovered` (IRR) and `ramkivs/iips-production-market-data` (IPD)
- **Purpose:** Additive evidence reconciliation of six capability descriptions. This record supplements, and does not amend, `docs/integration/NP-BASELINE-G0A-2026-10-05.md`.
- **Scope:** Governance, source, test, execution-record, route, persistence, cross-repository package, ref, and tree/blob evidence.
- **Production:** Excluded.
- **Decision boundary:** No convergence baseline or source ref is selected or admitted. No G1 work begins.

> This is not a promotion, acceptance, certification, or implementation act. Where an underlying artifact records one of those statuses, the status is preserved only at its exact subject, scope, ref/tree, and environment. A source/test match does not prove a historical run; a report does not prove its own source binding; remote Git durability does not prove runtime-data durability.

## A. Result and individual classifications

The evidence supports four capabilities with bounded acceptance, qualification, or certification records (Dhan CSV import, G24, common persistence/Reports, and the Operator Drop synthetic path); the Reports qualification is branch-bound. IRR route protection is current but partial. The Phase 14.1 certification claim remains unbound: its named new implementation and test files are absent as tracked paths from every inspected advertised IRR ref and conflict with contemporaneous inspection/authority documents.

| Capability description | Final classification | Concise basis |
|---|---:|---|
| Dhan Web UI CSV import and multi-broker portfolio consolidation | **B** | Accepted offline Windows evidence is bound to exact implementation commits; the relevant importer, store, UI, and BI-08 test blobs are current on IPD `main`. The store is a process-local `Map`, so “committed/atomic” in the UI record does not establish restart durability or a database-backed import. |
| IPD durable portfolio store and `/api/ipd` boundary | **B** | Exact candidate source, requalification record, independent acceptance, and post-promotion acceptance exist on IPD branches. They bind to `6828155…`, not IPD `main`; the G24 “process restart” cases reopen handles in the same Node process, and live Keycloak / enterprise tenant authority remain outstanding. |
| Common governed persistence and the Reports product/API capability | **B** | Bounded non-production implementation authority was activated, and Reports was explicitly qualified against IRR `39dd43…` plus IPD `2e11fa…`. The qualification report claims real HTTP and separate-OS-process recovery, but its process harness/equivalence tools were untracked; no separate Reports acceptance act or current-main implementation was established. |
| Phase 14.1 workflow read surface | **D** | A current-main report says “implemented + certified” and names exact source/test paths, but none of its named new implementation/test paths is present as a tracked file in any of 92 advertised IRR refs. Current Phase 14 inspection documents say implementation was not authorized; current main has only the different `/api/admin/workflow` route. No execution coordinate or acceptance act binds the report to code. |
| Operator Drop synthetic offline fallback | **B** | P16 certification and P17 non-production signoff are source-bound to a current-main synthetic OQ path. That path is a one-record JSON simulation; it does not provide an HTTP/browser/API portfolio import, CSV parsing, portfolio persistence, or production failover. No separate Operator Drop acceptance act was found. |
| IRR server-route protection coverage | **C** | Current source implements and tests selected protected routes, alongside intentionally unauthenticated or development/reference routes. No route-wide protection inventory, universal authorization certification, or single current run covers all route families; one stale source comment claims a session-header mapping that the handler does not implement. |

### Classification key

- **A** — exact current implementation and durable evidence, independently evidenced execution, and explicit qualification plus acceptance for the bounded capability; no material scope contradiction. This is an evidence category, not a convergence decision.
- **B** — strong, exact-coordinate implementation and formal bounded acceptance, qualification, or certification evidence; a documented limitation (for example branch-only currentness, lack of separate acceptance, or a narrower execution scope) prevents extension beyond that recorded scope.
- **C** — substantive current implementation or test evidence, but a central status or coverage dimension remains open; no universal completion claim is established.
- **D** — a material source/ref/authority contradiction or missing source binding prevents the claimed capability from being established at the stated scope.
- **E** — no substantive supporting evidence, or direct evidence refutes the bounded core claim. No area receives E here because each has some relevant evidence.

No class by itself means “accepted,” “current on main,” “production-ready,” or “convergence-admissible.”

## B. Authority and review boundary

This review reconciles evidence only. It does not choose a product owner, architecture, package, database, shell, or identity authority.

- The IRR G-2 durable-portfolio decision assigns the user-portfolio domain to IPD, while stating that G-2 itself authorizes no implementation. The later IPD G29/G30/G31/G32 lineage is a separate, bounded governance path for the IPD portfolio candidate.
- The IRR branch-only common-persistence implementation-authority record (`IIPS_v3.0_NP04_COMMON_GOVERNED_PERSISTENCE_IMPLEMENTATION_AUTHORITY.md`, blob `29f1f23ce21faeab5ebcdf879aeee55e3f093cf0`, commit `3807184c5d180f5842db67d04d96d15b967d0b23`, tree `430c7d461875fb72e7578f1caa578b0f15940d63`) grants non-production authority for common governed persistence solely to support the NP-06 Reports P2 contract. It explicitly does **not** authorize Reports implementation, prescribe a technology, or authorize production.
- Reports later has its own branch-bound NP-06 R1 implementation-authority activation (details in §J). That activation is separate from the common-persistence authority and from qualification, acceptance, certification, release, and promotion.
- The current-main NP-04 boundary document (`docs/integration/NP-04-PERSISTENCE-DOMAIN-BOUNDARY-ACT.md`, blob `aeda90c77fc7cc913a6fe7907efec44483977baf`) physically appears on IRR `main`, but labels itself “ARENA TRANSFER COPY — NOT AUTHORITATIVE” and “PENDING AUTHORITATIVE PUBLICATION.” It says no current NP-04 owner/ref or technology is established and has no constitutive effect until its stated publication/verification sequence. Its physical presence is a Git fact, not a cure for its own stated authority boundary and not a revocation of the separate branch-bound acts.
- The Phase 14 inspection corpus is a governance lead, not implementation authority. The certification report is assessed against its named code/test paths and the contemporaneous Phase 14 documents, not by its “CERTIFIED” label.
- The IPD P16/P17 reports are assessed only for their explicit offline/non-production synthetic scope.
- This record creates no production authority, no implementation authority, no route/security approval, and no capability acceptance. It does not override any historical act.

## C. Evidence quality and status vocabulary

The labels below describe evidence quality, not product status.

| Label | Meaning |
|---|---|
| **SRC** | Directly inspected source, tree, Git ref, commit, or blob. |
| **TEST-SRC** | Tracked test definition and declared test case; not a claim that this review executed it. |
| **EXEC-REC** | A tracked execution/qualification/acceptance report records a result and an execution coordinate. The result remains a report unless raw logs or retained harness evidence are also available. |
| **GOV** | A governance, authority, qualification, acceptance, certification, or signoff act; effective only within its own scope and bound object. |
| **RECON** | Independently compared ref ancestry, source/test blobs, package contracts, or tree identity. |
| **UNBOUND** | A report claim lacks a source commit/tree, run coordinate, tracked harness, or other artifact needed to reproduce the claimed boundary. |

The following states are kept distinct throughout:

- **Implemented** describes code present at an identified ref; it does not prove it was executed.
- **E2E-proven** requires an identified execution to traverse the stated integration boundary. A unit test, source inspection, server handler test, visual-host report, and browser workflow are not interchangeable.
- **Runtime-durable** concerns saved application data surviving the relevant restart boundary. An in-memory `Map`, a database file, and a Git-remote artifact are different facts.
- **Current** means the relevant source is present at the observed current repository ref; a branch descendant or a report on `main` is not equivalent to source on `main`.
- **Qualified**, **accepted**, **certified**, **signed off**, and **promoted** are separate statuses and remain bound to their named implementation, tree, scope, and environment.
- **Convergence-admissible** is not granted or decided by this evidence-only record.

## D. Current refs and evidence dated 2026-10-04 through 2026-10-06

### Remote-ref snapshot at capture time

Pre-publication snapshot captured 2026-10-06: fresh direct `git ls-remote --refs` inventories matched the full bare mirrors by ref name **and object ID** at capture time. The fixed IRR session branch was at `1033d5a488b36a487774b312901a5c60a6070aed`; this additive record was not yet on that ref, so the manifest hashes below are the comparison baseline, not a post-publication manifest.

| Repository | Heads | Tags | PR refs | Total | SHA-256 of sorted direct-ref manifest |
|---|---:|---:|---:|---:|---|
| IRR | 54 | 2 | 36 | 92 | `e9ef5e6901c4a296fdf405776ab179ac839d60efa274ffa24e10f5e885b4a5e0` |
| IPD | 32 | 4 | 6 | 42 | `ac4f1eea752bc58fbf27b8706ea12e757a938de536da22ebc90055de4b1d425f` |

The IRR ref-count difference from the pre-publication G0A snapshot is the subsequently published fixed session branch, `arena/01a10cce-iips-review-recovered`; it is not a new implementation ref. The observed current tips are:

| Repository | Current `main` commit / tree | Current observation |
|---|---|---|
| IRR | `d0c6f80ef4b5732772b64a67ef15cdfc5a44e18a` / `a98000d3e5536a236bdca10e2265b3e14ad6a6cd` | Main contains the recent D08/Macro route records and the NP-04 transfer-copy boundary document. |
| IPD | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` / `db853dc21d01162e69b0e1211dbea1cb5c5f72b1` | Main remains the 2026-09-23 portfolio/market-data baseline; it has no G24 durable-store source and no common `./persistence` export. |

PR metadata showed IRR PRs #1–36 target `main`; IPD PRs #1–4 target `main` and #5–6 target `arena/01a0e6d9-iips-production-market-data`. No G24 PR was present in the IPD PR list. PR/ref placement is not acceptance or promotion.

### Recent dated records

- The all-ref IRR history contains numerous commits dated 2026-10-04 and 2026-10-05, including D115, NP-08/D08/Macro, and other governance records. Those records were not attributed to these six capabilities unless their artifact, source, route, or authority scope matched.
- The most relevant current-main records are the NP-04 boundary-copy commit `da949c2e8ff4d9460ed3957e1213a3332ea511f` (2026-10-05 local timestamp in Git) and the D08/Macro no-auth/throttle and provider-boundary decisions committed on 2026-10-05. The current Macro route is explicitly a narrow unauthenticated GET/HEAD boundary; it is not a universal route-security decision.
- The fixed-session G0A report is commit `1033d5a488b36a487774b312901a5c60a6070aed`, dated 2026-10-05T18:51:12Z. Its original file is preserved unchanged; see §S.
- No IPD commit on any inspected advertised ref is dated 2026-10-04 through 2026-10-06. The last IPD `main` commit is dated 2026-09-23. The six capabilities therefore have no newly observed IPD implementation or acceptance update in that two-day window.
- The G24 acceptance acts are dated 2026-10-01. The NP-06 authority/qualification records are dated 2026-10-02. The Phase 14.1 report has no stated execution date; its Git import commit is dated 2026-08-14, which is not asserted to be its test-run date.

No date is inferred where an artifact does not state one.

## E. Evidence-universe search and lead reconciliation

The inspection used full IRR and IPD mirrors and the matching live-ref manifests, not only filename matches. It covered advertised heads, tags, PR refs, ancestry, commit metadata, trees/blobs, governance/qualification/acceptance reports, source/test paths, package exports/pins, route composition, persistence callers, and the dated 2026-10-04–06 commit window.

A distinct six-capability “completion register” was not located in the advertised repository refs. The phrase search returned `docs/integration/IIPS_v3.0_FINAL_CONTINUATION_REPORT.md` in IRR, blob `d48dc56212b98d94562ba55d4aae2d8c0616799f`, commit dated 2026-09-04. That report concerns a ten-engine LTS continuation and does not establish any of the six statuses here. No IPD register match was found. Any register claim not bound to an inspected repository artifact remains a lead only.

The original G0A report was reread as another lead. Its cross-work findings were checked against the underlying source, test, execution, governance, and remote-ref objects described below. This record adds the six bounded inventories and matrices; it neither edits nor silently supersedes G0A’s separate overall disposition.

## F. Cross-repository component and persistence map

| Contract / component | Observed exact placement | Reconciliation |
|---|---|---|
| IPD `main` package | `4d3e1cd…`; `package.json` has no `exports` map and no persistence driver/export. | Not interchangeable with either persistence candidate. |
| IRR current dependency pin | IRR current package metadata pins IPD commit `0dab1221fb0f89e2e0601ea905d642bfe72d5f9c`. | Existing pin is not a selection for this review; no pin change occurred. |
| G24 portfolio candidate | IPD `arena/01a0e6d9…` and `arena/01a0f308…` at `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4`, tree `eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5`; uses `better-sqlite3@13.0.3`; exports PIT/D114 subpaths, not common `./persistence`. | User portfolios/tenancy and `/api/ipd` candidate. Not the Reports common store and not IPD `main`. |
| Common governed-persistence candidate | IPD `np04-governed-persistence-windows` at `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`, tree `7c1d516a43153f9c4e1b09bfa259d16da1704bb0`; uses `node:sqlite`/`DatabaseSync`; adds `./persistence`. | Separate NP-04 artifact/report persistence lineage. Not G24 and not IPD `main`. |
| Reports consumer | IRR branch `arena/01a0f1b3…`, implementation `39dd43ebbd54767c4258513a5dfc2d9c1b861d28`, tree `3fdc29d6775022c8ea586c58cf9a6f0e613911d6`; pins the common package at `2e11fa3…`. | Qualified branch execution is cross-repository and non-production; neither implementation is current on its repository’s `main`. |
| Dhan importer | Frontend code in IPD; local `.csv` selection and parsing followed by the frontend `PortfolioStore`. | No call from this path to the G24 `/api/ipd` service or common `./persistence` package was found. |
| Operator Drop | IPD `src/operator_drop` parser and `src/oq` synthetic fallback. | No browser/API/Dhan/portfolio-store caller was found; no persistence is performed by the fallback. |

The G24 and common-persistence trees are distinct descendants of the IPD baseline and expose different package/storage contracts. No merge, package selection, or runtime assembly is authorized here.

## G. Six-capability status roll-up

| Capability | Implementation | Execution evidence | Currentness | Runtime durability | Formal status observed | Main unresolved limit |
|---|---|---|---|---|---|---|
| Dhan CSV import/consolidation | Implemented for governed CSV variants. | Two offline Windows acceptance records; different commits/suite inventories. | Relevant source/test blobs are current on IPD `main`. | Frontend store is process-local `Map`; no process-restart proof. | BI-08 report says ACCEPTED; Phase 1B result says ACCEPTED. No separate certification act found. | No live Dhan API; no XLS/XLSX; “atomic commit” is not database durability. |
| Durable portfolio API | SQLite-backed candidate store and authenticated HTTP boundary. | G31-cited qualification summary, G32 record, and HTTP test source; no fresh run in this review. | Candidate branch only; absent IPD `main`. | Database/file implementation exists; tests close/reopen handles in same process, not an OS-process restart. | G31 cites a Phase-A requalification (labelled “G30” in that act); G31 and post-promotion acceptance bind to `6828155…` only. | Live Keycloak and authoritative tenant source/audit remain open; no mainline promotion. |
| Common persistence / Reports | `node:sqlite` package and Reports API implementation exist on specified branches. | NP06 R1 report says 44/44 P1 HTTP tests and 22/22 persistence tests; NP06 R2 reports 228/228 focused tests, live HTTP, and separate-process recovery. | Branch-only in both repositories. | Process-boundary recovery is reported; actual harness/equivalence equipment was untracked. Tracked NP-04 test restart scenario reopens in the same process. | NP06 R1 authority ACTIVATED; NP06 R2 qualification QUALIFIED. No separate Reports acceptance act. | No current-main source/package contract; no independent raw process transcript; canonicalization export limitation remains. |
| Phase 14.1 workflow | Certification report exists; named implementation files do not. | Report claims 506/506, 149 passed/28 skipped, 3/3 real-Keycloak, typecheck/build; no source-bound run record. | Report is current-main; named source/test files absent from all advertised IRR refs. | No report/definition persistence; underlying current `WorkflowRuntime` is in-memory. | Report labels itself CERTIFIED; no source-bound qualification or acceptance established. | Material source/authority contradiction and no exact code/run coordinate. |
| Operator Drop synthetic failover | Parser/fallback/OQ source current on IPD `main`. | P16 report says 20/20 OQ; test source directly invokes the synthetic fallback; three parser unit cases. | Current on IPD `main`; source blobs match P16 baseline. | Parser returns envelopes/report only; no portfolio or durable storage. | P16 package CERTIFIED; P17 non-production signoff. No separate Operator Drop acceptance act. | Synthetic JSON call path only; no HTTP/browser/CSV/portfolio failover. |
| IRR route protection | Selected server namespaces use `SecuredExecutor`; other routes are public or narrowly unauthenticated by design. | Route-specific test sources and bounded Phase 12/13/G3 reports; no fresh run in this review. | Current route source/tests on IRR `main`. | Not a persistence capability; route state is not shown to be durable. | Selected families have bounded certification records; universal route coverage is not qualified/accepted. | Public direct routes, incomplete route-to-test coverage, and stale session-header comment. |

## H. Dhan Web UI CSV import and portfolio consolidation

### Mandatory artifact inventory

| Evidence role | Artifact / exact coordinate | Quality and significance |
|---|---|---|
| Format/authority lead | `evidence/bi04/dhan-web-ui-summary-v1-schema.md` and `.json`; `evidence/bi08/idempotent-multi-broker-ingress-charter.md` and `.json` on IPD `main`. Charter effective date is 2026-09-22. | **GOV/SRC** — bounded offline CSV format and idempotency scope; not Dhan API authority. |
| Implementation | `frontend/src/features/portfolio/import/adapters/dhan-holdings-adapter.ts` blob `067ce99328b35acf05a46e37feb4b5abd9908d04`; `broker-import-ingress.ts` blob `12824fbb5bd7323e106616d0a03de76d408321fc`; `portfolio-store.ts` blob `abef96e13ed9f9ae2b0a69fb07aabff0b6bb330e`; `PortfolioWorkspace.tsx` blob `82cd8a9a6ddb9810c2ef21f5da933054558459c8`. | **SRC/RECON** — these four implementation blobs and the BI-08 ingress test blob listed below match at BI-08 `d1a813ce…`, Phase 1B `144e8edf…`, and current IPD `main`. |
| Automated test | `tests/bi08_idempotent_ingress.test.ts` blob `40b3cdf403f9f0f413ffc8dcafcc5ec5d2d24a13`; shell mount test `tests/shell_mount_bi08_route.test.ts` blob `8db82d6afbb66b49212a406a2c2a51fd38367aba`. | **TEST-SRC** — deterministic duplicate/content digest, multi-broker merge, UI controller, and render/navigation cases. Test definition is not a new execution. |
| Windows BI-08 result | `evidence/operator_drop/windows_bi08_visual_acceptance_manifest.md` blob `1b7a8d81354ec501efc87c3630a570343b0b124e`; JSON blob `bf119730b3370713442835e5dd6fd468a92ec868`; record commit `04bc9ad15d2e42168fd8eb45b5ab08766fef671e`, tree `46d8bc08d11f00a6d7d47b2247a095fbda0e509f`. | **EXEC-REC/GOV** — report says ACCEPTED and binds the run to implementation `d1a813ce746656376f4b3a6f0cb7682b741efce3`, tree `8a93a11c7fc8066414a24d42c2c185da4fabfb0c`; JSON timestamp `2026-09-22T12:25:00.000Z`; mode `NON_PRODUCTION / OFFLINE_FIXTURE_AND_WINDOWS_HOST`. |
| Phase 1B result | `evidence/operator_drop/phase1b_windows_visual_acceptance_20260922/phase1b-visual-acceptance-result.txt` blob `a99bfe44ff00c7f80728570a54d8b1c78c75e135`; evidence commit `ce7062aaf98793406926afd4ddc59758e51a9f19`, tree `c31c0deeb498c04a1548d50e52733b17ae591b4f`; `git-head.txt` and `git-status.txt` also tracked. | **EXEC-REC/RECON** — result says ACCEPTED at `144e8edf8d126a129ba4ed87dbd077765bd4051c`, tree `b5f0cb1808f82a10c97af5fd6e630fc2a57c430e`; run timestamp not recorded in the result. Status records detached HEAD and untracked evidence directories. |

### Reconciled scope and limitations

- The adapter declares `supportedFormats = ['csv']`. Dhan Web UI Summary CSV and detailed CSV variants are supported; `.xls`/`.xlsx` parsing is deferred. The UI reads the local file; no broker API is called.
- BI-08 record W01–W04 reports 82 Zerodha rows, duplicate no-op, 66 Dhan rows, 148 consolidated holdings, ₹9,82,769.63 and 100.0000% weights. Its JSON records the final state as `persistenceStatus: "COMMITTED (Atomic)"`.
- The actual `PortfolioStore` source uses `private portfolios: Map<string, PortfolioRecord> = new Map()` and a module singleton. `saveHoldings()` commits its in-memory state transition; no database/file/localStorage/IndexedDB backing is present in this store. Thus the report’s “atomic” disposition is not proof that holdings survive page/process restart.
- Phase 1B result says 360/360 across 54 suites; BI-08 says 360/360 across 39 suites. These are separate recorded suite inventories, not silently combined. Phase 1B’s `git-status.txt` shows detached HEAD and untracked evidence directories; no raw screenshot bundle was located in that tracked evidence directory.
- Both implementation commits are ancestors of IPD `main`; the selected code/test blobs match current main. This establishes current source identity, not a fresh rerun of the historical Windows execution. The evidence report’s accepted scope is offline/local-fixture UI import, not live provider access, production authentication, or process-restart durability.

## I. IPD durable portfolio store and `/api/ipd` boundary

### Mandatory artifact inventory

| Evidence role | Artifact / exact coordinate | Quality and significance |
|---|---|---|
| Domain boundary / fresh authority | IRR current-main `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md`, blob `7e83946b470bcc6f4751fb1a67e832ac66128c5c`, introduced by commit `b7ed35ee50b822e6976ae6df9e4e4297fa5804f4`, tree `d88b49357c64163008f2dfb52105626842053d7d`; IPD `evidence/np04/NP04-G29-FRESH-AUTHORITY-PHASE-A-ADOPTION-ACT.md`, blob `111a380a714d3beece90bef3040e9d381039a7bf`, commit `f4ceecb192f1d2e4ec7f67b6ac6615e71871eac8`, tree `1b5e153c25d27112cea4457a4dd7b830a002ab17` on `arena/01a0f839…`. | **GOV** — G-2 assigns IPD the user-portfolio domain and durable-persistence boundary, but is architecture direction only and grants no implementation authority. G29 authorizes adoption/revalidation of the surviving IPD candidate and later independent requalification, acceptance, and controlled promotion work; it does not itself qualify, accept, or promote the implementation. |
| Candidate implementation | IPD `arena/01a0e6d9…` and `arena/01a0f308…` at commit `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4`, tree `eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5`. `src/portfolio/durable-store.ts` blob `1c23f259f580ba1992d3848d8c8d222bbf9a9e6a`; `src/persistence/config.ts` blob `02090c191e8dd6e826106bdbe94cf65fedabaa72`; `src/server/http-server.ts` blob `17f9cb8a21cbabfc956daee660fa7efb5445da94`; `package.json` blob `385cc35a58422e5022073c8ce9fd78cdd6a9e22b`. | **SRC/RECON** — `better-sqlite3@13.0.3`, migrations, fail-closed startup, database path `IPD_PORTFOLIO_DB_PATH`, transaction-backed revisions, and an additive HTTP API exist at this branch coordinate. |
| G24 test source | `tests/g24_a_persistence_foundation.test.ts` through `tests/g24_h_http_boundary.test.ts`, plus `tests/g24_test_support.ts`; eight suites declare 10+10+13+13+9+15+4+10 = **84** cases. Example blobs: `g24_c` `d90d38d3cbf311d4987d8a7800a513cdded59aed`; `g24_g` `f70684c7bc9f80b8561d1cc16e14cc2fe3fc5f7d`; `g24_h` `2fb6fe806aab5c6be316db56a36940b9fe10e10d`. | **TEST-SRC** — source declarations and counts; no cases were run during this review. |
| Execution/authority summary | `evidence/np04/NP04-GOVERNANCE-AUTHORITY-RECORD.md`, blob `45d016e8d0443994dd356625113c4be6ebfda50c`, at candidate `6828155…`. | **EXEC-REC/GOV** — G32 record labels suite/full-suite totals `[ER]`, records 84/84 G24 and 782/0 full suite, and leaves tenant-authority/live-Keycloak/security-audit items open. It is a governance record, not a retained test transcript. |
| Acceptance | `evidence/np04/NP04-G31-PHASE-A-ACCEPTANCE-ACT.md`, blob `614994da55525e94d1d7c6d0880c55f65236bd5c`, commit `3a89c70e77a6172ee4f75aa9c5d2dc441f4543d0`, tree `7afb717a9cdd70454e8fadafb96106f57c866a7d`; `evidence/np04/NP04-POST-PROMOTION-ACCEPTANCE-ACT.md`, blob `f4e6715554768209375923ed222f48e1a2fdf2e0`, commit `12c480b5bf5cfbe0f296fcd12c9189328b915417`, tree `79e050231728405fb8a77d2e57374f4b9197754c`. | **GOV** — separate independent acceptance and post-promotion acceptance; both bind to candidate commit `6828155…`/tree `eb07ea…`, not IPD `main`. |
| Promotion authority / target | `evidence/np04/NP04-PROMOTION-AUTH-TARGET-DESIGNATION-AND-AUTHORITY-ACT.md`, blob `832003c6e31999d05df44951038b97862fae9961`, commit `2606185923f6cbd3f4df5c3af200f54d40ed4bbc`, tree `2fe41776249373a0bbe1980c895e50db6fc1e04d`. | **GOV** — designates `arena/01a0e6d9…` and authorizes a fast-forward from `0dab122…` to the accepted `6828155…`, subject to a separate execution gate. At this act’s recording, promotion is explicitly NOT PERFORMED; it does not designate `main`. |

### Reconciled scope and limitations

- The candidate exposes `GET /api/ipd/health` without a credential; all other `/api/ipd/*` paths pass through a verified-credential check. Collection and item paths support create/list/read/revisions/holdings save/reset/delete operations. The public health handler/test conflicts with G32’s broader “all routes authenticated” statement; both the specific route behavior and the report claim are preserved. This route is not present on IPD `main`, and no IRR caller was found.
- The HTTP tests create a local `http.Server` and a local test-owned JWKS service using generated keys and `https://keycloak.test/realms/ipd`; they do not contact a live Keycloak instance. Test calls bind to `127.0.0.1` in the harness.
- G30 results, as repeated in G31, record Node `v22.22.3`, Linux x64, `better-sqlite3@13.0.3`, 84/84 G24 cases, and 782/782 full suite. G31 says three full-suite runs; the G32 authority record says four. G31 also says it did not rerun qualification. The exact G30 execution timestamp, raw run IDs, and per-run logs are not present in the inspected tracked record.
- G31’s qualification summary says the G24 suite ran three times and the full suite ran three times. It also records four TypeScript errors, all present identically at baseline `0dab1221…` and none in NP04 files; `npm run build:tsc` exited 2 solely for those errors, while `npm run build:vite` exited 0. Its G30 probe history records 34 direct passes out of 36 initial checks, characterizes two non-passes as probe-assumption errors, then reports a corrected fail-closed probe at 7/7. These are historical report claims, not reruns here. The G32 record’s §6 instead says the full suite ran four consecutive times. The discrepancy is preserved; it does not erase the separate G31 acceptance act. There is also a gate-name collision: the G31 acceptance act calls “G30” the Independent Phase-A Requalification, while the consolidated G32 authority record uses “G30” for the Tenant Authority Investigation and Decision Packet. This report attributes qualification only to the exact G31-cited result; it does not infer status from the shared gate number.
- The tests named `G24-C10` and `G24-G1/G2` “process restart” close a connection/persistence handle and reopen the database file in the same Node process. The tracked `tests/g24*` files contain no child-process, `spawn`, `execFile`, `fork`, worker, or `process.execPath` probe. Their names do not independently prove an OS-process restart.
- The G31 and post-promotion acceptance records explicitly leave the implementation non-production. Promotion authority is a separate act: it designated `arena/01a0e6d9…`, authorized a fast-forward from `0dab122…`, and stated promotion was not yet performed at that act’s recording. The later post-promotion acceptance act reports that a separate `NP04-PROMOTION-EXEC` gate fast-forwarded `0dab122…` to `6828155…` and that a 12-item `NP04-POST-PROMOTION-VERIFICATION` gate established target/source identity. No standalone execution/verification report file was found in the advertised IPD trees; the act records those gate results, and the observed target and accepted refs both point to `6828155…` with `main` still at `4d3e1cd…`. The acceptance act itself explicitly does not perform a promotion or move `main`. Tenant administration, upstream tenant source of truth, membership audit/cross-system audit delivery, and live-Keycloak verification remain outstanding/deferred.
- The IPD G24 package line and the common `node:sqlite` line are not equivalent persistence packages. G24 exports no common `./persistence` surface. Neither is admitted to IPD `main` or to a cross-repository baseline here.

## J. Common governed persistence and Reports capability

### Mandatory artifact inventory

| Evidence role | Artifact / exact coordinate | Quality and significance |
|---|---|---|
| Reports governance | `IIPS_v3.0_NP06_REPORTS_GOVERNANCE_DECISIONS.md`, blob `15a6fe888727fc5e26e354ecd8a6e9fd99f510e1`, commit `4a4bc1fc4dd8aa1069f39bd947574f0e1184eafc`. | **GOV** — records product/ownership/lifecycle contract and initially withholds implementation authority pending P1/P2. |
| Common-persistence authority | IRR branch `arena/01a0f1b3…`: `IIPS_v3.0_NP04_COMMON_GOVERNED_PERSISTENCE_IMPLEMENTATION_AUTHORITY.md`, blob `29f1f23ce21faeab5ebcdf879aeee55e3f093cf0`, commit `3807184c5d180f5842db67d04d96d15b967d0b23`, tree `430c7d461875fb72e7578f1caa578b0f15940d63`. | **GOV** — grants bounded non-production common-persistence implementation authority for Reports P2; does not authorize Reports implementation or select technology. |
| Reports authority activation | `PROGRAM_v3.0_NP06_REPORTS_IMPLEMENTATION_AUTHORITY_ACTIVATION.md`, blob `b5302c5b9172f73a742b03e7c5c863e732a0e3bc`, commit `8548c1e00292acba907c2fdbe4c4ebb250c4d408`, tree `229c3f78ce77ff8d2beda837f4b13adc4dc79392`, dated 2026-10-02. | **GOV** — separate NP-06 R1 act says P1/P2 satisfied and activates bounded non-production Reports implementation authority. It is not qualification or acceptance. |
| Common package | IPD branch `np04-governed-persistence-windows` at `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`, tree `7c1d516a43153f9c4e1b09bfa259d16da1704bb0`; `src/persistence/db.ts` blob `6e863996c42bf929f1f2b8b1e9374cb731410c78`; `store.ts` `b4350fea5585800398e10e81039be60edc4697b2`; `schema.ts` `89b86a366804d60ebebaa6771f04dd8c6ab89286`; `package.ts` `9376899940a7ac5070fbbda6ec7ad88737c37e22`; `tests/np04_governed_persistence.test.ts` `d023f6272de60e07bf8397bad3b9c501a0133c8e`. | **SRC/TEST-SRC** — `node:sqlite`/`DatabaseSync`; package exports `./persistence`; 22 declared tests. The tracked restart scenario closes and reopens the DB handle within one Node process. |
| Reports implementation | IRR branch `arena/01a0f1b3…`; qualified implementation commit `39dd43ebbd54767c4258513a5dfc2d9c1b861d28`, tree `3fdc29d6775022c8ea586c58cf9a6f0e613911d6`; branch tip `6a8afbb2bb73ca02d2b22e6f45e9f7d27a4a4b9b`, tree `0e25371229eff5cb8ae4e6bdc2615260ddf0629c`. `reports-transport.ts` blob `cdee7ed16b461b058f6ed117c41380b497a6a9d6`; `reports-api.test.ts` `9cc52dc6dd1824738e553727b22284c59af45847`; `reports-transport.test.ts` `4ae07780541a03a94fac01ef0e38380eb652919e`; `reports/persistence.ts` `49f203069bac5aed726a1483317ca4afa2963991`. | **SRC/RECON** — all named Reports source paths are absent from IRR `main` and are branch-only. |
| Final qualification | `PROGRAM_v3.0_NP06_REPORTS_FINAL_QUALIFICATION.md`, blob `36fdf6d82a958c8e44eaf7695e8f08573498e33b`, commit `6a8afbb…`, dated 2026-10-02. | **EXEC-REC/GOV** — explicitly QUALIFIED at the IRR/IPD coordinates above. It is not a Reports acceptance act, certification, release, or production authorization. |

### Reconciled execution and scope

- NP-06 R1 activation records that its P1 dependency included 44/44 executed HTTP security tests and its P2 package checkpoint `bd5229d01955feb0757bb1aa33252f9dc49dd68f` had 22/22 persistence tests. The tracked persistence test blob `d023f627…` and the `db.ts`, `store.ts`, and `schema.ts` blobs are unchanged between `bd5229d…` and final package commit `2e11fa3…`; the final package commit adds its package export surface. This preserves the exact distinction between the recorded 22-test run coordinate and the later consumer package coordinate.
- The NP-06 R2 qualification report binds the Reports implementation to `39dd43…`/tree `3fdc29…` and IPD common persistence to `2e11fa…`/tree `7c1d516…`. It reports 228/228 focused Reports tests across five files, `tsc --noEmit` exit 0, 14/14 golden vectors, and full regression 543 passed / 2 failed / 25 skipped. It identifies the two regression failures as pre-existing. These are report claims at the stated coordinates; this review did not rerun them.
- The report describes real HTTP using the real Reports handler, `SecuredExecutor`, the live persistence composition path, and a real SQLite file. Its OIDC mechanism is explicitly a deterministic token-to-claims stand-in because no Keycloak instance was present in that qualification environment.
- The strongest durability claim says Process A created/appended via HTTP and exited, then Process B as a separate OS process re-resolved the same DB path, recovered versions byte-identically, continued the chain, and preserved cross-owner isolation. However, the report’s appendix says the `phase-a.test.ts`, `phase-b.test.ts`, equivalence scripts, and related equipment were “never committed” and retained untracked in the workspace. No retained raw process logs or database evidence bundle is present in the cited Git tree. The claim is source/commit-bound by the report but not independently reproducible from tracked harness artifacts in this review.
- The current-main boundary transfer copy’s statement that no current NP-04 owner/ref/technology is established remains a separate, physically present but self-limited artifact. It does not erase the explicit branch-bound NP-06 R1/R2 decisions; neither does the branch-bound authority/qualification make the implementation current on IRR/IPD `main`.
- No separate Reports acceptance act was established. Qualification is preserved as qualification; it is not upgraded to acceptance. The common persistence package itself is not accepted by the Reports qualification as a universal NP-04 architecture or as the G24 package.
- Reports UI/navigation/export and sector-level reporting are explicitly outside NP-06 qualification. Production, deployment, and production identity are excluded. The canonicalization export limitation is recorded, not solved.

## K. Phase 14.1 workflow read surface

### Mandatory artifact inventory

| Evidence role | Artifact / exact coordinate | Quality and significance |
|---|---|---|
| Certification claim | Current-main `docs/v3.0/phase14/PROGRAM_v3.0_PHASE14.1_CERTIFICATION.md`, blob `5d23073cf2a91fc227b8d8cc71af501f91eae913`, commit `c65d53373717aacc3a1dce12d47b5aeaf50541a5`, tree `8117a270243a6520a2b42665eecde395d88e246f`. | **UNBOUND/EXEC-REC** — report says CERTIFIED, `/api/workflow`, real-Keycloak 3/3, platform 506/506, frontend 149 passed/28 skipped, clean typecheck and successful build. It gives no implementation commit/tree, run ID, run timestamp, or separate acceptance act. |
| Claimed source inventory | `frontend/src/api/workflow.ts`; `frontend/server/workflow-transport.ts`; `frontend/src/features/workflow/WorkflowView.tsx` and `.test.tsx`; `frontend/server/workflow-transport.test.ts`; `frontend/server/live/workflow-live-certification.test.ts`; claimed changes to existing `frontend/server/executive-transport.ts`, `frontend/src/app/routes.ts`, `frontend/src/app/navigation.ts`, and `frontend/src/app/App.tsx`. | **UNBOUND** — none of the named new Phase 14.1 implementation/test paths is present as a tracked file in any of **92** advertised IRR refs (54 heads, 2 tags, 36 PR refs); edits claimed to existing transport/navigation files are not treated as proof of the absent workflow surface. |
| Conflicting authority/scope documents | `docs/v3.0/phase14/README.md`; `phase14-recommendation.md`; `capability-matrix.md`; `authority-and-security-map.md`; all current-main. | **GOV/SRC** — each describes Phase 14 as inspection only, says “no implementation,” and states Phase 14.1 implementation was not authorized absent explicit authorization. |
| Current adjacent implementation | `iips-platform/src/distributed/WorkflowRuntime.ts` blob `2bdb44229c1253dc29f938ea9fd3a512cd8d5b8a`; `frontend/server/admin-transport.ts` blob `f423d64e412c1dca288d834382e755a1d6b6c3da`; `frontend/server/executive-transport.ts` blob `535211cfceb78c146bf0d5982348ad78637f15b6`. | **SRC/RECON** — current main has an in-memory `DeterministicWorkflow` and a guarded `/api/admin/workflow` definition read, not the report’s `/api/workflow` viewer/analyst route. |

### Reconciled status

The certification report itself is durable on current IRR `main`; the named implementation/test files are not present as tracked paths on any advertised branch, tag, or PR ref. The current route is `/api/admin/workflow`, protected by the admin guard and intended as an admin snapshot. It is not the claimed Phase 14 `/api/workflow` surface. The report’s “external backup remains recovery authority” sentence is not a repository source/tree binding. No actual Phase 14.1 code, test, run coordinate, implementation authority act, or separate acceptance act was established. The report’s status word is preserved as a historical report claim, not accepted as proof of current implementation or certification.

## L. Operator Drop synthetic offline fallback

### Mandatory artifact inventory

| Evidence role | Artifact / exact coordinate | Quality and significance |
|---|---|---|
| P16 certification | IPD `evidence/p16/p16-certification-report.md`, blob `c404698ea67ea22593cfca8b07e915fd4f8a9abe`; JSON blob `774ef79a7c89985373ca11343568caabe35b6748`. Certification commit `96814fdf1d5140b545132dc32e93a5d816acee21`, tree `eb319f478ed21eae7ac8f1bb7e5d1e1a8d1044c4`, parent/source baseline `854aa08868c3e9f49ca6e60560b3fbbc16c47a15`, tree `802d9ac807579e531ae58db704adebacd5982fc7`. | **EXEC-REC/GOV** — reports P16-CERT CERTIFIED, timestamp `2026-09-21T07:30:00.000Z`, 20/20 OQ checks, 6/6 P16 tests, 191/191 total tests, all in offline/local-fixture mode. |
| Current implementation | `src/operator_drop/parser.ts` blob `c9950cd08f9cf9acc0b7e6a44789e76c57b1c971`; `src/oq/synthetic_failover.ts` `89a3ac6be71f7a75390120a62213ec93ffaf4671`; `src/oq/oq_suite_runner.ts` `916b10ca4c16c75fe94c06127ac8ae100b866eeb`; all match at source commit `854aa…`, certification commit `96814…`, and IPD `main`. | **SRC/RECON** — present on current IPD `main`. |
| Test sources | `tests/wsg_p16_operational_qualification.test.ts` blob `70dce59f09f38aff0bff7f606b7a6f86f6adfafb`; `tests/wsb_operator_drop.test.ts` `1ef0fd7f4e0fa1beb32550e2182725412136433a`. | **TEST-SRC** — P16-05 invokes the 20-point runner; parser suite has three JSON/checksum cases. |
| Broader signoff | `evidence/p17/p17-certification-report.json`, blob `84d17268cbdbc6533cb06cddd49d0a55f79e37ee`, on IPD `main`; source SHA prefix `96814fd` (resolves to commit `96814fdf1d5140b545132dc32e93a5d816acee21`); signoff timestamp recorded as `2026-09-21T07:45:00.000Z`. | **GOV/EXEC-REC** — non-production release signoff for the offline release candidate; expressly not production authorization or external-provider activation. |

### Reconciled path behavior

- OQ-17 in `OQSuiteRunner` constructs a one-record JSON string, calculates its checksum, and directly calls `SyntheticFailoverCircuits.handleOperatorDropFallback()`. It passes when the report says isolation is verified and quality is `GOOD`.
- P16-04 directly tests provider isolation and rollback; the Operator Drop call is exercised indirectly by P16-05’s OQ runner. The OQ is an in-process synthetic path, not an HTTP/browser test.
- `OperatorDropParser` hashes `rawContent`, uses `JSON.parse`, passes records through `IngestionPipeline`, and returns envelopes/summary. The interface comment says “Serialized JSON or CSV,” but implementation calls `JSON.parse`; CSV input is not supported by that parser. The three parser tests cover a valid JSON/checksum, a checksum mismatch, and malformed JSON.
- `handleOperatorDropFallback()` reduces parser output to a `FailoverEventReport`; it does not save the envelopes to `PortfolioStore`, G24 storage, NP-04 persistence, or any database. Repository search found no browser, HTTP API, or portfolio caller of this fallback/parser path.
- P16 certification includes a synthetic fallback in its bounded package scope; P17 records a broader non-production signoff. Neither act proves production failover, live-provider isolation, a Dhan CSV workflow, or a separate feature-specific acceptance.

## M. IRR server-route protection coverage

### Mandatory artifact inventory

| Evidence role | Artifact / exact coordinate | Quality and significance |
|---|---|---|
| G3 live certification | `docs/v3.0/g3-build/PROGRAM_v3.0_G3_LIVE_CERTIFICATION.md`, blob `9655647e2531ffd81ead13964b34c8cfc9fdce3b`. | **GOV/EXEC-REC** — bounded report says 8/8 local real-Keycloak G3 tests; the environment used deterministic local data and does not certify all HTTP endpoints. |
| Admin certification | `docs/v3.0/phase12/PROGRAM_v3.0_PHASE12_1_CERTIFICATION.md`, blob `4223cc9f393458ad294d57fc2f4f8cc7a80bb83e`; report claims a local Keycloak HTTP run (7/7 for its Phase 12.1 scope). | **GOV/EXEC-REC** — bounded `/api/admin/*` surface only. |
| AI-advisory certification | `docs/v3.0/phase13/PROGRAM_v3.0_PHASE13.2_CERTIFICATION.md`, blob `211d8d9f8e7a3042ab32d2962df1dcf7f8edf67c`. | **GOV/EXEC-REC** — bounded `/api/ai-advisory/*` surface; report says 4/4 real-Keycloak tests. |
| Current composition/source | `frontend/server/executive-transport.ts` blob `535211cfceb78c146bf0d5982348ad78637f15b6`; `admin-transport.ts` `f423d64e412c1dca288d834382e755a1d6b6c3da`; `ai-advisory-transport.ts` `0792a6a4ef32d6127f38d01358b0fd5c837b44c6`; `pit-transport.ts` `22ed557ddd61da8ac4d931534641344bf612c4b7`; `secured-executor.ts` `69b54e028c9811fdab88b9ade58fca3ba2e470c7`. | **SRC** — all at current IRR `main`. |
| Current route/test sources | `engine-transport.test.ts` 6 cases; `product-transport.test.ts` 10; `admin-transport.test.ts` 19; `live/admin-live-certification.test.ts` 13; `ai-advisory-transport.test.ts` 4; `live/ai-advisory-live-certification.test.ts` 4; `pit/pitReadBoundary.test.ts` 48; `macro/macro-transport.test.ts` 14; `secured-executor.test.ts` 5. | **TEST-SRC** — declarations are tracked; this review did not execute them. The live admin/AI suites probe a Keycloak URL and skip when it is unavailable; their existence is not evidence that they ran in this review. |

### Current route inventory

| Current IRR route family | Current observed policy | Test/evidence boundary |
|---|---|---|
| `/api/admin/*` | `createLiveAdminExecutor()` uses Keycloak/OIDC and `SecuredExecutor`; admin role guard; exact `/api/admin/data-governance/classify` POST is the authorized mutation. Other matching admin paths return read-only payloads, but there is no global GET-only method gate. No IdP configured → 401. | Mock/injected transport tests plus environment-dependent live Keycloak test source and bounded Phase 12 report. Not universal route coverage. |
| `/api/ai-advisory/*` | OIDC/SecuredExecutor read gate; viewer/analyst/admin read roles; non-authoritative response and no mutation path. The handler has no GET-only check, so a matching URI accepts non-GET methods with the same read behavior. | Unit/transport plus environment-dependent live Keycloak test source and bounded Phase 13 report. |
| `/api/pit/market-data` | Non-production, exact route/parameter validation, GET-only, no authentication gate. | 48 test declarations include real server composition/method checks; no auth test because this is the recorded narrow read boundary. |
| `/api/macro/{NAS,CPI,IIP}` | Intentionally unauthenticated, throttled GET/HEAD, exact dataset matching; narrow D08 route, no entitlement or production implication. | 14 handler/transport test declarations; not an authorization suite. |
| `/api/engines` and `/api/engines/:id/execute` | Public registry and direct engine dispatch; no `SecuredExecutor` in this route branch. | Six HTTP-style engine tests exercise dispatch/validation, not universal authentication. |
| `/api/health`, `/api/executive`, `/api/replay/*`, `/api/evidence/*`, `/api/decision-matrix`, `/api/cross-sector`, `/api/portfolio`, `/api/company/*` | Direct development/reference/snapshot handlers do not pass through the admin/AI executor. They are not uniformly authenticated, and the dispatch is largely URL-based rather than consistently method-restricted. | Ten product transport cases and other route-specific tests cover returned reference data/404/determinism, not universal auth. |
| Global pre-routing behavior | `Access-Control-Allow-Origin: *`; `OPTIONS` returns 204 before route dispatch. | CORS and preflight behavior do not authenticate requests. |
| `/api/reports/*` | No such route on current IRR `main`; branch-only NP-06 route described in §J. | Branch-only Tests/report are not current-main route evidence. |
| `/api/workflow` | Not present on current IRR `main` or any advertised ref as implementation. Current `/api/admin/workflow` is a distinct admin-guarded route. | Phase 14.1 test file absent from all refs; see §K. |

The `executive-transport.ts` header comment says a session header is accepted and mapped to a role, and some handlers repeat “minimal dev-mode session mapping.” Static source inspection found no `req.headers`, session-header, authorization, or role extraction in those direct handlers. The implementation and comments therefore disagree; the comment is not a guard.

The route-level records for G3, Phase 12, and Phase 13 are preserved at their own bounded scope. They do not establish universal protection for all current IRR paths. Public/reference or explicitly unauthenticated routes are recorded as policy facts, not automatically classified as vulnerabilities. There is no universal route-to-test acceptance or certification artifact in the inspected evidence.

## N. Currentness, durability, qualification, and acceptance matrices

### Source and durability

| Capability | Source current on authoritative `main`? | Git artifact durable? | Runtime-data durability established? |
|---|---|---|---|
| Dhan CSV import | **Yes** — relevant importer/store/UI/BI-08 test blobs match the accepted `d1a813ce…` and `144e8edf…` source coordinates on IPD `main`. | **Yes** — source and acceptance records are on IPD `main`. | **No** — the frontend holdings store is an in-memory `Map`/module singleton; page/process restart is not proven. |
| G24 durable portfolio API | **No** — exact implementation exists on IPD candidate refs; IPD `main` remains `4d3e1cd…`. | **Yes, branch-scoped** — candidate and acceptance acts are on advertised IPD refs. | **Partly** — SQLite/file persistence and same-process close/reopen are tested/reported; separate OS-process restart E2E is not established by the tracked G24 test source. |
| Common persistence / Reports | **No** — IPD package and IRR Reports implementation are on separate non-main branches. | **Yes, branch-scoped** — authority, activation, qualification, implementation, and package are in remote refs. | **Reported yes for Reports** at the specified package/run coordinate; the OS-process harness is untracked, so this review cannot independently reproduce the claim from Git. |
| Phase 14.1 workflow | **No** — only the report is on current main; its named source paths are absent from every advertised ref. | **Report yes; implementation no.** | **No** — the report describes only a read surface; no durable workflow definition store is shown. |
| Operator Drop synthetic fallback | **Yes** — parser/fallback/OQ source and tests match current IPD `main`. | **Yes** — code, P16/P17 reports, and tests are on IPD `main`. | **No** — the path returns a report/envelopes in memory and does not persist the drop to a portfolio store. |
| IRR route security | **Yes, selectively** — current route code/tests on IRR `main`. | **Yes** — current source and bounded certification reports are on IRR `main`. | **Not a data-durability claim.** Route protection itself is mixed by family; universal coverage is not established. |

### Execution, qualification, acceptance, certification, promotion

| Capability | Exact execution coordinate and E2E quality | Qualification | Acceptance / certification / promotion |
|---|---|---|---|
| Dhan CSV import | BI-08 run: implementation `d1a813ce…` / tree `8a93a11…`; JSON timestamp `2026-09-22T12:25:00Z`. Phase 1B: `144e8edf…` / tree `b5f0cb…`; no run timestamp in result. Both are offline Windows-host reports; raw visual bundle not found. | BI-08 calls cross-environment status “RECONCILED”; no separate qualification act found. | BI-08 report and Phase 1B result each say ACCEPTED at their own scope. Source is now on IPD `main`; no separate production promotion or live-provider act. |
| G24 durable portfolio API | Requalification result is reported at `6828155…` / tree `eb07ea…`; execution date/run IDs/raw logs not stated in the tracked record. HTTP tests use local generated JWKS; restart tests use same-process reopen. | G31 cites its Phase-A requalification as “G30”; the separate gate-name collision and test-run-count discrepancy (three vs four full-suite runs) are retained. | G31 independently accepts the candidate; a later act reports fast-forward promotion to target `arena/01a0e6d9…` and post-promotion verification, with target/source at `6828155…`. IPD `main` remains `4d3e1cd…`; no production certification. |
| Common persistence / Reports | NP06 R2 report date 2026-10-02; implementation `39dd43…` / tree `3fdc29…`; IPD dependency `2e11fa…` / tree `7c1d516…`. Real HTTP and separate OS process are reported; raw harness untracked. | NP06 R2 explicitly QUALIFIED, non-production. Common package’s 22-test recorded run was at `bd5229…`; tracked test and core store/schema blobs remain unchanged at `2e11fa…`. | NP06 R1 explicitly ACTIVATED implementation authority. No separate Reports acceptance act or certification/release act established. No current-main promotion. |
| Phase 14.1 workflow | Report gives no code SHA/tree, execution timestamp, run ID, or retained harness. Its test/source paths are absent across 92 advertised refs. | No source-bound qualification established. | Report claims CERTIFIED; not independently source-bound. No separate acceptance act or promotion established. |
| Operator Drop synthetic fallback | P16 report timestamp `2026-09-21T07:30:00Z`; source baseline `854aa088…` / tree `802d9ac…`; P16 record commit `96814fdf…` / tree `eb319f47…`. The OQ-17 call is in-process synthetic JSON. | P16 package certification says 20/20 OQ and six P16 cases; source/test blobs match current IPD `main`. | P17 records non-production release signoff at `07:45:00Z`; no separate Operator Drop acceptance act and no production authorization. |
| IRR route security | Current source is IRR `main` `d0c6f80…`; test files are source definitions, not runs performed in this review. Bounded G3/Phase12/Phase13 reports claim previous local-Keycloak execution for their own scopes. | Selected G3/admin/AI families have bounded certification claims; PIT/Macro are route-specific read boundaries. No universal route qualification. | No route-wide acceptance/certification/promotion act. Public reference endpoints and intentional unauthenticated PIT/Macro posture remain as recorded. |

## O. Cross-work reconciliation and material contradictions

1. **CSV import is not G24 durability.** The BI-08 importer saves through IPD’s frontend `PortfolioStore` (`Map`). The durable SQLite store is a separate G24 candidate API under `src/portfolio/durable-store.ts` and `/api/ipd`, absent from IPD `main`. No call from the importer to that API was found. “COMMITTED (Atomic)” in BI-08 is not a process-restart claim.
2. **G24 is not the common Reports store.** G24 uses `better-sqlite3@13.0.3`, portfolio/tenant APIs, and the `/api/ipd` boundary. The common Reports package uses `node:sqlite` and a five-operation governed-artifact interface under `./persistence`. Different refs, technology, package exports, ownership contracts, and acceptance evidence are preserved.
3. **Reports qualification does not accept NP-04 generally.** NP06 R1 grants bounded Reports implementation authority after P1/P2 evidence; NP06 R2 qualifies a particular IRR implementation against a particular IPD package. It does not establish Reports acceptance, certify the common-persistence architecture generally, or make either implementation current on `main`.
4. **Workflow report is not current admin workflow source.** The report claims a viewer/analyst `/api/workflow` G3 surface; all named source paths are absent. Current `/api/admin/workflow` is under the admin guard, is sourced from an in-memory snapshot, and has a different route and access policy.
5. **Operator Drop is not the Dhan CSV path.** The P16 synthetic fallback builds JSON and calls a parser that uses `JSON.parse`; it has no portfolio save or UI/API caller. Dhan BI-08 is an offline CSV import into the frontend map store. The word “operator” or “drop” does not connect the two systems.
6. **Route security does not transfer between repositories or capabilities.** IRR admin/AI use `SecuredExecutor`; current reference endpoints, PIT, Macro, IPD G24, branch-only Reports, and the absent Phase 14 route have different policies. A bounded auth report for one family cannot certify the others.
7. **Execution counts are kept separate.** Dhan BI-08’s 39-suite and Phase 1B’s 54-suite reports are distinct. G24 G31’s three full runs and G32’s four are inconsistent claims. NP06’s 228/228 focused result is distinct from the full regression 543/2/25 and the 22-test common-persistence record. No count is merged or rerun here.
8. **Physical Git presence is not constitutive authority.** The current-main NP-04 boundary copy and current-main Phase 14.1 report are physically durable files, but the boundary copy disclaims authority/effectiveness and the Phase 14.1 source binding is absent. The record text is preserved, not silently elevated.

## P. Unresolved evidence and decision needs

These are evidence gaps, not new implementation requests.

- **Dhan:** no browser reload/process-restart evidence or durable backing for the current `PortfolioStore`; no live Dhan API/entitlement; XLS/XLSX remains deferred.
- **G24:** tracked tests do not spawn a second OS process; raw G30 per-run logs/IDs are not in the cited record; full-suite run totals conflict (three versus four); live Keycloak and authoritative tenant source/administration/audit remain outstanding; current IPD `main` does not contain the candidate.
- **Common persistence/Reports:** no tracked process-A/process-B/equivalence harness; no independent raw database/process transcript; no separate Reports acceptance; source/package remains branch-only; the NP04 canonicalization export limitation remains; current-main NP-04 transfer copy states no current owner/ref/technology is established and is itself pending effectiveness verification.
- **Workflow:** no named source or test path on any advertised ref; no bound implementation commit/tree or execution coordinate; conflict with the “inspection only / not authorized” Phase 14 documents; no acceptance act.
- **Operator Drop:** no CSV parser in the current JSON-only code path; no HTTP/browser/portfolio integration or durable persistence; no Operator Drop-specific acceptance; no production scope.
- **Routes:** no universal route-to-test inventory or universal coverage acceptance; current direct public routes have no shared auth guard; the session-header comment is unsupported by request-header handling; conditional live-Keycloak test source does not show that it ran at current `main`.

Any future resolution requires its own authority. This record does not authorize source changes, a package pin, route work, persistence selection, or new tests.

## Q. Convergence boundary

No branch, tag, PR ref, package, or source tree is made convergence-admissible by this record. Current `main` refs are used as observations of current repository content only. Branch-only qualification or acceptance remains valid at its stated coordinate but is not described as current-main publication.

Specifically, this record does not select either IPD persistence line, does not bind the Dhan importer to G24, does not admit the NP-06 consumer/package pair into current main, does not recover the claimed Phase 14.1 implementation, does not integrate Operator Drop with the portfolio path, and does not establish universal IRR route security. No shell/baseline is selected; no merge, cherry-pick, package-pin change, branch promotion, or G1 work occurs.

## R. Explicit exclusions

This review does **not** authorize or perform production activity, external-provider contact, deployment, live broker or market-data activation, licensing/redistribution/caching/retention, live tenant administration, new OIDC/Keycloak configuration, identity-source implementation, persistence selection, schema/API/route/UI changes, dependency/package-pin changes, feature integration, branch merging/rebasing/cherry-picking, shell selection, convergence, or G1.

Historical implementation and acceptance records are preserved at their evidenced scope. No prior record is edited, deleted, or reclassified.

## S. Evidence ledger, execution limits, and record integrity

### Evidence ledger

- Fresh direct ref manifests and their full-mirror object mappings are recorded in §D. Advertised tags, PR refs, branch ancestry, relevant commit trees, and source/test blobs were inspected. Named Phase 14.1 implementation/test paths were checked as tree entries across all 92 advertised IRR refs; none is present.
- Dhan evidence includes the BI-04 Dhan CSV schema, BI-08 charter, current adapter/controller/store/UI, BI-08 Windows result, Phase 1B result/head/status, and ancestry/blob comparisons.
- Durable portfolio evidence includes the exact G-2 decision and G29 fresh-authority act, IPD G24 source/tests, G32/G31/post-promotion acts, run-count/environment claims, and current IPD main comparison.
- Reports evidence includes NP-06 G09 governance, NP-04 common-persistence implementation authority, NP-06 R1 activation, the IPD common-persistence package/test, NP-06 R2 qualification, current-main NP-04 boundary copy, and the cross-repository package pin.
- Workflow evidence includes the current-main certification report, its named absent paths, current Phase 14 inspection/authority documents, current `WorkflowRuntime`, and the distinct admin route.
- Operator Drop evidence includes P16/P17 records, parser/fallback/OQ source, parser/P16 test sources, current-main blob comparison, and caller search.
- Route evidence includes current composition, admin/AI/PIT/Macro transports, `SecuredExecutor`, source test declarations, and bounded G3/Phase 12/Phase 13 reports.

### Test/build limits

No tests or builds were run in this reconciliation. Test counts and outcomes in this record are attributed to the exact historical reports/acts named, not to a fresh run. Static test declaration counts describe source only.

The prior G0A G24 candidate attempt was not repeated: `node --experimental-strip-types --test tests/g24_c_portfolio_durability.test.ts` stopped before test discovery with `ERR_MODULE_NOT_FOUND` for `src/portfolio/durable-store.js`; zero cases ran. This is a build-artifact prerequisite failure, not a G24 assertion failure or pass.

### Original-record integrity and additive boundary

The original `docs/integration/NP-BASELINE-G0A-2026-10-05.md` remains unchanged: 45,510 bytes, raw SHA-256 `8f754828580546d4e40894266d737ee57900688894a643b9f489e97560447fc7`, Git blob `b2b8cd98255dd30525fcb1a065455bee5cd897e2`. This reconciliation is a separate additive file. No source/runtime file, test, package, or prior governance artifact is changed by this record.

**Record disposition:** six capability inventories and independent A–E classifications complete. The only repository change authorized by this record is its own additive publication on the fixed session branch `arena/01a10cce-iips-review-recovered`. No convergence or G1 work is included.
