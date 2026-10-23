# IIPS v3.0 — CAP-02 Host Composition and Transport Readiness

> ## STATUS: **ASSESSMENT COMPLETE — INCREMENT A VERIFIED PRESENT; U1/U7 PREPARED, NOT EFFECTIVE — NO IRR SOURCE, ROUTE OR WRITE CHANGE**
> The effective U0 placement is retained: IPD authors the broker-import component set; IRR is the only product
> host; identity resolution and durable persistence remain IPD-owned. During this pass IPD independently landed
> Increment A. Its `./portfolio-ui` export is now verified consumable, but neither the IRR composition act nor
> U1/U7 is effective. The route remains unregistered, all twelve existing HTTP 503 fences remain intact, and no
> operational write or unverified `durable:true` claim is made.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP02-HOST-COMPOSITION-TRANSPORT-READINESS-2026-10-23-01` |
| **Record type** | Current-source assessment, real host-composition boundary, dependency register and downstream integration test plan |
| **Status** | **COMPLETE — PREPARATION ONLY**; B-1 export blocker closed by IPD; U1/U7 **PREPARED / NOT EFFECTIVE** |
| **Date** | `2026-10-23` (UTC) |
| **IRR baseline** | `main@f53056214d45c850928fbabd51dc6a2adcb64f2b`; tree `d0f24bfdbeba3b4f5bc33bbae15491884bd5da8f` |
| **IPD initial baseline (read-only)** | `main@73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2`; tree `66020736919befa5e5320550a396187cd351b40e` |
| **IPD current baseline (read-only)** | `main@554ed6ceaa7422c95806fd1b6e095a24a8554be2`; tree `2d9dc14d8f9ab52a4507648e5323ce803dc6d512`; advanced independently through PRs #46/#47 while this assessment ran |
| **Authority for this record** | Standing PA grant transcribed at F-3 §1.2 (blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`), construed by DEC-06 R-1/R-3/R-6/R-7, plus the current CAP-02 execution directive |
| **Mutation boundary** | IRR governance documentation and tracker only. No application source, test, dependency, route, fence, schema, mapping, migration, workflow or IPD change by this session |
| **Companion prepared records** | `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-2026-10-23-01`; `IIPS-V3-CAP02-U7-READ-RESULT-CONTRACT-DECISION-2026-10-23-01` |

---

## 1. Determination in brief

1. **U0 remains effective and unchanged.** No alternative placement, IPD-local product host, copied component,
   duplicated parser, IRR SecurityMaster, provenance implementation or consolidation pipeline is introduced.
2. **B-1 is now closed at IPD.** PR #46 landed the exact export-only Increment A act and PR #47 its receipt.
   Current `main` exports `iips-production-market-data/portfolio-ui`; an independent external consumer resolved
   22 runtime exports at commit `554ed6ce…`. The export deliberately contains `BrokerImportModal`, not
   `PortfolioWorkspace`.
3. **The IRR pin is still old and no IRR repin is authorized here.** `2e11fa3b…` remains off IPD `main`.
   Repinning belongs to an effective IRR composition act; it is not done merely because the export now exists.
4. **There is still no effective exact-scope IRR implementation or U1 route-admission act.** U0, topology and
   Increment A expressly do not render the IRR composition act or admit a route.
5. **The existing IRR `IpcUserPortfolioPort` cannot be reused unchanged for CAP-02 save.** Its nested `options`
   bag and optional revision differ from accepted v1. A future narrow CAP-02 adapter must use existing `callIpc`
   and preserve the minimal v1 receipt; no new IPC operation or listener is needed.
6. **U7 still blocks the actual exported modal.** Its save success requires a full legacy result, refusal
   requires a full record/durability values, the port lacks outcome-unknown, and the current view model fills
   refusal/preview placeholders that cannot be presented as authoritative host results. A revision token also
   needs an honest read path. These are contract/UI issues, not transport or write authorization.
7. **No independent IRR source/test implementation is presently both authorized and dependency-ready.** B-1's
   removal does not supply the missing effectiveness or U7 semantics. No inert seam or unreachable integration
   is added to create an appearance of progress.

## 2. Current state and authority verification

### 2.1 Repository and publication state

| Check | Verified result |
|---|---|
| IRR identity | Working checkout is `ramkivs/iips-review-recovered`; `origin` points to that repository |
| IRR remote `main` before work and at reassessment | `f53056214d45c850928fbabd51dc6a2adcb64f2b`, tree `d0f24bfdbeba3b4f5bc33bbae15491884bd5da8f` |
| Working state before work | Clean session branch `arena/aadee92a-iips-review-recovered`; content equaled `origin/main` |
| Relevant merged IRR PRs | #212/#213 published U0/receipt; #213 produced current `main`. Open #204/#114 are not CAP-02 authority or an IPD export and were not used |
| IPD initial state | `73fd8c16…` / `66020736…`; no package export at that initial baseline |
| IPD Increment A | PR #46 merged `2026-10-23T09:02:17Z` at `a75af71d…`; PR #47 merged `09:06:24Z` at current `554ed6ce…` / `2d9dc14d…`; both main CI runs successful |
| IPD open PRs after movement | Draft #42 remains unrelated and unmerged; it was not relied upon |
| IPD mutation by this session | **None.** Read-only `ls-remote`, GitHub APIs and scratch/source inspection only. The remote movement was independently authored/merged outside this session |

### 2.2 Effective records read and applied

| Record | Current coordinate | Effect on this pass |
|---|---|---|
| Standing PA grant | F-3 §1.2, blob `c4c9f7d7…`; DEC-06 blob `4be3ea57…` | Covers necessary in-scope governance records, verification and routine publication; does not prove an act or permit safeguard weakening |
| G1-B1 | IRR blob `857d1451…` | IRR is product/application host, not authority for IPD domain or persistence |
| G-2 | IRR blob `7e83946b…` | Extend, do not replace/duplicate IPD's portfolio domain; reference and user portfolios stay distinct |
| Effective topology | IRR blob `48bc8375…` | IRR host, IPD persistence/IPC, no IPD-local host; separate exact effective implementation act required |
| Effective U0 | IRR blob `43793d66…` | IPD-authored UI hosted by IRR through package export; placement only, no implementation/route/write authority |
| Host-boundary and composition acts | IRR baseline blobs `7ec74179…`, `6c7f6cfe…` | Both `PREPARED / NOT EFFECTIVE`; the latter receives an additive current-source correction |
| **Increment A export act** | IPD current blob `5be269f575ea8f7d9131362da55e5f9569858db5` | **Effective for export plumbing only.** Expressly does not render IRR Increment B/C or authorize routes/writes |
| U2 amendment | IPD current blob `234870d34da3494773e07ecd574236d583bf6d66` | `PROPOSED / NOT EFFECTIVE`; no U2 implementation or schema authority |
| Accepted consumer contract v1 | IPD blob `163eb1f1…` | Closed operations/shapes; raw observations only; no analytics operation; writes defined but unauthorized |
| Accepted Gate E / W-1 | IPD blob `4a9501bf…` | Mandatory revision, IPD identity, idempotency, no retry/outcome unknown and commit-before-durable-claim |
| Gate 3 / Gate 4 / result / Gate 5 | Effective Gate 3 act `4744e6f4…`; Gate 4 proposal `c02093e0…` | Bounded Gate 3 acceptance only; Gate 4 not effective/started, result not accepted, Gate 5 not granted |

### 2.3 Authority disposition of the work

| Work item | Effective authority now | Disposition |
|---|---|---|
| Verify current source and correct preparation | Standing grant + current CAP-02 directive | **Authorized and performed — documentation only** |
| Land IPD export | Independent effective IPD Increment A act | **Completed independently in IPD; verified read-only here** |
| Prepare exact U1 and U7 records | Current directive §§4–5 + standing grant | **Prepared, not effective; route and UI remain disabled** |
| Repin IRR dependency / mount modal / add adapters or route | No effective IRR composition act; U1/U7 unresolved | **Blocked — not performed** |
| Operational writes, Gate 4/5, fence lifts | Expressly withheld | **Not performed and not claimed** |

## 3. Increment A — landed export independently verified

### 3.1 Before/after facts

At initial IPD `73fd8c16…`, `package.json` blob `0a3eec22…` had no export/package layer. At current
`554ed6ce…`, package blob `f7146b67d44fc7d1c016f34b10307b46e3921a7f` declares exactly:

```text
exports["./portfolio-ui"].types  = ./dist/package/src/ui/portfolio_ui_package.d.ts
exports["./portfolio-ui"].import = ./dist/package/src/ui/portfolio_ui_package.js
files = ["dist/package"]
prepare/prepack = build:portfolio-ui-package
```

The landed entry point is `src/ui/portfolio_ui_package.ts` blob
`03ffdd4655d26dc8f9f6030d36b0f30924a89836`; tsconfig blob `b5395d7b…`; conformance test blob `ab162f7c…`.
It re-exports the authoritative modal, port/session types, store types, broker pipeline, `SecurityMaster`,
`getGovernedBroadSecurityMaster` and quarantine types. It deliberately does **not** export
`PortfolioWorkspace`, `frontend/src/app/**`, IPC, persistence, migrations or the write gate.

The IPD act records 47-file browser-safe closure, external `react` only, no unresolved imports, no Node builtin
and no privileged persistence/IPC path; its full suite and package/pack/consumer checks passed. This session did
not rely on that prose alone.

### 3.2 Independent external-consumer proof in this session

From an empty temporary directory outside both repositories, this session installed the exact GitHub commit
`554ed6ceaa7422c95806fd1b6e095a24a8554be2` with the sandbox CA bundle and imported the package subpath. Result:

```text
22 runtime exports
BrokerImportModal: function
getGovernedBroadSecurityMaster: function
PortfolioWorkspace exported: false
default port durability: SESSION_ONLY
default port durable: false
```

The install/import exited 0; the installed `package.json` hashed to the remote `f7146b67…` blob. An independent
`esbuild --platform=browser` bundle of the exported modal/master/port also completed (1,979,960 bytes with React
external), and a scan found none of the named Node persistence/socket builtins or privileged write symbols.
This proves consumability and browser-bundle closure of the current package path, not IRR composition, write
compatibility or Gate 4 qualification. No IRR dependency file was changed.

### 3.3 Remaining dependency action

IRR's `frontend/package.json` still pins `2e11fa3b…`, which remains off IPD `main`. The next dependency action is
a deliberate repin to a verified IPD `main` commit inside an effective IRR composition manifest, with lockfile
and browser-bundle checks. It is not authorized or performed by this readiness record.

## 4. The real IRR host-composition boundary

### 4.1 Existing composition and conventions

| Layer | Actual current source | CAP-02 boundary |
|---|---|---|
| Renderer root | `frontend/src/main.tsx` → `BrowserRouter` → `App` | Browser-only React; no Node persistence/socket import |
| Route shell | `frontend/src/app/App.tsx` within `AppShell` | Future `/user-portfolios/import` surface only under effective composition/U1/U7 |
| API client | `frontend/src/api/**`; relative `/api/...` | Future CAP-02 client projects raw DTOs; never imports `frontend/server/**` |
| Dev transport | `frontend/vite.config.ts` `/api` proxy | Reuse only; no origin/listener/CORS/proxy change |
| Trusted host | `frontend/server/executive-transport.ts` | Future `/api/broker-import/**` mount and owner-scoped C8 prefix only under effective U1 |
| Same-host IPC | `frontend/server/user-portfolio/ipcClient.ts` | Reuse `callIpc`; one connection/call, no retry, outcome-unknown on timeout |
| Persistence | IPD `src/ipc/**`, `src/persistence/**` | IPD-only; never bundled into renderer |

### 4.2 Smallest mount: the exported modal, not the unexported workspace

The smallest compliant mount is **`BrokerImportModal`**, the component Increment A deliberately exports.
`PortfolioWorkspace` is IPD application composition, is deliberately not exported, and must not be imported
through a deep path or copied into IRR. The host owns only modal visibility/props and notifications; it does not
reimplement file parsing, preview, consolidation, identity or persistence.

```text
BrokerImportModal
  isOpen / onClose             host visibility state only
  onSaveSuccess                host notification; U7 result semantics required
  portfolioStore               IPD-exported session fallback instance; custom port always supplied
  storePort                    IRR browser HTTP adapter implementing IPD PortfolioStorePort
  expectedRevision             mandatory for CAP-02; obtained through an honest revision read
  securityMaster               IPD-exported governed master/factory
  allowNonProductionBypass     false
  executionEnvironment         NON_PRODUCTION
```

The modal forwards the injected port to `confirmAndSaveViaPort`. The session `PortfolioStore` prop is required
by the component API but is not an alternate durable path and must not receive a custom-port save. The renderer
adapter delegates to `frontend/src/api/brokerImport.ts`; it cannot directly consume IRR's Node-only
`UserPortfolioPort`. The trusted host adapter is separate behind HTTP.

The first surface is **default-portfolio-only** because the current modal saves literal `DEFAULT_PORTFOLIO`.
Arbitrary portfolio selection requires an IPD component act threading `portfolioId`; IRR will not hide the
mismatch or build a parallel controller. No portfolio creation/selection is inferred.

### 4.3 Revision read, raw identifiers and validation

- CAP-02 needs a revision token, not a full workspace analytics/read model. The prepared U7 direction is a
  revision-only host projection using an authorized v1 read (for example, select the exact default ID from
  `portfolio.list`) immediately before the surface is enabled. Return only `{portfolioId, revision}`; do not
  invent `isSaved`, analytics or a full record. A later race is handled by mandatory `expectedRevision` conflict,
  not by caching or silently refreshing the expectation.
- The browser preview's canonical identity is non-authoritative. The client serializes only broker-observed
  v1 fields. Canonical identity, lineage/weight, owner/tenant/principal/credential and scope keys are rejected
  before socket construction. IPD independently resolves raw observations under W-6 before any future mutation.
- Missing/invalid revision fails before I/O. Class P, Class A, validation, conflict and outcome-unknown remain
  distinct. No automatic retry, fallback store, cached record or fake empty durable snapshot is allowed.
- The CAP-02 HTTP success receipt should preserve v1 `{disposition, revision, durability, durable}`. Only that
  authoritative post-commit receipt can carry `durable:true`; U7 determines how the modal presents it without
  filling missing totals, timestamps, records or preview values.

## 5. U1 disposition

The selected boundary remains a CAP-02-owned namespace on the existing IRR Node host, over the existing
same-host v1 IPC endpoint. The prepared U1 act narrows the first host-only transport increment to:

```text
POST /api/broker-import/:portfolioId/holdings
```

The proposed preview/read endpoint is excluded until U7 fixes the exact revision-only semantics. The act uses a
new trusted CAP-02 save adapter over `callIpc`, not `IpcUserPortfolioPort` unchanged. It preserves every existing
`frontend/server/user-portfolio/**` file and all twelve HTTP 503 fences.

**Status: PREPARED / NOT EFFECTIVE; route NOT ADMITTED and NOT REGISTERED.** Accepted v1 requires mandatory
`expectedRevision` and top-level `mode`, `contentDigest`, `broker`; the old IRR adapter emits optional revision
and `options:{mode,contentDigest,fileName,sourceBroker}`. `fileName` and `importedAt` are not v1 save fields.
No new `broker.import` operation is used to evade that C-1/U2 gap. The non-effective U2 proposal does not resolve
how complete file attribution crosses the accepted v1 request; full lossless provenance remains a prerequisite
before operational-write/durable-success scope.

See `IIPS_v3.0_CAP02_U1_BROKER_IMPORT_TRANSPORT_AUTHORITY_ACT_PREPARED_2026-10-23.md`.

## 6. U7 disposition

The seven missing fields and three renames were checked against current source. They are defined by IRR's
frozen G2 views, not by nonexistent IPD UI `PortfolioSummary`/`RevisionEntry` types. The three renames are
safe direct mappings after validation. Two G2 summary fields exist in a separate detail read; historical
revision values cannot be reconstructed from current state; `isSaved` cannot be inferred.

For the actual exported modal, the narrow disposition is to keep G2 list/full-view/revision-history and workspace
analytics **out of CAP-02's first surface**, use a revision-only read, and amend the IPD modal/port under a
separate effective act to consume:

1. a minimal authoritative v1 commit receipt, not a full legacy `PortfolioSaveResult` synthesized by read-back;
2. a refusal without a mandatory full `PortfolioRecord` or durability fabrication;
3. a distinct outcome-unknown/reconciliation state with zero automatic retry.

The current view model also creates refusal `savedAt`/empty-record placeholders, derives displayed `durable`
from static port durability rather than `outcome.durable`, and falls back to preview counts/totals/digests in its
success panel. A TypeScript cast, partial result or truthful outcome flag alone would therefore be unsafe. U7
requires an IPD UI/result-contract amendment; it cannot be solved solely inside IRR.

**Status: decision PREPARED / NOT EFFECTIVE; composition remains blocked.** U7 is distinct from U1 route
authority and U2–U6 write/gate authority. See
`IIPS_v3.0_CAP02_U7_READ_RESULT_CONTRACT_DECISION_PREPARED_2026-10-23.md`.

## 7. Dependency register and exact next actions

| ID | Current state | Exact next action | Owner/capacity |
|---|---|---|---|
| **B-1** | **CLOSED at IPD `main@554ed6ce…`**; export and external consumer verified | None in IPD for the export itself. Preserve its exact scope | IPD complete; independently verified |
| **B-1R** | IRR still pins off-`main` `2e11fa3b…`; no effective IRR composition manifest | Repin package/lock and prove the browser bundle only inside the effective composition act | IRR after effectiveness |
| **U1** | Route act prepared, not effective; old save adapter wire-incompatible | Render the narrow act against current baselines; implement only then; route remains absent | PA / IRR |
| **U7** | Modal result/refusal/unknown and revision-read semantics unresolved | Render the U7 package and perform the named IPD UI act before custom-port mount | PA / IPD + IRR |
| **C-1** | v1 save lacks `fileName`/`importedAt`; non-effective U2 proposal does not establish their end-to-end source | Render write-contract/provenance compatibility before durable success; no new operation to evade it | PA / IPD contract + U2 |
| **U2** | Raw identity source/resolution, transaction, provenance, idempotency and reconciliation incomplete; amendment proposed/not effective | Render exact Gate 3/provenance acts, implement and test in IPD | IPD |
| **Gate A′ / binding** | Operational binding not established; IRR precondition defaults false | Execute only separately authorized actual-host provisioning | IPD/host operator |
| **U3** | Gate 4 proposed/not effective/not started | Render final-pin Gate 4 act and execute QE-1…QE-11 on authorized host | PA / qualification host |
| **U4** | No separate Gate 4 result acceptance | Render acceptance against actual U3 run | PA |
| **U5** | No Gate 5 admission | Render admission naming qualified IRR/IPD commits and operations | PA |
| **U6** | W-1 unmet; writes hard-refused | Record W-1 satisfaction only after U3+U4+U5 and implementation prerequisites | PA / IPD |

No dependency substitutes for another. Ordinary CI is not Gate 4; Gate 4 execution is not result acceptance;
result acceptance is not Gate 5; route admission is not operational-write authorization.

## 8. End-to-end integration and qualification test plan

Mocks and direct-store fixtures are unit evidence only. “End-to-end” means the real IPD modal in IRR, real IRR
HTTP host, real `callIpc`, real IPD dispatch/store, at the authorized host and recorded commits.

| Test / evidence | Executable now? | Acceptance condition or blocker |
|---|---|---|
| Existing IRR regression, typechecks and build | **PASS in this pass** | Existing behavior green; not CAP-02 qualification |
| All twelve `/api/user-portfolios*` route-method HTTP 503 fences | **PASS in this pass** | Six paths/twelve pairs unchanged; fence blobs unchanged |
| Current package export external consumption | **PASS in this pass** | Exact commit installs/imports; modal/master present; workspace and persistence absent; session default honest |
| CAP-02 route absence on actual IRR host | **PASS in this pass** | Both proposed broker-import paths 404; no registered route |
| Browser file selection and IPD preview in IRR | **Blocked by effective composition/B-1R** | Real exported modal parses/previews in IRR browser bundle without Node persistence/socket imports |
| Custom-port injection | **Blocked by U1 + U7 + effective composition/B-1R** | Same IPD modal receives one IRR browser adapter and IPD master; no second parser/master/store |
| Revision-only read | **Blocked by U1/U7 + binding** | Exact default ID returns authoritative current revision; no full-record/analytics fabrication; races become conflicts |
| Raw-observation HTTP/IPC validation | **Blocked by U1** | Canonical/owner/tenant/credential keys refused before socket; raw fields survive unchanged |
| Trusted-side identity resolution | **Blocked by U2 and binding** | IPD resolves every raw observation; zero/ambiguous refuses whole import with zero store effect |
| Mandatory revision / concurrency | **Blocked by U1 + U2** | Omission refused before I/O; stale value yields `REVISION_CONFLICT`; no mutation |
| v1 payload conformance | **Blocked by U1; old adapter non-conformant** | Exact top-level keys; no `options`, `fileName`, `sourceBroker`, `lineageDigest` or canonical key |
| Refusal mapping and honest durability | **Blocked by U1 + U7 for composed UI** | Non-success, no fabricated snapshot/timestamp/durability, no COMMITTED wording |
| Real pre-admission write refusal | **Blocked by U1/U7/binding for composed path** | Real path reaches IPD `WRITE_NOT_AUTHORIZED`; store unchanged; not a mock |
| Atomic transaction and provenance | **Blocked by U2/C-1** | One immediate transaction; fault injection; complete contribution/file/lineage mapping |
| Idempotency before/after restart | **Blocked by U2/U3/U4/U5/U6** | Same digest no-op/no new revision; automatic retries zero |
| Outcome-unknown reconciliation | **Blocked by U1/U7/U2 for composed path** | Distinct unknown, no resend, read reconciliation before user retry |
| Successful durable commit/result | **Blocked by U2/C-1/U3/U4/U5/U6/U7** | Commit precedes authoritative `durable:true`; no preview fallback presented as committed data |
| Actual-host restart | **Blocked by Gate A′ + U2 + U3/U4/U5/U6** | Stop/restart both processes and byte-for-byte read-back under QE-4; separate U4 acceptance |
| Gate 4 / result / Gate 5 | **Not executed** | Three different acts remain distinct |

## 9. Preserved safeguards and completion statement

- No `/api/user-portfolios*` path, method, responder or HTTP status changed.
- IPD's hard W-1/`WRITE_NOT_AUTHORIZED` guard was not bypassed or changed by this session.
- No operational write, listener, `broker.import` operation, schema/mapping/migration or dependency repin occurred.
- No Node-only persistence or socket module was added to browser code; no application source changed.
- No analytics, identity, revision, timestamp, provenance, `isSaved`, contribution or persistence value was fabricated.
- Historical G24 was not revived; CAP-03, unrelated IIPS work and IPO Screening Engine scope were not introduced.
- Gate 4 qualification, Gate 4 result acceptance, Gate 5 admission and operational-write authorization remain distinct.

The authorized dependency-ready work is the verified export/boundary, corrected preparation and passing
regression evidence. A stale export claim, broken import, inert seam, false UI success or unauthorized route
would not satisfy the completion criterion and is deliberately absent.

## 10. Verification evidence from this pass

These checks are regression/package/route-absence evidence, not Gate 4 or CAP-02 persistence qualification.

| Check | Actual result |
|---|---|
| Locked IRR install | Initial codeload certificate failure; clean retry with `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt` installed 188 packages; no lockfile change |
| Independent IPD consumer | Exact GitHub `554ed6ce…` installed in an empty external directory; `./portfolio-ui` import exited 0 with 22 runtime exports and honest session default; installed package blob matched; browser-platform bundle completed with no named Node/privileged closure hits |
| Focused fence/transport suites | **2 files, 29/29 passed**, including six paths/twelve route-method pairs over real HTTP |
| Full IRR suite | `npm run test:ci`: **87 files, 1,077/1,077 passed, 0 failed** |
| CI false-green guard | `node .ci/assert-tests.js .vitest-report.json`: **OK — 87 files, 1,077 tests, 0 failed** |
| Typechecks | `npm run typecheck` and `npm run typecheck:replay-server`: both exit **0** |
| Production build | `npm run build`: exit **0**; Vite transformed 94 modules |
| Real-host route absence | Existing exported host on ephemeral loopback: POST holdings and GET preview both **404 `{"error":"not found"}`**; server closed |
| Source/fence preservation | Git patch is governance Markdown only; byte-stable fence assertions pass |
| End-to-end CAP-02 success | **Not run and not claimed**; U1/U7, C-1/U2, binding and U3–U6 remain as classified above |

Pre-existing React Router future-flag and React `act(...)` warnings appeared in full-suite stderr; runner and
independent JSON guard passed. No long-lived server was left running. IPD remote movement was independently
re-read and recorded rather than hidden or attributed to this session.
