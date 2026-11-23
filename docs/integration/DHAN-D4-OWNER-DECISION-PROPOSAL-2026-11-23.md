# D-4 Owner Decision Proposal — Dhan D02 vs D114/PIT Historical Precedence & Architecture Reconciliation

**Document ID:** `DHAN-D4-OWNER-DECISION-PROPOSAL-2026-11-23`  
**Date:** 2026-11-23 (UTC)  
**Status:** **OWNER APPROVED (`approve_all_d4`, 2026-11-23) — IRR ACCEPTED (`8f893112`, PR #627) · IPD MIRROR ACCEPTED (`df74b500`, IPD PR #191) · ERRATUM RECONCILED** (Implementation of `W-20` remains **BLOCKED** pending `W-12` → `W-17`/`W-14` → `W-19` preconditions)  
**Parent Assessment:** `docs/integration/DHAN-D02-VS-D114-PIT-ARCHITECTURE-ASSESSMENT-2026-11-23.md` (kept separate as technical reference)  
**Primary Governing Reference:** `docs/integration/DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md` (`DHAN-LIVE-ROADMAP-2026-11-11`, v1.1)  

> **Post-Acceptance Erratum Reconciliation (`D4-DR-01`, `D4-DR-02`, `D4-DR-03`):** Following owner approval (`approve_all_d4`) and IPD's mirror acceptance (`IPD-D4-MIRROR-ACCEPTANCE-2026-11-23`, IPD PR #191, `df74b50018c3bc4de083446e33de8609148455d6`), factual descriptions below were reconciled without altering any approved `D-4.1`–`D-4.7` requirement: (1) **`D4-DR-02`:** IPD `84e988b0` manifests (`evidence/dhan-w27/expansion-manifest.json`, `evidence/dhan-p7/qualification-report.md`) establish that all `4,680` mappings (including the `4,584` net additions over the earlier `96`-row sample) are **already statically qualified and registered** (`proposedAdditions: 0`, `alreadyQualified: 4680`), not inert `PROPOSED` rows — while still remaining **not live-qualified** (`SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED`) until `W-14` `E4` + `W-27` parity complete; and (2) **`D4-DR-03`:** IRR's 20-record in-memory boot fixture store (`GET /api/pit/market-data`) is strictly distinguished from IPD's three archived Bhavcopy fixtures (`./d114-non-production`) and IPD's durable library-only PIT store (`pit_durable_store.ts`, no HTTP route).

---

### Evidence & Authority Labelling Conventions

Every statement in this proposal is explicitly classified so reviewers can separate verified repository code from governance rules and proposed decisions:

- **[VERIFIED FACT — IRR]** — Directly observed in IRR (`ramkivs/iips-review-recovered`) source files, test suites, pins, or committed records at `main` (`22a68a4`) and PR #626 (`71e562e2`).
- **[INFERRED FROM IRR / UNVERIFIED IN IPD]** — IPD (`ramkivs/iips-production-market-data`) API and git access returned `403`/`404` from this sandbox (`Resource not accessible by integration`); IPD-side code facts are cited from IRR-checked-in investigation/handoff records (`a624d06`, `1aee57f`, `1ce6a829`) and reported PRs (#164, #166, #168, #176, #189), clearly marked as not directly re-read on IPD `main`.
- **[EXISTING DECISION / GOVERNANCE]** — Approved or enacted by an existing Program Authority, Gate (`B2`, `CV-32`), or Owner Decision (`D-7`, `W-24`, `IID R-6`, `DHAN-LIVE-ROADMAP-2026-11-11`).
- **[CONCLUSION]** — Evidence-backed architectural conclusion derived from inspected files.
- **[ASSUMPTION]** — Working assumption stated explicitly where live vendor behaviour or uninspected IPD state has not been observed.
- **[PROPOSED DECISION — OWNER APPROVAL REQUIRED]** — Proposed governance decision for **D-4** requiring formal IPD + IRR owner sign-off.

---

## 1. Executive Summary

**[VERIFIED FACT — IRR]** `DHAN-LIVE-ROADMAP-2026-11-11` v1.1 requires Phase 0 decision **`D-4`** (*"Decide D02 (Dhan) vs D114/PIT historical precedence"*) before Phase 4 work item **`W-20`** (*"Implement the D02 / D114-PIT precedence boundary"*) or Phase 6 **`W-39`** (*"Historical-data consumption extension"*) can proceed. Today, **no `D-4` decision record exists** in IRR, and `D02` (`POST /api/dhan/historical`) and `D114/PIT` (`GET /api/pit/market-data`) operate as disjoint, non-interacting paths.

**[CONCLUSION]** Reconciling both architectures, the `W-06`/`W-14` evidence chain, `IID` valuation policy (`R-6`), and `NP-06` persisted report requirements leads to one clear recommendation: **adopt Option C (Separate Responsibilities by Use Case, with Explicit Source Selection, Non-Fallback / Non-Blending, and Artifact-Level Snapshot Capture)**:
1. **Dhan `D02`** serves **date-range charting, intraday candles, and ad-hoc range price inspection** (`1m..1D`, up to `1,825` days), once `W-12` (historical builder check), `W-13`/`W-14` (`E4` live qualification), and `W-19` (`D02` cache & freshness) are complete.
2. **D114 / PIT** is reserved for **point-in-time (`asOf`) replay and future backtesting**, remaining gated behind `B2`/`CV-32` non-production limits until a dedicated product-admission package (durable storage, real Bhavcopy archive ingestion, 4-timestamp temporal model) is approved.
3. **`IID` Valuation / Margin of Safety** preserves its existing **`R-6` rule (`PIT_D01 → DATASET_EOD → withhold`)** with strict `knownAsOf` alignment and corporate-action adjustment refusal.
4. **Persisted Reports (`NP-06`) & Assessments (`IID`)** achieve historical reproducibility by embedding immutable price observations and provenance **inside the saved `NP-04` artifact** rather than re-querying live `D02` months later.

---

## 2. Architectural Context

**[EXISTING DECISION / GOVERNANCE]** IIPS is a **personal, single-user, local Windows application** (`docs/OPERATOR_RUNBOOK.md`, `DHAN-LIVE-ROADMAP-2026-11-11.md`). It introduces no multi-tenant cloud database or enterprise streaming bus.

**[VERIFIED FACT — IRR]** Four independent streams converge on `D-4`:
- **Dhan Live Integration (`DHAN-LIVE-ROADMAP-2026-11-11`):** Delivers live quotes (`D01_QUOTES`) and historical OHLCV (`D02_OHLCV`) via a local loopback IPD daemon (`127.0.0.1:8791`). `W-29` (PR #625, merged `2026-11-23` at `22a68a4`) built the shared IRR consumption boundary strictly for **`D01_QUOTES` only**, leaving `D02_OHLCV` deferred to `W-20` and `W-39`.
- **Snapshot-to-Live Portfolio (`W06`, PR #624, merged `2026-11-23`):** Delivered a revision-bound, read-only quote/freshness coverage mechanism (`dhanRevisionCoverage.ts`), while real holdings measurement remains blocked on `B02` (Windows host access) and bounded by `W04` (`1/64`).
- **D114 / Point-in-Time Store (`Gate B2`, `CV-32`):** Admits `./pit` and `./d114-non-production` (`2e11fa3b…`) exclusively for non-production API verification (`P4 retained, NOT ADMITTED` for product consumption).
- **Investment Intelligence (`IID R-6`) & `NP-06` Reports:** Independently enforce `knownAsOf` price alignment, corporate-action refusal (`margin.ts`), and immutable `NP-04` artifact persistence (`reports-transport.ts`).

---

## 3. Existing Implementation Baseline

### IRR Repository (`ramkivs/iips-review-recovered`) — Directly Inspected
- **IRR `main` HEAD:** `22a68a4ac8546149cd759ab978dec459fcef8aa` (merges PR #624 `W06 Snapshot-to-Live` via `774df7b` and PR #625 `W-29` via `3f3d61a`).
- **PR #626 (`arena/f18beaf5-iips-review-recovered`, OPEN):** Head `71e562e2edfcf561ae19e2be3c7dbacaf6839a5f` (branched from `b7927de`), adding `W-31` Watchlists display, `W-28` measurement CLI (`DHAN-W28-MEASUREMENT-2026-11-23.md`, `evidence/w28-coverage-summary.json`), `DHAN-W14-INVESTIGATION-2026-11-23.md` (`6f3e9a2`), `DHAN-W14-RECONCILIATION-W06-2026-11-23.md` (`413d1b4`), and `DHAN-W14-W12-SERIALIZATION-VERIFICATION-2026-11-23.md` (`71e562e`).
- **IPD Package Pins in IRR (`frontend/package.json` + `.ci/verify-ipd-pins.mjs`):**
  - `iips-production-market-data` (`./dhan-server`): **`1ce6a829a7ce65550356a0071c108a60f2d813be`** (IPD `main` merge carrying W-07 PR #168, W-08 #169, W-09 #170, W-10 verify).
  - `iips-np04-governed-persistence` (`./pit`, `./d114-non-production`, `./persistence`): **`2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`**.
  - `iips-broker-import` (`./broker-import`): **`12a3d625d0ad603cb0bd9cea46bae314942ee40f`**.

### IPD Repository (`ramkivs/iips-production-market-data`) — Access Boundary
- **[VERIFIED FACT — IRR]** Direct API/git inspection of IPD returned `403 Resource not accessible by integration` / `404` on `codeload.github.com` in this environment.
- **[INFERRED FROM IRR / UNVERIFIED IN IPD]** IPD implementation facts are drawn from IRR's baseline investigation (`a624d06` / `1aee57f`), `DHAN-W11-CAPABILITY-GAPS-IPD-HANDOFF-2026-11-16.md`, `DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md`, `DHAN-W14-*` records, and IRR's packaged imports of `iips-production-market-data/pit` & `/d114-non-production`.

---

## 4. D02 Assessment (`POST /api/dhan/historical` → `POST /v2/charts/historical`)

### Step-by-Step Technical Validation
1. **Historical request-builder correctness (kept strictly separate from W-12 quote serializer PR #176):**
   - **[INFERRED FROM IRR / UNVERIFIED IN IPD]** IPD's `dhan_historical_dto.ts` `buildDhanHistoricalRequestBody` constructs `{ securityId, exchangeSegment, instrument: 'EQUITY', interval, fromDate, toDate }`, explicitly marked **PROVISIONAL** (docs-derived, never tested live).
   - **[VERIFIED FACT — IRR]** IPD PR #176 (reported merged in IPD and unverified directly from this sandbox) addressed **quote** security-ID serialization (`POST /v2/marketfeed/quote`: strings `["2885"]` → numbers `[2885]`, followed by a real Reliance quote HTTP 200). `DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md` §8 and `DHAN-W14-W12-SERIALIZATION-VERIFICATION-2026-11-23.md` §2.2/§6 explicitly note that IPD's **historical request builder** is a separate code path and has **not** yet been independently verified for numeric vs string `securityId` handling or live `E4` execution.
2. **Security ID and exchange-segment mapping:**
   - **[VERIFIED FACT — IRR]** IRR's `validateDhanHistoricalRequest` (`dhanMarketDataRoutes.ts:328-401`) requires `companyId` and optionally accepts `exchangeSegment` (`NSE_EQ | BSE_EQ`) and 12-char `isin`.
   - **[INFERRED FROM IRR]** Unlike quotes (`resolveExactIdentity` requiring full `ISIN:<isin>:<series>`), IPD's historical service (`dhan_historical_adapter.ts`) accepts `companyId`-only lookup via `registry.resolve(companyId)` (`H-5` asymmetry in baseline investigation §E).
3. **Supported interval mapping:** **[VERIFIED FACT — IRR]** `1m`, `5m`, `15m`, `1h`, `1D` only (mapped to canonical `1m/5m/15m/1h/1d` in IPD); `1w`/monthly rejected with `400 UNSUPPORTED_INTERVAL`.
4. **Date-range handling:** **[VERIFIED FACT — IRR]** Strict `YYYY-MM-DD`, `fromDate <= toDate`, inclusive span `<= 1,825` days (`365 * 5`; leap-year exact, tested in `dhanMarketDataRoutes.test.ts:451-471`). No pagination/chunking beyond `1,825` days (`H-12`).
5. **Historical response DTO & 6. OHLCV field mapping:** **[INFERRED FROM IRR]** IPD `parseDhanHistoricalResponse` expects columnar arrays (`open`, `high`, `low`, `close`, `volume`, `timestamp`), fails the whole batch on ragged lengths, duplicates, or out-of-order timestamps, and accepts uniformly empty arrays (`returnedCandleCount: 0`). Marked **PROVISIONAL** — never live-tested against Dhan (`W-13`/`W-14` G-4).
7. **Timestamp interpretation:** **[INFERRED FROM IRR]** `timestamp` (epoch seconds) converts via `new Date(epochSeconds * 1000)` to `candleStart` and `candleEnd = start + intervalMs`, with no exchange-session or holiday validation (`H-8`).
8. **Adjustment declaration:** **[VERIFIED FACT — IRR / INFERRED FROM IPD]** IPD `dhan_historical_adapter.ts` hardcodes `isAdjusted: false` (`H-7`). No split, bonus, or dividend adjustment metadata exists on D02 candles.
9. **Cache behaviour:** **[INFERRED FROM IRR]** `DhanMarketDataService.getHistorical` bypasses `DhanHistoricalCache` (`H-10`, `DHAN-W11` Gap 2) and performs zero local persistence (`H-14`).
10. **Freshness reporting (separated from data completeness & live response qualification):**
    - **[VERIFIED FACT — IRR]** IPD `GET /v1/freshness?domain=D02_OHLCV` always returns `cacheState: 'NOT_AVAILABLE'`, `verdict: 'UNKNOWN'`, `evidenceAvailable: false`, `thresholdSeconds: 86400` (`W-19` pending).
    - **[VERIFIED FACT — IRR — DEFECT OBSERVED]** In `frontend/server/market-data/dhanMarketDataRoutes.ts:476-487`, `projectIpdHistoricalResult` **hardcodes `freshness: 'SNAPSHOT'`** on the historical response body even while the attached `freshnessStatus` reports `D02_OHLCV` freshness as `UNAVAILABLE` / `UNKNOWN`.
11. **Error handling & source qualification:** **[VERIFIED FACT — IRR]** Fail-closed error mapping (`400`, `401`, `429`, `502`, `503`, `504`); `coverageClaim` forwards IPD's `'ACCESS_PENDING_UNVERIFIED'`; `providerQualification` is hardcoded to `'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED'`.

### D02 Qualification Matrix

| Capability | Current Implementation | Evidence | Remaining Work |
|---|---|---|---|
| **Historical request** | `validateDhanHistoricalRequest` (IRR) + `buildDhanHistoricalRequestBody` (IPD) | Verified locally with synthetic fixtures (IRR `dhanMarketDataRoutes.test.ts`); IPD body **PROVISIONAL** | Audit IPD historical builder for `DH-905` numeric/string ID rules & test live against Dhan (`W-12` / `W-17`) |
| **Security identity** | IRR accepts `companyId` + optional `exchangeSegment`/`isin`; IPD resolves `companyId` (`H-5`) | Verified in IRR validation tests; IPD P7 load (`96` / `4,680` manifest) | Align `D02` with `D01` exact-identity discipline (`D-4.6`) & expand live-qualified rows (`W-14`) |
| **OHLCV mapping** | IPD columnar parser → canonical `OHLCVCandle`; IRR passes through unchanged | Synthetic IPD `dhan_d3c_historical` (11 cases) & IRR routes | Live `E4` capture comparing Dhan `/charts/historical` response vs `dhan_historical_dto.ts` (`W-13`/`W-17`) |
| **Interval support** | `1m`, `5m`, `15m`, `1h`, `1D` validated at both IRR and IPD | Runtime-verified on pre-access daemon (`1w` rejected) | Live `E4` verification for every supported interval (`M3`) |
| **Timestamp handling** | Epoch seconds → UTC ISO `candleStart`/`candleEnd` (`H-8`); no session/holiday model | Synthetic unit tests only | Verify whether Dhan daily epochs represent IST midnight or exchange close; define missing-bar handling |
| **Adjustment semantics** | Declared `isAdjusted: false` (`H-7`); no corporate-action metadata | Verified in `dhanSyntheticFixtures.ts` & baseline investigation | Verify Dhan's actual adjusted/unadjusted output in `E4`; enforce `D-4.4` disclosure/refusal |
| **Cache behaviour** | `DhanHistoricalCache` exists in IPD but is unwired (`getHistorical` bypasses it) | Baseline investigation `H-10`; `DHAN-W11` Gap 2 | Wire `DhanHistoricalCache` and refresh tracking (`W-19`) |
| **Freshness** | IPD `GET /v1/freshness?domain=D02_OHLCV` returns `NOT_AVAILABLE` / `UNKNOWN`; IRR hardcodes `SNAPSHOT` on series | Verified in `dhanFreshnessRoutes.ts`, `dhanMarketDataRoutes.ts:485`, `DhanFreshnessStatus.tsx` | Complete IPD `W-19` & remove IRR's hardcoded `SNAPSHOT` on `D02` (`D-4.3`) |
| **Live qualification** | `providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED'`, `coverageClaim: 'ACCESS_PENDING_UNVERIFIED'` | Verified in code (`dhanMarketDataRoutes.ts:39`) | Complete `W-12` historical check, `W-17`/`W-18` (`M3a`/`M3`), and `W-19` |

---

## 5. D114/PIT Assessment (`GET /api/pit/market-data` & `PointInTimeStore`)

### Verification Against Current IRR Source Code
**[VERIFIED FACT — IRR]** Direct inspection of `frontend/server/pit/` (`nonProductionRuntimePitStore.ts`, `nonProductionPitStore.ts`, `ipdPitReadAdapter.ts`, `pitReadBoundary.ts`, `pitReadContract.ts`, `pit-transport.ts`, `pitD114RuntimeIntegration.test.ts`) confirms:

- **Storage model & persistence:** `createNonProductionRuntimePitStore()` creates a single **in-memory** `PointInTimeStore<unknown>` once at server process boot. There is **no database, disk journal, or durable persistence** behind `/api/pit/market-data`—restarting the server resets the store to its deterministic boot population.
- **Data ingestion & current fixture vs market-data coverage:**
  1. `populateNonProductionD114Pit(store)` (from `iips-production-market-data/d114-non-production` @ `2e11fa3b…`) ingests **12 records** (`3` dates × `2` series × `2` domains `D01_QUOTES`/`D02_OHLCV`) from packaged offline D114 CM-UDiFF / Legacy Bhavcopy test fixtures for TCS (`NON_PRODUCTION_D114_EQ`, `NON_PRODUCTION_D114_BL`).
  2. `appendNonProductionFixtures(store)` (`nonProductionPitStore.ts`) appends **8 mock fixture records** for `SWANENERGY` (`INE665A01038:BL` and `:EQ` across `T1`/`T2`/`T3`).
  - **Exact verified total:** **20 in-memory records** (`12 + 8 = 20`, asserted explicitly in `pitD114RuntimeIntegration.test.ts:116`), **not** live or broad market-data coverage.
- **Security identity & domains:** Strict `ISIN:<12-char-alnum>:<series>` (`pitReadBoundary.ts`); `EQ` and `BL` series strictly isolated; domains restricted to `D01_QUOTES` and `D02_OHLCV`; stamps `isinAuthority: 'NON_AUTHORITATIVE'`.
- **`asOf` query behaviour, temporal selection & interfaces:** `PitReadService.queryAsOf` returns the single latest record with `resolvedAsOf <= requestedAsOf` (future records excluded; `pitReadBoundary.test.ts` & `pitD114RuntimeIntegration.test.ts`). **Daily EOD only (`1d`) — zero intraday (`1m..1h`) support and zero date-range (`fromDate..toDate`) query endpoint.**
- **Correction & revision handling:** `PointInTimeStore.append()` is append-only using `asOf` timestamps, `dataVersion`, and `lineageHash`. However, `nonProductionRuntimePitStore.ts` performs a static one-shot boot load and IRR exposes **no** correction, restatement, or multi-date download-vs-effective-date differentiation on `/api/pit/market-data`.
- **Admission boundaries (`B2` & `CV-32`):**
  - **[EXISTING DECISION / GOVERNANCE]** Gate `B2` (`IIPS_v3.0_G1_B2_PIT_D114_CAPABILITY_ADMISSION_DECISION.md`, `2026-10-15`) admits `./pit` and `./d114-non-production` **exclusively for non-production verification** and forbids production or live/historical Dhan acquisition.
  - **[EXISTING DECISION / GOVERNANCE]** `PKG-05-PIT-CV32-DISPOSITION-PACKET.md` (`2026-10-18`) marks CV-32 **CLOSED — API-ONLY** and keeps P4 route admission **`retained, NOT ADMITTED`** for product consumption. `frontend/src/api/pit.ts` has **0 callers** in `frontend/src/`.

### Point-in-Time Temporal Semantics (Required Model for Future Production PIT)

**[CONCLUSION]** Today's `DataProvenanceDTO` carries three timestamps (`asOf`, `receivedAt`, `evaluatedAt`). For historically accurate `asOf` queries, backtesting, and late-arriving Bhavcopy ingestion (e.g., downloading a 2024 Bhavcopy archive in 2026), a single `asOf` field is ambiguous unless four distinct temporal dimensions are separated:

1. **Market Event / Effective Date (`marketDate` / `candleEnd`):** The exchange trading date to which the price belongs (e.g., `2024-03-15`).
2. **Exchange Publication Time (`publishedAt`):** When NSE/BSE officially published the Bhavcopy or correction file (e.g., `2024-03-15T18:30:00+05:30`).
3. **IIPS Ingestion / Knowledge Availability Time (`ingestedAt` / `knownAsOf`):** When the record actually entered IIPS's local PIT store (e.g., `2026-11-23T10:00:00Z` if backfilled in 2026).
4. **Correction / Revision Time (`revisedAt` / `supersedesVersion`):** When a subsequent corrected exchange file or corporate-action restatement overwrote or superseded an earlier record for the same `marketDate`.

**Consequences for Backtesting & Historical Investment Decisions:**
- **True Knowledge-Time Replay (`knownAsOf <= T`):** Only records with `ingestedAt <= T` were genuinely known to IIPS at `T` (cannot be satisfied for 2024 if downloaded in 2026).
- **Simulated Market-Publication Replay (`publishedAt <= T`):** Backtesting historical strategies using 2024 Bhavcopy downloaded in 2026 is valid *only* as an explicitly labelled **exchange-publication-time simulation** (`effectiveAsOf <= T`), **provided** any post-`T` revisions (`revisedAt > T`) are excluded and corporate-action adjustments are pinned to factors known at `T`.
- Conflating "downloaded in 2026" with "known in 2024" or silently overwriting revised bars corrupts both backtests and historical decision audits.

---

## 6. W-06 / W-14 Reconciliation & Identity/Budget Calculations

### Reconciliation Summary Table

| Area | Reconciled Finding & Supporting Evidence |
|---|---|
| **W-06 (Two distinct W-06 items)** | 1. **Dhan-roadmap `W-06` (first live auth):** **COMPLETE — OWNER ATTESTED** at IPD `617fab0` (`DHAN-LIVE-ROADMAP-2026-11-11.md` p.1; Reliance quote `ltp 1339.7`, `IPD_SERVER_HTTPS`, `qualifiedMappings=96`, superseding 2026-11-15 PARTIAL assessment).<br>2. **Snapshot-to-Live `W06` (PR #624, `W06-SNAPSHOT-TO-LIVE-QUOTE-FRESHNESS-COVERAGE-2026-11-23.md`):** **PARTIAL — mechanism delivered (`dhanRevisionCoverage.ts`, 388 lines + 364-line synthetic test suite), NOT COMPLETE and NOT ACCEPTED.** |
| **B02** | **Outstanding host-access dependency:** Per-holding rows for `DHAN_PORTFOLIO` revision 1 (`64` holdings) live only on the Windows host (`ownerBoundPortfolioCapture.ts`). Blocks actual Snapshot-to-Live `W06` measurement (further bounded by `W04`: **`1/64`** stored identity). **Does NOT block Dhan `W-14`**, because `W-14` tests vendor mapping correctness, not holdings coverage (`DHAN-W14-RECONCILIATION-W06-2026-11-23.md` §3). |
| **W-14 original population** | **96** `QUALIFIED` P7 equity rows across **48** unique companies: **`NSE:EQ` = 48**, **`BSE:A` = 47**, **`BSE:B` = 1** (`DHAN-LIVE-MARKET-DATA-CURRENT-STATE-INVESTIGATION-2026-11-11.md` §E; `DHAN-W14-INVESTIGATION-2026-11-23.md` §2, §4.1). |
| **W-27 additions** | IPD PR #164 (`bcb45d7`, manifest `371bf3bd…`, pipeline `325266d…`, SHA `69a918f…`) and IPD `84e988b0` (`evidence/dhan-w27/expansion-manifest.json`, `evidence/dhan-p7/qualification-report.md`) show **4,680** statically `QUALIFIED` and registered rows (`NSE:EQ` = **2,390**, `BSE:A` = **700**, `BSE:B` = **1,590**; `counts.proposedAdditions: 0`, `counts.alreadyQualified: 4680`; rejected: `193,340` non-equity, `24` invalid, `19,060` no-P04). The net **W-27 expansion over the earlier `96`-row P7 sample = `4,680 − 96 = 4,584`** rows (`+2,342 NSE:EQ`, `+653 BSE:A`, `+1,589 BSE:B`). **Erratum (`D4-DR-02`):** these `4,584` rows are already **statically qualified and registered** (loaded by `loadGovernedP7InstrumentRegistry`), not inert `PROPOSED` rows; however, they remain **`SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED`** (not live-qualified) until `W-14` `E4` live qualification and `W-27` parity complete (`DHAN-W28-MEASUREMENT-2026-11-23.md` §2; `evidence/w28-coverage-summary.json`). **Not a W-14 start blocker** (`W-14` can begin on the `96`-row subset). |
| **Unique identities** | See exact calculation below: **96** unique registry keys / `48` unique companies in original P7; **4,680** unique `(companyId, exchangeSegment, ISIN, series)` registry keys in W-27 expansion (company/ISIN-level count bounded between **2,390 and 4,680**). |
| **Request budget** | **97** `POST /v2/marketfeed/quote` calls (`96` P7 sample + `1` wrong-ID probe) for baseline `W-14` quote qualification, plus optional `N` (`<= 4,584`) owner-scoped W-27 rows under a separate grant (`DHAN-W14-W12-SERIALIZATION-VERIFICATION-2026-11-23.md` §6). **Historical (`D02`) probes are budgeted separately** (not included in the 97). |
| **Batching** | While Dhan `/v2/marketfeed/quote` and IPD `buildQuoteRequestBody` support multi-ID arrays per segment, IPD `/v1/quotes` and IRR `POST /api/dhan/quotes` accept **1 security per request**, and `W-14` §9 Step 2 executes **1 request per `(exchangeSegment, dhanSecurityId)`** for unambiguous per-row redacted request/envelope proof. Under IPD's operational limiter (**60 req / 60s**, concurrency `8`), 97 calls require **`ceil(97 / 60) = 2` rate-limit windows (~2 minutes)**. Historical `/v1/historical` (`D02`) is single-instrument per call (no batching). |
| **Wrong-ID control** | **1** deliberate wrong-ID probe (e.g., off-by-one `dhanSecurityId` in the same segment) to establish the live stale-ID signature (`UNRESOLVED_INSTRUMENT` vs `HTTP_ERROR 400/DH-905` vs `404/UNKNOWN_INSTRUMENT` vs obvious mismatch; `DHAN-W14-INVESTIGATION-2026-11-23.md` §5.3, §9 Step 2–3). |
| **E4** | **Insufficient for W-14 today:** Only 1 partial Reliance quote (`["2885"]` → 400 `DH-905` in IPD PR #156; Python `[2885]` → 200; plus reported PR #176 Reliance 200 not independently inspectable here). Zero NSE/BSE breadth across the remaining 95 P7 rows, zero wrong-ID signature, zero `D02` historical `E4`. |
| **Readiness** | **Quotes (`W-14`):** Technically ready once IRR advances its IPD pin from `1ce6a829…` to the verified PR #176 merge SHA (`B-W14-1` currently `PARTIALLY SATISFIED`) and owner grants the 97-request `E4` execution authorization (`B-W14-2` / `B-W14-3`). **Historical (`D02`):** Not ready — requires `W-12` historical builder audit + `W-17`/`W-19`. |

### Exact Identity & Request Budget Calculations (From Repository Evidence)

1. **Original P7 Population (`96` rows):**
   - `NSE:EQ` (`48`) + `BSE:A` (`47`) + `BSE:B` (`1`) = **`96` unique exchange-scoped security identities** (`companyId | exchangeSegment | ISIN:<isin>:<series>`).
   - Because each of the `48` companies is mapped once on NSE (`EQ`) and once on BSE (`A` or `B`), deduplicating by `companyId` (or raw 12-char `ISIN`) yields **`48` unique companies / ISINs**.
   - **Baseline `W-14` quote request count:** `96` (one per unique exchange-scoped mapping row so both `NSE_EQ` and `BSE_EQ` security IDs are verified) `+ 1` (wrong-ID control) = **`97` quote requests**.
2. **W-27 Expanded Manifest (`4,680` rows, `evidence/w28-coverage-summary.json`):**
   - `NSE:EQ` (`2,390`) + `BSE:A` (`700`) + `BSE:B` (`1,590`) = **`4,680` unique exchange-qualified rows** (each registry key is unique by `DhanInstrumentRegistry` conflict checks).
   - **Net W-27 additions:** `4,680 − 96 = 4,584` rows (`2,342` `NSE:EQ` + `653` `BSE:A` + `1,589` `BSE:B`).
   - **Unique company/ISIN count in the `4,680` expansion:** Because IRR holds only aggregate counts (`evidence/w28-coverage-summary.json`) and does **not** contain `qualification-manifest.json` (IPD is `403` here), the exact company-level overlap between `NSE_EQ` (`2,390`) and `BSE_EQ` (`2,290`) cannot be counted directly from IRR. Mathematically, unique companies/ISINs are **bounded between `2,390` (if every BSE company is also in NSE) and `4,680` (if zero overlap)**; exact count requires reading IPD commit `371bf3bd…` directly.
   - **Full-expansion upper bound (not recommended):** `4,680 + 1 = 4,681` requests (~78 minutes at 60 req/min); hence `W-14` recommends `97` now + an owner-scoped W-27 holdings subset (`N`) once `B02`/`W-28` capture runs.

### Explicit W-06 → W-14 Conclusion
**[CONCLUSION]** Snapshot-to-Live **`W06` measurement limitations (`B02` host-capture block and `W04` `1/64` ceiling) do NOT block `W-14` readiness.** Dhan `W-06` (auth progression, attested at `617fab0`) satisfies `W-14`'s credential prerequisite, and `W06` (`dhanRevisionCoverage.ts`) provides a reusable per-identity pattern without blocking `W-14`'s `97`-request mapping probe. The precise outstanding dependencies for `W-14` are: (1) verifying IPD PR #176 merge SHA & advancing IRR's IPD pin (`B-W14-1`), (2) separately checking IPD's historical request builder (`W-12` historical leg), and (3) owner authorization for the bounded `97`-request `E4` window (`B-W14-2` / `B-W14-3`).

---

## 7. The Seven D-4 Decision Areas (`D-4.1` – `D-4.7`)

### D-4.1 Source Authority by Use Case
**[PROPOSED DECISION — OWNER APPROVAL REQUIRED]** Adopt **Option C** (separate authorities by question semantics):

| IIPS Function | Proposed Authority | Rationale & Admission Boundary |
|---|---|---|
| **Historical charts (`1D` range)** | **Dhan `D02`** (`POST /api/dhan/historical`) | Built for multi-day OHLCV series (`<= 1,825` days); `D114/PIT` has no range API and is non-production. |
| **Date-range price inspection** | **Dhan `D02`** | Same range contract; discloses `isAdjusted` and `D02` freshness (`W-19`). |
| **Intraday historical candles (`1m..1h`)** | **Dhan `D02`** | Only source supporting intraday intervals (`D114` is EOD Bhavcopy only). |
| **IID valuation & Margin of Safety** | **Existing `IID R-6` rule (`PIT_D01 → DATASET_EOD → withhold`)** | Enforces `knownAsOf` alignment & mandatory corporate-action factor refusal (`margin.ts`). **Distinct from general D114/PIT product admission:** `R-6` operates on IID's governed local dataset (`DATASET_EOD` / `PIT_D01`), not the non-production `/api/pit/market-data` route. |
| **Point-in-time (`asOf`) replay** | **Future qualified `D114/PIT`** | Requires `resolvedAsOf <= asOf` non-leakage; blocked from product screens until `B2`/`CV-32` are superseded. |
| **Backtesting** | **Future qualified `D114/PIT`** (or future Option D ingestion) | Un-vintaged Dhan `D02` introduces look-ahead & restatement bias. |
| **Persisted reports (`NP-06` & `IID`)** | **Immutable embedded observations + provenance** inside `NP-04` | Guarantees deterministic reproduction months later without re-querying Dhan. |

### D-4.2 Source Selection and Failure Behaviour
**[PROPOSED DECISION]**
- **Explicit source selection:** Every IRR request/consumer declares its capability (`range_ohlcv` → `D02`; `pit_as_of` → `D114/PIT`; `valuation_mos` → `IID R-6`).
- **Fail-closed on source unavailable (no silent fallback, no silent blending):** If Dhan `D02` fails (`400/401/429/502/503/504`) or returns `0` candles, IRR surfaces the explicit typed failure or empty result—**never** substituting `D114/PIT` or stitching candles across sources.
- **User-visible source identification & completeness:** Every historical payload and UI panel displays source (`Dhan D02` vs `D114/PIT` vs `DATASET_EOD`), requested vs returned count, `coverageClaim` (`ACCESS_PENDING_UNVERIFIED` vs verified), and `isAdjusted`. If any future feature ever permits explicit opt-in secondary data, it must be labelled as an explicit user-triggered switch with separate provenance, never silent fallback.

### D-4.3 D02 Freshness
**[PROPOSED DECISION]** Eliminate the current contradiction where `projectIpdHistoricalResult` (`dhanMarketDataRoutes.ts:485`) hardcodes `freshness: 'SNAPSHOT'` while `D02_OHLCV` reports `NOT_AVAILABLE`/`UNKNOWN`:
- **Required timestamps in the truthful D02 freshness model:**
  1. `marketTimestamp` — latest candle `candleEnd` / market close timestamp in the series (latest available market date).
  2. `providerResponseTimestamp` — vendor response/observation timestamp (when provided by Dhan).
  3. `retrievalTimestamp` (`receivedAt`) — UTC time IPD fetched the batch from Dhan.
  4. `cacheTimestamp` (`evaluatedAt`) — UTC time IPD evaluated freshness (`W-19` `DhanHistoricalCache`).
- **Rule:** Until IPD `W-19` wires `DhanHistoricalCache` and `W-14` qualifies `D02` live, IRR must report `D02` series freshness truthfully as **`UNAVAILABLE`** (or `STALE`/`SNAPSHOT` strictly driven by IPD's `D02_OHLCV` `FreshnessStatus`, never hardcoded `SNAPSHOT` when `evidenceAvailable === false`).

### D-4.4 Corporate-Action Adjustment Policy
**[PROPOSED DECISION]**
- **Unadjusted candle representation & disclosure:** While `D02` reports `isAdjusted: false`, all charts and tables **must** render an explicit *"Unadjusted for corporate actions (splits/bonuses/dividends)"* badge.
- **Split/bonus vs dividend considerations:** Unadjusted prices across a split or bonus create false price cliffs and invalidate multi-year return calculations and intrinsic value comparisons. Dividend adjustment (total return vs price return) is out of scope for raw price candles and must not be implied.
- **Valuation & comparability boundary:** Preserve `margin.ts`'s hard refusal (`UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION`) whenever a corporate action occurs without an explicit `{ factor, corporateActionId }`. Raw `isAdjusted: false` `D02` candles are **prohibited** from driving split-sensitive valuation or portfolio return attribution until corporate-action adjustment is verified and modelled.

### D-4.5 D114/PIT Admission
**[PROPOSED DECISION]** Keep Gate `B2` and `CV-32` (`API-ONLY`, `P4 retained, NOT ADMITTED`) intact during `W-20`. Separate admission gates are required before wider product use:
- **Historical analysis / replay (read-only product surface):** Requires (1) durable disk/SQLite storage in the product-admitted runtime path (replacing IRR's 20-record in-memory boot fixture store on `/api/pit/market-data`; note IPD already holds a library-only durable store `src/pit/pit_durable_store.ts` with no HTTP route and no product admission), (2) automated/verified NSE+BSE Bhavcopy ingestion beyond IRR's runtime fixtures and IPD's three archived Bhavcopy fixtures (`2024-06-28` legacy, `2026-01-05` & `2026-02-10` UDiFF in `./d114-non-production`), (3) 4-timestamp temporal metadata (`marketDate`, `publishedAt`, `ingestedAt`, `revisedAt`), and (4) explicit PA admission packet superseding `B2`/`CV-32`.
- **Backtesting:** Requires all of the above **plus** (5) multi-date range-over-time PIT query contract (`asOf` cutoff + `fromDate..toDate`), (6) deterministic correction/restatement handling (`supersedesVersion`), (7) corporate-action factor timeline aligned to `asOf`, and (8) reproducible query digest verification.

### D-4.6 D01/D02 Identity Consistency
**[PROPOSED DECISION]** Close the `H-5` asymmetry between `D01` and `D02`:
- Both `POST /api/dhan/quotes` (`D01`) and `POST /api/dhan/historical` (`D02`) must require **exact canonical identity** (`companyId` + `ISIN:<isin>:<series>` + `exchangeSegment` `NSE_EQ|BSE_EQ`), rejecting `companyId`-only historical ambiguity at the governed boundary (or at minimum requiring `exchangeSegment` + canonical `securityId` when `W-20` activates).
- Mapping provenance (`manifestCommit`, `pipelineCommit`, `lastVerifiedAt`, `isinAuthority`) must match `W-27` / `W-28`'s exact matcher, and wrong-ID protection (`UNRESOLVED_INSTRUMENT`, no symbol/fuzzy matching) must apply identically to `D01` and `D02`. Address the `W-27` byte-reproducibility parity gap (`DHAN-W28-COVERAGE-BLOCKER-2026-11-15.md` §5) and complete `W-14` `E4` live qualification before promoting the `4,584` statically qualified W-27 expansion rows (`4,680` total statically registered in IPD `84e988b0`, `proposedAdditions: 0`, `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED`) to live-qualified reliance in `D01` or `D02` (`D4-DR-02`).

### D-4.7 Persisted Report Reproducibility
**[PROPOSED DECISION]** Every `NP-06` report or `IID` assessment referencing market prices must embed an immutable **`HistoricalPriceEvidence`** block inside the `NP-04` persisted payload containing:
1. `source` (`DHAN_D02_OHLCV` | `D114_PIT` | `DATASET_EOD` | `PIT_D01`),
2. `securityIdentity` (`companyId`, `ISIN:<isin>:<series>`, `exchangeSegment`),
3. `marketTimestamp` (`asOf` / `candleStart..candleEnd`),
4. `observationTimestamp` / `retrievalTimestamp` (`receivedAt`),
5. `dataValues` (exact price or OHLCV series / digest used),
6. `adjustmentStatus` (`isAdjusted` + `{ factor, corporateActionId }`),
7. `sourceProvenance` (`dataVersion`, `lineageHash`, `providerQualification`, `coverageClaim`),
8. `schemaVersion` & `completeness` (`returnedCandleCount`, `expectedTradingDays` if known, or `ACCESS_PENDING_UNVERIFIED`).
- Reading a past report (`GET /api/reports/artifacts/:reportId`) renders the immutable stored payload verbatim; generating a *new* report version (`POST .../versions`) records a new evidence block and allows side-by-side diffing across `dataVersion`, `marketTimestamp`, and `adjustmentStatus`.

---

## 8. Option Analysis (Summary)

*(Detailed evaluation appears in `DHAN-D02-VS-D114-PIT-ARCHITECTURE-ASSESSMENT-2026-11-23.md` §8.)*

| Option | Summary | Verdict |
|---|---|---|
| **Option A — Dhan D02 everywhere** | Routes charting, valuation, and backtesting to Dhan `D02`. | **Rejected:** Introduces look-ahead bias, fails `margin.ts` corporate-action checks, capped at 1,825d / 48 companies, irreproducible reports. |
| **Option B — D114/PIT everywhere** | Routes all historical reads to PIT Bhavcopy; `D02` marginalized. | **Rejected:** No intraday bars, no range API, blocked by `B2`/`CV-32`, heavy daily Bhavcopy ingestion burden for a single-user app. |
| **Option C — Separate responsibilities by use case + immutable artifact capture** | `D02` for range/intraday charts; `IID R-6` for valuation; `D114/PIT` for future `asOf`/backtesting; zero fallback/blending; `NP-04` snapshot capture for reports. | **Recommended:** Matches existing IRR/IPD boundaries, safe, minimal complexity, unblocks `W-20` cleanly. |
| **Option D — Ingest all Dhan D02 into versioned PIT store** | IPD writes Dhan bars into durable PIT store before consumption. | **Deferred:** Over-engineered prior to `W-14` `E4` proof; risks persisting unverified/unadjusted provisional bars. Viable later phase if live-bar backtesting is needed. |

---

## 9. Recommended Option C Architecture

```
                         IRR GOVERNED CONSUMPTION LAYER
  ┌──────────────────────────┬───────────────────────────┬──────────────────────────┐
  │ Charting / Range OHLCV   │ Valuation / MoS (IID R-6) │ Backtesting / PIT Replay │
  │ (W-20 / W-21 / W-39)     │ (Preserved Unchanged)     │ (Gated: B2 / CV-32)      │
  └────────────┬─────────────┴─────────────┬─────────────┴────────────┬─────────────┘
               │                           │                          │
               ▼                           ▼                          ▼
  POST /api/dhan/historical       IID local dataset          GET /api/pit/market-data
  (range_ohlcv: 1m..1D, <=1825d)  (PIT_D01 -> DATASET_EOD    (pit_as_of: resolvedAsOf
   + D02_OHLCV freshness (W-19)    -> withhold on unadjusted  <= asOf, non-prod until
   + isAdjusted disclosure         corporate actions)         durable PIT admission)
               │                           │                          │
               ▼                           ▼                          ▼
  IPD dhan-server (1ce6a829+)     NP-04 Immutable Artifact   IPD pit (2e11fa3b+)
  NO SILENT FALLBACK / BLENDING   (Embeds exact price +      NO LIVE FALLBACK
```

---

## 10. Source Authority Matrix

| Domain / Question | Authoritative Source | Fallback Behaviour | Required Provenance Tag |
|---|---|---|---|
| **Daily & intraday OHLCV charts** | Dhan `D02` | Fail closed (error / empty) | `DHAN_D02_OHLCV`, `freshnessStatus`, `isAdjusted`, `coverageClaim` |
| **Margin of Safety / IID valuation** | `IID R-6` (`PIT_D01 → DATASET_EOD`) | **Withhold MoS** with refusal code | `source`, `sourceRef`, `asOf`, `adjustment` |
| **Point-in-time `asOf` knowledge query** | `D114 / PIT` (non-prod until admitted) | Fail closed `404 found:false` | `dataVersion`, `lineageHash`, `resolvedAsOf`, `isinAuthority` |
| **Historical backtesting** | Future admitted `D114 / PIT` | Fail closed (refuse if unadmitted) | 4-timestamp temporal model + `dataVersion` + `lineageHash` |
| **Persisted report replay** | Embedded `NP-04` report snapshot | Fail closed `404`/`503` (never re-query live) | Full `HistoricalPriceEvidence` (§7 `D-4.7`) |

---

## 11. Failure and Fallback Behaviour

1. **No silent cross-source fallback:** A failure or empty series on `POST /api/dhan/historical` must never query or substitute `PointInTimeStore`; a `404` miss on `/api/pit/market-data` must never call Dhan (`frontend/src/api/pit.ts`).
2. **No silent candle blending:** Candles from Dhan `D02` and `D114/PIT` must never be concatenated into a single unlabelled array.
3. **Typed error preservation:** Preserve IPD/IRR fail-closed codes (`400` validation/range/interval, `401` transport auth, `429` rate limit, `502` `UNRESOLVED_INSTRUMENT`/`TRANSPORT_FAILURE`, `503` `NOT_CONFIGURED`, `504` `TIMEOUT`).
4. **Honest empty & missing-data UI:** `returnedCandleCount === 0` renders an explicit *"No candles returned for range"* state, never interpolated values.

---

## 12. Freshness Policy

1. **D02 Freshness Authority:** IPD owns `D02_OHLCV` freshness evaluation (`W-19`, threshold `86,400s` in `DEFAULT_FRESHNESS_CONFIG`); IRR never computes freshness independently.
2. **Remove Hardcoded `SNAPSHOT` on D02 (`dhanMarketDataRoutes.ts:485`):** `DhanHistoricalView.freshness` must mirror IPD's `D02_OHLCV` `FreshnessStatus` (`UNAVAILABLE` when `evidenceAvailable === false` or `verdict === 'UNKNOWN'`; `STALE` on concession; `SNAPSHOT` only when `verdict === 'GOOD'` and `W-19` cache is active).
3. **Never Display `LIVE` for Historical Series:** Even fresh `D02` maps at highest to `SNAPSHOT` (consistent with `D01` `mapIpdFreshnessToIrrFreshness`).
4. **Distinguish Freshness from Completeness:** A freshly retrieved `D02` response (`retrievalTimestamp` recent) may still have incomplete historical coverage (`coverageClaim: 'ACCESS_PENDING_UNVERIFIED'` or exchange holiday gaps). Both fields must be shown separately.

---

## 13. Corporate-Action Policy

1. **Default Tagging:** All `D02` candles remain tagged `isAdjusted: false` until `W-13`/`W-14` live evidence proves whether Dhan applies adjustments and how they are verified.
2. **Mandatory UI Disclosure:** Charting and historical tables render an explicit unadjusted-data notice when `isAdjusted === false`.
3. **Valuation Gate Preserved:** `iips-platform/src/investment/assessment/margin.ts` continues to refuse any unadjusted price across a per-share corporate action (`UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION`).
4. **Future Adjustment Requirement:** Any future use of `D02` for split-spanning return calculations or valuation requires an explicit corporate-action alignment layer carrying `{ factor, corporateActionId }` per `PriceRecord`.

---

## 14. Point-in-Time Temporal Semantics

- **Non-production today:** IRR's runtime `/api/pit/market-data` `PointInTimeStore` (`20` in-memory runtime fixture records) checks `resolvedAsOf <= requestedAsOf`, which is sufficient for existing API tests (`pitD114RuntimeIntegration.test.ts`); separately, IPD exposes `./d114-non-production` (three archived Bhavcopy fixtures) and a library-only durable append-only store (`src/pit/pit_durable_store.ts`, no HTTP route, no product admission).
- **Mandatory before production PIT / backtesting admission (`D-4.5`):** Separate `marketDate`, `publishedAt`, `ingestedAt` (`knownAsOf`), and `revisedAt` (`supersedesVersion`) so that:
  - Backfills (e.g., 2024 Bhavcopy ingested in 2026) never masquerade as 2024 `knownAsOf` knowledge without explicit simulation labelling (`publishedAt <= T`), and
  - Revisions create new immutable versions (`supersedesVersion`) rather than mutating historical query answers silently.

---

## 15. Identity Consistency Requirements

1. **Canonical Tuple:** `(companyId, exchangeSegment: 'NSE_EQ' | 'BSE_EQ', securityId: 'ISIN:<12-alnum>:<series>')` across both `D01` quotes and `D02` historical requests (`D-4.6`), closing the `H-5` asymmetry.
2. **No Fuzzy / Symbol Matching:** Preserve exact matcher discipline (`frontend/server/w28/coverageMeasurement.ts`, `DhanInstrumentRegistry.resolveExactIdentity`).
3. **Wrong-ID & Unresolved Protection:** Malformed identities reject at IRR `400`; unmapped/series-mismatched identities fail closed at IPD `502 UNRESOLVED_INSTRUMENT`.
4. **W-27 Live-Qualification Promotion Gate (`D4-DR-02` reconciled):** All `4,680` rows in IPD `84e988b0` (`evidence/dhan-w27/expansion-manifest.json`, `counts.proposedAdditions: 0`, `counts.alreadyQualified: 4680`) — including the `4,584` net additions above the earlier `96`-row sample — are **already statically qualified and registered** (`loadGovernedP7InstrumentRegistry`), **not** `PROPOSED` rows; however, they remain tagged `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED` (lacking live vendor qualification) until both the W-27 byte-reproducibility parity check and W-14 `E4` sample qualification succeed.

---

## 16. Persisted Report Reproducibility

- **`NP-06` (`frontend/server/reports-transport.ts`) & `IID` (`NP-04`):** Persist the complete `HistoricalPriceEvidence` snapshot (§7 `D-4.7`) inside the immutable report/assessment artifact at generation time.
- **Auditability Across Versions:** Reading version `v1` vs `v2` compares the two embedded evidence blocks (`source`, `marketTimestamp`, `retrievalTimestamp`, `dataVersion`/`lineageHash`, `adjustmentStatus`), explaining any price difference deterministically without relying on mutable external vendor state.

---

## 17. Product-Admission Requirements

1. **Phase 4 (`W-20` boundary + `D02` charting):** Requires (a) `D-4` owner approval, (b) IPD `W-12` historical builder audit/fix, (c) `W-13`/`W-14` / `W-17` `E4` live historical proof, (d) `W-19` D02 cache & freshness, (e) removal of IRR's hardcoded `SNAPSHOT` on `D02`, and (f) browser-bundle leak verification (`verify-browser-bundle.mjs`).
2. **Production PIT / Replay / Backtesting:** Remains **NOT ADMITTED** under `B2` / `CV-32` until a separate admission packet establishes durable storage, real Bhavcopy archive breadth, 4-timestamp temporal semantics, revision/correction handling, and range-PIT query contracts.

---

## 18. Dependency and Implementation-Readiness Matrix

| Work Item | Current Authoritative Status (Reconciled) | Evidence Reference | Outstanding Dependency | Relationship to D-4 | Blocking Scope |
|---|---|---|---|---|---|
| **W-06** | **Split:** Dhan `W-06` (auth) = **COMPLETE — OWNER ATTESTED** (`617fab0`); Snapshot-to-Live `W06` (PR #624) = **PARTIAL** (mechanism built, measurement `B02`-blocked, `W04` `1/64`) | Roadmap p.1; `W06-SNAPSHOT-TO-LIVE-QUOTE-FRESHNESS-COVERAGE-2026-11-23.md`; `DHAN-W14-RECONCILIATION-W06-2026-11-23.md` | `B02` Windows capture (Snapshot-to-Live `W06` only); zero-secret grep publication | Satisfies M1 auth prereq; Snapshot-to-Live `W06` does not block `W-14` or `D-4` | **Non-blocking** for `D-4` |
| **W-11** | **IRR evidence = PARTIAL** (config & leak gate verified `2026-11-17`, PR #572); **Brief reports COMPLETE** incl. Windows operational acceptance (unverified in IRR) | `DHAN-W11-IRR-EXECUTION-2026-11-15.md` (`2026-11-17`); Task brief §8 | Publish Windows connected-daemon 4-capability record to IRR if accepted | Shares transport config surface (`IIPS_MARKET_DATA_BASE_URL` / `TRANSPORT_URL`) | **Non-blocking** for `D-4` |
| **W-12** | **Quote serializer = PARTIALLY SATISFIED** (IPD PR #176 reported merged + Reliance 200; unverified in IRR pin `1ce6a829…`); **Quote DTO & Historical builder = OUTSTANDING** | `DHAN-W14-W12-SERIALIZATION-VERIFICATION-2026-11-23.md`; `DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md` | Advance IRR pin to PR #176 SHA; verify IPD **historical** request builder separately; `E4` DTO qualification | Historical builder check is mandatory before live `D02` (`W-20` execution) | **Blocks live `D02` execution** (not `D-4` decision) |
| **W-13** | **IRR `D-5` nullable `bid`/`ask` merged** (PR #605); **Live `E4` historical/quote DTO shape = OUTSTANDING** | PR #605 (`dhanMarketDataRoutes.ts`); `DHAN-W14` §3.4 | Live `E4` verification of quote depth & historical `OHLCV` fields/adjustments | Informs `D-4.3` / `D-4.4` verification | **Blocks `M2`/`M3` qualification** (not `D-4` decision) |
| **W-14** | **OPEN — Investigation & Reconciliation published** (PR #626 `6f3e9a2`, `413d1b4`, `71e562e`); ready for `97`-call `E4` once pin advances & authorized | `DHAN-W14-INVESTIGATION-2026-11-23.md`; `DHAN-W14-RECONCILIATION-W06-2026-11-23.md` | Pin advance to PR #176 SHA (`B-W14-1`) + owner `97`-call `E4` authorization (`B-W14-2`/`B-W14-3`); separate `D02` budget | Proves live P7 mappings used by `D01` and `D02` | **Blocks `M2` / `W-20` live verification** (not `D-4` decision) |
| **W-15** | **COMPLETE** in IRR (identity picker wired into `DhanQuotes.tsx`, merged PR #624) | PR #624 (`DhanQuotes.tsx`, `DhanMarketData.test.tsx`, `dhanIdentityJoined.test.tsx`) | None (quote picker complete; historical identity picker is `W-21`/`D-4.6`) | Precedent for `D-4.6` exact-identity UX | **Non-blocking** |
| **W-19** | **OPEN / NOT IMPLEMENTED** (`D02` cache unwired in IPD; `D02_OHLCV` returns `NOT_AVAILABLE`/`UNKNOWN`) | `DHAN-W11-CAPABILITY-GAPS-IPD-HANDOFF-2026-11-16.md` Gap 2; `dhanFreshnessRoutes.ts` | IPD cache wiring (`DhanHistoricalCache`) + `W-17` historical wire check | Required by `D-4.3` before `D02` can report fresh/stale | **Blocks `W-20` / `M4` closure** (not `D-4` decision) |
| **W-20** | **OPEN / NOT STARTED** (zero precedence/routing logic in IPD or IRR) | `DHAN-LIVE-ROADMAP-2026-11-11.md` §5/§8; `dhanMarketDataRoutes.ts`; `pit-transport.ts` | **D-4 approval**, `W-12` historical check, `W-14`/`W-17` `E4`, `W-19` | **Direct child of D-4** | **Blocked by `D-4`** |
| **W-21** | **PARTIAL** (`DhanHistorical.tsx` diagnostic surface exists; product charting affordances pending) | `DhanHistorical.tsx`; Roadmap §5 Phase 4 | `W-11`, `W-18` (range/chunking), `W-19`, `W-20` (`D-4` disclosures) | Consumes `D-4.1`–`D-4.4` rules | **Blocks product charting** |
| **W-27** | **4,680 statically `QUALIFIED` & registered (`proposedAdditions: 0` in IPD `84e988b0`); `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED`** | `DHAN-W28-MEASUREMENT-2026-11-23.md` §2; `evidence/w28-coverage-summary.json`; IPD `expansion-manifest.json` (`84e988b0`) | Byte-reproducibility rerun proof; `W-14` `E4` live qualification before relying on the `4,584` expansion rows as live-qualified | Supplies statically qualified identity universe for `D-4.6` | **Blocks live-qualified broad coverage**, not `D-4` |
| **W-28** | **IRR infrastructure COMPLETE (`21/21` synthetic); Windows host capture OUTSTANDING** | PR #626 (`coverageMeasurement.ts`, `DHAN-W28-MEASUREMENT-2026-11-23.md`) | Authorized Windows `w28:measure` run against owner holdings | Orthogonal to `D-4`; informs owner-relevant `W-14` subset | **Non-blocking** for `D-4` |
| **W-29** | **IRR synthetic implementation COMPLETE** (PR #625, `22a68a4`); **Live acceptance (`M2`) SEPARATE** | `DHAN-W29-SHARED-QUOTE-CONSUMPTION-BOUNDARY-2026-11-23.md`; `quoteConsumptionBoundary.ts` | `M2` live quote qualification (`W-12`/`W-14`) for live acceptance | Explicitly excludes `D02`; sets boundary pattern for `W-20`/`W-39` | **Non-blocking** for `D-4` |
| **W-36** | **Reported COMPLETE** in brief; **Unverified in IRR** (`windows-setup/` at IPD `a624d06` lacked daemon; IPD `403` here) | Roadmap §7.1 / C-1; Task brief §8 | Publish IPD launcher verification record to IRR if complete | Operational daemon startup support | **Non-blocking** for `D-4` |
| **W-37** | **DEFERRED / NOT STARTED** (runbook lacks Dhan quotes/historical/freshness/daemon ops) | `docs/OPERATOR_RUNBOOK.md`; Roadmap §5 Phase 8 | `W-09`, `W-11`, `W-36`, plus `W-19`/`W-20` operational rules | Documents `D-4` failure/freshness ops later | **Post-W-20** (deferred) |
| **W-39** | **NOT STARTED** | `DHAN-W29-SHARED-QUOTE-CONSUMPTION-BOUNDARY-2026-11-23.md` §3, §8 | `W-29` (complete), `W-19` (`D02` freshness), **`W-20` (`D-4`)** | **Directly blocked by `D-4` & `W-20`** | **Blocked by `D-4` + `W-20` + `W-19`** |

---

## 19. Risks and Unresolved Questions

1. **IPD visibility gap (`403`/`404`):** Direct verification of IPD `main` (PR #176, PR #189, `dhan_historical_dto.ts`, and `qualification-manifest.json` overlap count) could not be performed from this sandbox.
2. **Historical request-builder `DH-905` status:** Unknown whether IPD's historical builder (`POST /v2/charts/historical`) suffers from the same string-vs-number `securityId` serialization defect fixed for quotes in PR #176.
3. **Hardcoded `freshness: 'SNAPSHOT'` on `D02` in IRR (`dhanMarketDataRoutes.ts:485`):** Actively contradicts `D02_OHLCV` `NOT_AVAILABLE`/`UNKNOWN` until remediated in `W-20`.
4. **Dhan live historical semantics (`E4`):** Adjustment behavior, epoch timezone (IST midnight vs UTC), missing holiday bars, and actual intraday lookback limits are all unverified (`PROVISIONAL`).
5. **Corporate-action risk on multi-year charts:** Unadjusted `D02` bars (`isAdjusted: false`) will show artificial step drops across splits/bonuses unless clearly disclosed or later adjusted.
6. **B2 / CV-32 non-production limit:** Attempting to route live product screens to IRR's `/api/pit/market-data` today would violate active governance (`PKG-05-PIT-CV32-DISPOSITION-PACKET.md`) and expose IRR's 20-record in-memory runtime fixture store (distinct from IPD's three archived Bhavcopy fixtures and library-only `pit_durable_store.ts`, which has no HTTP route).

---

## 20. Explicit Owner Decisions Requested

To close **D-4** and authorise planning for **W-20**, the application owner (jointly for IPD + IRR) is requested to approve or amend the following seven proposed decisions:

1. **Approve `D-4.1` (Option C — Separate Source Authority):** Adopt Dhan `D02` for charting/intraday/date-range inspection; retain `IID R-6` (`PIT_D01 → DATASET_EOD → withhold`) for valuation/Margin of Safety; reserve `D114/PIT` for point-in-time replay and future backtesting; and embed immutable observations in `NP-04` for persisted reports.
2. **Approve `D-4.2` (Fail-Closed, Zero Silent Fallback / Zero Blending):** Prohibit silent substitution or merging between `D02` and `D114/PIT`; require typed failures and explicit source/completeness labelling.
3. **Approve `D-4.3` (Truthful D02 Freshness):** Direct `W-20` to remove the hardcoded `SNAPSHOT` status on `D02` in `dhanMarketDataRoutes.ts` and report `D02_OHLCV` freshness strictly from IPD (`W-19`), requiring `marketTimestamp`, `providerResponseTimestamp`, `retrievalTimestamp`, and `cacheTimestamp`.
4. **Approve `D-4.4` (Corporate-Action Disclosure & Valuation Gate):** Keep `D02` labelled `isAdjusted: false` with mandatory UI disclosure until verified, and preserve `margin.ts`'s hard refusal on unadjusted corporate actions.
5. **Approve `D-4.5` (Retain B2 / CV-32 Non-Production Gate for PIT):** Confirm `D114/PIT` stays non-production during `W-20`, with durable storage, Bhavcopy ingestion, 4-timestamp temporal semantics, and separate admission required before product replay or backtesting.
6. **Approve `D-4.6` (D01/D02 Exact-Identity Symmetry):** Standardise `D02` requests on exact canonical identity (`companyId` + `ISIN:<isin>:<series>` + `exchangeSegment`) and withhold live-qualified promotion of the `4,584` statically qualified W-27 expansion rows (`4,680` total statically registered in IPD `84e988b0`, `proposedAdditions: 0`, `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED`) until parity + `W-14` `E4` live qualification complete.
7. **Approve `D-4.7` (Embedded Artifact Reproducibility):** Mandate immutable `HistoricalPriceEvidence` embedding inside `NP-04` for `NP-06` reports and `IID` assessments.

*(Note: Approving `D-4` unblocks **`W-20` design and implementation sequencing**; it does **not** by itself grant live Dhan `E4` execution budget, which remains a separate bounded operational authorization for `W-14` and `W-17`.)*
