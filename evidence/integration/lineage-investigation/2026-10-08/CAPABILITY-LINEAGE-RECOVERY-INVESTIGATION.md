# CAPABILITY LINEAGE RECOVERY & MISSING-CLAIM CHALLENGE

> **NON-AUTHORITATIVE INVESTIGATION OUTPUT.**
> Produced 2026-10-08 (Asia/Calcutta) by read-only inspection of git mirrors. Not published to any repository, not a governance record, not a closure, authorization, product-host or data-plane designation, or architecture decision. Arena output is never authoritative until verified on the designated remote ref.
> Stored outside the authoritative worktree (`/home/user/iips-review-recovered` was not modified; `git status` clean on `arena/1dcbe88d-iips-review-recovered` @ `c19a905`).

Scope: IRR = `ramkivs/iips-review-recovered`; IPD = `ramkivs/iips-production-market-data`. Platform = `iips-platform/` (plain subtree of IRR; no `.gitmodules`, no nested `.git`).

---

## A. Executive conclusion

**Was the prior "genuinely missing" classification sufficiently proven?  →  NO.**

- Of the capabilities previously reported missing or not located (Command Center, D107/EOD, optional widgets, Reports UI, Sector Research pages, Opportunities, Risks, Rankings, Research Hub, AG-5, cross-domain identity/tenant), **none is L8 after lineage search.** Each has at least one located implementation, record, or code path on a non-main ref or on IPD `main`.
- Several earlier absence claims were produced by searching `origin/main` only. They were wrong as absence claims:
  - Opportunities, Risks, Rankings: UI components exist on the unmerged IRR branch `phase13-next` (with NP-18 authority on unmerged `arena/01a0ddea`), and the engines exist on IRR `main`.
  - Reports UI: a historical UI exists on unmerged IPD branches; IRR `main` carries the Reports API dispatch and persistence port; the Reports capability was qualified non-production on unmerged `arena/01a0f1b3`, with UI explicitly DEFERRED.
  - Sector Research / Research Hub: implementations exist on unmerged IRR and IPD branches (`phase13-next`, `arena/01a0d1d3`, `arena/01a0814b` family).
  - EOD/D107: a D107 acceptance record and EOD pipeline code exist on unmerged IPD `arena/01a0a438`.
  - Replay Studio: a presentation view-model builder (UI01) exists on IPD `main`.
  - Command Center: the exact name occurs zero times in all refs and in all commits; the functional capability (command palette / global search) exists on unmerged branches.
- Remaining items are **authority-bound**, not missing: Evidence Snapshots UI (NP-13 D5), Reports UI (NP-06 scope), widgets (recorded as non-governing), D107/EOD (branch-only acceptance; production excluded), AG-5 (UNRESOLVED on `main`).
- **Strict L8 (genuinely missing): NONE PROVEN by this investigation.**
- Some exact names are conversational or requirement-level only (Command Center, Cross-Domain E2E). They are not repository designations. Their functional analogues were located.

Disposition of the brief: **B — SUBSTANTIALLY COMPLETE, LIMITED GAPS** (see §I). Not A, because binary artifacts were not content-searched, PR bodies were not searched, several branch-only record sets were read selectively, and multiple authority conflicts remain open.

---

## 0. Verified baseline (fresh this turn)

| Item | IRR | IPD |
|---|---|---|
| `refs/heads/main` | `c19a905d9b7ff6f7faa5c966b59504063f3d45c1` (tree `83a8499f`), 168 commits on main | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` (tree `db853dc2`), 94 commits on main |
| Refs (mirror `git clone --mirror`) | 122 total: 70 heads, 50 `refs/pull/*`, 2 tags | 42 total: 32 heads, 6 `refs/pull/*`, 4 tags |
| Commits reachable from any ref | 427 | 618 |
| Unique tree objects across refs | 72 (from 122 refs) | 33 (from 42 refs) |
| Heads merged into `main` | 51 merged; **19 unmerged** | 7 merged; **25 unmerged** |
| PR records (merge commits verified) | 50 PRs, all MERGED (titles and merge SHAs checked) | 6 PRs, all MERGED (4 to main, 2 to `arena/01a0e6d9`) |
| Session branch `arena/1dcbe88d-…` on remote | absent | n/a |

Note on PR titles: PRs #42, #44, #45 and #46 are titled "Promotion candidate … DO NOT MERGE", "CANDIDATE (no merge)" and similar. Their merge commits are ancestors of IRR `main` (verified). Title and state conflict, recorded as a lineage fact.

Note on unmerged IRR heads (19): `phase13-next` (78 commits ahead of main), `gai-impl-canonical` (47 ahead), `arena/01a0ddea` (102 ahead), `arena/01a0e30f` (103 ahead), `arena/01a03e3b` (97), `arena/01a0ddff` (96), `arena/01a0f1b3` (28), `arena/01a0f351` (19), `arena/a2df3b85` (7), `phase13-hardening-delivery` (6), `arena/01a07ccb` (9), `arena/01a10b3c` (5), `arena/01a0f64b` (3), `arena/01a10cce` (2), `arena/01a1079e` (2), `arena/01a10c0e` (1), `phase14.1-recovery-deposit` (1), `arena/01a077de` (1), `arena/01a06af2` (1).

---

## B. Exhaustive capability matrix (16 columns)

Legend: **M** = on that repo's `main`; **U** = unmerged branch/ref; **Archive** = inside a tracked tarball, not as tracked source; "name hits" = exact-phrase hits across all refs (text files only).

| # | Capability | Current IRR (main) | Historical IRR (non-main refs) | IPD Main | IPD Historical | Platform (`iips-platform/`) | UI | API / Service | Engine | Evidence | Alternate Name | Lineage Found | Current Integration | Authority Status | Disposition | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Command Center** | Name: 0 hits. Requirement only: `docs/v3.0/navigation-model.md` "Command palette for power users" | `CommandPalette.tsx` (+test), `AppShell.tsx`, `TopBar.tsx`, `NotificationDrawer.tsx` on `phase13-next` (U) and `gai-impl-canonical` (U) | Name: 0 hits. Spec/tracker requirement "Command Palette / Quick Actions", "Global Search / Command Palette". Inventory row 7 = PRUNED | `CommandPalette.tsx` (9,504 B) on `arena/01a0814b` family (U) | none | Ctrl-K overlay (U only) | depends on decision-matrix client + core/auth (IPD inventory) | none | Inventory row 7 (PRUNED); P5 §E "global search command palette: unique, not on main, no disposition" | Command palette; Global Search; Ctrl-K; Command Center (**never found**) | Function: yes. Name: no | none | UNRESOLVED (requirement on main; no admission act; pruned on IPD) | **L4** | High (existence) / Medium (authority) |
| 2 | **D107 / EOD ingestion** | 0 hits (EOD, D107, end-of-day, bhav) | 0 hits | `slo_evaluator.ts` (D02 delivery), `freshness_evaluator.ts` (D02_OHLCV EOD). No D107 record | `docs/D107_EOD_PRODUCTION_READINESS_GATE_ADJUDICATION.md` ("D107 = ACCEPTED", 2026-09-15), `frontend/server/market-data/eod-pipeline.ts`, `eod-monthly-scheduler.ts`, `batch-ingestion-harness.ts`, `dhan-adapter.ts`, `docs/D103_W1_LAYER2_NSE_EOD_IMPLEMENTATION.md` on `arena/01a0a438` (U only) | none | `frontend/server/market-data/*` (U) | EOD pipeline (U) | D107 record (self-declared, production not claimed) | OPERATOR_DROP; bhavcopy; D02 OHLCV | Yes (IPD branch) | none to IRR; IPD main = D02 evaluators only | UNRESOLVED (accepted in unmerged record; not on IPD main; production/commercial excluded) | **L4** | High / Medium |
| 3 | **Optional widgets** (Executive widgets; "+ Add Widget") | none. NP-15 docs: "seven Executive widgets with zero repository evidence" (NOT CLAIMABLE) | "widget" appears only in NP-15 docs | none (inventory: Executive widgets absent) | `frontend/src/features/executive/ExecutiveDashboard.tsx` with "+ Add Widget" on `windows/d114-stage5-banking-replay-observation` (U) and `t:p14-r7-65b78f7` (U) | none | Executive dashboard widget composition (IPD historical) | unverified | none | `IIPS_REMAINING_PRODUCT_SURFACE_INVENTORY.md` on `arena/01a0d1d3` line 33: "authority acts not found; ruled non-governing (3b23f27 precedent)" (not independently verified here) | Executive widgets; Quick Actions; Watchlist Highlights; Alerts; Score Distribution | Partial (1 UI file; components named in inventory) | none | NON-GOVERNING per IPD inventory | **L4** | Medium |
| 4 | **Reports UI** (and governed Reports API) | API dispatch `/api/reports/` (`executive-transport.ts` ~L778); `frontend/server/reports/persistence-port.ts` (+ modules); `reports-api.test.ts`. **No** `features/reports` UI. No `reports-transport.ts` on main | `reports-transport.ts` + `reports-transport.test.ts`, `reports-api.test.ts`, canonical/composition/artifact modules on `arena/01a0f1b3` (U). NP-06-R2 = **QUALIFIED (non-production)**, implementation commit `39dd43eb…` | none (inventory row 53: `/reports` PRUNED) | `frontend/src/features/reports/Reports.tsx` (+test), `frontend/src/api/reports.ts`, `frontend/server/reports/reports-service.ts` + transport on `arena/01a0814b`, `01a0a438`, `01a0ae80`, `01a0bdb5` (U); `docs/D82_UI08_REPORTS_RECOVERY_IMPLEMENTATION.md` | `iips-platform/reports-*` directories are **engine validation reports, not the Reports capability** (name collision) | `/api/reports/*` → persistence port (main); store = NP-04 SQLite on IPD pin (off-main) | none | NP-06 governance decisions and final qualification (U, `arena/01a0f1b3`); D-3 Governed Reports ACCEPTED at qualified branch scope (M; grants no main-admission authority) | Reports; Governed Reports; UI08 Reports (collides with IPD main UI08 = Security Master) | Yes | Partial: API dispatch on main; store off-main; UI absent | D-3 (M): ACCEPTED at qualified branch scope; no main-admission or promotion authority. NP-06-R2: QUALIFIED non-production on branch. **UI rendering and navigation integration DEFERRED**. Common persistence authority on IPD branch | **L4** (UI); API = L3 | High |
| 5 | **Sector Research pages** (`/research/sector/:id`) | `App.tsx` L52: `FeaturePlaceholder` "Sector" | `SectorIntelligence.tsx` (11,007 B) + route L65 on `phase13-next` (U); `gai-impl-canonical` (U) | none (inventory: UNMNT) | `SectorIntelligence.tsx` 12,916 B donor (`arena/01a0814b` family, U). **Recovered** 16,782 B on `arena/01a0d1d3` and `arena/01a0d33d` (U) + `research-sector-transport.ts` (28,463 B) + tests | Sector engine packages (M) | `/api/company/:id`, `/api/decision-matrix` (M); `research-sector-transport.ts` (IPD, U) | `CrossSectorEngine` + sector engines (M) | `IIPS_RESEARCH_SECTOR_UI_RECOVERY_REPORT.md` ("COMPLETE; PARTIALLY VERIFIED") on `arena/01a0d1d3`/`01a0d33d` (U); E2E-018 screenshot `sector-intelligence_banking.png` (binary) | Sector Intelligence; UI05 Sector Scoring Radar (IPD main UI05 is a **different** surface; do not equate) | Yes (3 lineages) | none on IRR main (placeholder) | NON_PRODUCTION; AI advisory DEFERRED; D115 implementation authority NOT granted (IPD) | **L3** | High |
| 6 | **Opportunities** | `OpportunityEngine.ts` (cross-sector/opportunity) (M); `/api/cross-sector` (M); route `/intelligence/*` placeholder L57 | `IntelligenceOpportunities.tsx` (+test) on `phase13-next` (U), route L75; calls `/api/cross-sector` (M) | none (inventory row 38: "never built") | `OpportunityEngine.ts` (U, `01a0814b` family) | `iips-platform/src/sector-engines/cross-sector/opportunity/OpportunityEngine.ts` (M) | Intelligence Opportunities (U) | `/api/cross-sector` (M) | `OpportunityEngine` (M) | AUTH-NP-18 on `arena/01a0ddea` and `01a0e30f` (U): B-1 IMPLEMENTED. EVID-NP-18 on `phase13-next`: runtime PASS; implementation qualification NOT GRANTED | NP-18 Opportunities framing; Priority Opportunities; RankedOpportunity | Yes | Engine + API on M; UI not on M | UNRESOLVED (NP-18 + qualification on unmerged refs; conflicts with inventory row 38) | **L4** | High (existence) / Medium (authority) |
| 7 | **Risks** | No dedicated Risk engine. Aggregate `avgRisk` served by `executive-transport.ts` (L277, L329, L507) (M); `/intelligence/*` placeholder | `IntelligenceRisks.tsx` (+test) on `phase13-next` (U), route L76 | none (inventory row 39: "NEVER IMPLEMENTED") | not located as component | none dedicated | Intelligence Risks (U) | aggregate field on `/api/executive` & cross-sector payload (M) | none dedicated | NP-18 **B-2** "aggregate avgRisk + existing flags ONLY" (U); phase13-next runtime PASS | Portfolio Risk framing; risk-list; avgRisk | Yes (UI); aggregate data on M | Data on M; UI on U | UNRESOLVED (as Opportunities) | **L4** | High (UI) / Medium (capability boundary) |
| 8 | **Rankings** | `RankingEngine.ts` (cross-sector/ranking) (M); `/intelligence/*` placeholder | `IntelligenceRankings.tsx` (+test) on `phase13-next` (U), route L77 | none (inventory row 40: "NEVER IMPLEMENTED") | `RankingEngine.ts` (U, `01a0814b` family) | `RankingEngine.ts` (M) | Intelligence Rankings (U) | `/api/cross-sector` (M) | `RankingEngine` (M) | NP-18 **B-3** IMPLEMENTED (U); phase13-next runtime PASS | Ordered Comparison framing; RankedSector | Yes | Engine + API on M; UI on U | UNRESOLVED (as Opportunities) | **L4** | High / Medium |
| 9 | **Research Hub** (`/research`) | `/research` → `FeaturePlaceholder` "Research" (L50). `MacroContext` (features/research) is a separate surface (M) | `ResearchHub.tsx` (3,799 B) + test on `phase13-next` and `gai-impl-canonical` (U). Header: "N+13: Research Hub / governed company directory", uses `/api/decision-matrix` (M) | none | `ResearchHub.tsx` (identical size, 3,799 B) on `arena/01a0814b` family (U) | none | Research Hub (U) | `/api/decision-matrix` (M) | none | N+13 header; inventory row 29 "PARTIAL (hub shell only)" | Research (landing); UI03 Fundamental Analysis (**different** surface) | Yes | Dependency on M's `/api/decision-matrix`; UI unmerged | No admission act located for N+13 hub | **L3** | Medium-High |
| 10 | **Company Workspace** (name) | Name: 0 hits. Functional: `CompanyIntelligence` (`features/company`, `/research/company/:id`) (M) | `CompanyTrustChain.tsx` (+test) on U refs | Name: 0 hits. Inventory row 30: `CompanyIntelligence` PRUNED | P13 registry **"UI02 Company Workspace — REUSE cmp · ADAPT identity"** (`p13/src/dataSurfaces.js`, U). Spec row "Company Workspace: Data + analytics, universe/filters/scores/saved screens" (IPD main) | none | `/api/company/:id` (M) | sector engines (M) | Spec + tracker requirement rows (IPD main) | Company Intelligence; Company Trust Chain; **UI02 collides** with IPD main UI02 = Executive Summary | Name: requirement / historical label. Function: yes (M) | `CompanyIntelligence` wired on M | Name not canonical; functional equivalence **UNPROVEN** | **L1** (functional analogue on M) | Medium |
| 11 | **Decision Center** (name) | Name: 0 hits. `DecisionMatrix` (`/intelligence/decision-matrix`) (M); `WorkflowRuntime.ts` (`iips-platform/src/distributed`) (M) | Phase 14.1 `WorkflowView.tsx` = **read-only workflow-definition viewer** (Archive, `phase14.1-recovery-deposit`, U). `DecisionBadge` components (U) | Name: 0 hits. UI06 in IPD registry = Multifactor Screener (collision) | P13 registry **"UI06 Decision Center — EXTEND"** (`p13/src/dataSurfaces.js`, U); D32/D57/D84Q docs (U). Spec: "Decision Center — governed workflow" (IPD main) | `WorkflowRuntime.ts` (M) | none | `/api/decision-matrix` (M) | WorkflowRuntime (M); decision modules in sector engines (M) | Spec + tracker requirement rows | Decision Matrix; Workflow; UI06 (collision) | Name: requirement / P13 label. Partial function on M | Partial (engine + matrix on M; no Decision Center surface) | Requirement only; no governed approval workflow implemented; equivalence **UNPROVEN** | **L5** | Medium |
| 12 | **Replay Studio** | Name: 0 hits. Closest: `ReplayExplorer` (`/evidence/replay/:id`) = Evidence Replay (row 14) | 0 name hits | `src/ui/view_models/ui01_replay_studio.ts` (`UI01ReplayStudioBuilder`, presentation-only). `ui_registry.ts` authorizes `UI01_REPLAY_STUDIO`. Stage-5 report names route `/replay-studio` (no React route located on M) | IPD docs and HTML evidence name "Replay Studio" (15 IPD trees, mixed U and M; e.g. `docs/IIPS_REMAINING_PRODUCT_SURFACE_INVENTORY.md` on U); `IIPS_REMAINING_PRODUCT_SURFACE_INVENTORY.md` (`arena/01a0d1d3`) line 36 "**no implementation in any lineage**" (**conflict**) | none | none (view model only) | `EngineApiAdapter` `createMarketDataD…` (per stage-5 report) | n/a | `evidence/d114/stage5-ui-read-only-qualification-report.md` (M) | Replay & Simulation Studio; UI01 (IPD) | Yes (view model on IPD M) | none | Registry-authorized surface on IPD main; no route; inventory contradicts | **L5** | Medium |
| 13 | **Evidence Snapshots** | `iips-platform/src/snapshot/SnapshotStore.ts`, `SnapshotService.ts` (+test) (M). `/evidence/snapshots` → `NotYetAuthorized` (L59) | Same modules in Phase 14.1 archive (U) | none | `docs/d4/D4_06_SNAPSHOT_REPLAY_IDENTITY.md` (U, docs only) | `src/snapshot` (M) | none (reserved route) | none dedicated | `SnapshotService` (M) | NP-13 IA decision on M: "snapshots … not established and not presented as available" (D5) | Snapshots; snapshot store | Yes (engine) | Engine not exposed as UI/API | Authority-bound: NP-13 D5 | **L5** | High |
| 14 | **Evidence Replay** | `ReplayExplorer` at `/evidence/replay/:id` (L61) (M); `/api/replay/:id` (`executive-transport.ts` L976) (M); `ReplayService.ts` (M). List route `/evidence/replay` → `NotYetAuthorized` (L60) | `ReplayExplorer` in Phase 14.1 archive (U) | `ui01_replay_studio` (not equivalent) | `p12/src/evidenceReplayLinkage.js` (U) | `src/replay/ReplayService.ts` (M); `EvidencePipeline.ts` (M) | `ReplayExplorer` (M) | `/api/replay/:id` (M) | `ReplayService` (M) | P5 (M); navigation model (M) | Replay; decision→evidence→snapshot→replay spine | Yes (M) | Wired on M (source level) | Present on M. Runtime **not proven in this brief** | **L1** | High (source) |
| 15 | **Cross-Domain E2E** (name) | Name: 0 hits in any ref; "cross-domain" + "e2e" co-occurrence: 0 | 0 | 0 | 0 | cross-repo integration tests `pitRuntimeIntegration`, `pitD114RuntimeIntegration` (M, pin-bound) | none | pin to IPD package (`2e11fa3b`) | n/a | P5 #20: "PRESENT BUT INCONSISTENT": pin resolves; fails vs IPD `main` (`ERR_MODULE_NOT_FOUND`) | Conversational designation (not a repo term) | Functional analogue only | Pin-bound, not main-pair | Main-pair integration not authorized | **L4** | Medium |
| 16 | **Portfolio Intelligence** | `PortfolioIntelligence.ts` (`cross-sector/portfolio`) (M), instantiated by `CrossSectorEngine` | Same path on `phase13-next` (U) | none (`PortfolioIntelligence` absent) | `iips-platform/src/sector-engines/cross-sector/portfolio/PortfolioIntelligence.ts` on IPD tags `portfolio-option-a-cb969b6` and `post-cleanup-baseline-b46b4f4` (T) | `iips-platform/src/sector-engines/cross-sector/portfolio/PortfolioIntelligence.ts` (M) | none dedicated | `/api/cross-sector` (M) | `PortfolioIntelligenceService` (M) | P5 §F (three portfolio systems) | Certified reference portfolio (`/api/portfolio`); user portfolio (G-2) | Yes | Engine wired inside `CrossSectorEngine` | No separate authority conflict identified | **L1** | Medium |
| 17 | **BI-07** (broker import) | 0 code. Docs reference BI-07 (M) | none | `frontend/src/features/portfolio/BrokerImportModal.tsx`, `PortfolioWorkspace.tsx`, `import/*` (incl. `dhan-holdings-adapter.ts`), browser `portfolio-store.ts`, `evidence/bi07/bi07-final-certification.json` (all M) | BI-03 foundation on `arena/01a0bdb5` (U) | n/a | browser-side only | none server-side | n/a | `bi07-final-certification.json` (M); offline Windows acceptance (Windows domain; not IRR runtime proof) | Broker import; Dhan Web UI CSV import; BI-08 | Yes (M) | **None to IRR** (P5 §F: not integrated) | IPD main = current baseline; offline CSV scope; **Dhan live NOT proven** | **L1** (IPD main; source) | High (presence) |
| 18 | **ConsumerEngine segments** (staples / discretionary) | `ConsumerEngine.ts`, `calibration/ConsumerCalibration.ts`, `consumer-calibration-1.0.0.json` (staples & discretionary weights), `consumer-expected-outputs-1.0.0.json` (`segment` field) (M); registered in `executive-transport.ts`, `admin-transport.ts`, `EngineApiAdapter` (`sector.consumer`) (M) | none | none | none | `iips-platform/src/sector-engines/consumer/*` (M) | via executive/company (M; per-segment display unverified) | engine API (M) | `ConsumerEngine` (M) | Golden reference & validation fixtures (M) | Consumer sub-segments | Yes (M) | Registered on M | Main calibration v1.0.0; no conflict identified | **L1** | High (source) |
| 19 | **AG-5** company-level IRR↔IPD identity mapping | **UNRESOLVED**: `evidence/integration/convergence/2026-10-07/P3-persistence-durability.md` L44 & L106; D-2 §6 "NO GOVERNED CROSS-REPO IDENTITY MAPPING ESTABLISHED". `frontend/server/d115-runtime.ts` (interface; fixture-only impl in test) | **csipCompanyId UUID `5233149d-2a2d-4644-a6a7-e1ed5e133285` absent from all 72 IRR trees** | `src/identity/mapping_store.ts` (IdentityMappingStore: instrument identifiers → `companyId`, fixture masters). D-2 §3.2: not canonical company identity | D115 HDFC Life proposal, allocation register, **release-authority** record on `arena/01a0ae80` (U): `releaseAuthorization=GRANTED`, `mappingReleased=NOT_YET_IMPLEMENTED`, `mappingActivated/Registered/Loaded=False`, `productionEligible=False`; field `csipCompanyId` (IPD-only). `docs/D115_IDENTITY_DESIGNATION_PACKET.md` on `arena/01a0c86d` (U). `src/pit/pit_read_service.ts` comment "AG-5 stays unresolved" on `arena/01a0e6d9` (U) | none | none | none | D115 records (record only); P3 (M) | company-level mapping; csipCompanyId; canonicalIssuerId; `companyId` (**collision**: IPD instrument ID vs IRR synthetic sector ID `Banking-H1`) | Record only (IPD branch); no implementation | None | UNRESOLVED on M; D115 GRANTED authorization record conflicts with D-2 (conflict K6) | **L6** | High (no implementation) / Medium (record semantics) |
| 20 | **Cross-domain identity / tenant mapping** | `frontend/server/tenant-membership-store.ts`, `tenant-directory.test.ts` (M); G3 principal and tenant mapping `docs/v3.0/g3-build/principal-tenant-mapping.md` (M): Keycloak → `Principal {userId, tenantId, roles}`, tenant validated against platform directory, client tenant claims never trusted; `d115-runtime.ts` (interface; fixture-only) (M); `frontend/server/user-portfolio/translationBoundary.ts` (M): describes `(issuer, subject) → applicationUserId` as G24's responsibility; IRR never selects `applicationUserId` | PF-2 governed platform directory `frontend/server/directory/roster-directory.ts` (AUTHORITY MODULE ONLY, no endpoint) and IdP seed/sync `idp-sync.ts` (Keycloak Admin REST, read-only transport) on `gai-impl-canonical` (U); TD-4 / TD-8a cited in code comments only (`gai-impl-canonical`, `phase13-next`); **governing records not located in any IRR ref** | `IdentityMappingStore` (instrument only). No user/tenant state on IPD M | **G24**: `src/app_identity/service.ts` "External Identity Mapping", key `(issuer, subject)` → exactly one `applicationUserId`, lifecycle PENDING→APPROVED→ACTIVE→RETIRED, fail-closed; `src/portfolio/durable-store.ts`; `src/persistence/*` on `arena/01a0e6d9` & `01a0f308` @`6828155` (U); 84/84 G24 tests (per records) | none | IRR `/api/user-portfolios/*` (M, guarded; live seam 503 until IdP audience). G24 `/api/ipd` (U) | none | D-2 (M) §5–§8; P5 #12 & #17 (M) | domain-scoped identity; tenantId; principal; applicationUserId; roster | Yes (3 lineages, each domain-scoped) | Domain-internal only; cross-repo: contract/pin only; G24 off-main | **Conflicting**: D-2 §6 "no governed IRR Principal → G24 applicationUserId mapping"; G24 + translationBoundary + P5 #12 describe a governed `(issuer,subject)→applicationUserId` contract (conflict K5) | **L4** | High (existence) / Medium (authority) |

---

## C. Historical lineage recovery table

| Capability | Repository | Ref / Commit | Implementation Location | Historical Status | Can Recover? | Authority Issue |
|---|---|---|---|---|---|---|
| Command palette | IRR | `phase13-next` (tip 2026-09-27) | `frontend/src/features/shell/CommandPalette.tsx` (+test); `AppShell.tsx`; `TopBar.tsx` | Present, unmerged | Yes (`git show`/merge) | Not admitted to M; M navigation model requires "Command palette" |
| Command palette | IRR | `gai-impl-canonical` (tip 2026-08-27) | same paths | Present, unmerged | Yes | Same |
| Command palette | IPD | `arena/01a0814b` family (U) | `frontend/src/features/shell/CommandPalette.tsx` 9,504 B | Donor; PRUNED on IPD M (inventory row 7) | Yes | Pruned; no admission act found |
| Intelligence Opportunities / Risks / Rankings UI | IRR | `phase13-next` (U) | `features/intelligence/Intelligence{Opportunities,Risks,Rankings}.tsx` (+tests); `App.tsx` L75–77 | Implemented; runtime PASS per qualification | Yes | NP-18 authority is on unmerged refs; implementation qualification NOT GRANTED; certification NOT GRANTED |
| NP-18 authority | IRR | `arena/01a0ddea` (U), `arena/01a0e30f` (U) | `governance/iips/AUTH-NP-18-INTELLIGENCE-EXPOSURE-IMPLEMENTATION-AUTHORITY-2026-09-26.md`, `DEC-NP-17-NP-18-PAYLOAD-DECISION-BOUNDARY-2026-09-26.md` | ISSUED: B-1/B-2/B-3 IMPLEMENTED; A-0 (company-fundamentals data source) DECLINED | Yes | Not on M; "NP-18 REMAINS OPEN / COMMISSIONING" |
| NP-18 qualification | IRR | `phase13-next` (U) | `governance/iips/EVID-NP-18-QUALIFICATION-ADJUDICATION-2026-09-27.md`, `EVID-NP-18-LOGICAL-UI-VERIFICATION-2026-09-27.md`, `…RECONCILIATION…` | Runtime PASS; full repository suite "NOT represented as green" | Yes | Qualification and certification explicitly NOT GRANTED by the record |
| Research Hub | IRR | `phase13-next`, `gai-impl-canonical` (U) | `features/research/ResearchHub.tsx` (3,799 B) + test | Implemented (N+13) | Yes | No admission act located |
| Sector Intelligence page | IRR | `phase13-next` (U) | `features/research/SectorIntelligence.tsx` (11,007 B); route L65 | Implemented | Yes | Not admitted; AI advisory excluded |
| Sector Intelligence (recovered) | IPD | `arena/01a0d1d3` and `arena/01a0d33d` (U) | `SectorIntelligence.tsx` (16,782 B), `frontend/server/research-sector-transport.ts`, `tests/research_sector_ui_recovery.test.ts`, `tests/research_sector_read_authorities.test.ts`, `IIPS_RESEARCH_SECTOR_RECOVERY_MANIFEST.md`, `…_UI_RECOVERY_REPORT.md`, `…_READ_AUTHORITIES_REPORT.md` | Recovered, "COMPLETE — PARTIALLY VERIFIED" | Yes | NON_PRODUCTION; D115 implementation authority NOT granted; AI advisory DEFERRED |
| Company Intelligence (recovered) | IPD | `arena/01a0d1d3` (U) | `features/company/CompanyIntelligence.tsx` (12,360 B) | Recovered (non-production) | Yes | Same as above |
| Reports UI | IPD | `arena/01a0814b`, `01a0a438`, `01a0ae80`, `01a0bdb5` (U) | `features/reports/Reports.tsx` (+test), `api/reports.ts`, `server/reports/reports-service.ts` + transport + tests; `docs/D82_UI08_REPORTS_RECOVERY_IMPLEMENTATION.md` | Donor UI; pruned from IPD M | Yes | UI08 numbering collides with IPD M UI08 |
| Reports transport and qualification | IRR | `arena/01a0f1b3` (U); qualified impl commit `39dd43eb…`, tree `3fdc29d6…` | `frontend/server/reports-transport.ts` (+tests), `reports/{canonical,composition,artifact,np04-adapter}.ts`; `docs/v3.0/g3-build/PROGRAM_v3.0_NP06_REPORTS_FINAL_QUALIFICATION.md` | QUALIFIED (non-production) | Yes | UI rendering and navigation integration DEFERRED; persistence on IPD branch `np04-governed-persistence-windows` (U, `2e11fa3b`) |
| EOD pipeline and D107 | IPD | `arena/01a0a438` (U, 2026-09-17) | `docs/D107_EOD_PRODUCTION_READINESS_GATE_ADJUDICATION.md`; `frontend/server/market-data/{eod-pipeline,eod-monthly-scheduler,batch-ingestion-harness,dhan-adapter}.ts`; `docs/D103_W1_LAYER2_NSE_EOD_IMPLEMENTATION.md` | Accepted record on branch; code present | Yes | Unmerged; production and commercial claims excluded by the record itself |
| Executive widgets | IPD | `t:p14-r7-65b78f7`, `windows/d114-stage5-banking-replay-observation` (U) | `frontend/src/features/executive/ExecutiveDashboard.tsx` ("+ Add Widget") | Historical; inventory: non-governing | Yes | Non-governing per inventory (not independently verified) |
| Phase 14.1 workflow viewer | IRR | `phase14.1-recovery-deposit` (U), **Archive** `artifacts/phase14.1-recovery-snapshot/v3.0-phase14.1-certified-snapshot.tar.gz` (719,726 B; 1,128 entries) | `frontend/src/features/workflow/WorkflowView.tsx` (+test), `frontend/src/app/App.tsx` `/workflow` route | Read-only workflow-definition viewer | Yes (extract to scratch; all `App.tsx` imports resolve) | Archive, not tracked source. CAPABILITY-EVIDENCE (`arena/01a10cce`) classifies this as "D" (absent from tracked refs) |
| Phase 14.1 snapshot and evidence modules | IRR | same archive | `iips-platform/src/snapshot/{SnapshotStore,SnapshotService}.ts`; `features/replay/ReplayExplorer.tsx`; `features/evidence/EvidenceExplorer.tsx`; `features/cross-sector/CrossSectorIntelligence.tsx` | Archived; same modules also on M | Yes | Archive |
| Notes and notifications | IRR | `gai-impl-canonical`, `phase13-next` (U) | `frontend/server/notes/notes-service.ts`, `frontend/server/notifications/notification-service.ts`, `features/notes/NotesDrawer.tsx`, `features/notifications/NotificationDrawer.tsx`, `api/notes.ts`, `api/notifications.ts` | Implemented on unmerged refs | Yes | P5 §E: "unique, not on main, no recorded disposition" |
| PF-2 roster directory and IdP sync | IRR | `gai-impl-canonical` (U) | `frontend/server/directory/roster-directory.ts`, `idp-sync.ts`, `directory-wiring.ts` | Authority module only; no endpoint, no admin UI | Yes | TD-4 / TD-8a cited in code comments only; governing records not located in any IRR ref (text search, all refs) |
| G24 durable portfolio and External Identity Mapping | IPD | `arena/01a0e6d9` and `arena/01a0f308` @ `6828155` (U) | `src/app_identity/service.ts`; `src/portfolio/durable-store.ts`; `src/persistence/{config.ts,migrations/001_initial_schema.ts}` | Candidate; tests recorded 84/84 (G24), 782/0 (suite) per records | Yes | Branch-only; D-1 §2 says main admission is prohibited by the recorded promotion-authority act |
| D115 identity mapping (HDFC Life, one entity) | IPD | `arena/01a0ae80` (U); `docs/D115_IDENTITY_DESIGNATION_PACKET.md` on `arena/01a0c86d` (U) | `d115/governance/identity-mapping/{proposals,released-state}/*.json`; `d115/governance/canonical-identity/allocation-register.jsonl`; `d115/tools/canonical-identity-allocator/` | Record only; mapping not implemented, activated, registered or loaded | Yes | `GRANTED` authorization record vs D-2 "no governed CompanyId mapping" (K6) |
| Replay Studio (UI01) | IPD | IPD `main` | `src/ui/view_models/ui01_replay_studio.ts`; `src/ui/ui_registry.ts`; `src/ui/types.ts` | Presentation-only builder; authorized in registry | Yes (on M) | Inventory row 36 says no implementation in any lineage (K2) |
| Screenshot evidence (E2E-018) | IRR | `phase13-next` (U) and others | `docs/v3.0/e2e-018-screenshots/*.png` (company-intelligence_*, sector-intelligence_banking, cross-sector-intelligence, decision-matrix, executive, screener, admin-engines) | Binary evidence only | Yes | Screenshots are not implementation proof; IPD `01a0d1d3` records the matrix baseline as ABSENT for Company Intelligence (K10) |
| IRR G3 tenant-directory docs | IRR | `arena/01a0f1b3` (U) | `docs/v3.0/g3-build/PROGRAM_v3.0_G3_TENANT_MEMBERSHIP_*.md`, `…G3B_TENANTDIRECTORY_IMPLEMENTATION_AUTHORITY.md`, `…G3_DEP1…`, `…G3_PRODUCT_TENANT_REGISTRY_AUTHORITY.md` | Governance docs | Yes | Not on M |

---

## D. Current integration table

| Category | Items |
|---|---|
| **Exposed (route + API + engine on IRR `main`)** | Evidence Replay (`/evidence/replay/:id` → `ReplayExplorer`; `/api/replay/:id`); Company Intelligence (`/research/company/:id`); Decision Matrix (`/intelligence/decision-matrix`; `/api/decision-matrix`); Evidence Landing and Explorer (`/evidence`, `/evidence/:id`); Macro (`features/research/MacroContext.tsx`; `/api/macro/*`); Cross-Sector (`/research/cross-sector`; `/api/cross-sector`); Executive (`/executive`); Portfolio certified reference (`/portfolio`; `/api/portfolio`); Watchlists, Collaboration, Settings (P5 #6–#8); Governed Screener (`/screener`; N4); Admin (`/admin/*`, guarded); AI Advisory (selective); Engine registry (`/research/engines`); ConsumerEngine (registered) |
| **Existing but disconnected from IRR `main`** | Command palette (U refs); Intelligence Opportunities, Risks, Rankings UIs (`phase13-next`); Intelligence Hub (`phase13-next`); Research Hub (`phase13-next`, `gai-impl-canonical`); Sector Intelligence page (`phase13-next`; route placeholder on M); Notes and Notifications (U refs); Research Events (U); Company Trust Chain (U); Reports UI (IPD donor); recovered Sector and Company pages (`arena/01a0d1d3`); BI-07 broker import (IPD M; not integrated with IRR, P5 §F); Portfolio Intelligence (engine wired, no surface); OpportunityEngine and RankingEngine (engine on M, UI on U); Snapshot store and service (engine on M, not exposed); WorkflowRuntime (engine on M, no UI); UI01 Replay Studio view model (IPD M, no route); Workflow viewer (archive only) |
| **Dependency-bound** | Reports persistence (NP-04 store on IPD `np04-governed-persistence-windows`, off-main; IRR reports return fail-closed without it); G24 durable store and external identity mapping (IPD `arena/01a0e6d9`, off-main); Sector recovered implementation depends on AI advisory (deferred) and IPD executive transport; Cross-repo PIT pin (fails against IPD `main`, P5 #20); D115 mapping depends on activation that was not performed |
| **Authority-bound** | Evidence Snapshots UI (NP-13 D5); Reports UI and navigation (NP-06 scope DEFERRED); Widgets (non-governing per inventory); D107/EOD (accepted only on unmerged branch; production excluded); AG-5 (UNRESOLVED on M; D-2 §6); Cross-domain identity mapping (D-2 §7–§8: translation requires separate governed contract); Intelligence surfaces (NP-18 qualification and certification NOT GRANTED); Live Dhan (DEFERRED / not proven); Live OIDC certification (not in scope of this brief; G3 LIVE local maintainer approval recorded on M) |
| **Runtime proof** | **Not established by this brief** for any row. All "present" findings are source-level or record-level. |

---

## E. Genuine-gap table (strict L8 only)

**NO GENUINELY MISSING CAPABILITY HAS BEEN PROVEN BY THIS INVESTIGATION.**

Authority-bound or name-only absences are recorded for transparency and are **not** L8:

| Item | Why not L8 |
|---|---|
| Evidence Snapshots UI | Engine on M; UI route reserved; NP-13 D5 authority bound (L5) |
| Reports UI | Historical donor UI and qualified API located; UI explicitly DEFERRED (L4) |
| Widgets | Historical UI file located; non-governing (L4) |
| D107 / EOD | Record and code located on unmerged IPD branch (L4) |
| AG-5 operational mapping | Records located (D115, one entity, unactivated); no implementation; governance UNRESOLVED (L6) |
| Cross-domain identity mapping | G24 mapping, IRR translation boundary, roster and IdP sync located on unmerged or domain-internal refs; D-2 declines unification (L4) |
| Decision Center (name) | Engine precursor and matrix on M; no decision-center surface; requirement-level (L5) |
| Command Center (name) | Functional palette located; name never used (L4) |

---

## F. Unresolved lineage table

| # | Item | What is unresolved | Why it matters | What resolves it (read-only) |
|---|---|---|---|---|
| U1 | Decision Center functional equivalence | Spec "governed workflow" vs `WorkflowRuntime` (M), `DecisionMatrix` (M), read-only `WorkflowView` (archive) | Determines L5 vs L1/L2 | Compare spec/tracker "Decision Center" acceptance rows against WorkflowRuntime and Decision Matrix contracts |
| U2 | Company Workspace ↔ CompanyIntelligence | Spec/P13 label vs IRR `/research/company/:id` | Determines whether the name is an alias | Compare P13 `dataSurfaces.js` UI02 contract with `CompanyIntelligence` contract |
| U3 | Replay Studio route | IPD stage-5 report names `/replay-studio`; no route found on M | Determines whether UI01 has any route | Search IPD branches for route registration of `ui01` builder |
| U4 | `csipCompanyId` counterpart | Field appears only in IPD refs; UUID absent from all 72 IRR trees | Blocks any AG-5 reading | Establish whether `csipCompanyId` denotes an IRR-side identifier (IRR CSIP docs and IPD D115 designation packet) |
| U5 | G24 external identity mapping vs D-2 §6 | G24 `app_identity` governed mapping and IRR `translationBoundary` vs D-2 "no governed IRR Principal → G24 applicationUserId mapping" (conflict K5) | Highest-impact identity conflict | Read the G24 provisioning authority (`evidence/np04/NP04-GOVERNANCE-AUTHORITY-RECORD.md`) against D-2 §3.3 and §6 |
| U6 | Phase 14.1 workflow surface | Present only in archive; tracked refs lack it (per `arena/01a10cce` "D") | Recoverability versus tracked status | Confirm archive provenance (commit and tree) and whether the archive is the certified source |
| U7 | NP-18 admission | AUTH-NP-18 on unmerged `arena/01a0ddea`/`01a0e30f`; inventory row 38–40 says never built | Intelligence trio: L4 vs L1 | Locate any admission act for NP-18 onto M |
| U8 | Widget authority | Inventory cites "3b23f27 precedent" and "authority acts not found"; not read | Widgets L4 vs L8 | Read `windows/d114` and `t:p14-r7` records (D80–D83 family) |
| U9 | D107 standing on IPD `main` | Accepted only on branch `arena/01a0a438` | Whether D107 has any M-level authority | Confirm via IPD governance records on M (none located) |
| U10 | E2E-018 baseline vs current | IPD `01a0d1d3` matrix baseline ABSENT for Company Intelligence vs IRR M `CompanyIntelligence` present | Historical vs current status | Compare matrix baseline commit with M history |
| U11 | Conflicting PR title/state | PRs #42/#44/#45/#46 titled "no merge / candidate" but MERGED to M | Admission history | Read PR bodies and promotion-act records (PR bodies not searched) |
| U12 | IRR `CrossSectorEngine.ts` divergence | Different content on `main` vs `phase13-next` | Engine version identity | Diff the two blobs |
| U13 | gai-impl-canonical lineage | 47 unique commits; only surfaced components read | Completeness | Enumerate its commit list and classify |
| U14 | Binary artifacts | PNG screenshots and non-main xlsx/docx not content-searched | Completeness | Extract remaining documents from non-main refs |
| U15 | PF-2 governing records (TD-4, TD-8a) | Cited in `roster-directory.ts` and `idp-sync.ts` comments (`gai-impl-canonical`, `phase13-next`); no defining record located in any IRR ref | The PF-2 directory's authority is undocumented in the searched lineage | Locate the TD-4/TD-8a decision records (name variants, PR bodies, IRR `docs/` history) before any reading of PF-2 authority |

---

## G. Search audit

**Repositories:** IRR `ramkivs/iips-review-recovered`; IPD `ramkivs/iips-production-market-data`. Both read via `git ls-remote` and `git clone --mirror` (scratch `/tmp/inv/{irr,ipd}.git`, fetched 2026-10-08). No writes to any remote or to the authoritative worktree.

**Refs:** IRR 122 (70 heads, 50 PR refs, 2 tags). IPD 42 (32 heads, 6 PR refs, 4 tags). All refs enumerated. Session branch absent on remote.

**Commit ranges:** IRR 427 commits reachable from any ref (main 168). IPD 618 (main 94). All commits included in pickaxe and path-universe queries.

**Trees:** unique tree deduplication: IRR 72 trees; IPD 33 trees. Every content search ran once per unique tree and was mapped back to its refs. Same-path, different-blob entries are recorded as divergent versions, not as absence.

**Blob-level comparison against `main`:** IRR 601 blobs present on some ref but not on `main`; IPD 2,441. Used only to prioritise. Same-path divergence noted separately.

**Path universe (all history):** IRR 1,620 distinct paths ever (main 1,192). IPD 2,537 (main 319). Deletions across all history including merges (`git log --all -m --diff-filter=D`): **0 in both**. Renames (similarity-based): IRR 3 (IES verification report filenames); IPD 5 (spec and tracker filenames and IES reports). No capability-vocabulary renames detected by rename detection.

**Content search:** `git grep -I -i` (text only) across each unique tree. Terms (exact phrase unless noted):
- Command Center, Command Centre, CommandCenter, Command Palette, CommandPalette, Decision Center, DecisionCenter, Company Workspace, CompanyWorkspace, Replay Studio, ReplayStudio, Evidence Snapshot(s), Evidence Replay, Research Hub, ResearchHub, Sector Research, Sector Intelligence, SectorIntelligence, Opportunities, Opportunity Engine, OpportunityEngine, Risk Engine, RiskEngine, Rankings, RankingEngine, Reports, ReportsPage, Widget, widget, D107, D-107, EOD, End of Day, End-of-Day, AG-5, AG5, Cross-Domain, Cross Domain, Portfolio Intelligence, PortfolioIntelligence, BI-07, ConsumerEngine, staples, discretionary, G24, mapping registry, MappingRegistry, company mapping, identity mapping, IdentityMapping, tenant mapping, TenantDirectory, ISIN, companyId, securityId, UI01–UI14, NotYetAuthorized, FeaturePlaceholder, routes.ts, Notes, Notification.
- Regex categories (23): COMMAND_CENTER, RESEARCH_HUB, SECTOR_RESEARCH, OPPORTUNITIES, RISKS, RANKINGS, REPORTS_UI, WIDGET, EOD, D107, COMPANY_WORKSPACE, DECISION_CENTER, REPLAY_STUDIO, EVIDENCE_SNAPSHOT, EVIDENCE_REPLAY, CROSS_DOMAIN_E2E, PORTFOLIO_INTEL, BI-07, AG-5, IDENTITY_MAP, TENANT_PRINCIPAL, CONSUMER_SEGMENTS, DATA_PIT.
- Cross-term co-occurrence: "cross-domain" + "e2e" within 40 characters: 0 hits in any ref.

**Alternate names searched:** Command palette, Ctrl-K, global search, Quick Actions, Decision Matrix, Workflow, Company Intelligence, Company Trust Chain, Replay & Simulation Studio, UI01–UI14 (noted as ID collisions), Snapshots, Priority Opportunities, RankedOpportunity, Portfolio Risk, Ordered Comparison, Executive widgets, csipCompanyId, canonicalIssuerId, applicationUserId, issuer+subject, PF-2, TD-4, TD-8a.

**Route and path patterns:** `frontend/src/app/{App.tsx,routes.ts,navigation.ts,AppShell.tsx,TopBar.tsx}` on each unique tree; `frontend/src/features/**`; `frontend/src/api/**`; `frontend/server/**` (transports, reports, user-portfolio, directory, notes, notifications, d115-runtime, tenant-membership-store); `iips-platform/src/sector-engines/**`, `iips-platform/src/{snapshot,replay,framework/evidence,distributed,runtime,integration}/**`; IPD `src/ui/**`, `src/identity/**`, `src/pit/**`, `src/operations/**`, `src/quality/**`, `frontend/src/features/portfolio/**`, `frontend/server/market-data/**`, `d115/**`, `p12/**`, `p13/**`, `p14/**`.

**Artifact patterns:** `docs/**`, `governance/**`, `evidence/**`, `artifacts/**`, `deliverables/**` (IRR and IPD); `*.json`; `*.md`; IPD `…SPEC_INTEGRATION_ALIGNED.docx` and `…TRACKER_INTEGRATION_ALIGNED.xlsx` (main only; extracted to scratch and text-searched); IRR `artifacts/phase14.1-recovery-snapshot/*.tar.gz` (listed and extracted to scratch); `docs/v3.0/e2e-018-screenshots/*.png` (presence only).

**Historical searches:** `git log --all -G<regex>` (pickaxe, case-insensitive) for Command Center (IRR 0 / IPD 0), Decision Center (IRR 0 / IPD 14), Company Workspace (0 / 15), Replay Studio (0 / 14), Research Hub (2 / 23), Widget (2 / 7), D107 (0 / 8), AG-5 (3 / 2), features/reports (7 / 4). Path universe, deletions and renames as above.

**PR review:** IRR 50 PRs (all merged; titles and merge commits verified). IPD 6 PRs (all merged). PR bodies **not** searched.

**Limitations:**
1. Text-only content search (`-I`); binary files (PNG, tarballs other than the phase14.1 archive, non-main xlsx/docx) not content-searched.
2. No runtime execution, no test runs, no live Dhan, no live OIDC, no production access (out of scope).
3. Blob comparison distinguishes content from path; same-path divergence is recorded as divergent versions.
4. Authority determinations rely on text of governance records; acts on unmerged refs were read selectively.
5. Lineage read is point-in-time (mirrors fetched 2026-10-08); refs may move.
6. Windows acceptance records were read as Git content only; not consumed as runtime proof.
7. Spec and tracker extraction is XML text, not a rendered view.
8. Name-based inference was not used to equate surfaces. UI-ID collisions (UI01–UI14) were recorded as conflicts.

---

## H. Smallest next investigation step

**One read-only determination:** Establish whether the G24 `External Identity Mapping` (IPD `arena/01a0e6d9`, `src/app_identity/service.ts`, governed by `evidence/np04/NP04-GOVERNANCE-AUTHORITY-RECORD.md`) is a governed authority of the kind D-2 §6 says does not exist, by comparing the provisioning authority acts that created it against D-2 §3.3, §6 and §8 and P5 row 12.

This single step resolves conflict K5, the highest-impact identity question. It determines whether cross-domain identity mapping is L4, L1 (if governed), or L6. It does not recommend any implementation.

---

## I. Final disposition

**B — SUBSTANTIALLY COMPLETE, LIMITED GAPS.**

Gaps that keep the result from A: U5 and U4 (identity authority and counterpart), U7 (NP-18 admission), U8 (widget authority), U11 (PR bodies), U14 (binary artifacts), U13 (gai-impl-canonical lineage), U1–U3 (functional equivalence of name-level labels).

---

## J. Conflicts (recorded, not reconciled)

| # | Old claim | Source of old claim | Current evidence | Contradiction | Likely explanation | Unresolved authority question |
|---|---|---|---|---|---|---|
| K1 | Opportunities, Risks, Rankings "NEVER IMPLEMENTED" / "never built" | IPD `main` `IIPS-HISTORICAL-CURRENT-CONVERGENCE-INVENTORY.md` rows 38–40; IPD `01a0d1d3` inventory ("no implementation in any lineage") | IRR `phase13-next` UI components; NP-18 authority (`arena/01a0ddea`) B-1/B-2/B-3 IMPLEMENTED; EVID-NP-18 runtime PASS | Direct | Inventory predates or excludes IRR NP-18 lineage | Does any act admit NP-18 to IRR `main`? |
| K2 | Replay Studio "no implementation in any lineage" | IPD `01a0d1d3` inventory row 36 | IPD `main` `ui01_replay_studio.ts` (view-model builder); `ui_registry.ts` authorizes UI01 | Direct | Inventory measured React surfaces only | Is a presentation-only builder an implementation for the capability? |
| K3 | "Reports transport present on IRR main" | P5 (IRR `main`) #3 | `reports-transport.ts` absent on M; transport on `arena/01a0f1b3` (U); M has `/api/reports` dispatch and persistence port | Partial | P5 overstated M scope | Which Reports components have admission authority? |
| K4 | "Phase 14.1 workflow read surface" absent from tracked refs ("D") | `arena/01a10cce` CAPABILITY-EVIDENCE-RECONCILIATION | Archive `phase14.1-recovery-deposit` contains `WorkflowView.tsx` and tests; all imports resolve | Tracked vs archived | Archive, not source tree | Is the archive the certified source? |
| K5 | "No governed IRR Principal → G24 applicationUserId mapping exists" | IRR `main` D-2 §6 | G24 `app_identity` "External Identity Mapping" `(issuer,subject)→applicationUserId`, lifecycle-gated; IRR `main` `translationBoundary.ts` defines the contract; P5 #12 "governed (issuer,subject)→applicationUserId" | Direct | D-2 may mean no governed IRR-side mapping. G24's provisioning is domain-internal | Does G24 provisioning constitute governed mapping under D-2? (U5) |
| K6 | AG-5 "no implementation exists anywhere"; "no governed CompanyId mapping" | IRR `main` P3 L44/L106; D-2 §6 | IPD `arena/01a0ae80` D115 release-authority record: `releaseAuthorization=GRANTED`, `csipCompanyId`; `mappingReleased=NOT_YET_IMPLEMENTED`, not activated/registered/loaded | Authorization vs non-implementation | An authorization record without implementation; counterpart UNPROVEN | Does a GRANTED authorization on an unmerged IPD branch bear on AG-5? (U4) |
| K7 | D107 "ACCEPTED" as governance decision | IPD `arena/01a0a438` D107 record | IPD `main` has no D107 record; D107 excludes production and commercial claims | Branch-only acceptance | Accepted within its own branch | Does D107 have standing on IPD `main`? (U9) |
| K8 | "Global search command palette: unique, not on main, no disposition" vs IPD inventory row 7 PRUNED vs IRR M requirement "Command palette for power users" | P5 §E; IPD inventory; IRR navigation model | Palette code on U refs | Three different dispositions | Different lineages with different scopes | Is the palette in or out of scope for IRR? |
| K9 | IPD P13 names ("UI02 Company Workspace", "UI06 Decision Center", "UI01 Dashboard") | IPD `p13/src/dataSurfaces.js` (U) | IPD `main` registry: UI01 = Replay & Simulation Studio, UI02 = Executive Summary, UI06 = Multifactor Screener | Same IDs, different meanings | ID reuse across lineages | Do not equate by ID (no identity inference) |
| K10 | Company Intelligence "ABSENT at matrix baseline" | IPD `01a0d1d3` recovery manifest citing E2E-018 matrix | IRR `main` `CompanyIntelligence` present; E2E-018 screenshots present (binary) | Historical vs current | Matrix baseline predates current M | Which status applies for the product host? (U10) |
| K11 | `companyId` as canonical company identity | (informal use in IPD) | D-2 §3.2: IPD `companyId` = instrument identity; IRR `companyId` = synthetic sector ID (e.g., `Banking-H1`) | Name collision | Overloaded term across domains | Not an identity equivalence (D-2 §8) |
| K12 | "iips-platform/reports-*" as Reports capability evidence | Directory names | These are engine validation reports, not the Reports product capability | Name collision | Naming reuse | Not evidence of Reports capability |

---

## K. Lineage-recovery sources read (non-authoritative)

IRR `main`: `docs/v3.0/navigation-model.md`; `evidence/integration/convergence/2026-10-07/P3-persistence-durability.md`; `…/P5-capability-sweep.md`; `docs/integration/IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md` (D-2); `docs/integration/IIPS_v3.0_NP13_EVIDENCE_LANDING_NAVIGATION_IA_GOVERNANCE_DECISION.md`; `docs/integration/NP-15-*` (widget statements); `frontend/src/app/App.tsx`, `routes.ts`, `navigation.ts`; `frontend/server/executive-transport.ts`; `frontend/server/user-portfolio/translationBoundary.ts`; `frontend/server/d115-runtime.ts`; `frontend/server/tenant-membership-store.ts`; `iips-platform/src/sector-engines/cross-sector/*`; `iips-platform/src/sector-engines/consumer/*`; `iips-platform/src/snapshot/*`; `iips-platform/src/replay/*`; `iips-platform/src/distributed/WorkflowRuntime.ts`.

IRR `phase13-next`: `frontend/src/app/App.tsx` (routes L50–L78); `features/intelligence/*`; `features/research/*`; `features/shell/CommandPalette.tsx`; `governance/iips/EVID-NP-18-*.md`.

IRR `arena/01a0ddea` (and `01a0e30f`): `governance/iips/AUTH-NP-18-INTELLIGENCE-EXPOSURE-IMPLEMENTATION-AUTHORITY-2026-09-26.md`.

IRR `arena/01a0f1b3`: `docs/v3.0/g3-build/PROGRAM_v3.0_NP06_REPORTS_FINAL_QUALIFICATION.md`; `frontend/server/reports-transport.ts`; `docs/v3.0/g3-build/PROGRAM_v3.0_G3_*TENANT*.md`.

IRR `arena/01a10cce`: `docs/integration/CAPABILITY-EVIDENCE-RECONCILIATION-2026-10-06.md`.

IRR `phase14.1-recovery-deposit`: archive `artifacts/phase14.1-recovery-snapshot/v3.0-phase14.1-certified-snapshot.tar.gz` (extracted to scratch `/tmp/inv/tar/v141snap`; `frontend/src/features/workflow/WorkflowView.tsx` read).

IRR `gai-impl-canonical`: `frontend/server/directory/{roster-directory,idp-sync}.ts`.

IPD `main`: `src/ui/ui_registry.ts`; `src/ui/view_models/ui01_replay_studio.ts`; `src/ui/types.ts`; `src/identity/mapping_store.ts`; `src/operations/slo_evaluator.ts`; `src/quality/freshness_evaluator.ts`; `docs/FULL_IIPS_BI08_CONVERGENCE_FILE_MATRIX.md`; `evidence/target-shell-integration/IIPS-HISTORICAL-CURRENT-CONVERGENCE-INVENTORY.md`; `evidence/d114/stage5-ui-read-only-qualification-report.md`; `evidence/bi07/bi07-final-certification.json`; `frontend/src/features/portfolio/*`; `…SPEC_INTEGRATION_ALIGNED.docx` and `…TRACKER_INTEGRATION_ALIGNED.xlsx` (extracted to scratch and text-searched).

IPD `arena/01a0a438`: `docs/D107_EOD_PRODUCTION_READINESS_GATE_ADJUDICATION.md`; `frontend/server/market-data/*`.

IPD `arena/01a0814b` family: `frontend/src/features/{reports,research,shell}/*`; `p13/src/dataSurfaces.js`.

IPD `arena/01a0d1d3` and `arena/01a0d33d`: `IIPS_RESEARCH_SECTOR_{RECOVERY_MANIFEST,UI_RECOVERY_REPORT,READ_AUTHORITIES_REPORT}.md`; `docs/IIPS_REMAINING_PRODUCT_SURFACE_INVENTORY.md`; `frontend/src/features/research/SectorIntelligence.tsx`; `frontend/src/features/company/CompanyIntelligence.tsx`; `frontend/server/research-sector-transport.ts`.

IPD `arena/01a0ae80`: `d115/governance/identity-mapping/*`; `d115/governance/canonical-identity/*`; `d115/tools/canonical-identity-allocator/*`.

IPD `arena/01a0c86d`: `docs/D115_IDENTITY_DESIGNATION_PACKET.md`.

IPD `arena/01a0e6d9` and `01a0f308` @ `6828155`: `src/app_identity/service.ts`; `src/portfolio/durable-store.ts`; `src/persistence/*`; `src/pit/pit_read_service.ts`.

---

*End of non-authoritative investigation output. No governance artifact was published. No repository was modified.*
