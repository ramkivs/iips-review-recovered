# IIPS v3.0 — CAP-02-HOST-01 Runtime, Composition and Renderer-to-Host Bridge Investigation

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP02-HOST01-RUNTIME-COMPOSITION-2026-10-23-01` |
| **Work item** | `CAP-02-HOST-01`; additive continuation of `CV-CORR-65` / tracker §16.83 |
| **Record type** | Current-source and remote-history investigation; ownership disposition; transport assessment; implementation-boundary and Program Authority decision input |
| **Status** | **INVESTIGATION COMPLETE — CURRENT IPD UI → DURABLE STORE BRIDGE NOT PRESENT — IPD-LOCAL NATIVE HOST/BRIDGE OWNER AND RUNTIME UNRESOLVED — PA INPUT BELOW IS PROPOSED / NOT EFFECTIVE** |
| **Prepared date** | `2026-10-23` (UTC) |
| **IPD evidence baseline** | `ramkivs/iips-production-market-data` `refs/heads/main@73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2`; tree `66020736919befa5e5320550a396187cd351b40e` |
| **IRR evidence baseline** | `ramkivs/iips-review-recovered` `refs/heads/main@dda81e6cd600f2f35f8ce0f8ed5d60627b92bc48`; tree `12fabf6dd624103fd6f6c0f95a7c840a33be6161` |
| **Mutation boundary** | IPD is read-only. IRR receives this record, an additive addendum to the prior CAP-02 proposal, and an additive tracker continuation only. |
| **Decision authority** | Ramki — Program Authority. This investigation renders no PA decision and supplies no implementation, qualification, result-acceptance, admission, operational-write or durability authority. |

> **Current truthful state:** the investigated IPD broker-import UI is a browser/Vite/React application using an application-lifetime in-memory store through `SessionPortfolioStorePort`. It remains `SESSION_ONLY` / `durable:false`. IPD's separate Node IPC and `node:sqlite` implementation is not composed with that UI. No renderer-to-native-host bridge exists on the verified IPD `main`. No source-level bridge or write integration is presently PA-ready.

## 1. Executive disposition

| Question | Evidence-based answer |
|---|---|
| What actually runs the IPD UI? | `npm run dev` starts Vite. `index.html` loads `frontend/src/main.tsx`; React mounts `BrowserRouter → SessionProvider → App`. The production build emits static browser assets. No package script starts a UI server plus the portfolio IPC process. |
| Is there an IPD desktop/native application host? | **None found on current `main` or in the searched reachable product history.** No Electron, Tauri, preload, native-main, desktop composition root, or equivalent renderer host was found. This is not a claim about an uninspected external machine; it is a repository/composition finding. |
| Is there a renderer → host → IPD IPC bridge? | **NOT PRESENT.** The IPD frontend has no product `fetch`, XHR, WebSocket, EventSource, `node:net`, native preload, `ipcRenderer`, `contextBridge`, or IPC-client call on the broker-import path. |
| What owns the durable store? | **IPD**, under the accepted G-2/consumer-contract ownership boundary. `src/persistence/**` owns the local store; `src/ipc/**` owns the same-host service endpoint. |
| What owns the product/application host? | **IRR**, by published G1-B1: `ramkivs/iips-review-recovered` `main` is the authoritative IIPS product/application host. This does not give IRR ownership of IPD domain data or persistence and does not activate its fenced portfolio routes. |
| Who owns a new IPD-local native/preload bridge? | **UNRESOLVED.** No effective record names such a host, its runtime, its owner, or its exact files. Repository/commit authorship is not ownership evidence. Creating a second IPD product host would require explicit reconciliation with G1-B1, not merely a bridge implementation act. |
| Can the backend `DurablePortfolioStorePort` be injected into the UI? | **No.** It is not type-compatible with the frontend interface of the same name, and browser code cannot directly use its `node:sqlite` store. A real adapter and read/result mapping are required. |
| Is IPC v1 sufficient for the whole UI port? | **No.** `portfolio.analytics` is reserved; v1 `portfolio.save` returns only disposition/revision/durability fields, while the UI requires a full `PortfolioSaveResult`. These gaps cannot be filled by fabrication. |
| Narrowest future transport, if separately authorized | A trusted host-mediated adapter to the existing same-host IPC endpoint remains the narrowest **transport mechanism**. It is conditional on a PA topology/ownership decision and exact manifests; it is not a presently implementable CAP-02 bridge. |
| Recommended current action | **Defer implementation; preserve the session-only UI and all fences.** First reconcile the CAP-02 target with G1-B1, then decide the host/runtime/owner and the UI read/result contract before naming source files. |

The prior CAP-02 record's PR #45 path-level authority findings are preserved without retrospective amendment. This record refines its transport conclusion in four ways: (1) no existing IPD host was found; (2) published G1-B1 selects IRR as product host; (3) the frontend/backend ports and v1 results are not drop-in compatible; and (4) a future same-host IPC bridge therefore cannot yet be described as a small edit to an existing IPD desktop shell.

## 2. Repository coordinates, evidence domain and limits

### 2.1 Live state actually inspected

| Item | Verified result |
|---|---|
| IPD remote `main` | `73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2`; remote `git ls-remote` and clean local clone agree. Root tree is `66020736919befa5e5320550a396187cd351b40e`. |
| IPD PR #45 | `MERGED`; head `196a0e8804446efe32a21000bbf9f0a1e44954af`; merge commit is the investigated `73fd8c16…`. Merge/CI are facts, not blanket path authority or Gate 4 evidence. |
| IPD PR #42 | Open draft, head `afa430900c3e928773bd35a3718bf3d6c94ccff5`, `CONFLICTING`; not merged and not used as the current baseline. It contains IPC/persistence/tests, not a renderer host bridge. |
| IRR remote `main` | `dda81e6cd600f2f35f8ce0f8ed5d60627b92bc48`; tree `12fabf6dd624103fd6f6c0f95a7c840a33be6161`; fixed working branch began clean at the same commit. |
| Prior CAP-02 publication | IRR PR #205 merged as `dda81e6c…`; head `9cec08865eb4612b5fac228e2b9da4fc6edfec1c`; green CI. This establishes publication of the earlier proposal, not effectiveness of its PA decision sheet. |
| Working copies | IPD inspection clone: `/home/user/ipd-cap02-host-investigation`; IRR documentation checkout: `/home/user/iips-review-recovered`. No source file was edited in IPD. |

### 2.2 History and negative-evidence method

The investigation did not infer runtime composition from filenames or from the current tree alone:

- `git log --all`, path history, symbol/call-site searches, `git grep`, ancestry checks, remote PR inspection, and reachable-tree path censuses were used.
- The IPD clone contains **754 commits reachable from all refs** and **65 origin branch refs excluding `origin/HEAD`**. A product-source/config patch search for Electron/Tauri/preload/native IPC APIs returned no hit. No `CODEOWNERS`, `OWNERS`, or `MAINTAINERS` path was found in that reachable history.
- Historical `frontend/server/**`, `src/server/**`, and `src/ipc/server.ts` paths exist on other lineages. They are not current `main` composition and were not revived.
- Donor commits `42f91fad0ff5141fce665b068b544224ac471f73`, `1c5f46ca039148594bdf243b964a5853c6433248`, and Gate-B `cec7080252183a6a5332efe351e61c254d342a2d` are **not ancestors** of current IPD `main`.
- Current-product searches covered imports and call sites, not just dependency declarations. The absence of a desktop dependency was not treated as sufficient evidence by itself.

Negative evidence is bounded: an external operator machine, an unreferenced private ref, or an unprovided deployment bundle could contain additional composition. None was supplied or discovered. Exact external-host files therefore cannot be asserted. GitHub's branch-protection API returned `403 Resource not accessible by integration`; review enforcement is not inferred from green checks or mergeability.

### 2.3 Source anchors used for the component map

All blobs below are at the exact IPD baseline unless the row says IRR. Line references in this record are source locations at those blobs, not floating `main` links.

| Component | Path | Blob |
|---|---|---|
| Package/launch scripts | `package.json` | `0a3eec22a39048498601aa7b5672a40ede840d34` |
| Browser HTML entry | `index.html` | `da11320490cc9391e173ef967937954cb23fc1bb` |
| Vite config | `vite.config.ts` | `5563e1bcfadda4b9d443522481029e7f092851ad` |
| React bootstrap | `frontend/src/main.tsx` | `2518313526471dcea0257d491613a702f09c1d67` |
| Application routes/store composition | `frontend/src/app/App.tsx` | `36ffe2c73f79226e36e42541642c078c61e539f2` |
| Portfolio workspace | `frontend/src/features/portfolio/PortfolioWorkspace.tsx` | `068eed361934ad35ebf5275015cba6d89865db14` |
| Broker import modal | `frontend/src/features/portfolio/BrokerImportModal.tsx` | `f2ed480fdff2df795d0eed4cf03d7a1ce9db0ec2` |
| UI port/session adapter | `frontend/src/features/portfolio/portfolioStorePort.ts` | `d61f18dfdce12a7f0c4377a3c6d410026d454089` |
| UI in-memory store/result types | `frontend/src/features/portfolio/portfolio-store.ts` | `b900a2481b73ed7bd00406b18a39c8f493b4c0cc` |
| Import controller | `frontend/src/features/portfolio/import/ui-broker-import-view-model.ts` | `9066a9d45d3b76b8f7152db84d7ea130301bf78a` |
| Ingress orchestration | `frontend/src/features/portfolio/import/broker-import-ingress.ts` | `0742401fe2a9bf7a497e94e6bc3973e4327979e0` |
| Broker mapping/normalization | `frontend/src/features/portfolio/import/broker-holdings-mapper.ts` | `297e4a593bb575a5f3f8616788f3aa9e599707a4` |
| IPD identity resolver | `src/identity/security_master.ts` | `60030e0c17f8b2a31977ce598c80b18dc52d6727` |
| IPD mapping store | `src/identity/mapping_store.ts` | `eec60c09e08ec45a29979abf25b21efddef448ae` |
| IPC process entry | `src/ipc/entrypoint.ts` | `e3727bb5859381df3e91a57be83b4802ce6047b9` |
| Same-host endpoint | `src/ipc/endpoint.ts` | `e565aa5b343266f62ffd411d17d74c89b9f29324` |
| IPC dispatcher | `src/ipc/dispatch.ts` | `27becc76749f5b11a37ca4e6254d58132620f57f` |
| IPC protocol | `src/ipc/protocol.ts` | `f4dc72b12ed9d618d1cfde836160f992ff1be9a5` |
| Binding resolution | `src/persistence/binding.ts` | `4c5ea0d55ce2f9f4ec7dec124f9bfc122badef30` |
| Durable store | `src/persistence/portfolio_store.ts` | `c48479dbcd7244b5dc5086d70a18534780409164` |
| Backend store port | `src/persistence/durablePortfolioStorePort.ts` | `2bba27f48bf88212525096a11887f81bc7b1e7c8` |
| Broker import helper | `src/persistence/brokerImportPersistence.ts` | `59bb09eb3ca5770ddc6c1484796f237fadd2fbb2` |
| Accepted UI store-port act | `evidence/np04/IIPS_v3.0_G2_IPD_PORTFOLIO_UI_STORE_PORT_IMPLEMENTATION_AUTHORITY_ACT_2026-10-16.md` | `d0657706848d444189ea97358c3e51cd2b953b88` |
| Accepted consumer contract v1 | `evidence/cross-repository/IIPS_V3_G2_IPD_IRR_PORTFOLIO_CONSUMER_CONTRACT_V1_2026-10-18.md` | `163eb1f18ce023bb9a06917de99ca279fdb86bf7` |
| Accepted Gate E write policy | `evidence/cross-repository/IIPS_V3_G2_GATE_E_PORTFOLIO_WRITE_POLICY_2026-10-18.md` | `4a9501bffb49abbbc0ba5b5c4f81d2841812913e` |
| **IRR** real IPC client | `frontend/server/user-portfolio/ipcClient.ts` | `c1b885e3173132685090bcd2cbfa4aa8c87fa4ca` |
| **IRR** IPC consumer adapter | `frontend/server/user-portfolio/ipcPortAdapter.ts` | `7881185e2975139db6d0574a07ddccf829b08eb6` |
| **IRR** HTTP fence | `frontend/server/user-portfolio-transport.ts` | `51704c12a467cd2f718a030b5036bc55c9afa73f` |
| **IRR** 503 responder | `frontend/server/owner-context-unavailable.ts` | `cb8db45d668d28cee7e0a52721001d579a872733` |
| **IRR** published G1 host decision | `docs/integration/IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_RECORD.md` | `857d14513c3fc2c45f9015145fc7f36cd7ad6141` |

## 3. Actual runtime and startup composition

### 3.1 Browser/UI process

`package.json` exposes `dev: vite`, `build: tsc && vite build`, and test scripts. It has no `start`, desktop, native-host, IPC-server, or UI-plus-backend composition script. Vite emits the browser application to `dist-frontend`; the repository supplies no production UI server script for those assets.

The actual composition is:

```text
index.html
  └─ frontend/src/main.tsx:53–59
       ReactDOM.createRoot(...)
       └─ BrowserRouter
            └─ SessionProvider(ANONYMOUS_SESSION)
                 └─ frontend/src/app/App.tsx:309–345
                      ├─ getDefaultPortfolioStore() → in-memory PortfolioStore
                      ├─ getGovernedBroadSecurityMaster()
                      └─ /portfolio and /portfolio/*
                           └─ PortfolioWorkspace
                                (portfolioStore + securityMaster supplied;
                                 no storePort supplied by App)
```

`App.tsx:315` resolves the application-lifetime store through `getDefaultPortfolioStore()`. `PortfolioWorkspace.tsx:54–62` resolves the same store and, absent an injected port, constructs `SessionPortfolioStorePort`. It passes that port to `BrokerImportModal` at lines 458–467. The modal also has a session-port fallback at lines 62–65, but the current workspace supplies its own session port.

No native main process creates the browser window, no preload exposes host capabilities, and no application composition root starts both this UI and `startIpcServer`.

### 3.2 Separate Node IPC process entry

`src/ipc/entrypoint.ts` is a real direct-entry module: its `isMain()` branch calls `startIpcServer()` at lines 131–147. It is also imported directly by tests. It is not referenced by the package scripts or by the browser application.

The startup path is source-exact:

```text
startIpcServer (src/ipc/entrypoint.ts:65)
  ├─ validate supported runtime + endpoint + absolute IIPS_G3_DATABASE_PATH
  ├─ openDatabase
  ├─ ensureMigrations(GATE3_MIGRATIONS 001–003)
  ├─ verifyAuditChain
  └─ listenIpc(target, createConnectionHandler(db))
       └─ AF_UNIX socket on POSIX / Windows named pipe
```

`src/ipc/endpoint.ts:70–120` resolves the local endpoint; lines 246–315 bind it through `node:net`. This is not TCP, HTTP, or a URL listener. Startup does not provision an owner binding and does not import the provisioning module. A fresh/unprovisioned store therefore does not become operational merely because the endpoint can start in a fixture.

### 3.3 No composed product runtime

There are two technically real but separate runtime pieces:

1. the static browser/React UI with session-local state; and
2. a direct-entry Node IPC service with a local SQLite store and read-only dispatch plus write refusal.

No production application entry on current IPD `main` starts both, shares lifecycle, or connects them. Existing tests of each piece do not supply the missing composition.

## 4. Exact component map and call paths

### 4.1 Actual broker-import UI → session store path

```text
BrokerImportModal.handleFile
  └─ PortfolioBrokerImportController.selectAndProcessFile
       └─ BrokerImportIngressOrchestrator.executeIngress
            ├─ computeSha256(raw broker content)
            ├─ BrokerFormatDetector.detectFormat
            ├─ broker adapter.parse
            └─ mapBrokerOutputToUserHoldings
                 ├─ filter / aggregate / calculate values / normalize weights
                 ├─ SecurityMaster.resolveCompanyId (in the UI process)
                 └─ compute lineage and import provenance

BrokerImportModal.handleConfirmSave (BrokerImportModal.tsx:150–179)
  └─ PortfolioBrokerImportController.confirmAndSaveViaPort
       (ui-broker-import-view-model.ts:274–334)
       └─ storePort.saveHoldings({ portfolioId, holdings, options, expectedRevision })
            └─ SessionPortfolioStorePort.saveHoldings
                 (portfolioStorePort.ts:315–417)
                 ├─ refuse caller-supplied authority/owner claims
                 ├─ refuse unresolved identity before mutation
                 ├─ check session-scoped revision
                 └─ PortfolioStore.saveHoldings
                      └─ in-memory Map; SESSION_ONLY / durable:false
```

The UI passes `sourceBroker`, `fileName`, `contentDigest`, and `lineageDigest` in the save options. It does not pass an `importedAt` value through this asynchronous port call. The current modal derives its durable label from the selected port's durability (`confirmAndSaveViaPort` sets `this.durability`; `BrokerImportModal.tsx:608–617` renders the result). With the actually injected session port, the result is truthfully `SESSION_ONLY` / `durable:false`. Workspace success/refresh toasts also explicitly say session-only (`PortfolioWorkspace.tsx:114–149`).

**No edge exists** from this path to `src/ipc/**`, `src/persistence/**`, `persistBrokerImport`, an HTTP API, or a native host. Browser-side Security Master resolution is useful for the current preview/session path; it is not IPD-server-side canonical identity resolution for a future wire write.

### 4.2 Actual IPC request path

```text
startIpcServer
  └─ createConnectionHandler(db)
       └─ new DurablePortfolioStore(db)              (dispatch.ts:89–94)
            per connection:
            ├─ readSingleFrame                       (framing/version/op checks)
            ├─ findRefusedWireKeys(envelope)         (caller authority / canonical claims)
            ├─ resolveActiveBinding(db)               (per request)
            │    └─ its own BEGIN IMMEDIATE … COMMIT/ROLLBACK
            ├─ if op is a write:
            │    └─ WRITE_NOT_AUTHORIZED; return     (dispatch.ts:228–233)
            └─ otherwise:
                 ├─ portfolio.list      → store.list(owner)
                 ├─ portfolio.get       → store.get(owner, portfolioId)
                 └─ portfolio.revisions → store.revisions(owner, portfolioId)
```

An absent/invalid/revoked binding refuses before dispatch. Every write that reaches the post-binding write branch is refused before a store mutation. There is no `broker.import` operation. `portfolio.analytics` is reserved, not dispatched.

The dispatcher uses `DurablePortfolioStore` directly. It does **not** compose `DurablePortfolioStorePort` or `persistBrokerImport`. Product-source call-site searches found no caller of `persistBrokerImport` and no product caller of `DurablePortfolioStorePort`; their positive durable-import behavior is exercised through tests/fixtures, not through the admitted product UI/IPC path.

### 4.3 Direct fixture path — not a UI/IPC path

`tests/q1_broker_import_durability.test.ts` calls `persistBrokerImport` with a disposable `DurablePortfolioStore` or the W-1-gated backend port. The helper performs:

```text
persistBrokerImport(writer, owner, request)
  ├─ evaluateBrokerImportIdentityGate(request.holdings)
  ├─ mapBrokerImportHoldings
  ├─ computeBrokerImportProvenance
  ├─ writer.list(owner) to find an existing portfolio
  └─ writer.create(...) or writer.save(...)
```

This establishes useful component/fixture evidence only. It does not establish a renderer/host/IPC round trip, a provisioned operational store, W-3/W-4 transaction atomicity, or Gate 4 qualification. Supplying `owner` to the helper in a fixture is not the IPC dispatcher's per-request binding resolution.

### 4.4 IRR's real client and its separate fence

IRR contains a real same-host IPC client, but it is not an IPD renderer bridge:

```text
IpcUserPortfolioPort (IRR server adapter)
  └─ callIpc(op, payload)
       ├─ encode and locally refuse forbidden authority keys
       ├─ one node:net connection to AF_UNIX / named-pipe target
       ├─ one request / at most one response
       ├─ no automatic retry
       └─ timeout/transport loss → OUTCOME_UNKNOWN for a write
```

`ipcClient.ts` creates no listener and no IPD process. `ipcPortAdapter.ts` creates no route admission. All current `/api/user-portfolios*` route-method pairs still end at `respondOwnerContextUnavailable` with HTTP `503 owner-context-unavailable`; `user-portfolio-transport.ts` does not construct the adapter. Consequently the IRR client is evidence that a host-side Node IPC client is technically feasible, not evidence of an admitted CAP-02 UI path.

It is also not a drop-in serializer/result mapper for this task:

- `toWireHolding` deliberately strips canonical identity, lineage and weight fields; this is appropriate for caller-identity refusal but is not a complete broker-import/provenance mapping by itself.
- After any upstream `portfolio.save` success, `IpcUserPortfolioPort.saveHoldings` throws an envelope-gap error because v1 lacks the full G2 save result. It does not return a working save success.
- Its save serializer places `mode`, `contentDigest`, `fileName`, and `sourceBroker` under `payload.options`, while accepted v1 §6 declares top-level `mode`, `contentDigest?`, and `broker?`; `expectedRevision` can be omitted even though Gate E W-5 makes it mandatory. Current W-1 refusal occurs before a successful write could expose these differences. A future implementation must reconcile them explicitly rather than copy the adapter unchanged.
- Existing read mappings have separately recorded missing-field/rename gaps. None may be resolved by inventing values.

## 5. Bridge status and host/runtime ownership

### 5.1 Bridge verdict

**Bridge status: NOT PRESENT on the verified IPD `main`.** More exactly:

- no native application host for the IPD browser UI was found;
- no renderer-to-preload/main channel was found;
- no host-owned broker-import IPC client was found;
- no UI injection of a durable/host-backed port occurs in `App`;
- no package launch script composes UI and IPC; and
- no product call joins `persistBrokerImport` to IPC dispatch.

The result is not “a bridge exists but is disabled.” The current repository lacks the application composition in which such a bridge would run.

### 5.2 Ownership disposition

| Boundary | Disposition | Evidence and limit |
|---|---|---|
| Integrated IIPS product/application host | **IRR** | Published G1-B1, `docs/integration/IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_RECORD.md` §3, selects IRR `main` for the application shell, product routing, product-level transports/orchestration and integrated UX. Publication commit `800789957f2a3cf4e28d5dfff49d92f29d6a7671` is an ancestor of the investigated IRR baseline; tracker `REG-01` records it as published. |
| IPD portfolio domain, durable persistence and IPC service | **IPD** | Accepted consumer contract v1 header/§1 and Gate E assign the domain/store/server to IPD. IRR host authority expressly does not transfer IPD domain/persistence ownership. |
| Existing IPD broker-import UI component | **IPD source component; session-only UI act** | The effective UI store-port act authorizes dependency inversion/session adaptation only and excludes IPC/transport/durable writes. It is not a designation of a new IPD product host. |
| New IPD-local native host/preload/bridge | **UNRESOLVED — no established owner or runtime** | No effective record names an owner, technology, process model, lifecycle, exact source paths or tests. No ownership file or native host implementation was found. Commit authorship and repository ownership do not fill this gap. |

**Minimum governance action required:** the PA must reconcile the CAP-02 target with G1-B1 before any implementation manifest is written:

1. If G1-B1 remains unchanged, future host-mediated integration belongs at the IRR product-host boundary and must be separately scoped; the current CAP-02 record expressly excludes making IRR/CAP-03 routes a dependency. That is not a CAP-02-only implementation.
2. If the PA instead wants an IPD-local application host for this UI, the PA must expressly establish that exception/topology, name its owner and runtime, and then authorize exact new files and tests. No such decision can be inferred from the presence of IPD UI source.

Until one of those paths is decided, “IPD's host owner should add the bridge” is not an executable or evidence-backed assignment.

## 6. Interface, wire and result compatibility

### 6.1 The two `PortfolioStorePort` interfaces are different

| Concern | Frontend UI port | Backend durable port |
|---|---|---|
| Path | `frontend/src/features/portfolio/portfolioStorePort.ts:108–116` | `src/persistence/durablePortfolioStorePort.ts:23–29` |
| Reads | `getPortfolio`, `getAnalytics`, `getRevision` | `list`, `get`, `revisions`, `contributions` |
| Save | asynchronous `saveHoldings(PortfolioPortSaveRequest)` | synchronous owner-scoped `create/save/reset/delete` methods on the class, outside its declared read interface |
| Identity | no owner/tenant/principal parameters | every method requires server-resolved `OwnerRef` |
| Success | full `PortfolioPortSaveSuccess` containing UI `PortfolioSaveResult`, revision and durability | revision number from mutation methods |
| Runtime | browser-safe in-memory session implementation | Node/`node:sqlite` durable-store wrapper |

The same name does not make them interchangeable. A host adapter must implement the frontend contract explicitly and call the backend through a transport; direct class injection is neither type-correct nor browser-safe.

### 6.2 v1 does not cover the complete UI port

- `PortfolioWorkspace.refreshPortfolio` calls `getPortfolio`, `getAnalytics`, and `getRevision` together (`PortfolioWorkspace.tsx:88–108`). Accepted v1 marks `portfolio.analytics` **RESERVED / not available** and excludes the associated user-owned analytics decision. A host adapter cannot silently synthesize `PortfolioAnalyticsSummary` or silently mix durable holdings with stale session analytics.
- UI `PortfolioSaveResult` requires the portfolio, saved count, market value, weight sum, save time and provenance (`frontend/src/features/portfolio/portfolio-store.ts:44–57`). v1 `portfolio.save` returns `{disposition, revision, durability, durable}`. The UI controller assigns `outcome.result` directly to its save result. A future adapter needs an authoritative read-back/result mapping or a governed UI change; it cannot invent the missing values.
- v1 read shapes and the frozen IRR G2 shapes already have recorded missing-field/rename gaps. Those gaps are independent evidence that “reuse the existing client” is not a complete integration plan.

### 6.3 Raw observations versus canonical identity

Accepted v1 permits broker-observed holding fields and refuses `companyId`, `runtimeCompanyId`, `identityStatus`, and `resolutionDisposition` anywhere on the wire. The current UI mapper resolves canonical identity in the browser and places those fields in `UserHoldingInput`. The backend `BrokerImportRequest` likewise requires canonical fields and `persistBrokerImport` validates them; it does not resolve raw identifiers through IPD's Security Master.

A future path therefore needs an explicit, lossless projection of broker observations across the wire followed by IPD-side canonical resolution. It must not forward browser canonical claims, silently drop provenance, or treat the current helper as a compliant IPC handler.

## 7. Transaction, identity, provenance, durability and operational gaps

| Gap | Current source finding | Required future resolution; no change made here |
|---|---|---|
| W-3 binding/write atomicity | `resolveActiveBinding` opens and closes its own immediate transaction before dispatch. Portfolio mutation happens later. | Revalidate the binding and ACTIVE membership inside the same immediate/serialized transaction as the mutation; test revocation racing a write. |
| W-4 request atomicity | `DurablePortfolioStore.create/save/writeRevision` performs portfolio, revision, holding, current-revision and contribution statements without an enclosing multi-statement transaction. `persistBrokerImport` adds a list-then-create/save sequence. | One request/one atomic transaction covering revision check, idempotency, binding revalidation and all rows; all-or-nothing rollback and fault injection. `journal_mode`/`synchronous` alone do not prove this. |
| Canonical identity | UI resolves identity before save; helper accepts canonical claims; IPC forbids those claims and has no resolver call. | Initialize the authoritative IPD D05/mapping source server-side, resolve raw observations per holding, refuse zero/ambiguous matches for the whole request, and emit per-holding evidence with no partial write. |
| Request/wire shape | UI options, helper request, IRR serializer and v1 do not have one identical envelope. `expectedRevision` is optional in some existing interfaces but mandatory under W-5. | PA-backed exact payload mapping and validation; no nested/renamed fields by assumption, no missing revision token, no caller authority keys. |
| Contribution/file provenance | UI supplies file/broker/content/lineage values but no `importedAt`; helper requires `importedAt` yet does not store it as a complete contribution record. `fileName` participates in helper digest computation but is not a v1 save field. Existing contribution rows are a narrower projection. | Decide authoritative file/import-time/broker/lineage semantics and required schema/projection separately. Preserve the existing DR-4/contribution-schema decision requirement. No silent dropping or migration in CAP-02-HOST-01. |
| UI read/result model | v1 lacks UI analytics and the full UI save result; existing IRR adapter refuses after upstream save success rather than fabricate. | Authoritative read-back/result mapping or explicitly governed UI/contract changes; analytics must remain unavailable or be separately authorized. No mixed session/durable view presented as one committed state. |
| Idempotency/concurrency | Content-digest no-op behavior has fixture evidence, but list-then-write and absent request transaction do not establish concurrent atomic idempotency. | W-8 content-digest semantics, mandatory expected revision, duplicate before/after restart, concurrent/replay tests, and no automatic write retry. |
| Outcome unknown | IRR client correctly reports timeout/transport loss as outcome-unknown; IPD UI has no host path or reconciliation flow. | Host/UI outcome vocabulary must distinguish refusal, success and unknown; reconcile by read before any user-initiated retry; never convert timeout to failure or success. |
| Durable acknowledgement | Current UI is session-only; backend write dispatch refuses; fixture success is not product success. | Return durable success only after actual authorized transaction commit and applicable acceptance/admission. Preserve `durable:false` now; do not infer durable capability from SQLite or green tests. |
| Operational binding | Gate A′ is approved but not executed; its pinned provisioning/schema basis is incompatible with current IPD provisioning/schema. No applicable execution receipt or operational binding was established. | A compatible successor provisioning authority and actual target-host execution record are prerequisites. No environment flag or fixture row substitutes. |
| W-1 / Gate 4 / Gate 5 | Gate E policy acceptance alone is insufficient; the bounded Gate 3 acceptance is not authority for this new UI/write path. The Gate 4 act remains proposed/not effective and is pinned to older IPD `1cceacfff40f22dbc9cd64906bf26a5feac1075e`; its H-12 candidate is not adopted. No QE run on designated Windows host `desktop-no0nhtp`, separate Gate 4 result acceptance, or Gate 5 admission exists. | A new exact Gate 3 implementation manifest; effective Gate 4 authority at final exact pins with an adopted H-12 basis; applicable provisioning; target-host QE-1…QE-11 and any separately required Gate C/QE-11 acceptance; separate Gate 4 result acceptance; then a separate Gate 5 admission act. Hosted CI is not a substitute. |

## 8. Transport alternatives and refined recommendation

| Alternative | Assessment | Disposition |
|---|---|---|
| Browser directly opens AF_UNIX / Windows named pipe | Browser APIs do not expose `node:net`; no native bridge exists. | **Technically not viable as a direct browser path.** |
| Inject backend `DurablePortfolioStorePort` directly | Interface mismatch and Node/SQLite runtime dependency; no browser transport. | **Reject.** |
| New host directly imports the store/helper in process | Would bypass the accepted IPC composition and its per-request framing/binding/write boundaries; the helper is outside located effective implementation authority and accepts caller canonical identity. | **Do not select as a shortcut.** It would need a separate architecture/authority decision and still would not satisfy Gates 4/5. |
| Add loopback HTTP/TCP | New network/origin/security surface contrary to v1 T-1 and the existing endpoint design. | **Reject for CAP-02.** |
| Add `broker.import` | Adding/changing a write operation is a major contract change requiring Gate E revision; broader than necessary for raw holdings if v1 can be made to fit. | **Do not select without a separate major contract/policy act.** |
| Route this IPD UI through IRR server/API | G1 selects IRR as product host, but current CAP-02 excludes making IRR/CAP-03 a dependency; all relevant routes remain 503-fenced and adapter/result gaps remain. | **Excluded from this pass.** A G1-consistent future integration would be separately scoped and admitted, not a hidden CAP-02 bridge. |
| Trusted host-mediated adapter → existing same-host IPC | Avoids a network listener and keeps IPD persistence/identity behind its server boundary. Requires a real host, owner, lifecycle, typed renderer bridge, compatible UI read/result model, raw-observation mapping and later write prerequisites. | **Conditional narrowest future transport — PROPOSED / NOT EFFECTIVE. Not currently implementable as an IPD-local CAP-02 patch.** |
| Preserve session-only and defer | No new host/authority/security surface; truthful current behavior remains. | **Recommended current disposition.** |

### 8.1 Refinement of the prior CAP-02 transport wording

The prior proposal's conditional preference for a trusted host-owned same-host IPC bridge remains a reasonable **transport preference**, but it is not sufficient as an implementation direction:

1. there is no identified IPD host to edit;
2. G1-B1 already names IRR as the integrated product host;
3. v1 cannot satisfy the UI's analytics and full save-result needs unchanged; and
4. the IRR client/adapter is fenced and has its own payload/result gaps.

Accordingly, this record does **not** recommend inventing an Electron/Tauri/preload path or immediately authorizing a v1 write bridge. The next decision is topology and ownership, followed by UI/contract semantics; only then can exact files be named.

## 9. Narrowest viable future implementation boundary

### 9.1 What can be bounded now

After the PA resolves §5.2 and the read/result decisions, the narrowest credible **transport-only** boundary is:

1. one explicitly owned application-host composition root with defined UI/IPC startup and shutdown lifecycle;
2. one host-side typed IPC client for the existing endpoint, with one-request/no-retry/outcome-unknown behavior;
3. one narrowly exposed typed renderer ↔ host bridge that exposes no general Node, filesystem, socket, owner, credential or canonical-identity capability;
4. one adapter injected at the existing `PortfolioWorkspace.storePort` seam (and supplied by `App`, which currently supplies no port), implementing the complete UI result/read contract without fabrication; and
5. reuse of the existing IPD `startIpcServer`/endpoint/dispatch, without a new network listener or new write operation.

The broker parser/mapper and current session adapter should remain outside the transport-only delta. The session-only default and `durable:false` regression behavior must remain intact until a separately authorized durable path is admitted.

**Exact new host/bridge filenames are intentionally not specified.** No existing host path was found, and choosing names now would fabricate an implementation manifest. The future act must name the actual technology, owner, files, process lifecycle, interfaces and tests after the topology decision.

### 9.2 What must remain a separate later write boundary

The transport adapter must not silently carry a backend write implementation in its manifest. A separate effective write act must name and test:

- IPD `portfolio.save` dispatch and exact v1 payload/result behavior;
- IPD-side raw-identifier resolution and its initialized authoritative source;
- the single immediate transaction including binding revalidation and all mutations;
- complete contribution/file/import-time/lineage semantics and any separately authorized schema work;
- mandatory revision, idempotency, outcome-unknown and restart behavior; and
- the real UI → renderer bridge → host client → IPD socket → store path.

A read-only host milestone may be separately authorized, but it must either provide truthful complete read projections or leave the durable portfolio surface explicitly unavailable. It must not mix a durable save with session reads/analytics and call the result integrated.

### 9.3 Rollback boundary for any later transport act

A future transport-only change must be revertible by removing its new host/composition/adapter/injection files and restoring the existing session-port default, without a schema migration, data rewrite, fence lift or change to broker parsers. Backend write/transaction/identity/provenance changes require their own commits and rollback/stop conditions. Any later migration requires a separate data-recovery and rollback decision; it is not covered by this transport rollback boundary.

## 10. Required future evidence

Existing unit and fixture suites remain necessary but insufficient. A later effective act must require, on the exact composed path:

1. **Composition proof:** the actual product host starts the UI and IPD service, injects the intended port, and closes both cleanly; a static import test alone is insufficient.
2. **Real-path IPC proof:** UI action → renderer bridge → host client → real IPD socket → dispatcher/store. Direct store fixtures cannot substitute for this evidence.
3. **Read/result truthfulness:** portfolio, revision, analytics/unavailable state, save result and durability labels are complete and sourced; missing fields refuse rather than fabricate.
4. **Identity/security:** raw observations only on wire; forbidden owner/canonical keys refused; zero/ambiguous identity refuses the whole import with no row changes; no renderer bypass.
5. **Transaction/fault proof:** failure after each mutation step rolls back every portfolio/revision/holding/contribution change; revocation racing a write cannot commit after revocation.
6. **Idempotency/concurrency:** duplicate content produces no new revision before or after restart; mandatory expected revision and concurrent conflict behavior are demonstrated.
7. **Restart/crash durability:** commit → stop both applicable processes → restart → read-back; forced termination during write yields the complete revision or none; migrations/audit verify before bind.
8. **Outcome unknown:** timeout after send is unknown, never automatically retried or labelled failed/success; reconcile-by-read precedes any user retry.
9. **Negative/fence regression:** W-1 refusal, HTTP 503 fences, the operational binding remaining unestablished, and current `SESSION_ONLY`/`durable:false` behavior remain until their separate acts change them.
10. **Target-host qualification:** applicable provisioning first, then native Windows QE-1…QE-11 at exact adopted commits with raw evidence. Linux CI and fixture results remain supplementary.
11. **Separate acceptance/admission:** Gate 4 result acceptance is a distinct act after the run; Gate 5 admission is a later distinct act naming qualified commits and operations. Neither is inferred from test success or PR merge.

## 11. PA decision input — **PROPOSED / NOT EFFECTIVE**

> **Status:** `PROPOSED — NOT EFFECTIVE — NO IMPLEMENTATION OR OPERATIONAL AUTHORITY`. Publication of this section publishes a proposal only. It records no PA selection, signature, approval ID, effective date, Gate movement or write authorization.

### 11.1 Proposed disposition for PA determination

> 1. **Acknowledge the investigated current state.** The IPD broker-import UI is browser-hosted and session-only; its durable backend/IPC implementation is separate; no renderer-to-host bridge or composed IPD application host exists on the verified baseline. This acknowledgement preserves, and does not retrospectively amend, the prior CAP-02 PR #45 authority findings.
> 2. **Preserve the present boundary.** Keep `SessionPortfolioStorePort`, `SESSION_ONLY` / `durable:false`, unconditional IPD write refusal, the operational-binding-unestablished posture, and every IRR HTTP 503 fence. Do not enable broker-import operational writes or treat fixture success as UI/IPC integration, transaction proof or Gate 4 evidence.
> 3. **Record the ownership stop.** G1-B1 assigns the integrated product/application host to IRR; G-2/v1 assigns portfolio persistence and IPC to IPD. No owner/runtime is established for a new IPD-local native host. Reconcile that topology expressly before assigning a bridge or naming files; commit authorship does not decide ownership.
> 4. **Defer CAP-02 source implementation now.** Do not create a desktop shell, preload, network listener, direct store shortcut, `broker.import` operation, or IRR/CAP-03 dependency under this record. This is the recommended current disposition.
> 5. **Retain only a conditional transport preference.** If a later PA topology decision establishes the host and caller, prefer a narrowly typed host-mediated adapter to IPD's same-host IPC over a new network listener. Reuse v1 `portfolio.save` only if its exact raw-observation, revision and provenance semantics fit; v1 is not a complete implementation of the current UI store port.
> 6. **Require separate effective acts.** Before implementation, name the host/runtime/owner and exact new files; resolve UI analytics/read/save-result mapping; authorize the exact client/caller and manifests. Before writes, separately resolve IPD-side identity, complete provenance, transaction atomicity, outcome-unknown behavior and applicable provisioning. Gate 4 qualification, separate Gate 4 result acceptance, and Gate 5 admission remain distinct later prerequisites.
> 7. **Preserve exclusions and rollback.** No CAP-03 or unrelated work, G24 revival, schema/migration/identity-mapping change, IPC authorization change, operational write, route/fence lift, production eligibility or `durable:true` claim is granted. Any future transport-only increment must rollback to the unchanged session-port default without data migration; backend/data changes require separate rollback boundaries.

### 11.2 Topology question the PA must answer before an implementation act

| Choice | Consequence | Current recommendation |
|---|---|---|
| **G1 unchanged / integrated IRR host** | Treat the IPD UI as a component/donor for a separately scoped IRR-host integration. Existing IRR routes remain fenced until Gate 5; CAP-02 does not implement that path. | **Consistent with published host governance; defer and scope separately if desired.** |
| **IPD-local application-host exception** | Expressly establish why CAP-02 needs a separate IPD application host despite G1-B1; name owner/runtime/lifecycle, then exact host/bridge/UI/IPC files and tests. | **Not established; no preference or technology selected by this investigation.** |
| **Remain session-only** | Make no durable UI transport change and revisit only when the operational/contract prerequisites are ready. | **Lowest-risk current state and compatible with deferral.** |

Technical feasibility of a host-mediated socket client does not choose among these governance options.

## 12. Validation executed for this investigation

### 12.1 IPD exact-baseline checks

Environment: Linux, Node `v22.22.3`, npm `10.9.8`, clean IPD checkout at `73fd8c16…` / tree `66020736…`.

| Command | Result |
|---|---|
| `npm ci --no-audit --no-fund` | PASS; 33 packages installed from lockfile |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npm run build` | PASS, exit 0; TypeScript and Vite browser build completed |
| `npm test` | PASS; guarded run discovered **802 tests**, **801 passed**, **0 failed**, **1 skipped**; 89 top-level TAP suites, 107 total suites reported |

The Vite chunk-size warning is informational and does not alter the result. These are supplementary Linux repository checks. They do not prove native Windows behavior, UI-to-IPC composition, transaction atomicity, operational provisioning, Gate 4 qualification/acceptance, Gate 5 admission, or a durable product write.

### 12.2 IRR exact-source-baseline checks

Environment: Linux, Node `v22.22.3`, npm `10.9.8`, IRR source baseline `dda81e6c…`.

| Command | Result |
|---|---|
| `npm ci --no-audit --no-fund` | Initial sandbox CA verification failure (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`); rerun with the runbook-prescribed `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt` succeeded with 188 packages. TLS verification was not disabled and no lockfile changed. |
| `npm run typecheck` | PASS, exit 0 |
| `npm run typecheck:replay-server` | PASS, exit 0 |
| `npm run test:ci` | PASS; **87 files / 1,077 tests passed / 0 failed** |
| `node .ci/assert-tests.js .vitest-report.json` | PASS; non-zero fully passing run confirmed |
| `npm run build` | PASS, exit 0 |

The suites include the real IPC client/adapter tests and all twelve fenced user-portfolio route-method pairs. They confirm existing fence/client behavior, not its admission or reuse by the IPD UI.

### 12.3 Documentation and mutation checks

The documentation delta is limited to this new record, the additive prior-CAP-02 addendum, and the additive tracker §16.83/change-log continuation. At local preparation, staged `git diff --check` and UTF-8/final-newline/trailing-whitespace/code-fence/local-link/table/identifier checks all **passed**; the staged scope is exactly those three documentation paths, and the G1, IPC client/adapter and HTTP fence blobs remain byte-identical to baseline. Hosted IRR PR CI is verification of the documentation package only. Final PR, merge and independent remote read-back coordinates are reported by the containing publication receipt; this record does not predeclare them.

IPD remained Git-clean after installation/build/tests (`node_modules/`, `dist/`, and `dist-frontend/` are ignored). No IPD tracked/source file, ref, commit, PR, issue, comment, workflow, schema, mapping, route or operational store was changed. No IPD push occurred.

## 13. Final CAP-02-HOST-01 status

```text
Current UI runtime:                 Browser / Vite / React
Current UI persistence:             In-memory session store; durable:false
IPD IPC implementation:             Present as separate direct-entry Node source
UI ↔ IPC product composition:       NOT PRESENT
Renderer ↔ native host bridge:      NOT PRESENT on verified IPD main
Durable store / IPC owner:          IPD
Integrated product host owner:      IRR (published G1-B1)
New IPD-local host/bridge owner:    UNRESOLVED
Operational broker-import writes:   NOT AUTHORIZED
Gate 4 qualification:               NOT EXECUTED; authority proposal not effective
Gate 4 result acceptance:           NOT RENDERED
Gate 5 admission:                   NOT GRANTED / NOT INITIATED
PA input in this record:            PROPOSED / NOT EFFECTIVE
Recommended current action:         DEFER implementation; resolve topology first
```

No exact host files are invented. The required follow-up is a PA topology/ownership determination and then an exact, separately authorized implementation manifest. Until then, the existing session-only behavior and all write/route fences remain the truthful and governing state.
