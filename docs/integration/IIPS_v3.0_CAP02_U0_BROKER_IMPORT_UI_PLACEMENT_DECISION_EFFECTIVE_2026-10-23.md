# IIPS v3.0 — CAP-02 — U0 Broker-Import UI Product Placement Decision — **RENDERED — EFFECTIVE (PRODUCT PLACEMENT AND BOUNDARY ONLY)**

> ## STATUS: **EFFECTIVE — PRODUCT PLACEMENT AND BOUNDARY DETERMINATIONS ONLY — NO IMPLEMENTATION, ROUTE ADMISSION, TRANSPORT, WRITE, GATE OR ADMISSION AUTHORITY**
> This record **renders** the U0 product-placement decision that
> `IIPS-V3-CAP02-HOST-BOUNDARY-IMPLEMENTATION-ACT-2026-10-23-01` §9 named as its first blocker, and that
> the effective CAP-02 topology decision left as the single next dependency.
>
> **It authorizes no source change, no file move, no IPD export, no renderer route, no bridge, no write,
> and no gate movement.** Operational writes remain disabled; IPD continues to answer
> `WRITE_NOT_AUTHORIZED` before mutation; all twelve IRR `/api/user-portfolios*` route-method pairs
> continue to answer `503 owner-context-unavailable`; the broker-import UI continues to report
> session-only saves as `durable:false`.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP02-U0-BROKER-IMPORT-UI-PLACEMENT-EFFECTIVE-2026-10-23-01` |
| **Record type** | Rendered Program Authority decision — product placement, component/domain ownership boundary, reuse direction, downstream dependency order |
| **Status** | **EFFECTIVE (placement and boundary only)** — implementation, transport admission and writes remain unauthorized |
| **Decision date / effective date** | `2026-10-23` (UTC) |
| **Decision authority** | Ramki — Program Authority, single owner/user of the single-user personal-use IIPS platform |
| **Authority exercised** | The PA's **standing grant of global decision and execution authority** (2026-10-12), transcribed at `docs/integration/IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` §1.2, blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02` (re-computed from `origin/main` this pass), **as construed** by `IIPS-V3-DEC06-AUTHORITY-RECONCILIATION-IRR-2026-10-21-01` (§§4.1, 4.3, 4.7) **plus** the current PA direction of `2026-10-23` instructing U0 to be resolved in this pass under the existing authorization |
| **Governing prior decision** | `IIPS-V3-CAP02-PA-TOPOLOGY-OWNERSHIP-EFFECTIVE-2026-10-23-01` (topology and ownership only), item 4 — renderer-to-IPD integration must first identify its host composition root, lifecycle owner, bridge boundary and exact files |
| **Publication authority** | Standing PR-lifecycle execution and merge authorization `CHG-2026-10-18-02`, applied per §12 |
| **Rendered in repository** | `ramkivs/iips-review-recovered`; branch `arena/889e5b5f-iips-review-recovered` |
| **Supersedes as a blocker** | U0 in the dependency register of `IIPS-V3-CAP02-HOST-BOUNDARY-IMPLEMENTATION-ACT-2026-10-23-01` §9 — **the act itself is preserved unamended**; only its §12 "first blocker" is discharged, and an additive §13 records the change of direction |
| **Evidence baselines** | IRR `main@e5b91029346603cceb07924cd3dd411cea2dc23d` (merge of PR #211); IPD `main@73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2`, tree `66020736919befa5e5320550a396187cd351b40e` (read-only) |
| **Mutation boundary** | IRR documentation only. No source, test, schema, mapping, migration, store, route, fence, workflow, ref or issue change. IPD untouched. |

---

## 1. The decision

**It is decided, effective `2026-10-23`, that:**

> 1. **The broker-import UI stays in IPD as an IPD-owned component set.** No file moves between
>    repositories. `BrokerImportModal`, the `import/*` pipeline (adapters, format detector, holdings
>    mapper, ingress orchestrator, view model) and `portfolioStorePort` remain authored, tested and
>    released in `ramkivs/iips-production-market-data`.
> 2. **IRR is the only host that composes and renders it.** No IPD-local application host is created;
>    the IPD `frontend/src/app/**` shell is not promoted to a second product host and is not consumed
>    by IRR as a shell.
> 3. **Component and domain ownership follow the repository boundary, not the renderer boundary.** IPD
>    owns the UI components, the broker parsing/mapping/ingress pipeline, canonical identity resolution,
>    provenance and lineage digests, portfolio consolidation arithmetic, and durable persistence. IRR
>    owns routing, navigation, the renderer composition, the host process, the renderer-to-host
>    transport, and the adapter that presents IPD's `PortfolioStorePort` to IRR's host.
> 4. **Reuse is by governed package export, never by copy.** IRR consumes the IPD component set through
>    an IPD-owned export surface introduced by an **IPD** packaging act. Duplicating the pipeline,
>    relocating it, or re-implementing identity resolution in IRR is excluded.
> 5. **The save path is the existing port seam.** IRR supplies the `PortfolioStorePort` implementation;
>    the IPD component keeps its own session-only default and its `durable:false` truthfulness
>    invariant. IRR may not set, default or imply `durable:true`.
> 6. **The U1 transport boundary is determined but not admitted.** The renderer-to-host boundary is a new
>    CAP-02-owned HTTP namespace on the existing IRR host, with the existing IPC contract v1 unchanged
>    and no new listener. Admission and registration belong to an implementation act (§7); this record
>    grants neither, and the existing `/api/user-portfolios*` fence is untouched.
> 7. **The complete user-to-persistence path is testable before any write is authorized** — and must be
>    tested through refusal. A write that reaches IPD while W-1 is unmet ends in
>    `WRITE_NOT_AUTHORIZED` with zero store effect; that refusal is the correct, asserted outcome of the
>    first end-to-end increment, not a defect to be worked around.
> 8. **Placement does not create capability.** U2–U7 remain distinct, non-substitutable prerequisites and
>    none is satisfied by this decision.
> 9. **All existing write denial, all twelve IRR `503` route-method pairs, the closed IPC contract v1,
>    the durable store and schema, and every gate status are preserved unchanged.**
> 10. **Nothing here is an implementation authorization.** The exact implementation scope that remains
>     unauthorized is enumerated at §7 and prepared at
>     `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-2026-10-23-02`.

The disposition is recorded in the NP-18 / DEC-06 §8 form: a bounded, evidence-bound act recorded by the
operating session under the standing grant, with **no fabricated signature, spoken selection, approval
identifier or independently held agent jurisdiction**. Its identifier is a project record ID, not an
approval number.

---

## 2. Authority basis, stated exactly

### 2.1 The standing grant

The operative sentence, transcribed verbatim at F-3 §1.2 (blob `c4c9f7d7…`, re-computed this pass):

> "The single user is the Program Authority and has explicitly granted global decision and execution
> authority for this project. This standing authorization covers the necessary decisions, governance
> records, implementation, testing, corrections, and publication within the established scope. Do not
> request repeated approval for individual decisions or routine implementation steps. The
> authorization does not permit fabricated evidence, weakened safeguards, unrelated scope expansion,
> or claims of success without verification."

### 2.2 The construction applied

`IIPS-V3-DEC06-AUTHORITY-RECONCILIATION-IRR-2026-10-21-01`, whose rules this record relies on:

| Rule | Effect relied on here |
|---|---|
| **R-1** | The grant is project-wide within established scope and is **not re-asked per decision**. |
| **R-3** | **Authorization, act and proof are three different things.** The grant authorises the making of this act; the act is this record; proof is remote state (merge commit + blob identity). |
| **R-6** | A record may not imply an act it did not perform. §7 therefore states what this record does **not** authorize. |
| **R-7** | **Capacity.** An IRR record may determine authority and fix a boundary; it may not perform or prove an IPD act. §7 therefore names the IPD packaging act as a blocker instead of asserting it. |

### 2.3 Why U0 is a decision the grant reaches

| Test | Finding |
|---|---|
| Is U0 an established PA work item? | Yes. It is the blocker named by name in the effective CAP-02 dependency register (`U0`), and the prior act's §9 states the exact act required: "A PA product-scope decision naming the UI's home". |
| Is it a "necessary decision" or scope expansion? | A necessary decision. It selects between placements that already exist in the two authoritative repositories. It creates no capability, market, product line or authority. |
| Does it require a gate, a signature or an approval ID? | No. The governing records define no signature requirement for a product-placement determination, and §2.2 forbids manufacturing one. |
| Does it weaken a safeguard? | No. Every fence, refusal, contract and gate status is preserved verbatim (§9, §10). |
| Does it claim success without verification? | No. Every factual input is cited to a path and blob at a stated baseline (§3), and every non-effect is stated (§7, §9). |
| Does it exceed capacity? | No. The IPD-side consequence (an export surface) is recorded as an IPD act to be performed in IPD, not performed here (R-7). |

**Conclusion:** the standing grant covers rendering U0. No uncovered authority boundary prevented it, and
no blanket reapproval is requested.

---

## 3. Evidence baseline and verification

### 3.1 Baselines

| Repository | Baseline | Tree / note |
|---|---|---|
| IRR | `main@e5b91029346603cceb07924cd3dd411cea2dc23d` (merge of PR #211) | verified `git fetch origin main` this pass; `origin/main` equals the local base |
| IPD | `main@73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2` | tree `66020736919befa5e5320550a396187cd351b40e`; read-only, not modified |
| IPD package pin consumed by IRR | `github:ramkivs/iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` | branch `np04-governed-persistence-windows`, tag `iips-pin-np04-2e11fa3b`; **not an ancestor of IPD `main`** (§3.3) |

### 3.2 What the two repositories actually contain

| Element | Verified fact | Evidence |
|---|---|---|
| IRR renderer host | React SPA: `frontend/src/main.tsx` → router → `frontend/src/app/App.tsx`; routes include `/portfolio` (certified reference workspace), `/user-portfolios`, `/user-portfolios/:portfolioId` | `src/app/App.tsx` blob `a75d69be…`; `src/app/navigation.ts` blob `62cc125b…` |
| IRR host process | `frontend/server/executive-transport.ts` — `node:http`, one assembled route table, loopback bind, port `8787`, `server:dev` = `tsx server/executive-transport.ts` | blob `53bc5e37…` |
| IRR user-portfolio read client | `src/api/userPortfolios.ts` — **two reads only**, no mutation surface | blob `6193ccb3…` |
| IRR user-portfolio surfaces | `src/features/user-portfolios/{UserPortfolioList,UserPortfolioDetail,UserPortfolioStates}.tsx` — read-only list/detail over the fenced namespace | `UserPortfolioList.tsx` blob `92c55dd5…` |
| IRR certified reference portfolio | `src/features/portfolio/PortfolioWorkspace.tsx` over `src/api/portfolio.ts` → `/api/portfolio` (engine/decision outputs) — **not** a user-holdings workspace | blob `fe18e406…` |
| IRR broker-import surface | **Absent.** Repository-wide search for `BrokerImport` / `brokerImport` / `broker-import` in `frontend/src` and `frontend/server` returns no product symbol | this pass; agrees with `§16.85` `V360` |
| IRR canonical identity capability | **Absent.** No security-master, identity-master or quarantine module exists in IRR `src`/`server`; the only occurrences of `companyId` / `identityStatus` are refusal logic and contract mirrors that forbid IRR asserting them | `server/user-portfolio/ipcClient.ts`, `ipcPortAdapter.ts` |
| IPD broker-import UI | **Present and complete**: 16 files, 4,894 lines under `frontend/src/features/portfolio/**` (4,424 excluding the IPD-local `PortfolioWorkspace.tsx`) | `BrokerImportModal.tsx` blob `f2ed480f…` (717 lines); `portfolioStorePort.ts` blob `d61f18df…` (478); `portfolio-store.ts` blob `b900a248…` (548); `import/broker-import-ingress.ts` blob `0742401f…` (543); `import/broker-holdings-mapper.ts` blob `297e4a59…` (381); `import/ui-broker-import-view-model.ts` blob `9066a9d4…` (541); `import/types.ts` blob `cac1a58f…` (258); `import/broker-format-detector.ts`; three broker adapters (Zerodha/Dhan/Groww); `csv-parser-helper.ts` |
| IPD's own application shell | **Present**: `frontend/src/app/{App,AppShell,Sidebar,TopBar,FeaturePlaceholder,OfflineOverlays,UnavailableSurface}.tsx`, `navigation.ts`, `routes.ts` — a complete second product shell with 26 donor routes | IPD working tree |
| IPD identity domain | `src/identity/{security_master,quarantine,mapping_store,governed_fixture_master}.ts`, exported by `src/identity/index.ts` blob `98fa3425…` | IPD `main` |
| IPD provenance domain | `src/contracts/provenance.ts` blob `459c77a4…` | IPD `main` |
| IPD durable import boundary | `src/persistence/brokerImportPersistence.ts` blob `59bb09eb…` — identity gate + mapping + provenance + disposition vocabulary; **imported only by its own test**, not wired to any IPC operation | `grep` this pass; only `tests/q1_broker_import_durability.test.ts` imports `persistBrokerImport` |
| IPD IPC boundary | `src/ipc/protocol.ts` blob `f4dc72b1…` (closed operation set, C7 refused keys incl. `companyId`, `identityStatus`, `resolutionDisposition`); `src/ipc/dispatch.ts` blob `27becc76…` (all four writes → `WRITE_NOT_AUTHORIZED` before mutation) | IPD `main` |
| IRR host → IPD client | `server/user-portfolio/ipcClient.ts` blob `c1b885e3…` and `server/user-portfolio/ipcPortAdapter.ts` blob `7881185e…` — **built, tested, unwired** | IRR `main` |

### 3.3 The packaging fact that decides the reuse mechanism

| Step | Verified fact |
|---|---|
| IRR declares IPD as a package dependency | `frontend/package.json` blob `a6a0521c…` — `"iips-production-market-data": "github:ramkivs/iips-production-market-data#2e11fa3b…"` |
| IRR consumes only two subpaths | `iips-production-market-data/pit` and `iips-production-market-data/d114-non-production`, in **five** server/test files (the AD-02 admission list) |
| The pin carries the packaging | At `2e11fa3b`, `package.json` declares `exports` for `./pit`, `./d114-non-production`, `./persistence` only, built by `tsconfig.pit-package.json` from `src/pit/package.ts`, `src/d114/non_production_package.ts`, `src/persistence/package.ts` |
| The pin is branch/tag-only | `git ls-remote` this pass: `2e11fa3b…` = `refs/heads/np04-governed-persistence-windows` and `refs/tags/iips-pin-np04-2e11fa3b`; `git merge-base --is-ancestor` at deepened history (218 commits) → **not an ancestor of IPD `main`**. This agrees with G1-B1 §110 ("branch-tip pin … not an IPD `main` commit … unresolved") and with `V327`/GOV-05 |
| IPD `main` carries **no** package-export layer | `package.json` at `main` blob `0a3eec22…` has **no `exports` map**, no `files`, no `prepare`/`build:pit-package` script; `src/pit/package.ts`, `src/persistence/package.ts`, `src/d114/non_production_package.ts` **do not exist** on `main` |
| Consequence | **No IPD package export exists for `src/identity`, `src/contracts`, `src/ui` or `frontend/src/features/portfolio`, and IPD `main` cannot produce one without a new packaging act.** IRR cannot import the broker-import component set today, and copying it is excluded by §1(4) and by G-2 §1(2) |

### 3.4 The port seam, verified in source

| Fact | Evidence |
|---|---|
| The UI's save authority is an injected port | `BrokerImportModal.tsx` takes `storePort?: PortfolioStorePort` and defaults to `new SessionPortfolioStorePort(portfolioStore)`; the save path is `controller.confirmAndSaveViaPort({ storePort, portfolioId, viewportWidth, expectedRevision })` |
| The port is identity-free by construction | `PortfolioStorePort` carries no owner/tenant/principal/credential/scope parameter and `findCallerSuppliedIdentityKeys` refuses such claims |
| The port is durability-declaring | `durability: 'SESSION_ONLY' \| 'DURABLE'`, `durable: false` on the session adapter; `describePersistenceStatus` emits `COMMITTED (Durable)` only when `durable` is true |
| The view model renders the port's durability verbatim | `ui-broker-import-view-model.ts` line 536: `durable: this.durability === 'DURABLE'` |
| Identity annotation is a browser-side dependency on IPD domain | `BrokerImportModal.tsx` imports `SecurityMaster` from IPD `src/identity/security_master.js`; `import/types.ts`, `import/ui-broker-import-view-model.ts` do the same, and the pipeline additionally imports `src/identity/quarantine.js`, `src/contracts/provenance.js`, `src/ui/accessibility_engine.js`, `src/ui/responsive_engine.js` |
| The two port shapes differ | IPD's UI port (`PortfolioStorePort`, returns `PortfolioPortSaveOutcome` / `PortfolioSaveResult`) is **not** IRR's `UserPortfolioPort` (`G2SaveResult`, closed `G2FailureReason`). An adapter is required in one direction and is not present today |

**This is the decisive structural finding:** the broker-import UI is not a self-contained presentation
layer. It is the front half of an IPD domain pipeline. Its rendering can be hosted anywhere; its
*computation* cannot leave IPD without either duplicating the identity/provenance domain or exporting it.

---

## 4. The alternatives, evaluated on repository evidence

### 4.1 Option A — move the broker-import UI into IRR

| Test | Finding |
|---|---|
| Host/frontend support | Partly. IRR's renderer could host the components structurally, but IRR has **no** `SecurityMaster`, quarantine, provenance-hashing or consolidation arithmetic module, so the components would not compile or run without that domain |
| Migration cost | 4,894 lines across 16 IPD files, including three broker adapters and the full ingress pipeline — plus the identity/provenance/ui-engine dependencies it imports |
| Ownership effect | **Directly contrary to G-2 §1(2)** — "extended, not replaced or duplicated" — and to G-2 §2, which lists "SecurityMaster and canonical company-identity mapping" among IPD capability to preserve and reuse. A move relocates IPD-owned domain into the repository that G1-B1 says is "not authoritative for IPD-owned domain data" |
| Provenance/idempotency effect | The content digest (W-8 idempotency) and lineage digest are computed by the pipeline. Two implementations in two repositories would produce two sources for values the durable store keys on |
| Regression effect | The pipeline's tests (`bi03_broker_adapter_foundation`, `bi04_broker_adapters`, `bi05_broker_ingress`, `bi07_repeat_import_lifecycle`, `q1_broker_import_durability`) live in IPD. A move either duplicates them or leaves the code untested at its new home |
| Governance effect | The effective IPD store-port act `np04-g2-portfolio-ui-store-port-2026-10-16-001` authorizes **exact IPD paths**. A move places those files outside the act's scope and would require superseding it |
| Verdict | **Rejected.** It buys cross-repo simplicity at the cost of the ownership boundary the whole CAP-02 chain exists to protect. |

### 4.2 Option B — retain the UI in IPD and introduce a separate IPD-local host

| Test | Finding |
|---|---|
| Consistency with the effective topology decision | **Contradicts item 3** ("no independent IPD-local native application host is created … and none is to be assumed") and item 1 (IRR is the integrated host under G1-B1) |
| Does a host exist? | **No.** IPD has a Vite dev shell and no server process, no native shell, no preload, no `contextBridge`, no launch composition. IRR has none either |
| Does it solve the transport? | **No.** A browser UI still cannot reach IPD's `node:net` endpoint. An IPD host would need a new HTTP/TCP listener — which IPD's endpoint design and contract v1 exclude — or a native bridge that does not exist in either repository |
| Product effect | It would create a second product shell (IPD's `app/**` already duplicates navigation, routes and top bar) and a second UX entry point, against the single-product composition G1-B1 fixes |
| Required act | A new topology decision **superseding an effective decision rendered the same day**, for no evidence-based gain |
| Verdict | **Rejected.** It requires reversing an effective decision and still leaves the transport unsolved. |

### 4.3 Option C — retain the UI in IPD, host it through IRR — **SELECTED**

| Test | Finding |
|---|---|
| Consistency | Consistent with topology items 1–3, G1-B1, G-2 §1(2)–(3), and the IPD store-port act's own stated purpose ("so that a durable implementation can later be substituted behind one interface without rebuilding the UI") |
| Ownership | IPD keeps source, tests, domain and persistence. Nothing is duplicated or relocated |
| Host composition | IRR supplies the route, navigation entry, host process and transport — all of which already exist in IRR |
| UI dependencies | The IPD component set must reach IRR's renderer bundle, which requires an **IPD export surface** (a packaging act) because none exists today (§3.3). The IPD domain modules it imports (`identity`, `contracts`, `ui`) must be part of that same export |
| Persistence | Unchanged: IPD's durable store behind the IPC endpoint; the UI's port is satisfied by an IRR adapter over the existing `ipcClient`/`ipcPortAdapter` |
| Cost | Low-to-moderate and bounded: one IPD packaging act (no behaviour change to the component), one IRR composition act (container, adapter, route, tests). No domain is rewritten |
| Regression risk | Low: existing IPD tests keep testing the pipeline in place; IRR adds composition tests only |
| Testability of the complete path | Yes — and through refusal first: renderer → IRR host route → `ipcClient` → IPD dispatch → `WRITE_NOT_AUTHORIZED`. The whole path is executable and assertable without enabling a write |
| Is it materially different from Option A? | **Yes, not merely an implementation variant.** A relocates authorship and domain ownership; C relocates neither. What crosses the repository boundary in C is a *consumable exported surface* plus the renderer port implementation — not the source of truth |
| Verdict | **Selected.** |

### 4.4 Option D — another existing, repository-supported composition

| Candidate | Assessment |
|---|---|
| **D1 — import into IRR's certified reference portfolio** (`/api/portfolio`, `PortfolioWorkspace`) | Wrong domain. It is the certified reference/engine portfolio with decision provenance, explicitly distinct from the user-owned portfolio (G-2 §1(4)); it has no write path and no holdings store. **Rejected** |
| **D2 — serve IPD's Vite app from the IRR origin (reverse proxy or iframe)** | Requires the IPD dev server as a second host (same defect as B), creates an ungoverned cross-origin frame carrying broker files, and no authoritative record supports it. **Rejected** |
| **D3 — thin IRR UI posting raw CSV to IPD via a new `broker.import` operation** | Not an *existing* composition: `broker.import` is not in the closed v1 set, and the transport review (`§16.83`) already found that a new write operation would need a major contract/Gate E revision. It would also move preview and identity resolution server-side and rewrite the preview UX. **Not selected for the first increment; preserved at §4.5** |
| Verdict | **No supported alternative exists.** |

### 4.5 Preserved alternative (not selected, not excluded)

D3 is retained as a **documented future variant**: if the renderer-bundle approach proves unacceptable
(bundle size, fixture exposure, or a future decision to keep the 2,250-entity security master out of the
browser), the same product placement still holds and only the *computation location* changes — which
would require its own contract decision. Recording it prevents a later reader from believing C was the
only option considered, while fixing the current direction.

---

## 5. The selected placement: exact boundaries

| Boundary | Determination |
|---|---|
| **Product host** | IRR — `frontend/server/executive-transport.ts` (Node process) + `frontend/src` renderer, per topology item 1 |
| **UI ownership** | IPD — `frontend/src/features/portfolio/{BrokerImportModal.tsx, portfolioStorePort.ts, import/**}` remain IPD files, IPD-tested, IPD-released |
| **Domain ownership** | IPD — broker adapters, format detection, parsing, mapping, ingress orchestration, canonical identity resolution (`src/identity/**`), provenance/lineage digests (`src/contracts/provenance.ts`), consolidation arithmetic (`frontend/src/features/portfolio/portfolio-store.ts`) |
| **Persistence ownership** | IPD — `DurablePortfolioStore` (`node:sqlite`), migrations, binding resolution, `brokerImportPersistence` boundary |
| **Transport ownership** | Split: renderer→host HTTP belongs to IRR; host→IPD same-host IPC belongs to IPD's contract v1 and IPD's endpoint |
| **Port seam** | `PortfolioStorePort` (IPD) is satisfied in production composition by an IRR adapter over `UserPortfolioPort` (`ipcClient` + `ipcPortAdapter`). IRR must not alter the IPD interface, and the IPD component must not learn a new transport |
| **Identity direction** | IPD → canonical only. Raw broker observations travel renderer → IRR host → IPD. `companyId`, `runtimeCompanyId`, `identityStatus`, `resolutionDisposition`, owner, tenant and credential keys remain refused at the IRR encoder (C7) and again at IPD dispatch |
| **Durability truth** | The IPD result is authoritative. `durable`/`durability` propagate verbatim; absent ⇒ `false`; IRR may only *refuse earlier*, never authorize later |
| **Session-only default** | Preserved. Until a durable save can be authorized and its result truthfully represented, the port must declare `SESSION_ONLY` / `durable:false` |

---

## 6. Reuse and migration direction

1. **No file movement, no copy, no re-implementation.** The direction is *exposure*, not migration.
2. **IPD act (IPD capacity, required first):** introduce a governed package export (for example
   `./portfolio-ui`, exact name to be fixed by that act) that exposes the broker-import component set
   plus the domain modules it imports, built on an IPD `main`-resident packaging layer. This act must also
   reconcile the standing branch-tip pin recorded in G1-B1 §110 before IRR may repin.
3. **IRR act (this repository, prepared at `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-2026-10-23-02`):**
   add a container surface, a `PortfolioStorePort` adapter over the existing IRR port, the host-side
   broker-import boundary, the CAP-02 route, tests, and the navigation entry — all inert until the
   corresponding gates permit more.
4. **Consumer wiring is a separate decision from authorship.** IRR composes; it does not become
   authoritative for the component's semantics.

---

## 7. What still requires authorization — exact scope

| Item | Record that must grant it | Status now |
|---|---|---|
| IPD package export surface + `main`-resident packaging layer | **IPD** packaging/export act (IPD capacity — this repository cannot perform it, R-7) | **NOT GRANTED — blocker B-1** |
| IRR composition: container surface, port adapter, host boundary module, route registration, navigation entry, tests | `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-2026-10-23-02` (prepared, **NOT EFFECTIVE**) | **NOT AUTHORIZED** |
| U1 route admission (`/api/broker-import/**` registration on the IRR host) | The composition act, when rendered effective — this record only *determines* the boundary | **NOT ADMITTED** |
| U2 IPD write correctness (ID-1/ID-2, PROV-1/PROV-2, TXN-1..3, IDEM-1/2, FAIL-1/2) | IPD implementation act inside an **amended exact Gate 3 manifest**, plus a separate provenance/schema act | **NOT AUTHORIZED** |
| U7 read/result contract | Separate contract decision (or governed UI change) | **NOT RENDERED** |
| U3, U4, U5, U6 (Gate 4 qualification, result acceptance, Gate 5, operational writes) | Separate acts, in that order | **NOT STARTED / NOT RENDERED / NOT GRANTED / NOT AUTHORIZED** |

**The single next executable action in this repository** is to render the composition act *after* B-1
lands, because executing it earlier would break `npm run typecheck` and `npm run build` on an
unresolvable import. That is a factual dependency, not a request for reapproval.

---

## 8. Dependencies and required tests

| Dependency | Why it binds after U0 |
|---|---|
| B-1 IPD export/packaging act | Without it, no IRR file can import the component set; a composition act executed first fails typecheck and build |
| U1 route admission | The renderer needs a non-fenced CAP-02 namespace; the existing namespace stays `503` and CAP-03 remains excluded |
| U7 result contract | A *successful* save cannot be represented to the UI today (v1-to-G2 envelope gap: `weightSumPercentage`, `provenanceDigest`, `isSaved`, `totalMarketValue`, `holdingsCount` missing; `holdingsCount`→`totalHoldingsCount` and `committedAt`→`createdAt` renames). While W-1 refuses every write the gap is **unreachable**, so the refusal path may be built first |
| U2 | Raw-observation identity resolution must exist IPD-side before any write can succeed |
| U3–U6 | W-1's four-condition conjunction; none is satisfied |

**Required tests for the first end-to-end increment** (full manifest in the composition act): component
reachability and no-duplicate-domain, port adapter conformance and refusal mapping, raw-observation-only
wiring (zero canonical/identity keys on the wire), no-retry, outcome-unknown, truthful durability
(`durable:false` on every non-committed path), fence byte-identity and twelve-pair `503` regression,
owner-context fail-closed, and an end-to-end assertion that a write reaching IPD ends in
`WRITE_NOT_AUTHORIZED` with zero store effect.

---

## 9. Explicit exclusions and rollback

This decision does **not**:

1. authorize any source, test, schema, mapping, migration, store, route, fence or workflow change;
2. move, copy or re-implement any IPD file, or create any IPD export;
3. admit, register or activate any route, including a CAP-02 namespace;
4. change IPC contract v1, its operations, wire fields or the no-listener rule;
5. authorize a renderer bridge, native shell, preload, `contextBridge` or HTTP/TCP listener in IPD;
6. change the W-1 guard or enable any write, or permit `durable:true`;
7. accept Gate 4 results, grant Gate 5, or move any gate, admission or production status;
8. revive G24, authorize PR #45 paths retrospectively, create a CAP-03 dependency, or open IPO
   Screening Engine scope;
9. alter the IPD store-port act's scope or the Q1 bounded residual implementation.

**Rollback boundary.** The decision is revertible by reverting this record and the tracker continuation.
Because it authorizes no code, no data, no migration and no route, no rollback analysis beyond record
reversion is required — and none is claimed for increments that a later act would authorize.

---

## 10. Preserved state (operative)

```text
Broker-import UI placement:          DECIDED — EFFECTIVE 2026-10-23 (IPD-owned, IRR-hosted)
Broker-import UI source location:    UNCHANGED (IPD)
IRR broker-import surface:           ABSENT (not created)
IPD package export for the UI:       ABSENT (IPD packaging act required)
Broker-import UI persistence:        SESSION_ONLY / durable:false
IPD write dispatch:                  WRITE_NOT_AUTHORIZED before mutation (all writes)
IRR /api/user-portfolios* routes:    HTTP 503 owner-context-unavailable (6 paths / 12 pairs)
IPC contract v1:                     UNCHANGED
IPD durable store / schema:          UNCHANGED
Gate 3:                              ACCEPTED for bounded implementation scope only
Gate 4 qualification:                PROPOSED / NOT EFFECTIVE; NOT AUTHORIZED / NOT STARTED
Gate 4 result acceptance:            NOT RENDERED
Gate 5 admission:                    NOT GRANTED / NOT INITIATED
Operational broker-import writes:    NOT AUTHORIZED
CAP-02 topology/ownership:           EFFECTIVE (prior record)
CAP-02 U0 placement:                 EFFECTIVE (this record)
CAP-02 U1 boundary:                  DETERMINED (this record); route NOT ADMITTED
CAP-02 implementation:               NOT AUTHORIZED
```

---

## 11. Consistency check against the effective framework

| Effective record | Requirement it fixes | Finding |
|---|---|---|
| **G1-B1** (blob `857d1451…`) | IRR `main` is the authoritative product/application host; **not** authoritative for IPD-owned domain data or persistence | **Consistent.** IRR hosts; IPD keeps domain and persistence. Nothing is transferred |
| **G-2** (blob `7e83946b…`) | IPD owns the user-portfolio domain and durable persistence; extend, **do not replace or duplicate**; IRR consumes only via a separately governed additive boundary; the reference portfolio and the user portfolio are distinct | **Consistent and decisive.** It is the ground on which Option A is rejected and C is selected |
| **Consumer contract v1** (IPD `f4dc72b1…` protocol / blob `163eb1f1…` contract) | Closed operation set; client = IRR server process; no identity claims; no listener | **Consistent and untouched.** C reuses the closed set and adds no operation |
| **IPD store-port act** `np04-g2-portfolio-ui-store-port-2026-10-16-001` | Authorizes session dependency inversion in exact IPD paths; excludes IPC/transport/durable writes/route admission | **Consistent.** C relies on the port the act created and grants the act nothing |
| **Gate E W-1** (IPD blob `4a9501bf…`) | Writes require all four conditions | **Consistent.** Writes remain refused; §7 keeps every condition distinct |
| **Gate 3 acceptance / `G3-AMEND-01` / Q1** | Bounded manifest; no reopening; Q1 renders no operational authority | **Consistent.** U2 is stated as requiring an amendment, not as a retrofit |
| **CAP-02 topology decision** | Items 1–6, including no IPD-local host and preservation of all fences | **Consistent; item 4 is satisfied** — host composition root, lifecycle owner, bridge boundary and file manifest are identified and separately recorded |
| **CAP-02 host-boundary act** | Increment A/B and register U0–U7 | **Register item U0 discharged**; the act is preserved unamended with an additive §13 |

No effective record had to be overridden, reinterpreted or silently amended.

---

## 12. Publication and effectiveness

| Element | Value |
|---|---|
| Rendered | `2026-10-23` (UTC), in this record |
| Effective | **`2026-10-23`** — the determination is effective on rendering; its availability as authority from `main` is proven only by the merge commit and remote blob read-back |
| Publication route | Session branch → IRR PR → required CI → merge under `CHG-2026-10-18-02` |
| Proof of publication | Merge commit + `mergedAt` + blob identity at remote `main`, recorded post-merge in tracker §16.86 |
| If publication fails | The determination stands as a branch-rendered act only; it is **not** effective from `main`, and no later act may cite it |

An earlier merge, a green CI run, a PR review or an issue comment is **not** proof of this decision.

---

## 13. Verification performed for this record

| ID | Verification | Result |
|---|---|---|
| `V364` | Remote state re-read: IRR `origin/main` = `e5b9102…` (merge of PR #211); IPD `main` = `73fd8c16…`, tree `66020736…` | **PASS — baselines current** |
| `V365` | Standing grant located and re-hashed from `origin/main` (`c4c9f7d7…`); operative sentence quoted verbatim, not paraphrased | **PASS** |
| `V366` | G1-B1 `857d1451…`, G-2 `7e83946b…` read in full at the baseline; G-2 §1(2)/(3)/(4) and §2 capability list quoted as the ownership test | **PASS** |
| `V367` | IRR negative findings re-verified: no broker-import symbol in `src`/`server`; no security-master/identity module; `/user-portfolios` mounts are read-only over the fenced namespace | **PASS — recorded, not inferred** |
| `V368` | IPD UI inventory re-verified: 16 files / 4,894 lines; modal→port→controller save path read in source; dependency edges to `src/identity`, `src/contracts`, `src/ui` enumerated file-by-file | **PASS** |
| `V369` | Packaging fact verified three ways: IRR `package.json` blob `a6a0521c…`; pin `2e11fa3b…` `exports`/`tsconfig.pit-package.json`; IPD `main` `package.json` blob `0a3eec22…` with no `exports` and no `package.ts` entry points; `git ls-remote` shows the pin on branch/tag only; `merge-base --is-ancestor` at 218-commit history → not an ancestor | **PASS — the binding blocker is factual** |
| `V370` | Port seam verified in source: injected `storePort`, session-only default, `describePersistenceStatus`, view-model durability propagation, and the shape difference from IRR's `UserPortfolioPort` | **PASS** |
| `V371` | U2 gaps re-verified: `persistBrokerImport` not wired to `dispatch`; caller-canonical holdings required while C7 refuses canonical keys; no `expectedRevision` in its request; `portfolio_contributions` has no provenance columns | **PASS — fresh evidence, not inherited assertion** |
| `V372` | Fence state verified byte-identical: `user-portfolio-transport.ts` `51704c12…`, `owner-context-unavailable.ts` `cb8db45d…`, contract `e6b57bb8…`; six paths / twelve route-method pairs; targeted suites **9 files / 170 tests passed** | **PASS** |
| `V373` | Repository-wide regression: `tsc --noEmit` exit `0`; `vitest run` **87 files / 1,077 tests passed / 0 failed**; `npm run build` exit `0` | **PASS** |
| `V374` | Non-effect review: no source/test/schema/mapping/migration/store/route/fence/workflow/ref/issue change; IPD untouched; no gate, acceptance, admission or write movement; no signature or approval ID fabricated | **PASS** |

Publication coordinates are established post-merge and recorded in tracker §16.86.

---

## 14. Status statement

```text
U0 — broker-import UI product placement:  DECIDED — EFFECTIVE 2026-10-23
  component ownership:                    IPD (unchanged, no file moved)
  product host / composition:             IRR (G1-B1)
  reuse mechanism:                        IPD package export (NOT YET CREATED) → IRR composition
  IPD-local host:                         NOT CREATED, NOT ASSUMED
  U1 boundary:                            DETERMINED — new CAP-02 namespace; NOT ADMITTED
  first blocker:                          B-1 IPD export/packaging act (IPD capacity)
CAP-02 implementation:                    NOT AUTHORIZED
Product durable write:                    NOT AUTHORIZED / NOT AVAILABLE
Broker-import UI:                         SESSION_ONLY / durable:false
Gates 4 / acceptance / 5:                 unchanged (not effective / not rendered / not granted)
```

*Rendered under the standing grant; recorded in the NP-18 form; no signature or approval identifier is
fabricated. This record places a component — it does not build, move, expose or connect it.*
