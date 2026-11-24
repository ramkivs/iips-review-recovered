# IIPS–EquiCore Integration — Request/Response Architecture Assessment

- **Document ID:** `IIPS-EQUICORE-REQUEST-RESPONSE-ARCHITECTURE-ASSESSMENT-2026-11-23`
- **Date:** 2026-11-23 (UTC)
- **Authoritative Repositories Inspected:**
  - **IRR / IIPS (`ramkivs/iips-review-recovered`):** branch `arena/fbeebd7c-iips-review-recovered` (`ecacf83`, built atop `main` `dbb91b7`)
  - **EquiCore (`ramkivs/equity-market-data-engine`):** `origin/main` (`b79cf1d0561c388d0fcd0000503dc93f5a56e584`)
  - **IPD (`ramkivs/iips-production-market-data`):** inaccessible directly from this environment (`Resource not accessible by integration`); existing IPD contracts/pins are cited strictly from IRR-checked-in manifests, pin files (`.ci/verify-ipd-pins.mjs`, `frontend/package.json`), and accepted `D-4` / `B2` / `W-29` records.
- **Classification:** **ARCHITECTURE ASSESSMENT & RECOMMENDATION ONLY.** EquiCore's `I5` 10-year qualification and `D23` local UI grant do **not** authorize EquiCore-to-IIPS serving API implementation, incremental-ingestion completion, or IRR consumption changes. Explicit governance authorization (§7) is required before any implementation begins.

---

## 1. Executive Summary & Objective

IIPS currently splits historical market-data concepts across (a) **Dhan `D02`** (`POST /api/dhan/historical` via IPD `dhan-server`, live-unverified, capped at 1,825 days and 48 P7 companies in live-probe scope, `isAdjusted: false`, `D02_OHLCV` freshness `NOT_AVAILABLE`), (b) **non-production `D114/PIT`** (`GET /api/pit/market-data` over 20 in-memory fixture records, fenced behind Gate `B2`, `P4`, and `CV-32`), and (c) **`IID R-6`** (`margin.ts` consuming `PIT_D01 | DATASET_EOD` from the local IID dataset).

Meanwhile, **EquiCore** (`ramkivs/equity-market-data-engine`) holds the **I5-qualified 10-year NSE Bhavcopy corpus** (`i4-20261008-M2`: 2,462 archives, 5,689,949 canonical rows, 12 partitions, 2016-09-20 through 2026-09-18) plus a local stdlib-Python read-only serving layer (`src/serving/`, `src/ui/`) granted by `D23` for EquiCore's own single-user Dashboard/Explorer.

**Recommended Boundary:** Establish EquiCore as an **explicit, local loopback-only HTTP/JSON historical data provider (`127.0.0.1:8614`, versioned contract `iips-equicore-historical/v1`)** consumed strictly server-side by IIPS (mirroring IRR's existing IPD `dhanMarketDataTransport.ts` security pattern), serving **read-only NSE daily EOD canonical bars (`1D`, `RAW_UNADJUSTED`), dated symbol/ISIN associations, and NSE trading-calendar completeness** — with **zero silent fallback or blending** into Dhan `D02` (`D-4.2`) and **immutable snapshot capture** into `NP-04` persisted reports (`D-4.7`).

---

## 2. Current-State Findings (Verified Across Repositories)

### 2.1 EquiCore (`ramkivs/equity-market-data-engine` @ `b79cf1d`)

1. **Qualified 10-Year Baseline (`D14` / `I5`):**
   - Run `i4-20261008-M2`: `2,462` NSE Bhavcopy archives (`1,919` `legacy13` 2016–2024 + `543` `udiff34` 2024–2026), `5,689,949` canonical `SecurityRow` records, `12` `(format_family, calendar_year)` partitions, `4,948` package files (`21,119,807,344` bytes), `0` gating divergences, `R6` deterministic replay PASS.
   - Pinned identifiers (`src/serving/baseline.py` `DEFAULT_M2_SPEC`): `package_manifest_sha256: e7c7e4c8271f3a1c8ef42d76b926fe048a8997a342c92d89819eecd79e73b9dc`, engine `nse-engine` `w2-1.0.0` (`d3269b73...`), runner `I4-runner/1.0` (`f3ebf624...`), `spec_version: "D05/1.0"`.
   - **Environment custody boundary (`README.md`):** The 21 GB M2 package and raw NSE archives reside on the user's **Windows** host (`C:\IIPS_Data\...`), not in Git or Arena.
2. **Post-I5 Product Intent & `D16` Authority (`POST_I5_SERVING_INCREMENTAL_PRODUCT_ARCHITECTURE_*`):**
   - **Single-user personal scope (`Intent` §2/§12, `D16` §2):** Explicitly excludes auth, RBAC, multi-user, tenant isolation, PostgreSQL, and enterprise distributed infrastructure.
   - **4 Durable State Classes (`D16-07`):**
     - `(1)` Immutable qualified M2 baseline package.
     - `(2)` Approved incremental publications (`D16-05`, engine-owned).
     - `(3)` Processed-archive registry (`D16-02`, ingestion-owned).
     - `(4)` Derived serving state (indexes, rollups, saved queries — pure derivation of `(1)+(2)+(3)`, rebuildable at any time; deleting `(4)` is never a data event).
   - **Read/Write Separation (`D16-09`):** Serving is strictly a read-only consumer of `(1)+(2)+(3)`; queries never trigger or schedule ingestion; raw archive bytes remain in Windows custody (`D16-08` class 5 excluded by default).
   - **Changed-Content Hold (`D21`):** `CHANGED-CONFLICT-UNRESOLVED` fails closed (candidate quarantined out of canonical serving; prior accepted data remains intact and authoritative; per-instance conflict resolution withheld per `D21 §22`).
3. **`D23` Grant & Implemented Serving Surface (`src/serving/`, `src/ui/`):**
   - `D23` granted **first-release local read-only serving & UI** (`src/ui/serve.py` binding `127.0.0.1:8613`, `src/ui/api.py` `i4-ui-serving-adapter/1.0`) executing `Q1`–`Q10` via `serving.saved.execute_query_definition`, outputting deterministic canonical JSON (`serving.index.canonical_json`).
   - `D23 §17/§19` explicitly **withheld** incremental ingestion (`D16-13(2)`), raw-content serving, `DEC-1` eligibility/corporate-action joins, and any external/multi-application API contract.
4. **Incremental `B5` (`OW-10`) & Branding Status (`PUBLICATION_AUDIT_2026-11-03.md`, `B5_CATALOG_PUBLICATION.md`, `EQUICORE_BRANDING_AUDIT.md`):**
   - Owner subsequently authorized `D16-13(2)` (`B5_AUTHORIZED_INCREMENTAL_PROGRESS.md`), leading to catalog-backed SQLite composite publication (`catalog-composite/1.0..14.0`) with request-level generation pinning.
   - **However, `B5` remains OPEN** (affected identity/ticker groups rewrite as whole blobs, no trie GC, Windows `B6` validation and `B7` promotion incomplete).
   - Repository rebranded to **EquiCore** (`ramkivs/equity-market-data-engine`), preserving `nse_engine` module hashes (`d3269b73...`) and `i4-ui-serving-adapter/1.0`.
5. **EquiCore Data & Query Characteristics Relevant to IIPS:**
   - **Exchange coverage:** **NSE-only** (`legacy13`, `udiff34`). Zero BSE (`BSE_EQ`) records.
   - **Frequency:** **Daily EOD (`1D`) only**; zero intraday (`1m..1h`) bars.
   - **Price & corporate-action semantics:** Stores verbatim as-published values (`price_open`, `price_high`, `price_low`, `price_close`, `price_last`, `price_prev_close`, `traded_quantity`, `traded_value`, `trades_count`), **explicitly unadjusted** (`nse_engine/blocked.py`: `corporate_action_colocation` unresolved and `DEC-1`-deferred).
   - **Identity & indexing gap:** `SecurityRow` carries `security_isin`, `isin_normalized`, `isin_validity` (`VALID`/`BLANK`/etc., non-gating per `D05 §5`), `listing_symbol`, `series`, and `segment`. However, `serving/index.py` (`serving-index/1.2`) indexes files by `(listing_symbol, series)` and `business_date_min/max`, and `serving/query.py` streams `.rows.jsonl` files linearly. There is **no fast `(isin, series, dateRange)` secondary index** for programmatic cross-app bar queries.

### 2.2 IIPS / IRR (`ramkivs/iips-review-recovered` @ `ecacf83`) & IPD Boundary

1. **Dhan `D02` & `D-4` Decisions (`DHAN-D4-OWNER-ACCEPTANCE-2026-11-23.md`, `DHAN-D4-6-IDENTITY-SYMMETRY-IMPLEMENTATION-2026-11-23.md`):**
   - `D-4` adopted **Option C**: separate historical source authorities by use case; fail closed with **no silent fallback or blending** (`D-4.2`); truthful `D02` freshness removing hardcoded `SNAPSHOT` (`D-4.3`); mandatory unadjusted disclosure (`D-4.4`, PR #639); `B2`/`CV-32` retained (`D-4.5`, PR #643); canonical `(companyId, exchangeSegment: 'NSE_EQ'|'BSE_EQ', securityId: 'ISIN:<12-alnum>:<series>')` identity symmetry (`D-4.6`, PR #641); and `NP-04` immutable snapshot embedding (`D-4.7`).
   - Current Dhan `D02` remains `ACCESS_PENDING_UNVERIFIED` (`W-12`/`W-14` `E4` live proof pending; `W-19` `D02_OHLCV` cache unwired), capped at `1,825` days per request and `48` P7 companies in live-probe readiness (`4,680` statically registered `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED` in IPD `84e988b0`).
2. **IRR `D114/PIT` (`frontend/server/pit/`):**
   - `GET /api/pit/market-data` runs over an **ephemeral 20-record in-memory store** (`12` TCS D114 records + `8` SWANENERGY mocks) with `queryAsOf` only (`queryRange` absent). Fenced under `B2`, `P4` (NOT ADMITTED), and `CV-32` (`API-ONLY`).
3. **IRR Consumers & Persistence:**
   - **Charting (`DhanHistorical.tsx`):** Consumes `POST /api/dhan/historical` (`DhanHistoricalView`).
   - **`IID R-6` Valuation (`iips-platform/src/investment/assessment/margin.ts`):** `selectPrice` accepts only `PIT_D01 | DATASET_EOD`, checks `asOf >= knownAsOf` and `age <= priceMaxAgeDays` (default 7), and **refuses** any unadjusted price across corporate actions (`UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION`).
   - **Portfolio Valuation (`frontend/server/investment/positionValuation.ts`):** Bound to `CapturedRevisionRef`; currently uses `D01` quotes + `GOOD` freshness via `W-29` (`quoteConsumptionBoundary.ts`).
   - **Reports (`NP-04` / `NP-06`, `frontend/server/reports/artifact.ts`, `investmentArtifacts.ts`, `W16` `provenanceEnvelope.ts`):** Immutable chains keyed by deterministic `reportKey` + store-assigned `reportId` and `canonicalPayload`. Currently carries zero `HistoricalPriceEvidence` (`D-4.7` pending).
4. **IRR Transport Security Precedents:**
   - **HTTP Loopback Daemon (`dhanMarketDataTransport.ts` / `marketDataTransportConfig.ts`):** Server-side only (`verify-browser-bundle.mjs` blocks browser imports), loopback `http://127.0.0.1:<port>` enforced, bearer token read from server env (`IIPS_MARKET_DATA_TRANSPORT_TOKEN`), `10,000 ms` timeout, never retries writes, never exposes secrets to browser.
   - **Binary IPC (`user-portfolio/ipcClient.ts`):** UDS/Windows named pipe for small (`<= 256 KiB`) Gate-3 owner-scoped portfolio frames.

---

## 3. Proposed Component Architecture & End-to-End Request/Response Flow

### 3.1 Component Topology

```
BROWSER (React SPA — zero EquiCore URLs, tokens, or filesystem paths)
  ├─ Historical Charts / Analytics / Assessment / Reports
  └─ Calls IRR Server APIs only (e.g., POST /api/historical/bars, /api/reports/...)
                                      │
                                      ▼
IRR NODE SERVER (frontend/server/ — strictly server-side boundary)
  ├─ historicalConsumptionBoundary.ts (Option C source router: D02 vs EQUICORE vs PIT)
  │    • Enforces D-4.2: explicit source selection, ZERO silent fallback/blending
  │    • Enforces D-4.6: canonical (companyId?, exchangeSegment, ISIN:<12-alnum>:<series>)
  ├─ equicoreTransport.ts (dedicated server-side HTTP client)
  │    • Reads IIPS_EQUICORE_BASE_URL (127.0.0.1:8614), optional bearer token, timeout
  │    • Validates EquiCore envelope, generation pin, responseDigest, isAdjusted
  └─ NP-04 Report Composer (D-4.7)
       • Embeds immutable HistoricalPriceEvidence + EquiCore responseDigest on write
                                      │
           Loopback HTTP/1.1 + JSON (127.0.0.1:8614, server-to-server only)
                                      │
                                      ▼
EQUICORE SERVICE HOST (ramkivs/equity-market-data-engine, Python 3 stdlib)
  ├─ New IIPS Machine Adapter (src/serving/iips_api.py + host entrypoint)
  │    • Separate from UI static host (src/ui/serve.py:8613) or mounted under /v1/iips/*
  │    • Enforces contract iips-equicore-historical/v1, fail-closed validation
  │    • Pins baseline DEFAULT_M2_SPEC or single composite_generation per request
  ├─ Derived Serving Index (Class 4 — rebuildable SQLite/JSON index over (ISIN, series, date))
  │    • Pure derivation of Class (1) M2 + Class (2) B5 + Class (3) registry
  └─ Read-Only Package / Catalog Readers (never reads raw Windows archives on query)
```

### 3.2 End-to-End Request/Response Flow

1. **IIPS Request Construction & Pre-Validation (IRR Server):**
   - Caller / UI selects source explicitly (e.g., `EQUICORE_NSE_EOD` for multi-year NSE daily history) with canonical identity `(securityId: 'ISIN:<12-alnum>:<series>', exchangeSegment: 'NSE_EQ' | 'BSE_EQ')`, `fromDate`, `toDate`, `frequency`, and `adjustmentMode`.
   - IRR validates fail-closed before any network call: rejects non-NSE (`BSE_EQ` → `422 UNSUPPORTED_EXCHANGE`), rejects non-daily frequency (`1m..1h` → `422 UNSUPPORTED_FREQUENCY`), rejects adjusted modes if unsupported (`422 ADJUSTMENT_UNAVAILABLE`), validates strict calendar round-trip dates (`YYYY-MM-DD`, `fromDate <= toDate`), and checks `IIPS_EQUICORE_ENABLED` / loopback URL configuration.
2. **EquiCore Request Acceptance & Validation (EquiCore Server):**
   - Verifies loopback origin / optional bearer header and `contractVersion: "iips-equicore-historical/v1"`.
   - Validates JSON schema, exact ISIN format (`^IN[A-Z0-9]{9}[0-9]$` or D114 body check), non-empty `series`, valid ISO date bounds, and optional `expectedBaselineSha256` / `expectedGeneration` pin.
   - Pins an immutable read snapshot (`M2` baseline or single `composite_generation`) for the duration of the request so concurrent `B5` publications cannot tear results.
3. **Historical Query Execution by EquiCore:**
   - Resolves `(isin_normalized, series)` via EquiCore's Class-(4) derived ISIN-series index (handling `VALID` ISIN correlation per `D05 §6.1` and flagging multi-symbol continuity intervals or `D21` conflict notices in metadata — never merging unrelated instruments or serving unresolved `CHANGED` candidates per `D21 §18`).
   - Streams matching canonical `SecurityRow` records sorted deterministically by `(business_date, format_family, source_file_year, source_file, source_line_number)`.
   - Queries `w2/calendar.jsonl` (and composite `Q6` overlay if present) over `[fromDate, toDate]` to compute exact trading-day completeness (`expectedTradingDays`, `missingTradingDays`, `unexplained-by-obtained-circulars` / `not-retrieved` notices).
4. **Response Delivery to IIPS:**
   - EquiCore serializes canonical JSON (`serving.index.canonical_json`), computes SHA-256 `responseDigest`, stamps full baseline/generation provenance and `isAdjusted: false`, and returns HTTP `200` (or typed fail-closed `4xx/5xx`).
5. **IIPS Validation, Provenance Retention & Downstream Consumption:**
   - IRR verifies `contractVersion`, `securityId` echo coherence, monotonic `businessDate` within `[fromDate, toDate]`, and recomputes `responseDigest` against payload bytes (if mismatch → fail closed `502 INTEGRITY_MISMATCH`).
   - IRR maps provenance truthfully (never upgrading `RAW_UNADJUSTED` to adjusted, never substituting Dhan `D02` on miss/error), returns the view to the UI/analytics consumer, or — for `NP-06`/`IID` reports — embeds the snapshot inside `NP-04` (`D-4.7`).

---

## 4. Service Interface & Transport Assessment (Local Single-User Environment)

| Option | Latency & Payload Fit | Isolation & Governance Fit | Operational Simplicity (Windows + Node/Python) | Verdict |
|---|---|---|---|---|
| **A. Loopback HTTP/1.1 + Canonical JSON (`127.0.0.1:8614`, Python stdlib `ThreadingHTTPServer`)** | Low overhead (`<5ms` local RTT); streams multi-MB 10-year OHLCV JSON cleanly without arbitrary 256 KiB frame cap | Preserves `D16-07`/`D16-09` write/read isolation; EquiCore retains full ownership of Class (1)–(4) verification; matches IRR `dhanMarketDataTransport.ts` pattern | Zero extra dependencies (Node `fetch` + Python stdlib `http.server`); easy `/v1/health` probe; identical on Windows and Linux | **RECOMMENDED** |
| **B. Direct Filesystem / SQLite Read by IRR Node** | Fastest raw reads | **Violates `D16-07`/`D16-09`/`D23 §16`**: leaks EquiCore's internal `serving-index/1.2` & `catalog-composite/1..14` schemas into Node; forces Node to reimplement `baseline.py` verify-01..07 | Fragile across EquiCore `B5` schema migrations; risks reading unsealed/rebuilding Class-(4) state | **REJECTED** |
| **C. Subprocess CLI Spawn per Request (`python3 -m serving`)** | Poor (`300–1500ms+` Python boot + manifest/index load per request) | Reuses CLI boundary, but awkward error typing & stdout parsing | Process-spawn churn under multi-symbol portfolio/charting bursts | **REJECTED** |
| **D. Binary UDS / Windows Named Pipe IPC (`ipcClient.ts` pattern)** | Very fast for small frames | Good process isolation, but `ipcClient.ts` caps responses at `256 KiB` (10Y daily JSON easily exceeds 500 KiB–2 MB) | Windows named-pipe ACLs remain unverified in CI (`ipcClient.ts` caveat); duplicates framing in Python | **NOT PREFERRED** |

**Recommendation Rationale:** Option A gives IIPS the **same proven loopback HTTP adapter architecture** already audited in IRR for IPD (`marketDataTransportConfig.ts`, `dhanMarketDataTransport.ts`), requires **zero third-party libraries** in EquiCore (`D23 §13` constraint), naturally handles multi-year payloads, and enforces clean process/version isolation via a versioned HTTP contract.

---

## 5. Proposed Request & Response Contract (`iips-equicore-historical/v1`)

### 5.1 Endpoints
- `GET /v1/health` — Readiness, baseline/generation identity, corpus date span, supported capabilities (`exchange: 'NSE'`, `frequencies: ['1D']`, `adjustmentModes: ['RAW_UNADJUSTED']`).
- `POST /v1/historical/bars` — Multi-day `1D` OHLCV range query for a single canonical security.
- `POST /v1/historical/point-in-time` — Single-date / `asOf` EOD observation lookup over baseline + pinned generation.
- `GET /v1/instruments/:isin/associations` — Dated `(symbol, series)` continuity intervals & `isin_validity` (`Q5` projection).
- `GET /v1/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD` — NSE trading-day presence, sourced holiday labels, and unresolved circular dates (`Q6` projection).

### 5.2 `POST /v1/historical/bars` Request Schema
```json
{
  "contractVersion": "iips-equicore-historical/v1",
  "requestId": "uuid-or-correlation-id",
  "security": {
    "securityId": "ISIN:INE467B01029:EQ",
    "isin": "INE467B01029",
    "series": "EQ",
    "exchangeSegment": "NSE_EQ",
    "companyId": "optional-irr-echo-id"
  },
  "dateRange": {
    "fromDate": "2016-09-20",
    "toDate": "2026-09-18"
  },
  "frequency": "1D",
  "adjustmentMode": "RAW_UNADJUSTED",
  "pin": {
    "baselineManifestSha256": "optional-sha256",
    "compositeGeneration": "optional-sha256-or-null"
  },
  "includeRowProvenance": true
}
```
- **Validation Rules (Fail-Closed):**
  - `securityId` must match `^ISIN:([A-Za-z0-9]{12}):([^:\s]+)$` and agree with `isin`/`series` (`D-4.6` symmetry).
  - `exchangeSegment` must be `'NSE_EQ'` (`'BSE_EQ'` fails closed with `422 UNSUPPORTED_EXCHANGE`).
  - `frequency` must be `'1D'` (intraday fails closed with `422 UNSUPPORTED_FREQUENCY`).
  - `adjustmentMode` must be `'RAW_UNADJUSTED'` (`SPLIT_ADJUSTED` / `TOTAL_RETURN` fail closed with `422 ADJUSTMENT_UNAVAILABLE`).
  - `fromDate` and `toDate` must be valid UTC ISO calendar dates with `fromDate <= toDate` and span `<= 3660` days (10 years) per request.

### 5.3 `POST /v1/historical/bars` Response Schema (`200 OK`)
```json
{
  "contractVersion": "iips-equicore-historical/v1",
  "requestId": "uuid-or-correlation-id",
  "source": "EQUICORE_D05_EOD",
  "exchange": "NSE",
  "exchangeSegment": "NSE_EQ",
  "security": {
    "securityId": "ISIN:INE467B01029:EQ",
    "isin": "INE467B01029",
    "series": "EQ",
    "isinValidity": "VALID",
    "observedSymbols": [
      { "symbol": "TCS", "observedFrom": "2016-09-20", "observedTo": "2026-09-18" }
    ]
  },
  "temporal": {
    "temporalModel": "ARCHIVE_PRESENCE_BASELINE_PLUS_IMMUTABLE_DELTA",
    "asOfSemantics": "SNAPSHOT_AT_PINNED_GENERATION",
    "corpusCoverageFrom": "2016-09-20",
    "corpusCoverageTo": "2026-09-18",
    "requestedFromDate": "2016-09-20",
    "requestedToDate": "2026-09-18"
  },
  "completeness": {
    "calendarScope": "qualified-baseline-calendar",
    "tradingDaysInRange": 2462,
    "returnedBarCount": 2462,
    "missingTradingDaysCount": 0,
    "missingTradingDates": [],
    "unexplainedCalendarDates": ["2024-11-20", "2025-10-20"],
    "hasD21ConflictNotice": false
  },
  "adjustment": {
    "mode": "RAW_UNADJUSTED",
    "isAdjusted": false,
    "corporateActionApplied": false,
    "unitsProvenanceNote": "Rupees as published by NSE; raw bhavcopy values unadjusted for splits/bonuses/dividends."
  },
  "provenance": {
    "specVersion": "D05/1.0",
    "runId": "i4-20261008-M2",
    "baselineManifestSha256": "e7c7e4c8271f3a1c8ef42d76b926fe048a8997a342c92d89819eecd79e73b9dc",
    "compositeGeneration": null,
    "engineToolSha256": "d3269b731008a0d544eaa7e96d6c6b75cf94dfd6ce31d8fb5e1f23fdf10a80e9",
    "runnerSha256": "f3ebf62488716ea3f4fff76b104760dfee7df45c81af253a4faf352beb624c4a"
  },
  "bars": [
    {
      "businessDate": "2026-09-18",
      "formatFamily": "udiff34",
      "listingSymbol": "TCS",
      "series": "EQ",
      "open": "4100.00",
      "high": "4125.00",
      "low": "4085.50",
      "close": "4112.25",
      "last": "4110.00",
      "prevClose": "4095.00",
      "tradedQuantity": 1823450,
      "tradedValue": "7498210345.50",
      "tradesCount": 94120,
      "flags": [],
      "rowProvenance": {
        "sourceArchive": "BhavCopy_NSE_CM_0_0_0_20260918_F_0000.csv.zip",
        "archiveSha256": "...",
        "memberName": "BhavCopy_NSE_CM_0_0_0_20260918_F_0000.csv",
        "sourceLineNumber": 1842
      }
    }
  ],
  "responseDigest": "sha256-over-canonical-payload"
}
```
*Note on numeric precision:* EquiCore stores prices as exact published `Decimal` strings (`D05 §3.1`, `nse_engine/rows.py:strict_decimal`); transmitting decimal strings (or exact strings + parsed numbers validated at IRR) avoids IEEE-754 rounding drift for `NP-04` hashing.

### 5.4 Error Contract (Fail-Closed HTTP Statuses)
| HTTP | Code | Meaning |
|---|---|---|
| `400` | `INVALID_IDENTITY` / `INVALID_DATE_RANGE` / `MALFORMED_REQUEST` | Syntax, calendar round-trip, or `fromDate > toDate` failure |
| `401` | `TRANSPORT_UNAUTHORIZED` | Missing/invalid optional loopback bearer token |
| `404` | `INSTRUMENT_NOT_FOUND` | Valid ISIN/series has zero records in pinned baseline/generation (never an error if valid query simply hits empty date window inside existing security — return `200` with `returnedBarCount: 0`) |
| `409` | `GENERATION_MISMATCH` / `D21_CONFLICT_HELD` | Caller-pinned `compositeGeneration` or `baselineManifestSha256` disagrees with server state, or target archive is held under `D21` conflict |
| `422` | `UNSUPPORTED_EXCHANGE` / `UNSUPPORTED_FREQUENCY` / `ADJUSTMENT_UNAVAILABLE` | `BSE_EQ`, intraday `1m..1h`, or adjusted mode requested |
| `500` | `INDEX_CORRUPT` / `BASELINE_INTEGRITY_FAILED` | EquiCore Class (1)–(4) digest check failed |
| `503` | `BASELINE_UNAVAILABLE` | Package unmounted or server initializing |

---

## 6. Responsibility & Repository Ownership Matrix

| Responsibility | EquiCore (`ramkivs/equity-market-data-engine`) | IIPS / IRR (`ramkivs/iips-review-recovered`) | IPD (`ramkivs/iips-production-market-data`) |
|---|---|---|---|
| **NSE archive custody, parsing (`D05/1.0`), validation & `I5`/`B5` storage** | **Owner** (Windows custody + `nse_engine`) | Consumer only (never accesses archives) | No involvement (IPD holds its own 3 D114 test fixtures + Dhan) |
| **ISIN-series Class-(4) index & `/v1/historical/*` HTTP service** | **Owner** (new `D23`-successor authorized module) | Consumer only | No involvement |
| **Identity resolution (`ISIN` + `series` + symbol continuity)** | Authoritative for NSE Bhavcopy `(isin_normalized, series)` & `Q5` dated associations | Validates `D-4.6` tuple & maps to `companyId` / `IID` `IN:ISIN:<isin>` | Owns Dhan P7 registry (`4,680` NSE+BSE rows) |
| **Corporate-action adjustment & `R-6` valuation gate** | Explicitly **unadjusted** (`DEC-1` deferred); declares `isAdjusted: false` | **Owner** of `D-4.4` disclosure & `IID margin.ts` refusal; future CA timeline if needed | Declares `isAdjusted: false` on Dhan `D02` |
| **Source selection (`D02` vs `EQUICORE` vs `PIT`) & non-blending** | Serves EquiCore NSE data only | **Owner** (`historicalConsumptionBoundary.ts`, enforcing `D-4.2`) | Owns Dhan `D02` (`1ce6a829`/`26855625`) & `./pit` library |
| **Caching & Class-(4) state** | Owns rebuildable serving index `(4)` + generation pinning | Optional short-TTL response cache or none (must never hide `responseDigest` or generation mismatch) | Owns `D01`/`D02` Dhan cache (`W-19`) |
| **Persisted report evidence retention (`NP-04` / `D-4.7`)** | Supplies deterministic `responseDigest` + `provenance` | **Owner** of `ReportContent` embedding (`HistoricalPriceEvidence`) & `W16` diffing | Owns `NP-04` SQLite store (`2e11fa3b`) |

---

## 7. Service Lifecycle, Failure Handling, Compatibility & Configuration

- **Process Lifecycle & Readiness:** EquiCore runs as an independent local loopback process on the Windows host (`python3 -m serving.iips_serve --package <pkg> --m2 --state <dir> [--registry <dir>] --bind 127.0.0.1 --port 8614`), verifying `baseline.py` manifest identity + Class-(4) ISIN index readiness before listening (mirrors `ui/serve.py:213-228` fail-closed startup). IIPS Node (`executive-transport.ts`) starts cleanly regardless of whether EquiCore is running; `/api/equicore/health` surfaces `NOT_CONFIGURED` / `UNAVAILABLE` / `READY`.
- **Configuration (Server-Side Only, Never Browser):**
  - `IIPS_EQUICORE_ENABLED` (`'true' | 'false'`, default `'false'` until admitted)
  - `IIPS_EQUICORE_BASE_URL` (loopback `http://127.0.0.1:8614` / `localhost` / `[::1]` only)
  - `IIPS_EQUICORE_TRANSPORT_TOKEN` (optional shared loopback secret if adopted for parity with `IIPS_MARKET_DATA_TRANSPORT_TOKEN`)
  - `IIPS_EQUICORE_TIMEOUT_MS` (default `10_000`, matching `DEFAULT_IPD_MARKET_DATA_TIMEOUT_MS`)
- **Timeouts, Retries & Failure Handling:**
  - Read-only queries use `AbortSignal.timeout(timeoutMs)`. At most **one** retry only on immediate connection reset (`ECONNRESET`) if idempotent `pin` is set; **zero** retries on `4xx`, `409`, `422`, `500`, or response timeout; **zero fallback** to Dhan `D02` or fixture `PIT` (`D-4.2`).
- **Version Compatibility:**
  - Wire contract pinned via `contractVersion: 'iips-equicore-historical/v1'`; unknown major version fails closed (`502 CONTRACT_VERSION_MISMATCH`).
  - Baseline/generation drift detected via `provenance.baselineManifestSha256` and `provenance.compositeGeneration`; report/replay callers supply `pin` to enforce deterministic re-reads (`409 GENERATION_MISMATCH` if store moved).

---

## 8. Consumer Mapping Across IIPS

| IIPS Consumer | Can Reuse EquiCore Interface? | Required Adaptation / Constraint |
|---|---|---|
| **Historical Daily Charts (`DhanHistorical.tsx` / `W-21`)** | **Yes (for `NSE_EQ`, `1D`)** | Explicit source selector (`EQUICORE_NSE_EOD` vs `DHAN_D02`); removes 1,825-day & 48-company limits for NSE daily history; renders `isAdjusted: false` (`D-4.4`) & `Q6` missing-trading-day calendar badges. Intraday (`1m..1h`) & `BSE_EQ` stay on Dhan `D02`. |
| **Portfolio / Equity Analytics (`W-39`)** | **Yes (with `D-4.4` guard)** | Reuses `/v1/historical/bars`, `/v1/instruments/:isin/associations` (ticker-change tracking), and `/v1/calendar`. Split-sensitive return attribution remains gated until CA adjustment factors exist. |
| **`IID R-6` Valuation (`margin.ts`)** | **Conditional (not drop-in today)** | EquiCore supplies authoritative NSE EOD closes matching `DATASET_EOD` fidelity, **but** `margin.ts` enforces `PriceRecord.source ∈ {'PIT_D01', 'DATASET_EOD'}` and refuses across splits/bonuses without `{ factor, corporateActionId }`. Requires explicit `R-6` amendment + CA factor source. |
| **Persisted Reports (`NP-04` / `NP-06`, `D-4.7`)** | **Yes (via snapshot embedding)** | Embeds `HistoricalPriceEvidence` (bars/close digest, `responseDigest`, `baselineManifestSha256`, `compositeGeneration`, `isAdjusted: false`) inside `NP-04` `ReportContent` at write time so historical reads stay 100% offline-reproducible. |
| **Point-in-Time Backtesting** | **Not yet** | Requires 4-timestamp (`marketDate`/`publishedAt`/`ingestedAt`/`revisedAt`), `supersedesVersion`, `asOf`-CA timeline, and `B2`/`CV-32` supersession (§9). |

---

## 9. Reassessment of `D-4.5` (PIT Admission) & `D-4.7` (Report Reproducibility)

### 9.1 `D-4.5` (`DHAN-D4-5-PIT-ADMISSION-ASSESSMENT-2026-11-23.md`) Reassessment
| `D-4.5` Gap / Criterion | Already Addressed by EquiCore `I5` (+ `B5`)? | Still Required in IIPS / Governance / EquiCore? |
|---|---|---|
| **`PIT-ADM-01` (Durable storage vs 20-record IRR memory)** | **Yes (NSE baseline + `B5` catalog)** — 21 GB immutable M2 package + SQLite `B5` composite snapshots on Windows host | Needs `B5`/`B6` Windows closure + EquiCore HTTP adapter authorization (separate from IRR's Gate 3/A′). |
| **`PIT-ADM-02` (Real NSE+BSE Bhavcopy ingestion)** | **Partially (NSE 10Y DONE)** — `2,462` NSE archives checksummed & holiday-audited (`Q6`) | **BSE (`BSE_EQ`) absent** in EquiCore; `B5` incremental NSE pipeline still open (`B5`/`B6`/`B7`). |
| **`PIT-ADM-03` (4-timestamp `knownAsOf` model)** | **Not addressed** — EquiCore records `business_date` + run/manifest identity + `D21` hold, not per-row `(publishedAt, ingestedAt, revisedAt)` | Needed before EquiCore can serve as a bitemporal `knownAsOf` backtesting store. |
| **`PIT-ADM-04` (`supersedesVersion` restatement chain)** | **Not addressed** — `D21` quarantines conflicting archives rather than resolving restatements (`D21 §22` withheld) | Requires `D21 §22` governance + restatement schema if backtesting across corrected files is required. |
| **`PIT-ADM-05` (`D-4.6` identity, `D-4.4` CA, `D-4.2` non-blending)** | **Partially** — EquiCore has `security_isin` + `series`, unadjusted `D05` values | EquiCore needs `(isin, series, dateRange)` index; IRR needs `historicalConsumptionBoundary.ts` + `D-4.4` UI badges. |
| **`PIT-ADM-06` (`B2` / `P4` / `CV-32` admission)** | **No** — EquiCore `I5`/`D23` do not modify IRR gates | PA must still supersede `B2`/`P4` (or issue a dedicated EquiCore admission act) and PO must reopen `CV-32` for any PIT UI. |
| **`PIT-BT-01..04` (Range PIT, `asOf`-CA timeline, universe)** | **Partial (`Q2`/`Q3` range + non-survivorship-biased 10Y raw archive rows exist)** | Missing `asOf`-aligned CA adjustment timeline (`DEC-1` deferred) and `(isin, series)` range query API. |

### 9.2 `D-4.7` (`NP-04` Report Reproducibility) Reassessment
- **Addressed by EquiCore:** EquiCore eliminates live-vendor mutability (`D02` revision drift) for NSE EOD history by pinning immutable `baselineManifestSha256` + `compositeGeneration` + deterministic `responseDigest` + `D05 §8` per-row archive SHA-256.
- **Still Owned by IRR:** Defining `HistoricalPriceEvidence` on `ReportContent` (`frontend/server/reports/artifact.ts`), embedding the observed price/bars + `responseDigest` + `isAdjusted` at report creation (`D-4.7`), and adding `W16` (`provenanceEnvelope.ts`) comparison rules for `baselineManifestSha256` / `compositeGeneration` / `adjustmentStatus`.

---

## 10. Integration Dependency Map, Sequence & Required Governance Authorizations

### 10.1 Existing Capabilities vs Proposed Architecture vs Unauthorized Work
- **Existing Qualified / Implemented Capabilities:**
  - *EquiCore:* `I5` 10-year NSE baseline (`i4-20261008-M2`); `D23` local loopback UI/CLI (`src/ui/serve.py:8613`, Q1–Q10); `B5` in-progress incremental catalog (`open`).
  - *IRR:* `D-4` accepted; `D-4.4` (PR #639) & `D-4.6` (PR #641) merged; `D-4.5` assessed (PR #643); `W-29` `quoteConsumptionBoundary.ts` pattern established.
- **Proposed Architecture (This Document — Not Authorized):**
  - EquiCore `(isin, series, dateRange)` Class-(4) index + `iips-equicore-historical/v1` loopback HTTP read adapter (`127.0.0.1:8614`); IRR `equicoreTransport.ts` + `historicalConsumptionBoundary.ts` + `D-4.7` `NP-04` evidence embedding.
- **Not Yet Authorized (Explicit Governance Decisions Required):**
  1. **EquiCore External-Consumer Serving Authority Act (EquiCore Repo, extending `D23`):** Authorize EquiCore to expose a headless loopback machine API (`iips-equicore-historical/v1`) for IIPS over `M2` (and optionally validated `B5` composite generations once `B5`/`B6` close), and authorize building the `(isin, series, dateRange)` Class-(4) read index.
  2. **IRR EquiCore Historical Source Admission & `D-4` Addendum (IRR Repo, Program Authority):** Admit `EQUICORE_NSE_EOD` as an approved historical source alongside `D02` under `D-4.1`–`D-4.4` (preserving `D-4.2` non-blending, leaving `B2`/`P4`/`CV-32` intact or explicitly routing `D-4.5` Tier 1 replay through EquiCore).
  3. **Optional Downstream Gates (Deferred Until Needed):** `IID R-6` adjustment-factor amendment + corporate-action dataset source (for valuation across splits), `D21 §22` restatement authority + 4-timestamp schema (for Tier 2 backtesting).

### 10.2 Recommended Phased Implementation Sequence
1. **Phase A — Governance Gate (Immediate):** Issue joint PA/Owner decision approving EquiCore `iips-equicore-historical/v1` serving scope (M2-first, `NSE_EQ` `1D` `RAW_UNADJUSTED`) and IRR source admission.
2. **Phase B — EquiCore Read Endpoint & ISIN Index (`equity-market-data-engine`):** Build Class-(4) `(isin_normalized, series, business_date)` index (`D16-07` class 4, rebuildable), implement `iips_api.py` (`/v1/health`, `/v1/historical/bars`, `/v1/instruments/:isin/associations`, `/v1/calendar`) with canonical `responseDigest`, and verify against M2 on Windows.
3. **Phase C — IRR Consumer & Transport (`iips-review-recovered`, `W-20` + `D-4.7`):** Implement server-only `equicoreTransport.ts`, unify `D02` + `EQUICORE_NSE_EOD` under `historicalConsumptionBoundary.ts` (preserving `D-4.2`/`D-4.6`), wire `D-4.7` `HistoricalPriceEvidence` into `NP-04` reports, and verify `verify-browser-bundle.mjs` + Windows end-to-end tests.
4. **Phase D — Follow-On (Separate Gates):** `B5`/`B6` closure for post-2026-09-18 incremental daily updates; corporate-action factor source for `IID R-6` / split-adjusted analytics.

---

## 11. Recommended Next Work Item

**Draft and submit the joint Governance Authorization Proposal (`IIPS-EQUICORE-SERVING-AUTHORIZATION-PROPOSAL`)** requesting Program Authority / Owner sign-off on:
1. EquiCore's `D23`-extension scope to implement the Class-(4) `(isin, series)` index and loopback `iips-equicore-historical/v1` service over the qualified M2 baseline; and
2. IRR's `D-4` source admission of `EQUICORE_NSE_EOD` (`1D`, `RAW_UNADJUSTED`, zero fallback with `D02`) and `D-4.7` `HistoricalPriceEvidence` schema for `NP-04` reports.
