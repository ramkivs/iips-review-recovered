# IIPS–EquiCore Integration — Request/Response Architecture Assessment (Revision 1)

- **Document ID:** `IIPS-EQUICORE-REQUEST-RESPONSE-ARCHITECTURE-ASSESSMENT-2026-11-23`
- **Revision:** `1.1` (Revised to address all 6 architecture review observations; paired with `IIPS-EQUICORE-SERVING-AUTHORIZATION-PROPOSAL-2026-11-23.md`)
- **Date:** 2026-11-23 (UTC)
- **Authoritative Repositories Inspected:**
  - **IRR / IIPS (`ramkivs/iips-review-recovered`):** branch `arena/fbeebd7c-iips-review-recovered` (atop `main` `d4d70b6`)
  - **EquiCore (`ramkivs/equity-market-data-engine`):** `origin/main` (`b79cf1d0561c388d0fcd0000503dc93f5a56e584`)
  - **IPD (`ramkivs/iips-production-market-data`):** inaccessible directly from this environment (`Resource not accessible by integration`); existing IPD contracts/pins are cited strictly from IRR-checked-in manifests, pin files (`.ci/verify-ipd-pins.mjs`, `frontend/package.json`), and accepted `D-4` / `B2` / `W-29` records.
- **Classification:** **ARCHITECTURE ASSESSMENT & RECOMMENDATION ONLY.** EquiCore's `I5` 10-year qualification and `D23` local UI grant do **not** authorize EquiCore-to-IIPS serving API implementation, incremental-ingestion completion, or IRR consumption changes. Explicit authorizations from both the EquiCore Owner and IIPS Program Authority (§10 / `IIPS-EQUICORE-SERVING-AUTHORIZATION-PROPOSAL-2026-11-23.md`) are required before any implementation begins.

---

## 1. Executive Summary & Objective

IIPS currently splits historical market-data concepts across (a) **Dhan `D02`** (`POST /api/dhan/historical` via IPD `dhan-server`, live-unverified, capped at 1,825 days and 48 P7 companies in live-probe scope, `isAdjusted: false`, `D02_OHLCV` freshness `NOT_AVAILABLE`), (b) **non-production `D114/PIT`** (`GET /api/pit/market-data` over 20 in-memory fixture records, fenced behind Gate `B2`, `P4`, and `CV-32`), and (c) **`IID R-6`** (`margin.ts` consuming `PIT_D01 | DATASET_EOD` from the local IID dataset).

Meanwhile, **EquiCore** (`ramkivs/equity-market-data-engine`) holds the **I5-qualified 10-year NSE Bhavcopy corpus** (`i4-20261008-M2`: 2,462 archives, 5,689,949 canonical rows, 12 partitions, 2016-09-20 through 2026-09-18) plus a local stdlib-Python read-only serving layer (`src/serving/`, `src/ui/`) granted by `D23` for EquiCore's own single-user Dashboard/Explorer.

**Recommended Boundary:** Establish EquiCore as an **explicit, authenticated, local loopback-only HTTP/1.1 + canonical JSON historical data provider (`127.0.0.1:8614`, contract `iips-equicore-historical/v1`)** consumed strictly server-side by IIPS (mirroring IRR's IPD `dhanMarketDataTransport.ts` / `dhanIdentityTransport.ts` security model). Initial authorized scope is **read-only daily EOD (`1D`) `NSE_EQ` canonical bars (`RAW_UNADJUSTED`) over the qualified M2 baseline**, single-date EOD observation lookups (`POST /v1/historical/eod-observation` — explicitly *not* bitemporal `knownAsOf` PIT), dated ISIN/symbol associations, and NSE trading-calendar completeness — enforcing **zero silent fallback or blending** with Dhan `D02` (`D-4.2`) and **immutable snapshot embedding** inside `NP-04` persisted reports (`D-4.7`).

---

## 2. Current-State Findings (Verified Across Repositories)

### 2.1 EquiCore (`ramkivs/equity-market-data-engine` @ `b79cf1d`)

1. **Qualified 10-Year Baseline (`D14` / `I5`):**
   - Run `i4-20261008-M2`: `2,462` NSE Bhavcopy archives (`1,919` `legacy13` 2016-09-20..2024-07-05 + `543` `udiff34` 2024-07-08..2026-09-18), `5,689,949` canonical `SecurityRow` records, `12` `(format_family, calendar_year)` partitions, `4,948` package files (`21,119,807,344` bytes), `0` gating divergences, `R6` deterministic replay PASS.
   - Pinned identifiers (`src/serving/baseline.py` `DEFAULT_M2_SPEC`): `package_manifest_sha256: e7c7e4c8271f3a1c8ef42d76b926fe048a8997a342c92d89819eecd79e73b9dc`, engine `nse-engine` `w2-1.0.0` (`d3269b73...`), runner `I4-runner/1.0` (`f3ebf624...`), `spec_version: "D05/1.0"`.
   - **Environment custody boundary (`README.md`):** The 21 GB M2 package and raw NSE archives reside on the user's **Windows** host (`C:\IIPS_Data\...`), not in Git or Arena.
2. **Post-I5 Product Intent & `D16` Authority (`POST_I5_SERVING_INCREMENTAL_PRODUCT_ARCHITECTURE_*`):**
   - **Single-user personal scope (`Intent` §2/§12, `D16` §2):** Excludes multi-user auth/RBAC, tenant isolation, PostgreSQL, and enterprise distributed infrastructure.
   - **4 Durable State Classes (`D16-07`):** `(1)` Immutable qualified M2 baseline package; `(2)` Approved incremental publications (`D16-05`); `(3)` Processed-archive registry (`D16-02`); `(4)` Pure rebuildable serving state (indexes/rollups/saved queries — deleting `(4)` is never a data event).
   - **Read/Write Separation (`D16-09`):** Serving is strictly a read-only consumer of `(1)+(2)+(3)`; queries never trigger ingestion; raw archive bytes remain in Windows custody (`D16-08`).
   - **Changed-Content Hold (`D21`):** `CHANGED-CONFLICT-UNRESOLVED` fails closed (candidate held out of canonical serving; prior accepted data stays authoritative; per-instance conflict resolution withheld per `D21 §22`).
3. **`D23` Grant & Implemented Serving Surface (`src/serving/`, `src/ui/`):**
   - `D23` granted **EquiCore's own local read-only Dashboard/Explorer UI & CLI** (`src/ui/serve.py` binding `127.0.0.1:8613`, `src/ui/api.py` `i4-ui-serving-adapter/1.0`) executing `Q1`–`Q10`, outputting deterministic canonical JSON (`serving.index.canonical_json`).
   - `D23 §17/§19` did **not** authorize a headless cross-application API for external consumers like IIPS.
4. **Incremental `B5` (`OW-10`) & Scope Limits (`PUBLICATION_AUDIT_2026-11-03.md`, `B5_CATALOG_PUBLICATION.md`):**
   - Owner subsequently authorized `D16-13(2)` (`B5_AUTHORIZED_INCREMENTAL_PROGRESS.md`), producing catalog-backed SQLite composite generations (`catalog-composite/1.0..14.0`) with request-level generation pinning.
   - **However, `B5` remains OPEN** (affected identity/ticker groups rewrite as whole blobs, no trie GC, Windows `B6` validation and `B7` promotion incomplete). Consequently, initial IIPS integration targets **the closed/qualified M2 baseline first**, treating post-M2 composite generations as a gated Phase D extension once `B5`/`B6` close.
5. **EquiCore Data & Query Characteristics Relevant to IIPS:**
   - **Exchange & frequency:** **NSE-only (`NSE_EQ`)** and **daily EOD (`1D`) only**; zero BSE (`BSE_EQ`) records and zero intraday (`1m..1h`) bars.
   - **Corporate actions:** Stores verbatim as-published `Decimal` strings (`D05 §3.1`), **explicitly unadjusted** (`nse_engine/blocked.py`: `corporate_action_colocation` unresolved and `DEC-1`-deferred).
   - **Identity & indexing gap:** `SecurityRow` carries `security_isin`, `isin_normalized`, `isin_validity`, `listing_symbol`, `series`, `segment`, and `w2/associations.jsonl` (`Q5`) carries `security_id` (normalized ISIN) dated intervals. However, `serving/index.py` (`serving-index/1.2`) indexes files by `(listing_symbol, series)` and `serving/query.py` streams `.rows.jsonl` files linearly — there is **no `(isin_normalized, series, business_date)` Class-(4) index** today.

### 2.2 IIPS / IRR (`ramkivs/iips-review-recovered`) & IPD Boundary

1. **Dhan `D02` & `D-4` Decisions:** Option C separates sources by use case; `D-4.2` forbids silent fallback/blending; `D-4.4` (PR #639) mandates unadjusted CA disclosure; `D-4.5` (PR #643) retains `B2`/`P4`/`CV-32`; `D-4.6` (PR #641) enforces canonical `(companyId, exchangeSegment: 'NSE_EQ'|'BSE_EQ', securityId: 'ISIN:<12-alnum>:<series>')` symmetry; `D-4.7` requires immutable `NP-04` snapshot capture. Dhan `D02` remains live-unverified (`W-12`/`W-14` pending, `W-19` freshness cache unwired, 1,825-day cap).
2. **`D114/PIT` (`frontend/server/pit/`):** `GET /api/pit/market-data` runs over an ephemeral 20-record in-memory boot store (`12` TCS D114 + `8` mock records), `queryAsOf` only, fenced under `B2` / `P4` (NOT ADMITTED) / `CV-32` (`API-ONLY`).
3. **IRR Consumers & `NP-04`:** `DhanHistorical.tsx`, `positionValuation.ts` (`W13`), `IID R-6` `margin.ts` (`PIT_D01 | DATASET_EOD` + CA factor refusal), and `NP-04`/`NP-06` (`frontend/server/reports/artifact.ts`, `investmentArtifacts.ts`, `W16` `provenanceEnvelope.ts`).
4. **IRR Transport Security Precedents:** `dhanMarketDataTransport.ts` / `marketDataTransportConfig.ts` / `dhanIdentityTransport.ts` enforce loopback `http://127.0.0.1|localhost|[::1]`, mandatory server-side bearer token (`MARKET_DATA_TRANSPORT_TOKEN_ENV`), `10,000 ms` timeout, sanitized error views (setting names only, never secret values), and `verify-browser-bundle.mjs` browser isolation.

---

## 3. Proposed Component Architecture & End-to-End Request/Response Flow

### 3.1 Component Topology

```
BROWSER (React SPA — zero EquiCore URLs, tokens, headers, or filesystem paths)
  ├─ Historical Charts / Analytics / Assessment / Reports
  └─ Calls IRR Server APIs only (e.g., POST /api/historical/bars, /api/reports/...)
                                      │
                                      ▼
IRR NODE SERVER (frontend/server/ — strictly server-side boundary)
  ├─ historicalConsumptionBoundary.ts (Option C source router: DHAN_D02 vs EQUICORE_NSE_EOD vs PIT)
  │    • Enforces D-4.2: explicit caller source selection, ZERO silent fallback/blending
  │    • Enforces D-4.6: canonical (companyId, exchangeSegment, ISIN:<12-alnum>:<series>)
  │    • Maps IRR companyId/issuerId <-> canonical (ISIN, series); EquiCore never sees companyId authority
  ├─ equicoreTransportConfig.ts + equicoreTransport.ts (dedicated server-side HTTP client)
  │    • Reads IIPS_EQUICORE_BASE_URL (127.0.0.1:8614) + MANDATORY IIPS_EQUICORE_TRANSPORT_TOKEN
  │    • Validates contractVersion, security echo, calendar dates, responseDigest SHA-256
  └─ NP-04 Report Composer (D-4.7)
       • Embeds immutable HistoricalPriceEvidence (observations, source, adjustment, M2/gen IDs, digests)
                                      │
      Loopback HTTP/1.1 + Mandatory Bearer Token + Canonical JSON (127.0.0.1:8614)
                                      │
                                      ▼
EQUICORE HEADLESS MACHINE SERVING HOST (ramkivs/equity-market-data-engine, Python 3 stdlib)
  ├─ New IIPS Machine Adapter (src/serving/iips_api.py + serving.iips_serve entrypoint)
  │    • Separate headless process/port (127.0.0.1:8614) from EquiCore UI host (src/ui/serve.py:8613)
  │    • Validates Host header (loopback only), Authorization: Bearer <token>, zero CORS headers
  │    • Enforces contract iips-equicore-historical/v1; pins M2 baseline (or explicit generation)
  ├─ Derived ISIN-Series Class-(4) Index (rebuildable SQLite/JSON index over (isin_normalized, series, date))
  │    • Pure derivation of Class (1) M2 (+ future closed B5 Class (2)/(3)); indexes VALID ISINs only
  └─ Read-Only Package Readers (verify-01..07; never modifies M2, never reads raw Windows archives)
```

### 3.2 End-to-End Request/Response Flow

1. **IIPS Request Construction & Identity Resolution (IRR Server):**
   - Consumer explicitly selects source `EQUICORE_NSE_EOD`. IRR resolves/validates `(companyId, exchangeSegment, securityId: 'ISIN:<12-alnum>:<series>')` via IRR's governed identity directory (`companyDirectory` / `dhanIdentityTransport` / holdings registry).
   - IRR validates fail-closed before any outbound call: `exchangeSegment === 'NSE_EQ'` (`BSE_EQ` → `422 UNSUPPORTED_EXCHANGE`), `frequency === '1D'` (`1m..1h` → `422 UNSUPPORTED_FREQUENCY`), `adjustmentMode === 'RAW_UNADJUSTED'` (adjusted → `422 ADJUSTMENT_UNAVAILABLE`), strict UTC calendar round-trip dates (`fromDate <= toDate`), and mandatory loopback config (`IIPS_EQUICORE_BASE_URL` + `IIPS_EQUICORE_TRANSPORT_TOKEN`).
2. **EquiCore Request Acceptance & Security Checks (EquiCore Server):**
   - Validates loopback `Host` header, constant-time `Authorization: Bearer <token>` match, and `contractVersion === 'iips-equicore-historical/v1'`.
   - Validates `(isin, series)` syntax and pins immutable M2 baseline (`DEFAULT_M2_SPEC`) or caller-pinned generation (`baselineManifestSha256` / `compositeGeneration`).
3. **Historical Query Execution by EquiCore:**
   - Queries the Class-(4) `(isin_normalized, series)` index (which indexes **only** `isin_validity === 'VALID'` rows per `D05 §6.1`) across `[fromDate, toDate]`, sorted deterministically by `(business_date, format_family, source_file_year, source_file, source_line_number)`.
   - Evaluates `w2/calendar.jsonl` over `[fromDate, toDate]` to classify every weekday in range (trading day present vs official holiday vs unexplained circular absence vs not-retrieved vs outside corpus bounds).
4. **Response Delivery to IIPS:**
   - Serializes canonical JSON (`serving.index.canonical_json`), computes SHA-256 `responseDigest` over the canonical payload excluding `responseDigest`, stamps full M2/generation provenance and `isAdjusted: false`, and returns `200 OK` (with `Cache-Control: no-store`).
5. **IIPS Validation, Provenance Retention & Downstream Consumption:**
   - IRR verifies `contractVersion`, `security` echo symmetry, monotonic `businessDate` within `[fromDate, toDate]`, and recomputes `responseDigest` (mismatch → fail closed `502 INTEGRITY_MISMATCH`).
   - IRR forwards the view cleanly (preserving unadjusted and calendar completeness disclosures) or, for `NP-04` reports, embeds the full `HistoricalPriceEvidence` block (§8).

---

## 4. Temporal Semantics: Daily EOD Observation Lookup vs Genuine Point-in-Time (`knownAsOf`) (Review Obs. #1)

To eliminate any ambiguity between **pinned-baseline historical EOD lookup** and **bitemporal point-in-time (`knownAsOf`) analysis**:

| Semantics | Daily EOD Observation Lookup (`POST /v1/historical/eod-observation`) — **IN v1 SCOPE** | Genuine Point-in-Time (`knownAsOf`) Query — **OUT OF v1 SCOPE (Future Phase)** |
|---|---|---|
| **Question Answered** | *"What canonical EOD Bhavcopy row did NSE publish for `(ISIN, series)` on `tradeDate`, as captured in EquiCore's pinned baseline/generation?"* | *"What price and restatement/corporate-action state did IIPS actually know at timestamp `T` (`knownAsOf <= T`), excluding any file ingested or corrected after `T`?"* |
| **Endpoint** | `POST /v1/historical/eod-observation` (replaces the earlier `/v1/historical/point-in-time` name) | Future `/v1/pit/as-of` (requires separate PA `D-4.5` Tier 2 admission) |
| **Temporal Axes Present** | Single axis: `tradeDate` (`business_date`) within a pinned `baselineManifestSha256` / `compositeGeneration` (`temporalModel: 'PINNED_GENERATION_EOD_SNAPSHOT'`). | Four axes: `marketDate`, `publishedAt`, `ingestedAt` (`knownAsOf`), `revisedAt` (`supersedesVersion`), plus `asOf`-aligned CA factor timeline. |
| **Restatements / Corrections** | `M2` is an immutable baseline (`D16-07` class 1); any post-M2 conflicting archive is quarantined by `D21` (`CHANGED-CONFLICT-UNRESOLVED`) and withheld (`409 D21_CONFLICT_HELD`). | Deterministic before/after `revisedAt` replay across restated versions (`D21 §22` resolution required). |
| **Appropriate IIPS Use** | Historical daily charts, non-bitemporal analytics, `NP-04` immutable report price capture (`D-4.7`), and `DATASET_EOD` EOD price lookup (subject to `R-6` CA gate). | Backtesting and `asOf` historical simulation free of retroactive-backfill look-ahead bias. |

---

## 5. Canonical Security Identity Mapping & Invalid/Missing ISIN Handling (Review Obs. #2)

IIPS and EquiCore operate on distinct identity layers that must stay cleanly separated across the boundary:

1. **Three Identity Layers (No Conflation):**
   - **IIPS Issuer / Company (`IID`):** `companyId` / `issuerId` (`IN:CIN:...` or `IN:EQUITY_ISIN:...`), resolved inside IRR (`companyDirectory.ts`, `dhanIdentityTransport.ts`).
   - **IIPS Market-Data Canonical Tuple (`D-4.6`):** `(companyId, exchangeSegment: 'NSE_EQ' | 'BSE_EQ', securityId: 'ISIN:<12-alnum>:<series>')`.
   - **EquiCore `D05` Row & `Q5` Association Identity:** `isin_normalized` (upper-trimmed 12-char string), `isin_validity` (`VALID` | `BLANK` | `INVALID_LEN` | `INVALID_PREFIX` | `INVALID_CHARSET` | `INVALID_CHECKDIGIT` per `nse_engine/rows.py`), `series` (`EQ`, `BE`, `BL`, etc.), `listing_symbol` (`SYMBOL` in `legacy13`, opaque `FinInstrmId` in `udiff34`), and `observed_trading_symbol` (`TckrSymb` in `udiff34` `CM`/`STK`, `SYMBOL` in `legacy13`).
2. **Boundary Mapping Protocol:**
   - **IRR owns `companyId` → `(ISIN, series, exchangeSegment)` resolution.** IRR never delegates company resolution to EquiCore; `companyId` is omitted or passed purely as an opaque `clientCorrelationId` echo, never parsed by EquiCore.
   - **EquiCore resolves requests strictly by `(isin_normalized, series)`** when `exchangeSegment === 'NSE_EQ'`.
3. **Invalid, Missing, Ambiguous & Multi-Symbol ISIN Rules (Fail-Closed):**
   - **Syntactically invalid request ISIN:** Rejected at both IRR (`400`) and EquiCore (`400 INVALID_IDENTITY`, failing ISO-6166 check digit or `^IN[A-Z0-9]{9}[0-9]$` validation).
   - **Rows in EquiCore with `isin_validity !== 'VALID'` (`BLANK`, `INVALID_*`):** Excluded from EquiCore's Class-(4) `(isin_normalized, series)` cross-app index (matching `serving/symbols.py:_identity(row)` — invalid or blank ISINs **never** create ISIN correlation links). They remain visible only inside EquiCore's internal `Q4`/`Q8` data-quality explorer.
   - **Overlapping ticker/ISIN ambiguity:** If EquiCore's symbol/ISIN correlation detects overlapping trading symbols or conflicting mappings for `(isin_normalized, series)` (`resolve_symbol` conflict), EquiCore fails closed with `409 IDENTITY_AMBIGUOUS` rather than picking one arbitrarily.
   - **Sequential ticker rename (`SYMBOL_A` → `SYMBOL_B`):** When an `ISIN` with `isin_validity === 'VALID'` cleanly transitions symbols across disjoint date intervals in `w2/associations.jsonl`, EquiCore returns the full continuous `(isin_normalized, series)` bar series and reports every observed interval in `security.observedSymbols[]` (`observedFrom`..`observedTo`) so IIPS surfaces ticker transitions transparently.
   - **Series isolation:** `EQ`, `BE`, `BL`, `SM`, etc. are strictly isolated; requesting `EQ` never falls back to `BE` or `BL` (`404 INSTRUMENT_NOT_FOUND` if the requested `(isin, series)` has zero valid rows).

---

## 6. Trading-Calendar Completeness, Missing Bars, Unexplained Dates & Archive Availability (Review Obs. #3)

EquiCore's `w2/calendar.jsonl` (`D05 §3.4`) and `Q6` calendar reader establish four distinct weekday states over `[fromDate, toDate]` (excluding Saturdays/Sundays, since `D03` proved zero weekend Bhavcopy files exist):

| Calendar / Archive Condition | EquiCore Evidence State | Response Field Representation | Interpretation for IIPS Consumers |
|---|---|---|---|
| **1. Official NSE Market Holiday** | `file_present: false`, `label_status: 'official-holiday'` | Counted in `officialHolidaysCount` (with `label_circular`, `official_holiday_label`); **not** counted as a missing bar or missing archive. | Expected non-trading day (sourced from retrieved NSE circulars). |
| **2. Unexplained Missing Weekday** | `file_present: false`, `label_status: 'unexplained-by-obtained-circulars'` (e.g., `2024-11-20`, `2025-10-20`) | Listed explicitly in `completeness.unexplainedCalendarDates[]` (preserving `D08 MD-09` obligation). | **Never** relabelled as a holiday and **never** fabricated (`unknown` remains visible to UI/reports). |
| **3. Outside Circular / Legacy Unretrieved Weekday** | `file_present: false`, `label_status: 'not-retrieved'` (or `fromDate < corpusCoverageFrom` / `toDate > corpusCoverageTo`) | Listed in `completeness.notRetrievedCalendarDates[]` and `completeness.outOfCorpusWindow` (`beforeCorpusStart` / `afterCorpusEnd`). | Corpus coverage boundary or missing circular evidence — **cannot** be assumed to be a holiday or zero-volume day. |
| **4. Archive Present (`file_present: true`) — Security Absent** | `file_present: true` for that trade date, but `(isin, series)` has 0 rows in that day's Bhavcopy | Counted in `tradingDaysWithArchive` (`expectedTradingDays`), **excluded** from `returnedBarCount`, and counted in `securityAbsentOnTradingDaysCount` (optional `securityAbsentDates[]` capped/flagged). | Valid NSE trading day on which this specific ISIN/series did not trade / was not listed / was suspended. **Distinct from missing archive.** |
| **5. Archive Held / Unavailable (`D21` Conflict or Corrupt)** | `D21 CHANGED-CONFLICT-UNRESOLVED` or missing/unreadable archive | Listed in `completeness.d21HeldDates[]` (`hasD21ConflictNotice: true`) or returns `409 D21_CONFLICT_HELD` / `500 BASELINE_INTEGRITY_FAILED`. | Candidate data is quarantined (`D21 §18`); prior accepted M2 data remains authoritative and never silently replaced. |

**Completeness Invariant:** Across `[max(fromDate, corpusCoverageFrom), min(toDate, corpusCoverageTo)]`, `tradingDaysWithArchive === returnedBarCount + securityAbsentOnTradingDaysCount`, and `weekdaysInCorpusRange === tradingDaysWithArchive + officialHolidaysCount + unexplainedCalendarDates.length + notRetrievedCalendarDates.length`.

---

## 7. Local API Security Model, Mandatory Auth, Loopback Protections & Secret Handling (Review Obs. #4)

Because EquiCore exposes historical market data over local HTTP on the user's workstation, **authentication is MANDATORY — not optional** — to prevent unauthorized access from other local processes or browser-initiated `localhost` / DNS-rebinding requests:

1. **Mandatory Bearer Authentication (EquiCore & IRR):**
   - EquiCore requires `Authorization: Bearer <token>` (compared in constant time via `hmac.compare_digest`) on **every** `/v1/*` machine endpoint (`GET /v1/health` may return minimal liveness only or also require bearer; **all data endpoints `/v1/historical/*`, `/v1/instruments/*`, `/v1/calendar` MUST reject missing/invalid tokens with `401 TRANSPORT_UNAUTHORIZED`**).
   - IRR reads `IIPS_EQUICORE_TRANSPORT_TOKEN` from `process.env` via `equicoreTransportConfig.ts` (mirroring `marketDataTransportConfig.ts` + `dhanIdentityTransport.ts`). Empty, whitespace-containing, or non-printable tokens fail closed immediately with `TRANSPORT_NOT_CONFIGURED` (`connectionAttempted: false`).
2. **Loopback & DNS-Rebinding Protections:**
   - EquiCore binds **strictly** to `127.0.0.1` (`--bind 127.0.0.1` enforced; `--bind 0.0.0.0` is **prohibited** on `serving.iips_serve`).
   - EquiCore validates the HTTP `Host` header against `{ '127.0.0.1:<port>', 'localhost:<port>', '[::1]:<port>' }`, returning `403 FORBIDDEN_HOST` otherwise.
   - EquiCore emits **zero CORS headers** (`Access-Control-Allow-Origin` absent), plus `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`.
   - IRR `equicoreTransportConfig.ts` rejects any non-`http:` scheme, non-loopback host, embedded URL username/password, query string, or URL fragment (`MALFORMED_BASE_URL` / `NON_LOOPBACK_BASE_URL`).
3. **Browser Isolation:**
   - Browser code (`frontend/src/**`) **never** communicates directly with `127.0.0.1:8614`, **never** receives `IIPS_EQUICORE_BASE_URL` or `IIPS_EQUICORE_TRANSPORT_TOKEN`, and **never** imports `frontend/server/market-data/equicore*`.
   - `frontend/scripts/verify-browser-bundle.mjs` must include `equicoreTransport*` and `IIPS_EQUICORE_*` in its forbidden-import/secret-leak guards.
4. **Secret Handling & Non-Disclosure:**
   - `IIPS_EQUICORE_TRANSPORT_TOKEN` is supplied purely via runtime process environment (or Windows local operator launch env), never committed to Git, never written into `NP-04` artifacts, never logged, and never included in `EquiCoreSafeError`.
   - Missing configuration returns only setting **names** (`requiredSettings: ['IIPS_EQUICORE_BASE_URL', 'IIPS_EQUICORE_TRANSPORT_TOKEN']`), matching `dhanIdentityTransport.ts`.

---

## 8. Service Interface, Transport Recommendation & Contract (`iips-equicore-historical/v1`)

### 8.1 Transport Comparison (Local Single-User Windows Workstation)
| Option | Payload & Latency | Isolation & Governance | Verdict |
|---|---|---|---|
| **A. Loopback HTTP/1.1 + Mandatory Bearer + Canonical JSON (`127.0.0.1:8614`, Python stdlib `ThreadingHTTPServer`)** | `<5ms` local RTT; handles multi-MB 10Y JSON payloads cleanly | Enforces `D16-07`/`D16-09` separation; zero third-party deps (`D23 §13`); mirrors IRR `dhanMarketDataTransport.ts` | **RECOMMENDED** |
| **B. Direct Filesystem / SQLite Read by IRR Node** | Fast raw I/O | Violates `D16-07`/`D16-09`/`D23 §16`; leaks `serving-index/1.2` & `catalog-composite` internals into Node | **REJECTED** |
| **C. Per-Request Python CLI Subprocess** | High latency (`300–1500ms+` boot/manifest load per call) | Brittle stdout parsing & process churn | **REJECTED** |
| **D. Binary UDS / Windows Named Pipe (`ipcClient.ts` style)** | Fast for `<256 KiB` frames | 256 KiB frame cap unsuitable for 10Y bars; Windows named-pipe ACLs unverified in CI (`ipcClient.ts` caveat) | **NOT PREFERRED** |

### 8.2 Endpoints (`iips-equicore-historical/v1`)
- `GET /v1/health` — Readiness, `contractVersion`, `service`, `baselineManifestSha256`, `compositeGeneration`, `corpusCoverageFrom`/`To`, `exchange: 'NSE'`, `frequencies: ['1D']`, `adjustmentModes: ['RAW_UNADJUSTED']`, `indexReady`.
- `POST /v1/historical/bars` — Daily (`1D`) canonical OHLCV range query for `(isin, series)` over `[fromDate, toDate]`.
- `POST /v1/historical/eod-observation` — Exact single-trade-date (`tradeDate`) EOD observation lookup (explicitly `PINNED_GENERATION_EOD_SNAPSHOT`, **not** bitemporal PIT).
- `GET /v1/instruments/:isin/associations` — Dated symbol/series continuity intervals & `isin_validity` (`Q5` projection).
- `GET /v1/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD` — Trading-day presence, official holidays, unexplained circular dates, and not-retrieved weekdays (`Q6` projection).

### 8.3 Request / Response Shape (`POST /v1/historical/bars`)
- **Request:** `{ contractVersion, requestId, security: { securityId, isin, series, exchangeSegment, clientCorrelationId? }, dateRange: { fromDate, toDate }, frequency: '1D', adjustmentMode: 'RAW_UNADJUSTED', pin?: { baselineManifestSha256?, compositeGeneration? }, includeRowProvenance: boolean }`.
- **Response (`200 OK`):** Carries `contractVersion`, `requestId`, `source: 'EQUICORE_NSE_EOD'`, `exchange: 'NSE'`, `exchangeSegment: 'NSE_EQ'`, `security` (`securityId`, `isin`, `series`, `isinValidity: 'VALID'`, `observedSymbols[]`), `temporal` (`temporalModel: 'PINNED_GENERATION_EOD_SNAPSHOT'`, `bitemporalKnowledgeAsOf: false`, `corpusCoverageFrom`, `corpusCoverageTo`, `requestedFromDate`, `requestedToDate`), `completeness` (`tradingDaysWithArchive`, `returnedBarCount`, `securityAbsentOnTradingDaysCount`, `officialHolidaysCount`, `unexplainedCalendarDates[]`, `notRetrievedCalendarDates[]`, `d21HeldDates[]`, `outOfCorpusWindow`), `adjustment` (`mode: 'RAW_UNADJUSTED'`, `isAdjusted: false`, `corporateActionApplied: false`, `unitsProvenanceNote`), `provenance` (`specVersion`, `runId`, `baselineManifestSha256`, `compositeGeneration`, `engineToolSha256`, `runnerSha256`), `bars[]` (exact `Decimal` strings + integers + `rowProvenance`), and `responseDigest` (SHA-256 over canonical JSON response excluding `responseDigest`).
- **Error Statuses:** `400` (`INVALID_IDENTITY`, `INVALID_DATE_RANGE`, `MALFORMED_REQUEST`), `401` (`TRANSPORT_UNAUTHORIZED`), `403` (`FORBIDDEN_HOST`), `404` (`INSTRUMENT_NOT_FOUND`), `409` (`GENERATION_MISMATCH`, `IDENTITY_AMBIGUOUS`, `D21_CONFLICT_HELD`), `422` (`UNSUPPORTED_EXCHANGE`, `UNSUPPORTED_FREQUENCY`, `ADJUSTMENT_UNAVAILABLE`), `500` (`INDEX_CORRUPT`, `BASELINE_INTEGRITY_FAILED`), `503` (`BASELINE_UNAVAILABLE`).

---

## 9. Strengthened `D-4.7` Requirements (`NP-04` Report Reproducibility) (Review Obs. #6)

To ensure every persisted `NP-06` report or `IID` assessment referencing EquiCore (or Dhan `D02` / `PIT` / `DATASET_EOD`) remains **100% self-contained, auditable, and offline-reproducible forever**, `ReportContent.canonicalPayload` (`frontend/server/reports/artifact.ts`) **MUST** embed a validated **`HistoricalPriceEvidence`** v1 block at write time containing all 6 mandatory components:

1. **Actual Historical Observations (`observations`):**
   - The concrete canonical price/bar values actually consumed (`businessDate`, `open`, `high`, `low`, `close`, `last`, `prevClose`, `volume`, `tradedValue`, `tradesCount` as exact `Decimal`/integer literals) — **never** a bare query ID, URL, or pointer requiring live EquiCore/Dhan re-query on read.
   - `observationDigest`: SHA-256 over the canonicalized `observations` array.
2. **Source & Canonical Security Identity (`sourceIdentity`):**
   - Closed `source` enum: `'EQUICORE_NSE_EOD' | 'DHAN_D02_OHLCV' | 'D114_PIT' | 'PIT_D01' | 'DATASET_EOD'`.
   - `exchange`: `'NSE' | 'BSE'`, `exchangeSegment`: `'NSE_EQ' | 'BSE_EQ'`, `securityId`: `'ISIN:<12-alnum>:<series>'`, `companyId`, `isinValidity`, `frequency`: `'1D' | ...`, and `observedSymbols` at observation time.
3. **Adjustment Status (`adjustment`):**
   - `mode`: `'RAW_UNADJUSTED' | 'ADJUSTED'`, `isAdjusted: boolean`, `corporateActionApplied: boolean`, `factor: number | null`, `corporateActionId: string | null`, and `unitsProvenanceNote`.
4. **Baseline & Generation Identifiers (`provenance`):**
   - For `EQUICORE_NSE_EOD`: `specVersion` (`"D05/1.0"`), `runId`, `baselineManifestSha256`, `compositeGeneration` (`string | null`), `engineToolSha256`, `runnerSha256`, `corpusCoverageFrom`, `corpusCoverageTo`, and per-observation `archiveSha256` / `sourceArchive` / `sourceLineNumber`.
5. **Completeness & Temporal Classification (`temporal` & `completeness`):**
   - `temporalModel`: `'PINNED_GENERATION_EOD_SNAPSHOT'`, `requestedFromDate`, `requestedToDate`, `returnedBarCount`, `tradingDaysWithArchive`, `unexplainedCalendarDates[]`, `notRetrievedCalendarDates[]`, `d21HeldDates[]`.
6. **Provider Response Digest & Retrieval Metadata (`integrity`):**
   - `responseDigest`: the SHA-256 digest returned by EquiCore and verified by IRR at ingestion time (`null` only for sources without a transport response digest).
   - `retrievedAt`: UTC ISO-8601 timestamp recorded by IRR (excluded from `reportKey` content-identity inputs if parameterized, retained in `ReportProvenance` / `canonicalPayload` per `NP-06` `D3` rules so version `v1` vs `v2` comparisons in `W16` `provenanceEnvelope.ts` surface exact price, `baselineManifestSha256`, `compositeGeneration`, `adjustment`, and `responseDigest` deltas).

**Read-Path Guarantee:** `GET /api/reports/artifacts/:reportId` renders the embedded `HistoricalPriceEvidence` verbatim and fails closed on `canonicalPayload` / `observationDigest` corruption — never contacting EquiCore or Dhan on historical report read.

---

## 10. EquiCore Capabilities vs Outstanding BSE, Incremental Publication & Full PIT Requirements (Review Obs. #5)

| Capability Area | 1. Existing Qualified EquiCore (`I5` M2 + `D23`) | 2. EquiCore Open Incremental (`B5` / `B6` / `B7`) | 3. Absent from EquiCore (External / Separate) | 4. Full PIT Admission (`D-4.5` Tier 1/Tier 2) |
|---|---|---|---|---|
| **NSE Daily EOD (`NSE_EQ`, `1D`)** | **QUALIFIED (`I5`)**: `2,462` archives (`2016-09-20`–`2026-09-18`), `5.69M` rows | Code in progress (`catalog-composite/1..14`); **`B5`/`B6`/`B7` OPEN** (not yet closed) | — | Requires EquiCore `D23`-extension authorization + PA admission |
| **BSE Daily EOD (`BSE_EQ`, `1D`)** | **ABSENT** | **ABSENT** | Requires Dhan `D02` (`W-14` pending) or future BSE Bhavcopy pipeline | Required by `D-4.5` (`PIT-ADM-02`) before claiming multi-exchange PIT |
| **Intraday Bars (`1m..1h`)** | **ABSENT** | **ABSENT** | Dhan `D02` only (`W-12`/`W-14` pending) | Out of scope for Bhavcopy/D114 PIT |
| **ISIN-Indexed Cross-App API** | **ABSENT** (`ui/serve.py` is Q1–Q10 UI host; `Q3` scans by `(symbol, series)`) | **ABSENT** | Proposed in this assessment (`iips-equicore-historical/v1`) | Requires `(isin, series, date)` Class-(4) index + EquiCore/IRR gates |
| **Bitemporal `knownAsOf` & Restatements** | **ABSENT** (`M2` immutable snapshot) | `D21` quarantines conflicts (`CHANGED-CONFLICT-UNRESOLVED`) | Not in Dhan `D02` either | Requires 4-timestamp model (`PIT-ADM-03`) + `supersedesVersion` (`PIT-ADM-04` / `D21 §22`) |
| **Corporate-Action Adjustment** | **ABSENT** (`RAW_UNADJUSTED`, `DEC-1` deferred) | **ABSENT** | `IID margin.ts` enforces `{ factor, corporateActionId }` refusal | Requires `asOf`-aligned CA timeline (`PIT-BT-02`) before split-adjusted analytics/valuation |
| **Governance Gates Today** | `I5` closed; `D23` local UI only (no external IIPS API) | `D16-13(2)` authorized; `B5`/`B6` incomplete | IRR `B2`/`P4`/`CV-32` (`D-4.5`) intact; `D-4` `D02` live-unverified | **Both** EquiCore `D23`-extension **and** IRR PA admission required |

---

## 11. Consumer Mapping, Ownership, Implementation Phases & Governance Decisions Required

### 11.1 Consumer Reuse Summary
- **Direct reuse (once authorized):** Daily `NSE_EQ` charts (`DhanHistorical.tsx` / `W-21`, alongside `DHAN_D02` with zero silent fallback), equity/portfolio analytics (`W-39` with `D-4.4` unadjusted disclosure), and `NP-04` report snapshot capture (`D-4.7`).
- **Conditional / gated:** `IID R-6` (`margin.ts`) remains gated on corporate-action `{ factor, corporateActionId }` support and explicit `R-6` source admission; `D-4.5` Tier 2 backtesting remains gated on 4-timestamp `knownAsOf`, restatements, `BSE_EQ`, and `asOf`-CA timeline.

### 11.2 Repository Ownership & Lifecycle Configuration
- **EquiCore (`ramkivs/equity-market-data-engine`):** Owns NSE archive custody, `D05/1.0` canonicalization, Class-(4) `(isin_normalized, series, business_date)` index, headless loopback `/v1/*` server (`serving.iips_serve` on `127.0.0.1:8614`), mandatory bearer token enforcement, `Host` check, and `responseDigest`.
- **IIPS / IRR (`ramkivs/iips-review-recovered`):** Owns `companyId` → `(ISIN, series, exchangeSegment)` resolution, `equicoreTransportConfig.ts` / `equicoreTransport.ts`, `historicalConsumptionBoundary.ts` (`D-4.2` non-blending), `verify-browser-bundle.mjs` leak guards, `D-4.4` UI disclosures, `NP-04` `HistoricalPriceEvidence` embedding (`D-4.7`), and `W16` diffs.
- **IPD (`ramkivs/iips-production-market-data`):** No direct EquiCore coupling; retains Dhan `D01`/`D02` (`W-19`), P7 registry (`4,680` rows), `./pit` (`B2`), and `NP-04` persistence store (`2e11fa3b`).

### 11.3 Implementation Phases (Post-Authorization Only)
1. **Phase A — Joint Governance Authorization (Prerequisite):** EquiCore Owner + IIPS Program Authority approve `IIPS-EQUICORE-SERVING-AUTHORIZATION-PROPOSAL-2026-11-23.md`.
2. **Phase B — EquiCore Headless Serving & ISIN Index (EquiCore Repo):** Implement Class-(4) `(isin_normalized, series)` index + `serving.iips_serve` (`127.0.0.1:8614`, mandatory bearer auth, `iips-equicore-historical/v1`) over `M2`, verified on Linux synthetic fixtures + Windows real `M2` baseline.
3. **Phase C — IRR Consumer, Boundary & `D-4.7` `NP-04` Embedding (IRR Repo):** Implement `equicoreTransport*`, `historicalConsumptionBoundary.ts` (`D-4.2` / `D-4.6`), `D-4.7` `HistoricalPriceEvidence` schema + validator + `W16` projections, `verify-browser-bundle.mjs` checks, and Windows integration proof.
4. **Phase D — Follow-On (Separate Future Decisions):** `B5`/`B6` closure for post-M2 incremental NSE updates; corporate-action factor source for `IID R-6`; `BSE_EQ` and 4-timestamp PIT (`D-4.5`).

---

## 12. Recommended Next Work Item

Submit [`docs/integration/IIPS-EQUICORE-SERVING-AUTHORIZATION-PROPOSAL-2026-11-23.md`](IIPS-EQUICORE-SERVING-AUTHORIZATION-PROPOSAL-2026-11-23.md) to the **EquiCore Owner** and **IIPS Program Authority** for explicit decision sign-off before any Phase B or Phase C implementation begins.
