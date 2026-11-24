# Joint Governance Proposal: IIPS–EquiCore Historical Serving & Source Admission (`IIPS-EQUICORE-SERVING-AUTHORIZATION-PROPOSAL`)

- **Document ID:** `IIPS-EQUICORE-SERVING-AUTHORIZATION-PROPOSAL-2026-11-23`
- **Date:** 2026-11-23 (UTC)
- **Decision Status:** **PROPOSED — AWAITING EQUICORE OWNER & IIPS PROGRAM AUTHORITY APPROVALS**
- **Governing Technical Input:** [`docs/integration/IIPS-EQUICORE-REQUEST-RESPONSE-ARCHITECTURE-ASSESSMENT-2026-11-23.md`](IIPS-EQUICORE-REQUEST-RESPONSE-ARCHITECTURE-ASSESSMENT-2026-11-23.md) (Revision `1.1`)
- **Related Records:** EquiCore `D14` (`I5`), `D16`, `D21`, `D23`; IRR `D-4` (`DHAN-D4-OWNER-ACCEPTANCE-2026-11-23.md`), `D-4.5` (`DHAN-D4-5-PIT-ADMISSION-ASSESSMENT-2026-11-23.md`), `D-4.6` (PR #641), `W-29` (PR #625).
- **Non-Authorization Notice:** This proposal authorizes **no code, endpoint, index build, pin change, or runtime gate change**. Implementation may begin only after the designated authorities record explicit approval for their respective decisions below.

---

## 1. Purpose & Decision Scope

Establish the formal cross-repository authorization required for:
1. **EquiCore (`ramkivs/equity-market-data-engine`)** to serve historical NSE daily market data to IIPS over an authenticated local loopback machine interface (`iips-equicore-historical/v1`) backed by a rebuildable Class-(4) ISIN/series/date index; and
2. **IIPS / IRR (`ramkivs/iips-review-recovered`)** to consume `EQUICORE_NSE_EOD` as an approved historical source alongside Dhan `D02` under Option C (`D-4.1`–`D-4.4`, `D-4.6`), and to implement `D-4.7` `NP-04` `HistoricalPriceEvidence` embedding.

---

## 2. Decisions Requested from EquiCore Owner (Ramki, Personal Application Principal)

*Authority basis: EquiCore `D16-13`, `D23 §17/§19`, `D16-07` (4 durable state classes), `D16-09` (read-only serving invariants).*

| Decision ID | Decision Requested | Proposed Binding Bounds |
|---|---|---|
| **`EC-DEC-01`** | **Extend `D23` to authorize a headless, local loopback HTTP serving API (`serving.iips_serve`, `iips-equicore-historical/v1`)** | • Runs as a separate headless read-only Python 3 stdlib `ThreadingHTTPServer` entrypoint on `127.0.0.1:8614` (distinct from `src/ui/serve.py:8613`; `--bind 0.0.0.0` prohibited).<br>• Exposes only `GET /v1/health`, `POST /v1/historical/bars`, `POST /v1/historical/eod-observation`, `GET /v1/instruments/:isin/associations`, and `GET /v1/calendar`.<br>• Enforces mandatory `Authorization: Bearer <token>`, loopback `Host` header check, zero CORS headers, `Cache-Control: no-store`, and SHA-256 `responseDigest`. |
| **`EC-DEC-02`** | **Authorize the rebuildable Class-(4) `(isin_normalized, series, business_date)` index** | • Strictly `D16-07` Class-(4) derived state stored outside the M2 package (`--state` root; deleting it is never a data event and rebuild reproduces identical bytes).<br>• Indexes **only** rows with `isin_validity === 'VALID'` per `D05 §6.1` (`BLANK` and invalid-ISIN rows never form cross-symbol correlation links).<br>• Preserves `D05/1.0` verbatim `Decimal` values, `D05 §8` row provenance, and `nse_engine` (`d3269b73...`) immutability. |
| **`EC-DEC-03`** | **Lock initial serving scope to the qualified M2 baseline, `NSE_EQ`, daily EOD (`1D`), `RAW_UNADJUSTED`** | • Initial dataset is strictly the `I5`-qualified M2 baseline (`i4-20261008-M2`, `2,462` NSE archives, `2016-09-20`..`2026-09-18`).<br>• Rejects `BSE_EQ` (`422 UNSUPPORTED_EXCHANGE`), intraday `1m..1h` (`422 UNSUPPORTED_FREQUENCY`), and adjusted modes (`422 ADJUSTMENT_UNAVAILABLE`).<br>• Exposes `POST /v1/historical/eod-observation` strictly as `PINNED_GENERATION_EOD_SNAPSHOT` (`bitemporalKnowledgeAsOf: false`), not bitemporal `knownAsOf` PIT. |
| **`EC-DEC-04`** | **Confirm exclusions & `B5` boundary** | • Raw archive bytes stay excluded (`D16-08` Class 5).<br>• Post-M2 `B5` composite generations (`catalog-composite`) remain **out of initial serving scope** until `B5`/`B6` close; when later enabled, `D21` `CHANGED-CONFLICT-UNRESOLVED` quarantine (`D21 §18`) remains fail-closed (`409 D21_CONFLICT_HELD`). |

---

## 3. Decisions Requested from IIPS Program Authority

*Authority basis: IRR `D-4` (`DHAN-D4-OWNER-ACCEPTANCE-2026-11-23.md`), `REG-02` (`P4`), Gate `B2`, `W-29`, `NP-06` (`D3`).*

| Decision ID | Decision Requested | Proposed Binding Bounds |
|---|---|---|
| **`PA-DEC-01`** | **Admit `EQUICORE_NSE_EOD` as an approved historical source alongside Dhan `D02`** | • Under Option C (`D-4.1`), `EQUICORE_NSE_EOD` is admitted for daily (`1D`), `NSE_EQ`, `RAW_UNADJUSTED` historical bars, symbol-continuity intervals, and NSE calendar completeness.<br>• Dhan `D02` remains the sole source for intraday (`1m..1h`) and `BSE_EQ` historical queries (`W-12`/`W-14`/`W-19` unchanged). |
| **`PA-DEC-02`** | **Preserve `D-4.2` non-fallback and non-blending invariants** | • Consumers declare source explicitly (`EQUICORE_NSE_EOD` vs `DHAN_D02`); IRR never silently falls back from EquiCore to Dhan `D02` (or vice versa) on error, timeout, or empty series, and never concatenates bars across sources.<br>• `D-4.4` unadjusted disclosure (`isAdjusted: false`) is mandatory on all UI/analytics surfaces consuming `EQUICORE_NSE_EOD`. |
| **`PA-DEC-03`** | **Establish the IRR server-side integration and security boundary** | • Authorize `equicoreTransportConfig.ts`, `equicoreTransport.ts`, and `historicalConsumptionBoundary.ts` strictly under `frontend/server/` (mirroring `marketDataTransportConfig.ts` + `dhanMarketDataTransport.ts` + `quoteConsumptionBoundary.ts`).<br>• Require `IIPS_EQUICORE_BASE_URL` (loopback `http://` only) + **mandatory** `IIPS_EQUICORE_TRANSPORT_TOKEN`; update `verify-browser-bundle.mjs` to block all EquiCore transport imports, URLs, and env tokens from `frontend/src/**`.<br>• IRR resolves `companyId` → `(ISIN:<12-alnum>:<series>, exchangeSegment)` (`D-4.6`) before calling EquiCore; EquiCore never resolves `companyId`. |
| **`PA-DEC-04`** | **Approve `D-4.7` `NP-04` `HistoricalPriceEvidence` contract and embedding work** | • Authorize adding the normative `HistoricalPriceEvidence` v1 block (`observations`, `observationDigest`, `sourceIdentity`, `adjustment`, `baselineManifestSha256`/`compositeGeneration` `provenance`, `temporal`/`completeness`, and `responseDigest`) to `NP-04` `ReportContent.canonicalPayload` (`frontend/server/reports/artifact.ts`) and `W16` `provenanceEnvelope.ts` version-diff comparisons.<br>• Guarantee offline historical report reads (`GET /api/reports/artifacts/:reportId`) never call EquiCore or Dhan. |
| **`PA-DEC-05`** | **Preserve existing `B2` / `P4` / `CV-32` (`D-4.5`) and `IID R-6` boundaries unchanged** | • Gate `B2` (`AD-02`), `P4` (`REG-02`), and `CV-32` (`API-ONLY`) on IRR `/api/pit/market-data` remain **unchanged**.<br>• `IID R-6` (`iips-platform/src/investment/assessment/margin.ts`) continues to enforce `PIT_D01 | DATASET_EOD` and hard refusal across unadjusted corporate actions (`UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION`); any future `IID` consumption of `EQUICORE_NSE_EOD` requires a separate corporate-action factor source + `R-6` amendment. |

---

## 4. Responsibility & Repository Ownership Matrix

| Responsibility | EquiCore (`ramkivs/equity-market-data-engine`) | IIPS / IRR (`ramkivs/iips-review-recovered`) | IPD (`ramkivs/iips-production-market-data`) |
|---|---|---|---|
| **NSE corpus (`M2`), `D05/1.0` parsing, `Q5`/`Q6` W2 outputs** | **Owner** (`nse_engine`, Windows custody) | Consumer only | None |
| **Class-(4) `(isin_normalized, series, business_date)` index & `/v1/*` API (`127.0.0.1:8614`)** | **Owner** (authorized by `EC-DEC-01`..`04`) | Consumer only | None |
| **Mandatory bearer validation, loopback `Host` guard, canonical JSON + `responseDigest`** | **Owner** (server enforcement) | Verifies `responseDigest` & contract on receipt | Own independent `dhan-server` (`127.0.0.1:8791`) |
| **`companyId` → canonical `(ISIN, series, exchangeSegment)` resolution (`D-4.6`)** | Never sees `companyId` authority | **Owner** (`companyDirectory`, `dhanIdentityTransport`, `dhanCanonicalIdentity`) | Owns Dhan P7 registry (`4,680` NSE+BSE rows) |
| **Source selection (`EQUICORE_NSE_EOD` vs `DHAN_D02`), `D-4.2` non-blending, `D-4.4` disclosures** | Declares `isAdjusted: false` & `completeness` | **Owner** (`historicalConsumptionBoundary.ts` + UI) | Owns Dhan `D02` (`W-19`) |
| **`D-4.7` `NP-04` `HistoricalPriceEvidence` schema, embedding & `W16` diff** | Supplies `responseDigest` & M2/gen IDs | **Owner** (`reports/artifact.ts`, `W16` lineage) | Owns `NP-04` persistence (`2e11fa3b`) |
| **`IID R-6` Margin of Safety (`margin.ts`) & `B2`/`CV-32` PIT seam** | Out of scope in initial phase | **Owner** (`iips-platform`, `server/pit/`) | Owns `./pit` library (`26855625`) |

---

## 5. Implementation Phases & Acceptance Criteria

### Phase A — Governance Approvals (Current Step — Required Before Code)
- **Exit Criteria:** Signed/recorded EquiCore Owner disposition on `EC-DEC-01..04` and IIPS Program Authority disposition on `PA-DEC-01..05`.

### Phase B — EquiCore Headless Machine API & ISIN Index (`ramkivs/equity-market-data-engine`)
- **Deliverables:** Rebuildable Class-(4) `(isin_normalized, series, business_date)` index module (indexing `VALID` ISINs only); `src/serving/iips_api.py` + `serving.iips_serve` (`127.0.0.1:8614`, `iips-equicore-historical/v1`); unit, contract, security, determinism, and Windows `M2` integration tests.
- **Quantified Acceptance Criteria (`EC-AC-*`):**
  - `EC-AC-01` (Security): Missing/bad bearer token → `401`; non-loopback `Host` → `403`; `--bind 0.0.0.0` refused at startup; zero `Access-Control-Allow-Origin` headers.
  - `EC-AC-02` (Identity & Invalid ISIN): Invalid ISIN syntax → `400`; `BLANK`/invalid-ISIN rows excluded from ISIN index; overlapping symbol ambiguity → `409 IDENTITY_AMBIGUOUS`; sequential symbol renames returned with `observedSymbols[]`; `EQ`/`BE`/`BL` strictly isolated.
  - `EC-AC-03` (Scope & EOD Semantics): `BSE_EQ` → `422 UNSUPPORTED_EXCHANGE`; `1m..1h` → `422 UNSUPPORTED_FREQUENCY`; adjusted mode → `422 ADJUSTMENT_UNAVAILABLE`; `/v1/historical/eod-observation` stamps `PINNED_GENERATION_EOD_SNAPSHOT` & `bitemporalKnowledgeAsOf: false`.
  - `EC-AC-04` (Calendar & Completeness): Exact accounting across official holidays, `unexplainedCalendarDates[]` (e.g. `2024-11-20`, `2025-10-20`), `notRetrievedCalendarDates[]`, and `securityAbsentOnTradingDaysCount` (`tradingDaysWithArchive === returnedBarCount + securityAbsentOnTradingDaysCount`).
  - `EC-AC-05` (Determinism & M2 Immutability): Identical queries produce byte-identical JSON & `responseDigest`; deleting and rebuilding Class-(4) ISIN index produces identical index digest; M2 manifest digest `e7c7e4c8...` unchanged; Windows `M2` smoke queries pass.

### Phase C — IRR Consumer, Boundary & `D-4.7` `NP-04` Embedding (`ramkivs/iips-review-recovered`)
- **Deliverables:** `frontend/server/market-data/equicoreTransportConfig.ts`, `equicoreTransport.ts`, `historicalConsumptionBoundary.ts`, IRR API routes + explicit source selector UI (`DhanHistorical.tsx` / `W-21`), `D-4.7` `HistoricalPriceEvidence` contract + validation in `frontend/server/reports/artifact.ts` + `W16` `provenanceEnvelope.ts`, `verify-browser-bundle.mjs` updates, and Windows E2E verification.
- **Quantified Acceptance Criteria (`IRR-AC-*`):**
  - `IRR-AC-01` (Boundary & Security): Server starts cleanly when EquiCore is stopped (`/api/equicore/health` reports `NOT_CONFIGURED`/`UNAVAILABLE`); `verify-browser-bundle.mjs` fails if any `frontend/src/**` file references `equicoreTransport*` or `IIPS_EQUICORE_*`; error payloads never leak token values.
  - `IRR-AC-02` (Non-Blending & Tamper Detection): `D-4.2` negative tests prove EquiCore `404`/`503`/timeout **never** falls back to Dhan `D02` or fixture `PIT`, and tampered `responseDigest` fails closed (`502 INTEGRITY_MISMATCH`).
  - `IRR-AC-03` (Disclosures & Calendar): UI displays `EQUICORE_NSE_EOD`, `Unadjusted for corporate actions` (`D-4.4`), and explicit unexplained/absent trading-day completeness badges (`MD-09`).
  - `IRR-AC-04` (`D-4.7` Report Reproducibility): Persisted `NP-04` report artifacts embed full `HistoricalPriceEvidence` (`observations`, `observationDigest`, `sourceIdentity`, `adjustment`, `baselineManifestSha256`/`compositeGeneration`, `responseDigest`), validate offline via `GET /api/reports/artifacts/:reportId` with EquiCore stopped, and diff accurately across `v1` vs `v2` in `W16`.
  - `IRR-AC-05` (CI & Windows): All IRR `CI`, `CAP-03`, and `Windows` checks pass, plus Windows loopback end-to-end test between live `serving.iips_serve` (over `M2`) and IRR Node server.

### Phase D — Deferred / Separately Gated Extensions (Out of Scope Today)
- Enabling post-M2 `B5` composite generations (requires `B5`/`B6` Windows closure + `D21` `409` hold tests).
- `IID R-6` (`margin.ts`) price integration across corporate actions (requires corporate-action factor timeline + `R-6` amendment).
- Full `D-4.5` bitemporal PIT / `BSE_EQ` Bhavcopy / `B2` & `CV-32` supersession.

---

## 6. Explicit Decision Sign-Off Record (To Be Completed by Authorities)

| Authority | Decision IDs | Requested Action | Disposition (`PENDING` / `APPROVED` / `APPROVED_WITH_CONDITIONS` / `DEFERRED` / `REJECTED`) |
|---|---|---|---|
| **EquiCore Owner** | `EC-DEC-01` .. `EC-DEC-04` | Extend `D23` for headless loopback API (`127.0.0.1:8614`), Class-(4) ISIN/series/date index, M2-only `NSE_EQ`/`1D`/`RAW_UNADJUSTED` scope, `B5`/`D21` bounds | **`PENDING`** |
| **IIPS Program Authority** | `PA-DEC-01` .. `PA-DEC-05` | Admit `EQUICORE_NSE_EOD`, enforce `D-4.2` non-blending, establish server transport/bundle isolation, approve `D-4.7` `NP-04` `HistoricalPriceEvidence`, preserve `B2`/`P4`/`CV-32` & `IID R-6` | **`PENDING`** |
