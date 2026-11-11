# DHAN Live Market Data — Architecture and Current-State Investigation

**Document ID:** `DHAN-CURRENT-STATE-INVESTIGATION-2026-11-11`
**Date:** 2026-11-11
**Type:** Read-only investigation. **No source code was modified. No live Dhan call was made. No credential was requested, generated, stored or used.**
**Scope:** the existing Dhan market-data integration across IPD and IRR, evaluated against the established **personal, single-user, local Windows** operating model.
**Explicitly not produced:** an implementation roadmap (deferred to a separate work item).

---

## 0. Method, repository state and evidence conventions

### 0.1 Repositories inspected (authoritative state)

| Repo | Role | Ref inspected | Commit | Date |
|---|---|---|---|---|
| `ramkivs/iips-review-recovered` (IRR) | Presentation & consumption | `arena/b726539e-iips-review-recovered` (= `origin/main`) | `9e957ad7455738a45d25c054d005dfff7de9c6d1` | merge of PR #556 |
| `ramkivs/iips-production-market-data` (IPD) | Market-data authority | `main` | `a624d06f66c376f03a29571cb24c3f0f77f0c24d` | 2026-11-11 |
| IPD — **the commit IRR actually consumes** | — | pin in IRR `frontend/package.json` | `1aee57fe093b4fb15eaf3a9ac67532ee40262fe2` | 2026-11-10 (IPD PR #148) |

**Important scoping fact (E-01).** IRR consumes IPD through pinned git commits, not `main`. `frontend/package.json` pins `iips-production-market-data` and `iips-broker-import` at `1aee57f…`, and `iips-np04-governed-persistence` at `2e11fa3b…`. `frontend/package-lock.json` agrees.

**The Dhan surface IRR consumes is identical to IPD `main` (E-02).** `git diff --stat 1aee57f main -- src/providers/dhan src/contracts src/spi src/index.ts package.json` produces exactly one changed file: `src/contracts/portfolio_restore_ipc.ts` (+16 lines, portfolio restore — not market data). Therefore **every Dhan finding below applies equally to the pin and to IPD `main`**, and nothing in the Dhan area has drifted between them.

### 0.2 How evidence was gathered

* Full source inspection of both repositories (read-only).
* `git diff` between the pinned IPD commit and IPD `main` for the provider surface.
* IPD compiled (`npx tsc`, exit 0) and its Dhan test suites executed: **15 suites / 160 test cases, all passing**; plus `ws_a_dhan_broker_holdings_identity` (12 cases) in a combined run of 172 passing.
* **The IPD market-data daemon was launched locally on loopback** (no vendor egress possible — see §C.4) and its real HTTP contract exercised with `curl`. This is local, synthetic-mode runtime evidence, **not** live Dhan evidence. Observations are quoted verbatim in Appendix A.
* IRR's test suite was **not executed** in this environment (no `node_modules`; `package-lock.json` resolves IPD via `git+ssh://`, unavailable here). IRR test *coverage* is therefore established by static inspection only, and is labelled as such.

### 0.3 Classification vocabulary used throughout

| Label | Meaning |
|---|---|
| **IMPLEMENTED-VERIFIED** | Code exists and its behaviour was reproduced (test run or runtime observation) in this investigation |
| **IMPLEMENTED-SYNTHETIC** | Code exists and is deterministic under fixtures/mocks; proven only against synthetic doubles |
| **IMPLEMENTED-UNTESTED** | Code exists; no test evidence located |
| **PARTIAL** | Some of the required behaviour exists; a named part is absent |
| **MISSING** | Required behaviour does not exist in either repository |
| **BLOCKED-CODE** | Exists in shape, but is unreachable because of a code-level gate (not a credential problem) |
| **BLOCKED-CREDS** | Reachable, but cannot succeed without real Dhan credentials |
| **UNVERIFIED** | Cannot be established from the repositories; needs live evidence or operator access |

---

## A. Executive Assessment

**Assumption applied:** valid Dhan credentials will be supplied later.

> **The integration is architecturally complete and operationally blocked. With valid credentials supplied, this installation still cannot retrieve a single live Dhan quote or candle, because credential resolution is disabled in code — not because credentials are missing. The delivery chain is built end-to-end; the last link is deliberately not connected.**

The single decisive fact:

**IPD's only credential resolver is wired to a backend that reports `liveResolutionSupported: false` and returns `null` for every secret read.** `DhanMarketDataService` is composed with that resolver; the daemon composes Dhan's HTTPS egress transport **only if** `liveResolutionSupported === true && configOk`; otherwise it substitutes `PreAccessNoNetworkTransport`. Consequently every quote and historical request resolves to the deterministic failure `CREDENTIALS_UNAVAILABLE` **before any socket is opened**, no matter how correct the credentials in the environment are. This was reproduced at runtime (§C.4, Appendix A).

Supplying credentials is therefore **necessary but not sufficient**. Two code-level changes are entailed (a concrete `LocalHostVaultSecretBackend` implementation plus a way to select it), and those are a *technical* dependency. No governance question is reopened here.

### A.1 Readiness by capability

| Capability | Readiness | One-line basis |
|---|---|---|
| **Status** | **IMPLEMENTED-VERIFIED (pre-access semantics only)** — cannot ever report `AUTHENTICATED`/`OPERATIONAL` | Five-state classifier and both transport layers work; but IPD's `ServiceHealth` emits `liveProviderConnectivity` and `providerQualification` as *literal types*, so the two "live" states are unreachable by construction |
| **Quotes** | **BLOCKED-CODE** end-to-end; all upstream stages IMPLEMENTED-SYNTHETIC | Full path exists (identity → mapping → client → parse → normalize → canonical envelope → cache → freshness). Fails at credential resolution |
| **Historical** | **BLOCKED-CODE**; adapter and D02 normalization IMPLEMENTED-SYNTHETIC | Full path exists; vendor request/response shape is explicitly **PROVISIONAL** (published docs only). 1825-day guard enforced (verified) |
| **Freshness** | **IMPLEMENTED-VERIFIED for D01 projection; D02 MISSING by design** | Read-only, correct fail-closed semantics; D02 reports `NOT_AVAILABLE`/`UNKNOWN` because the composed service does not wire the historical cache/orchestrator |

### A.2 Explicit separation of evidence classes

**Ready and verified (reproduced in this investigation):**
* IPD's public canonical contracts: `CanonicalEnvelope<T>`, `MarketQuotePayload`, `OHLCVCandle`, `MarketDataSource<T>` SPI.
* The loopback market-data daemon: starts, binds `127.0.0.1`, refuses unauthenticated requests (`401`), refuses CLI arguments, refuses production mode, reports honest pre-access diagnostics, shuts down cleanly.
* The authenticated Layer-B transport: `/v1/health`, `/v1/quotes`, `/v1/historical`, `/v1/freshness`, `/v1/instruments/search`, `/v1/identity/resolve`, `/v1/identity/qualify`.
* Exact-identity governance: engine returns `UNRESOLVED_INSTRUMENT` for an unmapped company and for a mismatched segment; `MALFORMED_REQUEST` for a malformed identity.
* The 1825-day historical window guard (inclusive-day arithmetic).
* 96 qualified P7 mappings load at daemon start (`qualifiedMappings=96`).
* Read-only freshness: a freshness read after no activity returns `MISS`/`UNKNOWN` and does not touch the provider.

**Implemented but only synthetically demonstrated:**
* Dhan quote parsing/normalization (previous-close derivation from `net_change`, non-finite guards, cross-field validation, IST timestamp conversion).
* Historical columnar parsing, duplicate/out-of-order rejection, per-candle D02 validation.
* Rate limiting, concurrency limiting, request coalescing, bounded retry, quote cache, refresh orchestration.
* Credential expiry/revocation/version-mismatch handling.
* IRR's five Dhan screens and their contract tests.

**Partially implemented:**
* Status diagnostics (process/config state yes; *last failed provider interaction and its reason* are not exposed over the wire).
* D02 freshness (no cache, no refresh evidence, always `UNKNOWN`).
* Provider-neutrality at the *transport* layer (payloads neutral; the composed service and daemon are Dhan-specific and not swappable by configuration).

**Missing:**
* Any `LocalHostVaultSecretBackend` implementation for Windows; any environment/programmatic selector for one.
* Any token-acquisition/renewal path (Dhan 24-hour token lifecycle is an operator-manual concern today).
* Any configuration surface for freshness thresholds (compiled constants).
* Any persistent market-data cache (in-memory only; lost on restart).
* Consumer integration for Personal Portfolio, Broker Holdings, valuation, watchlists, screener, reports.

**Blocked by technical/external dependencies:**
* Live quotes and historical data: blocked by the disabled resolver (code) *and* by absence of a Windows secret store (environment).
* Live provider qualification: blocked by the same, plus the absence of a live qualification harness.

**Unverified:**
* Every Dhan vendor-side fact: real payload field shapes, `last_trade_time` format, `net_change` presence, historical depth/earliest date, adjustment policy, rate-limit headers, entitlement. All are declared PROVISIONAL in IPD's own source comments.
* Whether the 96 P7 mappings still correspond to live Dhan security ids at request time.
* IRR runtime behaviour (tests not executed here).

---

## B. Current Architecture and Ownership

### B.1 Ownership map (as implemented, not as intended)

| Concern | Owner | Implemented at |
|---|---|---|
| Dhan credentials (**pointers** only) | IPD | `src/providers/dhan/dhan_config.ts` (`DHAN_ENV_KEYS`, `resolveDhanProviderConfig`, `describeDhanConfig`) |
| Credential **resolution** | IPD (server-side, never exported) | `src/providers/dhan/dhan_local_vault_resolver.ts` (`LocalHostVaultDhanCredentialResolver`, `LocalHostVaultSecretBackend`, `DisabledWindowsHostVaultBackend`) |
| Vendor auth headers / egress | IPD | `dhan_api_client.ts` (`executeJsonPost`), `dhan_server_egress.ts` (`DhanServerHttpsTransport`) |
| Raw vendor DTO parsing | IPD | `dhan_dto.ts`, `dhan_historical_dto.ts` |
| Canonical normalization | IPD | `dhan_normalizer.ts`, `dhan_historical_adapter.ts` |
| Instrument identity & P7 mapping | IPD | `dhan_instrument_map.ts`, `dhan_instrument_mapping_integration.ts`, `dhan_security_identity_service.ts`, `evidence/dhan-p7/qualification-manifest.json` |
| Cache / rate limit / retry / coalescing | IPD | `dhan_operational_controls.ts` |
| Freshness evaluation | IPD | `src/quality/freshness_evaluator.ts` (owner), projected by `dhan_freshness_status.ts` |
| Composed service + neutral HTTP contract | IPD | `dhan_market_data_service.ts`, `dhan_market_data_http.ts` |
| Local daemon lifecycle | IPD | `dhan_local_daemon.ts` (`npm run start:market-data-daemon`) |
| Dhan screens, routes, presentation, `Freshness` vocabulary | IRR | `frontend/src/features/dhan/*`, `frontend/server/market-data/*` |
| Dhan credentials | **IRR: none** | IRR holds neither Dhan credential nor Dhan egress; only the local transport bearer token |

### B.2 Diagram (reflects inspected implementation)

```
┌───────────────────────── BROWSER (no credentials, ever) ─────────────────────────┐
│  /dhan/connection-status   /dhan/quotes   /dhan/historical   /dhan/freshness     │
│  /dhan/instruments                                                               │
│  api clients: dhanHealth.ts · dhanMarketData.ts · dhanIdentity.ts                │
│  all via noAuthFetch() — strips Authorization, credentials:'omit'                │
└───────────────────────────────────┬──────────────────────────────────────────────┘
                                    │ same-origin /api/dhan/*
                                    │ (Vite proxy → localhost:8787)
┌───────────────────────────────────▼──────────────────────────────────────────────┐
│ IRR SERVER (frontend/server/)            IRR-owned PRESENTATION                  │
│  executive-transport.ts  (route registration)                                    │
│   ├─ /api/dhan/health        → dhanHealthTransport   → dhanHealthState (5 states)│
│   ├─ /api/dhan/quotes        → dhanMarketDataRoutes  ┐                          │
│   ├─ /api/dhan/historical    → dhanMarketDataRoutes  ├→ dhanMarketDataTransport │
│   ├─ /api/dhan/freshness     → dhanFreshnessRoutes   ┘   (reads server env)     │
│   └─ /api/dhan/{instruments/search,identity/*} → dhanIdentityTransport           │
│                                                          │ (its own env reader)   │
│  IRR has NO cache, NO normalizer, NO provider client of its own.                 │
└───────────────────────────────────┬──────────────────────────────────────────────┘
        Bearer IIPS_MARKET_DATA_TRANSPORT_TOKEN   │  http://127.0.0.1:8791 only
        (local inter-process secret; NOT a Dhan credential)
┌───────────────────────────────────▼──────────────────────────────────────────────┐
│ IPD MARKET-DATA DAEMON (loopback-only, CLI-args forbidden, prod refused)         │
│  dhan_local_daemon.ts → createMarketDataHttpServer → DhanMarketDataService       │
│   /v1/quotes  /v1/historical  /v1/health  /v1/freshness                          │
│   /v1/instruments/search  /v1/identity/resolve  /v1/identity/qualify             │
│                                                                                  │
│  DhanMarketDataService                                                           │
│    ├ identity gate: D114 `ISIN:<isin>:<series>` + P04 SecurityMaster             │
│    │               + P7 registry (96 rows / 48 companies)                        │
│    ├ DhanRefreshOrchestrator: LRU cache(256) · limiter(60/60s) · conc(8)         │
│    │               · coalescer · bounded retry(transient only)                   │
│    ├ DhanMarketDataSource → DhanApiClient → transport                            │
│    └ getFreshness() → evaluateFreshness (read-only, cache.peek)                  │
│                                                                                  │
│  transport selection at startup:                                                 │
│    vaultBackend.liveResolutionSupported && configOk                              │
│        ? DhanServerHttpsTransport (https, origin-pinned, TLS-intact)  ← UNREACHED│
│        : PreAccessNoNetworkTransport (fails closed)                   ← ACTIVE   │
│                                                                                  │
│  credential resolver: LocalHostVaultDhanCredentialResolver                        │
│        backend = DisabledWindowsHostVaultBackend                                 │
│        liveResolutionSupported = FALSE  →  resolve() returns null  ← THE BLOCKER │
└───────────────────────────────────┬──────────────────────────────────────────────┘
                                    │  DhanServerHttpsTransport only; NOT taken today
                                    ▼
                    https://api.dhan.co/v2   (/marketfeed/quote, /charts/historical)
```

### B.3 Two transport layers, strictly separated (verified)

* **Layer A — vendor egress (IPD → `api.dhan.co/v2`).** `DhanServerHttpsTransport` enforces `https:` only, exact origin + path prefix, `NODE_TLS_REJECT_UNAUTHORIZED !== '0'`, `redirect: 'error'`, no URL credentials/query, bounded `AbortSignal.timeout`. It is **deliberately absent from the published `./dhan-server` surface** (`src/providers/dhan/package.ts` omits it; asserted by `tests/package_dhan_server_export.test.ts` and `tests/dhan_stage1_admission.test.ts`).
* **Layer B — local consumer transport (IRR → IPD).** `node:http`, loopback-only on both server and client side, `Authorization: Bearer` compared with `crypto.timingSafeEqual`, body ≤ 16 KiB, per-request bounded execution, typed `{error:{code,message}}` failures.
* **Credential-domain separation.** `IIPS_MARKET_DATA_TRANSPORT_TOKEN` is a local inter-process secret and is never a Dhan credential; Dhan `access-token`/`client-id` never cross Layer B.

---

## C. Four-Capability Assessment

### C.1 Status

**Implementation.** IPD `DhanMarketDataService.health()` → `ServiceHealth` with four fields, all literal-typed:

```ts
service: 'UP' | 'DOWN'
providerConfiguration: 'CONFIGURED' | 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE'
liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS'      // literal type
providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED' // literal type
```

IRR `/api/dhan/health` → `classifyDhanHealth()` maps evidence onto five states `UNAVAILABLE | PRE_ACCESS | DISCONNECTED | AUTHENTICATED | OPERATIONAL`, with a separate `connectionAttempted` flag distinguishing "never tried" from "tried and failed".

**Findings.**

| # | Finding | Status | Evidence |
|---|---|---|---|
| S-1 | Reading status is genuinely observational. `DhanMarketDataSource.healthCheck()` performs **no** network call; it reads `config.readiness` plus in-memory `lastFailure`/`lastSuccessAt`. `/v1/health` is a pure read. | IMPLEMENTED-VERIFIED | `dhan_market_data_source.ts` `healthCheck()`; runtime observation A-1 |
| S-2 | Opening the Status screen does **not** trigger a provider refresh, does not authenticate, does not mutate the cache. The only I/O is the local daemon health probe. | IMPLEMENTED-VERIFIED | `dhanHealthTransport.ts` `probeDhanTransport()`; `MarketDataTransportClient.health()` |
| S-3 | **`AUTHENTICATED` and `OPERATIONAL` are unreachable.** They require `liveProviderConnectivity === 'CONNECTED_LIVE'`, which IPD cannot emit (literal type) and which `MarketDataTransportClient.health()` *rejects* as `MALFORMED_RESPONSE` if it ever appeared. Optional credentials cannot change this. | MISSING (design gap) | `dhan_market_data_service.ts:67-69`; `dhan_market_data_http.ts:627-628`; IRR `dhanHealthState.ts` `classifyDhanHealth` |
| S-4 | **Two sources of truth for credential readiness.** IRR's Status screen does not ask the daemon what is configured — it calls IPD's `resolveDhanProviderConfig()` against **IRR's own `process.env`**, looking for `IIPS_DHAN_*`. So the Report says `PRE_ACCESS` unless IRR's own environment carries Dhan SecretRef pointers, even if the daemon is fully configured. | PARTIAL / architectural inconsistency | IRR `dhanMarketDataRoute.ts` `describeDhanProviderReadiness(env)`; `executive-transport.ts` passes `{env: process.env}` |
| S-5 | Last **successful** provider interaction is not published. `DhanMarketDataSource` tracks `lastSuccessAt` but `healthCheck()` only folds it into a `HEALTHY`/`DEGRADED`/`DOWN` verdict; the timestamp never crosses HTTP. | PARTIAL | `dhan_market_data_source.ts` |
| S-6 | Last **failed** provider interaction *as a provider event* is not published. `getLastFailure()` is not exposed by any route. What is published is per-scope refresh bookkeeping only, on `GET /v1/freshness?domain=D01_QUOTES…`, and it is deliberately sanitised to `{code:'REFRESH_FAILED', priorPreserved}` with **no** provider message or HTTP status. | PARTIAL | `dhan_market_data_service.ts` `refreshStatus`; `dhan_freshness_status.ts` |
| S-7 | Provider availability / latency / heartbeat are computed but only reachable through `DhanMarketDataSource.healthCheck()`, which is not on the daemon's HTTP surface (the daemon exposes `DhanMarketDataService.health()`). `ProviderHealth.latencyMs`/`lastHeartbeat` therefore never reach IRR. | PARTIAL | `spi/provider_spi.ts` `ProviderHealth`; `dhan_market_data_service.ts` |
| S-8 | Configuration readiness *is* diagnosable without secrets: `describeDhanConfig()` renders `providerId`, `baseUrl`, `timeoutMs`, `readiness`, `accessTokenKeyPath`, `clientIdKeyPath`, `missingKeys` — pointers and names only. | IMPLEMENTED-VERIFIED | `dhan_config.ts` `describeDhanConfig`; IRR `secretRefPointersOf()` |
| S-9 | Cache state is not on the status surface at all (it is on `/v1/freshness`). | IMPLEMENTED (split by design) | route table in `dhan_market_data_http.ts` |

**Verdict: PARTIAL.** Status is honest, safe and read-only, but it is a *configuration/process* report, not a provider-operations report, and its two live states are permanently unreachable.

---

### C.2 Quotes

**Trace (implemented, end-to-end):**

```
IRR /dhan/quotes (DhanQuotes.tsx)
  → POST /api/dhan/quotes {companyId, securityId, exchangeSegment?}
  → dhanMarketDataRoutes.handleDhanQuotesRequest → validateDhanQuoteRequest
  → MarketDataTransportClient.getQuote → POST /v1/quotes (Bearer)
  → DhanMarketDataService.getQuote
      ├ require valid D114 securityIdentity (P04 validator)
      ├ resolveExactIdentity(companyId, segment, identity)     [P04 SecurityMaster + P7]
      ├ DhanRefreshOrchestrator.refresh([scope])
      │    ├ cache hit CURRENT → SKIPPED_FRESH (no provider call)
      │    └ else: rate limit → concurrency → coalesce → withBoundedRetry
      │            → DhanMarketDataSource.fetchSnapshot
      │                 → DhanApiClient.fetchMarketQuotes
      │                     → executeJsonPost('/marketfeed/quote')
      │                         ├ production guard
      │                         ├ SecretRef expiry/revocation pre-flight
      │                         ├ credentialResolver.resolve(config)      ← FAILS HERE
      │                         ├ per-request headers access-token/client-id
      │                         └ transport (PreAccessNoNetworkTransport)
      │                 → parseDhanMarketQuoteResponse → selectDhanQuote
      │                 → normalizeDhanQuoteToCanonical
      └ returns {ok:true, envelope, freshness:'CURRENT'|'STALE'} | {ok:false, failure}
  → IRR projects envelope → DhanQuoteView (freshness vocabulary, provenance, D02/D01 freshnessStatus)
  → FreshnessBadge/StatusBadge; never produces LIVE
```

**Findings.**

| # | Finding | Status | Evidence |
|---|---|---|---|
| Q-1 | Vendor endpoint and request construction exist: `POST /marketfeed/quote`, body `{ "NSE_EQ": ["<securityId>"], ... }`, duplicates de-duped per segment. | IMPLEMENTED-SYNTHETIC | `dhan_api_client.ts` `buildQuoteRequestBody`, `DHAN_MARKET_QUOTE_PATH` |
| Q-2 | Canonical instrument resolution is **exact-identity only**. `companyId` + `ISIN` + `series` + segment must match one P7 row; `companyId` alone is explicitly insufficient. | IMPLEMENTED-VERIFIED | `DhanInstrumentRegistry.resolveExactIdentity`; observations A-4, A-5 |
| Q-3 | `previousClose` is derived from `net_change` (`last_price - net_change`), **never** from `ohlc.close` (documented because Dhan's `ohlc.close` is the current-session close). Missing/non-finite `net_change` fails closed. Derived `previousClose ≤ 0` fails closed instead of producing `pctChange = 0`. | IMPLEMENTED-SYNTHETIC | `dhan_normalizer.ts` |
| Q-4 | Non-finite numeric guard exists independently of DTO parsing (`last_price`, `ohlc.*`, `volume`). Canonical `validateMarketQuotePayload` is then applied (positivity, integer volume, `high ≥ low`, `ask ≥ bid`). | IMPLEMENTED-SYNTHETIC | `dhan_normalizer.ts`; `d01_quotes.ts` |
| Q-5 | **`bid`/`ask` degrade to `0` when depth is absent.** `topOfBook()` returns `0` for an empty/absent depth array, and `validateMarketQuotePayload` accepts `0` (its `ask < bid` check is skipped when either is 0). A depth-less Dhan response therefore presents `bid = ask = 0` as if they were real values rather than as "unavailable". | PARTIAL (limitation) | `dhan_normalizer.ts` `topOfBook`; `d01_quotes.ts` bid/ask rule |
| Q-6 | Timestamps: Dhan `last_trade_time` is parsed as `DD/MM/YYYY HH:mm[:ss]`, interpreted as **IST (UTC+05:30, no DST)**, converted to UTC ISO, and used as `provenance.asOf`. Impossible calendar dates (e.g. 31/02) are rejected by round-trip check rather than silently rolled. | IMPLEMENTED-SYNTHETIC | `dhan_dto.ts` `parseDhanTradeTimeToUtcIso` |
| Q-7 | Freshness gate inside normalization: a quote older than **2×** the D01 threshold returns failure `STALE_DATA_SUPPRESSED` (an error, not stale data). Between 1× and 2× the envelope is emitted with `qualityState: 'STALE'` and `staleConcessionActive: true`. | IMPLEMENTED-SYNTHETIC | `dhan_normalizer.ts` + `freshness_evaluator.ts` |
| Q-8 | Cache: in-memory LRU, capacity 256, key `companyId|segment|isin|series`; freshness re-derived from `provenance.asOf` on every read (not insertion time). Only validated observations are cached; failures are never cached. Prior observation preserved on refresh failure. | IMPLEMENTED-SYNTHETIC | `dhan_operational_controls.ts`; `dhan_market_data_service.ts:113` |
| Q-9 | Unmapped instrument, inactive instrument, ambiguous mapping and malformed identity all fail closed with typed codes and **no** fallback, ticker guessing or identifier synthesis. Reproduced at runtime. | IMPLEMENTED-VERIFIED | observations A-4, A-5, A-6 |
| Q-10 | Provider failure mapping: `401/403 → AUTHENTICATION_FAILURE`, `408/504 → TIMEOUT`, `429 → RATE_LIMITED`, other non-2xx → `HTTP_ERROR`; vendor error bodies are **never echoed** (prevents credential reflection). Transport errors → `TRANSPORT_FAILURE`; unparseable JSON → `MALFORMED_RESPONSE`. | IMPLEMENTED-SYNTHETIC | `dhan_api_client.ts` `mapHttpStatus` |
| Q-11 | **Every quote fails today** with `CREDENTIALS_UNAVAILABLE` before any socket is opened. | BLOCKED-CODE (verified) | observation A-2 |
| Q-12 | IRR's quote screen requires the operator to type `companyId` **and** the full `ISIN:<isin>:<series>` string by hand; it is not wired to the instrument-search screen. Presentation gap, not a correctness defect. | PARTIAL (UX) | `DhanQuotes.tsx` (`useState('')` for both fields) |

**Verdict: BLOCKED-CODE.** The normalization and failure semantics are unusually careful; the capability cannot produce data.

---

### C.3 Historical Data

| # | Finding | Status | Evidence |
|---|---|---|---|
| H-1 | Intervals: `1m`, `5m`, `15m`, `1h`, `1D` (vendor) → canonical `1m/5m/15m/1h/1d`. Weekly/monthly are **not** supported (`1w` rejected at runtime). | IMPLEMENTED-VERIFIED | `dhan_historical_dto.ts`; observation A-8 |
| H-2 | **1825-day maximum is enforced, as a self-imposed deterministic guard, using inclusive-day arithmetic** (`spanDays = (to − from)/86400000 + 1`). Effective consequence: the largest accepted calendar difference is **1824 days** (1825 inclusive days). Verified: a 1826-inclusive-day request is rejected with `INVALID_DATE_RANGE`; a 1825-inclusive-day request passes validation and proceeds to (and fails at) credential resolution. IPD's own source comments that this is *"a deterministic guard, not a vendor claim"*. | IMPLEMENTED-VERIFIED | `DHAN_MAX_HISTORICAL_WINDOW_DAYS = 365*5`; observations A-7, A-8 |
| H-3 | Range is inclusive on both ends; `fromDate > toDate` rejected; non-`YYYY-MM-DD` rejected. | IMPLEMENTED-VERIFIED | `validateDhanHistoricalRequest` |
| H-4 | Vendor endpoint `POST /charts/historical`. Request body `{ securityId, exchangeSegment, instrument:'EQUITY', interval, fromDate, toDate }` is marked **PROVISIONAL** — derived from published documentation, never validated against the live API. No credential material is included. | IMPLEMENTED-SYNTHETIC / **UNVERIFIED vendor-side** | `dhan_historical_dto.ts` comments and `buildDhanHistoricalRequestBody` |
| H-5 | Response parsing expects **columnar arrays** (`open/high/low/close/volume/timestamp`), rejects missing series, non-finite members, and ragged lengths. A uniformly empty set is a **valid empty result** (0 candles), distinct from failure. | IMPLEMENTED-SYNTHETIC | `parseDhanHistoricalResponse` |
| H-6 | Candle conversion: `timestamp` (epoch **seconds**) → `candleStart`; `candleEnd = start + intervalMs`. Duplicate timestamps and out-of-order series **fail the whole batch** rather than being silently de-duplicated or sorted. Every candle is validated by the canonical D02 validator; one invalid candle fails the batch (no partial series). | IMPLEMENTED-SYNTHETIC | `normalizeDhanHistoricalToCandles` |
| H-7 | `isAdjusted: false` is **declared**, not assumed — adjustment status is unverified pre-access. No corporate-action adjustment exists. | IMPLEMENTED (honest default) | `dhan_historical_adapter.ts` |
| H-8 | Timezone: `candleStart` is `new Date(epochSeconds*1000)` with no session or IST anchoring; daily candle boundaries are whatever the vendor's epoch means. There is **no** market-session alignment, no exchange-holiday awareness, no "missing trading day" analysis. Coverage is explicitly `ACCESS_PENDING_UNVERIFIED`. | PARTIAL / **UNVERIFIED** | `dhan_historical_adapter.ts` `coverageClaim` |
| H-9 | **No pagination and no chunking.** A request larger than 1825 days, or a multi-year intraday request that a vendor would split, is simply rejected. No request-size negotiation exists. | MISSING | `validateDhanHistoricalRequest` |
| H-10 | **No D02 cache is wired into the composed service.** `DhanHistoricalCache` exists and is exported, but `DhanMarketDataService.getHistorical` calls `this.historical.fetchDailyCandles(request)` directly — no cache read/write, no refresh orchestration. Historical data is therefore re-fetched on every call and leaves no freshness evidence. | PARTIAL (documented limitation, carried verbatim to IRR) | `dhan_market_data_service.ts` `getHistorical`, `getFreshness('D02_OHLCV')`; IRR `dhanFreshnessRoutes.ts` header |
| H-11 | Historical data **is** exposed on canonical contracts: `OHLCVCandle` (`D02`) via `DhanHistoricalNormalizationResult{candles, requestedFromDate, requestedToDate, returnedCandleCount, coverageClaim}`. IRR consumes it as `DhanHistoricalView`. | IMPLEMENTED-VERIFIED (shape) | `d02_ohlcv.ts`; `dhan_historical_adapter.ts`; IRR `dhanMarketDataRoutes.ts` |
| H-12 | Every historical request fails today at credential resolution. | BLOCKED-CODE (verified) | observation A-3 |

**Verdict: BLOCKED-CODE, with an additional vendor-shape risk.** The vendor request/response contract is PROVISIONAL in IPD's own words; first live calls may well need DTO adjustment. That is an honest unknown, not a defect.

---

### C.4 Freshness

| # | Finding | Status | Evidence |
|---|---|---|---|
| F-1 | **IPD owns every freshness decision.** `src/quality/freshness_evaluator.ts` `evaluateFreshness()` is the single evaluator; IRR computes no verdict, age, threshold or concession. | IMPLEMENTED-VERIFIED | `dhan_freshness_routes.ts`/`dhan_freshness_status.ts`; IRR `mapIpdVerdictToIrrFreshness` |
| F-2 | Semantics: `age ≤ threshold → GOOD`; `threshold < age ≤ 2× → STALE` (concession active, `suppressExecution:false`); `age > 2× → UNAVAILABLE` (`suppressExecution:true`); unparseable timestamps → `UNAVAILABLE` with `ageSeconds = Infinity` (serialized as `null`). | IMPLEMENTED-VERIFIED (code); SYNTHETIC (tests) | `freshness_evaluator.ts` |
| F-3 | Thresholds are **compiled constants**, not configuration: `D01_QUOTES = 900s`, `D02_OHLCV = 86400s`, others for D03–D09. No environment variable, no file, no per-instrument override. | MISSING (configurability) | `DEFAULT_FRESHNESS_CONFIG` |
| F-4 | Freshness differs **by data domain only**. There is **no market-session awareness**: the same 900 s D01 threshold applies at 02:00 IST when the market is closed, so a perfectly valid last-close quote becomes `UNAVAILABLE` (and, via Q-7, a `STALE_DATA_SUPPRESSED` failure) outside trading hours. | PARTIAL (limitation) | `freshness_evaluator.ts`; no session/holiday input anywhere in the Dhan surface |
| F-5 | Age is measured against `provenance.asOf` (the **provider observation timestamp**), never against cache insertion time — re-reading old data does not make it fresh. | IMPLEMENTED-VERIFIED | `DhanBoundedCache.classify` |
| F-6 | Cache state is `CURRENT | STALE | UNAVAILABLE | MISS`; `peek()` avoids touching LRU order and downgrades malformed evidence to `UNAVAILABLE` rather than `CURRENT`. | IMPLEMENTED-VERIFIED | `dhan_operational_controls.ts` |
| F-7 | `CURRENT`/`STALE`/`UNAVAILABLE` determination for the **transport** layer is `deriveMarketDataState(quality)` (GOOD→CURRENT, STALE→STALE, PARTIAL/anything→UNAVAILABLE) plus the transport's own `freshness: 'CURRENT'|'STALE'` marker. IRR maps IPD `CURRENT` → IRR `SNAPSHOT` (**never** `LIVE`), `STALE`→`STALE`, `UNAVAILABLE`/`UNKNOWN`→`UNAVAILABLE`. | IMPLEMENTED-VERIFIED | `market_data_route.ts`; IRR `mapIpdFreshnessToIrrFreshness` |
| F-8 | Provider failure effect: the last refresh outcome is recorded per quote scope as `SUCCESS | SKIPPED_FRESH | FAILURE` with a sanitised `{code:'REFRESH_FAILED', priorPreserved}`. Provider codes/messages are deliberately excluded. Reproduced: a failed quote leaves `lastRefresh.outcome = FAILURE, priorPreserved=false`. | IMPLEMENTED-VERIFIED | observation A-9 |
| F-9 | **Reading freshness is read-only.** `GET /v1/freshness` uses `cache.peek()` (no LRU mutation), never refreshes, never calls Dhan, never mutates the cache. Verified: successive reads after a failed quote did not alter provider behaviour or cache state. | IMPLEMENTED-VERIFIED | `getFreshness()`; observations A-9, A-10 |
| F-10 | **D02 freshness is structurally unavailable.** `getFreshness('D02_OHLCV')` returns `cacheState:'NOT_AVAILABLE'`, `verdict:'UNKNOWN'`, `lastRefresh:'UNKNOWN'`, null timestamps — even after a historical request. IRR carries this and says so in words. | PARTIAL (by design) | `dhan_market_data_service.ts`; observation A-10; IRR `DhanFreshnessStatus.tsx` |
| F-11 | The UI explains *why* data is stale/unavailable: `DhanFreshnessStatus` renders the verdict, threshold, age, cache state, concession, suppression and an explicit "no cache or refresh evidence is available for this domain" explanation. | IMPLEMENTED (static inspection) | `DhanFreshnessStatus.tsx` (IRR tests not executed here) |

**Verdict: PARTIAL.** The D01 machinery is sound, single-owner and read-only; D02 has no evidence at all, and the 24/7 threshold is wrong for a market-closed window.

---

## D. Consumer Integration Matrix

Scope note: the four Dhan menu screens are **not** the whole story — they are, in practice, almost the *entire* story. No other IIPS capability consumes market prices today.

| Consumer | Owning repo | Current market-data source | Existing integration status | Dhan readiness | Observed gaps | Evidence |
|---|---|---|---|---|---|---|
| **DHAN Status** (`/dhan/connection-status`) | IRR | IPD daemon `/v1/health` + IRR-local `IIPS_DHAN_*` pointers | Integrated, read-only | **BLOCKED-CODE** for live states (S-3) | Cannot ever report AUTHENTICATED/OPERATIONAL; readiness read from IRR env, not from IPD (S-4) | `dhanHealthTransport.ts`, `dhanHealthState.ts` |
| **DHAN Quotes** (`/dhan/quotes`) | IRR | IPD `MarketDataTransportClient.getQuote` | Integrated, provider-neutral | **BLOCKED-CODE** (Q-11) | Manual identity entry (Q-12); bid/ask zero-floor (Q-5) | `dhanMarketDataRoutes.ts`, `DhanQuotes.tsx` |
| **DHAN History** (`/dhan/historical`) | IRR | IPD `getHistorical` | Integrated, provider-neutral | **BLOCKED-CODE** (H-12) | No D02 cache/freshness (H-10); PROVISIONAL vendor shape (H-4) | `dhanMarketDataRoutes.ts`, `DhanHistorical.tsx` |
| **DHAN Freshness** (`/dhan/freshness`) | IRR | IPD `/v1/freshness` (read-only) | Integrated, read-only | Works; D02 empty | D02 `NOT_AVAILABLE`/`UNKNOWN`; no session awareness | `dhanFreshnessRoutes.ts` |
| **DHAN Instrument Search / identity** (`/dhan/instruments`) | IRR | IPD `/v1/instruments/search`, `/v1/identity/{resolve,qualify}` | Integrated | **Works locally today** (no credentials needed) | Reads `IIPS_MARKET_DATA_TRANSPORT_URL`, a *different* env name from the quotes path | `dhanIdentityTransport.ts`, `marketDataTransportConfig.ts` |
| **Personal Portfolio** | IRR | **None.** `currentPrice` is operator-typed | Not integrated | Not a consumer today | Total market value computed from a hand-entered price; no freshness, no stale handling, no provenance | `PersonalPortfolio.tsx` (input rows + `totalMarketValue`), `userPortfolioContract.ts` (`averageBuyPrice`, `currentPrice` as stored fields) |
| **Broker Holdings** | IRR | **None.** Preview pipeline explicitly publishes no market value or weight | Not integrated | Not a consumer today | Preview states "No market value or weight is published by the preview pipeline" | `BrokerHoldingsPreview.tsx:416`; `broker-import` modules |
| **Company Intelligence / IID coverage** | IRR | Identity/coverage observations only | Not integrated | Not a consumer today | No price input at all | `investment/sources.ts` (`toHoldingObservation` carries symbol/companyId/quantity/identity only) |
| **Stock-level analysis** | IRR | Not present as a distinct capability | n/a | n/a | — | no module located |
| **Valuation / investment assessment (IID)** | IRR | **Fixture prices** (`price: obs(2450)`, `priceAsOf: '2026-11-05'`) | Not integrated | Not a consumer today | Valuation runs on static fixture observations; nothing reads IPD quotes | `frontend/src/features/investment/iid6Fixtures.ts:146-147` |
| **Watchlists** | IRR | **None** (name/membership only) | Not integrated | Not a consumer today | No price fields | `server/watchlists/*` (no price/quote reference) |
| **Screener / replay** | IRR | **None** | Not integrated | Not a consumer today | No price/quote reference | `server/screener/screener-transport.ts` |
| **Reports / decision support** | IRR | **None** (no price reference) | Not integrated | Not a consumer today | — | `server/reports-transport.ts` |
| **PIT market-data read** (`/api/pit/market-data`) | IRR → IPD | IPD `./pit` + `./d114-non-production` **offline D114 historical dataset** | Integrated, but **not Dhan** | n/a | Separate historical source of truth from the Dhan chart path; no shared freshness | `server/pit/nonProductionRuntimePitStore.ts` |
| **IPD's own consumers (D114/PIT, fundamentals, intelligence)** | IPD | Offline/local datasets, not the Dhan provider | Not integrated with Dhan | n/a | — | `src/d114/*`, `src/pit/*` |

**Conclusions.**
1. Every genuine Dhan consumer already uses **provider-neutral contracts**. None calls a Dhan-specific implementation; none instantiates `DhanApiClient`; none holds a Dhan credential. There is **no duplicated provider integration** to unwind.
2. **No consumer other than the five Dhan screens integrates market data at all.** The portfolio's `currentPrice` is a stored/typed value (no provenance, no freshness, no staleness) — it is a *future* consumer, not a broken one.
3. The PIT D114 path is a **second, independent historical source**. Any future valuation work will have to choose between (or reconcile) Dhan `D02` candles and the D114 PIT dataset. This is an architectural question, recorded in §H.

---

## E. Instrument Mapping Assessment

**Identity model.**
`companyId` is **company-level** and is explicitly *not* unique per security. Security identity is `D114SecurityIdentity = ISIN:<isin>:<series>` (`securityId`), sourced from P04 `SecurityMaster`. The registry is keyed at security level: `companyId|exchangeSegment|isin|series` (`DhanInstrumentRegistry.keyOf`). Provider identity is `(exchangeSegment, dhanSecurityId)`, registered with conflict detection (`SECURITY_MAPPING_CONFLICT`, `SECURITY_ID_REUSED`, `EXCHANGE_MISMATCH`, `INSTRUMENT_TYPE_MISMATCH`).

**Actual coverage evidence (not a claim — measured).**

| Metric | Value | Source |
|---|---|---|
| Dhan instrument-master source | two public CSVs, 217,104 rows each, SHA-256 verified | `evidence/dhan-p7/source-retrieval-manifest.json`, `qualification-manifest.json` |
| Equity candidates examined | 23,764 | `qualification-report.md` |
| **QUALIFIED mappings** | **96** | same |
| **Unique companies covered** | **48** (each on BSE **and** NSE) | computed from `registryEntries` |
| By exchange:series | `NSE:EQ 48`, `BSE:A 47`, `BSE:B 1` | `coverageByExchangeSeries` |
| Rejections | `REJECTED_NO_P04_CORRESPONDENCE 23,644`, `REJECTED_NOT_EQUITY 193,340`, `REJECTED_INVALID_FIELD 24` | `countsByDisposition` |
| Runtime load | `qualifiedMappings=96` at daemon start | observation A-1 |
| Scope | cash equity only (`instrumentType: 'EQUITY'`) | `dhan_instrument_map.ts` |

**Interpretation.** Coverage is **48 of 23,764 equity candidates (≈0.20 %)** — deliberately, not accidentally: 23,644 of the 23,764 were rejected for having **no P04 correspondence**. Coverage is therefore bounded by the P04 SecurityMaster's population, not by Dhan. This is a hard live-readiness dependency: a quote can only succeed for those 48 companies, and only on the exchange/segment/series combinations listed.

**Mapping governance.** Rows are provenance-tagged (`SYNTHETIC_PRE_ACCESS_FIXTURE` vs `DHAN_INSTRUMENT_MASTER`); the daemon loads only `disposition === 'QUALIFIED'` rows and **never** downloads or infers mappings at runtime (`loadGovernedP7InstrumentRegistry` reads a local file only). Mappings are traceable to a pipeline commit (`a8019f12…`) and a SHA-256 of the source CSVs. Synthetic rows must not carry `lastVerifiedAt`.

**Quotes and history share one authority — with one asymmetry.** Both resolve through the same `DhanInstrumentRegistry` and the same manifest. **However** the quote path additionally requires the *exact* D114 identity (`resolveExactIdentity`), while the historical path accepts `companyId` alone (`registry.resolve(companyId)`) when no segment/ISIN is supplied. `getQuote` will refuse an ambiguous instrument that `getHistorical` might resolve. This asymmetry is implemented (not a bug per se) but is a real behavioural difference between the two capabilities.

**Uncertainties.**
* The `series` component is vendor-sourced (`SERIES` column) and `isinAuthority` is `NON_AUTHORITATIVE` — stated in the manifest's own `identityLimitation`.
* Whether the 96 `dhanSecurityId` values remain valid at request time is unverified (security ids can change with corporate actions / relisting).
* No independent verification of mapping correctness exists beyond CSV ↔ P04 correspondence.
* Coverage **can** be measured (the manifest supports it); it is **not** currently surfaced on any runtime endpoint — `qualifiedMappingsLoaded` (a count) is printed once at daemon start and never exposed over HTTP.

---

## F. Testing and Verification Assessment

### F.1 IPD — executed in this investigation

`npx tsc` exit 0. Dhan-related suites, all passing:

| Suite | Cases |
|---|---|
| `dhan_d1_provider_foundation` | 21 |
| `dhan_d2_integration_qualification` | 23 |
| `dhan_d2_ui_mock_demonstration` | 10 |
| `dhan_d3a_normalization_regression` | 13 |
| `dhan_d3b_instrument_mapping` | 13 |
| `dhan_d3c_historical` | 11 |
| `dhan_d3d_contract_drift` | 7 |
| `dhan_p4_operational_controls` | 11 |
| `dhan_p5_service_transport` | 7 |
| `dhan_p6_exact_identity` | 8 |
| `dhan_p7_instrument_master` | 10 |
| `dhan_stage1_admission` | 5 |
| `dhan_stage1_operational_wiring` | 5 |
| `irr_stage2_market_data_route` | 12 |
| `package_dhan_server_export` | 4 |
| **Total** | **160** |

`ws_a_dhan_broker_holdings_identity` adds 12 (172 in the combined run). IPD carries 120 test files in total.

### F.2 Coverage by required area (IPD)

| Area | Coverage | Notes |
|---|---|---|
| Credential/configuration validation | **Covered** | SecretRef grammar, missing keys, malformed `expiresAt`, production refusal, pointer-only summary |
| Auth & token lifecycle | **Covered synthetically** | EXPIRED/REVOKED status, `expiresAt ≤ now`, version mismatch, backend-failure scrubbing. **No test of an actual token exchange** (none exists) |
| Provider request construction | **Covered** | Quote body grouping/de-dup; historical body shape |
| Instrument mapping | **Covered** | Resolution, conflicts, exact-identity, P7 qualification pipeline |
| Quote parsing/normalization | **Covered** | Including non-finite guards, `net_change` requirement, `previousClose ≤ 0` refusal |
| Historical candle parsing/normalization | **Covered** | Ragged, duplicate, out-of-order, empty, invalid-candle-batch |
| Timestamp/timezone | **Covered** | IST conversion, impossible-date rejection |
| Cache behaviour | **Covered** | LRU, freshness-from-`asOf`, peek vs get, preservation on failure |
| Freshness thresholds/classifications | **Covered** | GOOD/STALE/UNAVAILABLE boundaries, stale concession, suppression |
| Provider errors & rate limits | **Covered synthetically** | Status mapping, `Retry-After` observation, transient-only retry |
| **Live wire exchange** | **ABSENT** | No live test suite exists. `providerQualification` remains `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED` |

### F.3 IRR — coverage by static inspection only (not executed here)

16 Dhan test files, ~263 test declarations:

| File | Declarations |
|---|---|
| `server/market-data/dhanMarketDataRoutes.test.ts` | 44 |
| `server/market-data/dhanFreshnessRoutes.test.ts` | 30 |
| `src/features/dhan/DhanMarketData.test.tsx` | 30 |
| `server/market-data/dhanHealthState.test.ts` | 22 |
| `server/market-data/dhanHealthTransport.test.ts` | 19 |
| `src/api/dhanMarketData.test.ts` | 18 |
| `src/features/dhan/DhanInstrumentSearchPresentation.test.tsx` | 18 |
| `src/features/dhan/DhanFreshnessStatus.test.tsx` | 16 |
| `server/market-data/dhanIdentityTransport.test.ts` | 13 |
| `server/market-data/dhanMarketDataTransport.test.ts` | 11 |
| `server/market-data/dhanMarketDataRoute.test.ts` | 10 |
| `src/features/dhan/DhanConnectionStatus.test.tsx` | 8 |
| `src/features/dhan/DhanInstrumentSearch.test.tsx` | 8 |
| `src/api/dhanHealth.test.ts` | 7 |
| `src/api/dhanIdentity.test.ts` | 5 |
| `server/market-data/marketDataTransportConfig.test.ts` | 4 |

These assert, among other things, credential non-leakage (assertions that serialised responses and fetch calls never contain `IIPS_MARKET_DATA_TRANSPORT_TOKEN`), the "not-attempted ≠ disconnected" distinction, and the conservative freshness mapping. **Their passing is not claimed** — they were not run in this environment.

### F.4 What the fixtures demonstrate — and what they do not

**They demonstrate:** deterministic, fail-closed behaviour of parsing, normalization, validation, caching, throttling, retry policy, identity resolution, boundary enforcement, and credential handling.

**They do not demonstrate — and must not be cited as evidence of:**
* Dhan credential acceptance.
* Vendor connectivity or TLS behaviour against `api.dhan.co`.
* Real payload shapes for `/marketfeed/quote` or `/charts/historical`.
* IST `last_trade_time` formatting as actually emitted by Dhan.
* `net_change` presence on real responses.
* Historical depth, earliest date, adjustment policy, or coverage.
* Rate-limit headers or real 429 behaviour.
* That the 96 `dhanSecurityId` values are still live.
* That any consumer receives real market data.

### F.5 Live verification requirements (evidence that will be needed)

| # | What to verify | Expected evidence | Success criterion |
|---|---|---|---|
| 1 | Credential acceptance / authentication | One controlled `POST /marketfeed/quote` with a known-good mapped ISIN; daemon log line unaffected; typed `ok` outcome | HTTP 200 with a structurally valid Dhan payload; none of `AUTHENTICATION_FAILURE`/`CREDENTIALS_UNAVAILABLE`/`CREDENTIALS_EXPIRED` |
| 2 | Token expiry & renewal | Observation across the 24-hour boundary; one deliberate expired token | `CREDENTIALS_EXPIRED` **before** any socket, then success after renewal, with the documented renewal step performed |
| 3 | Provider connectivity | Successful TLS handshake to `api.dhan.co` from the target workstation; origin-pinned egress only | Egress succeeds and no redirect occurs |
| 4 | Quote for a verified mapped instrument | Canonical D01 envelope with plausible `ltp`/`previousClose`/`pctChange` cross-checked against an independent source | Values reconcile to vendor/independent display within tick tolerance |
| 5 | Historical OHLCV for a verified mapped instrument | Canonical D02 candles for a small range, e.g. `1D` last 5 sessions | Candle dates match trading days; OHLC consistent with independent data |
| 6 | Timestamp & session correctness | `asOf` for a quote taken during live trading; `candleStart` for a daily candle | `asOf` in UTC corresponding to actual IST trade time; daily candle boundary correct |
| 7 | Mapping failure behaviour | Request for a deliberately unmapped company | `UNRESOLVED_INSTRUMENT` / `UNMAPPED_COMPANY_ID`; no provider call attempted |
| 8 | Invalid-credential & provider-failure behaviour | Wrong token; wrong client id; revoked token | `AUTHENTICATION_FAILURE` (vendor 401/403) with no credential echo anywhere in logs or response |
| 9 | Rate-limit & retry behaviour | Burst beyond the limiter; vendor 429 if reachable | `RATE_LIMITED` from the local budget; bounded retry only for transient codes; no retry on auth failures |
| 10 | Cache population and subsequent reads | Two identical quote requests within the threshold | Second returns `SKIPPED_FRESH`; freshness shows `cacheState: CURRENT`, non-null `asOf` |
| 11 | Freshness classification | Observations inside, between and beyond threshold | `GOOD`/`STALE`(+concession)/`UNAVAILABLE`(+suppressed) exactly at the boundaries |
| 12 | Stale and unavailable behaviour | A quote held past 2× threshold; a request while vendor is unreachable | Stale served for the 1×–2× band; `STALE_DATA_SUPPRESSED`/`UNAVAILABLE` beyond, never presented as current |
| 13 | Status diagnostics | `/api/dhan/health` before/during/after live activity | State transitions observable and truthful — **this requires S-3 to be resolved first**, otherwise the state cannot leave `PRE_ACCESS`/`DISCONNECTED` |
| 14 | Credential secrecy & log inspection | Full grep of daemon stdout/stderr, IRR server logs, HTTP bodies, browser network traces, built bundles | Zero occurrences of the client id, access token, or transport token value |

### F.6 End-to-end consumer verification — evidence needed

For each consumer that adopts market data (today: only the Dhan screens):

1. **Provenance** — canonical `envelope.provenance` rendered with `sourceClassification`, `asOf`, `receivedAt`, `evaluatedAt`, `dataVersion`, `lineageHash`.
2. **Correct IPD consumption** — request/response is `MarketDataTransportClient` ↔ `/v1/*` only.
3. **No credential exposure** — browser devtools show no `Authorization` on `/api/dhan/*`, no `IIPS_*` value in any response, and the built bundle contains no provider symbols (IPD already enforces this for its own bundle via `scripts/verify-public-package.mjs`; IRR has no equivalent gate).
4. **No duplicated integration** — a repo-wide check that no IRR module instantiates a provider client or normalizer.
5. **Freshness/unavailable handling** — a screenshot/assertion of a STALE and an UNAVAILABLE rendering per consumer, not only per screen.
6. **Traceability** — one request id or `envelopeId` correlating browser → IRR log → daemon log → vendor call.

---

## G. Operational Readiness (local Windows single-user)

### G.1 Processes that must run

| Process | How it starts | Required for |
|---|---|---|
| **IPD market-data daemon** | `npm run start:market-data-daemon` in the IPD checkout (`node dist/src/providers/dhan/dhan_local_daemon.js`) | quotes, historical, freshness, identity |
| IRR API transport | `npm run server:dev` (`tsx server/executive-transport.ts`), default `:8787`, loads `../.env.local` and `.env.local` | all `/api/dhan/*` routes |
| IRR UI (Vite) | `npm run dev` | the screens; proxies `/api` → `localhost:8787` |

**Startup order.** The IRR server does **not** require the daemon at boot — it degrades to explicit, typed unavailability. Practically: start IPD first so the first screen load is meaningful, but nothing breaks if the order is reversed.

### G.2 Configuration loading — the credential-adjacent surface

**IPD daemon** reads only `process.env`. There is **no `.env` loader and no `env.example` in IPD**; `start:market-data-daemon` passes no `--env-file`. Variables must exist in the environment of the process that launches it (shell / scheduled task / terminal session).

| Variable | Consumed by | Effect |
|---|---|---|
| `IIPS_DHAN_BASE_URL` | `resolveDhanProviderConfig` | defaults to `https://api.dhan.co/v2` |
| `IIPS_DHAN_TIMEOUT_MS` | same | default 5000 |
| `IIPS_DHAN_CLIENT_ID_SECRET_PATH` | same | **must be `vault://…`** or `CONFIGURATION_INCOMPLETE` |
| `IIPS_DHAN_ACCESS_TOKEN_SECRET_PATH` | same | **must be `vault://…`** |
| `IIPS_DHAN_VAULT_PROVIDER` | same | `SecretRef` provider enum (`LOCAL_MOCK_VAULT` default) |
| `IIPS_DHAN_SECRET_VERSION` | same | default `v1` |
| `IIPS_DHAN_SECRET_STATUS` | same | `ACTIVE|ROTATING|REVOKED|EXPIRED` |
| `IIPS_DHAN_ACCESS_TOKEN_EXPIRES_AT` | same | ISO-8601 UTC |
| `IIPS_MARKET_DATA_TRANSPORT_TOKEN` | daemon + IRR | local bearer secret; daemon **refuses to start** without it |
| `IIPS_MARKET_DATA_DAEMON_HOST` / `_PORT` | daemon | loopback only; default `127.0.0.1:8791` |

**IRR server** reads two *different* base-URL names and one token:

| Variable | Consumed by | In `.env.example`? |
|---|---|---|
| `IIPS_MARKET_DATA_TRANSPORT_TOKEN` | all `/api/dhan/*` | **Yes** |
| `IIPS_MARKET_DATA_TRANSPORT_URL` | **identity routes only** (`/instruments/search`, `/identity/*`) | **Yes** (example value `http://127.0.0.1:8790`) |
| `IIPS_MARKET_DATA_BASE_URL` (default `http://127.0.0.1:8791`) | **quotes, historical, health, freshness** | **No — undocumented** |
| `IIPS_MARKET_DATA_TIMEOUT_MS` | quotes/historical/health/freshness | No |
| `IIPS_DHAN_*_SECRET_PATH` (+ metadata) | **`/api/dhan/health` only**, via IPD's `resolveDhanProviderConfig` | **No** |

**Three concrete configuration defects found:**

* **G-1 — two env names for one endpoint.** `IIPS_MARKET_DATA_TRANSPORT_URL` (identity) and `IIPS_MARKET_DATA_BASE_URL` (quotes/history/health/freshness) address the same daemon. An operator who configures only the documented name gets working identity search and quotes that silently use the built-in default port.
* **G-2 — the documented example port contradicts the daemon's default.** `.env.example` shows `http://127.0.0.1:8790`; the daemon defaults to **8791**; and `8790` is the port the runbook uses for *IRR's own* transport (`EXEC_TRANSPORT_PORT=8790`). Following the example would point IRR's identity transport at the IRR server itself.
* **G-3 — the Status screen's "configured" state depends on undocumented IRR-side `IIPS_DHAN_*` variables.** `IIPS_DHAN_ACCESS_TOKEN_SECRET_PATH` / `IIPS_DHAN_CLIENT_ID_SECRET_PATH` appear nowhere in `.env.example` or `docs/OPERATOR_RUNBOOK.md`, yet `/api/dhan/health` cannot leave `PRE_ACCESS` without them in **IRR's** environment — a second copy of the pointer configuration, in a different process from the one that resolves it.

### G.3 Credential location and ownership — the answer to §5

* **Owning process:** the **IPD market-data daemon** (`dhan_local_daemon.js`). It is the only process that resolves Dhan credentials and the only process that can open vendor egress.
* **Mechanism:** `SecretRef` pointers in the daemon's environment → `LocalHostVaultDhanCredentialResolver` → `LocalHostVaultSecretBackend` → ephemeral `DhanCredentialMaterial`, discarded with the request. Values are never stored on a client instance, logged, serialized or returned.
* **Is there an existing mechanism that can be reused?** *In shape, yes — in function, no.* The `LocalHostVaultSecretBackend` contract, the resolver, the `SecretRef` validation, the expiry/version/revocation semantics and the egress gating all exist and are tested. The **only** concrete backend shipped is `DisabledWindowsHostVaultBackend`, which reports `liveResolutionSupported: false` and returns `null` from `readSecret()`. IPD's own admission record states the host-vault inspection finding explicitly: no Windows Credential Manager/`Advapi32 CredReadW` binding, no DPAPI `CryptUnprotectData` carrier, no PowerShell `SecretStore`, no vault SDK — and that no unsupported technology was guessed in its place.
* **Is there an established local configuration file for these?** **No.** IPD has no `.env` mechanism for provider configuration. This is a genuine gap and is recorded, not papered over.

### G.4 Token lifecycle, expiry and recovery

* Dhan access tokens are documented in the repository as **24-hour** tokens. Nothing in either repository **acquires or renews** a token; there is no `POST /token` call anywhere (only `/marketfeed/quote` and `/charts/historical`).
* Expiry is checked **three times** before any socket: `SecretRef.expiresAt`, `SecretRef.status ∈ {EXPIRED, REVOKED}`, and the resolved material's `expiresAt`. All produce `CREDENTIALS_EXPIRED` with no network call.
* **Recovery is manual**: a new token must be written into the (not-yet-existing) host vault and the daemon restarted *if* the pointer/metadata changed. Secret **values** are read per request by the resolver, so — once a real backend exists — a value rotation would not require a restart; a pointer/expiry-metadata change would.
* Invalid/revoked credentials: `401/403 → AUTHENTICATION_FAILURE`, never retried (correct — it is classified non-transient).

### G.5 Safe restart, outages, persistence

* **Graceful shutdown**: `SIGINT`/`SIGTERM` → `service.stop()` (which clears the cache and halts the orchestrator) → `server.close()` with a bounded force-close timer. Reproduced twice (observations A-1, A-11).
* **Bind failure** (`EADDRINUSE`) is reported as `BIND_FAILED` with the socket state rolled back; startup failures are deterministic and exit `1`.
* **Provider outage**: refresh returns `FAILURE` with `priorPreserved`; a previously valid observation stays in cache and its freshness ages honestly; `getQuote` surfaces the typed failure. IRR shows "Transport unavailable"/"Data unavailable" distinctly.
* **Cache persistence: none.** The quote cache (`DhanBoundedCache`) and the refresh-status map are in-memory `Map`s. `src/providers/dhan/**` has **zero imports** from `src/persistence/**` or `src/ipc/**` (verified by grep). A restart loses all cached observations and all refresh history. For a single-user local app this is a defensible choice, but it means **freshness evidence never survives a restart**, and the Freshness screen starts at `MISS`/`UNKNOWN` every time.
* **Logging**: daemon writes one startup line to stderr plus a shutdown line; IRR writes `[dhan-identity] IRR-side fault during …` on identity faults. There is **no** log file, no rotation, no persistent diagnostics sink, and no request-id correlation between IRR and the daemon.

### G.6 Can the owner tell whether Dhan is genuinely operational?

**Today: no — and the Status screen cannot become able to without a code change.** With working credentials the daemon would answer quotes, but `/api/dhan/health` would still say `PRE_ACCESS`, because (a) `ServiceHealth`'s live fields are literal types, and (b) IRR derives readiness from its own `IIPS_DHAN_*` env.

What *is* available for diagnosis:

| Symptom | Where to look | Meaning |
|---|---|---|
| Daemon won't start, `TRANSPORT_TOKEN_MISSING` | daemon stderr | `IIPS_MARKET_DATA_TRANSPORT_TOKEN` absent — not a Dhan problem |
| Daemon line shows `liveCredentialResolution=false`, `vendorEgress=DISABLED_PRE_ACCESS` | daemon stderr | **the code-level blocker is in force**; credentials alone cannot fix it |
| Daemon line shows `qualifiedMappings=0` | daemon stderr | P7 manifest not found (checkout/`dist` layout) — every quote will be `UNRESOLVED_INSTRUMENT` |
| `CREDENTIALS_UNAVAILABLE` on every quote | quote response | resolver returned null (disabled backend, or absent/blank secret) |
| `CREDENTIALS_EXPIRED` | quote response | `expiresAt`/status says expired; no socket was opened |
| `AUTHENTICATION_FAILURE` | quote response | vendor rejected `access-token`/`client-id` |
| `UNRESOLVED_INSTRUMENT` | quote response | company/segment/ISIN/series not in the 96-row registry |
| IRR: `TRANSPORT_NOT_CONFIGURED` | `/api/dhan/*` body | server-side transport env missing (names listed in `requiredSettings`) |
| IRR: `TRANSPORT_UNAVAILABLE` | `/api/dhan/*` body | daemon not listening, or IRR-side fault (cause only in the IRR log) |

### G.7 Existing operational support and observed gaps

**Existing:** the runbook's §5.2 and §9 cover the *identity* routes thoroughly (five distinct failure wordings, cause vs symptom split). IPD's admission record covers the daemon invariants.

**Observed gaps:**
* **The operator runbook has no section for quotes, historical or freshness**, and **no instruction anywhere for starting the IPD daemon** (`start:market-data-daemon` appears in only one document in either repo: IPD's admission record).
* `windows-setup/01..06` do **not** start, stop or health-check the market-data daemon (grep of all scripts and `README.md` returns nothing). The Windows installation has no service entry for the process that owns market data.
* `.env.example` documents the identity transport only (G-1, G-2, G-3).
* No `.env` file exists on the IPD side at all.
* No IRR-side bundle/leak gate equivalent to IPD's `verify-public-package.mjs`.

---

## H. Outstanding Gaps and Unresolved Questions

Every item names its owning repository and its evidence.

| # | Gap / question | Owner | Class | Evidence |
|---|---|---|---|---|
| H-1 | **No concrete Windows host-vault backend exists.** `DisabledWindowsHostVaultBackend` is the only implementation; `liveResolutionSupported` is `false`; `readSecret()` returns `null`. Credential resolution therefore cannot succeed regardless of environment configuration. | IPD | **BLOCKED-CODE + environment** | `dhan_local_vault_resolver.ts`; admission record §10.1, §12.1; observation A-2 |
| H-2 | **No way to select a vault backend at runtime.** `startMarketDataDaemon` accepts `options.vaultBackend` programmatically only; there is no environment variable and no configuration file for it. | IPD | BLOCKED-CODE | `dhan_local_daemon.ts` `StartMarketDataDaemonOptions` |
| H-3 | **Status can never report `AUTHENTICATED`/`OPERATIONAL`.** `ServiceHealth.liveProviderConnectivity` and `.providerQualification` are literal types; IRR's classifier needs `CONNECTED_LIVE`/`LIVE_QUALIFIED`; and `MarketDataTransportClient.health()` *rejects* those values as `MALFORMED_RESPONSE`. Two independent locks. | **IPD (contract) + IRR (classifier)** | MISSING | `dhan_market_data_service.ts:67-69`; `dhan_market_data_http.ts:627-628`; IRR `dhanHealthState.ts` |
| H-4 | **Two sources of truth for credential readiness.** IRR's health route resolves `IIPS_DHAN_*` from IRR's own env instead of asking the daemon. Contradicts IPD's own admission rule that IRR "must never receive `IIPS_DHAN_*` environment variables". | IRR | PARTIAL / inconsistency | `dhanHealthTransport.ts` → `dhanMarketDataRoute.ts` `describeDhanProviderReadiness(env)`; admission record §4.3 |
| H-5 | **`companyId`-only historical resolution** vs exact-identity-only quotes — the two capabilities do not apply the same identity strictness. | IPD | PARTIAL (asymmetry) | `dhan_historical_adapter.ts` vs `dhan_market_data_service.ts` `getQuote` |
| H-6 | **D02 has no cache and no freshness evidence**, so history can never be judged fresh/stale. | IPD | PARTIAL (by design) | `dhan_market_data_service.ts` `getHistorical`/`getFreshness('D02_OHLCV')` |
| H-7 | **Freshness thresholds are compiled constants**, not configurable; and **no market-session/holiday awareness**, so the 900 s D01 threshold is wrong outside trading hours. | IPD | MISSING (configurability) / PARTIAL | `DEFAULT_FRESHNESS_CONFIG`; no session input anywhere |
| H-8 | **No token acquisition or renewal path.** Dhan's 24-hour token must be manually replaced. | IPD (mechanism) + operator (procedure) | MISSING | no `/token` request anywhere; only `/marketfeed/quote`, `/charts/historical` |
| H-9 | **Mapping coverage is 48 companies / 96 rows** out of 23,764 equity candidates, bounded by P04 population (23,644 rejected for no P04 correspondence). | IPD | PARTIAL | `evidence/dhan-p7/`; §E |
| H-10 | **Mapping freshness is unverified.** No runtime validation that the 96 `dhanSecurityId` values are still live. | IPD | UNVERIFIED | manifest `lastVerifiedAt` = 2026-11-06 (static CSV retrieval) |
| H-11 | **All Dhan vendor payload shapes are PROVISIONAL.** Request body, columnar historical response, `last_trade_time` format, `net_change` presence — all documented-only, never live-validated. | IPD | UNVERIFIED | `dhan_historical_dto.ts` / `dhan_dto.ts` header comments |
| H-12 | **No pagination/chunking for historical windows > 1825 days**, and no negotiation of vendor intraday limits. | IPD | MISSING | `validateDhanHistoricalRequest` |
| H-13 | **`bid`/`ask` cannot express "unavailable"** — absent depth becomes `0`, which passes canonical validation. | IPD | PARTIAL | `dhan_normalizer.ts` `topOfBook`; `d01_quotes.ts` |
| H-14 | **No market-data cache persistence.** Restart loses all observations and refresh history. | IPD | MISSING (deliberate) | zero `persistence`/`ipc` imports in `src/providers/dhan/**` |
| H-15 | **Configuration surface is inconsistent and partly undocumented**: two base-URL env names; `.env.example` example port 8790 ≠ daemon default 8791 (8790 is IRR's own port); `IIPS_DHAN_*` undocumented on the IRR side. | IRR (+ IPD for its own env) | PARTIAL (defect) | `.env.example:67`; `dhanMarketDataTransport.ts:48`; `marketDataTransportConfig.ts:19`; `DEFAULT_MARKET_DATA_DAEMON_PORT = 8791` |
| H-16 | **No operational documentation for quotes/historical/freshness or for starting the daemon**; `windows-setup` does not manage it. | IRR (docs) + IPD (startup docs) | MISSING | `docs/OPERATOR_RUNBOOK.md` §5.2 covers identity only; grep of `windows-setup/*` |
| H-17 | **No consumer beyond the five screens.** Portfolio `currentPrice` is hand-entered with no provenance/freshness; broker-holdings preview publishes no value; valuation uses fixture prices. | IRR | MISSING (integration) | `PersonalPortfolio.tsx`; `BrokerHoldingsPreview.tsx:416`; `iid6Fixtures.ts:146` |
| H-18 | **Two independent historical sources** (Dhan `D02` charts vs the D114/PIT offline dataset). No reconciliation, no shared freshness, no stated precedence. | **IPD + IRR** | ARCHITECTURAL QUESTION | `server/pit/nonProductionRuntimePitStore.ts`; `src/d114/*` |
| H-19 | **IPD ships a duplicate copy of IRR's Stage-2 consumer boundary** at `src/server/market-data/dhanMarketDataRoute.ts` ("reference location in the IRR repository"), while IRR's actual implementation has since diverged (`dhanMarketDataRoutes.ts` + `dhanMarketDataTransport.ts`). A drift point with a test attached to the stale copy. | IPD + IRR | PARTIAL (drift risk) | IPD `src/server/market-data/dhanMarketDataRoute.ts`; `tests/irr_stage2_market_data_route.test.ts`; IRR `frontend/server/market-data/*` |
| H-20 | **Rate-limit/cache numbers in IPD's admission record do not match the code.** The record states caches 2048/512, 5/s quote, 2/s historical, concurrency 4/2; the composed service actually uses cache 256, 60 requests/60 s, concurrency 8. | IPD (documentation) | PARTIAL (doc drift) | admission record §1.3 row 6 vs `dhan_market_data_service.ts:113-115` |
| H-21 | **IRR's runbook pin reference is stale**: it cites `279d1eed…`, while `package.json` pins `1aee57f…`. | IRR (documentation) | PARTIAL (doc drift) | `docs/OPERATOR_RUNBOOK.md:14` vs `frontend/package.json:26-28` |
| H-22 | **IRR's Dhan tests were not executed in this investigation.** No `node_modules`; the lockfile resolves IPD via `git+ssh://`. Their passing status is unverified here. | IRR | UNVERIFIED | environment limitation |
| H-23 | **No live qualification harness exists.** `providerQualification` is a hard-coded literal with no path to any other value, and no gated live suite (e.g. `DHAN-OQ-LIVE`) is present in either repository. | IPD | MISSING | grep for `DHAN-OQ-LIVE`/`LIVE_QUALIFIED` returns only literals and doc text |
| H-24 | **Status exposes no provider latency, heartbeat, last-success time or last provider failure reason** over HTTP. | IPD | PARTIAL | `ProviderHealth` not routed; `getLastFailure()` unused by any route |
| H-25 | **No persistent diagnostics/log sink or request correlation** across IRR → daemon → vendor. | IPD + IRR | MISSING | console/stderr only |

---

## I. Recommended Investigation Follow-ups (evidence needed — not an implementation plan)

These are the specific accesses or artefacts required to close the material unknowns above. They are **not** a roadmap.

1. **Confirm the intended Windows secret-store technology and its existing prerequisites on the target machine** (H-1, H-2). Needed: the operator's decision on the concrete store, plus evidence of whether DPAPI user scope or Windows Credential Manager is already usable there without new dependencies. Without this, H-1 is a technical dead end that no amount of credential provisioning can pass.
2. **Obtain the daemon's startup diagnostics line from the actual Windows installation** (`vaultBackend=`, `liveCredentialResolution=`, `vendorEgress=`, `qualifiedMappings=`). This single line distinguishes "unconfigured" from "blocked by code" on the real machine and confirms whether the P7 manifest is found there (H-10, H-16).
3. **Resolve the configuration-name/port contradiction before any live attempt** (H-15): decide which single base-URL variable is authoritative, correct the `.env.example` port, and document `IIPS_DHAN_*` for the IRR side (or decide that the Status screen should read readiness from the daemon instead — H-4).
4. **Establish the vendor contract empirically at first access**: capture one raw `/marketfeed/quote` and one raw `/charts/historical` response (redacted of any credential) and compare against `dhan_dto.ts` / `dhan_historical_dto.ts` assumptions — particularly `last_trade_time` format, `net_change` presence, columnar ordering, and whether daily timestamps are IST-midnight or UTC-midnight (H-11, H-6).
5. **Obtain independent confirmation that the 96 qualified mappings are still current** for a small sample (e.g. 5 companies across NSE/BSE), and confirm how often the CSV source changes (H-9, H-10).
6. **Decide and record the precedence between the Dhan `D02` chart path and the D114/PIT historical dataset** before any consumer adopts historical data (H-18).
7. **Establish the intended behavioural contract for the Status capability** — specifically, what evidence would legitimately allow `AUTHENTICATED` and `OPERATIONAL`. That is a technical contract question (what signal would the provider emit and how would IRR verify it), and it must be answered before the Status screen can ever be truthful about a live provider (H-3, H-24).
8. **Confirm the freshness policy outside market hours** — whether a 900 s D01 threshold applied at 02:00 IST is acceptable behaviour for this single-user application, or needs session awareness (H-7).
9. **Execute IRR's Dhan test suite on the Windows installation** (or any environment with the git+ssh dependency resolvable) to convert H-22 from UNVERIFIED to VERIFIED.
10. **Confirm ownership of the duplicated Stage-2 consumer copy** in IPD (`src/server/market-data/dhanMarketDataRoute.ts` + its test) — whether it is retained as a reference or should be treated as superseded by IRR's own boundary, so future work does not "fix" the wrong file (H-19).
11. **Reconcile IPD's admission-record figures with the code** (H-20) so future operational tuning is based on the values actually in force.
12. **Confirm which process is intended to hold `IIPS_DHAN_*` pointers** — one process (IPD only) or both — because the current split means the Status screen and the data path can disagree (H-4, H-15).

---

## Appendix A — Verbatim runtime observations (local, synthetic, no vendor egress)

All observations were produced on the sandbox host (Node v22.22.3) from IPD `main` `a624d06`, compiled with `npx tsc` (exit 0). The daemon was started with `IIPS_MARKET_DATA_TRANSPORT_TOKEN` set to a throwaway local value and **no** Dhan credentials. Because `liveCredentialResolution=false`, `vendorEgressMode=DISABLED_PRE_ACCESS`, **no socket to Dhan was possible**.

**A-1 — daemon startup (cwd = repo root):**
```
[ipd-market-data-daemon] listening on http://127.0.0.1:8791
(providerReadiness=PRE_ACCESS_CREDENTIALS_UNAVAILABLE,
 vaultBackend=UNPROVISIONED_WINDOWS_HOST_VAULT,
 liveCredentialResolution=false,
 vendorEgress=DISABLED_PRE_ACCESS,
 qualifiedMappings=96)
```

**A-2 — quote for a mapped identity (`EQ_RELIANCE_IN`, `ISIN:INE002A01018:EQ`, `NSE_EQ`):**
```json
{"error":{"code":"CREDENTIALS_UNAVAILABLE",
"message":"Dhan credentials are not available; provider is operating in pre-access mode"}}
```

**A-3 — historical, `EQ_RELIANCE_IN`, `1D`, 2026-01-01..2026-02-01:** identical `CREDENTIALS_UNAVAILABLE`.

**A-4 — quote for an unmapped company (`EQ_HCLTECH_IN`):**
```json
{"error":{"code":"UNRESOLVED_INSTRUMENT",
"message":"UNMAPPED_COMPANY_ID: No Dhan instrument mapping registered for exact security identity
ISIN:INE860A01027:EQ of companyId 'EQ_HCLTECH_IN' on segment NSE_EQ."}}
```

**A-5 — mapped company, wrong series for the segment (`EQ_RELIANCE_IN`, `ISIN:INE002A01018:A`, `NSE_EQ`):** `UNRESOLVED_INSTRUMENT` / `UNMAPPED_COMPANY_ID` — segment/series binding is exact.

**A-6 — malformed identity (`"RELIANCE"`):** `{"error":{"code":"MALFORMED_REQUEST","message":"quotes require companyId and a canonical securityId (ISIN:<isin>:<series>)"}}`.

**A-7 — historical window beyond the cap (2020-01-01..2025-01-01):**
```json
{"error":{"code":"INVALID_DATE_RANGE",
"message":"Requested window of 1828 days exceeds the configured per-request maximum of 1825 days"}}
```
(2021-11-12..2026-11-11 → `1826 days` rejected.)

**A-8 — 1825-inclusive-day window (2021-11-13..2026-11-11)** passes validation and returns `CREDENTIALS_UNAVAILABLE`. Unsupported interval `1w` → `{"error":{"code":"UNSUPPORTED_INTERVAL","message":"Unsupported historical interval: 1w"}}`.

**A-9 — `/v1/freshness?domain=D01_QUOTES…` after one failed quote:**
```json
{"domain":"D01_QUOTES","cacheState":"MISS","asOf":null,"timestampEvidence":"NOT_AVAILABLE",
"receivedAt":null,"evaluatedAt":"2026-11-11T19:40:56.000Z","observationEvaluatedAt":null,
"thresholdSeconds":900,"ageSeconds":null,"verdict":"UNKNOWN","staleConcessionActive":false,
"suppressExecution":true,"eligibleForUse":false,
"lastRefresh":{"outcome":"FAILURE","lastFailure":{"code":"REFRESH_FAILED","priorPreserved":false}}}
```

**A-10 — `/v1/freshness?domain=D02_OHLCV`** → `cacheState:"NOT_AVAILABLE"`, `verdict:"UNKNOWN"`, `lastRefresh.outcome:"UNKNOWN"`, `thresholdSeconds:86400`. A fresh process with no prior activity returns `cacheState:"MISS"` and `lastRefresh.outcome:"UNKNOWN"` for D01 — i.e. the read is genuinely passive.

**A-11 — `/v1/health` and auth:**
```json
{"service":"UP","providerConfiguration":"PRE_ACCESS_CREDENTIALS_UNAVAILABLE",
"liveProviderConnectivity":"NOT_CHECKED_PRE_ACCESS",
"providerQualification":"SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED"}
```
Unauthenticated request → `401`. `SIGTERM` → clean shutdown (`received SIGTERM, shutting down cleanly` / `stopped`).

**A-12 — identity routes work without any Dhan credential.** `POST /v1/instruments/search {"query":"INFY"}` → two `QUALIFIED` rows (`EQ_INFY_IN`, `ISIN:INE009A01021:EQ` on NSE, `ISIN:INE009A01021:A` on BSE). `POST /v1/identity/qualify {"exchange":"NSE","symbol":"INFY"}` → `{"status":"UNRESOLVED","reason":"MISSING_ISIN"}`. `POST /v1/identity/resolve` with the exact identity → `QUALIFIED` with `isinAuthority: NON_AUTHORITATIVE`.

**A-13 — P7 manifest resolution is cwd-independent.** Started with cwd `/tmp` (foreign directory) the daemon still reported `qualifiedMappings=96`, confirming module-relative manifest resolution. Note the consequence: the daemon must run from an **IPD git checkout** — `package.json` publishes only `dist/package`, so `evidence/dhan-p7/` does not exist in an npm-installed copy.

---

## Appendix B — Evidence index

| ID | Claim | Location |
|---|---|---|
| E-01 | IRR pins IPD at `1aee57f…` (and NP-04 at `2e11fa3b…`) | `frontend/package.json:26-28`; `frontend/package-lock.json:11-13, 2342, 2352` |
| E-02 | Dhan surface identical between pin and IPD `main` | `git diff --stat 1aee57f main -- src/providers/dhan src/contracts src/spi src/index.ts package.json` → only `portfolio_restore_ipc.ts` |
| E-03 | Credential env keys | IPD `src/providers/dhan/dhan_config.ts` `DHAN_ENV_KEYS` |
| E-04 | Pointer-only config + readiness enums | same, `resolveDhanProviderConfig`, `describeDhanConfig` |
| E-05 | Live resolution disabled | IPD `dhan_local_vault_resolver.ts` `DisabledWindowsHostVaultBackend.describeReadiness()` → `liveResolutionSupported: false` |
| E-06 | Egress gating | IPD `dhan_local_daemon.ts` transport-selection block |
| E-07 | Vendor egress hardening | IPD `dhan_server_egress.ts` |
| E-08 | Two-layer transport + bearer auth + loopback pinning | IPD `dhan_market_data_http.ts` |
| E-09 | Health literals | IPD `dhan_market_data_service.ts:61-70` |
| E-10 | Client rejects non-literal health | IPD `dhan_market_data_http.ts:627-628` |
| E-11 | Five-state classifier | IRR `frontend/server/market-data/dhanHealthState.ts` |
| E-12 | Health reads IRR's own `IIPS_DHAN_*` | IRR `dhanHealthTransport.ts` + `dhanMarketDataRoute.ts:95-135`; `executive-transport.ts:1039-1046` |
| E-13 | Quote transport path | IRR `dhanMarketDataRoutes.ts`; IPD `MarketDataTransportClient` |
| E-14 | `previousClose` from `net_change` only | IPD `dhan_normalizer.ts` |
| E-15 | IST timestamp handling | IPD `dhan_dto.ts` `parseDhanTradeTimeToUtcIso` |
| E-16 | 1825-day guard + inclusive arithmetic | IPD `dhan_historical_dto.ts` |
| E-17 | Duplicate/out-of-order/empty handling | IPD `dhan_historical_adapter.ts`, `parseDhanHistoricalResponse` |
| E-18 | D02 cache not wired | IPD `dhan_market_data_service.ts` `getHistorical`, `getFreshness` |
| E-19 | Freshness thresholds/constants | IPD `src/quality/freshness_evaluator.ts` |
| E-20 | Read-only freshness (peek) | IPD `dhan_operational_controls.ts` `peek`; `dhan_freshness_status.ts` |
| E-21 | 96 mappings / 48 companies | IPD `evidence/dhan-p7/qualification-report.md`, `qualification-manifest.json` |
| E-22 | Package ships only `dist/package` | IPD `package.json` `files` |
| E-23 | Canonical contracts | IPD `src/contracts/envelope.ts`, `d01_quotes.ts`, `d02_ohlcv.ts`, `src/spi/provider_spi.ts` |
| E-24 | Provider-neutral route/view | IPD `src/providers/market_data_route.ts` |
| E-25 | Zero persistence coupling | grep of `src/providers/dhan/*.ts` for `persistence`/`ipc/` → none |
| E-26 | Admission record | IPD `docs/integration/DHAN-STAGE1-CREDENTIAL-AND-TRANSPORT-ADMISSION-2026-11-08.md` |
| E-27 | Consumers without market data | IRR `PersonalPortfolio.tsx`, `BrokerHoldingsPreview.tsx:416`, `investment/sources.ts`, `iid6Fixtures.ts:146-147`, `watchlists/*`, `screener/*`, `reports-transport.ts` |
| E-28 | Env-name/port inconsistency | IRR `.env.example:67`; `marketDataTransportConfig.ts:19`; `dhanMarketDataTransport.ts:48,55` |
| E-29 | Runbook gap | IRR `docs/OPERATOR_RUNBOOK.md` §5.2, §9 |
| E-30 | Windows setup does not manage the daemon | IPD `windows-setup/*` (grep: no `market-data-daemon`) |
| E-31 | Runtime observations A-1..A-13 | this document, Appendix A |

---

**End of investigation.** No implementation, adjustment or remediation was performed, and no roadmap is proposed here. The findings above are the factual baseline for a separately prepared implementation roadmap.
