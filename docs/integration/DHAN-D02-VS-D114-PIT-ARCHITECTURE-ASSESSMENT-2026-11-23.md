# IIPS – Dhan Live Integration: Dhan D02 vs D114/PIT — Architecture Assessment and D-4 Decision Guide

**Document ID:** `DHAN-D02-VS-D114-PIT-ARCHITECTURE-ASSESSMENT-2026-11-23`  
**Date:** 2026-11-23  
**Status:** Independent Architecture Assessment (Decision Support for **D-4**; **No implementation performed; no D-4 decision enacted**)  
**Primary Governing Reference:** `docs/integration/DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md` (`DHAN-LIVE-ROADMAP-2026-11-11`, v1.1)  
**Prior Assessment:** `W-20 & D-4 Independent Investigation and Dependency Assessment Report` (`2026-11-23`)  
**Repository State Inspected:** IRR (`ramkivs/iips-review-recovered`) `main` at `22a68a4` (post-PR #625; PR #626 `W-31` open). IPD (`ramkivs/iips-production-market-data`) was not directly readable from this environment (`403`/`404`); IPD facts are drawn strictly from IRR-checked-in investigation records, package pins (`1ce6a829…`, `2e11fa3b…`, `12a3d625…`), and IRR's integration code and test suites.

---

### How Statements Are Labelled in This Document

To keep verified codebase facts separate from governance rules and design proposals, statements throughout this document carry explicit tags:

- **[VERIFIED FACT]** — Directly observed in IRR source files, test files, package pins, or committed investigation/PR records.
- **[GOVERNANCE]** — Established by an existing approved governance or admission record (e.g., Gate `B2`, `CV-32`, `IID R-6`, `DHAN-LIVE-ROADMAP-2026-11-11`).
- **[ASSUMPTION]** — Reasonable working assumption about intended product use where no formal decision exists yet.
- **[RECOMMENDATION]** — Assessment and design advice proposed for the owner's **D-4** decision.

---

## 1. Executive Summary

**[VERIFIED FACT]** IIPS currently contains **two completely separate historical market-data mechanisms** that do not talk to each other:

1. **Dhan `D02` (`D02_OHLCV`, via `POST /api/dhan/historical`):** A live-vendor **date-range chart/bar API** designed to ask Dhan for Open–High–Low–Close–Volume (`OHLCV`) candles over a requested date window (for example, the last 1–5 years of daily prices, or recent intraday bars). Today it is **blocked pre-access / unverified against live Dhan**, has **no cache or freshness evidence**, and assumes `isAdjusted: false` (no corporate-action adjustments).
2. **D114 / PIT (`Point-in-Time Store`, via `GET /api/pit/market-data`):** A **point-in-time historical snapshot store** populated from offline exchange archive files (NSE/BSE Bhavcopy / D114). It answers *"what record did the system hold as of a specific date/time?"* without leaking future revisions. Today it is strictly **gated to non-production offline fixtures** (`20` in-memory test records total, including `12` D114 records for TCS), supports **only single-instant lookups** (not multi-day chart ranges), and has **no UI consumer**.

**[VERIFIED FACT]** Roadmap decision **D-4** (*"Decide D02 (Dhan) vs D114/PIT historical precedence"*) currently has **no accepted decision** in IRR, and Phase 4 work item **W-20** (*"Implement the D02 / D114-PIT precedence boundary"*) is **OPEN / NOT STARTED**.

**[RECOMMENDATION]** Do **not** force Dhan `D02` and `D114/PIT` to act as silent fallbacks for one another, and do **not** prematurely build a heavy local database pipeline to copy all Dhan candles into a durable PIT store before Dhan `D02` even works live. Instead, adopt **Option C (Separate Responsibilities by Use Case, with Explicit Source Selection, Non-Blending, and Artifact-Level Snapshot Capture)**:
- Use **Dhan `D02`** strictly for **date-range charting and historical price inspection** (`1m..1D`, up to 1,825 days), transparently labelled with D02 provenance, adjustment state, and D02 freshness (`W-19`).
- Reserve **D114 / PIT** (once its non-production admission gate is lifted/expanded) for **point-in-time replay and backtesting** where future-leakage protection (`asOf` versioning) is mandatory.
- Preserve **IID's existing `R-6` rule (`PIT_D01 → DATASET_EOD → withhold`)** for **Company Valuation / Margin of Safety** and **Persisted Reports (`NP-06`)**, embedding the exact price observation and provenance inside the immutable saved report/assessment so reports can be reproduced months later without re-querying Dhan.

---

## 2. Dhan D02 Explained in Simple English

### What it is and where the data comes from
**[VERIFIED FACT]** **Dhan `D02`** (domain `D02_OHLCV`) is IIPS's interface to Dhan's commercial market-data API (`POST https://api.dhan.co/v2/charts/historical`), mediated by the local IPD daemon (`iips-production-market-data/dhan-server`, pinned at `1ce6a829…`). The data originates externally from **Dhan** at the moment a user asks for it.

### What type of historical data it provides and how it is requested
**[VERIFIED FACT]** It provides **time-series price bars (`OHLCV` candles)**: open, high, low, close, volume, and candle start/end timestamps.
- The user/application sends a **date-range request**: `companyId`, optional `exchangeSegment` and `isin`, an `interval` (`1m`, `5m`, `15m`, `1h`, or `1D`), and `fromDate` to `toDate` (`YYYY-MM-DD`).
- **Simple example:** *"Give me every daily price bar for Reliance from `2023-11-23` to `2026-11-23`."*

### Date-range vs point-in-time
**[VERIFIED FACT]** Dhan `D02` is **strictly a date-range query**, **not** a point-in-time (`asOf`) query. When you ask Dhan for 2024 prices today, Dhan returns whatever historical series Dhan currently serves today—it does **not** tell you whether Dhan revised a candle last week, whether a split adjustment was applied retroactively, or what IIPS actually knew on a past date.

### Supported periods, intervals, and identity
**[VERIFIED FACT]**
- **Intervals:** `1m`, `5m`, `15m`, `1h`, `1D` (weekly `1w` and monthly are rejected).
- **Window cap:** Maximum **1,825 inclusive days** (~5 years) per request, enforced deterministically by both IPD and IRR (`validateDhanHistoricalRequest`). There is no automatic multi-request chunking or pagination.
- **Identity & coverage:** Uses `companyId` (and optionally `exchangeSegment`/`isin`), resolved against IPD's P7 instrument registry—which currently covers only **48 unique companies (96 NSE/BSE equity rows)** out of 23,764 candidates (`DHAN-LIVE-MARKET-DATA-CURRENT-STATE-INVESTIGATION-2026-11-11.md` §E). Note an existing asymmetry: `POST /api/dhan/quotes` requires exact `ISIN:<isin>:<series>`, whereas IPD's historical path can resolve by `companyId` alone if segment/ISIN are omitted.

### Live vs synthetic status, freshness, and provenance
**[VERIFIED FACT]**
- **Current status:** **Unverified against live Dhan (`BLOCKED-CODE` / `E4` pending).** In IPD `a624d06`, the request/response DTO (`dhan_historical_dto.ts`) is explicitly marked **PROVISIONAL** (based on docs, never tested live). In addition, `DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md` found IPD's quote request builder sent string security IDs instead of numbers (causing HTTP 400 `DH-905`), and flagged the historical builder to be checked for the same defect (`W-12`/`W-14`).
- **Freshness:** IPD's composed service **does not wire a D02 cache or refresh orchestrator** (`Gap 2` / `W-19`). `GET /v1/freshness?domain=D02_OHLCV` always returns `cacheState: 'NOT_AVAILABLE'`, `verdict: 'UNKNOWN'`, `evidenceAvailable: false`.
- **Provenance & adjustments:** Every IRR response carries `coverageClaim: 'ACCESS_PENDING_UNVERIFIED'` and `providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED'`. Every candle declares `isAdjusted: false` (no corporate-action adjustment applied or verified).

### Current limitations (plain summary)
1. Never tested against live Dhan (`E4` pending); vendor payload shape and `DH-905` numeric ID handling unverified.
2. No D02 cache and no freshness evidence (`W-19` pending).
3. Limited to 48 P7-mapped companies and 1,825 inclusive days per call.
4. No corporate-action adjustment verification (`isAdjusted: false`) and no historical revision/vintage tracking.

---

## 3. D114/PIT Explained in Simple English

### What it is and where the data comes from
**[VERIFIED FACT]** **D114 / PIT** stands for **Dataset D114 (NSE/BSE Exchange Bhavcopy archives) stored in IPD's Point-in-Time (`PIT`) store** (`iips-np04-governed-persistence/pit` and `/d114-non-production`, pinned at `2e11fa3b…`). Instead of calling an external broker API, IPD's `HistoricalPitIngestionLoader` parses local exchange archive files (CM-UDiFF and Legacy Bhavcopy) into canonical `D01_QUOTES` (end-of-day quote snapshot) and `D02_OHLCV` (daily candle) records and appends them with timestamps into `PointInTimeStore`.

### What type of historical data it provides and how it is requested
**[VERIFIED FACT]** It answers **point-in-time (`asOf`) queries**:
- The caller sends `GET /api/pit/market-data?securityId=ISIN:<isin>:<series>&domain=<D01_QUOTES|D02_OHLCV>&asOf=<UTC ISO-8601>`.
- The store finds the latest record for that exact security and domain whose recorded timestamp (`resolvedAsOf`) is **at or before** the requested `asOf`. Any record ingested or effective *after* `asOf` is invisible.
- **Simple example:** *"What closing price record did IIPS hold for TCS (`ISIN:INE467B01029:EQ`) as of `2026-02-10T23:59:59Z`, ignoring anything recorded after that date?"*

### Why "date-range" and "point-in-time" are fundamentally different questions
Consider why both questions exist in an investment application:
- **Date-range question (Dhan `D02`):** *"Draw me Reliance's daily price chart for the last 3 years."* You want a clean, continuous series of bars (`Day 1, Day 2, …, Day 750`) to inspect trends and volatility.
- **Point-in-time question (D114 / PIT):** *"On 15 March 2024, when I was evaluating whether to buy Reliance, what price and data did the system actually know on that day?"* If a stock split or data correction happened in 2025, a point-in-time query for 15 March 2024 **must not** silently return the 2025-restated world—otherwise backtests and historical audits suffer from **look-ahead bias** (cheating with future knowledge).

### Supported periods, intervals, identity, and governance status
**[VERIFIED FACT]**
- **Intervals & queries:** Daily EOD archives only (`1d` Bhavcopy); **zero intraday support** (`1m`, `5m`, `15m`, `1h` do not exist in D114). The IRR boundary (`GET /api/pit/market-data`) accepts **only single-instant `asOf` lookups**—it has no `fromDate..toDate` range query endpoint.
- **Identity:** Strict `ISIN:<12-char-alnum>:<series>` (validated fail-closed). Series `EQ` and `BL` are strictly isolated. Provenance stamps `isinAuthority: 'NON_AUTHORITATIVE'`.
- **Offline fixture vs live/production status:** In IRR's runtime today (`nonProductionRuntimePitStore.ts`), the store is populated once at server boot in memory with **20 total records** (`12` D114 archive fixture records across 3 dates for TCS + `8` retained test fixture records).
- **[GOVERNANCE] Admission limits (`B2` & `CV-32`):**
  - `IIPS_v3.0_G1_B2_PIT_D114_CAPABILITY_ADMISSION_DECISION.md` (`2026-10-15`) admits `./pit` and `./d114-non-production` **exclusively for non-production verification** and explicitly excludes production execution or live/historical Dhan acquisition.
  - `PKG-05-PIT-CV32-DISPOSITION-PACKET.md` (`2026-10-18`) closes CV-32 **API-ONLY** and keeps P4 route admission **`retained, NOT ADMITTED`** for product consumption. `frontend/src/api/pit.ts` (`fetchPitAsOf`) has **zero callers** in `frontend/src/`.

### Provenance, versioning, and current limitations
**[VERIFIED FACT]** Every hit returns `resolvedAsOf`, `requestedAsOf`, `dataVersion` (e.g., `v1.0.0-d114-historical`), `lineageHash` (SHA-256), and `securityIdentity.isinAuthority`.  
**Current limitations:**
1. Non-production admission only (`B2` / `CV-32` block product use today).
2. In-memory boot-time fixture population (`20` records); no live/automated daily Bhavcopy ingestion pipeline wired into IRR.
3. No multi-candle range query (`fromDate..toDate`), no intraday intervals, and no UI consumers.

---

## 4. Side-by-Side Comparison

| Comparison | Dhan D02 (`D02_OHLCV`) | D114 / PIT (`PointInTimeStore`) |
|---|---|---|
| **Data origin** | **[VERIFIED]** External commercial vendor API (`https://api.dhan.co/v2/charts/historical`) via IPD daemon. | **[VERIFIED]** Local exchange archive files (NSE/BSE Bhavcopy / D114) ingested into IPD's `PointInTimeStore`. |
| **Type of historical information** | **[VERIFIED]** `OHLCV` candle series over a date window. | **[VERIFIED]** Versioned point-in-time records (`D01_QUOTES` EOD snapshot or `D02_OHLCV` single daily candle) as known at `asOf`. |
| **Date-range queries** | **[VERIFIED]** Yes (`fromDate..toDate`, max 1,825 inclusive days). | **[VERIFIED]** No (`GET /api/pit/market-data` accepts only single-instant `asOf`). |
| **Point-in-time queries** | **[VERIFIED]** No (returns whatever Dhan serves at query time; no vintage/knowledge-cutoff model). | **[VERIFIED]** Yes (`queryAsOf` guarantees `resolvedAsOf <= asOf`; future-leakage blocked and tested). |
| **Intraday intervals** | **[VERIFIED]** Contract supports `1m`, `5m`, `15m`, `1h` (live Dhan parsing **UNVERIFIED**). | **[VERIFIED]** None (`1d` EOD Bhavcopy only). |
| **Daily historical prices** | **[VERIFIED]** Contract supports `1D` up to 1,825 days/call (**UNVERIFIED** live). | **[VERIFIED]** Yes (`1d` canonical candle in D114 fixtures; **non-production only**). |
| **Historical availability** | **[VERIFIED]** Limited to 48 P7-mapped companies; live depth/earliest date **UNVERIFIED**. | **[VERIFIED]** Currently **only 20 in-memory records** (3 TCS dates + 8 mock records) at boot. |
| **Data freshness** | **[VERIFIED]** Structurally **MISSING (`NOT_AVAILABLE` / `UNKNOWN`)** in IPD (`W-19` pending); IRR route still stamps `freshness: 'SNAPSHOT'`. | **[VERIFIED]** N/A as live freshness — governed by immutable vintage (`resolvedAsOf` and `dataVersion`). |
| **Historical versioning** | **[VERIFIED]** None (no vintage, no `lineageHash`, no persistence in `src/providers/dhan/**`). | **[VERIFIED]** Append-only `PointInTimeStore` with `resolvedAsOf`, `dataVersion`, and `lineageHash`. |
| **Provenance and auditability** | **[VERIFIED]** `coverageClaim: ACCESS_PENDING_UNVERIFIED`, `providerQualification: SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED`; `DHAN-W24` prohibits inventing D02 trace provenance. | **[VERIFIED]** Strong per-record provenance (`dataVersion`, `lineageHash`, `resolvedAsOf`, `isinAuthority: NON_AUTHORITATIVE`). |
| **Corporate-action adjustments** | **[VERIFIED]** `isAdjusted: false` declared on every candle; adjustment policy **UNVERIFIED** live. | **[VERIFIED]** Raw exchange Bhavcopy prices (unadjusted unless separate corporate-action factors are applied). |
| **Live qualification** | **[VERIFIED]** **NOT LIVE-QUALIFIED** (`W-12` historical builder check & `W-14` `E4` live proof pending). | **[VERIFIED]** Offline archive model; **no live vendor feed**. |
| **Current IIPS integration** | **[VERIFIED]** `POST /api/dhan/historical` → `/dhan/historical` UI (`DhanHistorical.tsx`); excluded from `W-29` quote boundary. | **[VERIFIED]** `GET /api/pit/market-data` server route only; `fetchPitAsOf` has **0 UI callers**. |
| **Current governance status** | **[GOVERNANCE]** `D-4` undecided; `W-20` open; `W-12`/`W-14`/`W-19` pending. | **[GOVERNANCE]** Gate `B2` (**non-production only**); `CV-32` **API-only**, P4 product consumption **NOT ADMITTED**. |
| **Main strengths** | Designed for multi-year daily & intraday charting over live vendor history without maintaining local Bhavcopy archives. | Eliminates look-ahead bias; deterministic, reproducible `asOf` answers with `dataVersion` + `lineageHash`. |
| **Main limitations** | Unverified live (`E4`), no D02 freshness (`W-19`), 48-company limit, 1,825-day cap, unadjusted/un-versioned. | Not admitted for production (`B2`/`CV-32`), no date-range API, no intraday, only 20 fixture records today. |

---

## 5. Implications for IIPS Features

### A. Charting and Historical Analysis
- **Daily and intraday charts:** **Dhan `D02`** is the only source designed for intraday (`1m..1h`) and range-based daily (`1D`) charting. `D114/PIT` has no intraday data and no range-query endpoint.
- **Short-term vs long-term periods:** Dhan `D02` caps a single request at **1,825 inclusive days** (~5 years). Longer multi-decade charts would require either chunked range queries (not implemented; `H-12`) or an archive store like `D114`.
- **Missing dates and consistency:** **[VERIFIED FACT]** Dhan `D02` currently has **no exchange-holiday or missing-trading-day validation** (`H-8`), and if `isAdjusted: false` across a stock split, a 3-year chart will show an artificial price cliff on the ex-date unless adjusted or clearly disclosed as unadjusted.
- **Required work:** `W-12` + `W-14` (`E4` live historical qualification), `W-19` (D02 cache & freshness), `W-21` (charting UI), and an explicit UI disclosure showing source (`Dhan D02`), adjustment status (`Unadjusted` vs `Adjusted`), and freshness (`SNAPSHOT`/`STALE`/`UNAVAILABLE`).

### B. Company Analysis and Valuation (`IID`)
- **Historical prices & Margin of Safety:** **[VERIFIED FACT]** `iips-platform/src/investment/assessment/margin.ts` (`selectPrice`, implementing `IID R-6`) enforces four strict rules before computing Margin of Safety:
  1. Price must exist at or before `generatedAt` (`NO_PRICE_OBSERVATION` otherwise).
  2. Price must satisfy `knownAsOf <= price.asOf` (no look-ahead leakage: `PRICE_PREDATES_KNOWLEDGE_CUTOFF`).
  3. Price age must be within the policy window (default 7 calendar days: `PRICE_OUTSIDE_POLICY_WINDOW`).
  4. **Corporate-action gate:** If any per-share corporate action (`SPLIT`, `BONUS`, etc.) occurred on or before `generatedAt`, the `PriceRecord` **must** carry `{ factor, corporateActionId }` matching that action—otherwise valuation is **refused** (`UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION`).
- **Relationship with existing `PIT_D01 → DATASET_EOD → withhold` rule:** **[GOVERNANCE / VERIFIED FACT]** `IIPS_V3_IID_INVESTMENT_INTELLIGENCE_DESIGN_REFINEMENT_2026-11-05.md` (`R-6`/`Q-5`) resolved MoS pricing as: `PIT_D01` snapshot → else `DATASET_EOD` → else withhold. Today in code (`iips-platform/src/investment/fundamentals/types.ts:69`), `PriceRecord.source` allows only `'PIT_D01' | 'DATASET_EOD'`, and all tested datasets use `DATASET_EOD` or `prices: []`.
- **Implication:** **Dhan `D02` cannot be plugged directly into IID valuation today** because it declares `isAdjusted: false` without `{ factor, corporateActionId }`, so `margin.ts` would rightly refuse it across any corporate action. Using Dhan `D02` (or `D01`) for current valuation requires either updating `D-4` + `PriceRecord.source` with explicit corporate-action alignment, or keeping `IID` on `PIT_D01` / `DATASET_EOD` (or curated EOD snapshots).

### C. Portfolio Analysis
- **Current state:** **[VERIFIED FACT]** Direct P1 user portfolios (`frontend/server/user-portfolio/`) read persisted holdings and revisions via IPD IPC; `PersonalPortfolio.tsx` stores manual `currentPrice`/`averageBuyPrice`; `BrokerHoldingsPreview.tsx` publishes no market value.
- **Historical holding performance & past-date portfolio valuation:** Computing how a portfolio performed from Date A to Date B requires **two aligned histories**:
  1. **Portfolio revision history** (which holdings and quantities the user held on each date — already supported by P1 revisions, though not yet linked to market-data time series).
  2. **Identity-matched, corporate-action-adjusted daily prices** (`ISIN:<isin>:<series>`).
- **Suitability:** For *approximate recent performance charts* of current holdings, Dhan `D02` (once `W-14` passes and P7 coverage expands beyond 48 companies) can supply daily closes—provided corporate-action splits are handled so performance isn't distorted. For *auditable valuation at a specific past date*, `D114/PIT` (or stored EOD snapshots) is safer because prices are tied to `ISIN:<isin>:<series>` and immutable `asOf` records.

### D. Backtesting and Point-in-Time Analysis
- **Suitability:** **Only `D114/PIT` (or a PIT-ingested versioned store) is suitable.**
- **Why Dhan `D02` is unsuitable directly:** Reconstructing what was known on a historical date requires preventing **future information leakage** (e.g., post-cutoff revisions or unrecorded restatements). `PointInTimeStore.queryAsOf` guarantees `resolvedAsOf <= asOf` and produces a `lineageHash` + `dataVersion`. Dhan `D02` has no `asOf` vintage model and no local persistence.
- **Additional work needed:** To run real backtests in the future, IPD/IRR would need (1) governance clearance beyond `B2`/`CV-32`, (2) multi-year daily Bhavcopy (or snapshot-ingested Dhan) archives loaded into durable `PointInTimeStore` storage, and (3) a range-over-time PIT query contract (`asOf` knowledge cutoff + `fromDate..toDate` bar window).

### E. Reports (`NP-06`) and Investment Decisions
- **Current state:** **[VERIFIED FACT]** `frontend/server/reports-transport.ts` persists immutable report artifacts and supersession chains in `NP-04`, currently with zero market-data price references. Separately, `IID` embeds `PriceObservation` inside persisted assessments.
- **Reproducibility & explainability:** If a report generated in January 2027 is re-opened in July 2027, **re-querying live Dhan `D02` would break reproducibility** (Dhan could return revised or differently adjusted bars, or be offline/expired).
- **Requirement:** Any persisted report or assessment must **embed the exact historical price/series summary + provenance (`source`, `asOf`/`dateRange`, `dataVersion`, `lineageHash`, `isAdjusted`, `freshness`) inside the immutable NP-04 artifact** at generation time (or reference an immutable `dataVersion` + `lineageHash` in a durable PIT store).

---

## 6. Existing Architecture and Current Implementation

### End-to-End Flow Today (Verified)

```
BROWSER (no credentials, no server imports — verified by verify-browser-bundle.mjs)
  ├─ /dhan/historical (DhanHistorical.tsx) ──► POST /api/dhan/historical
  ├─ /dhan/freshness  (DhanFreshnessStatus.tsx) ► GET /api/dhan/freshness?domain=D02_OHLCV
  └─ (no UI caller)   src/api/pit.ts          ──► GET /api/pit/market-data
                                                       │
IRR SERVER (frontend/server/executive-transport.ts)    │
  ├─ Path 1: dhanMarketDataRoutes.ts (handleDhanHistoricalRequest)
  │    • Validates companyId, interval (1m|5m|15m|1h|1D), YYYY-MM-DD <= 1825 days
  │    • Calls IPD POST /v1/historical + GET /v1/freshness?domain=D02_OHLCV
  │    • Hardcodes freshness='SNAPSHOT' & providerQualification='SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED'
  │    • NEVER reads PIT/D114 or falls back
  ├─ Path 2: quoteConsumptionBoundary.ts (W-29, PR #625)
  │    • Explicitly scoped to D01_QUOTES ONLY; excludes D02_OHLCV
  └─ Path 3: pit-transport.ts + frontend/server/pit/*
       • Boots single in-memory IPD PointInTimeStore (20 fixture records)
       • Validates ISIN:<isin>:<series>, domain, UTC asOf; blocks future leakage
       • NEVER calls Dhan or falls back to live data
```

### Key Implementation Observations

1. **IPD Dhan Historical Service (`iips-production-market-data/dhan-server` @ `1ce6a829…`):** Exposes `POST /v1/historical` and `GET /v1/freshness?domain=D02_OHLCV`. As documented in `DHAN-W11` (Gap 2), `D02` freshness returns a hardcoded `null` lookup (`NOT_AVAILABLE` / `UNKNOWN`). `src/providers/dhan/**` has **zero persistence imports**—all Dhan state is in-memory.
2. **IPD PIT/D114 Packages (`iips-np04-governed-persistence` @ `2e11fa3b…`):** Exports `./pit` (`PointInTimeStore`, `PitReadService`) and `./d114-non-production` (`populateNonProductionD114Pit`). Pin-verified by `.ci/verify-ipd-pins.mjs`. Restricted by `B2` and `CV-32` to non-production API verification.
3. **IRR `POST /api/dhan/historical` (`dhanMarketDataRoutes.ts`):** When called today, it validates the request, forwards it to the configured IPD daemon, concurrently fetches `D02_OHLCV` freshness, and returns `DhanHistoricalView`. **Contradiction observed:** `projectIpdHistoricalResult` stamps `freshness: 'SNAPSHOT'` on the historical response even when `freshnessStatus` for `D02_OHLCV` reports `cacheState: 'NOT_AVAILABLE'`, `verdict: 'UNKNOWN'`, `freshness: 'UNAVAILABLE'`.
4. **IRR `GET /api/pit/market-data` (`pit-transport.ts`):** When called today, it queries the in-memory 20-record `PointInTimeStore` (`12` D114 TCS records + `8` mock records). Invalid `securityId`/`domain`/`asOf` fails closed (`400`); absent records fail closed (`404`).
5. **W-29 Shared Quote Boundary (`quoteConsumptionBoundary.ts`):** Landed in PR #625 (`22a68a4`) for `D01_QUOTES` only (used by `W-31` Watchlists in PR #626). Explicitly leaves `D02_OHLCV` out of scope until `W-20` / `W-39`.
6. **IID Valuation (`iips-platform/src/investment/assessment/margin.ts`):** Pure domain logic reading `PriceRecord[]` from the local installed IID dataset (`DATASET_EOD`), enforcing `knownAsOf`, policy window, and corporate-action adjustment checks. Not connected to either `/api/dhan/historical` or `/api/pit/market-data`.

### Architectural Consequences of Different Integration Approaches

| Architectural Change | Complexity | Reliability | Maintainability & Future Development |
|---|---|---|---|
| **Keep sources strictly separate** | **Low** — keeps `D02` range routes and `PIT` `asOf` routes distinct. | **High** — zero silent substitution; failure modes stay isolated and predictable. | Easy to evolve independently; requires a shared provenance display convention so UI screens stay honest. |
| **Primary + explicitly permitted secondary** | **Medium** — requires a precedence router plus compatibility normalization (daily vs intraday, adjustment flags). | **Medium-Low if automatic** — dangerous if primary failures silently swap unadjusted vendor data with offline Bhavcopy. | Harder to test; increases coupling between `./dhan-server` (`1ce6a829…`) and `./pit` (`2e11fa3b…`). |
| **Governed historical-data interface** | **Medium** — thin server boundary (`historicalConsumptionBoundary.ts`, mirroring `W-29` `quoteConsumptionBoundary.ts`) selecting source by **declared intent/capability** (`range_ohlcv` vs `pit_as_of`). | **High** — enforces no-silent-fallback, no-blending, and unified provenance headers at one gate. | Cleanest seam for `W-39` consumers without merging the underlying data models. |
| **Store Dhan D02 in a versioned PIT store** | **High** — requires durable storage (SQLite/NP-04), ingestion scheduler, revision/restatement policy, corporate-action pipeline, and range-PIT queries. | **Medium initially** — prone to partial-batch, vendor-revision, and adjustment-drift bugs until hardened. | High ongoing operational weight for a single-user local app; warranted only if full live-bar backtesting becomes a core product requirement. |

---

## 7. Dependencies and Governance

### Roadmap & Technical Dependencies

| ID | Plain-English Meaning | Why It Matters | Current Status | Classification |
|---|---|---|---|---|
| **D-4** | Owner decision defining D02 vs D114/PIT precedence, fallback, provenance, and non-blending rules | Legal & architectural authorization for `W-20`; prevents wrong prices entering valuation or backtests | **UNDECIDED** (no proposal or acceptance record exists) | **Mandatory before W-20** |
| **W-12** | Verify/fix Dhan historical request builder (`DH-905` numeric ID check + body shape) | Without this, live Dhan historical calls can fail HTTP 400 just like quotes did | **PENDING** (`DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md`, `DHAN-W14`) | **Mandatory before live D02** |
| **W-13** | Live qualification of historical response DTO, timestamps, `volume`, `isAdjusted` | Vendor historical DTO is marked **PROVISIONAL** in IPD; unverified fields risk wrong prices | **PENDING** (`E4` not captured) | **Mandatory before live D02** |
| **W-14** | Live Dhan historical execution (`E4`) across supported intervals | Proves D02 actually works end-to-end against real Dhan | **PENDING** (PR #626 `DHAN-W14-INVESTIGATION`) | **Mandatory before W-20 closure** |
| **W-19** | Wire IPD `D02_OHLCV` cache and `GET /v1/freshness?domain=D02_OHLCV` | Without `W-19`, D02 freshness is always `UNKNOWN`/`NOT_AVAILABLE` | **PENDING** (`DHAN-W11` Gap 2) | **Mandatory for truthful D02** |
| **W-20** | Implement D02 / D114-PIT precedence boundary in IPD + IRR | Enforces `D-4` rules, provenance, and fail-closed behaviour | **OPEN / NOT STARTED** | **Target item (after D-4)** |
| **W-21** | Historical / charting UI surfaces | Presents historical series to user with provenance & freshness | **PARTIAL** (`DhanHistorical.tsx` diagnostic view exists; product charts not built) | **Follow-on / UI** |
| **W-39** | Connect remaining IRR consumers to governed quotes & historical data | Brings market data into portfolio, analysis, reports | **NOT STARTED** (`DHAN-W29` §8) | **Downstream (after W-20)** |

### Governance, Policy, and Packaging Dependencies

1. **`B2` & `CV-32` PIT/D114 Restrictions (`[GOVERNANCE]`):** Currently restrict `./pit`, `./d114-non-production`, and `/api/pit/market-data` to **non-production API verification** (`P4 retained, NOT ADMITTED`). **Mandatory:** If `D-4` assigns *any* production or product-UI role to D114/PIT, a formal admission update superseding `B2`/`CV-32` is required; if `D-4` keeps PIT/D114 non-production until a later phase, `D-4` must say so explicitly.
2. **Existing IID Valuation Policy (`R-6` / `Q-5`, `[GOVERNANCE]`):** Already governs Margin of Safety (`PIT_D01 → DATASET_EOD → withhold`) with strict `knownAsOf` alignment and corporate-action refusal. **Mandatory:** `D-4` must explicitly state whether `IID` remains untouched on `R-6` or how Dhan `D02` interacts with it.
3. **Corporate-Action Adjustments:** **[VERIFIED FACT]** `margin.ts` refuses unadjusted prices across splits/bonuses; Dhan `D02` sets `isAdjusted: false`. Any consumer mixing or using D02 for multi-year returns or valuation must either verify Dhan's adjustment behavior (`W-13`/`W-14`) or attach explicit `isAdjusted: false` warnings/refusals.
4. **Provenance & Data-Version Requirements:** **[GOVERNANCE]** `DHAN-W24-OWNER-DECISION-PROPOSAL-2026-11-21.md` explicitly warns *"Do not invent canonical D02 provenance"* before IPD supports it. Any `W-20` contract must require explicit source tags, `dataVersion`, and honest `D02` freshness (`SNAPSHOT` must not be hardcoded when freshness is `UNKNOWN`).
5. **IPD Package Pins & Compatibility:** **[VERIFIED FACT]** IRR pins `./dhan-server` (`1ce6a829…`) and `./pit` (`2e11fa3b…`) via `.ci/verify-ipd-pins.mjs`. Coordinated IPD+IRR changes in `W-20` require pin advancement and preserving `verify-browser-bundle.mjs` server-only isolation.

---

## 8. Architectural Options

### Option A — Dhan D02 as the Primary Historical Source Everywhere
- **How it works:** All historical requests (charting, valuation, portfolio history, backtesting) route to Dhan `D02_OHLCV`; `D114/PIT` remains isolated as a legacy/test API.
- **Features supported:** Daily and intraday charting (once `W-12`/`W-14`/`W-19` complete) for the 48 mapped companies within 1,825 days.
- **Architectural changes & dependencies:** Requires expanding P7 coverage well beyond 48 companies, fixing `W-12`/`W-14`/`W-19`, amending IID `R-6`, and adding corporate-action adjustment logic.
- **Advantages:** Single live vendor pipeline; no Bhavcopy archive maintenance.
- **Disadvantages & risks:** **Breaks point-in-time integrity and reproducibility.** Dhan `D02` has no `asOf` vintage model (look-ahead bias in backtests), fails beyond 1,825 days, lacks adjustment metadata (`margin.ts` would refuse it across splits), and leaves reports irreproducible if vendor answers change.
- **Impact & maintenance:** Low initial storage work, high long-term correctness risk for valuation and backtesting.

### Option B — D114/PIT as the Primary Historical Source Everywhere
- **How it works:** All historical queries read from a governed PIT store populated by exchange Bhavcopy (D114); Dhan `D02` is limited to rare ad-hoc/intraday lookups.
- **Features supported:** Reproducible daily EOD prices, `asOf` valuation, and backtesting.
- **Architectural changes & dependencies:** **Major.** Requires lifting `B2`/`CV-32`, building automated daily NSE/BSE Bhavcopy ingestion into durable storage (`NP-04` or SQLite), adding a multi-day range-query contract to `/api/pit/market-data` (which only does single-instant `asOf` today), and keeping Dhan `D02` only for intraday.
- **Advantages:** Strongest auditability, full market breadth (not capped at 48 companies), zero vendor rate-limit/window limits for daily EOD.
- **Disadvantages & risks:** Cannot serve intraday (`1m..1h`) or real-time recent bars without daily batch ingestion; heavy data-ingestion burden on a single-user local app when Dhan API access is already being built.
- **Impact & maintenance:** High infrastructure and operational ingestion overhead (handling Bhavcopy format changes, holidays, and local archive growth).

### Option C — Separate Responsibilities by Use Case (Explicit Selection, Non-Blending, Artifact Snapshot Capture)
- **How it works:** Keep `Dhan D02` and `D114/PIT` as **purpose-specific authorities** behind a thin governed boundary (analogous to `W-29`'s `quoteConsumptionBoundary.ts`)—never silently falling back from one to the other and never blending them into one array:
  - **Charting & ad-hoc range exploration (`range_ohlcv`):** Served exclusively by **Dhan `D02`** (`POST /api/dhan/historical`), carrying D02 freshness (`W-19`) and explicit `isAdjusted` status.
  - **Point-in-time replay & backtesting (`pit_as_of`):** Served exclusively by **PIT / D114** (under explicit future admission), preserving strict `asOf` non-leakage.
  - **Valuation (`IID R-6`) & Persisted Reports (`NP-06`):** Keep `IID`'s governed `PIT_D01 → DATASET_EOD → withhold` rule today; embed the exact price observation + provenance inside the immutable persisted artifact at generation time so reports remain reproducible forever.
- **Features supported:** Supports daily/intraday charts via `D02`, keeps `IID` valuation safe and deterministic today, and preserves a clean future path for PIT backtesting.
- **Architectural changes & dependencies:** Low-to-moderate. Fix `freshness: 'SNAPSHOT'` hardcoding on `D02` in `dhanMarketDataRoutes.ts`, define the `D-4` capability-routing & provenance contract in `W-20`, and defer durable Dhan-to-PIT ingestion unless later needed.
- **Advantages:** Matches IIPS's existing codebase (`executive-transport.ts`, `W-29`, `IID R-6`, `NP-06`), imposes zero unnecessary database/ingestion infrastructure on a local single-user app, eliminates silent fallback/blending hazards, and avoids prematurely reopening `B2`/`CV-32` before live Dhan `D02` is even tested.
- **Disadvantages & risks:** Multi-year charts (>1,825 days) or unmapped companies fail closed until P7/chunking expand; full live-bar backtesting waits until a PIT archive is populated.
- **Impact & maintenance:** Minimal disruption; cleanly separates vendor-API concerns from governed persistence concerns.

### Option D — Dhan Historical Data Enters a Versioned PIT Store
- **How it works:** IPD fetches Dhan `D02` candles and persists them with ingestion timestamps, `dataVersion`, and `lineageHash` into a durable PIT store; consumers then query the PIT store for both range charts and `asOf` backtests.
- **Features supported:** Eventually supports charting, valuation, and Dhan-backed backtesting from one local store.
- **Architectural changes & dependencies:** **Very high.** `src/providers/dhan/**` currently has zero persistence/IPC imports; requires new durable market-data schemas in IPD, cache-invalidation/restatement rules when Dhan revises historical bars or applies splits retroactively, corporate-action normalization, and lifting `B2`/`CV-32`.
- **Advantages:** Local persistence survives daemon restarts (`H-14`); bridges vendor data with `asOf` auditability.
- **Disadvantages & risks:** Over-engineered for current readiness (`D02` has not passed `W-12`/`W-14` `E4` yet); persisting unverified/provisional Dhan payloads into an append-only PIT store risks polluting governed history with malformed or unadjusted bars.
- **Impact & maintenance:** Highest engineering and data-hygiene burden.

---

## 9. Recommended Approach and Justification

**[RECOMMENDATION]** Adopt **Option C (Separate Responsibilities by Use Case)** now, explicitly preserving **Option D as an optional, strictly gated future phase** only if the owner later decides to run automated historical strategy backtests over Dhan bars.

### Justification Against the 8 Required Criteria

1. **Why Option C is recommended:** It respects the fundamental semantic difference between **vendor range series (`D02`)** and **knowledge-cutoff snapshots (`PIT/D114`)**, fits IIPS's lightweight single-user Windows architecture, honours existing `B2`/`CV-32` and `IID R-6` boundaries, and avoids building durable PIT ingestion over an API (`D02`) whose live payload shape is still unverified (`W-12`/`W-14`).
2. **Why the alternatives are less suitable:** Option A corrupts point-in-time integrity and corporate-action safety; Option B forces heavy Bhavcopy ingestion and blocks intraday charting; Option D builds premature persistence complexity around unverified Dhan responses.
3. **Should one source be authoritative for all use cases?** **No.** Authority must differ by question type:
   - *Date-range market inspection / charting* → **Dhan `D02`**
   - *Point-in-time historical state / backtesting* → **D114 / PIT** (when admitted for product use)
   - *Valuation (`IID` Margin of Safety)* → **Governed `IID R-6` (`PIT_D01 → DATASET_EOD → withhold`)** until corporate-action-adjusted Dhan integration is explicitly proven and admitted.
4. **How the existing IID valuation policy should be treated:** **Preserve `IID R-6` (`margin.ts`) unchanged** for now. Do not allow unadjusted Dhan `D02` candles (`isAdjusted: false`) to bypass `margin.ts`'s corporate-action refusal gate (`UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION`).
5. **How historical data should be versioned and its origin recorded:**
   - For **Dhan `D02` reads:** Record `source: 'DHAN_D02_OHLCV'`, `interval`, `requestedFromDate..requestedToDate`, `coverageClaim`, `freshnessStatus` (real D02 freshness from `W-19`, not hardcoded `SNAPSHOT`), and `isAdjusted` (`true`/`false` + adjustment note).
   - For **PIT / D114 reads:** Record `source: 'D114_PIT'`, `requestedAsOf`, `resolvedAsOf`, `dataVersion`, `lineageHash`, and `isinAuthority`.
   - For **Persisted Reports / Assessments:** Snapshot the exact price values and provenance block **inside the immutable `NP-04` artifact** at creation time.
6. **Behaviour when data is missing, stale, or unavailable:** **Fail closed / withhold with a plain-English reason — never silently fall back and never silently blend.**
   - Missing or failed Dhan `D02` → explicit error or empty-candle disclosure (never substitute `D114`).
   - Stale or missing `D02` freshness (`W-19`) → display `STALE` / `UNAVAILABLE` truthfully (remove `SNAPSHOT` hardcode in `projectIpdHistoricalResult`).
   - Missing/unadjusted valuation price → withhold Margin of Safety with `margin.ts` reason (`NO_PRICE_OBSERVATION`, `PRICE_STALE`, `UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION`).
7. **How this supports future charting, company analysis, portfolio reports, and backtesting:** Charting (`W-21`) plugs cleanly into `D02`; company valuation and `NP-06` reports remain deterministic and reproducible; portfolio returns (`W-39`) can consume `D02` daily bars once corporate-action adjustment is verified; and backtesting remains cleanly gated on `D114/PIT` (or future Option D ingestion) without look-ahead contamination.
8. **What to build now vs defer:**
   - **Now (`D-4` + `W-12`/`W-14`/`W-19`/`W-20`):** Settle `D-4` under Option C; fix/verify Dhan historical live (`W-12`/`W-14`); wire D02 freshness (`W-19`); remove hardcoded `SNAPSHOT` on D02 in IRR; add a clean `W-20` historical boundary + non-blending guards.
   - **Defer:** Lifting `B2`/`CV-32` for production PIT backtesting, automated daily Bhavcopy pipelines, multi-year (>1,825d) chunking, and durable Dhan-to-PIT ingestion (Option D).

---

## 10. Practical Examples

### Example 1: *"A user wants a three-year daily price chart for Reliance."*
- **Source to use:** **Dhan `D02` (`D02_OHLCV`)** via `POST /api/dhan/historical` (`interval: '1D'`, 3-year window ≤ 1,825 days, `ISIN:INE002A01018:EQ` / `EQ_RELIANCE_IN`).
- **Why:** This is a date-range OHLCV request; Reliance is one of the 48 P7-mapped companies; `D114/PIT` cannot serve date-range chart arrays and is non-production.
- **What must be recorded/shown:** Source (`Dhan D02`), requested range, candle count, `isAdjusted` status (with clear warning if unadjusted across splits/bonuses), and D02 freshness (`SNAPSHOT` / `STALE` / `UNAVAILABLE` from `W-19`).
- **If unavailable:** Fail closed with the typed reason (e.g., `TRANSPORT_UNAVAILABLE`, `RATE_LIMITED`, `CREDENTIALS_UNAVAILABLE`). Do **not** fall back to `D114/PIT` or stitch Bhavcopy bars onto Dhan bars.

### Example 2: *"A user wants to calculate Margin of Safety using a historical valuation date."*
- **Source to use:** **IID `R-6` price alignment (`PIT_D01` snapshot if available for `knownAsOf`, else `DATASET_EOD`)** inside the IID assessment engine (`margin.ts`), **not** raw Dhan `D02`.
- **Why:** Margin of Safety requires strict `knownAsOf <= price.asOf <= generatedAt`, policy-window checks, and **verified corporate-action adjustments** matching the financial statements' share base. Raw Dhan `D02` declares `isAdjusted: false` and has no adjustment factor ID.
- **What must be recorded:** `price.value`, `price.asOf`, `price.source` (`PIT_D01` or `DATASET_EOD`), `sourceRef`, `adjustment` (`{ factor, corporateActionId }` or `null`), and `mosPolicyVersion`.
- **If unavailable or unadjusted:** **Withhold Margin of Safety** with the explicit refusal code (`NO_PRICE_OBSERVATION`, `PRICE_PREDATES_KNOWLEDGE_CUTOFF`, `PRICE_OUTSIDE_POLICY_WINDOW`, or `UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION`).

### Example 3: *"A user wants to know what information was available about a company on a particular date."*
- **Source to use:** **D114 / PIT (`PointInTimeStore`, `GET /api/pit/market-data` with `asOf`)** — together with `IID` `knownAsOf` assessment snapshots if fundamental filings are included.
- **Why:** Only `PointInTimeStore` enforces `resolvedAsOf <= asOf` and isolates post-date additions/revisions, preventing future information leakage. (Note: Today this works only in **non-production/test** scope for the loaded D114 fixture set due to `B2`/`CV-32`.)
- **What must be recorded:** `requestedAsOf`, `resolvedAsOf`, `dataVersion`, `lineageHash`, and `isinAuthority`.
- **If unavailable:** Return `404` / `found: false` (*no governed record existed as of that date*). Never substitute a later date or query Dhan `D02` to fill the gap.

### Example 4: *"A user wants to reproduce an investment report generated several months earlier."*
- **Source to use:** **The immutable persisted `NP-06` / `IID` artifact stored in `NP-04`**, which embeds the exact price observations and provenance captured when the report was originally created.
- **Why:** Re-querying Dhan `D02` months later cannot guarantee identical numbers (Dhan history can be revised, split-adjusted retroactively, or unavailable if credentials/session expire).
- **What must be recorded at report creation:** `reportId`, `artifactVersion`, `generatedAt`, embedded `priceObservation` (or exact series digest), `source`, `asOf`, `dataVersion` / `lineageHash` (if PIT), and `freshness`.
- **If unavailable when regenerating/recomputing:** Re-display the original immutable artifact as-captured (`READ`); if the user explicitly requests a *new* version (`POST .../versions`) and the price source is offline/stale, refuse or mark Margin of Safety withheld rather than silently substituting another source.

---

## 11. Proposed D-4 Decision Points

Before `W-20` begins, the joint **IPD + IRR** owner decision for **D-4** should explicitly resolve these seven items:

1. **Source authority per use case:** Confirm Option C — Dhan `D02` is authoritative for ad-hoc/charting date-range OHLCV (`1m..1D`), `D114/PIT` is authoritative for point-in-time `asOf` / backtesting queries (subject to admission), and `IID R-6` (`PIT_D01 → DATASET_EOD → withhold`) remains authoritative for valuation/Margin of Safety.
2. **Strict non-fallback & non-blending rule:** Confirm that IRR and IPD **must never** silently fall back from `D02` to `D114/PIT` (or vice versa) on miss, error, or window limit, and **must never** merge candles from both sources into one series.
3. **Truthful D02 freshness & qualification:** Require IRR (`dhanMarketDataRoutes.ts`) to stop hardcoding `freshness: 'SNAPSHOT'` on `D02` historical responses and instead derive historical freshness from IPD `D02_OHLCV` freshness (`W-19`), displaying `UNAVAILABLE`/`UNKNOWN` until `W-19` lands.
4. **Corporate-action adjustment policy for D02:** Confirm that until `W-13`/`W-14` proves Dhan adjustment semantics and corporate-action metadata are integrated, `D02` candles remain tagged `isAdjusted: false` and **cannot** be used for split-sensitive valuation or multi-year return attribution without explicit disclosure or refusal.
5. **Scope of `B2` / `CV-32` admission for PIT/D114:** Explicitly decide whether `D114/PIT` stays non-production-only during Phase 4 (meaning `W-20` wires the precedence/routing boundary cleanly while keeping `/api/pit/market-data` gated out of production product screens), or whether a separate admission packet will authorize production D114 ingestion.
6. **Identity symmetry between D01 and D02:** Decide whether IPD's historical path (`W-20`) should tighten to match D01's exact `ISIN:<isin>:<series>` requirement (`H-5`), or retain `companyId` resolution with mandatory resolved `securityId` returned in provenance.
7. **Persisted report/assessment reproducibility rule:** Confirm that `NP-06` reports and `IID` assessments must embed their price observations and provenance inside the immutable `NP-04` record rather than re-querying live `D02` on replay.

---

## 12. Outstanding Questions and Evidence Gaps

1. **IPD repository state could not be directly inspected (`403`/`404`):** Direct verification of IPD `1ce6a829…`, `2e11fa3b…`, and any unmerged IPD branches (especially `dhan_historical_dto.ts` and `DH-905` security ID serialization) is required from an environment with IPD access.
2. **Local IRR test execution was blocked (`frontend/node_modules` absent):** Test counts and coverage reported here come from static inspection of IRR test files and committed CI evidence (`evidence/integration/w19-preservation-regression-2026-11-21/README.md`).
3. **Live Dhan `D02` behaviour is completely unverified (`E4`):** Columnar field names, epoch timezone (IST vs UTC midnight), `isAdjusted` reality, intraday history depth, and `DH-905` numeric security ID handling are unknown until `W-12` + `W-14` run live.
4. **P7 coverage (48 companies / 96 rows):** Real usability of Dhan charting (`W-21`) and portfolio history (`W-39`) depends on whether P7 mapping expansion is planned beyond the current 48 P04-matched companies.
5. **No joined IPD → IRR historical test exists:** Unlike quotes (`dhanIdentityJoined.test.tsx`), no test exercises `DhanHistorical` → `/api/dhan/historical` → real IPD `createMarketDataHttpServer`.

---

## 13. Suggested Implementation Sequence

1. **Verify & fix IPD historical request builder (`W-12` / `W-14` prep):** Inspect IPD `dhan_historical_dto.ts` / `dhan_api_client.ts` for the `DH-905` string-vs-number security ID defect and run `E4` live historical probes against Dhan to verify fields, timestamps, intervals, and adjustment behaviour (`W-13`, `W-14`).
2. **Adopt and ratify `D-4` (joint IPD + IRR owner decision):** Formally record the seven `D-4` decision points above (following the `D-7` / `W-24` proposal + acceptance pattern) and reconcile with `IID R-6` and `B2`/`CV-32`.
3. **Complete IPD `W-19` (D02 cache & freshness):** Wire `DhanHistoricalCache` and `GET /v1/freshness?domain=D02_OHLCV` in IPD so historical freshness is real rather than `NOT_AVAILABLE` / `UNKNOWN`.
4. **Execute `W-20` (IPD + IRR precedence boundary):**
   - Implement the governed historical boundary separating `range_ohlcv` (`Dhan D02`) and `pit_as_of` (`D114/PIT`) with fail-closed non-fallback and non-blending guarantees.
   - Remove the hardcoded `freshness: 'SNAPSHOT'` on `projectIpdHistoricalResult` in `dhanMarketDataRoutes.ts` so D02 freshness reflects IPD truth.
   - Add joined IPD → IRR historical tests and preserve `verify-browser-bundle.mjs` server isolation.
   - Record formal joint IPD + IRR acceptance for `W-20`.
5. **Proceed to `W-21` and `W-39`:** Enhance `DhanHistorical` / charting surfaces (`W-21`) with explicit source, freshness, and adjustment disclosures; then integrate remaining IRR consumers (`W-39`) according to `D-4` rules.
6. **Future / Optional (separate phase):** Only if live backtesting over Dhan bars is desired later, design durable PIT ingestion (`Option D`) and update `B2`/`CV-32` admission accordingly.
