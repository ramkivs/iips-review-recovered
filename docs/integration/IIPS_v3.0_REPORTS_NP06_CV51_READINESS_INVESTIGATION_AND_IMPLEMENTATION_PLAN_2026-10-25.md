# IIPS v3.0 — NP-06 Reports: CV-51 Readiness Investigation and Minimum-Scope UI & Route Exposure Implementation Plan (`2026-10-25`)

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-REPORTS-NP06-CV51-READINESS-AND-PLAN-2026-10-25-01` |
| **Document Type** | Bounded Readiness Investigation & Concrete Minimum-Scope Implementation Proposal (`CV-51` — Reports UI and Route Exposure) |
| **Status** | **PUBLISHED INVESTIGATION & IMPLEMENTATION PROPOSAL — GRANTS NO IMPLEMENTATION, ROUTE-MOUNT, NAVIGATION, OR UI-EXPOSURE AUTHORITY** |
| **Date** | `2026-10-25` (UTC) |
| **Program Authority** | Ramki (Single Application Owner & Program Authority) |
| **Authoritative Repository (IRR)** | `ramkivs/iips-review-recovered` (`refs/heads/main`) |
| **Verified IRR Baseline** | Commit `0cc999ffba424476bace9688ca2f93ab114f0ee5` (tree `8af4b196205b4e3dcbc4801614a60c709c7e0d7f`, merge of PR #264; post-merge `main` CI run `40188325777` `success`; `0` open PRs) |
| **Related Repository (IPD)** | `ramkivs/iips-production-market-data` (`refs/heads/main` @ `4b5c65a731a66a6fa1260146a55df9ed772953a5`; `0` open PRs; **read-only — zero writes**) |
| **Preserved Operative Backend Gates** | Commissioning `IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01` (`67743031…`); `R3` `IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01` (`9642ce1b…`); `R1` `IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01` (`c4fdc26b…`); `R2` `IIPS-V3-REPORTS-NP06-R2-CONTRACT-SHAPE-PA-DECISION-ACT-2026-10-25-01` (`e3ad095e…`); `F-7` & Bounded Backend Acceptance `IIPS-V3-REPORTS-NP06-F7-QUALIFICATION-AND-ACCEPTANCE-2026-10-25-01` (`77fc793c…`) |
| **Companion Proposed Decision Act** | [`docs/integration/IIPS_v3.0_REPORTS_NP06_CV51_IMPLEMENTATION_AUTHORITY_PA_DECISION_ACT_PROPOSED_2026-10-25.md`](IIPS_v3.0_REPORTS_NP06_CV51_IMPLEMENTATION_AUTHORITY_PA_DECISION_ACT_PROPOSED_2026-10-25.md) (`IIPS-V3-REPORTS-NP06-CV51-UI-EXPOSURE-PA-DECISION-ACT-2026-10-25-01` — **`PROPOSED — NOT APPROVED / NOT EFFECTIVE`**) |
| **Current `CV-51` Status** | **`WITHHELD / BLOCKED — PA DECISION PENDING`** (zero `/reports` client routes, zero sidebar navigation items, zero Reports UI files) |
| **Production Admission** | **`NOT ADMITTED / NOT PRODUCTION-READY`** |

---

## 1. Verified Baseline and Preserved Completed Backend Gates

### 1.1 Independently Verified Repository & Runtime Baseline

At preparation of this investigation on `2026-10-25`, the authoritative remote state was verified directly from Git and GitHub objects:

1. **IRR (`ramkivs/iips-review-recovered`):** `refs/heads/main` resolves to `0cc999ffba424476bace9688ca2f93ab114f0ee5` (root tree `8af4b196205b4e3dcbc4801614a60c709c7e0d7f`), merge of PR #264 (`§16.112.7` publication receipt for PR #263). Latest `main` CI run `40188325777` completed `success`; `0` open pull requests exist at baseline.
2. **IPD (`ramkivs/iips-production-market-data`):** `refs/heads/main` resolves to `4b5c65a731a66a6fa1260146a55df9ed772953a5`, with `0` open pull requests and **zero writes** performed or proposed.
3. **Preserved Reports Backend Implementation Blobs (`HEAD` = `0cc999ffba424476bace9688ca2f93ab114f0ee5`):**
   - `frontend/server/reports-owner-carrier.ts` — blob `5239d0bf6e402af684914e042075e33b1c41f686`
   - `frontend/server/reports-owner-resolver.ts` — blob `66410e121661a83c8d49d72365f4d031e827eb6b`
   - `frontend/server/reports-transport.ts` — blob `775d282bc50f67993a58d6e6d1c7dd45e4aceeac`
   - `frontend/server/reports-restart-harness.ts` — blob `2d8108bbb086e72991920b4f3a35c824a431b865`
   - `frontend/server/executive-transport.ts` — blob `a438eec0c02287ceb734f6377dca08ce22fa247d`
   - `frontend/package.json` — blob `a0061bce69e622052bc9c46a55b4f7db3e9e503d` (carrying primary pin `iips-production-market-data#2d9130e76bb0dc89daeefabaf297e27bdaa84250`, broker pin `iips-broker-import#70b24f029842a7e9b7f615e4d9df7376fd4ff817`, and NP-04 persistence pin `iips-np04-governed-persistence#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`)
   - `iips-platform/src/sector-engines/cross-sector/reporting/ReportingEngine.ts` — blob `1149864a8c43e8b885eee2c4a9a1ce869dd8f338` (frozen CSIP stage-10 engine; `0` changes)
   - `frontend/server/d115-runtime.ts` (`d9b546c941b17b3c4a34b68724bf89e6da821f91`) and `frontend/server/d115-runtime.test.ts` (`51bd4f68203e53163c41830d9a966a01bb1d2f4d`) — **zero** runtime consumers across `frontend/server/` and `frontend/src/` (`CV-43` closed, retained unwired).
4. **Preserved Frontend Shell Blobs (`HEAD` = `0cc999ffba424476bace9688ca2f93ab114f0ee5`):**
   - `frontend/src/app/routes.ts` — `a083db101340fb5165495eb0afebd98c01e757c5`
   - `frontend/src/app/navigation.ts` — `bfe8eac29bf2b119f720402a31e0a2f82004984c`
   - `frontend/src/app/App.tsx` — `97251627838ad65b3f18e7ef3a864357c17c8a0a`
   - `frontend/src/app/AppShell.tsx` — `8daa5dbecae394cbf1f6637bce98cd80820629f4`
   - `frontend/src/app/AppShell.css` — `27c50961d58754b60843fddb8261efca126c8103`
   - `frontend/src/app/Sidebar.tsx` — `0d1e9badcf63f7fd4361a4d5d1ddb0490adea4d4`
   - `frontend/src/app/TopBar.tsx` — `7bfb0445a9195d763d5bd09771136a16462e422b`
   - `frontend/src/app/App.test.tsx` — `16e4aff7f0391c672a691c514fe9047bf602dcf8`
   - `frontend/src/core/network/noAuthFetch.ts` — `6dda97e556ef10df9dc67fba6ef3779b3bb5cf45`

### 1.2 Closed Backend Gates Preserved Without Reopening

Per standing Program Authority constraints and verified repository evidence, no contradiction or defect exists on the accepted read path of the NP-06 backend stack. The following gates remain closed, effective, and untouched:

- **`R1` Ownership Declaration & Carrier (`c4fdc26b…`):** Dedicated single-user non-auth Reports partition (`tenantId: 'irr-reports-personal'`, `ownerUserId: 'owner-irr-reports-personal'`), local git-external carrier `reports-owner-context.json` (`384` bytes, SHA-256 `b1b78809d1c8d05800b338f73082b4269e6c9fa65b8f35192f4736d6f1a98640`) bound via `IIPS_REPORTS_OWNER_PATH`, uncached per-request verification, and complete 15-element `D-2` §8 contract.
- **`R2` Contract Shape (`e3ad095e…`):** Single-owner predicate `P-1` (`C-3`), fail-closed `503 owner-context-unavailable` (`C-2`), `400` client identity/tenant/company claim rejection (`C-4`), `400` durable-identity field rejection (`C-5`), `503 persistence-unavailable` store failure mapping (`C-8`), request-time audit deferral `A-2` (`C-7`), and operative replacements for historical authenticated `§5.4` rows 1–3.
- **`R3` Persistence Binding (`9642ce1b…`):** Second IRR dependency specifier `iips-np04-governed-persistence#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` bound through `frontend/server/reports/{persistence-port,np04-adapter,persistence}.ts` over `IIPS_NP04_DATABASE_PATH`.
- **`F-7` Durable HTTP Qualification & Bounded Backend Capability Acceptance (`77fc793c…`):** All 5 `F-7` legs proven across 3 separate OS processes (`reports-restart.test.ts` + `reports-restart-harness.ts`); NP-06 backend capability **ACCEPTED FOR BOUNDED NON-PRODUCTION SCOPE**, while `CV-51` (`Reports UI and route exposure`) was explicitly withheld for its own separate PA decision act.

---

## 2. Evidence-Backed Findings Across All 11 Investigation Questions

### Q1. What are the exact acceptance criteria for `CV-51`?

In the master tracker (`§16.4.4`, line 1160), `CV-51` originally grouped three sequential items: *(1)* owner-bound `D-2` §8 contract (`R1`/`R2`), *(2)* `F-7` qualification including restart durability over `R3`, and *(3)* Reports UI / no-auth product exposure. Because items *(1)* and *(2)* were discharged on `2026-10-25` (`§16.110`–`§16.112`, PRs `#258`–`#264`), **residual `CV-51` is strictly the client product-surface exposure gate** (`§16.108.7`, `§16.112.4`, `§18.1` row 37).

Synthesizing `IIPS_v3.0_NP06_REPORTS_GOVERNANCE_DECISIONS.md` (`D3`, `D8`, `G11`, `R4`, `R5`, `§5.1`–`§5.6`, preserved at `6a8afbb2bb73ca02d2b22e6f45e9f7d27a4a4b9b`), the effective `R1`/`R2`/`R3`/`F-7` records, the Global No-Auth decision, `docs/v3.0/{information-architecture,navigation-model,design-principles,design-system}.md`, `frontend/src/app/App.test.tsx`, and the accepted UI precedents (`F-3` PR #70, `CV-53` PR #115, `PKG-08 Row 4` PR #161), `CV-51` requires satisfaction of **ten testable acceptance criteria (`AC-CV51-01` through `AC-CV51-10`)**:

| Criterion ID | Acceptance Requirement | Governing Authority |
|---|---|---|
| **`AC-CV51-01`** | **Seventh L1 Product Section & Route Exposure:** Reports is mounted at top-level product routes (`/reports` and `/reports/:reportId`) and exposed as a top-level L1 sibling entry in the global sidebar (`NAV`), never nested inside Portfolio, Research, Intelligence, or Evidence, and never exposing a raw `:reportId` parameter link in global navigation. | NP-06 `D8` / `§5.6`; `navigation-model.md`; `App.test.tsx:120-161` |
| **`AC-CV51-02`** | **Cross-Sector Canonical Projection Only (`R4`, `R5`, `G11`):** UI renders persisted cross-sector `CanonicalReportArtifact` records verbatim as a downstream read projection; it performs zero score/rank/weight/verdict/hash recomputation, does not modify or re-implement frozen CSIP `ReportingEngine` (`1149864a…`), introduces no sector-report scope, and implements no PDF/CSV/file export projection. | NP-06 `R4`, `R5`, `G11`; `design-principles.md` §2 |
| **`AC-CV51-03`** | **Four Mandatory Progressive-Disclosure Levels (`D8` / `§5.6`):** Artifact inspection presents, in exact governed order: **(1) Summary** (`reportType`, `generatedAt`, `schemaVersion`, `artifactVersion`, governed ownership-scope posture, current-head vs superseded lifecycle status), **(2) Detail** (`canonicalPayload` fields rendered faithfully, with `null`/absent values shown as `unavailable`/`—`, never `0`), **(3) Evidence & Provenance** (`provenance.engineOutputId`, recorded provenance fields, deterministic `reportKey`, `supersedesReportId`, and supersession history), and **(4) Replay & Reference** (`reportId` + `artifactVersion` durable handles and navigation links to any version in the chain including current head, with honest non-claim copy distinguishing durable retrieval from engine re-execution). | NP-06 `D8` / `§5.6`; `DataComponents.tsx` |
| **`AC-CV51-04`** | **Credential-Free Single-User Operation:** All HTTP requests execute via `noAuthFetch` (`credentials: 'omit'`, `authorization` stripped); UI renders zero login, logout, session, role, permission, or tenant-selection controls, and persists zero report or identity state in `localStorage`, `sessionStorage`, `IndexedDB`, or cookies. | Global No-Auth Decision; `noAuthFetch.ts`; `TopBar.tsx`; `Settings.tsx` |
| **`AC-CV51-05`** | **Server-Owned Owner Context & Prohibited Field Discipline:** Client never transmits `tenantId`, `userId`, `owner`, `ownerUserId`, `authenticatedUser`, `principal`, `companyId`, or `runtimeCompanyId` in URLs, query parameters, headers, or bodies, and never renders raw internal partition literals (`irr-reports-personal`, `owner-irr-reports-personal`) in visible DOM text. | `R1` §3; `R2` §1.3 (`C-4`); `F-3` Browser Acceptance §5 |
| **`AC-CV51-06`** | **Complete State Coverage & Sanitized Fail-Closed Presentation:** UI handles loading, empty (`200` with `data: []`), populated list + cursor pagination (`nextCursor`), head detail, superseded historical detail, `404` indistinguishable not-found, `503 owner-context-unavailable`, `503 persistence-unavailable`, `400` invalid request, `500` transport error, network unreachable (`status: 0`), and malformed `200` envelopes — stripping raw backend `detail`/`reason` strings so filesystem paths, SQLite messages, and stack traces never leak to the DOM, never fabricating investment data, and providing an explicit `Retry` action on transient/unavailable failures. | `R2` `C-2`/`C-8`; `StateComponents.tsx`; `UserPortfolioStates.tsx`; `Settings.tsx` |
| **`AC-CV51-07`** | **Accessibility & Non-Color-Only Semantics:** Landmarks, heading hierarchy (`<h1>` → `<h2>`), `<th scope="col">`, ARIA status/alert announcements, visible `:focus-visible`, full keyboard navigation, `prefers-reduced-motion`, WCAG AA token contrast, and symbol+text+token badges satisfy v3.0 design-system rules. | `design-principles.md` §6, §8; `design-system.md` §5; `Badges.tsx` |
| **`AC-CV51-08`** | **Responsive Layout Integrity:** Both `/reports` and `/reports/:reportId` render cleanly without horizontal shell clipping or overlapping controls across desktop (`1280×800`), tablet (`768×1024`), mobile (`375×812`), and narrow (`320px`) viewports. | `design-system.md` §7; `AppShell.css` (`CV-53` precedent) |
| **`AC-CV51-09`** | **Automated + Real-Browser Loopback Verification:** Unit/API-client tests, component/routing tests, `App.test.tsx` shell invariants, `typecheck`, `typecheck:replay-server`, `test:ci`, `build`, and real Chromium loopback checks (`127.0.0.1:5173` → `127.0.0.1:8787`) pass across configured and fail-closed (`503`) server states with zero backend or unrelated surface regressions. | `.github/workflows/ci.yml`; `F-3` / `CV-53` / `PKG-08 Row 4` records |
| **`AC-CV51-10`** | **Durable Publication & Explicit PA Product-Surface Acceptance:** Implementation and qualification evidence are merged to `ramkivs/iips-review-recovered` `refs/heads/main`, verified remotely by post-merge receipt (`§16.70.13`), and accepted by Program Authority before `CV-51` moves from `BLOCKED` to `COMPLETE / ACCEPTED`. | Universal Artifact Durability Invariant; tracker `§16.4.4`, `§16.12` |

---

### Q2. What product routes and UI entry points currently exist on `main`?

Direct inspection of `frontend/src/app/routes.ts` (`a083db10…`), `frontend/src/app/App.tsx` (`97251627…`), and `frontend/src/app/navigation.ts` (`bfe8eac2…`) establishes the complete route and navigation table at `0cc999ffba424476bace9688ca2f93ab114f0ee5`:

| L1 Group / Surface | `routes.ts` Key(s) & Path(s) | Mounted Element in `App.tsx` | Sidebar `NAV` Entry (`navigation.ts`) |
|---|---|---|---|
| Root | `root: '/'` | `<Navigate to="/executive" replace />` | None (redirects to `/executive`) |
| Executive | `executive: '/executive'` | `<ExecutiveDashboard />` | Clickable L1 link: `Executive` (`/executive`) |
| Portfolio (Reference) | `portfolio: '/portfolio'`, `portfolioDetail: '/portfolio/:id'`, `portfolioHoldings: '/portfolio/:id/holdings'`, `portfolioAllocation` / `portfolioRisk` / `portfolioHistory` | `<PortfolioWorkspace />` on `/portfolio`, `/portfolio/:id`, `/portfolio/:id/holdings`; `FeatureNotImplemented` on `/allocation`, `/risk`, `/history` | Clickable L1 link: `Portfolio` (`/portfolio`) |
| User Portfolios (`G-2`) | `userPortfolios: '/user-portfolios'`, `userPortfolioDetail: '/user-portfolios/:portfolioId'` | `<UserPortfolioList />`, `<UserPortfolioDetail />` | Clickable L1 link: `User Portfolios` (`/user-portfolios`) |
| Watchlists (`NP-09`) | `watchlists: '/watchlists'` | `<Watchlists />` | Clickable L1 link: `Watchlists` (`/watchlists`) |
| Collaboration (`NP-10`) | `collaboration: '/collaboration'` | `<Collaboration />` | Clickable L1 link: `Collaboration` (`/collaboration`) |
| Research (`NP-07` / `PKG-08` / `CV-53`) | `research: '/research'`, `companyResearch: '/research/company/:id'`, `sectorResearch: '/research/sector/:id'`, `sectorResearchDefault: '/research/sector/Banking'`, `macroResearch: '/research/macro'`, `crossSector: '/research/cross-sector'`, `engineRegistry: '/research/engines'` | `FeatureNotImplemented` on `/research`; `<CompanyIntelligence />`, `<SectorResearch />`, `<MacroResearch />`, `<CrossSectorIntelligence />`, `<EngineRegistry />` on child paths | Non-clickable group heading `Research` (`data-testid="nav-group-Research"`) + 4 clickable children: `Sector`, `Macro`, `Cross-Sector`, `Engines` |
| Intelligence | `intelligence: '/intelligence'`, `opportunities: '/intelligence/opportunities'`, `risks: '/intelligence/risks'`, `rankings: '/intelligence/rankings'`, `decisionMatrix: '/intelligence/decision-matrix'` | `FeatureNotImplemented` on `/intelligence`; `<Opportunities />`, `<Risks />`, `<Rankings />`, `<DecisionMatrix />` on child paths | Non-clickable group heading `Intelligence` (`data-testid="nav-group-Intelligence"`) + 4 clickable children: `Opportunities`, `Risks`, `Rankings`, `Decision Matrix` |
| Screener (`NP-12`) | `screener: '/screener'` | `<Screener />` | Clickable L1 link: `Screener` (`/screener`) |
| AI Explanation | `aiAdvisory: '/ai-advisory'` | `<AiAdvisory />` | Clickable L1 link: `AI Explanation` (`/ai-advisory`) |
| Evidence & Replay (`NP-13`) | `evidence: '/evidence'`, `evidenceDetail: '/evidence/:id'`, `snapshots: '/evidence/snapshots'`, `replay: '/evidence/replay/:id'`, `replayLanding: '/evidence/replay'` | `<EvidenceLanding />`, `<EvidenceExplorer />`, `<ReplayExplorer />`; `FeatureNotImplemented` on `/evidence/snapshots` & `/evidence/replay` | Clickable L1 link: `Evidence` (`/evidence`) |
| Settings (`NP-11`) | `settings: '/settings'` | `<Settings />` | Clickable L1 link: `Settings` (`/settings`) |
| Legacy unused constant / Catch-all | `admin: '/admin'` (unmounted constant retained per `REG-08`); `*` | `<FeatureNotImplemented surface="Page" />` (`data-testid="shell-feature-unavailable"`) | None (`Administration` absent; asserted by `App.test.tsx:96,164`) |

**Verified Reports UI baseline:**
- `routes.ts` has `26` keys and **`0`** `/reports` keys.
- `navigation.ts` has `11` top-level `NAV` items (`9` clickable top-level links + `2` group headings with `4` children each = `17` clickable sidebar links total) and **`0`** `Reports` items.
- `App.tsx` mounts **`0`** `/reports` routes; navigating to `/reports` or `/reports/:reportId` falls through to `<Route path="*" element={<FeatureNotImplemented surface="Page" />} />`.
- `frontend/src/api/` and `frontend/src/features/` contain **`0`** `reports` files. Historical branch `arena/01a0f1b3-iips-review-recovered@6a8afbb2bb73ca02d2b22e6f45e9f7d27a4a4b9b` likewise had **`0`** Reports UI files (`PROGRAM_v3.0_NP06_REPORTS_FINAL_QUALIFICATION.md` §1: `UI rendering: DEFERRED`, `Navigation integration: DEFERRED`).

---

### Q3. Which Reports backend endpoints are currently implemented and qualified, and what are their exact response contracts?

In `frontend/server/executive-transport.ts` (`a438eec0…`), `/api/reports` is registered in `OWNER_SCOPED_API_PREFIXES` (line `716`, enforcing C8: loopback bind `127.0.0.1:8787` and omission of `Access-Control-Allow-Origin: *`) and dispatched at lines `754`–`763` (`req.url === '/api/reports' || req.url?.startsWith('/api/reports/')` → `reports.handleReportsRequest(req, res)`). Vite (`frontend/vite.config.ts:18`) proxies `/api` to `http://localhost:8787` on loopback `127.0.0.1:5173`.

`frontend/server/reports-transport.ts` (`775d282b…`) implements **5 route patterns (6 HTTP operations)**, qualified across separate OS processes under `F-7`:

#### 3.1 Canonical Persisted Artifact Shape (`CanonicalReportArtifact` — `frontend/server/reports/artifact.ts:75-86`)

```ts
export interface CanonicalReportArtifact {
  readonly reportId: string;                              // Persistence-minted UUIDv4 instance ID
  readonly reportType: string;                            // e.g. 'Executive' | 'Portfolio Summary' | ...
  readonly schemaVersion: number;                         // Positive integer (currently 1)
  readonly generatedAt: string;                           // ISO-8601 UTC timestamp with explicit offset
  readonly reportKey: string;                             // Deterministic 64-hex SHA-256 content identity
  readonly canonicalPayload: {
    readonly reportType: string;
    readonly portfolioId: string;
    readonly generatedAt: string;
    readonly schemaVersion: number;
    readonly scenario: string | null;
    readonly parameters: Readonly<Record<string, string | number | boolean | null>>;
    readonly payload: unknown;                            // Verbatim frozen CSIP ReportingEngine payload
  };
  readonly provenance: {
    readonly engineOutputId: string;                      // `report-${reportType.toLowerCase().replace(/\s+/g,'-')}-${portfolioId}`
    readonly [key: string]: unknown;
  };
  readonly ownership: {
    readonly tenantId: string;                            // 'irr-reports-personal'
    readonly userId: string;                              // 'owner-irr-reports-personal'
  };
  readonly artifactVersion: number;                       // Contiguous 1-based version (1, 2, 3, ...)
  readonly supersedesReportId: string | null;             // null on v1; immediate parent UUIDv4 on v2+
}
```

#### 3.2 Exact Endpoint & Response Contract Matrix (`frontend/server/reports-transport.ts`)

| # | Route Pattern | Allowed Methods (`Allow` on `405`) | Store Needed? | Success Status & JSON Envelope (`HEAD` sends headers + empty body) |
|---|---|---|---|---|
| 1 | `/api/reports/context` | `GET, HEAD` | **No** (carrier only) | `200 OK` → `{ "data": { "surfaceName": "NP-06", "disposition": "ESTABLISHED", "tenantId": "irr-reports-personal", "ownerUserId": "owner-irr-reports-personal" } }` |
| 2 | `/api/reports/artifacts` (`?limit=<int>&cursor=<str>`) | `GET, HEAD, POST` | **Yes** (`IIPS_NP04_DATABASE_PATH`) | `GET`: `200 OK` → `{ "data": CanonicalReportArtifact[], "nextCursor": string \| null }` (returns **current head** artifacts only for the resolved owner).<br>`POST`: `201 Created` → `{ "data": CanonicalReportArtifact }` (`artifactVersion: 1`, `supersedesReportId: null`). |
| 3 | `/api/reports/artifacts/:reportId` | `GET, HEAD` | **Yes** | `200 OK` → `{ "data": CanonicalReportArtifact }` (resolves **any** owned version — current head or historical superseded — by durable UUIDv4 `reportId`). |
| 4 | `/api/reports/artifacts/:reportId/versions` | `POST` | **Yes** | `201 Created` → `{ "data": CanonicalReportArtifact }` (`artifactVersion: prior + 1`, `supersedesReportId: :reportId`). |
| 5 | `/api/reports/artifacts/:reportId/supersession` | `GET, HEAD` | **Yes** | `200 OK` → `{ "data": { "current": CanonicalReportArtifact, "history": CanonicalReportArtifact[] } }` (traceable from any owned version in the chain; `current` is the active head and `history` lists superseded versions `[v_{n-1}, ..., v_1]`). |

#### 3.3 Exact Error & Refusal Contract (`reports-transport.ts:124-305` & `executive-transport.ts:754-763`)

| Condition | HTTP Status | Response JSON Envelope |
|---|---|---|
| Unmatched subpath (including bare `/api/reports`, `/api/reports/`, trailing slash, >5 segments) | `404` | `{ "error": "not found" }` |
| Disallowed HTTP method on a matched route | `405` | `{ "error": "method-not-allowed" }` + `Allow: <methods>` |
| Missing, unreadable, git-resident, oversized, schema-invalid, or SHA-256-mismatched `IIPS_REPORTS_OWNER_PATH` carrier | `503` | `{ "error": "owner-context-unavailable", "detail": { "reason": "<closed-code>" } }` |
| Query string contains `tenantId`, `userId`, `owner`, `ownerUserId`, `authenticatedUser`, `principal`, `companyId`, or `runtimeCompanyId` | `400` | `{ "error": "client-supplied tenant or identity claims are prohibited" }` |
| `IIPS_NP04_DATABASE_PATH` unset or `PersistenceBoundaryError` when opening/querying NP-04 SQLite store | `503` | `{ "error": "persistence-unavailable", "reason": "<message>" }` |
| Request body > `65,536` bytes (`MAX_BODY_BYTES`) on `POST` | `413` | `{ "error": "request-body-too-large" }` |
| Malformed JSON or non-object body on `POST` | `400` | `{ "error": "invalid-json" }` |
| `POST` body contains prohibited identity/company keys (`FORBIDDEN_CLIENT_KEYS`) | `400` | `{ "error": "client-supplied tenant or identity claims are prohibited" }` |
| `POST` body contains top-level `reportId`, `artifactVersion`, `supersedesReportId`, `reportKey`, or `schemaVersion` (`FORBIDDEN_DURABLE_KEYS`) | `400` | `{ "error": "client-supplied durable identity fields are prohibited" }` |
| Unknown or foreign-owner `:reportId` on `GET .../artifacts/:reportId`, `GET .../supersession`, or `POST .../versions` | `404` | `{ "error": "report-not-found" }` (missing vs foreign owner indistinguishable) |
| Invalid `:reportId` format (e.g. `report-...` engine ID or non-UUIDv4) or invalid pagination cursor / composition validation (`ReportValidationError`) | `400` | `{ "error": "invalid-report-content" }` |
| `POST .../versions` targeting an already-superseded (non-head) `:reportId` | `409` | `{ "error": "report-already-superseded" }` |
| Unhandled exception in `handleReportsRequest` (including `CanonicalizationError` on `POST`) / mount-level catch in `executive-transport.ts:761` | `500` | `{ "error": "reports-transport-error" }` (or `{ "error": "reports transport error", "detail": "..." }` at mount catch) |

#### 3.4 Two Critical Source-Verified Nuances Affecting UI Design

1. **`/api/reports/context` (`200`) does NOT imply artifact persistence availability:** `reports-transport.ts:198-208` resolves `/api/reports/context` **before** `getPersistence()` (`line 211`). When `IIPS_REPORTS_OWNER_PATH` is valid and `IIPS_NP04_DATABASE_PATH` is unset, `GET /api/reports/context` returns `200` (`disposition: 'ESTABLISHED'`), while `GET /api/reports/artifacts` returns `503 persistence-unavailable`. Therefore, the UI **must** evaluate artifact availability from the artifact endpoint response itself, never assuming persistence readiness from `/api/reports/context` alone.
2. **Why `POST` artifact creation/append belongs outside minimum UI scope (`Option CV51-A`):** `POST /api/reports/artifacts` and `POST /api/reports/artifacts/:reportId/versions` require a caller-supplied `FrozenReportingEngineOutput` (`engineOutput: { reportId: "report-<type>-<portfolioId>", reportType, portfolioId, payload }`). Inspection of `frontend/server/executive-transport.ts` (`lines 250-550`) proves that although `computeCertifiedPlatform()` computes `csip.reports` internally, **no HTTP endpoint on `executive-transport.ts` exposes `csip.reports` (`FrozenReportingEngineOutput`)**. Constructing `engineOutput` in React would re-implement frozen CSIP `ReportingEngine.build()` client-side in violation of `NP-06 G11`/`R5` and `design-principles.md` §2; conversely, adding a server-side report-generation endpoint would expand backend scope and reopen `R2`/`F-7`. In addition, on `POST`, `FORBIDDEN_DURABLE_KEYS` rejects top-level `schemaVersion` (`400`) and `CanonicalizationError` falls through `mapPersistenceErrorStatus` (`line 124`) to `500`. Exposing the **four `GET` read endpoints** as a read-only inspection surface (`Option CV51-A`, matching `G-2` `UserPortfolioList`/`UserPortfolioDetail`) delivers 100% of `D8`'s four disclosure levels with **zero** backend changes and **zero** client-side analytical synthesis.

---

### Q4. What UI, routing, loading, empty, error, and retry behaviours are currently missing?

| Surface / Behaviour | Current State on `main` (`0cc999f…`) | Missing Capability Required for `CV-51` |
|---|---|---|
| Route constants & `<Route>` mounts | Absent (`routes.ts`, `App.tsx`); `/reports*` hits `*` → `FeatureNotImplemented` | `ROUTES.reports` (`'/reports'`), `ROUTES.reportDetail` (`'/reports/:reportId'`), and two mounted React route elements (`<ReportsWorkspace />`, `<ReportDetail />`). |
| Global L1 navigation entry | Absent (`navigation.ts`) | Top-level L1 `{ label: 'Reports', path: ROUTES.reports }` entry in `NAV`. |
| Typed credential-free client | Absent (`frontend/src/api/reports.ts`) | `noAuthFetch`-based read client (`fetchReportsContext`, `fetchReportArtifacts`, `fetchReportArtifact`, `fetchReportSupersession`) with runtime envelope guards and sanitized `ReportsApiError`. |
| Loading behaviour | None | `LoadingState` (`role="status"`, `aria-live="polite"`) on initial list/detail fetch plus non-destructive inline status (`Loading more…`) during cursor pagination and race-safe request cancellation when `:reportId` changes. |
| Empty-store behaviour | None | `EmptyState` (`data-testid="reports-empty"`) when `GET /api/reports/artifacts` returns `200 { data: [], nextCursor: null }`, explaining that persisted cross-sector reports appear once stored in the governed NP-04 boundary — never fabricating sample reports. |
| Cursor pagination | None | Explicit `Load more reports` `<button type="button">` when `nextCursor !== null`, appending the next page without duplicating `reportId`s and preserving already-loaded items if a subsequent page fetch fails. |
| 4-level progressive disclosure (`D8`) | None | Ordered rendering of **1. Summary**, **2. Detail**, **3. Evidence & Provenance**, and **4. Replay & Reference** on `/reports/:reportId`, including version-chain links between `current` head and superseded `history[]`. |
| Error, `503` unavailable, `404` not-found & `Retry` | None | Dedicated `ReportsStateView` mapping `503 owner-context-unavailable`, `503 persistence-unavailable`, `404 report-not-found`, `400`, `500`, `0` network, and malformed-envelope errors to sanitized non-leaking messages plus a keyboard-accessible `Retry` button (`data-testid="reports-retry"`). |

---

### Q5. How will single-user owner context be preserved through the server-owned carrier and resolver?

Single-user owner context is preserved end-to-end by **architectural omission of client identity** combined with **per-request server-side carrier verification**:

```text
Browser UI (/reports, /reports/:reportId)
  │  1. Uses noAuthFetch() → credentials: 'omit', strips any 'authorization' header
  │  2. Sends ONLY path (:reportId) and pagination query (?limit=&cursor=)
  │  3. Zero cookies, zero localStorage/sessionStorage, zero identity/tenant/company fields
  ▼
Vite Dev Proxy (127.0.0.1:5173) ──► Executive Transport (127.0.0.1:8787)
  │  4. C8 enforced: loopback bind, no Access-Control-Allow-Origin: * on /api/reports*
  ▼
handleReportsRequest (frontend/server/reports-transport.ts)
  │  5. Rejects any client identity/tenant/company query param with 400 Bad Request
  │  6. Calls resolveReportsOwnerContext() UN-CACHED on every HTTP request
  ▼
resolveReportsOwnerContext (frontend/server/reports-owner-resolver.ts)
  │  7. Reads IIPS_REPORTS_OWNER_PATH from local filesystem outside any Git worktree
  │  8. Verifies exact 384-byte length + SHA-256 b1b78809... + R1 literals
  │     ('irr-reports-personal', 'owner-irr-reports-personal'); else 503 fail-closed
  ▼
GovernedArtifactStore (iips-np04-governed-persistence#2e11fa3b.../persistence)
     9. Executes queryByOwner / resolveById / listSupersededBy strictly within
        ownerPair = { tenantId: 'irr-reports-personal', userId: 'owner-irr-reports-personal' }
```

**Strict UI non-disclosure rule (aligned with `F-3` Browser Acceptance Record §5):** Although `GET /api/reports/context` returns `{ tenantId, ownerUserId }` and `CanonicalReportArtifact.ownership` carries `{ tenantId, userId }`, the React client validates their structural presence in the envelope guard and **never renders raw internal partition strings (`irr-reports-personal`, `owner-irr-reports-personal`) in visible DOM text**, nor any user/tenant switcher. Level-1 Summary displays the governed posture read-only as `Single-owner governed partition (NP-06 · server-owned carrier)`.

---

### Q6. How should unknown owners, missing/tampered carrier, persistence failures, malformed inputs, and unavailable backend states be presented without leaking internals?

Inspection of `reports-transport.ts:159` and `executive-transport.ts:761` identified two places where raw server strings (`reason: error.message` on `PersistenceBoundaryError` and `detail: String(e)` on mount-level `500`) can appear on the wire. To guarantee **zero leakage** of filesystem paths (`IIPS_REPORTS_OWNER_PATH`, `IIPS_NP04_DATABASE_PATH`), SQLite driver internals, or stack traces without modifying accepted backend files, `frontend/src/api/reports.ts` enforces a **closed client failure vocabulary (`ReportsFailureKind`)**:

| Failure Scenario | Wire HTTP Status & Body | Client `ReportsFailureKind` | Sanitized User-Facing UI Presentation (Zero Raw `detail`/`reason` Echo) |
|---|---|---|---|
| **Unknown or foreign-owner `reportId`** | `404` `{ error: "report-not-found" }` | `'not-found'` | `ReportNotFoundState` (`role="alert"`, `data-testid="reports-not-found"`): *"Report not found. No governed report artifact is available for this identifier. Missing and non-owned identifiers are indistinguishable by design."* + link to `/reports`. |
| **Missing, unreadable, git-resident, or byte-tampered `IIPS_REPORTS_OWNER_PATH` carrier** | `503` `{ error: "owner-context-unavailable", detail: { reason } }` | `'owner-context-unavailable'` | `UnavailableState` (`reason="Reports owner context unavailable"`, `data-testid="reports-unavailable-owner"`): *"Reports are unavailable because the server-owned Reports owner context carrier is not established or failed integrity verification. No report data was read or fabricated."* + `Retry` button. |
| **Unset `IIPS_NP04_DATABASE_PATH` or NP-04 SQLite open/query error** | `503` `{ error: "persistence-unavailable", reason: "..." }` | `'persistence-unavailable'` | `UnavailableState` (`reason="Reports persistence store unavailable"`, `data-testid="reports-unavailable-persistence"`): *"Reports are unavailable because the governed NP-04 persistence store is not configured or reachable on the server. No report data was read or fabricated."* (`body.reason` deliberately discarded) + `Retry` button. |
| **Other `503` upstream/service unavailability** | `503` (any other/unparseable body) | `'service-unavailable'` | `UnavailableState` (`reason="Reports service unavailable"`): *"The governed Reports boundary is temporarily unavailable (HTTP 503)."* + `Retry` button. |
| **Malformed `:reportId` (non-UUIDv4 / `report-*` engine ID), invalid cursor, or prohibited query parameter** | `400` `{ error: "invalid-report-content" \| "client-supplied..." }` | `'invalid-request'` | `ErrorState` (`role="alert"`, `data-testid="reports-error"`): *"Invalid report request (HTTP 400). Verify the report identifier or return to the Reports list."* + link to `/reports`. |
| **Unexpected route mismatch / disallowed method** | `404` `{ error: "not found" }` / `405` | `'transport-error'` | `ErrorState`: *"Reports transport rejected the request (HTTP 404/405)."* + `Retry` button. |
| **Server/mount internal exception** | `500` `{ error: "reports-transport-error" }` or mount `{ detail }` | `'transport-error'` | `ErrorState`: *"Reports service encountered an internal transport error (HTTP 500). No partial or synthetic report values are shown."* (`body.detail` deliberately discarded) + `Retry` button. |
| **Backend process stopped / Vite proxy `502`/`504` / `fetch` network error** | Network throw (`status = 0`) or `502`/`504` | `'network-unavailable'` | `UnavailableState` (`reason="Reports transport unreachable"`): *"Unable to reach the local Reports transport. Ensure the server is running on loopback and retry."* + `Retry` button. |
| **Non-JSON `200` body or schema-violating envelope** | `200` with missing/malformed `data` fields | `'invalid-envelope'` | `UnavailableState` (`reason="Reports response invalid"`): *"The Reports transport returned an unreadable response envelope. Display failed closed without fabricating values."* + `Retry` button. |

---

### Q7. What is the minimum-scope route and navigation placement consistent with current app structure?

1. **Top-Level L1 Placement (`NP-06 D8` / `§5.6`):** `IIPS_v3.0_NP06_REPORTS_GOVERNANCE_DECISIONS.md` `D8` explicitly mandates that **Reports is the seventh L1 product section**, a sibling of — and never nested inside — existing L1 sections.
2. **Exact Routes (`routes.ts` & `App.tsx`):**
   - `ROUTES.reports = '/reports'` → mounts `<ReportsWorkspace />` (list of current-head owner-scoped reports + governed posture banner + cursor pagination).
   - `ROUTES.reportDetail = '/reports/:reportId'` → mounts `<ReportDetail />` (durable version-specific artifact & supersession inspector with `D8` Levels 1–4).
   - Following `User Portfolios` (`/user-portfolios` + `/user-portfolios/:portfolioId`) and `Evidence` (`/evidence` + `/evidence/:id`), only the concrete landing path `/reports` is placed in global navigation; `/reports/:reportId` is reached via row links, supersession-chain version links, and direct deep-linking, preserving `App.test.tsx:120-128` (`!href.includes(':')`).
3. **Exact Sidebar Placement (`navigation.ts`):**
   - Insert `{ label: 'Reports', path: ROUTES.reports }` as a top-level `NavItem` immediately **after `Evidence` and before `Settings`** (`Executive` → `Portfolio` → `User Portfolios` → `Watchlists` → `Collaboration` → `Research` → `Intelligence` → `Screener` → `AI Explanation` → `Evidence` → **`Reports`** → `Settings`).
   - Rationale: Keeps institutional output/inspection surfaces (`AI Explanation`, `Evidence`, `Reports`) adjacent while preserving `Settings` in its established terminal slot at the bottom of the sidebar. Because `Sidebar.tsx` (`0d1e9bad…`) sets `end={item.path === '/'}` on `<NavLink>`, both `/reports` and `/reports/:reportId` automatically mark `Reports` active (`aria-current="page"` on `/reports` and active styling across `/reports/*`).

---

### Q8. What accessibility and responsive behavior requirements apply?

Per `docs/v3.0/design-principles.md` (§6, §8), `docs/v3.0/design-system.md` (§5, §7), `frontend/src/core/theme/global.css`, and `frontend/src/app/AppShell.css`:

1. **Semantic Landmarks & Heading Hierarchy:**
   - Operates inside `AppShell`'s existing `<a href="#main-content">Skip to main content</a>` and `<main id="main-content">`.
   - Exactly one `<h1>` per route (`Reports` on `/reports`; `Report — {artifact.reportType}` on `/reports/:reportId`), followed by `<h2>` headings for the four `D8` disclosure sections (`Summary`, `Detail`, `Evidence & Provenance`, `Replay & Reference`), each wrapped in `<section aria-labelledby="...">`.
2. **Keyboard Operability & Focus Management:**
   - Every interactive element is a native `<Link>` (`<a>`) or `<button type="button">` — zero clickable `<div>`/`<span>` rows.
   - Global `:focus-visible` (`2px solid var(--color-focus)`, `outline-offset: 2px`) in `global.css` remains active and unobstructed.
   - Logical Tab sequence: `Skip link → Sidebar nav → Breadcrumb ("← Back to Reports") → Retry/Pagination buttons → Artifact/Supersession links`.
3. **Live Regions, Tables & Non-Color-Only Status:**
   - Loading uses `role="status" aria-live="polite"`; errors and `404` use `role="alert"`.
   - All tabular data uses `<table>`, `<thead>`, `<th scope="col">`, and `<tbody>`.
   - Lifecycle and authority indicators use `PlatformBadge` (`◇ PLATFORM`) and `StatusBadge` (`✓ CURRENT HEAD` vs `i SUPERSEDED`) from `Badges.tsx` — pairing symbol + uppercase label + semantic CSS token (`var(--color-*)`), never color alone and never misapplying `CERTIFIED RESULT` to platform lifecycle metadata (`design-principles.md` §3).
   - Respects `@media (prefers-reduced-motion: reduce)` via `global.css` (zero custom animations required).
4. **Responsive Layout (`1280×800`, `768×1024`, `375×812`, `320px` floor):**
   - `AppShell.tsx` currently hardcodes a `220px 1fr` grid except when `.app-shell--macro` is applied (`AppShell.tsx:16`, `AppShell.css:6-26`). Applying the same scoped responsive modifier (`.app-shell--reports` when `pathname === '/reports' || pathname.startsWith('/reports/')`) compresses the shell grid to `minmax(100px, 28vw) minmax(0, 1fr)` at `≤640px` and `12px` main padding at `≤320px`, leaving all unrelated surfaces untouched.
   - Tables wrap in `<div style={{ overflowX: 'auto', maxWidth: '100%' }}>`; summary cards use `gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'`; 64-character `reportKey` hex digests and UUIDv4 `reportId`s render with `overflowWrap: 'anywhere'` so narrow screens never suffer horizontal page overflow.

---

### Q9. What automated tests and browser-level checks are required before `CV-51` can be accepted?

1. **Automated Unit, Component & Shell Regression Tests (`vitest`):**
   - **`frontend/src/api/reports.test.ts` (new, ~14 tests):** Verifies `noAuthFetch` invocation (`credentials: 'omit'`, `authorization` header stripped), URL path segment encoding (`encodeURIComponent`), `limit`/`cursor` query building, strict envelope validation (`200` with missing/corrupt fields fails closed as `'invalid-envelope'`), all failure-kind mappings (`400`, `404`, `500` stripping `detail`, `503 owner-context-unavailable`, `503 persistence-unavailable` stripping `reason`, network error `status = 0`), and absence of prohibited client keys (`tenantId`, `userId`, `ownerUserId`, `companyId`, `runtimeCompanyId`).
   - **`frontend/src/features/reports/Reports.test.tsx` (new, ~18 tests):** Verifies loading, `200` empty state, populated head list, `nextCursor` pagination + error preservation, click navigation from `/reports` to `/reports/:reportId`, exact DOM order and content of all 4 `D8` disclosure levels (`Summary`, `Detail`, `Evidence & Provenance`, `Replay & Reference`), `null` payload fields rendered as `unavailable`/`—` (never `0`), `CURRENT HEAD` vs `SUPERSEDED` rendering + version switching with race-safe stale-response cancellation, absence of raw `irr-reports-personal` / `owner-irr-reports-personal` strings in DOM text, sanitized `503`/`404`/`500` states, `Retry` recovery, heading hierarchy, and keyboard Tab/Enter interaction.
   - **`frontend/src/app/App.test.tsx` (bounded update, +3 tests):** Verifies `Reports` appears in roleless sidebar navigation (`href="/reports"`), passes the universal clickable-nav loop (no `shell-feature-unavailable`, no `:` in `href`), and resolves `/reports` and `/reports/:reportId` deep links without credentials or `Authorization` headers while keeping `/admin` and unmatched routes fail-closed.
   - **CI & Build Gates:** `npm run typecheck`, `npm run typecheck:replay-server`, `npm run test:ci` (all existing suites + new Reports UI suites + `assert-tests` guard), and `npm run build` (`tsc -b && vite build`).
2. **Real-Browser Loopback Runtime Qualification (Playwright / Headless Chromium over `127.0.0.1:5173` → `127.0.0.1:8787`):**
   - **`B-1` Carrier-absent `503`:** Start server with `IIPS_REPORTS_OWNER_PATH` unset → navigate to `/reports` and `/reports/<uuid>` → verify sanitized `owner-context-unavailable` state, `Retry` button, `0` console/page errors, `0` auth prompts.
   - **`B-2` Persistence-absent `503`:** Start server with valid `IIPS_REPORTS_OWNER_PATH` (outside Git tree) and `IIPS_NP04_DATABASE_PATH` unset → navigate to `/reports` → verify sanitized `persistence-unavailable` state (confirming `/api/reports/context` `200` does not mask artifact `503` and no SQLite/path string leaks).
   - **`B-3` Configured empty store (`200`):** Start server with valid carrier + fresh SQLite DB path outside Git tree → click `Reports` in sidebar → verify `200` empty state (`data: []`).
   - **`B-4` Configured populated & superseded chain (`v1 → v2`):** Seed `v1` and append `v2` via real CSIP `ReportingEngine` output against loopback `POST /api/reports/artifacts*` → reload `/reports` → verify head list shows `v2` (and omits `v1`); click `v2` → verify all 4 `D8` disclosure levels on `/reports/<v2-id>`; click predecessor `v1` in Evidence/Replay section → verify `/reports/<v1-id>` shows `SUPERSEDED` status and working link back to `v2`; inspect browser network log (`0` `Authorization` headers, `0` cookies, `0` client identity/company params) and DOM text (`0` occurrences of `irr-reports-personal` or `owner-irr-reports-personal`).
   - **`B-5` Indistinguishable `404`:** Open `/reports/00000000-0000-4000-8000-000000000099` → verify `ReportNotFoundState`.
   - **`B-6` Keyboard & responsive check:** Verify keyboard Tab/Enter navigation (`Skip to main content`, sidebar link, row link, version link, `Retry`) and measure `document.documentElement.scrollWidth <= window.innerWidth` at `1280×800` and `375×812`.

---

### Q10. What acceptance evidence is required to close `CV-51` cleanly?

Closing `CV-51` in the master tracker requires **nine durable evidence items (`E-CV51-01` through `E-CV51-09`)** on `ramkivs/iips-review-recovered` `refs/heads/main`:

1. **`E-CV51-01` — Effective PA Implementation Authority Act:** PA approval/publication of `IIPS-V3-REPORTS-NP06-CV51-UI-EXPOSURE-PA-DECISION-ACT-2026-10-25-01` on `origin/main` prior to merging any route/nav/UI exposure.
2. **`E-CV51-02` — Bounded Diff Proof:** Merged PR diff touching **only** the authorized frontend/test/doc/tracker paths (`0` edits to `frontend/server/**`, `iips-platform/**`, `frontend/package.json`, `frontend/package-lock.json`, and `0` IPD writes).
3. **`E-CV51-03` — Automated Suite & Build Transcript:** Exact executed counts for `reports.test.ts`, `Reports.test.tsx`, `App.test.tsx`, full `npm run test:ci` + guard `OK`, `npm run typecheck` (`0`), `npm run typecheck:replay-server` (`0`), and `npm run build` (`0` + bundle size).
4. **`E-CV51-04` — Real-Browser Loopback Qualification Record:** Committed integration record under `docs/integration/` recording `B-1` through `B-6` HTTP statuses, DOM assertions, network-header/query inspection, keyboard traversal, and `1280×800` + `375×812` viewport measurements.
5. **`E-CV51-05` — Non-Disclosure & Prohibited-Field Proof:** Source and runtime verification that `tenantId`, `userId`, `ownerUserId`, `companyId`, and `runtimeCompanyId` are never sent by the client and raw partition literals never appear in rendered DOM text.
6. **`E-CV51-06` — Hosted GitHub Actions CI Verification:** Green PR-head CI run and green post-merge `main` push CI run IDs recorded from GitHub.
7. **`E-CV51-07` — Independent Remote Read-Back Receipt (`§16.70.13`):** Post-merge receipt verifying `origin/main` commit SHA, root tree SHA, and per-file Git blob SHAs + byte lengths via GitHub API / `git ls-remote`.
8. **`E-CV51-08` — Explicit PA Product-Surface Acceptance Decision:** PA acceptance of the qualified `CV-51` surface (either as a dedicated post-qualification PA acceptance record following `CV-53` PR #104 / `PKG-08 Row 4` PR #161, or under express acceptance terms stated by PA).
9. **`E-CV51-09` — Reconciled Master Tracker Counts:** Only upon `E-CV51-08`, update `§16.4.4 CV-51` (`BLOCKED` → `COMPLETE / ACCEPTED — bounded non-production read-only Reports UI`), `§16.12` (`complete/accepted 17 → 18`, `blocked-active 2 → 1`, `active outstanding 6 → 5`, total `35` unchanged), `§18.1` row 37 (`NI → V`), and `§19` Reports row.

---

### Q11. Are there any genuine dependencies on other open items, or are remaining questions separate authority boundaries?

| Item / Boundary | Classification | Evidence-Backed Determination |
|---|---|---|
| `CV-21` / Commissioning / `R1` / `R2` / `R3` / `R4` / `F-7` | **ALREADY SATISFIED (Closed / Operative)** | Discharged on `main` (`§14`, `§16.106`–`§16.112`, PRs `#81`, `#253`–`#264`). Must **not** be reopened. |
| **Separate PA `CV-51` Implementation Authority Act** | **GENUINE IMMEDIATE GATE (Governance Only)** | Sole blocker before `CV-51` UI/route implementation may begin. Prepared in companion act `IIPS-V3-REPORTS-NP06-CV51-UI-EXPOSURE-PA-DECISION-ACT-2026-10-25-01`. |
| **Post-Implementation Browser Qualification & PA Acceptance** | **GENUINE DOWNSTREAM GATE (Execution + Acceptance)** | Required after implementation before `CV-51` closes in `§16.4.4` / `§16.12`. |
| **Zero Technical / Backend Blockers** | **NONE** | All 4 `GET` endpoints, carrier/resolver, NP-04 adapter, loopback proxy, and design-system primitives exist and pass on `main@0cc999f…`. |
| Browser-initiated report generation / version mutation (`POST` UI) | **SEPARATE AUTHORITY BOUNDARY (Not a `CV-51` blocker)** | Would require exposing or server-invoking `ReportingEngine` over a new/widened backend contract; excluded from minimum scope (`Option CV51-A`). |
| Sector-level reporting (`NP-06 R4`) & PDF/CSV exports (`NP-06 R5`) | **SEPARATE DEFERRED SCOPE** | Deferred by `IIPS_v3.0_NP06_REPORTS_GOVERNANCE_DECISIONS.md` `R4` and `R5`. |
| Durable HTTP access-audit subsystem (`R2` `C-7` / `A-2`) | **SEPARATE PRODUCTION GATE** | Expressly deferred to production-admission governance by `R2` §1.5. |
| `D115` / `CV-43` runtime `companyId` wiring | **UNRELATED & PROHIBITED IN REPORTS** | Closed as `RETAINED UNWIRED` (`§16.103`); `reports-transport.ts` explicitly rejects `companyId` / `runtimeCompanyId` (`400`). |
| User Portfolios (`CV-20` / `CV-39` / `CV-52`) & `CV-24` (`F6`/`TD-7b`) | **INDEPENDENT WORKSTREAMS** | `G-2` §8 and tracker `§16.4.4` / `§20` Stage 6 confirm Reports has zero dependency on User Portfolios or Class-C journal `TD-7b`. |
| Production admission / multi-user / RBAC / authentication | **SEPARATE / OUT OF SCOPE** | `NOT ADMITTED` (divergent `2e11fa3b…` non-production lineage; `H-18` single-user no-auth architecture). |

---

## 3. Options Analysis and Recommended Program Authority Decision

| Option | Summary | Backend / Contract Impact | Alignment with `D8`, `R1`–`R5`, `G11`, `H-18` | Recommendation |
|---|---|---|---|---|
| **`Option CV51-A` — Authorize Bounded Minimum-Scope Read-Only Reports UI & Route Exposure** | Mount `/reports` and `/reports/:reportId`, add L1 `Reports` sidebar link, implement `noAuthFetch` read client (`GET /context`, `GET /artifacts`, `GET /artifacts/:reportId`, `GET /artifacts/:reportId/supersession`), render all 4 `D8` disclosure levels, sanitized `503`/`404`/error states, keyboard/WCAG AA/responsive support, automated + Chromium loopback tests; keep backend/engines/IPD untouched. | **Zero backend changes** (`0` server/engine/manifest edits; `R1`/`R2`/`R3`/`F-7` preserved byte-identical). | **100% aligned.** Matches `G-2` read-only UI consumer, `CV-53`, and `PKG-08 Row 4` precedents; avoids client-side `ReportingEngine` synthesis (`G11`/`R5`). | **RECOMMENDED** |
| **`Option CV51-B` — Authorize Read + Write/Generate Reports UI (`POST` Create & Append)** | Everything in `CV51-A` plus browser forms/buttons calling `POST /api/reports/artifacts` and `POST /api/reports/artifacts/:reportId/versions`. | **Requires backend expansion or violates `G11`:** either React fabricates `FrozenReportingEngineOutput` client-side (prohibited) or `executive-transport`/`reports-transport` must add server-side CSIP report composition and `CanonicalizationError` `400` mapping, reopening `R2`/`F-7`. | **Exceeds `CV-51` boundary** and reopens settled backend qualification without necessity. | **NOT RECOMMENDED** |
| **`Option CV51-C` — Retain `CV-51` Block / Defer UI Exposure** | Keep `/reports` unmounted (`FeatureNotImplemented`) and `NAV` unchanged even though `R1`, `R2`, `R3`, and `F-7` backend capability acceptance are complete. | Zero code changes; leaves accepted non-production NP-06 backend unreachable from the product UI. | Permissible if PA wishes to pause NP-06 at API-only level, but leaves `CV-51` open on `§16.4.4`. | **FALLBACK ONLY (If PA Defers UI)** |

**Recommended PA Decision:** Approve **`Option CV51-A`** by adopting the companion proposed PA Decision Act (`IIPS-V3-REPORTS-NP06-CV51-UI-EXPOSURE-PA-DECISION-ACT-2026-10-25-01`), authorizing bounded non-production read-only Reports UI and route exposure subject to automated + real-browser loopback qualification and explicit post-qualification PA acceptance.

---

## 4. Concrete Minimum-Scope Implementation Proposal (`Option CV51-A`)

*Note: No code below is implemented or active in this pass. Every path, contract, state, and test below specifies the exact bounded work to execute **only after** `IIPS-V3-REPORTS-NP06-CV51-UI-EXPOSURE-PA-DECISION-ACT-2026-10-25-01` becomes effective.*

### 4.1 Route Paths, Registration & Responsive Shell Hook

1. **`frontend/src/app/routes.ts`:** Add two route constants:
   ```ts
   reports: '/reports',
   reportDetail: '/reports/:reportId',
   ```
2. **`frontend/src/app/App.tsx`:** Import `ReportsWorkspace` and `ReportDetail` and mount two routes before `<Route path="*" ... />`:
   ```tsx
   <Route path="/reports" element={<ReportsWorkspace />} />
   <Route path="/reports/:reportId" element={<ReportDetail />} />
   ```
3. **`frontend/src/app/AppShell.tsx` & `frontend/src/app/AppShell.css`:** Extend narrow-viewport shell class logic (`isReportsView = pathname === '/reports' || pathname.startsWith('/reports/')` → `app-shell--reports`) alongside `.app-shell--macro` so `≤640px` and `≤320px` viewports apply the proven `minmax(100px, 28vw) minmax(0, 1fr)` grid without affecting any other route.

### 4.2 Navigation Entry & Exact Sidebar Placement

In **`frontend/src/app/navigation.ts`**, add exactly one top-level L1 `NavItem` between `Evidence` and `Settings`:
```ts
  { label: 'AI Explanation', path: ROUTES.aiAdvisory },
  { label: 'Evidence', path: ROUTES.evidence },
  { label: 'Reports', path: ROUTES.reports },
  { label: 'Settings', path: ROUTES.settings },
```
- `label`: `'Reports'`
- `path`: `'/reports'` (concrete, non-parameterized, resolves to `<ReportsWorkspace />`, never `FeatureNotImplemented`).

### 4.3 Complete File Manifest (Strict Scope Ceiling)

| Path | Action | Responsibility |
|---|---|---|
| `frontend/src/api/reports.ts` | **CREATE** | Typed read-only DTO mirrors, envelope validators, `noAuthFetch` calls for the 4 `GET` endpoints, and closed-vocabulary `ReportsApiError`. |
| `frontend/src/api/reports.test.ts` | **CREATE** | Unit tests for URL encoding, `noAuthFetch` credential omission, envelope validation, prohibited-key absence, and sanitized error mapping. |
| `frontend/src/features/reports/ReportsStates.tsx` | **CREATE** | Sanitized `ReportsStateView` (`503` owner/persistence/network unavailable, `404` indistinguishable not-found, `400`/`500`/envelope errors + `Retry` button) and read-only format helpers (`shortDigest`, `formatCanonicalValue`). |
| `frontend/src/features/reports/ReportsWorkspace.tsx` | **CREATE** | L1 `/reports` landing view: governed posture header, `GET /api/reports/context` + `GET /api/reports/artifacts` orchestration, empty/loading/error states, current-head `DataTable`, and `nextCursor` pagination. |
| `frontend/src/features/reports/ReportDetail.tsx` | **CREATE** | `/reports/:reportId` durable inspector: race-safe parallel `GET /artifacts/:reportId` + `GET /artifacts/:reportId/supersession`, rendering `D8` Levels 1–4 (`Summary`, `Detail`, `Evidence & Provenance`, `Replay & Reference`) and chain links. |
| `frontend/src/features/reports/Reports.test.tsx` | **CREATE** | Component + `MemoryRouter` suite covering all states, all 4 `D8` levels, pagination, supersession navigation, non-disclosure of partition IDs, keyboard a11y, and error sanitization. |
| `frontend/src/app/routes.ts` | **MODIFY** | Add `reports` and `reportDetail` constants only. |
| `frontend/src/app/navigation.ts` | **MODIFY** | Add `{ label: 'Reports', path: ROUTES.reports }` between `Evidence` and `Settings`. |
| `frontend/src/app/App.tsx` | **MODIFY** | Mount `<ReportsWorkspace />` and `<ReportDetail />` routes. |
| `frontend/src/app/AppShell.tsx` | **MODIFY** | Add `app-shell--reports` narrow-screen modifier class when `/reports*` is active. |
| `frontend/src/app/AppShell.css` | **MODIFY** | Share narrow-screen (`≤640px` / `≤320px`) grid rules with `.app-shell--reports`. |
| `frontend/src/app/App.test.tsx` | **MODIFY** | Add `Reports` nav assertion and `/reports` + `/reports/:reportId` credential-free deep-link tests. |

**Explicitly untouched (`0` diff bytes permitted):** `frontend/server/**`, `iips-platform/**`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/vite.config.ts`, `.github/workflows/ci.yml`, and the entire IPD repository.

### 4.4 Endpoint-to-UI Mapping and Request/Response Handling

| Client Function (`src/api/reports.ts`) | HTTP Request (`noAuthFetch`) | Consuming View | Response Handling & Fail-Closed Guard |
|---|---|---|---|
| `fetchReportsContext(baseUrl?)` | `GET /api/reports/context` | `ReportsWorkspace` (optional diagnostic check alongside `fetchReportArtifacts`; never overrides an artifact `503`) | Validates `data.surfaceName === 'NP-06'` and `data.disposition === 'ESTABLISHED'`; strips `tenantId`/`ownerUserId` before returning `{ surfaceName: 'NP-06', disposition: 'ESTABLISHED' }` to components so raw partition strings cannot be rendered accidentally! |
| `fetchReportArtifacts({ limit = 25, cursor }, baseUrl?)` | `GET /api/reports/artifacts?limit=25[&cursor=...]` | `ReportsWorkspace` | Validates `Array.isArray(body.data)` (every item passing `isCanonicalReportArtifact`) and `typeof body.nextCursor === 'string' \|\| body.nextCursor === null`; strips `ownership` raw strings into `{ scope: 'ESTABLISHED_SINGLE_OWNER' }`; throws `ReportsApiError('invalid-envelope')` on any schema mismatch. |
| `fetchReportArtifact(reportId, baseUrl?)` | `GET /api/reports/artifacts/${encodeURIComponent(reportId)}` | `ReportDetail` | Pre-validates non-empty `reportId`; encodes as single path segment; validates `isCanonicalReportArtifact(body.data)`. |
| `fetchReportSupersession(reportId, baseUrl?)` | `GET /api/reports/artifacts/${encodeURIComponent(reportId)}/supersession` | `ReportDetail` | Validates `isCanonicalReportArtifact(body.data?.current)` and `Array.isArray(body.data?.history)` where every item passes `isCanonicalReportArtifact`. |

*Architectural defense-in-depth highlight:* By stripping `tenantId` / `ownerUserId` / `ownership.userId` inside `frontend/src/api/reports.ts` after validating that they are non-empty strings on the wire, React view components receive a sanitized `ReportArtifactView` type that **does not even carry raw partition ID strings in memory**, making accidental DOM rendering structurally impossible!

### 4.5 UI State Matrix & Progressive-Disclosure Mapping

#### A. `/reports` (`ReportsWorkspace`) State Matrix

| State | Trigger | Rendered UI (`data-testid`) | Available User Actions |
|---|---|---|---|
| **Initial Loading** | Mount or full `Retry` while `items === null` | `<LoadingState />` (`state-loading`, `role="status"`) | Sidebar navigation |
| **Owner Context Unavailable (`503`)** | `ReportsApiError.kind === 'owner-context-unavailable'` | `<ReportsStateView />` (`reports-unavailable-owner`) | `Retry` (`reports-retry`) |
| **Persistence Unavailable (`503`)** | `ReportsApiError.kind === 'persistence-unavailable'` | `<ReportsStateView />` (`reports-unavailable-persistence`) | `Retry` (`reports-retry`) |
| **Network / Transport / Envelope Failure** | `kind` in `network-unavailable`, `service-unavailable`, `transport-error`, `invalid-envelope`, `invalid-request` | `<ReportsStateView />` (`reports-error` or `reports-unavailable`) | `Retry` (`reports-retry`) |
| **Empty (`200`, `0` items)** | `items.length === 0 && nextCursor === null` | Header + governed scope notice + `<EmptyState label="No governed reports have been persisted yet." />` (`reports-empty`) | `Refresh` (`reports-refresh`) |
| **Populated Head List (`200`, `≥1` items)** | `items.length > 0` | `DataTable` (`reports-head-table`) with columns: `Report Type` (link to `/reports/:reportId`), `Portfolio ID` (`canonicalPayload.portfolioId`), `Scenario` (`canonicalPayload.scenario ?? '—'`), `Version` (`v{artifactVersion}`), `Generated At` (`generatedAt`), `Status` (`StatusBadge` `✓ CURRENT HEAD`), `Report Key` (`shortDigest(reportKey)`) | Click report link → `/reports/:reportId`; `Load more reports` (`reports-load-more`) if `nextCursor !== null`; `Refresh` |
| **Pagination Error (partial list loaded)** | `loadMore()` fails after page 1 succeeded | Existing `DataTable` rows preserved + inline `role="alert"` banner (`reports-pagination-error`) | `Retry load more` (`reports-load-more`) |

#### B. `/reports/:reportId` (`ReportDetail`) — Exact `D8` / `§5.6` Progressive Disclosure Levels

When both `fetchReportArtifact(reportId)` and `fetchReportSupersession(reportId)` resolve `200`, `ReportDetail` renders four `<section>` landmarks in exact `§5.6` order:

1. **Level 1 — Summary (`data-testid="report-section-summary"`):**
   - Header with `<h1>Report — {artifact.reportType}</h1>`, `PlatformBadge` (`◇ PLATFORM`), and lifecycle `StatusBadge`:
     - If `supersession.current.reportId === artifact.reportId`: `StatusBadge` (`status="positive"`, `label="CURRENT HEAD"`).
     - Else: `StatusBadge` (`status="informational"`, `label="SUPERSEDED"`) + banner linking directly to `/reports/${supersession.current.reportId}` (`v${supersession.current.artifactVersion}`).
   - Definition list (`<dl>`) of governed summary fields: `Report Type` (`reportType`), `Generated At (UTC)` (`generatedAt`), `Artifact Version` (`v${artifactVersion}`), `Canonical Schema` (`v${schemaVersion}`), `Portfolio ID` (`canonicalPayload.portfolioId`), and `Ownership Scope` (`Single-owner governed partition (NP-06 · server-owned carrier)`).
2. **Level 2 — Detail (`data-testid="report-section-detail"`):**
   - Displays `Scenario` (`canonicalPayload.scenario ?? 'unavailable'`) and `Parameters` (`canonicalPayload.parameters` key-value table, or `'No parameters recorded'` when `{}`).
   - Renders `canonicalPayload.payload` **verbatim without client recomputation**: structured scalar summary metrics (`concentration`, `diversificationScore`, `diversificationBand`, `avgConviction`, `avgQuality`, `avgRisk`, `opportunityRationale` when present as numbers/strings, `null` → `'unavailable'`) + structured tables for array/record members (`sectorExposure`, `ranking`, `allocationRecommendation`, `topOpportunities`, `diversificationFlags`, `correlationFlags`) + collapsible `<details>` raw canonical JSON inspector (`JSON.stringify(canonicalPayload, null, 2)`) so any valid canonical cross-sector report payload is 100% inspectable without schema assumptions or value transformation.
3. **Level 3 — Evidence & Provenance (`data-testid="report-section-provenance"`):**
   - Renders `Originating CSIP Engine Output ID` (`provenance.engineOutputId`, monospace), any additional recorded `provenance` entries, full deterministic `reportKey` (`<code>` with `overflowWrap: 'anywhere'`), `Immediate Predecessor` (`supersedesReportId` linked to `/reports/${supersedesReportId}`, or `'None (initial v1 instance)'`), and a **Supersession Lineage Table** combining `supersession.current` + `supersession.history` ordered newest-to-oldest (`Version`, `Report ID`, `Generated At`, `Report Key`, `Lifecycle Role`).
4. **Level 4 — Replay & Reference (`data-testid="report-section-reference"`):**
   - Displays durable addressing handles: `Instance Handle (reportId)` + `Version Handle (artifactVersion)` + canonical route `/reports/${artifact.reportId}`.
   - Provides direct router `<Link>` controls to switch between historical versions and the current head (`supersession.current.reportId`), using a monotonic `generation` counter `useRef` (mirroring `ReplayExplorer.tsx:20-35`) so rapid clicks across versions never display stale out-of-order responses.
   - Displays explicit governed scope note: *"Replay & reference on NP-06 addresses persisted canonical report versions by durable `(reportId, artifactVersion)` in the governed NP-04 store. It does not re-execute sector/CSIP engines or generate PDF/CSV file exports."*

### 4.6 Owner-Context Preservation & Prohibited Client Fields

- **Network primitive:** Only `noAuthFetch` (`frontend/src/core/network/noAuthFetch.ts`) may be called. Direct `window.fetch` is prohibited in `src/api/reports.ts`.
- **Prohibited client keys (compile-time + test-asserted):** The UI and `src/api/reports.ts` never construct or send `tenantId`, `tenant`, `userId`, `user`, `owner`, `ownerUserId`, `ownership`, `authenticatedUser`, `principal`, `roles`, `role`, `companyId`, `runtimeCompanyId`, `reportKey`, `artifactVersion`, `supersedesReportId`, or `schemaVersion`.
- **Zero browser storage:** Zero calls to `localStorage`, `sessionStorage`, `IndexedDB`, or `document.cookie`.

### 4.7 `R2`-Preserving Error Mapping

`frontend/src/api/reports.ts` parses error JSON inside a `try/catch` purely to inspect `body.error === 'owner-context-unavailable' | 'persistence-unavailable' | 'report-not-found' | 'invalid-report-content'` and **discards `body.detail` and `body.reason`**. All user-visible strings come from the fixed closed table in **Q6**, preserving `R2` `C-2` (`503 owner-context-unavailable`), `C-8` (`503 persistence-unavailable`), and `§5.4` row 8 (`404` cross-owner/missing indistinguishability).

### 4.8 Accessibility, Keyboard, Semantic HTML & Responsive Rules

- All status badges use `Badges.tsx` (`symbol + text + CSS variable`); zero color-only indicators and zero hardcoded hex colors without `var(--color-*)` tokens.
- Every `<section>` carries `aria-labelledby` pointing to its `<h1>`/`<h2>` id; tables use `<th scope="col">`; `<dl>/<dt>/<dd>` pairs summary fields; `<details>/<summary>` provides native keyboard toggle for raw canonical payload inspection.
- `.app-shell--reports` in `AppShell.css` mirrors `.app-shell--macro` at `max-width: 640px` and `max-width: 320px`; long monospace identifiers set `overflowWrap: 'anywhere'` and tables sit inside `overflowX: 'auto'` containers with `minWidth: 0` on `#main-content`.

### 4.9 Automated Test Files & Assertions

1. `frontend/src/api/reports.test.ts`:
   - `GET /api/reports/context`, `/api/reports/artifacts`, `/api/reports/artifacts/:id`, `/api/reports/artifacts/:id/supersession` use `credentials: 'omit'` and omit `authorization`.
   - `tenantId`/`ownerUserId` and `ownership` strings are validated on wire input and stripped from returned client view objects.
   - `limit` and `cursor` are URL-encoded; special characters in `reportId` are percent-encoded.
   - `400`, `404`, `500` (with secret `detail: '/var/secret/db.sqlite'`), `503 owner-context-unavailable`, `503 persistence-unavailable` (with secret `reason: 'SQLITE_CANTOPEN /secret/path'`), `200` malformed JSON/envelope, and network throw (`TypeError`) produce exact `ReportsFailureKind` values and **never** contain `/secret/` in `error.message`.
2. `frontend/src/features/reports/Reports.test.tsx`:
   - Renders loading → empty state on `data: []`; renders head rows on populated response; appends page 2 via `Load more reports` and keeps page 1 visible if page 2 fails.
   - Navigates from `/reports` row link to `/reports/:reportId` and renders `Summary` → `Detail` → `Evidence & Provenance` → `Replay & Reference` in exact DOM document order (`compareDocumentPosition`).
   - Renders `null` metrics as `'unavailable'` (never `'0'`), preserves verbatim `canonicalPayload` numbers/arrays, shows `SUPERSEDED` badge + link to `current` head when viewing `v1`, and cancels stale in-flight requests when switching `v1 → v2`.
   - Asserts `document.body.textContent` never contains `'irr-reports-personal'` or `'owner-irr-reports-personal'`.
   - Renders sanitized `503` owner/persistence unavailable, `404` indistinguishable not-found, and `Retry` recovery to `200`.
3. `frontend/src/app/App.test.tsx`:
   - Adds `'Reports'` to the roleless sidebar link check (`href="/reports"`).
   - Verifies `/reports` and `/reports/:reportId` deep links mount without `shell-feature-unavailable`, `shell-permission-denied`, or `authorization` headers.

### 4.10 Browser Acceptance Procedure

Executed in a real headless Chromium session against `IIPS_REPORTS_OWNER_PATH` + `IIPS_NP04_DATABASE_PATH` (both materialised in an ephemeral `/tmp/...` directory **outside** `/home/user/iips-review-recovered`) with `npm run server:dev` (`127.0.0.1:8787`) and `npm run dev` (`127.0.0.1:5173`):
1. Run `B-1` (no carrier → `503`), `B-2` (carrier + no DB → `503`), `B-3` (carrier + empty DB → `200` empty), `B-4` (seed `v1` + `v2` via real `ReportingEngine` output → verify `/reports`, `/reports/<v2>`, `/reports/<v1>`, 4 disclosure levels, 0 auth headers, 0 partition strings in DOM), `B-5` (`404` unknown UUID), and `B-6` (keyboard Tab/Enter + `1280×800` and `375×812` `scrollWidth <= innerWidth`).
2. Delete ephemeral `/tmp/...` runtime files after capture and verify `git status` is clean of runtime artifacts.

### 4.11 Rollback Plan & Rollback Triggers

- **Rollback unit:** Because `Option CV51-A` makes **zero** database schema, persistence format, carrier format, server transport, or package-manifest changes, rollback is a single atomic Git revert of the 12 frontend client/route/nav/test files (`git revert <cv51-impl-merge-sha>`), restoring `/reports*` immediately to `FeatureNotImplemented` while leaving the accepted NP-06 backend (`775d282b…`) and any persisted NP-04 SQLite artifacts 100% intact.
- **Mandatory rollback triggers:**
  1. Any client request found emitting identity/tenant/`companyId` parameters or `Authorization` headers, or any raw partition ID/filesystem path/SQLite error string appearing in rendered DOM text.
  2. Any client-side recomputation or alteration of `canonicalPayload` or `reportKey`.
  3. Any regression on existing routes (`/executive`, `/portfolio`, `/user-portfolios`, `/watchlists`, `/collaboration`, `/research/*`, `/intelligence/*`, `/screener`, `/ai-advisory`, `/evidence`, `/settings`) or CI failure on `main`.

### 4.12 Tracker & Durable Evidence Update Sequence

1. **This Pass (`CV-CORR-95`, `§16.113`):** Publish this investigation/plan + proposed PA Decision Act (`PROPOSED — NOT APPROVED / NOT EFFECTIVE`) + additive tracker annotations keeping `CV-51` **`WITHHELD / BLOCKED — PA DECISION PENDING`** with **zero** `CV-*` register-count movements (`35` total, `6` active outstanding).
2. **Gate 1 — PA Decision Act Publication:** Upon PA approval of `IIPS-V3-REPORTS-NP06-CV51-UI-EXPOSURE-PA-DECISION-ACT-2026-10-25-01`, publish the effective act on `main` (`CV-51` becomes `AUTHORIZED — IMPLEMENTATION IN PROGRESS`, counts still unchanged).
3. **Gate 2 — Bounded Implementation & Browser Qualification PR:** Merge the 12-file frontend implementation + browser qualification record + post-merge receipt.
4. **Gate 3 — PA Product-Surface Acceptance & `CV-51` Closure:** Upon PA acceptance of the qualified UI surface, record `CV-51` `COMPLETE / ACCEPTED (bounded non-production read-only Reports UI)` and advance `§16.12` (`complete/accepted 17 → 18`, `blocked-active 2 → 1`, `active outstanding 6 → 5`) and `§18.1` row 37 (`NI → V`).
