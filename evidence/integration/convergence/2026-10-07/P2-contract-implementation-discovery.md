# P2 — CONTRACT / IMPLEMENTATION DISCOVERY — INVESTIGATION REPORT

**IIPS SINGLE-PLATFORM INTEGRATION & CONVERGENCE — P2 only.**
NON-PRODUCTION · READ-ONLY · NO MUTATION · NO LIVE-IDP TESTING · NO PENETRATION TESTING

- **Evidence date (UTC):** 2026-10-07
- **Attribution:** IRR @ `origin/main` `17e234a1d6a5e1629cdf98b5c5f241a663cf9901` (tree `c6fb24d9…`); IPD @ `origin/main` `4d3e1cdca3a33da0ec3be8b336b17128108a502c` (tree `db853dc2…`); IPD pinned lineages explicitly named where relevant: pin `2e11fa3b` (`np04-governed-persistence-windows`) and G24 `6828155` (`arena/01a0e6d9`).
- **Method:** file-tree analysis, `git show`/`git grep` at pinned commits, cross-repository blob comparison. No file was modified; no test was run against live services.

---

## 1. Contract Inventory

| Area | Repository | Path | Contract/Symbol | Owner | Consumers | Status |
|---|---|---|---|---|---|---|
| PIT read (cross-repo) | IRR | `frontend/server/pit/pitReadContract.ts` | `PitReadRequest/Hit/Miss/Provenance`, `PIT_READ_DOMAINS = ['D01_QUOTES','D02_OHLCV']`, `securityId = ISIN:<isin>:<series>`, `PitReadFailureReason` | IRR (transport shape) | `pitReadBoundary.ts`, `pit.ts` client, `pit-transport.ts` | **VERIFIED on main** — fail-closed, no companyId/tenant/userId |
| PIT read port | IRR | `frontend/server/pit/pitReadPort.ts` | `PitReadPort` | IRR | `ipdPitReadAdapter.ts`, `executive-transport.getPitReadPort()` | VERIFIED |
| PIT service (IPD) | IPD (pin `2e11fa3b` only) | `src/pit/pit_read_service.ts`, `src/pit/package.ts`, `src/pit/pit_store.ts` (series-aware keying) | `PitReadService`, `PointInTimeStore`, `DataProvenanceDTO` | IPD | IRR adapter (package import) | **OFF-MAIN** — IPD main `pit_store.ts` is in-memory and `companyId`-keyed; series-aware keying (IU-1) + read service (IU-3) exist only on pinned lineage |
| D114 population | IPD (pin only) | `src/d114/non_production_pit_population.ts`, `non_production_package.ts` | `populateNonProductionD114Pit` | IPD | IRR `nonProductionRuntimePitStore.ts` | **OFF-MAIN** |
| G-2 user portfolio (wire) | IRR | `frontend/server/user-portfolio/userPortfolioContract.ts` | `G2_CONTRACT_VERSION='1'`, `G2_LINEAGE` (pins IPD `arena/01a0e6d9@6828155`, acceptance `01a0f839@12c480b`), `G2_ROUTES` (`/api/ipd/portfolios*`), `G2_IPD_AUDIENCE='ipd-user-portfolio-api'`, `G2_TENANT_HEADER='x-ipd-tenant-id'`, `G2Error` closed vocabulary, HTTP status mapping | IRR (transport shape); IPD/G24 (all value semantics) | `userPortfolioPort.ts`, `ipdUserPortfolioAdapter.ts`, `user-portfolio-transport.ts`, `contractStub.ts` (test-only) | **VERIFIED on main** (contract); counterpart implementation OFF-MAIN |
| G-2 port | IRR | `frontend/server/user-portfolio/userPortfolioPort.ts` | `UserPortfolioPort` (7 ops, 1 HTTP request each, `G2Scope{tenantHint}`) | IRR | transport; (no UI consumer — deliberate) | VERIFIED |
| G-2 identity translation | IRR | `frontend/server/user-portfolio/translationBoundary.ts` | `deriveTenantHint`, `assertNoIdentityClaims`, `G2ProvisioningRecord` (D-2 §8, 15 binding items) | IRR | transport/adapter | VERIFIED |
| G-2 backend | IPD (G24 `6828155` only) | `src/server/http-server.ts` (blob `17f9cb8a…`), `src/server/authorization.ts`, `src/auth/oidc-verifier.ts`, `src/app_identity/{service,types,repository}.ts`, `src/portfolio/{durable-store,repository,consolidation}.ts`, `src/persistence/*` + migrations 001–002 | `IpdHttpServer`, `IdentityService`, `DurablePortfolioStore` | IPD | IRR adapter over HTTP | **OFF-MAIN** — better-sqlite3, immediate transactions, append-only migration ledger |
| NP-04 artifact persistence | IRR (consumer) / IPD pin (impl) | IRR `frontend/server/reports/persistence-port.ts` mirrors IPD pin `src/persistence/{store,identity}.ts` | `ReportsPersistencePort` (5 ops), `Np04AuthenticatedOwner{tenantId,userId}`, `Np04GovernedArtifact`, `reportKey` (content identity), `reportId` (instance identity) | IPD (NP-04) | IRR `reports/{persistence,np04-adapter,persistence}.ts`, `reports-transport.ts` | **VERIFIED on main** (port + dynamic import); store OFF-MAIN (pin only); IRR fails closed 503 when unresolvable |
| Governed Screen (NP-12 N4) | IRR | `iips-platform/src/sector-engines/cross-sector/definition/ScreenDefinition.ts`, `screen/{ScreenExecution,ScreenProducerAdapter}.ts`, `population/ScreeningPopulation.ts` | `ScreenDefinition`, `executeScreen`, `produceScreenMembers`, `populationIdentity` | IRR | `frontend/server/screener/screener-transport.ts` (`POST /api/screener`) | VERIFIED on main — engine-free, server-derived 13 governed members, client `members` rejected 422 |
| Certified engines | IRR | `iips-platform/src/integration/EngineRegistry.ts` | `CERTIFIED_ENGINES` (13: banking, insurance, capital-markets, healthcare, hospitality, energy, utilities, consumer, industrials, technology, telecom, auto, materials), `EngineRegistryEntry` | IRR | `EngineApiAdapter`, engine-transport, admin-transport, frontend `api/engines.ts` | VERIFIED on main |
| Engine API | IRR | `frontend/server` routes `GET /api/engines`, `POST /api/engines/:id/execute` | apiVersion `'1.0'`, engineId path+body match, deterministic snapshotRef, 404 uncertified | IRR | `frontend/src/features/engines/EngineRegistry.tsx` | VERIFIED (transport tests `engine-transport.test.ts`) |
| Identity/tenant (platform) | IRR | `frontend/src/core/auth/{authContract,keycloakAdapter,oidcClient}.ts`, `frontend/server/secured-executor.ts`, `frontend/server/tenant-membership-store.ts`, `iips-platform/src/distributed/EnterpriseRuntime.ts` | `ValidatedIdentity`, `KeycloakSessionValidator`, `Principal{userId,tenantId,roles}`, `TenantDirectory`/`GovernedTenantMembershipDirectory`, `SecuredExecutor` | IRR | all guarded transports | VERIFIED on main (realm `iips`, client `iips-spa`) |
| Company identity (D115) | IRR | `frontend/server/d115-runtime.ts` | `D115CompanyAuthorizer`, `RuntimeCompanyContext`, binding states PROPOSED/ACTIVE/… | IRR | admin/executive paths | VERIFIED on main (authority injected; fails closed) |
| Macro (D08) | IRR | `frontend/server/macro/{macro-transport,mospi-source}.ts` | MoSPI designated provider (NAS/CPI/IIP) | IRR | `/api/macro/*` | VERIFIED on main |
| Data contracts D01–D09 | IPD main | `src/contracts/{d01_quotes…d09_altdata,envelope,provenance,types}.ts` | `CanonicalEnvelope{domain,mode,companyId,payload,provenance}`, `DataProvenanceDTO` | IPD | identity, pit, transports, ui view models, IRR (via pin) | VERIFIED on main |
| Instrument identity | IPD main | `src/identity/{security_master,mapping_store,quarantine,governed_fixture_master,d05_broad_universe_data}.ts` | `SecurityMaster`, `IdentityAmbiguityError(UNMAPPED_IDENTIFIER)`, 2,250-record D05 broad universe (verified count) | IPD | broker import mapper, UI08 surface, App.tsx | VERIFIED on main — fail-closed, no fuzzy matching |
| Screener (IPD) | IPD main | `src/transports/screener_service.ts` | `ScreenerService`, `ScreenerFilter`, `ScreenerCandidate` (Contract C6) | IPD | `UI06MultiFactorScreenerBuilder` | **PRESENT but FAILS CLOSED** — mounted route supplies no service/universe (uncommissioned) |
| View models UI01–UI14 | IPD main | `src/ui/view_models/ui01…ui14.ts`, `src/ui/ui_registry.ts` | per-surface builders | IPD | `frontend/src/features/*` surfaces | VERIFIED on main |
| Broker import (BI-03–08) | IPD main | `frontend/src/features/portfolio/import/*` (adapters: zerodha, groww, dhan, FINAPP foundation `src/` era), `broker-format-detector`, `broker-holdings-mapper` | `BrokerImportIngress`, `UserHoldingInput`, `DHAN_WEB_UI_SUMMARY_V1` | IPD | `PortfolioWorkspace.tsx`, `BrokerImportModal.tsx` | VERIFIED on main (session-lifetime store) |
| Watchlists/Collaboration/Settings | IRR | `frontend/server/{watchlists,collaboration,settings}/*` | service contracts over PF-1 journal events | IRR | `/api/watchlists`, `/api/collaboration*`, `/api/settings*` | VERIFIED on main |
| AI Advisory | IRR | `frontend/server/ai-advisory-transport.ts` (+ live-cert tests under `live/`) | selective transport reconciled onto main (PR #46) | IRR | `/api/ai-advisory/*`, `features/ai-advisory` | VERIFIED on main (canonical richer line unmerged — P1 ledger) |
| **Contract absent / evidence gap** | — | — | G-2 user-portfolio **UI client** (no `frontend/src` consumer of `/api/user-portfolios` — documented as deliberate); cross-repo **company mapping** (AG-5 explicitly avoided, not solved, in PIT contract); IPD-main ↔ IRR-main **integration contract** (none exists — IPD shell is offline donor restoration) | — | — | **CONTRACT ABSENT / EVIDENCE GAP** (recorded, not invented) |

---

## 2. Implementation Trace (representative critical paths)

### 2.1 Engine execution (IRR, fully on main)
`EngineRegistry.CERTIFIED_ENGINES` (13 frozen entries; `iips-platform/src/integration/EngineRegistry.ts`)
→ `POST /api/engines/:engineId/execute` (`frontend/server` engine routes; apiVersion check 422, unknown engine 404, path/body engineId mismatch 400)
→ engine factory (e.g. `sector-engines/technology/TechnologyEngine.ts`, frozen calibration JSON in `frozen-assets/`)
→ deterministic result + provenance + snapshotRef (same requestId+inputs → same snapshotRef; `engine-transport.test.ts`)
→ JSON DTO → `frontend/src/api/engines.ts` → `features/engines/EngineRegistry.tsx`.
Error handling: closed status codes (400/404/422), no fabrication. Owner: IRR.

### 2.2 PIT read (IRR main → IPD pin, cross-repository)
`frontend/src/api/pit.ts` (`GET /api/pit/market-data?securityId&domain&asOf`, mirrors contract; deliberately NOT the sector-addressed `/api/company/:id`)
→ `frontend/server/pit/pitReadBoundary.ts` (`validatePitReadRequest` fail-closed → delegate → vintage re-check vs `request.asOf`)
→ `PitReadPort` → `ipdPitReadAdapter.ts` (`createIpdPitReadPort(store)`; the ONLY IRR file referencing the IPD package besides reports persistence-port; provenance projected verbatim 6 fields)
→ IPD `PitReadService` over injected `PointInTimeStore` (package subpath `iips-production-market-data/pit` @ pin `2e11fa3b`)
→ store populated by `createNonProductionRuntimePitStore()` = real D114 historical ingestion + deterministic fixtures (`nonProductionRuntimePitStore.ts`, imports `populateNonProductionD114Pit` from `./d114-non-production`)
→ typed miss reasons surfaced unchanged (`INVALID_IDENTITY/INVALID_DOMAIN/INVALID_ASOF/NOT_FOUND/AMBIGUOUS`).
**Critical dependency fact:** every IPD symbol in this chain exists only at the pin (branch `np04-governed-persistence-windows`), not on IPD main.

### 2.3 Governed screener (IRR, on main)
`POST /api/screener {definition}` → `guardRead` (401/403 via SecuredExecutor) → `ScreenDefinition.create` (422 invalid) → `produceScreenMembers` (server-derived from v1.1.0 replay baseline + certified engine executions + golden identities; client `members` → 422; `populationIdentity` mismatch → 422) → `executeScreen` → `{execution,result,vintage}` byte-stable. No persistence, no IPD dependency.

### 2.4 G-2 durable user portfolio (IRR main → IPD G24 lineage, cross-repository)
`/api/user-portfolios/*` (`user-portfolio-transport.ts`; SecuredExecutor authenticate→authorize→resource gate; client-supplied identity fields refused)
→ `UserPortfolioPort` (7 ops; scope `G2Scope{tenantHint}` from `deriveTenantHint(principal)`)
→ `ipdUserPortfolioAdapter.ts` (one HTTP request per op; user's own bearer; envelope verification; closed `G2Error` mapping incl. existence-hiding 404; 409 revision conflict)
→ G24 `IpdHttpServer` `/api/ipd/portfolios*` (OFF-MAIN) → OIDC verification (audience `ipd-user-portfolio-api`, JWKS) → mapping registry `(issuer,subject)→applicationUserId` (ACTIVE only) → membership check vs `x-ipd-tenant-id` → `DurablePortfolioStore` (SQLite, one IMMEDIATE transaction per op, optimistic `expectedRevision`, tombstones, audit events)
→ DTO back (no `applicationUserId` disclosure).
Live seam behavior today: **503 fail-closed** until the IdP issues the IPD audience (live-IdP work deferred — no live testing performed, per scope). Tests use `contractStub.ts` (scripted wire stub, test-only).

### 2.5 IPD shell surfaces (IPD main, offline)
`index.html` → `frontend/src/main.tsx` → `App.tsx`/`routes.ts` (donor structure restored; 26 donor route paths) → surfaces bind in-process `src/` modules directly (verified imports: `App.tsx` → `getGovernedBroadSecurityMaster()`; `ExecutiveSurface` → `UI02ExecutiveSummaryBuilder` + DTOs; `EvidenceSurface` → `UI11ProvenanceAuditorBuilder`; `MultiFactorScreenerSurface` → `UI06MultiFactorScreenerBuilder` + `ScreenerService`). API/auth-coupled donor routes render `UnavailableSurface` (fail-closed); `/portfolio` (BI-08) is the functional mount with in-memory session-lifetime store.

---

## 3. Persistence Ownership Map

| Domain | Declared Owner | Actual Owner | Interface | Implementation | Identity Key | Durability Evidence | P3 Required |
|---|---|---|---|---|---|---|---|
| Durable user portfolio (G-2) | IPD Portfolio Domain (D-1 §2; G-2 §1) | IPD G24 lineage `arena/01a0e6d9@6828155` — **OFF-MAIN** | `UserPortfolioPort` (IRR) / `/api/ipd/portfolios*` HTTP v1 | `src/portfolio/durable-store.ts` + `src/persistence/*` (better-sqlite3, migrations 001–002, immediate transactions) | `(applicationUserId, tenantId)`; mapping `(issuer,subject)→applicationUserId` | IRR cites "G24 suite 84/84 PASS at this tip" (claim; suite lives OFF-MAIN); IRR-side contract/adapter tests on main use wire stub | **YES — P3 EVIDENCE REQUIRED** (durability proof must target the OFF-MAIN lineage; restart/crash behavior unproven on authoritative main) |
| Reports/artifacts (NP-06/NP-04) | IPD Artifact/Report Domain (D-1 §3) | IPD pin `np04-governed-persistence-windows@2e11fa3b` — **OFF-MAIN** | `ReportsPersistencePort` (5 ops) / dynamic import `iips-production-market-data/persistence` | `src/persistence/{store,db,schema,reportKey,identity}.ts` (SQLite; `openDatabase`, `GovernedArtifactStore`) | `reportKey` (deterministic content identity), `reportId` (NP-04-minted instance identity), owner `(tenantId,userId)` | `tests/np04_governed_persistence.test.ts` (749 lines, OFF-MAIN); IRR main has port-validation + fail-closed tests only | **YES — P3 EVIDENCE REQUIRED** |
| Watchlists | IRR (NP-09) | IRR main | `PersistenceService` (PF-1) | filesystem append-only NDJSON journal + derived index; event-sourced fold (`watchlists-service.ts`) | `(tenantId, ownerUserId)` + dedupKey; server-derived | journal version header, quarantine of truncated final line; **separate-process restart proof NOT on main** (on `arena/a2df3b85`) | **YES — P3 EVIDENCE REQUIRED** (restart proof unmerged) |
| Collaboration / Settings | IRR | IRR main | `PersistenceService` (PF-1) | same journal class, own data subdirs (verified imports in both services) | `(tenantId, ownerUserId)` | same as above | YES — P3 EVIDENCE REQUIRED |
| Tenant memberships | IRR (G3) | IRR main | `TenantDirectory`/`GovernedTenantMembershipDirectory` | `tenant-membership-store.ts` — filesystem store, checksummed, fail-closed, no cross-tenant reassignment | `userId`→`tenantId` | checksum + fail-closed reads; no restart proof examined | P3 EVIDENCE REQUIRED (light) |
| Platform snapshots/replay | IRR | IRR main | `SnapshotStore` | **in-memory** array (`iips-platform/src/snapshot/SnapshotStore.ts`) | snapshotId | process-local by construction | Noted (no durability claim made) |
| Certified reference portfolio | IRR | IRR main | `/api/portfolio` DTO | computed certified snapshot (`computeCertifiedPortfolio`), no user state | none (reference) | n/a | No |
| Point-in-time data (IPD main) | IPD | IPD main | `PointInTimeStore` | **in-memory `Map` keyed `${companyId}:${domain}`** | companyId + domain | process-local | Noted |
| Broker-import portfolio (BI-07/08) | IPD | IPD main | `portfolio-store.ts` | in-browser, **application-session lifetime** (commit `663dd9e`); no localStorage/IndexedDB/SQLite found (grep) | portfolioId + content/lineage digests | session-lifetime by design; non-durable | Noted (G-2 is the durable counterpart, OFF-MAIN) |
| D05 security master | IPD | IPD main | `SecurityMaster` / governed fixture master | build-time hydrated 2,250-record package (`evidence/operator_drop/d05_security_master_broad_universe.json`; count verified = 2,250) | ISIN/NSE_SYMBOL/BSE_SYMBOL → canonical entity | in-repo JSON (durable as code) | No |
| Engine calibration | IRR | IRR main | frozen assets | `sector-engines/*/frozen-assets/*.json` + freeze manifests | per-engine versions | in-repo | No |

---

## 4. Identity / Tenant Map

| Boundary | Input Identity | Translation | Output Identity | Evidence | Status |
|---|---|---|---|---|---|
| IRR browser → server | OIDC bearer (Keycloak realm `iips`, client `iips-spa`; E2E-015 SPA handoff) | `KeycloakSessionValidator` (issuer+audience+expiry, JWKS) → `ValidatedIdentity{subject,claims}` → `TenantDirectory` (filesystem membership store) | `Principal{userId (preferred_username‖subject), tenantId, roles}` | `secured-executor.ts`; `keycloakAdapter.ts`; `tenant-membership-store.ts`; D-2 §3.1 | CONSISTENT (server-side; client never trusted) |
| IRR → G-2 (G24) | validated `(issuer, subject)` pair from bearer | G24 mapping registry PENDING→APPROVED→ACTIVE→RETIRED; explicit operator provisioning only; NO trust propagation (user's own bearer re-validated by G24, distinct audience) | opaque `applicationUserId` (UUID); tenant via `x-ipd-tenant-id` validated against ACTIVE memberships | `translationBoundary.ts` §1–15; `userPortfolioContract.ts` | CONSISTENT, EXPLICIT boundary (D-2 Option B); live IdP deferred → 503 |
| IRR company scoping | Principal + owner/account | D115 binding repository (injected authority; states PROPOSED/ACTIVE/SUSPENDED/REVOKED/REPLACED/REMOVED) | immutable request-scoped `RuntimeCompanyContext` → canonical CompanyId | `d115-runtime.ts` | CONSISTENT, fails closed; no universal company authority (by D-2) |
| IRR → IPD PIT | `securityId = ISIN:<isin>:<series>` | none — IRR addresses IPD directly by canonical security identity; AG-5 company-level mapping deliberately avoided, not solved | IPD PIT record + verbatim provenance | `pitReadContract.ts` head | CONSISTENT (explicit non-goal recorded) |
| IPD instrument identity | broker symbols / ISIN | `SecurityMaster` + mapping store; fail-closed `UNMAPPED_IDENTIFIER`; no fuzzy matching | canonical D05 entity (2,250 records: 52 real + 2,198 synthetic) | `BLOCK-3L-…AUDIT.md`; `src/identity/*`; record count verified | CONSISTENT (documented synthetic tier-2 composition) |
| IPD main shell user identity | none | none — offline local app; OIDC route structure restored but NOT activated | none | `routes.ts` ("`/callback` OIDC route structure, NOT activation") | **MISSING by design** (offline dev mode); G24 OIDC is OFF-MAIN |
| IRR userId vs G24 applicationUserId | — | **explicitly NOT equated**; no `IRR tenantId ≡ G24 tenantId` assumption; equality only via provisioned membership rows | — | `translationBoundary.ts` §2/§8 | CONSISTENT (no inferred equivalence) |

---

## 5. Security Boundary Map

| Surface | Authn | Authz | Server-Side Check | Tenant/User Boundary | Evidence |
|---|---|---|---|---|---|
| IRR `/api/executive` + guarded reads | Keycloak bearer → `SecuredExecutor.authenticate` (real discovery+JWKS via live read executor) | `guardRead` RBAC read gate (403) | yes — claims never trusted; 401/403 before certified data | Principal tenant from `TenantDirectory` only | `executive-transport.ts:698-738` |
| IRR `/api/engines`, `/api/screener`, `/api/reports/*`, `/api/user-portfolios/*`, `/api/watchlists`, `/api/collaboration*`, `/api/settings*`, `/api/pit/*`, `/api/macro/*`, `/api/ai-advisory/*`, `/api/admin/*` | same SecuredExecutor chain (admin additionally admin-role gated; write ops `execute` permission) | per-route resource gates; client-supplied identity/tenant fields refused (400/403) | yes | tenant+owner scoped in services/journal; user-portfolios ownership re-derived by G24 every call | `executive-transport.ts:739-920`; `user-portfolio-transport.ts` enforcement chain; `watchlists-service.ts` SECURITY section |
| G-2 seam (IRR↔G24) | user's own bearer; G24 self-validates (issuer, audience `ipd-user-portfolio-api`, JWKS, expiry) | TWO independent gates (IRR SecuredExecutor AND G24 membership scope); either deny is final | yes | 404 existence-hiding; 403 unmapped/revoked; no grace/cache | `translationBoundary.ts` §10–13 |
| IRR admin surface | SecuredExecutor + admin role | read-only; no mutation exposed | yes | tenant-scoped filtering of audit/data surfaces | `admin-transport.ts` head |
| IPD main shell | **none** (offline, LOCAL_FIXTURE_AND_OFFLINE_DEV) | none — API-coupled donor routes fail closed (`UnavailableSurface`); UI06 screener fails closed (no universe) | n/a (no server on IPD main; `src/server/*` is OFF-MAIN) | n/a | `routes.ts`; `MultiFactorScreenerSurface.tsx` |
| IPD main secrets | n/a | `src/security/{scanner,secret_ref}` — secret scanning utilities, not request authz | n/a | n/a | `src/security/*` |
| IPD broker ingress | local operator | D05 identity fail-closed (`UNMAPPED_IDENTIFIER`); no symbol fabrication | in-process | n/a (single-operator non-production; BI-03 "single-operator identity bypass" era documented) | `BLOCK-3L-…AUDIT.md`; `7135471` commit history |

No client-side hiding was treated as authorization: IRR authorization is enforced in the Node server; IPD main has no activated authn (recorded as fact, not tested live).

---

## 6. UI / API / Platform Consistency

| Capability | UI | API | Service/Domain | Persistence | Consistent |
|---|---|---|---|---|---|
| Certified engine registry/execute (IRR) | `features/engines/EngineRegistry.tsx` | `GET /api/engines`, `POST /api/engines/:id/execute` | `EngineRegistry` + 13 engines | frozen assets | YES (transport tests on main; deterministic) |
| Executive/portfolio/company/decision/cross-sector/evidence/replay (IRR) | `features/*` | `/api/executive`, `/api/portfolio`, `/api/company/:id`, `/api/decision-matrix`, `/api/cross-sector`, `/api/evidence/:id`, `/api/replay/:id` | `computeCertified*` (frozen certified path) | none (computed) | YES (typed clients `api/*.ts` mirror DTOs) |
| Screener (IRR) | `features/screener/Screener.tsx` | `POST /api/screener` | N4 Screen runtime, server-derived population | none | YES (by design no client members) |
| PIT read (IRR→IPD) | no dedicated UI surface found (client `api/pit.ts` + tests) | `/api/pit/market-data` | boundary→adapter→IPD pin | IPD pin store (off-main) | **PARTIAL** — client exists; consumer surface limited; IPD counterpart off-main |
| G-2 user portfolios (IRR→IPD) | **ABSENT (deliberate)** | `/api/user-portfolios/*` (on main) | port/adapter (on main) | G24 SQLite (off-main) | **PARTIAL** — server-only; live seam 503 until IdP audience configured |
| Watchlists/collaboration/settings (IRR) | `features/{watchlists,collaboration,settings}` | `/api/{watchlists,collaboration*,settings*}` | PF-1 journal services | filesystem journal | YES (route-integration tests on main) |
| Macro (IRR) | `features/research/MacroContext.tsx` | `/api/macro/*` | MoSPI source adapter | none | YES |
| AI advisory (IRR) | `features/ai-advisory` | `/api/ai-advisory/*` | selective transport (PR #46) | none | YES on main; canonical richer line unmerged (P1 ledger) |
| Executive (IPD) | `ExecutiveSurface` (presentation-only, Path L) | none (fail-closed donor routes) | `UI02ExecutiveSummaryBuilder` over DTOs | none | CONSISTENT WITH DECLARED SCOPE (presentation-only; functional executive transport is OFF-MAIN on `arena/01a0cf86`) |
| Screener (IPD) | `MultiFactorScreenerSurface` | none | `ScreenerService` (C6) — **fails closed, universe uncommissioned** | none | CONSISTENT WITH DECLARED SCOPE (honest fail-closed) — but **overlaps IRR screener with no shared contract** |
| Portfolio broker import (IPD) | `PortfolioWorkspace` + `BrokerImportModal` | none (in-process) | import ingress + adapters | session-lifetime store | YES within scope; **durable counterpart is G-2 (off-main)** |
| Security master (IPD) | `SecurityMasterSurface` (UI08) | none (in-process) | `getGovernedBroadSecurityMaster()` (2,250) | in-repo JSON | YES |
| Cross-repo identifiers | — | — | `securityId` (PIT) vs `companyId` (IPD envelopes) vs IRR sector/company IDs | — | **DIVERGENT BY DESIGN** — AG-5 mapping unresolved and explicitly avoided; recorded as evidence gap, not repaired |

---

## 7. Documentation Reconciliation

| Claim | Source | Implementation Evidence | Classification |
|---|---|---|---|
| "TAG PLANNED `program-v1.2.0`, NOT YET CREATED, GitHub Release NOT YET PUBLISHED" | IRR `README.md` (Published Standards section) | tag `program-v1.2.0` → `5decdca` **exists and is reachable from main**; `gh release list` shows published release "Program v1.2.0 — 13-Engine Successor LTS" (2026-09-05) | **CONTRADICTED (stale)** — tag and GitHub Release both exist |
| 13-engine certification (10 LTS + 3 deferred via D42) | IRR README, `EngineRegistry.ts` header | `CERTIFIED_ENGINES` = 13 entries incl. telecom/auto/materials; freeze manifests present | **VERIFIED** |
| D-1 Option C: portfolio→G24 lineage; artifacts→GovernedArtifactStore lineage; "neither lineage promoted to current main" | IRR `docs/integration/PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md` | G24 lineage exists at pinned branch `01a0e6d9@6828155` (unmerged); NP-04 store at pin `2e11fa3b` (unmerged); both distinct implementations; IRR main consumes via port/HTTP contract | **VERIFIED** (claims match implementation exactly, including the off-main status) |
| D-2 Option B: domain-scoped identity/tenant; governed translation boundary | IRR `docs/integration/IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md` | `translationBoundary.ts` implements all 15 §8 items; no identifier equivalence assumed | **VERIFIED** |
| G-2: IPD owns user-portfolio domain + durable persistence; IRR consumes via additive interface; analytics excluded (§7); no UI client | IRR `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md`; `userPortfolioContract.ts`; `user-portfolio-transport.ts` | port/adapter/transport on main; no `frontend/src` consumer of `/api/user-portfolios` (grep empty) — matches "no portfolio UI / navigation / browser client" | **VERIFIED** |
| NP-15: IPD-side publication failed (403 credential scope); holding copy retained; D-NP15-7 half-satisfied; SHA cross-ref not established | IRR `docs/integration/NP-15-{IPD-SIDE-EVIDENCE-PENDING-IPD-PUBLICATION,GATE-PHASE1-CONVERGENCE-DECLARATION-RECORD}.md` §8.2 | IPD main still at `4d3e1cdc` (verified P0/P1); no `NP-15-PHASE1-CONVERGENCE-DECLARATION-EVIDENCE.md` on IPD main (`git ls-tree` — absent); holding copy present on IRR main | **VERIFIED** — note: the committed GATE record retains a stale internal banner describing itself as an "untracked working-tree artifact" (it is committed at origin/main) → **PARTIALLY VERIFIED (internally stale banner)** |
| IPD shell restored from donor tree `682f4e60…` on `ref origin/arena/01a0c440`, fail-closed API routes | IPD `frontend/src/app/routes.ts` | donor tree exists on unmerged branch `arena/01a0c440`; `UnavailableSurface` bindings in `App.tsx` | **VERIFIED** (donor itself unmerged — provenance note) |
| D05 master = 2,250 records (52 real + 2,198 synthetic); zero runtime resolution defects for present entities | IPD `BLOCK-3L-BROKER-CSV-FULL-RESOLUTION-AUDIT.md` | `evidence/operator_drop/d05_security_master_broad_universe.json` contains exactly 2,250 ISIN records (counted) | **VERIFIED** (composition claim verified; defect claim not re-tested — P4 scope) |
| "0 JSON, 0 TypeScript files repo-wide" standards-repo state | IRR `ENGINEERING_READINESS_REVIEW.md` (2026-08-06) | current main has 1,170 files incl. 415-file `iips-platform` | **HISTORICAL / SUPERSEDED** (describes pre-implementation state) |
| UI06 restoration "binds existing qualified builder; fails closed without commissioned universe" | IPD `MultiFactorScreenerSurface.tsx` header | implementation matches exactly | **VERIFIED** |
| "G24 suite 84/84 PASS at this tip" | IRR `userPortfolioContract.ts` (lineage pin block) | suite exists on OFF-MAIN lineage (`tests/g24_*` 8 files, ~2,590 test lines); not re-executed in P2 (out of scope) | **UNVERIFIABLE in P2 (not executed)** — P4 EVIDENCE REQUIRED |

---

## 8. Disposition inputs for later phases

- **P3 EVIDENCE REQUIRED:** G24 durable portfolio (off-main lineage `01a0e6d9@6828155`); NP-04 artifact store (pin `2e11fa3b`); PF-1 journal restart proof (unmerged `arena/a2df3b85` files `restart-proof-{writer,recoverer}.ts` + test); IPD main in-memory PIT/session portfolio (non-durability confirmation); tenant-membership store durability.
- **P4 EVIDENCE REQUIRED:** IRR frontend/server test suites on main (`vitest`, `tsx --test`); IPD `tests/` (58 files on main; `test:direct` via `node --test`); G24/NP-04 suites on off-main lineages; the "84/84 PASS" claim.
- **P5 EVIDENCE REQUIRED:** G-2 UI consumer absence (deliberate); IPD UI06 fail-closed universe; IPD presentation-only surfaces; gai-impl-canonical unique capabilities (P-1/P-2/PF-2/search/secret-management/hubs).

**END P2**
