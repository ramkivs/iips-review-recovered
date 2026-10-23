# IIPS v3.0 — CAP-02 — Broker-Import UI Composition and Transport Implementation Act — **RENDERED — EFFECTIVE (EXACT-SCOPE HOST TRANSPORT INCREMENT)**

> ## STATUS: **EFFECTIVE — FOR THE EXACT HOST-COMPOSITION/TRANSPORT SCOPE IN §3 ONLY — NO MODAL MOUNT, NO WRITE AUTHORIZATION, NO FENCE LIFT, NO GATE MOVEMENT**
> This record renders effective the corrected Increment B′ scope that
> `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-2026-10-23-02` (blob `42d0c166…`, preserved unamended,
> including its §11 current-source correction) and its three successor prepared records (readiness
> `IIPS-V3-CAP02-HOST-COMPOSITION-TRANSPORT-READINESS-2026-10-23-01`, blob `bed81a82…`; prepared U1 act,
> blob `966891d4…`; prepared U7 record, blob `68ed97ec…`) jointly prepared.
>
> **It authorizes exactly:** the B-1R dependency repin to verified IPD `main` commit `554ed6ce…`, the
> trusted-host CAP-02 v1 save adapter and boundary, the registration of the single U1 route
> `POST /api/broker-import/:portfolioId/holdings` on the existing IRR Node host, the browser HTTP
> client for that route, and their tests. **It authorizes no** modal mount, no `PortfolioStorePort`
> implementation, no renderer surface/route/navigation entry, no revision-read route, no IPD change,
> no durable write, no fence change and no gate movement. The exported `BrokerImportModal` remains
> **unmounted** because the U7 provider prerequisite (§6) is not met at the pinned IPD commit.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-03` |
| **Record type** | Rendered exact-scope implementation act — dependency pin, file manifest, boundary separation, test manifest, preserved fences, non-goals |
| **Status** | **EFFECTIVE** for the exact scope of §3 (host transport increment + B-1R). Everything in §7 remains unauthorized |
| **Rendered / effective date** | `2026-10-23` (UTC) |
| **Decision authority** | Ramki — Program Authority, single owner/user of the single-user personal-use IIPS platform |
| **Authority exercised** | The PA's standing grant of global decision and execution authority (2026-10-12), transcribed at `docs/integration/IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` §1.2, blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02` (re-verified at the current `main` this pass), **as construed** by `IIPS-V3-DEC06-AUTHORITY-RECONCILIATION-IRR-2026-10-21-01` (R-1/R-3/R-6/R-7), **plus** the current CAP-02 execution directive of `2026-10-23` which instructs this pass to establish effective composition authority, render the U1/U7 decisions, repin the dependency and implement the authorized composition in one pass |
| **Governing effective decisions** | Topology/ownership `IIPS-V3-CAP02-PA-TOPOLOGY-OWNERSHIP-EFFECTIVE-2026-10-23-01` (blob `48bc8375…`); U0 placement `IIPS-V3-CAP02-U0-BROKER-IMPORT-UI-PLACEMENT-EFFECTIVE-2026-10-23-01` (blob `43793d66…`) |
| **Evidence baselines** | IRR `main@39a0a675eb7323b39b9465c741843a1a05316a31`, tree `4a9648c16d31e8f3d686416d2126f46a39e825bc` (verified equal to `origin/main` this pass); IPD `main@554ed6ceaa7422c95806fd1b6e095a24a8554be2`, tree `2d9dc14d8f9ab52a4507648e5323ce803dc6d512` (read-only, re-verified unchanged this pass) |
| **Companion effective decisions** | `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01` (route admission — rendered in the same package); `IIPS-V3-CAP02-U7-READ-RESULT-CONTRACT-DECISION-EFFECTIVE-2026-10-23-01` (consumer result contract — rendered in the same package) |
| **Publication authority** | Standing PR-lifecycle execution and merge authorization `CHG-2026-10-18-02`, applied per §10 |
| **Rendered in repository** | `ramkivs/iips-review-recovered`; branch `arena/f540fa90-iips-review-recovered` |
| **Mutation boundary of this record** | IRR documentation only at rendering; the implementation authorized by §3 follows only after this record's publication and remote verification (§10) |

---

## 1. Why this act is now renderable, and why its scope is narrow

The prepared chain fixed three facts that were previously open:

1. **B-1 is closed.** IPD `main@554ed6ce…` (unchanged since the readiness pass) publishes the
   effective export-only Increment A act: `./portfolio-ui` with 22 runtime exports including
   `BrokerImportModal` and the governed SecurityMaster, `PortfolioWorkspace` deliberately absent.
   This pass re-verified the exact-commit consumer install inside the IRR workspace: 188 packages
   installed, the subpath imported with exit 0, `BrokerImportModal` a function, default port
   `SESSION_ONLY`/`durable:false`, and an `esbuild --platform=browser` bundle of the export (React
   external) completed with **zero** Node-persistence/IPC/privileged-write closure hits.
2. **The prepared scope was corrected by evidence.** The §11 addendum to the `-02` act withdrew the
   G2-adapter reuse and the pre-U7 GET route, fixed the browser-HTTP adapter requirement, and fixed
   default-portfolio-only for the first surface. The U1/U7 prepared records narrowed the first
   transport increment to one POST route with a new wire-conformant adapter.
3. **The PA direction for this pass explicitly instructs rendering.** The current CAP-02 directive
   requires effective composition authority to be resolved first, then B-1R, then U1/U7 decisions,
   then the authorized implementation — and forbids both stopping at documentation when
   implementation is authorized and implementing anything whose authority is not effective.

**Why the scope stops at host transport.** The actual exported modal's port contract (verified at
the pinned IPD commit, §6) requires a full legacy `PortfolioSaveResult` on success and a full
`PortfolioRecord` plus durability values on every refusal, and the view model fills refusal
placeholders (`savedAt = now`, zero counts, empty provenance) and derives displayed durability from
the static port declaration. An IRR browser `PortfolioStorePort` implementation cannot satisfy that
contract from the accepted v1 minimal receipt without fabricating values, which every governing
record forbids. The mounted modal therefore remains blocked by an **IPD-side** UI/port amendment
(U7 provider prerequisite, §6) and is a recorded non-goal of this act, not an omission.

## 2. Authority determination (why no additional approval is required)

| Test (U0 §2.3 form) | Finding |
|---|---|
| Established PA work item? | Yes. B-1R, U1 and U7 are named register items in the effective dependency register (readiness §7); the `-02` act §10 named "land Increment A → this act can be rendered effective without renegotiating its scope"; Increment A landed and is verified |
| Necessary decision or scope expansion? | Necessary. It executes the already-effective U0 Option C placement and topology decision inside already-fixed boundaries; it creates no capability, market or product line beyond the selected composition's first transport increment |
| Explicit gate bypassed? | No. W-1/Gate 4/Gate 5/operational-write authorization remain untouched: every write through the admitted route terminates in IPD `WRITE_NOT_AUTHORIZED` with zero store effect, and that refusal is the asserted success criterion of this increment |
| Safeguard weakened? | No. All twelve `/api/user-portfolios*` route-method pairs stay HTTP 503 with byte-stable fence blobs; the IPC contract v1 operation set is unchanged; no new listener, operation or wire field |
| Success claimed without verification? | No. Every factual input is cited to a path and blob at the stated baselines; implementation evidence is produced and published before any operational claim |
| Capacity exceeded (R-7)? | No. All authorized files are IRR-owned; the IPD-side consequence (modal/port amendment, U2) is recorded as an IPD act, not performed here |

**Conclusion:** the standing grant plus the current PA direction covers rendering this act. The
grant alone would not have made the prepared act effective — an explicit rendered record citing
current baselines, exact scope and preserved fences is required, and this is that record.

## 3. Exact authorized scope (the host transport increment + B-1R)

### 3.1 Dependency pin (B-1R)

`frontend/package.json` (baseline blob `a6a0521c…`) and `frontend/package-lock.json` (baseline
`4f068d98…`) repin `iips-production-market-data` from the off-`main` branch-tag commit
`2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` to the **immutable IPD `main` commit**
`554ed6ceaa7422c95806fd1b6e095a24a8554be2` (tree `2d9dc14d…`). Verification required: the pinned
package resolves, `./portfolio-ui` imports with the expected 22 runtime exports and honest
`SESSION_ONLY`/`durable:false` default, the browser-platform bundle of the export completes with no
Node-only persistence/IPC or privileged-write symbol in its closure, and the IRR package, typecheck,
test and build suites pass. The pin identity is asserted by a committed test so drift fails CI.

### 3.2 New trusted-host modules (server-only)

| File | Sole responsibility |
|---|---|
| `frontend/server/broker-import/brokerImportBoundary.ts` | Import-safe DTO validation: exact top-level key set, mandatory `expectedRevision`, `MERGE`/`REPLACE` mode, bounded raw-observation holding allowlist, digest shape, refusal of canonical/identity/owner/tenant/credential keys before any I/O. No listener, no IPC |
| `frontend/server/broker-import/brokerImportV1SaveAdapter.ts` | Map the validated DTO to the **exact top-level v1 `portfolio.save` payload**; call the existing `callIpc` once; relay the minimal v1 receipt verbatim; map Class A / Class P / outcome-unknown / unrepresentable results without fabricating any field |
| `frontend/server/broker-import/brokerImportHttp.ts` | Route/method matching for the CAP-02 namespace, C9 first-party signal, binding-precondition fail-close, bounded body reading, response mapping. No domain parsing, no persistence |
| `frontend/server/broker-import/index.ts` | Narrow server-only composition exports |

The adapter **must not** instantiate `IpcUserPortfolioPort`, call `save` on the old G2 port, emit
the old `options:{mode,contentDigest,fileName,sourceBroker}` payload, or construct a `G2SaveResult`.

### 3.3 One existing host edit

`frontend/server/executive-transport.ts` (baseline blob `53bc5e37…`): dispatch
`/api/broker-import` to the new handler and add the `/api/broker-import` prefix to the C8
owner-scoped namespace list (no wildcard cross-origin header on the new owner-scoped namespace).
The five existing owner-scoped prefixes, every existing route dispatch and the loopback bind remain
exact; no listener, port or origin setting changes.

### 3.4 Browser HTTP client (transport half of the browser adapter)

`frontend/src/api/brokerImport.ts`: typed client for the single admitted route. It projects the
IPD-exported UI ingress shapes to the CAP-02 DTO by **selecting only broker-observed fields**
(canonical identity, lineage and derived-weight fields are never serialized), makes one `fetch` with
no automatic retry, and maps HTTP responses to receipt / typed refusal / outcome-unknown. It does
**not** implement IPD's `PortfolioStorePort` (§6) and is imported by no renderer surface yet.

### 3.5 Tests

`brokerImportBoundary.test.ts`, `brokerImportV1SaveAdapter.test.ts`, `brokerImportHttp.test.ts`
(including real-host route admission against the exported composed server and re-assertion of all
twelve fence pairs), `brokerImportImportSafety.test.ts`, `brokerImportPackageConsumer.test.ts`
(pin resolution, export surface, browser closure), and `src/api/brokerImport.test.ts`.

## 4. Boundary separation (recorded explicitly)

| Boundary | Authority | Status |
|---|---|---|
| **UI placement** — who authors the broker-import component set, who hosts it | U0 effective decision (blob `43793d66…`) | Effective: IPD-authored, IRR-hosted, reuse by governed package export only |
| **Host composition** — mounting/rendering the exported component in the IRR renderer | This act | **Transport-level only.** The renderer mount of `BrokerImportModal` is NOT authorized by this act (blocked by the U7 provider prerequisite, §6) |
| **Transport admission** — which HTTP route exists on the IRR host | U1 effective act (companion record) | Effective for exactly `POST /api/broker-import/:portfolioId/holdings` |
| **Durable persistence** — who owns the store, migrations, identity resolution | IPD (topology decision item 2) | Unchanged; nothing in this act touches IPD files |
| **Operational write authorization** — whether a write may commit | Gate E W-1 (U3+U4+U5+U6) | **Unchanged and unmet.** Every write through the admitted route must end in IPD `WRITE_NOT_AUTHORIZED` with zero store effect; no `durable:true` claim may be made by any IRR code |

## 5. Preserved fences and unchanged files

- `frontend/server/user-portfolio-transport.ts` (blob `51704c12…`) and
  `frontend/server/owner-context-unavailable.ts` (blob `cb8db45d…`) remain **byte-identical**; all
  six route paths / twelve route-method pairs keep HTTP 503.
- `frontend/server/user-portfolio/**` (`ipcClient.ts` `c1b885e3…`, `ipcPortAdapter.ts` `7881185e…`,
  `userPortfolioContract.ts` `e6b57bb8…`, `userPortfolioBoundary.ts` `b8024c6b…`,
  `translationBoundary.ts` `93f602fd…`, `firstPartySignal.ts` `d2f0ae72…`,
  `ownerContextFromBinding.ts` `296dd5e3…`, `userPortfolioPort.ts` `ba0001e8…` and every other file
  in that tree) — **unchanged**; reused read-only.
- `frontend/vite.config.ts` (blob `a4614f49…`) — unchanged; the existing `/api` proxy already
  covers the new namespace.
- `frontend/src/app/App.tsx` (`a75d69be…`), `frontend/src/app/navigation.ts` (`62cc125b…`) —
  **unchanged**; no renderer route or navigation entry is added by this act.
- `.github/workflows/ci.yml` (blob `b95a502a…`) — unchanged.
- Every IPD file, branch, PR, issue and ref — untouched (R-7).

## 6. The U7 provider prerequisite (exact cross-repository blocker)

At the pinned IPD commit, mounting the exported modal with an IRR-supplied custom port is
**not honestly implementable**, verified in source this pass:

1. `PortfolioPortSaveSuccess.result` requires the full legacy `PortfolioSaveResult`
   (`portfolio-store.ts`; `frontend/src/features/portfolio/portfolioStorePort.ts` blob `d61f18df…`).
   Accepted v1 supplies only `{disposition, revision, durability, durable}`.
2. `PortfolioPortSaveRefusal` requires `portfolio: PortfolioRecord` plus `durability`/`durable`;
   accepted Class A refusals carry none of those, and `isSaved` has no authoritative v1 equivalent.
3. The view model (`ui-broker-import-view-model.ts` blob `9066a9d4…`) fabricates refusal
   placeholders (`savedAt = new Date()`, zero counts/totals, empty provenance, one empty fallback
   record) and derives displayed durability from the static `storePort.durability`, not from the
   operation outcome.
4. The port interface has no outcome-unknown member, and requires `getAnalytics` while
   `portfolio.analytics` is reserved and must not be dispatched by IRR.

**Required IPD act (IPD capacity):** amend the exported modal/port to (a) consume a minimal v1
commit receipt without preview fallbacks, (b) render refusals without a mandatory full record,
timestamp or durability fabrication, (c) add a distinct outcome-unknown/reconciliation state with
zero automatic retry, and (d) separate store-capability declarations from per-operation commit
evidence. Until that act lands on IPD `main` and IRR repins to it, no `BrokerImportSurface`, no
`PortfolioStorePort` implementation and no revision-read route may be created in IRR. The IPD-side
independent reconciliation note (IPD PR #48, open, read-only inspection this pass) reaches the same
classification (`IRR-CONTRACT-DEPENDENT — PREPARE IPD SIDE; DO NOT GUESS`).

## 7. Explicit non-goals and exclusions

1. No mount, deep-import or copy of `BrokerImportModal`, `PortfolioWorkspace` or any IPD component
   into IRR source beyond the package-consumer verification test.
2. No `PortfolioStorePort` implementation, no second parser/controller/SecurityMaster/persistence.
3. No renderer route, navigation entry or availability gate.
4. No revision-read/preview GET route (not admitted; requires its own act after the U7 provider
   prerequisite).
5. No IPD source, contract, schema, migration, test, branch, PR or issue change.
6. No new IPC operation, wire field, listener, port or origin change; no `broker.import`.
7. No lift or alteration of any `/api/user-portfolios*` fence; no Gate 4/5/W-1 movement; no
   durable-write or `durable:true` claim; no G24 revival; no CAP-03 or IPO Screening Engine scope.
8. `fileName`/`importedAt` remain unrepresentable in the v1 save payload; the boundary refuses them
   as unknown keys and no provenance claim is made (C-1/U2 gap preserved).

## 8. Required verification for the implementation

1. Focused broker-import suites: boundary, adapter (byte-exact payload, one call/no retry, receipt
   relay, Class A/P/unknown mapping), HTTP (real-host admission + all twelve fences), import
   safety, package consumer (pin, exports, browser closure), browser client.
2. Full `npm run test:ci` with the nonzero/pass guard; `npm run typecheck`;
   `npm run typecheck:replay-server`; `npm run build`; `git diff --check`.
3. Real-host negative probes: the route refuses fail-closed without the binding precondition; the
   twelve fence pairs unchanged; no wildcard cross-origin header on the CAP-02 namespace.
4. No mock may be labelled end-to-end IPD persistence evidence; the real IPD dispatch refusal
   harness remains blocked by Gate A′ binding prerequisites and is not claimed here.

## 9. Rollback boundary

Revertible by reverting the repin commit, deleting the four server files and the browser client and
their tests, and reverting the `executive-transport.ts` dispatch/prefix addition: no migration, no
data rewrite, no fence change, no contract change, no IPD change.

## 10. Publication and effectiveness

| Element | Value |
|---|---|
| Rendered | `2026-10-23` (UTC), in this record |
| Effective | `2026-10-23` — effective on rendering; availability as authority from `main` is proven only by the merge commit and remote blob read-back |
| Publication route | Session branch → IRR PR → required CI → merge under `CHG-2026-10-18-02` |
| Order | This record, the effective U1 act and the effective U7 decision are published and remotely verified **before** the §3 implementation is committed; the implementation then travels as its own PR citing this act |
| If publication fails | The act stands as branch-rendered only; it is not effective from `main`, and no implementation may cite it |

## 11. Status statement

```text
U0 placement:                     EFFECTIVE (unchanged)
Composition (this act):           EFFECTIVE — host transport increment + B-1R only
U1 route admission:               EFFECTIVE (companion record) — one POST route
U7 consumer contract:             EFFECTIVE (companion record) — minimal v1 receipt
Modal mount / PortfolioStorePort: NOT AUTHORIZED — blocked by IPD UI/port act (§6)
B-1R:                             AUTHORIZED and executed under this act (§3.1)
Writes / W-1 / Gates 4–5:         UNCHANGED — WRITE_NOT_AUTHORIZED, zero store effect
Twelve /api/user-portfolios* pairs: UNCHANGED — HTTP 503, byte-stable blobs
IPD repository:                   UNCHANGED (read-only)
```

*Rendered under the standing grant and the current CAP-02 directive; recorded in the NP-18/DEC-06
form; no signature or approval identifier is fabricated. This act authorizes a bounded transport
increment — it does not mount the modal, enable a write, or move any gate.*

## 12. Dated correction (2026-10-23, post-publication): B-1R verification FAILED — split export surface; repin not executed

This section is an additive dated correction under DEC-06 R-2/R-5: the original record above is
preserved verbatim; this section corrects the B-1R status and the rollback text that depends on
it. No other element of the act is affected.

### 12.1 What was verified (receipts)

During the §3 implementation pass, the B-1R repin was performed exactly as §3.1 directs
(`package.json` + `package-lock.json` to `554ed6ceaa7422c95806fd1b6e095a24a8554be2`), installed,
and then subjected to the §8 verification program. Findings:

1. `iips-production-market-data/portfolio-ui` **does** resolve at the new pin: 22 named exports
   (including `BrokerImportModal`, `SessionPortfolioStorePort`, `evaluatePortSaveGuard`,
   `getGovernedBroadSecurityMaster`, `PortfolioStore`; `PortfolioWorkspace` deliberately absent);
   `new SessionPortfolioStorePort()` reports `durability: 'SESSION_ONLY'`, `durable: false`.
2. A browser-platform esbuild bundle of the export (external `react`/`react-dom`) completed with
   **zero** occurrences of `node:net`, `node:sqlite`, `node:fs`, `node:http`, `node:path`,
   `node:crypto`, `createConnection`, `DatabaseSync`, `listenIpc`, `persistBrokerImport`,
   `WRITE_NOT_AUTHORIZED`, `src/ipc/`, `src/persistence/` — the §3.1(c) closure property holds.
3. `npx tsc --noEmit` **FAILED**: `server/pit/nonProductionPitStore.ts` —
   `Cannot find module 'iips-production-market-data/pit'`.

### 12.2 Root cause (the split export surface)

The two candidate pins serve **disjoint consumer sets**:

| Pin | Lineage | `exports` keys |
|---|---|---|
| `2e11fa3b…` (current IRR pin) | `np04-governed-persistence-windows` (off `main`) | `./pit`, `./d114-non-production`, `./persistence` |
| `554ed6ce…` (IPD `main`) | `main` | `./portfolio-ui` |

IRR consumes the former through six AD-02-admitted files (`server/pit/ipdPitReadAdapter.ts`,
`server/pit/nonProductionPitStore.ts`, `server/pit/nonProductionRuntimePitStore.ts`,
`server/pit/pitD114RuntimeIntegration.test.ts`, `server/pit/pitRuntimeIntegration.test.ts`,
`src/api/pit.test.ts` — `./pit` and `./d114-non-production`; nothing imports `./persistence`).
IPD `main@554ed6ce` still carries the `src/pit/` source but its packaging layer
(`tsconfig.portfolio-ui-package.json`, `dist/package/src/ui/portfolio_ui_package.js`) declares
**only** the `./portfolio-ui` export. A plain repin therefore breaks typecheck and build for the
admitted PIT consumers — the §8 verification program fails, and under §3.1's own terms B-1R
cannot be completed.

### 12.3 Decisions under this correction

1. **The repin is NOT executed.** `package.json` and `package-lock.json` are reverted to the
   recorded `2e11fa3b…` pin (verified by reinstall and by the committed guarded pin-status test).
   The §12.1 receipts stand as verification evidence for the export surface itself; they are not
   claims about the IRR install state.
2. **The authorized resolution is IPD-side**: an IPD packaging act adding `./pit` (and
   `./d114-non-production`) exports to IPD `main`'s packaging layer, after which the plain repin
   this act authorizes becomes executable. This is recorded as a B-1R prerequisite alongside the
   §6 modal-mount prerequisite. An IRR-side restructuring (e.g. a dual/aliased dependency plus
   edits to the six AD-02-admitted files) is **not** authorized by this act and was not performed.
3. **The browser client no longer imports the package.** Its projection input is typed by a local
   structural mirror of `UserHoldingInput` (documented in
   `frontend/src/api/brokerImport.ts`), so it typechecks at the current pin; the mirror may be
   replaced by the package type import under the act that lands the repin.
4. **The package-consumer suite is conditional**: `frontend/server/broker-import/brokerImportPackageConsumer.test.ts`
   always asserts pin identity and lockfile agreement, and activates the full `./portfolio-ui`
   consumer, export-surface, DP-2 Option 2F and browser-closure assertions automatically once the
   installed pin carries the export — i.e. exactly when B-1R becomes executable. In the current
   state those three assertions report as skipped (not passed) and are not counted as verification
   of the installed tree.

### 12.4 Status correction (supersedes §11's B-1R line only)

```text
B-1R:  AUTHORIZED but NOT EXECUTED — blocked by the IPD split export surface (§12);
       pin retained at 2e11fa3b…; activation prerequisite: IPD packaging act adding
       ./pit and ./d114-non-production exports to main, then the plain repin + §8 program
```

Everything else in §11 stands. The transport increment (§3.2–§3.5, §4, §5, §7, §8) is unaffected
and proceeds: it has no dependency on the package pin.

## 13. Dated re-verification addendum (2026-10-23, second one-pass): B-1R still blocked — prerequisite deepened; U7 provider prerequisite satisfied on IPD `main` sources but unreachable until repin

This section is an additive dated addendum under DEC-06 R-2/R-5: §§1–12 above are preserved
verbatim. It records a fresh authoritative re-verification executed under the PA's CAP-02
continuation directive of 2026-10-23 (tracker §16.90, `CV-CORR-73`). It changes no
authorization: §3's scope, §7's non-goals and §12's B-1R correction all stand.

### 13.1 What was re-verified (receipts)

1. **IRR baseline.** `main@3f628cbc15d0a4712980dc9c9e378edf062be67e`, tree
   `eb807be6c9b02062c060a7a0793b3733e80612b6` (= `origin/main`, clean worktree). PRs #216–#219
   re-verified `MERGED` with merge commits `30091d33…`, `d0fb8a49…`, `76a599cc…`, `3f628cbc…`.
   Pin retained at `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`; admitted route, boundary, v1
   adapter, HTTP mapping, browser client and all twelve `/api/user-portfolios*` 503 fences
   re-verified in source and by the focused suites.
2. **IPD authoritative publication.** `main@24e62c80f37e8a55c34747581a68209c67b775a3`, tree
   `d5eb798b7455711f7e46bfaec89fdca551fa0f3d` (unchanged since §16.89.1's observation), package
   `iips-production-market-data@1.0.0`, export map exactly
   `{ "./portfolio-ui": { "types": "./dist/package/src/ui/portfolio_ui_package.d.ts",
   "import": "./dist/package/src/ui/portfolio_ui_package.js" } }`.
   Empty-consumer install at that exact commit: `./portfolio-ui` resolves with 22 runtime
   exports and the honest `SESSION_ONLY`/`durable:false` default; an esbuild browser bundle
   (React external, 1,985,357 bytes) has **zero** forbidden-closure hits. `./pit` and
   `./d114-non-production` fail with `ERR_PACKAGE_PATH_NOT_EXPORTED` (runtime) and `TS2307`
   (typecheck). A direct in-IRR repin to `24e62c80…` was performed and reverted: `tsc --noEmit`
   fails at `server/pit/nonProductionPitStore.ts` (`TS2307`) and the PIT suites fail to
   collect (`Missing "./pit" specifier`). Worktree verified clean after revert; pin and
   lockfile byte-restored.
3. **The prerequisite is deeper than export keys.** `PitReadService`
   (`src/pit/pit_read_service.ts`), the PIT package entry (`src/pit/package.ts`) and the D114
   non-production population modules (`src/d114/non_production_package.ts`,
   `src/d114/non_production_pit_population.ts`) **do not exist in the IPD `main` tree at all**;
   they exist only on the off-`main` lineage (`2e11fa3b…`, verified NOT an ancestor of `main`).
   `main` carries only `PointInTimeStore` and the contract types, unexported. An exports-map-only
   change on `main` therefore cannot satisfy the six consumers; IPD must main-admit those
   modules under its own authority in addition to adding the packaging exports.
4. **The §6 U7 provider prerequisite is now satisfied in IPD `main` sources.** IPD PR #54
   (merge `88e434474c388fb397ad09878ec6139064fbfffd`, 2026-10-23T10:20:04Z; feature commit
   `0742a20…`, act `IIPS-V3-CAP02-U7-IPD-PROVIDER-OUTCOME-ACT-2026-10-23-01`) amended the
   exported port/modal exactly as §6 and U7 §5 required, verified in source and in the built
   declarations at `24e62c80…`: minimal `PortfolioCommitReceipt` required on success with the
   legacy result optional; refusal record/durability optional (nothing fabricated on the port
   path); distinct `OUTCOME_UNKNOWN` third outcome with no retry and no rollback claim;
   receipt-driven durability separate from the static capability declaration; `getAnalytics`
   optional; receipt-only modal success panel with no preview fallbacks. A consumer compile
   check against the candidate package confirms the port, outcome union and modal props are
   implementable without fabrication. **Two residual provider gaps remain** (recorded for the
   IPD handoff; neither is worked around IRR-side): (a) the package entry does not re-export
   the `PortfolioCommitReceipt`/`PortfolioCommitDisposition`/`PortfolioPortSaveOutcomeUnknown`
   type names (reachable structurally via the exported outcome members only); (b)
   `PortfolioPortRefusalCode` has no `WRITE_NOT_AUTHORIZED` or `RESOURCE_UNAVAILABLE` member,
   so the W-1 refusal cannot yet be carried as a typed port code (the IPD act's §3.6 statement
   that `WRITE_NOT_AUTHORIZED` appears in the refusal vocabulary is not borne out by the port
   declarations).

### 13.2 Consequences under this act

1. **B-1R remains AUTHORIZED but NOT EXECUTED.** §12.4 stands, with the prerequisite restated
   precisely: an IPD act (IPD capacity) that (i) main-admits `pit_read_service`/D114
   non-production population modules (or their accepted equivalents), and (ii) adds `./pit` +
   `./d114-non-production` exports resolving to real build output and declarations carrying at
   least `PitReadService`, `PointInTimeStore`, `DataProvenanceDTO`, `CanonicalEnvelope`,
   `DataDomain`, `populateNonProductionD114Pit`, `createNonProductionD114PitStore`,
   `ingestNonProductionD114Archives` and the `NON_PRODUCTION_D114_*` constants the six IRR
   consumers import. Item (iii), fixing the two residual gaps in §13.1.4, is requested in the
   same handoff. After that act lands on IPD `main`, the plain repin to the then-current exact
   `main` commit plus the §8 program remains already authorized by §3.1; the hardened guarded
   test (`brokerImportPackageConsumer.test.ts`) enforces all three exports and the PIT symbols
   and auto-activates the `./portfolio-ui` closure suite.
2. **Modal mount, `PortfolioStorePort` implementation and revision-read route remain
   UNAUTHORIZED under this act.** U7 §5's condition is conjunctive — IPD provider act on `main`
   **and** IRR repin to it — and §7 of this act excludes the mount outright. The provider half
   is met (§13.1.4); the repin is not executable (§13.1.2–3), and at the retained pin the
   `./portfolio-ui` export does not exist, so no conforming adapter or mount can even compile.
   No guessed or mirrored provider contract was mounted. The next IRR step after the repin is a
   **new** exact-scope composition act (successor to this one) authorizing the
   `BrokerImportSurface`, the IRR `PortfolioStorePort` adapter over the admitted route
   (mapping `WRITE_NOT_AUTHORIZED`/`RESOURCE_UNAVAILABLE` truthfully pending §13.1.4(b)), and —
   under its own admission — the revision-only read (U7 §1.4, `portfolio.list` summary of the
   exact default portfolio).
3. **Write safeguards unchanged.** The binding precondition remains fail-closed and unactivated;
   `durable:false` remains the honest declaration; IPD `WRITE_NOT_AUTHORIZED` stands until
   IPD's own Gate E/W-1 and U3–U6 chain completes; all twelve 503 fences remain byte-stable;
   no wildcard CORS, no identity/binding provisioning, no IPD mutation. A completed route or
   passing CI closes none of Gate A′/E, write authorization or durability qualification.

### 13.3 Status addendum (supplements §11/§12.4; nothing else changes)

```text
B-1R:                             AUTHORIZED but NOT EXECUTED — re-verified blocked at
                                  IPD main@24e62c80… (§13.1.2–3); pin retained at 2e11fa3b…
U7 provider (IPD modal/port):     SATISFIED on IPD main sources (PR #54) — unreachable
                                  until the repin; two residual gaps open (§13.1.4)
Modal mount / PortfolioStorePort: NOT AUTHORIZED — awaits repin + new composition act (§13.2.2)
Revision-read route:              NOT ADMITTED — awaits its own act after the repin
Writes / W-1 / Gates A′/4/5/E:   UNCHANGED — WRITE_NOT_AUTHORIZED, zero store effect
Twelve /api/user-portfolios* pairs: UNCHANGED — HTTP 503, byte-stable blobs
IPD repository:                   UNCHANGED by IRR (read-only inspection only)
```

## 14. Dated addendum (2026-10-23, third pass): IPD packaging prerequisite satisfied at `2d9130e76bb0dc89daeefabaf297e27bdaa84250`; B-1R pin coordinate updated and successor modal/port/revision-read act rendered

This section is an additive dated addendum under DEC-06 R-2/R-5: §§1–13 above are preserved
verbatim.

1. **IPD prerequisite satisfied on `main`.** IPD PR #58 (merged as
   `16459f465024ca1eb4da4953d8e178eba4269f8e`) and PR #59 (merged as
   `2d9130e76bb0dc89daeefabaf297e27bdaa84250`, tree `4658699180ef161aae3c1b33d3946e918d6fb9b2`,
   CI `39951277310` and `39951735664` `success`) published `./pit` and `./d114-non-production`
   alongside `./portfolio-ui` on IPD `main` with real `dist/package/**` build output and
   declarations, verified against all five direct IRR PIT/D114 importers (with the sixth path
   `frontend/src/api/pit.test.ts` confirmed comment-only for direct package specifiers and
   transitive via `server/pit/nonProductionPitStore.ts`), and closed both residual U7 provider
   gaps noted in §13.1.4 (`PortfolioCommitReceipt`, `PortfolioCommitDisposition`, and
   `PortfolioPortSaveOutcomeUnknown` are now re-exported by name from `./portfolio-ui`, and
   `WRITE_NOT_AUTHORIZED` / `RESOURCE_UNAVAILABLE` are included in `PortfolioPortRefusalCode`).
2. **B-1R pin coordinate updated.** The exact target commit for the §3.1 / §13.2.1 B-1R repin is
   updated from the superseded `554ed6ce…` coordinate to the verified compatible IPD `main` commit
   `2d9130e76bb0dc89daeefabaf297e27bdaa84250`.
3. **Successor exact-scope composition act rendered.** The modal mount, IRR `PortfolioStorePort`
   adapter, replacement of local structural mirror types in `frontend/src/api/brokerImport.ts`
   with `./portfolio-ui` package imports, and the separately admitted U7 §1.4 revision-read route
   (`GET /api/broker-import/:portfolioId/revision`) are rendered effective in the successor record
   `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-04`
   (`docs/integration/IIPS_v3.0_CAP02_BROKER_IMPORT_MODAL_PORT_COMPOSITION_ACT_EFFECTIVE_2026-10-23.md`)
   together with companion U1 §7 and U7 §7 addenda. All write safeguards, the unactivated binding
   precondition, `SESSION_ONLY`/`durable:false`, and all twelve `/api/user-portfolios*` 503 fences
   remain unchanged.
