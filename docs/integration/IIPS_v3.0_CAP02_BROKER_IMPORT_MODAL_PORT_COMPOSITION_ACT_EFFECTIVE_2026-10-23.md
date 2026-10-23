# IIPS v3.0 — CAP-02 — Exact-Scope Broker-Import Modal, `PortfolioStorePort` Adapter, and Revision-Read Composition Act — **RENDERED — EFFECTIVE**

> ## STATUS: **EFFECTIVE — FOR THE EXACT B-1R PIN UPDATE, MODAL/PORT COMPOSITION, AND U7 §1.4 REVISION-READ SCOPE IN §3 ONLY — NO OPERATIONAL WRITE AUTHORIZATION, NO BINDING PROVISIONING, NO DURABILITY QUALIFICATION, NO FENCE LIFT, NO GATE MOVEMENT**
> This record renders effective the successor exact-scope IRR composition act anticipated by
> `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-03` (§7, §12.3.2–3, §13.2.1–2;
> baseline blob `c75db85973a587b31293ff6d79553f1525be87c9`), `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01`
> (§1; baseline blob `50406d6a8da423f0e5ab38f7611d3103e539db9e`), and
> `IIPS-V3-CAP02-U7-READ-RESULT-CONTRACT-DECISION-EFFECTIVE-2026-10-23-01` (§1.4, §5; baseline blob
> `7d8021425898d70eee9e5027ed2094fdc6345132`), following independent verification of the published IPD
> compatibility increment on IPD `main@2d9130e76bb0dc89daeefabaf297e27bdaa84250` (tree
> `4658699180ef161aae3c1b33d3946e918d6fb9b2`, merged via IPD PR #58 `16459f465024ca1eb4da4953d8e178eba4269f8e`
> and PR #59 `2d9130e76bb0dc89daeefabaf297e27bdaa84250`).
>
> **It authorizes exactly:** (1) updating the B-1R dependency pin in `frontend/package.json` and
> `frontend/package-lock.json` to the verified compatible IPD `main` commit
> `2d9130e76bb0dc89daeefabaf297e27bdaa84250`, replacing the local structural mirror types in
> `frontend/src/api/brokerImport.ts` with direct imports from `iips-production-market-data/portfolio-ui`,
> and updating the committed pin/consumer guard test; (2) admitting and implementing the narrow U7 §1.4
> revision-read and unknown-outcome reconciliation route `GET /api/broker-import/:portfolioId/revision`
> on the existing `/api/broker-import` namespace; (3) implementing the IRR `PortfolioStorePort` adapter
> (`frontend/src/features/portfolio-import/irrPortfolioStorePortAdapter.ts`) over the IRR browser HTTP
> client; and (4) mounting the verified IPD `BrokerImportModal` in `BrokerImportSurface`
> (`frontend/src/features/portfolio-import/BrokerImportSurface.tsx`) at `/user-portfolios/import` in
> `frontend/src/app/App.tsx`, with unit, public-package consumer, and real composed-host tests.
> **It authorizes no** operational write, no binding provisioning or activation, no production durability
> qualification, no unrelated portfolio API or route change, no `/api/user-portfolios*` fence change,
> no schema or persistence change, and no IPD mutation.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-04` |
| **Record type** | Rendered exact-scope composition and revision-read admission act — B-1R pin coordinate, file manifest, adapter/modal/revision-read boundary, test obligations, preserved safeguards, non-goals |
| **Status** | **EFFECTIVE** for the exact scope of §3 only. Everything in §6 remains unauthorized |
| **Rendered / effective date** | `2026-10-23` (UTC) |
| **Decision authority** | Ramki — Program Authority, single owner/user of the single-user personal-use IIPS platform |
| **Authority exercised** | The PA's standing grant of global decision and execution authority (2026-10-12), transcribed at `docs/integration/IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` §1.2, blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02` (re-verified at current `main`), **as construed** by `IIPS-V3-DEC06-AUTHORITY-RECONCILIATION-IRR-2026-10-21-01` (`R-1`/`R-3`/`R-6`/`R-7`), **plus** the PA's `2026-10-23` CAP-02 execution directive instructing verification of the published IPD package, completion of B-1R, rendering of the required exact-scope composition act, and implementation of the modal/port/revision-read integration in one pass |
| **Governing effective decisions** | Topology/ownership `IIPS-V3-CAP02-PA-TOPOLOGY-OWNERSHIP-EFFECTIVE-2026-10-23-01` (blob `48bc8375…`); U0 placement `IIPS-V3-CAP02-U0-BROKER-IMPORT-UI-PLACEMENT-EFFECTIVE-2026-10-23-01` (blob `43793d66…`); prior host-transport composition act `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-03` (blob `c75db859…`); U1 route admission act `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01` (blob `50406d6a…`, with companion §7 revision-read amendment); U7 consumer contract decision `IIPS-V3-CAP02-U7-READ-RESULT-CONTRACT-DECISION-EFFECTIVE-2026-10-23-01` (blob `7d802142…`, with companion §7 addendum) |
| **Evidence baselines** | IRR `main@98cd56a9a568f431ea31d5515e515a1b6cbb91ba`, tree `001d7e8addcc49c9a6c7d536d24c1056e2733a26` (merge of PR #222; CI `39947165264` `success`); IPD `main@2d9130e76bb0dc89daeefabaf297e27bdaa84250`, tree `4658699180ef161aae3c1b33d3946e918d6fb9b2` (merge of PR #59 following PR #58 `16459f465024ca1eb4da4953d8e178eba4269f8e`; CI `39951277310` and `39951735664` `success`; inspected read-only) |
| **Publication authority** | Standing PR-lifecycle execution and merge authorization `CHG-2026-10-18-02`, applied per §8 |
| **Rendered in repository** | `ramkivs/iips-review-recovered`; branch `arena/c6af7f3d-iips-review-recovered` |
| **Mutation boundary at rendering** | IRR governance documentation only in the decision PR; B-1R and modal/port/revision-read implementation follow only after this record's publication and remote verification on `origin/main` (§8) |

---

## 1. Independent verification of the cross-repository prerequisites

Before rendering this act, the reported IPD publication at `2d9130e76bb0dc89daeefabaf297e27bdaa84250`
(tree `4658699180ef161aae3c1b33d3946e918d6fb9b2`) was independently inspected read-only in a clean
clone and consumer build:

1. **Unified package export surface (`package.json` blob `51796e63280c1abb368c27bf8811cc6bad46e132`).**
   `iips-production-market-data@1.0.0` on IPD `main` now declares all three required subpaths:
   - `./portfolio-ui` → `types: ./dist/package/src/ui/portfolio_ui_package.d.ts`, `import: ./dist/package/src/ui/portfolio_ui_package.js`
   - `./pit` → `types: ./dist/package/src/pit/package.d.ts`, `import: ./dist/package/src/pit/package.js`
   - `./d114-non-production` → `types: ./dist/package/src/d114/non_production_package.d.ts`, `import: ./dist/package/src/d114/non_production_package.js`
   The `prepare`/`prepack` lifecycle runs `npm run build:portfolio-ui-package && npm run build:pit-package`,
   emitting real JavaScript and TypeScript declarations for all three subpaths under `dist/package/`.
2. **PIT and D114 consumer compatibility (`src/pit/package.ts` blob `71d93df2…`, `src/pit/pit_read_service.ts` blob `ba3f2565…`, `src/pit/pit_store.ts` blob `8fd3c9a6…`, `src/d114/non_production_package.ts` blob `dfe339f8…`, `src/d114/non_production_pit_population.ts` blob `6aa49de8…`).**
   `./pit` exports runtime `PitReadService` and `PointInTimeStore` plus types `PitReadRequest`,
   `PitReadResult`, `PitReadHit`, `PitReadMiss`, `PitReadFailureReason`, `PITQuery`,
   `CanonicalEnvelope`, `DataDomain`, and `DataProvenanceDTO`. `./d114-non-production` exports
   runtime `createNonProductionD114PitStore`, `populateNonProductionD114Pit`,
   `ingestNonProductionD114Archives`, `NON_PRODUCTION_D114_EQ`, `NON_PRODUCTION_D114_BL`, and
   `NON_PRODUCTION_D114_VINTAGE_1..3` plus types `NonProductionD114Population` and
   `ArchiveIngestionResult`. All five direct IRR PIT/D114 importers resolve and compile without
   modification; the sixth registered path (`frontend/src/api/pit.test.ts`) remains comment-only
   for direct package specifiers and resolves transitively through `server/pit/nonProductionPitStore.ts`.
3. **Complete U7 provider contract (`src/ui/portfolio_ui_package.ts` blob `95f3fd20…`, `frontend/src/features/portfolio/portfolioStorePort.ts` blob `fd01731f…`, `frontend/src/features/portfolio/BrokerImportModal.tsx` blob `fae2a682…`, `frontend/src/features/portfolio/import/ui-broker-import-view-model.ts` blob `37cc9c88…`).**
   In addition to the PR #54 U7 provider-outcome changes, PR #58 closed both residual gaps recorded
   in composition act `-03` §13.1.4:
   - `PortfolioCommitReceipt`, `PortfolioCommitDisposition`, and `PortfolioPortSaveOutcomeUnknown`
     are now directly re-exported by name from `./portfolio-ui`.
   - `PortfolioPortRefusalCode` now includes `'WRITE_NOT_AUTHORIZED'` and `'RESOURCE_UNAVAILABLE'`
     alongside `'REFUSED_UNRESOLVED_IDENTITY' | 'REFUSED_STORE_GUARD' | 'REVISION_CONFLICT' | 'INVALID_REQUEST' | 'UNAVAILABLE'`.

The conjunctive prerequisite in composition act `-03` (§6, §12, §13.2) and U7 §5 is therefore
**satisfied on IPD `main@2d9130e76bb0dc89daeefabaf297e27bdaa84250`**.

---

## 2. Authority determination (why no additional approval is required)

| Test (U0 §2.3 / DEC-06 form) | Finding |
|---|---|
| Established PA work item? | Yes. Composition act `-03` §13.2.2 and U7 §1.4/§5 explicitly identified this exact successor act once the IPD packaging and U7 provider prerequisites landed on IPD `main` |
| Necessary decision or scope expansion? | Necessary decision within fixed boundaries. It authorizes only the consumer integration already selected by U0 Option C, topology decision `-01`, U1 `-01`, and U7 `-01` |
| Explicit gate bypassed? | No. Gate A′, Gate 4, U4 result acceptance, Gate 5 admission, and Gate E W-1 operational write authorization remain untouched and ungranted |
| Safeguard weakened? | No. `WRITE_NOT_AUTHORIZED`, `SESSION_ONLY`/`durable:false`, the unactivated binding precondition, C8/C9 posture, and all twelve `/api/user-portfolios*` HTTP 503 fences remain intact |
| Capacity respected (R-7)? | Yes. All changes are IRR-owned; IPD is inspected read-only |

---

## 3. Exact authorized scope

No decision already effective in `-03`, `U1`, or `U7` is duplicated; this act authorizes only the
increment that depended on B-1R closure and the verified IPD package surface:

### 3.1 B-1R dependency re-pin and public-package type adoption

| Path (IRR) | Action | Authorized scope |
|---|---|---|
| `frontend/package.json` | **modify** (baseline `a6a0521c…`) | Update `iips-production-market-data` pin from `github:ramkivs/iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` to `github:ramkivs/iips-production-market-data#2d9130e76bb0dc89daeefabaf297e27bdaa84250` |
| `frontend/package-lock.json` | **modify** (baseline `4f068d98…`) | Lockfile resolution matching the exact `2d9130e76bb0dc89daeefabaf297e27bdaa84250` commit |
| `frontend/src/api/brokerImport.ts` | **modify** (baseline `e5eb492f…`) | Replace local structural mirror types with direct imports of `UserHoldingInput`, `PortfolioCommitDisposition`, `PortfolioCommitReceipt`, `PortfolioDurability`, and `PortfolioPortRefusalCode` from `'iips-production-market-data/portfolio-ui'` (retaining type aliases for backwards compatibility); add `readBrokerImportRevision` client for the admitted revision-read route (§3.2) |
| `frontend/server/broker-import/brokerImportPackageConsumer.test.ts` | **modify** (baseline `9787eaa2…`) | Enforce the exact verified `2d9130e76bb0dc89daeefabaf297e27bdaa84250` pin, reject any incompatible pin missing `./portfolio-ui`, `./pit`, or `./d114-non-production` or their required runtime/type symbols, verify the five direct PIT/D114 importers and the sixth comment-only/transitive path (`frontend/src/api/pit.test.ts`), and run the active `./portfolio-ui` runtime, U7 refusal-code, DP-2 Option 2F, and browser-closure assertions |

### 3.2 U7 §1.4 revision-read and unknown-outcome reconciliation route

Admitted by companion U1 §7 amendment and U7 §7 addendum for the narrow U7 §1.4 purpose only:

```text
GET /api/broker-import/:portfolioId/revision
```

| Path (IRR) | Action | Authorized scope |
|---|---|---|
| `frontend/server/broker-import/brokerImportV1SaveAdapter.ts` | **modify** | Add `readBrokerImportRevisionViaV1` calling `callIpc('portfolio.list', {}, {})` once (zero retries), validating the v1 `PortfolioSummary[]` response, selecting the exact requested `portfolioId`, and returning `{ kind: 'REVISION_TOKEN', token: { portfolioId, revision } }` or `{ kind: 'CLASS_A_REFUSAL', outcome: 'RESOURCE_UNAVAILABLE' }` when absent (never inventing revision `0`) |
| `frontend/server/broker-import/brokerImportHttp.ts` | **modify** | Dispatch `GET /api/broker-import/:portfolioId/revision` (`405 Allow: GET` on other methods; `POST /api/broker-import/:portfolioId/holdings` remains `405 Allow: POST` on other methods; `/api/broker-import/:portfolioId/preview` and all other paths remain `404`). Enforce C9 first-party signal, query-string refusal, binding-precondition fail-close (`503 owner-context-unavailable` before any adapter/socket), opaque `portfolioId` validation, and U1/U7 outcome mapping (`200 { portfolioId, revision }`, `404 { outcome: 'RESOURCE_UNAVAILABLE' }`, `503 { outcome: 'OUTCOME_UNKNOWN', retried: false }`, Class P → `503 owner-context-unavailable`) |
| `frontend/server/broker-import/index.ts` | **modify** | Re-export the revision-read adapter types and function |
| `frontend/server/executive-transport.ts` | **modify** | Comment refresh on the existing `/api/broker-import` dispatch block noting both admitted routes (`POST .../holdings` and `GET .../revision`); no dispatch or C8 prefix logic change |

### 3.3 IRR `PortfolioStorePort` adapter and `BrokerImportModal` host mount

| Path (IRR) | Action | Authorized scope |
|---|---|---|
| `frontend/src/features/portfolio-import/irrPortfolioStorePortAdapter.ts` | **new** | Implements `PortfolioStorePort` from `'iips-production-market-data/portfolio-ui'` over `frontend/src/api/brokerImport.ts`. Declares `durability: 'SESSION_ONLY'` and `durable: false`; refuses caller-supplied identity/authority keys (`findCallerSuppliedIdentityKeys` + holding/option scan) and unresolved/ambiguous holdings (`evaluatePortSaveGuard`) before any HTTP call; requires non-negative integer `expectedRevision` (no zero fallback); projects only the 7 broker-observed holding fields (`symbol`, `isin`, `exchange`, `quantity`, `averageBuyPrice`, `currentPrice`, `marketValue`) plus `mode`, `contentDigest`, and `sourceBroker` → `broker` (never sending `fileName`, `importedAt`, or `lineageDigest`); maps receipt to `PortfolioPortSaveSuccess` (`result: undefined`), refusals to `PortfolioPortSaveRefusal` (`portfolio: undefined`, no durability/timestamp/metric fabrication), and unknown outcomes to `PortfolioPortSaveOutcomeUnknown` (`reconciliationRequired: true`, zero retry); implements `getPortfolio` (`undefined`), `getRevision` (via `readBrokerImportRevision`, throwing on unavailable rather than inventing `0`), and `reconcileUnknownOutcome` (GET-only revision read, zero POST retry, no rollback/durability/record fabrication) |
| `frontend/src/features/portfolio-import/BrokerImportSurface.tsx` | **new** | Host container mounting `BrokerImportModal` from `'iips-production-market-data/portfolio-ui'` with `IrrBrokerImportStorePortAdapter`, `getGovernedBroadSecurityMaster()`, and fallback `PortfolioStore` instance. Performs immediate revision-only read for `DEFAULT_PORTFOLIO` on mount/refresh, passes authoritative `expectedRevision` (or `undefined` when unavailable, never inventing `0`), renders truthful durability status (`SESSION_ONLY` / `durable: false` unless an authoritative commit receipt states otherwise), surfaces refusals and `OUTCOME_UNKNOWN`, and provides explicit user-triggered read-only reconciliation |
| `frontend/src/app/App.tsx` | **modify** | Mount `<Route path="/user-portfolios/import" element={<BrokerImportSurface />} />` inside `AppShell` prior to `/user-portfolios/:portfolioId`; all existing routes unchanged |
| `frontend/server/broker-import/brokerImportV1SaveAdapter.test.ts`, `frontend/server/broker-import/brokerImportHttp.test.ts`, `frontend/src/api/brokerImport.test.ts`, `frontend/src/features/portfolio-import/irrPortfolioStorePortAdapter.test.ts`, `frontend/src/features/portfolio-import/BrokerImportSurface.test.tsx` | **modify / new** | Focused unit, public-package consumer, and real composed-host tests covering revision-read, adapter mapping, modal rendering, valid/invalid/prohibited requests, receipt success, refusal mapping, `OUTCOME_UNKNOWN` with no retry, read-only reconciliation, missing-binding fail-closed 503, and all twelve `/api/user-portfolios*` 503 fences |

---

## 4. Preserved fences and unchanged files

- `frontend/server/user-portfolio-transport.ts` (`51704c12a467cd2f718a030b5036bc55c9afa73f`),
  `frontend/server/owner-context-unavailable.ts` (`cb8db45d668d28cee7e0a52721001d579a872733`), and
  all of `frontend/server/user-portfolio/**` (`userPortfolioContract.ts` `e6b57bb8…`, `ipcClient.ts`
  `c1b885e3…`, `ipcPortAdapter.ts` `7881185e…`, `ownerContextFromBinding.ts` `296dd5e3…`,
  `firstPartySignal.ts` `d2f0ae72…`, etc.) remain **byte-identical**.
- All twelve `/api/user-portfolios*` route-method pairs continue to return HTTP 503.
- All five direct PIT/D114 consumer files (`frontend/server/pit/**`) and the sixth test file
  (`frontend/src/api/pit.test.ts`) remain **byte-identical**.
- `frontend/src/features/user-portfolios/**`, `frontend/src/app/navigation.ts`,
  `frontend/src/app/routes.ts`, `frontend/vite.config.ts`, and `.github/workflows/ci.yml` remain
  **byte-identical**.
- Every IPD file, branch, PR, issue, and tracker remains untouched.

---

## 5. Fail-closed write and durability safeguards

1. `WRITE_NOT_AUTHORIZED` remains enforced on IPD `main`; this act grants no operational write.
2. `SESSION_ONLY` and `durable: false` remain the adapter's static declaration; per-operation
   durability is rendered solely from an authoritative post-commit receipt.
3. `IIPS_G3_IPC_BINDING_PROVISIONED` remains unactivated and defaults to fail-closed (`false`); no
   identity or binding is provisioned.
4. Both admitted `/api/broker-import/:portfolioId/{holdings,revision}` routes fail closed with
   `503 owner-context-unavailable` before constructing any port, adapter, or IPC socket when the
   binding precondition is absent.
5. No browser request can supply caller-authority or canonical-identity keys; no unsupported
   `fileName` or `importedAt` field is added to the v1 save payload.
6. Unknown outcomes (`OUTCOME_UNKNOWN`) perform zero automatic retries, claim no rollback, claim no
   durability, and fabricate no portfolio record; reconciliation performs only the admitted
   revision-only GET read.

---

## 6. Explicit non-goals and exclusions

1. No operational write authorization (Gate E W-1 / U6).
2. No Gate A′ binding provisioning or identity creation.
3. No Gate 4 target-host qualification (U3), Gate 4 result acceptance (U4), or Gate 5 admission (U5).
4. No `PortfolioWorkspace` mount or `portfolio.analytics` dispatch.
5. No G2 list/detail/revision-history view changes or `/api/user-portfolios*` fence changes.
6. No schema, migration, or IPC protocol changes.

---

## 7. Rollback boundary

Revertible by reverting the modal/port/revision-read commit(s) and the B-1R pin commit: no schema,
migration, durable store, fence, or IPD state is altered.

---

## 8. Publication and effectiveness

Rendered `2026-10-23` (UTC); effective on rendering; proven as authority from `main` by merge commit
and remote blob read-back on `origin/main` before the §3 implementation PRs are merged.

```text
B-1R pin update (2d9130e7…):      AUTHORIZED under §3.1 (and -03 §3.1/§13.2.1)
U1 revision-read GET route:       ADMITTED under companion U1 §7 + §3.2 of this act
IRR PortfolioStorePort adapter:   AUTHORIZED under §3.3
BrokerImportModal mount:          AUTHORIZED under §3.3 (/user-portfolios/import)
Writes / W-1 / Gates A′/4/5/E:    UNCHANGED — WRITE_NOT_AUTHORIZED, binding absent, durable:false
Twelve /api/user-portfolios* 503: UNCHANGED — byte-stable
```
