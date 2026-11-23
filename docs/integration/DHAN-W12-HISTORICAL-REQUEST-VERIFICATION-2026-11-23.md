# DHAN W-12 — Historical Request-Builder Verification Record (2026-11-23)

**Scope:** Independent code and contract verification of IPD's D02 historical request builder (`ramkivs/iips-production-market-data`) following PR #176 (`2685562522f1a2fd1d745a7857f771bf21453315`) and up through IPD `main` HEAD (`84e988b092058df8075ffa52f5dfb0f4fef07eaf`).  
**Companion Records:**  
- [`docs/integration/DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md`](DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md) (quote `DH-905` HTTP 400 root cause)  
- [`docs/integration/DHAN-D4-OWNER-ACCEPTANCE-2026-11-23.md`](DHAN-D4-OWNER-ACCEPTANCE-2026-11-23.md) (`D-4.6` gate requiring W-12 historical verification)  
- IPD primary files inspected directly in public clone of `ramkivs/iips-production-market-data`:
  - `src/providers/dhan/dhan_historical_dto.ts`
  - `src/providers/dhan/dhan_historical_adapter.ts`
  - `src/providers/dhan/dhan_api_client.ts`
  - `src/providers/dhan/dhan_market_data_service.ts`
  - `tests/dhan_d3c_historical.test.ts`
  - `tests/dhan_daily_request_boundary.test.ts`
  - `docs/integration/dhan-api-v2-assessment-2026-11-13/` (`02-DHAN-API-CAPABILITY-MATRIX.md`, `03-EXISTING-IPD-IMPLEMENTATION-MAPPING.md`, `05-DOCUMENTATION-DISCREPANCY-AND-AMBIGUITY-REGISTER.md`, `09-IMPLEMENTATION-GAP-REGISTER.md`)

---

## 1. Executive Verdict

| Dimension | Verification Verdict |
|---|---|
| **W-12 Quote Serializer (`POST /marketfeed/quote`)** | **VERIFIED FIXED IN IPD PR #176 (`2685562522f1a2fd1d745a7857f771bf21453315`)** — `DhanApiClient.buildQuoteRequestBody` serializes `dhanSecurityId` as a JSON safe positive integer (`{"NSE_EQ":[2885]}`). One operator-reported Reliance quote returned HTTP 200 on `26855625`. |
| **W-12 Historical Request Builder (`POST /charts/historical`)** | **VERIFIED UNCHANGED BY PR #176; LIVE VENDOR CONTRACT UNPROVEN (`BLOCKED_ON_E4_SCHEMA_QUALIFICATION`)** — `buildDhanHistoricalRequestBody` still serializes `securityId` as a JSON **string** (`"2885"`), hardcodes `instrument: 'EQUITY'`, routes all intervals (`1m`, `5m`, `15m`, `1h`, `1D`) to `/charts/historical` (never `/charts/intraday`), and has **zero** live Dhan historical calls executed to date (`E4` pending). |
| **PR #176 vs IPD `main` HEAD (`84e988b0`) Delta** | **MATERIAL DAILY-END CHANGE BETWEEN `26855625` AND `84e988b0`:** Commit `9d5ffa4` (*"fix: align daily Dhan end boundary and simplify D-3 disposition"*) modified `buildDhanHistoricalRequestBody` so `1D` requests advance `toDate` by `+1` UTC calendar day (`2026-09-23` → `2026-09-24`) to match Dhan's documented exclusive upper bound; at IRR's new pin (`26855625`), `toDate` is still passed verbatim (unadjusted). |

---

## 2. Evidence Classification Key

- **[VERIFIED CODE FACT]** — Directly observed in IPD source/tests/git history at commits `26855625` and `84e988b0`.
- **[EXISTING GOVERNANCE]** — Recorded in IPD's `dhan-api-v2-assessment-2026-11-13` or IRR's accepted governance docs.
- **[REPORTED EVIDENCE]** — Operator-reported live results recorded in IPD documentation (not independently re-executed).
- **[ASSUMPTION / UNVERIFIED CONTRACT]** — Vendor behavior assumed in pre-access DTOs (`PROVISIONAL`) and not yet proven by live Dhan execution.

---

## 3. Field-by-Field Inspection of `buildDhanHistoricalRequestBody`

### 3.1 Exact Implementation at PR #176 (`26855625`) vs IPD `main` HEAD (`84e988b0`)

**[VERIFIED CODE FACT]** In `src/providers/dhan/dhan_historical_dto.ts`:

At **PR #176 (`2685562522f1a2fd1d745a7857f771bf21453315`)** (which IRR adopts in its companion pin advance):
```ts
export function buildDhanHistoricalRequestBody(params: {
  dhanSecurityId: string;
  exchangeSegment: string;
  interval: DhanHistoricalInterval;
  fromDate: string;
  toDate: string;
}): string {
  // PROVISIONAL vendor request shape; no credential material is ever included.
  return JSON.stringify({
    securityId: params.dhanSecurityId,
    exchangeSegment: params.exchangeSegment,
    instrument: 'EQUITY',
    interval: params.interval,
    fromDate: params.fromDate,
    toDate: params.toDate,
  });
}
```

At **IPD `main` HEAD (`84e988b092058df8075ffa52f5dfb0f4fef07eaf`)** (after commit `9d5ffa4`):
```ts
export function buildDhanHistoricalRequestBody(params: {
  dhanSecurityId: string;
  exchangeSegment: string;
  interval: DhanHistoricalInterval;
  fromDate: string;
  toDate: string;
}): string {
  // PROVISIONAL vendor request shape; no credential material is ever included.
  return JSON.stringify({
    securityId: params.dhanSecurityId,
    exchangeSegment: params.exchangeSegment,
    instrument: 'EQUITY',
    interval: params.interval,
    fromDate: params.fromDate,
    toDate: params.interval === '1D'
      ? new Date(Date.parse(`${params.toDate}T00:00:00.000Z`) + 86_400_000).toISOString().split('T')[0]
      : params.toDate,
  });
}
```

### 3.2 Attribute-by-Attribute Verification

| Attribute | Verified Behavior in IPD (`dhan_historical_dto.ts` / `dhan_historical_adapter.ts`) | Comparison to Quote Fix (PR #176) & Dhan v2 Contract Status | Classification & Risk |
|---|---|---|---|
| **Endpoint Path** | `DHAN_HISTORICAL_PATH = '/charts/historical'` (resolved against `baseUrl` `https://api.dhan.co/v2`). Every interval in `['1m','5m','15m','1h','1D']` posts to `/charts/historical`. `/charts/intraday` is **never called**. | Dhan P2 documentation lists **two** endpoints: `/charts/historical` (daily) and `/charts/intraday` (minute). IPD's own `02-DHAN-API-CAPABILITY-MATRIX.md` & `09-IMPLEMENTATION-GAP-REGISTER.md` mark `/charts/intraday` as `MISSING` (Gap `G-12`). | **[VERIFIED CODE FACT]** / **[EXISTING GOVERNANCE]** (`G-12`): Intraday intervals routed to `/charts/historical` are unverified and likely incompatible with Dhan's endpoint split. |
| **`securityId` Representation** | Passed directly as `params.dhanSecurityId` (a **JSON string**, e.g. `"2885"` or `"SYNTH-NSE-EQ-1001"` in tests). No integer validation or numeric conversion is applied. | PR #176 (`buildQuoteRequestBody`) converted quote IDs to safe positive JSON **integers** (`{"NSE_EQ":[2885]}`) after strings triggered vendor HTTP 400 (`DH-905` / error `813`). Historical `buildDhanHistoricalRequestBody` was **not** modified by PR #176. | **[VERIFIED CODE FACT]** + **[ASSUMPTION / UNVERIFIED CONTRACT]**: Dhan v2 `/charts/historical` request schema is not published in IPD's 9-document PDF set (`G-08` / `G-14`); whether `/charts/historical` requires a string (`"2885"`) or rejects strings with HTTP 400 (`DH-905`) has **not been tested live**. |
| **`exchangeSegment`** | Resolved from `DhanInstrumentRegistry` (`'NSE_EQ'` or `'BSE_EQ'`) and serialized verbatim as a string (`exchangeSegment: params.exchangeSegment`). | Matches IPD's `NSE_EQ`/`BSE_EQ` P7 scope (`dhan_dto.ts`). Segment string values are consistent with Dhan P9/quote usage. | **[VERIFIED CODE FACT]** |
| **`instrument`** | Hardcoded string literal `'EQUITY'`. | Sufficient only for `NSE_EQ`/`BSE_EQ` equities (matches current P7 scope, Gap `G-18`); non-equity segments are out of scope. | **[VERIFIED CODE FACT]** |
| **`interval` Mapping** | Accepts `DhanHistoricalInterval = '1m' | '5m' | '15m' | '1h' | '1D'` and sends `interval` **untranslated** on the wire (`'1D'`, `'1h'`, etc.). Canonical normalizer maps `'1D'` → `'1d'` (`dhanIntervalToCanonical`); `'1w'` and `'1M'` from D02 are unsupported. | IPD's `05-DOCUMENTATION-DISCREPANCY-AND-AMBIGUITY-REGISTER.md` (D-26, p. 370–380) and `03-EXISTING-IPD-IMPLEMENTATION-MAPPING.md` explicitly warn that `'1m'|'5m'|'15m'|'1h'|'1D'` is **IPD's own provisional vocabulary**, not vendor-verified (`'1h'` does not appear in Dhan's P1 technical-analysis enum `1, 5, 15, D`, and P2 omits candle enums). | **[VERIFIED CODE FACT]** / **[EXISTING GOVERNANCE]** (`G-08`): High probability of vendor rejection if `/charts/historical` expects e.g. `'D'`/`'1'` or omits `interval` for daily candles. |
| **Date-Range Parameters (`fromDate`, `toDate`)** | `validateDhanHistoricalRequest` requires `YYYY-MM-DD`, `fromMs <= toMs`, and `spanDays <= 1825` (`365 * 5`). At **`26855625`**: both `fromDate` and `toDate` pass through unchanged. At **`84e988b0`** (`9d5ffa4`): `'1D'` advances `toDate` by `+1` UTC day (exclusive upper bound), while intraday intervals leave `toDate` unchanged. | **Secondary validation observation (verified via Node V8 check):** `validateDhanHistoricalRequest` checks `ISO_DATE` regex and `Number.isNaN(Date.parse(...))` without verifying calendar round-trip; in V8, `Date.parse('2026-02-30T00:00:00.000Z')` rolls over to `2026-03-02`. Test `D3C-03` rejected `'2026-02-30'..'2026-03-01'` only because `2026-03-02 > 2026-03-01`, whereas `'2026-02-30'..'2026-03-05'` would pass validation! | **[VERIFIED CODE FACT]**: Date-range validation bug on impossible dates where `rolledMs <= toMs`; `1D` exclusive-end shift exists on IPD `main` (`84e988b0`) but **not** in IRR's `26855625` pin. |
| **Additional / Optional Vendor Fields (e.g. `expiryCode`, `oi`)** | Not emitted by `buildDhanHistoricalRequestBody`. Request body contains strictly the 6 keys: `securityId`, `exchangeSegment`, `instrument`, `interval`, `fromDate`, `toDate`. | IPD's `02-DHAN-API-CAPABILITY-MATRIX.md` §3.3 notes Dhan P2 documents no request parameters, response schema, or timezone statement (`G-08`, `G-14`). Whether Dhan `/charts/historical` requires `expiryCode: 0` or rejects/ignores extra fields is unknown pre-access. | **[ASSUMPTION / UNVERIFIED CONTRACT]** |
| **Response DTO & Error Handling** | `parseDhanHistoricalResponse` expects columnar finite `number[]` arrays (`open`, `high`, `low`, `close`, `volume`, `timestamp`), rejecting ragged/missing series (`D3C-06`/`D3C-07`) while treating uniformly empty arrays as valid `0` candles. `normalizeDhanHistoricalToCandles` treats `timestamp` as **epoch seconds at candle start**, rejects duplicates/out-of-order, sets `isAdjusted: false`, and sets `coverageClaim: 'ACCESS_PENDING_UNVERIFIED'`. `DhanApiClient.executeJsonPost` maps any vendor HTTP 400 to `HTTP_ERROR` without retaining vendor error text (`D-7` disclosure policy). | Matches IPD `09-IMPLEMENTATION-GAP-REGISTER.md` Gap `G-06` (vendor error codes like `DH-905` are not parsed) and `G-08` (timestamp start-vs-end convention and `isAdjusted` policy ungrounded). | **[VERIFIED CODE FACT]** |
| **Shared Limiter Impact** | `DhanMarketDataService.getHistorical` acquires the **same** `60/min` token bucket (`this.limiter.tryAcquire()`) as `getQuote` (`dhan_market_data_service.ts:852`). | Flagged in IPD Gap `G-07`: historical backfill consumes quote budget and does not enforce endpoint-family separation. | **[VERIFIED CODE FACT]** / **[EXISTING GOVERNANCE]** (`G-07`) |

---

## 4. Relationship to `DH-905` HTTP 400 Root Cause

1. **[VERIFIED CODE FACT] Quote endpoint (`POST /marketfeed/quote`):**
   - Pre-#176 (`1ce6a829` and `bfd83216`) sent `{"NSE_EQ":["2885"]}` (string inside segment-keyed array).
   - Independent Python execution and IPD's `DHAN-QUOTE-NUMERIC-SERIALIZATION-COMPLETION-RECORD-2026-11-18.md` established that Dhan's `/marketfeed/quote` returned HTTP 400 for string IDs and HTTP 200 for numeric IDs (`{"NSE_EQ":[2885]}`).
   - **[REPORTED EVIDENCE]** On `26855625` (PR #176), one operator-executed live Reliance quote returned HTTP 200 (`DHAN-LIVE-RELIANCE-QUOTE-OPERATOR-ACCEPTANCE-2026-11-18.md`).
2. **[VERIFIED CODE FACT] Historical endpoint (`POST /charts/historical`):**
   - `buildDhanHistoricalRequestBody` was **not touched** by PR #176 and still emits `securityId` as a JSON **string** (`"2885"`).
   - Crucially, **no live historical request has ever been issued in IPD**. Therefore, it is **NOT verified** whether Dhan's `/v2/charts/historical` accepts `securityId: "2885"`, requires numeric `securityId: 2885`, requires `expiryCode`, or rejects IPD's provisional `interval` (`"1D"` / `"1h"`) with HTTP 400 (`DH-905`).
   - **Important warning:** Because `DhanApiClient.executeJsonPost` suppresses vendor error bodies (`D-7` policy, exposing only `vendorHttpStatus: 400` and `HTTP_ERROR`), a historical `DH-905` 400 error on `/charts/historical` would surface as an opaque `HTTP_ERROR` (`vendorHttpStatus: 400`) unless explicitly diagnosed during bounded `E4` historical qualification.

---

## 5. Existing IPD Test Coverage & CI Verification

All historical behavior in IPD is tested **offline with synthetic payloads only**:

- `tests/dhan_d3c_historical.test.ts` (`D3C-01`–`D3C-11`, 11 test cases):
  - Explicitly asserts `securityId` is a string (`'SYNTH-NSE-EQ-1001'` in `D3C-11`, `'SYNTH-NSE-EQ-1002'` in `D3C-08`).
  - Covers request validation, `1m..1D` canonical interval mapping, OHLC validation, duplicate/out-of-order rejection, empty vs ragged responses, `D02` vs `D01` distinction, and credential non-disclosure.
- `tests/dhan_daily_request_boundary.test.ts` (present on IPD `main` `84e988b0` via `9d5ffa4`; **not** present at IRR's `26855625` pin):
  - Verifies `1D` `toDate` inclusive-to-exclusive `+1` UTC day shift and non-mutation of intraday `toDate`.
- **IPD GitHub Actions Check Runs (verified via GitHub API):**
  - Commit `2685562522f1a2fd1d745a7857f771bf21453315` (PR #176): `executed test count` = `success`, `typecheck · build · test` = `success` (1,905 executed, 1,901 passed, 4 platform-conditional skipped per IPD completion record).
  - Commit `84e988b092058df8075ffa52f5dfb0f4fef07eaf` (IPD `main` HEAD): `executed test count` = `success`, `typecheck · build · test` = `success`.

---

## 6. Required Preconditions Before Live `D02` Historical Execution or `W-20`

Per accepted Decision **`D-4.6` & `D-4.7`**, before `W-20` or any production/batch `D02` usage:
1. **Bounded Single-Request `E4` Historical Qualification Probe (separate operator authorization):** Issue one controlled `1D` `/v2/charts/historical` probe for `EQ_RELIANCE_IN` (`dhanSecurityId: "2885"`, `NSE_EQ`) from IPD to settle:
   - Whether `/v2/charts/historical` accepts string `securityId: "2885"` or requires numeric `2885` (or additional fields);
   - Exact vendor `interval` spelling (`'1D'` vs `'D'`);
   - Whether `toDate` is exclusive on Dhan's live response (requiring IPD `main` `9d5ffa4` / `84e988b0+` rather than `26855625`);
   - Actual response DTO shape, timestamp convention (candle start vs end), and adjustment semantics (`isAdjusted`).
2. **Resolve Gap `G-12` (`/charts/intraday`) & `1h` Provisional Interval:** Either route intraday intervals to `/charts/intraday` with verified Dhan interval tokens or restrict `DHAN_SUPPORTED_HISTORICAL_INTERVALS` to verified daily `'1D'` before exposing historical endpoints to IRR.
3. **Fix impossible-date rollover in `validateDhanHistoricalRequest`:** Verify `YYYY-MM-DD` round-trips through `new Date(fromMs).toISOString().slice(0, 10) === request.fromDate` so impossible dates like `2026-02-30` fail closed even when `toDate >= 2026-03-02`.
4. **Advance IRR Pin Beyond `26855625` for `D02` Consumers:** IRR's pin advance to `26855625` unblocks **quotes (`W-14`)** only; `D02` work (`W-19` / `W-20`) will require advancing IRR's IPD pin at least past `9d5ffa4` / `84e988b0` (once historical `E4` qualification completes).
