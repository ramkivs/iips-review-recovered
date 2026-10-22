# IIPS v3.0 — CAP-02 Authority Traceability and UI-to-Durable-Store Transport Review

| Field | Value |
|---|---|
| **Prepared record ID** | `IIPS-V3-CAP02-AUTHORITY-TRANSPORT-REVIEW-2026-10-23-01` |
| **Record type** | Current-source investigation, path-level authority assessment, and bounded transport recommendation |
| **Status** | **INVESTIGATION COMPLETE — TRANSPORT NOT IMPLEMENTED — PA DECISION BELOW IS PROPOSED / NOT EFFECTIVE** |
| **Prepared date** | `2026-10-23` |
| **Authoritative record repository** | `ramkivs/iips-review-recovered` |
| **IPD evidence baseline** | `ramkivs/iips-production-market-data` `refs/heads/main@73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2` (tree `66020736919befa5e5320550a396187cd351b40e`) |
| **IRR evidence baseline** | `ramkivs/iips-review-recovered` `refs/heads/main@922fdc78e14d036588e4208bdc9f5d8ff84b4a1a` |
| **Decision authority** | Ramki — Program Authority; this recording and recommendation render **no** PA decision |
| **Scope** | CAP-02 only: broker-import UI → IPD-owned durable portfolio persistence. No CAP-03 implementation or status change. |

> **No implementation, write enablement, identity/mapping change, schema/migration change, Gate movement, admission, or `durable:true` claim is authorized by this record.** The record is evidence and a decision proposal, not an effective act. Current session-only behaviour and `durable:false` are preserved.

## 1. Finding in brief

The IPD repository contains a file-backed `node:sqlite` portfolio store, a durable store adapter, and a broker-import persistence function. They are **not connected to the broker-import UI**. The browser path calls the asynchronous UI store port and defaults to `SessionPortfolioStorePort`; it remains session-only and reports `durable:false`. The product IPC dispatcher accepts the `portfolio.save` operation name in its protocol type but refuses every write with `WRITE_NOT_AUTHORIZED` before store mutation. No browser-to-IPC, preload, host bridge, HTTP API, or product call site for `persistBrokerImport` was found.

The accepted IPC v1 contract technically has a `portfolio.save` operation that could carry broker-observed fields without changing its wire semantics. It does **not** authorize writes, does **not** authorize the IPD browser as a caller, and refuses caller-supplied identity claims. A future path therefore requires a separately authorized host/UI bridge, IPD-side identity resolution, an atomic transaction and gate completion. The current `brokerImportPersistence.ts` checks identity fields supplied in its request; it does not resolve canonical identity itself and is not a compliant IPC handler as wired.

PR #45 is merged and its post-merge CI is green, but neither merge nor CI creates authority or qualification. Of its nine paths, four are within the exact G3/Q1 residual manifest, three are Q1 fixture-test evidence only, and two are outside effective authority. The “directive” mentioned without identifier or text in the GOV03 reconciliation was not located as a separate effective PA record and is not relied on here.

## 2. Verified remote state and evidence boundary

### 2.1 PR #45, merge, issue and CI

| Item | Verified state |
|---|---|
| IPD `main` | `73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2`; merge tree `66020736919befa5e5320550a396187cd351b40e` |
| PR #45 | `MERGED`; reviewed head `196a0e8804446efe32a21000bbf9f0a1e44954af`, base `1cceacfff40f22dbc9cd64906bf26a5feac1075e`; merge parents are base then head; merge tree equals reviewed head; all 9 path blobs match |
| PR diff | 9 paths, `+1537/−25`; the recorded Q1 patch/candidate was 8 paths. PR #45 adds one `scripts/run-tests.mjs` line, `--test-reporter=tap`. |
| IPD issue #44 | Still `OPEN`; it is an operator handoff for the 8-path Q1 candidate on the pre-merge base. It is not authority and is now stale as a “not landed” handoff because PR #45 is merged. No issue action is taken in this CAP-02 pass. |
| Post-merge CI | GitHub Actions run `39820730894`, at exact IPD `main@73fd8c16…`, `completed / success`. Its completed checks include typecheck/build/test and the executed-test-count guard. The live check summary says **802 executed / 801 passed / 0 failed**. The existing Q1 record/tracker reports one skipped test. |
| Test-channel boundary | The run is hosted CI (Linux/Node 22), not the designated Windows deployment host and not Gate 4 evidence. No tests were rerun for this review. |
| Existing patch artifact | IRR `docs/integration/artifacts/q1-broker-import-durability.patch` is the historical 8-path candidate artifact (72,505 bytes; SHA-256 `30501a166382a01582e573ab8e17ae1124909544ecff99fbd77c90c8b2ef1e05`; blob `ec963db5fd96ac5c7044144dbefc612ee415cb93`). It does **not** contain PR #45’s additional runner line and is not a patch for the full 9-path merge. No new IPD patch/artifact was created. |

The IPD result above is inherited remote evidence. This pass did not rerun IPD checks, modify IPD, alter issue #44, or use a test fixture as proof of authority, Gate 4 acceptance, an operational write, or production readiness. Any IRR CI triggered by publishing this documentation change is a separate documentation-branch check, not a rerun of IPD PR #45.

### 2.2 Governing records read directly

| Record | Current evidence / effect relevant to CAP-02 |
|---|---|
| Effective Gate 3 implementation authority, `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02`, IRR blob `4744e6f44e0caea55e980756aeef90a5046ec87e` | IPD §4.2 names the exact 14 implementation additions; §4.3 names the exact 8 G3 test files and says no test-runner/script/config change is authorized; §4.7 requires the accepted v1 wire property names. The portfolio store operation is specified as one `BEGIN IMMEDIATE` transaction per request. |
| Effective `G3-AMEND-01`, IRR blob `85ba78e6cbfe20ed146a53abbfa23a3350140fcf` | §1.4 preserves the manifests and says it does not authorize `scripts/run-tests.mjs` or the runner. §6.4(1) defers the Windows parser repair to a separate Gate 4 PA act. |
| Effective Q1 Portfolio Decision Act, IRR blob `de7860327091f76d4a1854d028221ca6cf91c07a` | §1.1 authorizes the qualification act; §1.2 authorizes bounded residual implementation only inside the G-2 additive boundary and the Gate 3 §4/§5 manifests. §§2–5 preserve the Gate 4/Gate 5, successful-write, and admission boundaries. |
| Q1 Group E evidence record, IRR blob `af68d25a1030f4bd8c0ed8ac2fbbd835a31b3291` | It describes the new Q1 suites as fixture measurements and expressly says it renders no authority; it is evidence, not a manifest amendment or PA act. |
| GOV03/GOV04/GOV05 reconciliation, IRR blob `c39748b7d89af994240947c0f84f60d7fce2a414` | It records the runner line and refers to an unspecified “directive”; it is a reconciliation report, not a PA act. No separate effective act identifying that directive was located. The claim is unverified and does not cure an exclusion. |
| Effective IPD UI store-port act `np04-g2-portfolio-ui-store-port-2026-10-16-001`, IPD blob `d0657706848d444189ea97358c3e51cd2b953b88` | §§A.2–A.4 authorize UI dependency inversion and an async port only. §A.5 expressly excludes IPC/client/endpoint/service/transport, durable adapter/store/writes, provisioning, identity mechanism, route admission and qualification. No later act changing these exclusions was found. |
| Accepted consumer contract v1, IPD blob `163eb1f18ce023bb9a06917de99ca279fdb86bf7` | §1 scopes the client as the IRR server process and server as IPD; §6 defines `portfolio.save` but says write operations are not authorized; §6.1 refuses `companyId`, `runtimeCompanyId`, `identityStatus`, `resolutionDisposition` and requires IPD-side canonical identity resolution; §4 excludes TCP/HTTP/URL listeners. Reuse by the IPD browser is not authorized by this contract. |
| Accepted Gate E W-1 write policy, IPD blob `4a9501bffb49abbbc0ba5b5c4f81d2841812913e` | W-1 requires all four conditions: accepted Gate E policy; exact Gate 3 implementation authority; Gate 4 host qualification **and separate result acceptance**; Gate 5 admission. Otherwise writes are refused with zero mutation. W-4 requires one request/one atomic transaction; W-6 requires server-side canonical resolution; W-8 defines content-digest idempotency; W-9 prohibits automatic retries; W-11 conditions durable-success claims on a durable commit and later acceptance. |

The Gate 4 authority proposal remains **PROPOSED — NOT EFFECTIVE** and its pinned IPD basis is `1cceacfff40f22dbc9cd64906bf26a5feac1075e`, older than the current IPD main. It does not authorize execution or make the runner line effective. No Gate 4 result-acceptance act or Gate 5 admission act was found. Gate A′ provisioning is approved but not executed; no active binding has been established in the investigated baseline. The fresh-store readiness test observes zero binding/membership rows and a Class P refusal, not a provisioned operator store. These are present blockers, not assumed setup.

## 3. PR #45 path-level authority disposition

Dispositions below apply to the **specific change in PR #45**, not to the mere presence of a path on `main`. “Authorized” is bounded to the named function; it does not mean accepted for product integration, qualified, admitted, or enabled for writes.

| PR #45 path | Base → head blob (shortened only for table readability) | Disposition | Authority basis and limit |
|---|---|---|---|
| `src/ipc/dispatch.ts` | `6c8fcbc8…` → `27becc76…` | **AUTHORIZED — exact manifest / bounded** | G3 §4.2 item 13 and Q1 §1.2 cover this exact path. The contract-v1 read projection correction is bounded to the accepted field names. Dispatcher still refuses all writes. |
| `src/persistence/durablePortfolioStorePort.ts` | `97c5bc65…` → `2bba27f4…` | **AUTHORIZED — exact manifest / bounded** | G3 §4.2 item 10 and Q1 §1.2. Write methods remain behind the hard-false W-1 guard; this is not UI transport. |
| `src/persistence/portfolio_store.ts` | `2ee96301…` → `c48479db…` | **AUTHORIZED — exact manifest / bounded** | G3 §4.2 item 6 and Q1 §1.2. The change does not authorize a successful write; current source still lacks the required multi-statement transaction (see §4.4). |
| `tests/g3_portfolio_read_isolation.test.ts` | `7b978625…` → `69e36f68…` | **AUTHORIZED — exact G3 test path / bounded** | Named G3 test path, within the Q1 residual conformance work. Assertions do not grant product integration or Gate 4 evidence. |
| `tests/q1_broker_import_durability.test.ts` | absent → `22981dec…` | **AUTHORIZED — Q1 fixture-test evidence only** | Outside the exact G3 test manifest, but within Q1 §1.1’s separately authorized qualification/test work. It remains a disposable-fixture test, not Gate 4 QE, not an operational write, and not a product UI/IPC path. |
| `tests/q1_ipc_read_contract_conformance.test.ts` | absent → `a0b65ff4…` | **AUTHORIZED — Q1 fixture-test evidence only** | Same Q1 qualification boundary. Read-wire assertions are not write authorization or UI transport evidence. |
| `tests/q1_ownership_source_readiness.test.ts` | absent → `755ee1a2…` | **AUTHORIZED — Q1 fixture-test evidence only** | Same qualification-evidence boundary; it does not mean a binding was provisioned or the ownership source is operational. This test is not made a CAP-02 prerequisite and no CAP-03 status is changed. |
| `src/persistence/brokerImportPersistence.ts` | absent → `59bb09eb…` | **UNAUTHORIZED under located effective implementation authority** | New production implementation file is not one of the exact G3 §4.2 additions. Q1 §1.2 limits residual implementation to the G3 manifests; no effective amendment or separate act naming this file was located. Its source comment and Q1 evidence report do not create authority. Do not rely on it as an authorized product service. |
| `scripts/run-tests.mjs` | `fe1ab1a3…` → `4a90d935…` | **UNAUTHORIZED under located effective authority** | Runner/script changes are expressly excluded by G3 §4.3 and preserved as non-authorized by G3-AMEND-01 §1.4; §6.4(1) defers the separate Windows repair to a Gate 4 PA act. The live Gate 4 proposal is not effective and is not authority for this TAP-line change. The unlocated “directive” claim is insufficient. |

No manifest is rewritten or retrospectively widened here. The merged bytes remain a fact; PR merge, CI, comments in source and tests do not cure an authority gap. No rollback/deletion is directed by this evidence review; that would require its own authorized scope.

## 4. Current broker-import → persistence path

### 4.1 Browser/UI side

- `frontend/src/features/portfolio/BrokerImportModal.tsx` defaults to `new SessionPortfolioStorePort(portfolioStore)`. It invokes `controller.confirmAndSaveViaPort` with the port, portfolio ID and expected revision.
- `frontend/src/features/portfolio/import/ui-broker-import-view-model.ts` calls `storePort.saveHoldings(...)` with the parsed holdings and options (`mode`, `sourceBroker`, `fileName`, `contentDigest`, `lineageDigest`). It has no browser call to `fetch`, XHR, WebSocket, EventSource, a preload, or IPC endpoint.
- `PortfolioWorkspace` also defaults to the session store port. The durable backend port does not implement a browser transport and is not injected into the UI.
- The UI mapper may use a browser-side `SecurityMaster` and places resolved identity fields into the import model. That is not an IPD-side resolution step and cannot be sent as identity authority over v1 IPC.

### 4.2 IPD backend side

- `src/persistence/connection.ts` opens a local `node:sqlite` database; the durable store and migration set exist. `DurablePortfolioStorePort` delegates mutations only after `evaluatePortSaveGuard()` authorizes them. The current guard is hard false until W-1 conditions are met.
- `src/ipc/protocol.ts` includes `portfolio.save` in the closed write operation set and rejects caller-supplied identity/security keys. `src/ipc/dispatch.ts` returns `WRITE_NOT_AUTHORIZED` for every write before mutation; its dispatch switch implements reads only. There is no `broker.import` operation.
- `src/ipc/endpoint.ts` is a same-host AF_UNIX / Windows named-pipe endpoint using `node:net`; it explicitly does not create TCP, HTTP or URL listeners. The IPD frontend is a Vite/React client. No native shell, preload, browser-to-IPC bridge, HTTP API server or product IPC client was found in IPD `main`.
- `persistBrokerImport` has no product runtime caller; the positive commit/restart/idempotency tests call it directly with a fixture `DurablePortfolioStore`. The W-1-gated port test separately checks that writes are refused with zero effect.

### 4.3 Contract incompatibility in the existing import helper

The accepted v1 request carries raw broker-observed holdings and may not contain caller-supplied `companyId`, `runtimeCompanyId`, `identityStatus` or `resolutionDisposition`. It requires canonical identity resolution by IPD. The current `BrokerImportRequest` in `src/persistence/brokerImportPersistence.ts` instead requires each holding to carry those identity claims, and `evaluateBrokerImportIdentityGate` validates their combinations; it does **not** call `SecurityMaster.resolveCompanyId` or otherwise independently resolve the raw observed identifiers. The IPC dispatcher does not call this helper. Therefore the helper cannot be treated as a compliant v1 `portfolio.save` handler or as a UI transport implementation.

The IPD identity resolver modules exist, but the import persistence/IPC call path does not wire an IPD-owned resolver into this helper. A future compliant path must resolve raw observations IPD-side from a properly initialized, authoritative source, or obtain separate authority for a contract/security change. It must never trust browser-supplied canonical identity claims.

### 4.4 Commit, durability and provenance limits

The current portfolio mutation sequence is not source-proven atomic. `portfolio_store.ts` writes a portfolio row, revision, holding rows, current-revision update and contribution row in separate statements; its `create` / `save` / `writeRevision` methods have no enclosing `BEGIN IMMEDIATE` / `COMMIT` / `ROLLBACK`. The transaction search found explicit transaction wrappers for binding, migration and provisioning, but not portfolio mutations or `persistBrokerImport`. `journal_mode=DELETE` and `synchronous=FULL` do not turn this multi-statement logical import into one atomic request. Gate E W-4 and the G3 manifest require one request/one transaction; fault injection, crash atomicity and transaction rollback are not proved by the passing fixture tests.

Further, current import/UI metadata differs across layers: the UI passes source broker, file name, content and lineage digests but not `importedAt`; the persistence request declares `importedAt` but does not store it. The contribution ledger stores contribution ID, amount and timestamps; per-holding rows retain some broker/lineage fields, while file/import-time attribution is not persisted as a complete contribution record. The current tracker’s DR-4 already records the narrower contribution projection and the unresolved contribution-schema question. This review makes no schema or mapping change and does not silently drop or redefine any field.

**Truthful result today:** the UI’s current session port can report a successful session save only as session-only / `durable:false`; it cannot truthfully report an IPD durable commit. The existing backend fixture result is not a product UI success. A future durable success may be returned only after the authorized backend transaction commits, and only once the applicable Gate 4 result-acceptance and Gate 5 admission requirements are satisfied.

## 5. Transport options and bounded recommendation

| Option | Assessment | Decision status |
|---|---|---|
| Browser directly opens AF_UNIX / Windows named pipe | Not viable in the current browser application: browser code has no `node:net`, and the repository has no host/preload bridge. | Reject as a direct browser path. |
| New loopback HTTP/TCP endpoint in IPD | Larger surface and contrary to the current same-host IPC contract and endpoint’s explicit no-HTTP/TCP/URL rule. It would require new server, origin/security handling, authority and tests. | Do not select. It is not needed for CAP-02. |
| New `broker.import` IPC write operation | Broader than the existing v1 `portfolio.save`; contract v1 V-4 makes adding/changing a write operation a major contract change requiring a Gate E policy revision. | Do not select absent a separately authorized contract revision. |
| Route UI through IRR server/API | IRR is a distinct consumer; all `/api/user-portfolios*` routes remain fenced. This would make CAP-03 a dependency and cross the user’s scope boundary. | Excluded from CAP-02. |
| Trusted host-owned bridge → IPD same-host IPC, reusing the existing v1 `portfolio.save` wire shape | Narrowest future candidate if the desktop/renderer host exists: it keeps persistence/identity in IPD and avoids a new network listener or new write operation. It needs an explicitly authorized host/UI bridge and an explicit decision on using the IRR→IPD contract from the IPD UI host. | **Recommended architecture direction only — PROPOSED / NOT EFFECTIVE; not presently implementable because no host runtime/bridge is identified in IPD.** |

### 5.1 Minimum future request and response flow

A bounded future flow would be: broker parser/UI → trusted host adapter implementing the existing UI `PortfolioStorePort` → host-owned IPC client → IPD same-host endpoint → C7 wire-key rejection and per-request IPD owner-binding resolution → IPD-side canonical identity resolution over raw broker observations → authorization/write guard → one `BEGIN IMMEDIATE` portfolio transaction → `COMMIT` → v1 `portfolio.save` result → host adapter → UI success/refusal mapping.

No owner, tenant, `companyId`, `runtimeCompanyId`, `identityStatus` or `resolutionDisposition` may be supplied by the UI/host. The server owns binding and canonical identity resolution. The existing wire operation can be reused without changing its payload semantics **only if** the actual broker fields and required provenance can be represented by v1; currently, `fileName` and `importedAt` are not in the v1 save payload and the persistence mapping is incomplete. If the data cannot be represented without dropping/changing mapping semantics, stop for a separate contract/policy decision rather than silently extending v1.

Validation/error flow must preserve the closed v1 outcomes: malformed or authority-bearing wire requests fail closed; unresolved identity refuses the whole import with per-holding evidence and no partial write; revision conflicts, invalid requests, unavailable resources and W-1 refusal do not enter a success state. The UI must propagate the outcome and actual `durability`/`durable` values; session-only remains `durable:false`.

### 5.2 Transaction, idempotency and restart requirements

- The persistence owner is IPD (`node:sqlite`). The request must have one atomic transaction covering binding revalidation, identity-accepted holdings, revision check, idempotency check, portfolio/revision/holding/contribution mutation and commit. No response may claim a commit before `COMMIT` succeeds.
- Preserve W-8 content-digest idempotency (not `requestId`); a duplicate import makes no new revision. W-9 forbids automatic write retries; timeout after send is outcome-unknown and must reconcile by read before user retry. Current list-before-create/save and multi-statement path do not establish concurrent idempotency or all-or-nothing failure behaviour.
- Verification must include negative/no-effect cases, transaction fault injection/rollback, a real IPC-bound request, restart read-back of the committed portfolio/revisions/contribution lineage, duplicate re-import after restart, and crash during a write leaving the complete state or none. The existing Q1 fixture test is not that end-to-end or crash-atomicity proof.
- Gate 4 QE-4/QE-5/QE-7 and the separate Gate 4 result-acceptance act remain required. Gate 5 admission remains a separate later act. The current Gate 4 proposal is not effective, the target-host run has not occurred, and Gate 5 is not granted.

### 5.3 Interfaces/files likely to require an exact future manifest

This is an architecture inventory, **not a change list or authority grant**:

| Surface | Likely work if the recommended option is later authorized |
|---|---|
| UI | A host-backed implementation of the existing `PortfolioStorePort` and injection at the current host/workspace boundary. `BrokerImportModal` already accepts an optional port. Exact UI injection file depends on the not-yet-identified host. |
| Host | A trusted native/preload bridge and typed message boundary owned by the desktop host. **No such host/preload source path is present in the IPD repository; owner and exact files are unknown.** This must be identified before implementation authority can name files. |
| IPD IPC | `src/ipc/dispatch.ts` for the authorized `portfolio.save` service path (currently unconditional W-1 refusal); possibly protocol code only if exact v1 payload suffices. Do not add an operation or field without separate contract authority. |
| IPD import/identity | The current `src/persistence/brokerImportPersistence.ts` is unauthorized and trusts caller-supplied identity claims; a future act must name whether it is replaced or reworked and the exact IPD-side resolver/source initialization. |
| IPD transaction/persistence | `src/persistence/portfolio_store.ts` and its authorized store adapter need an atomic request boundary and complete required provenance mapping; schema/migration semantics are frozen for this CAP-02 pass. |
| Tests | New host→IPC, server-side identity, no-effect, transaction/fault, idempotency, restart and outcome-unknown tests, named exactly in a new effective act. Existing Linux CI is not host Gate 4 evidence. |

The existing accepted v1 contract can support the **technical wire shape** of a future UI path without changing the operation or wire semantics, but it currently names IRR as the client. The Program Authority must separately authorize the IPD host/UI caller and bridge, and the exact host/runtime/files must be named. This is not permission to repurpose the IRR server or its routes.

## 6. PA decision sheet — **PROPOSED / NOT EFFECTIVE**

> **Status:** `PROPOSED — NOT EFFECTIVE — GRANTS NO IMPLEMENTATION AUTHORITY`. This prepared text has no PA selection, signature, approval ID or effective date. Merging this proposal would publish a proposal only; it would not make it effective. The PA must render any decision by the project’s established direct-selection process.

### 6.1 Exact proposed disposition

**Proposed wording for PA determination:**

> 1. I accept the CAP-02 path-level authority assessment in §3 as the current evidence-based disposition: the four exact-manifest IPD changes are bounded authorized work; the three `tests/q1_*` files are authorized only as Q1 fixture/qualification evidence and are not Gate 4 qualification or a G3 manifest expansion; `src/persistence/brokerImportPersistence.ts` and the `scripts/run-tests.mjs` change are outside the located effective implementation authority and are not retrospectively ratified. The unspecified “directive” assertion is not relied upon absent an identified effective PA record. This determination does not direct deletion or rollback of merged files.
> 2. For future CAP-02 architecture only, I select a trusted host-owned bridge into the IPD-owned same-host IPC endpoint, using the existing v1 `portfolio.save` wire shape without a new operation or changed wire semantics, **conditional on** a separately recorded decision authorizing the IPD UI host as a caller. The accepted contract’s present IRR-client scope is not silently expanded by this selection.
> 3. This is architecture direction only. It grants no source, UI, host, IPC, persistence, identity, schema, migration, write, provisioning, qualification, result-acceptance, admission, route, production or `durable:true` authority. Implementation requires a later effective act that names the actual host/runtime, exact paths/interfaces/tests, IPD-side identity source, provenance mapping, transaction boundary and all stop conditions.
> 4. Preserve the current session-only UI, `durable:false`, W-1 refusal, all route fences and all unrelated workstreams. Do not use CAP-03/IRR routes as a CAP-02 dependency.

### 6.2 Scope, rationale, alternatives and prerequisites

- **Scope if selected:** CAP-02 design direction only; no application-code or governance-manifest change. Reuse v1 only if required broker observations and provenance fit the existing payload; otherwise return for a separate contract/policy decision.
- **Rationale:** the browser has no current transport; IPD owns the store and identity boundary; the existing endpoint is same-host IPC; `portfolio.save` already defines the narrow raw-holdings write shape; a new HTTP listener or new write operation is wider and creates additional contract/security work.
- **Alternatives considered:** retain session-only behaviour until a host is identified (safe deferral); add localhost HTTP/TCP (rejected as broader and contrary to current contract); add `broker.import` (rejected absent major contract/Gate E revision); direct browser socket access (not viable); route via IRR/CAP-03 (excluded).
- **Prerequisites before any implementation act:** (1) IPD host owner identifies the actual desktop/renderer runtime, bridge owner and exact source files; (2) PA explicitly authorizes the host/UI caller and names the exact implementation/test manifest; (3) IPD-side binding and authoritative identity-resolution source are initialized and used on raw observations; (4) file/import-time/contribution provenance is mapped without changing semantics or dropping data; (5) one-transaction commit, failure rollback, idempotency and outcome-unknown behaviour are implemented and tested; (6) W-1 is satisfied, including effective Gate 3 authority, Gate 4 host qualification plus distinct result acceptance, and Gate 5 admission. Until then, writes remain refused.
- **Effect if later accepted:** architecture preference only. It would not enable a write, instantiate a host bridge, qualify the backend, admit routes, or permit `durable:true`.

## 7. Current status and unambiguous next action

**CAP-02 disposition:** `UI → durable persistence transport NOT PRESENT; product writes NOT AUTHORIZED; durable-success claim NOT AVAILABLE`. Existing backend persistence code and fixture evidence do not satisfy the UI path. PR #45’s file authority is now classified path-by-path, with two unauthorized paths and no retroactive manifest change.

**Next executable action:** the IPD host owner must identify and point to the actual desktop/renderer host runtime and its bridge entry point (or confirm none exists). This is a technical prerequisite to naming any exact host files in a future PA implementation act. Until that evidence exists and the PA decision is rendered, **no bridge, browser API, HTTP listener, write handler, or durable UI adapter is authorized or executable**. Continue to report session-only saves truthfully as `durable:false`.

**Non-grants preserved:** no CAP-03 status or files changed; no G24 revival; no activation of IRR user-portfolio routes; no removal or change to HTTP `503` fences; no schema/mapping/migration change; no W-1, Gate 4, result-acceptance, Gate 5, route-admission, production, or successful-write status change; no Group F workbook search or claim.