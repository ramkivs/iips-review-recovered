# IIPS — G-2 UI-Consumer Implementation-Readiness Investigation Record
# Option A — IRR Shell / Domain-Scoped Consumption — First Candidate: User Portfolio

> **Artifact ID:** `G2-UI-CONSUMER-IMPLEMENTATION-READINESS-2026-10-08`
> **Program:** Institutional Investment Platform System (IIPS)
> **Gate:** G-2 UI-Consumer Implementation-Readiness Investigation (per G-2 §9; next gate designated by `UI-TARGET-ARCHITECTURE-SELECTION-DECISION-2026-10-08.md` §P)
> **Record type:** READ-ONLY IMPLEMENTATION-READINESS INVESTIGATION — no implementation, no merge, no promotion, no cross-repo copy, no production
> **Recording agent:** `arena-agent` — investigation and recording only
> **Recording date:** 2026-10-08 (Asia/Calcutta)
> **IRR baseline:** `ramkivs/iips-review-recovered` `main@15b28e868a8ccf654cb0c7b5c7eeed50085947a7` (tree `e669595a…`; local checkout `17e234a1` app-equivalent — all IRR file evidence read from this tree)
> **IPD baseline:** `ramkivs/iips-production-market-data` `main@4d3e1cdca3a33da0ec3be8b336b17128108a502c` (tree `db853dc2…`)
> **G24 pinned upstream:** IPD `refs/heads/arena/01a0e6d9-iips-production-market-data@6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` (tree `eb07ea36…`; acceptance branch `arena/01a0f839@12c480b5`)

**PRIMARY ANSWER.** *The smallest governed IRR-side UI consumer is a **read-only User Portfolio list + detail surface** on a **new, separate IRR route**, rendering `G2PortfolioSummary` (9 fields) and `G2PortfolioView` (11 fields) from the **already-implemented, already-tested** `/api/user-portfolios` GET surfaces, through the existing G-2 contract v1 → `IpdUserPortfolioAdapter` → pinned G24 service. No server work, no contract work, no D115 act, and no live-IdP certification is required before implementation authority; live *operation* remains gated on the deferred live-IdP certification and governed provisioning. Disposition: **A — READY FOR G-2 UI-CONSUMER IMPLEMENTATION AUTHORITY** (§R/§21).*

---

## A. Executive conclusion

The G-2 seam is **complete end-to-end on IRR main and verified**: six HTTP surfaces, contract v1 with closed types, per-request bearer adapter to the pinned G24 upstream, D-2 §8 translation boundary in executable form, two independent authorization gates, a closed 9-reason error vocabulary, and **59/59 targeted IRR tests plus 84/84 G24 tests** (implementation record §7, remotely verified 2026-10-07). The **only missing layer is the frontend consumer** — zero user-portfolios code exists in `frontend/src/` (grep-verified), which the G-2 transport itself documents as a deliberate boundary ("no portfolio UI / navigation / browser client"). D115 is **not** a dependency (the seam prohibits `companyId`/`runtimeCompanyId` outright), B1/platform involvement is limited to already-in-place Principal/RBAC plumbing, and the Dhan boundary holds (normalized, broker-neutral data only; no credentials ever cross). What remains is a single, precisely-scoped implementation-authority act for the read-only frontend consumer.

## B. First candidate consumer

**IRR-side consumption of the existing IPD-owned durable user-portfolio capability through the established G-2/G24 seam — READ-ONLY list + detail.** The seam's six surfaces split cleanly: reads (`GET /api/user-portfolios`, `GET /api/user-portfolios/:portfolioId`, `GET /api/user-portfolios/context`, `GET …/revisions`) vs. writes (`POST` create, `PUT` holdings, `DELETE`, `POST` reset). The smallest viable consumer exposes **only the first two (optionally the third for seam-state display)**: portfolio identity/summary + holdings + value + weights + provenance + persistence status — all already-governed read fields. Mutating operations and the revisions view are excluded from v1 (§L). This is not an assumption that "all of P04/BI-07 should be exposed" — it is the smallest subset the existing contract already serves.

## C. Existing G-2 seam — end-to-end trace (IRR main `15b28e86`, local tree ≡)

```
IRR UI (NONE EXISTS — the gap this gate scopes)
  ↓ (to be created: typed read-only client + route)
IRR server/API   frontend/server/executive-transport.ts:797–813 — dispatches `/api/user-portfolios/*`
  ↓               to the lazily-created live executor + G24 config
G-2 transport    frontend/server/user-portfolio-transport.ts (516 L)
  ↓               surface table :192–199 — 6 surfaces; auth ordering 401→403→400→404/405→503 (:330–399)
G-2 contract     frontend/server/user-portfolio/userPortfolioContract.ts (623 L) — contract v1 (:88),
  ↓               frozen G2_LINEAGE pin (:91–102), G2_ROUTES = /api/ipd/{health,portfolios} (:119),
                  G2_IPD_AUDIENCE 'ipd-user-portfolio-api' (:109), G2_TENANT_HEADER 'x-ipd-tenant-id' (:116)
Translation      frontend/server/user-portfolio/translationBoundary.ts (244 L) — D-2 §8 minimum;
  ↓               deriveTenantHint (:108) = only tenant source; claim classification (:157);
                  companyId/runtimeCompanyId prohibited (:125,:132)
Adapter          frontend/server/user-portfolio/ipdUserPortfolioAdapter.ts (300 L) — the ONLY
  ↓               G24-wire module; constructed PER REQUEST with the caller's own bearer (:437)
G24 / IPD        pinned IPD branch arena/01a0e6d9@6828155 — src/server/http-server.ts (/api/ipd/*),
  ↓               src/auth/oidc-verifier.ts + jwks (audience ipd-user-portfolio-api),
                  src/portfolio/durable-store.ts (SQLite better-sqlite3@13.0.3, journal DELETE,
                  synchronous FULL, FK enforced, migrations 001/002)
IPD capability   durable user portfolios: holdings, contributions, revisions, provenance digests,
  ↓               MERGE/REPLACE semantics, content-digest idempotency, tombstones
Authoritative    G24 SQLite — single authority; IRR stores NOTHING (no cache, no mapping copy)
state
```

**Exact seam facts** (all from the cited files on IRR main):

| Dimension | Established value |
|---|---|
| Routes (IRR) | `/api/user-portfolios/context` (GET/HEAD, non-durable); `/api/user-portfolios` (GET/HEAD/POST); `/api/user-portfolios/:portfolioId` (GET/HEAD/DELETE); `…/:portfolioId/holdings` (PUT); `…/revisions` (GET); `…/reset` (POST) — server-side allowlist (:192–199); `portfolioId` is durable instance identity, never a client claim (:224–226) |
| Request contract | Read surfaces take no body; body allowlists: create `{portfolioName}`, save `{mode, holdings, sourceBroker, fileName, contentDigest, lineageDigest, expectedRevision}`, lifecycle `{expectedRevision}` (:202–206); client identity/tenant/durable-identity fields refused 400/403 (:270–283, :368–388) |
| Response contract | `G2PortfolioView` (11 fields: portfolioId, portfolioName, revision, holdings[], totalMarketValue, totalHoldingsCount, weightSumPercentage, lastUpdated, provenanceDigest, isSaved, contributions[]); `G2PortfolioSummary` (9-field list projection); `G2HoldingView` (15 fields incl. symbol, companyId, quantity, averageBuyPrice, currentPrice, marketValue, weightPercentage, active, sourceBroker, lineageDigest, identityStatus, resolutionDisposition); `G2Contribution` (7 fields); `G2RevisionEntry`; owner/tenant identifiers deliberately absent from the wire (contract :194–258) |
| Adapter | `IpdUserPortfolioAdapter` — per-request bearer, never cached/shared/stored (transport :45–48, :437); G24 wire: `/api/ipd/portfolios` + `/api/ipd/health` |
| Translation boundary | `deriveTenantHint(principal)` only tenant source (blank → deny); D-2 §8 minimum in executable form (15 items); no identifier equivalence assumed; provisioning = operator-only via G24 `IdentityService` (provision→approve→activate→membership), never at request time (impl record §5) |
| Error model | closed `G2FailureReason` (9): INVALID_REQUEST, SAVE_GUARD_VIOLATION, IPD_AUTH, FORBIDDEN, NOT_FOUND, METHOD_NOT_ALLOWED, REVISION_CONFLICT, UPSTREAM_UNAVAILABLE, IPD_ERROR → 400/400/503/403/404/500/409/503/500 (transport :293–328); G24 existence-hiding 404 preserved; 409 optimistic concurrency preserved; upstream detail never echoed |
| Authentication | Bearer → `SecuredExecutor.authenticate` → Keycloak validation (issuer+audience, `KeycloakSessionValidator`, never client-created claims) → authoritative tenant resolution → 401 on failure → server-derived `Principal {userId, tenantId, roles}` (transport :29–37; `frontend/src/core/auth/keycloakAdapter.ts:35–63`) |
| Authorization | Two independent gates, both enforced: IRR `SecuredExecutor.authorize` (read for reads, execute for writes) + `userPortfolioResourceGate` (resource prefix `user-portfolio.`, closed roles viewer/analyst/admin; ROLE_POLICY viewer=read, analyst/admin=read+execute) → 403; AND G24 membership authority (403 on any denial) (transport :70–131; contract impl record §4) |
| Tenant/company | Server-derived tenant hint only (`x-ipd-tenant-id` header; G24 validates against ACTIVE memberships, mismatch 403); G24 resolves `applicationUserId` upstream from the credential per call — not representable at the IRR boundary; **no CompanyId / runtimeCompanyId binding of any kind** (translationBoundary :90, :125, :132) |
| Persistence | NONE in IRR — "IRR holds no portfolio state, no cache, no mapping copy" (transport :19); G24 SQLite is the single authority; 1 port op = 1 HTTP request = 1 G24 IMMEDIATE transaction |
| Provenance | `provenanceDigest`/`lineageDigest`/`contentDigest` are opaque passthrough — IRR never computes, parses, or compares them (impl record §4) |

## D. IRR implementation state (inspection, IRR main local tree)

- **Server: COMPLETE.** All 7 seam modules + transport exist and are on main (admitted after the implementation record's session-branch boundary): `user-portfolio/{userPortfolioContract, userPortfolioPort, translationBoundary, ipdUserPortfolioAdapter, userPortfolioBoundary, contractStub}.ts` + `user-portfolio-transport.ts` (3,023 L total incl. tests).
- **Frontend: NOTHING exists for user portfolios.** `grep -rn "user-portfolios" frontend/src/` → **empty**. No API client, no route, no component, no hook, no loader. This is the implementation gap.
- **What the current Portfolio UI consumes:** `frontend/src/features/portfolio/PortfolioWorkspace.tsx` (Phase 6) → `frontend/src/api/portfolio.ts` — "typed API client… Mirrors the **certified v2.0 transport DTO**" (`PortfolioHolding {companyId, sector, decision, composite, confidence, quality, risk, weight}`; `PortfolioData {portfolioId, scenario, holdings, sectorExposure, concentration…}`) — a completely different contract from the G-2 views. It does **not** consume the G-2 seam.
- **New route vs. extension:** a **new, separate route** is required. The transport's own ROUTE COLLISION AVOIDANCE note (:21–27) and G-2 §1.4/§6/§7 forbid conflating the certified reference portfolio with user-owned portfolios; extending the reference workspace would violate that separation.
- **Existing error/auth context to reuse:** `LoadingState, ErrorState, UnavailableState` (StateComponents), `CertifiedBadge/FreshnessBadge` patterns, and the OIDC client (`frontend/src/core/auth/oidcClient.ts`, PKCE, realm `iips`, client `iips-spa`) — all established IRR patterns.

## E. IPD implementation state

Two distinct IPD-side portfolio persistence modes exist — the seam reaches **only the second**:

1. **IPD main browser store (BI-07, not the seam's upstream):** `frontend/src/features/portfolio/portfolio-store.ts` @ IPD main `4d3e1cdc` — in-memory `Map` Tier-B store ("Portfolio Domain Store & Atomic Persistence Boundary (BI-07)", `NON_PRODUCTION / LOCAL_FIXTURE_AND_OFFLINE_DEV`); governed multi-broker atomic merge, BI-08 content-hash idempotency, SHA-256 lineage; powers the certified IPD-local PortfolioWorkspace. **Not consumed by IRR; stays IPD-local.**
2. **G24 durable service (the seam's pinned upstream):** IPD branch `arena/01a0e6d9` @ `6828155` (NP-15 §5.4 "Line A / NP04-G24") — `better-sqlite3@13.0.3`, `src/portfolio/durable-store.ts`, `src/server/http-server.ts` (`/api/ipd/*`), `src/auth/oidc-verifier.ts` (audience `ipd-user-portfolio-api`), governance record `evidence/np04/NP04-GOVERNANCE-AUTHORITY-RECORD.md`, 8 `tests/g24_*` suites (84 assertions; full suite 782/782). Frozen in the G-2 contract as `G2_LINEAGE` with blob pins (httpServer `17f9cb8a…`, durableStore `1c23f259…`, governance `45d016e8…`) and acceptance lineage (`arena/01a0f839@12c480b5`). **Not admitted to IPD main** (D-1 §1.6: no lineage promoted to main; the G-2 implementation record §8.5 records G24 main admission as prohibited per D-1 standing at that time) — the upstream is a governed, pinned, off-main lineage by design.

**Smallest safely-consumable subset:** the read projections `G2PortfolioSummary` + `G2PortfolioView` (§C). They disclose no owner/tenant identifiers, carry opaque provenance digests, and carry `sourceBroker` as plain data. IRR takes ownership of **nothing** — it renders; G24 owns all state and value semantics.

## F. B1/platform involvement

**Minimal and already in place.** The seam imports `Principal` from `iips-platform/src/distributed/EnterpriseRuntime.ts` (transport :52) and reuses the established composition seam `createLiveAdminExecutor(gate)` from `admin-transport` exactly as the Reports and AI-advisory tiers do (:133–145); RBAC via the established ROLE_POLICY. **No engine, scoring, or analytics involvement** — G-2 §7 excludes certified-analytics integration, and the consumer must not duplicate platform functionality in frontend code (no client-side authorization, no client-side portfolio math — the IRR "presentation-only" rule already governs).

## G. D115 dependency (reconciled only to this consumer)

Recorded D115 state (NP-08-D115 triple; D-2 §5–§8): authority = Ramki (Program Authority); custodianship per the D115 authority act Packet B — Keycloak/OIDC custodian of external authentication identity, IIPS server/platform authorization custodian of the validated application principal, **neither is the CompanyId custodian**; conceptual Company Identity custodian = the IIPS canonical company-identity/SecurityMaster authority (closure act §6.1). `CompanyId`/`runtimeCompanyId` remain **unresolved by design** (no durable Company Identity Authority — sole implementation fixture-only; no values assigned; D-2 §5/§6). No record of a "Personal Application Principal" or "Custodian = Ramki" identity assignment exists in `docs/integration/` (grep-verified); the local/single-user character of the program is recorded as the `NON_PRODUCTION / LOCAL_FIXTURE_AND_OFFLINE_DEV` execution mode. Nothing here is invented or modified.

1. **Identity-bound behavior?** Yes, at the Principal/owner level — already governed and implemented by the seam (server-derived Principal; G24 resolves ownership from the provisioned (issuer, subject) → applicationUserId mapping). No new identity act needed.
2. **Company-scoped behavior?** **No.** No company-scoped surface exists in the consumer; the seam prohibits company claims outright.
3. **Tenant membership?** Yes — ACTIVE tenant membership enforced at G24 (403 otherwise); tenant hint server-derived. Already implemented.
4. **runtimeCompanyId?** **Not required** — prohibited at this seam (translationBoundary :132).
5. **Can the bounded non-production seam operate without the unresolved D115 company-identity layer?** **Yes — by design** ("no CompanyId / runtimeCompanyId binding of any kind", translationBoundary :90). The seam operates on Principal + tenant hint + G24's own ownership registry.
6. **Prerequisite D115 continuation act?** **NONE for this consumer.** D115 continuation remains open only for other surfaces (IPD Administration tabs; future company-scoped tiers).

## H. Authentication / live-IdP dependency

- **Current state:** unauthenticated/invalid calls fail closed 401 (`AuthError`; ordering guarantees unauthenticated callers cannot probe the namespace — transport :330–337). The IRR SPA token audience is `iips-spa`; G24 requires the **distinct** `ipd-user-portfolio-api` audience — a single-audience SPA token fails at G24 with 401 and durable surfaces answer **503** with the exact blocker payload (`G2_IPD_BOUNDARY`, transport :92–115). Live-IdP certification (multi-audience issuance + end-to-end user-delegated proof) is **DEFERRED** (impl record §8.1); no static/service credential exists or is accepted.
- **Can implementation be developed/tested in non-live mode? YES** — the established pattern: `contractStub.ts` (scripted wire stub, tests only) + G2H "durable operations over real HTTP" + mocked-client UI tests (the standard IRR feature-testing pattern). No Keycloak configuration, activation, or credential is needed or permitted.
- **Is live-IdP certification required before implementation? NO.** Before **UI acceptance in live mode**? YES — live acceptance requires: multi-audience `ipd-user-portfolio-api` issuance (future IdP governance), governed G24 provisioning (provision→approve→activate→membership via G24 IdentityService), and `G2_IPD_BASE_URL` set to the pinned G24 service. **Outstanding certification:** exactly deferral 1 of the implementation record (plus deferrals 2–3 for per-user credentials and retention policy, which concern live operation, not the read-only UI).

## I. P04/BI-07 relationship

P04/BI-07 remains COMPLETE / CERTIFIED / IPD-OWNED (BI-07-CERT, lineage `5c469a78…`). **Exposed by the G-2 seam:** the durable domain's read projections — portfolio identity/summary, holdings vector (with P04 `companyId` per holding), value, weights, provenance digests, contributions, `isSaved` persistence status. **Not exposed:** broker import UI (BrokerImportModal), format detection/adapters, SecurityMaster resolution, analytics summaries, and the visual workspace itself. **Provenance/persistence status can be consumed as data without transferring ownership** (digests are opaque; IRR renders, never computes or adjudicates). **The BI-07 visual workspace remains IPD-local** (Option A; anti-transplant constraint). The first IRR consumer **must not silently become a second PortfolioWorkspace** — enforced here by scoping it to read-only list + detail with no import/edit/reset affordances (§L exclusions).

## J. Dhan boundary

- **Normalized data only: YES.** The consumer renders `G2HoldingView`/`G2Contribution` fields; `sourceBroker` is a plain string from the closed broker vocabulary (`ZERODHA | DHAN | GROWW | GENERIC | UNKNOWN`, contract :152) — broker-neutral data, not broker integration.
- **Dhan-specific leakage: NONE.** No Dhan endpoints, schemas, adapters, formats, or credentials appear anywhere in the contract, adapter, or transport (grep-verified; the wire is `/api/ipd/portfolios` + bearer + tenant header only).
- **Credentials crossing: NONE.** Only the user's own bearer crosses, and G24 validates it itself; no Dhan credential exists in this chain at any point.
- **Broker-neutral first consumer: YES.** Confirmed governed flow: **Dhan → IPD broker/portfolio domain → governed G-2 contract → IRR** — NOT IRR → Dhan.

## K. Existing Portfolio UI relationship

The current IRR `/portfolio` route is the **Phase 6 certified reference workspace** (`frontend/src/features/portfolio/PortfolioWorkspace.tsx`; client `frontend/src/api/portfolio.ts` "Mirrors the certified v2.0 transport DTO"; backend = dev-mode-certified `/api/portfolio`, G-2 §6-protected; M12 portfolio-variant multiplicity AFFIRMED as intentional in P8). It is **certified reference data, has no G-2 seam, and is a deliberately separate capability** (G-2 §1.4: "distinct capabilities with distinct provenance and authority"). Therefore the first G-2 consumer **introduces a separate governed route/component** (e.g., `/user-portfolios` + `/user-portfolios/:portfolioId` — exact paths fixed by the implementation act) and **must not extend or restyle the reference workspace**; the transport's route-collision note and G-2 §7 (user data never presented as certified reference) govern.

## L. MINIMUM VIABLE G-2 UI CONSUMER — specification

| Field | Specification |
|---|---|
| **Route** | NEW routes in IRR main frontend: list (e.g. `/user-portfolios`) + detail (e.g. `/user-portfolios/:portfolioId`); exact paths + navigation registration fixed by the implementation act (navigation composition follows the NP-13 D3 act pattern). NOT an extension of `/portfolio`. |
| **UI surface** | Read-only: portfolio list (summary cards/table) → portfolio detail (holdings vector, totals, weights, contributions, provenance, persistence status). Existing state components (`LoadingState/ErrorState/UnavailableState`); auth-gated presentation (sign-in prompt on 401). |
| **Existing backend** | IRR main `GET /api/user-portfolios` (list) and `GET /api/user-portfolios/:portfolioId` (detail); optional `GET /api/user-portfolios/context` (seam-state display; non-durable, works without upstream). No server changes. |
| **Existing contract** | G-2 contract v1 (`userPortfolioContract.ts`): `G2PortfolioSummary` (list), `G2PortfolioView` (detail). |
| **Existing adapter** | `IpdUserPortfolioAdapter` (per-request bearer; the only G24-wire module). |
| **Existing IPD capability** | G24 durable user-portfolio service @ pinned `6828155` (`/api/ipd/portfolios`; SQLite; auth + membership + ownership registry). |
| **Data fields consumed** | List: portfolioId, portfolioName, revision, totalMarketValue, totalHoldingsCount, weightSumPercentage, lastUpdated, provenanceDigest, isSaved (9). Detail: those + holdings[15 fields] + contributions[7 fields] (11-field view). |
| **Identity requirements** | Authenticated `Principal` (viewer/analyst/admin); no client identity/tenant/durable-identity claims; D115 not required. |
| **Authorization requirements** | `read` action on `user-portfolio.portfolios` / `user-portfolio.portfolio` via the closed role gate; G24 membership authority as the independent second gate. |
| **Persistence requirements** | NONE — IRR stores no portfolio state, no cache, no mapping copy. |
| **Error states** | 401 → sign-in prompt; 403 → forbidden state; 404 → not-found (existence-hiding respected); 500 → error state; 503 → unavailable state rendering the blocker payload (incl. `authoritativeCommit`); network failure → error state; loading state while fetching. |
| **Provenance requirements** | Render `provenanceDigest`/`lineageDigest` as opaque data; contributions as audit records; never compute/parse/compare digests; never present user data as certified reference (G-2 §7). |
| **Tests already available** | 59/59 server-side (G2C 19, G2T 6, G2A 12, G2B 8, G2H 14 — incl. G2H-31 idempotency, G2H-32 revision conflict); G24 84/84 at pinned tip; full IRR suite 971 pass / 2 pre-existing unrelated failures / 25 skip; tsc 0 errors; build PASS (impl record §7, remote-verified 2026-10-07: impl commit `470cc69`, tree `319cb537`, contract blob `511ff9a2…`, transport blob `9bfdecd8…`). |
| **Tests still required** | (to be written with implementation) typed frontend client tests; UI component tests (list/detail/loading/error/401/403/503); route + navigation registration tests; optional stub-backed end-to-end test through the transport (G2H pattern). |
| **Live-IdP requirements** | NOT required for implementation or non-live testing. REQUIRED before live operation: multi-audience `ipd-user-portfolio-api` issuance (live-IdP certification, deferred), governed G24 provisioning, `G2_IPD_BASE_URL`. |
| **D115 requirements** | NONE (company identity prohibited at this seam; principal/tenant-scoped only). |
| **Protected boundaries** | §M list — all unchanged. |
| **Explicit exclusions** | No write operations (create/save/delete/reset) in v1; no broker-import UI (IPD-local P04/BI-07); no revisions view in v1 (read-only add-on candidate later); no certified-analytics integration (G-2 §7); no transplant/copy of IPD PortfolioWorkspace; no Dhan-specific UI or integration; no new identity/tenant/company authority; no IRR-side storage; no production activity. |

## M. Protected boundaries (must NOT change)

IPD ownership of Portfolio; IPD ownership of Dhan; IPD ownership of Security Master; the P04/BI-07 implementation and its certification; D-1 persistence ownership (G24 = Portfolio Domain; GovernedArtifactStore = Artifact/Report Domain); the G-2 translation boundary and contract v1 semantics; D115 identity semantics (including its unresolved state — not modified, not "completed"); IRR main shell ownership and the certified reference portfolio surfaces (`/api/portfolio`, reference PortfolioWorkspace, CSIP, engine path); all closed decisions (architecture-selection record §O; governance-reconciliation record §I); production systems (untouched, unconfigured).

## N. Failure / error contract (fail-closed preserved)

| Condition | Behavior |
|---|---|
| Unauthenticated | 401 (AuthError) before any seam knowledge is disclosed; UI: sign-in prompt |
| Unauthorized (role/action/resource) | 403 via executor + surface gate; UI: forbidden state |
| Tenant unavailable / foreign tenant claim | Foreign tenant claim → 403 with governed audited DENY; own-tenant claim still 400 (client-supplied identity forbidden); G24 membership missing/revoked → 403 FORBIDDEN |
| G-2 upstream not bound (`G2_IPD_BASE_URL` unset/malformed) | 503 `upstream-unavailable` on durable surfaces with blocker + `authoritativeCommit`; `/context` still answers 200 (NOT BOUND disclosed); UI: unavailable state |
| IPD/G24 unavailable (down/network/timeout/envelope violation) | 503 UPSTREAM_UNAVAILABLE; other G24 5xx → 500 IPD_ERROR; UI: error/unavailable state |
| Malformed payload | 400 `invalid-json` / `unknown-field` / `client-supplied-identity-forbidden` / `durable-identity-forbidden` / `invalid-request` (read-only consumer sends no body — guarding already server-side and tested) |
| Persistence unavailable (G24 SQLite) | G24 5xx → 503/500 mapping; `/api/ipd/health` (unauthenticated G24 route) available for operator diagnostics |
| Stale/invalid provenance | Envelope verification failure → UPSTREAM_UNAVAILABLE (fail closed — unverified data is never rendered); digests remain opaque; no write-path 409 in v1 (no writes) |
| Network failure (browser → IRR server) | Fetch failure → error state (existing IRR pattern); never fabricated data |

## O. Test / certification reconciliation

- **EXISTING PASSING COVERAGE:** G2C (lineage pin, status mapping, identifier/scalar/holding/save-options validation, response envelopes) 19; G2T (tenant-hint derivation, claim classification, offline provisioning attestation) 6; G2A (adapter configuration, request formation, response mapping) 12; G2B (delegation/scope, fail-closed validation, delegation guards) 8; G2H (resource gate, auth+authz ordering, routing, durable operations over real HTTP) 14 — **59/59**; G24 pinned-tip suite **84/84** (8 suites; full 782/782); full IRR suite 971/2/25 with the 2 failures byte-identical to the pre-existing baseline (`product-transport.test.ts:275` telecom taxonomy; `pit/pitRuntimeIntegration.test.ts:361` IU5R-13 — both unrelated to portfolios); typecheck/build PASS (impl record §7). Remote verification completed 2026-10-07.
- **EXISTING REQUIRED COVERAGE:** everything above is required and already green — no re-execution was performed in this gate (workspace `node_modules` absent this session; recorded results are remotely verified evidence in the implementation record §7).
- **MISSING COVERAGE:** frontend client tests; UI component tests; route/navigation registration tests — precisely the tests belonging to the not-yet-authorized consumer implementation (§L).

## P. Remaining evidence gaps

1. **Live-IdP multi-audience issuance** — deferred (deferral 1); blocks LIVE operation only, not implementation or non-live testing.
2. **G24 provisioning for real users** (operator acts via G24 IdentityService) — owner-side operational step for live use; not a repository-evidence gap.
3. **Frontend consumer code** — does not exist (that is the implementation, not a gap in evidence).
4. **D115 Company Identity Authority** — unresolved by design; explicitly NOT a dependency of this consumer (§G).
5. The two pre-existing IRR suite failures — recorded, pre-existing, unrelated (baseline-identical).

## Q. Required authority act(s)

**Exactly one:** a **G-2 UI-Consumer Implementation Authorization Act** (Program Authority) scoped to the Minimum Viable consumer of §L — read-only list + detail, new separate route, typed client, existing state components, tests per §L, non-live development/testing, no server/contract changes, no write surfaces, no transplant. (Live operation afterwards additionally requires the already-tracked deferred acts: live-IdP certification; G24 provisioning; `G2_IPD_BASE_URL` — none of which gate the implementation authority.)

## R. Implementation-readiness disposition

# **A — READY FOR EXPLICIT IMPLEMENTATION AUTHORITY**

The contract, adapter, transport, translation boundary, authorization gates, error model, and tests all exist and are verified on IRR main; D115 is not required (§G); live-IdP certification is not required before implementation or non-live acceptance (§H); no contract/seam reconciliation is needed (§C traces end-to-end without gaps); no further read-only investigation is required (§P gaps are operational/deferred, not evidentiary). Options B (D115 act), C (live-IdP first), D (contract reconciliation), and E (more investigation) are each contradicted by the record.

## S. Recommended next gate

**G-2 UI-Consumer Implementation Authorization** (authority act) — the Program Authority grants implementation authority for exactly the §L Minimum Viable Consumer scope; the subsequent implementation gate executes it (frontend client + routes + component + tests, non-live), followed by owner-side non-live UI acceptance. Live-mode operation remains a separate, later, explicitly-gated step (live-IdP certification + provisioning + `G2_IPD_BASE_URL`).

---

## §21 FINAL DISPOSITION

# **A — READY FOR G-2 UI-CONSUMER IMPLEMENTATION AUTHORITY**

**NEXT AUTHORITY ACT:** G-2 UI-Consumer Implementation Authorization Act (Program Authority), scoped to §L exactly.

**MINIMUM IMPLEMENTATION SCOPE:** one typed read-only frontend client for `GET /api/user-portfolios` + `GET /api/user-portfolios/:portfolioId` (+ optional `/context`); one new list route + one detail route (exact paths fixed by the act) + navigation registration; read-only list + detail components rendering `G2PortfolioSummary`/`G2PortfolioView` with existing `LoadingState/ErrorState/UnavailableState` and 401 sign-in handling; component/client/route tests; zero server, contract, adapter, translation, or authorization changes; zero IRR-side storage; non-live development and testing only.

**EXPLICIT NON-AUTHORIZATIONS:** no write surfaces (create/save/delete/reset) in v1; no broker import UI; no revisions view in v1; no transplant/copy of IPD PortfolioWorkspace or any IPD UI; no Dhan connection, credential, or integration (broker-neutral display only); no certified-analytics integration; no D115 modification or completion; no G-2 contract modification; no changes to IPD, to the certified reference portfolio, or to any protected boundary (§M); no merge/cherry-pick/promotion/cross-repo copy; no Keycloak configuration or activation; no production deployment or activation; live operation only after the separately gated live-IdP certification and provisioning acts.

— END OF RECORD —
