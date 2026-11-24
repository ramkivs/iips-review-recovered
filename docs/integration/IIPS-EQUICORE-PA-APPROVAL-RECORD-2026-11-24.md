# IIPS–EquiCore Owner & Program Authority Approval Record (`IIPS-EQUICORE-PA-APPROVAL-RECORD-2026-11-24`)

- **Document ID:** `IIPS-EQUICORE-PA-APPROVAL-RECORD-2026-11-24`
- **Date:** 2026-11-24 (UTC)
- **Decision Status:**
  - **IIPS (`ramkivs/iips-review-recovered`) Decisions `PA-DEC-01` – `PA-DEC-05`:** **`APPROVED`** (sole owner / Program Authority: **Ramki**, 2026-11-24; effective upon publication to `ramkivs/iips-review-recovered` `main`)
  - **EquiCore (`ramkivs/equity-market-data-engine`) Decisions `EC-DEC-01` – `EC-DEC-04`:** **`APPROVED`** by the same sole owner / decision-maker (**Ramki**, 2026-11-24); **EquiCore-repository publication PENDING** in `ramkivs/equity-market-data-engine` (sandbox write check to EquiCore returned `HTTP 403`; prepared EquiCore handoff artifact at [`artifacts/EQUICORE-D40-IIPS-SERVING-EXTENSION-PREPARED-2026-11-24.md`](artifacts/EQUICORE-D40-IIPS-SERVING-EXTENSION-PREPARED-2026-11-24.md))
- **Proposal Record:** [`docs/integration/IIPS-EQUICORE-SERVING-AUTHORIZATION-PROPOSAL-2026-11-23.md`](IIPS-EQUICORE-SERVING-AUTHORIZATION-PROPOSAL-2026-11-23.md) (PR #643, merged at `616f010c64500a2b31dd2d42ba4f5b620b0541f2`)
- **Governing Technical Input:** [`docs/integration/IIPS-EQUICORE-REQUEST-RESPONSE-ARCHITECTURE-ASSESSMENT-2026-11-23.md`](IIPS-EQUICORE-REQUEST-RESPONSE-ARCHITECTURE-ASSESSMENT-2026-11-23.md) (Revision `1.1`)
- **Owning Repositories:**
  - **IIPS / IRR:** `ramkivs/iips-review-recovered`
  - **EquiCore:** `ramkivs/equity-market-data-engine` (baseline inspected read-only at `origin/main` `b79cf1d0`)
- **Implementation Authorization Notice:** **NOT INCLUDED.** This record publishes formal owner / Program Authority governance approvals only. It authorizes **zero** Phase B or Phase C runtime code, HTTP endpoints, ISIN indexes, pins, or gate changes. Phase B and Phase C each require separate explicit implementation authorization.

---

## 1. Explicit Ownership, Personal-Use, and Application Scope (Authoritative)

The following statements are authoritative and binding across both applications and both repositories:

- **IIPS and EquiCore are local, single-user applications.**
- **Ramki is the sole owner and decision-maker for both applications.**
- **Both applications are strictly for personal use.**
- **The authorization is exclusively for personal-use integration between these applications.**
- **There is no production environment or production deployment requirement.**
- **No hosted, commercial, multi-user, or production deployment is authorized or required.**

Consistent with these authoritative scope statements, no production-readiness gates, separate production-owner approvals, or multi-user deployment assumptions apply or may be introduced.

---

## 2. Recorded IIPS Program Authority Approvals (`PA-DEC-01` – `PA-DEC-05`)

All five IIPS Program Authority decisions proposed in [`IIPS-EQUICORE-SERVING-AUTHORIZATION-PROPOSAL-2026-11-23.md`](IIPS-EQUICORE-SERVING-AUTHORIZATION-PROPOSAL-2026-11-23.md) §3 are explicitly **APPROVED** on **2026-11-24** by **Ramki** (sole owner and decision-maker), preserving original wording, binding bounds, and Phase C acceptance criteria (`IRR-AC-01`–`IRR-AC-05`) verbatim:

| Decision ID | Decision Statement (Original Wording Preserved) | Binding Bounds & Conditions (Verbatim) | Recorded Status |
|---|---|---|---|
| **`PA-DEC-01`** | **Admit `EQUICORE_NSE_EOD` as an approved historical source alongside Dhan `D02`** | • Under Option C (`D-4.1`), `EQUICORE_NSE_EOD` is admitted for daily (`1D`), `NSE_EQ`, `RAW_UNADJUSTED` historical bars, symbol-continuity intervals, and NSE calendar completeness.<br>• Dhan `D02` remains the sole source for intraday (`1m..1h`) and `BSE_EQ` historical queries (`W-12`/`W-14`/`W-19` unchanged). | **`APPROVED`** (2026-11-24) |
| **`PA-DEC-02`** | **Preserve `D-4.2` non-fallback and non-blending invariants** | • Consumers declare source explicitly (`EQUICORE_NSE_EOD` vs `DHAN_D02`); IRR never silently falls back from EquiCore to Dhan `D02` (or vice versa) on error, timeout, or empty series, and never concatenates bars across sources.<br>• `D-4.4` unadjusted disclosure (`isAdjusted: false`) is mandatory on all UI/analytics surfaces consuming `EQUICORE_NSE_EOD`. | **`APPROVED`** (2026-11-24) |
| **`PA-DEC-03`** | **Establish the IRR server-side integration and security boundary** | • Authorize `equicoreTransportConfig.ts`, `equicoreTransport.ts`, and `historicalConsumptionBoundary.ts` strictly under `frontend/server/` (mirroring `marketDataTransportConfig.ts` + `dhanMarketDataTransport.ts` + `quoteConsumptionBoundary.ts`).<br>• Require `IIPS_EQUICORE_BASE_URL` (loopback `http://` only) + **mandatory** `IIPS_EQUICORE_TRANSPORT_TOKEN`; update `verify-browser-bundle.mjs` to block all EquiCore transport imports, URLs, and env tokens from `frontend/src/**`.<br>• IRR resolves `companyId` → `(ISIN:<12-alnum>:<series>, exchangeSegment)` (`D-4.6`) before calling EquiCore; EquiCore never resolves `companyId`. | **`APPROVED`** (2026-11-24) |
| **`PA-DEC-04`** | **Approve `D-4.7` `NP-04` `HistoricalPriceEvidence` contract and embedding work** | • Authorize adding the normative `HistoricalPriceEvidence` v1 block (`observations`, `observationDigest`, `sourceIdentity`, `adjustment`, `baselineManifestSha256`/`compositeGeneration` `provenance`, `temporal`/`completeness`, and `responseDigest`) to `NP-04` `ReportContent.canonicalPayload` (`frontend/server/reports/artifact.ts`) and `W16` `provenanceEnvelope.ts` version-diff comparisons.<br>• Guarantee offline historical report reads (`GET /api/reports/artifacts/:reportId`) never call EquiCore or Dhan. | **`APPROVED`** (2026-11-24) |
| **`PA-DEC-05`** | **Preserve existing `B2` / `P4` / `CV-32` (`D-4.5`) and `IID R-6` boundaries unchanged** | • Gate `B2` (`AD-02`), `P4` (`REG-02`), and `CV-32` (`API-ONLY`) on IRR `/api/pit/market-data` remain **unchanged**.<br>• `IID R-6` (`iips-platform/src/investment/assessment/margin.ts`) continues to enforce `PIT_D01 \| DATASET_EOD` and hard refusal across unadjusted corporate actions (`UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION`); any future `IID` consumption of `EQUICORE_NSE_EOD` requires a separate corporate-action factor source + `R-6` amendment. | **`APPROVED`** (2026-11-24) |

### 2.1 Preserved Phase C Acceptance Criteria (`IRR-AC-01` – `IRR-AC-05`)

When Phase C is separately authorized for implementation in `ramkivs/iips-review-recovered`, closure requires all five acceptance criteria from [`IIPS-EQUICORE-SERVING-AUTHORIZATION-PROPOSAL-2026-11-23.md`](IIPS-EQUICORE-SERVING-AUTHORIZATION-PROPOSAL-2026-11-23.md) §5:
- `IRR-AC-01` (Boundary & Security): Server starts cleanly when EquiCore is stopped (`/api/equicore/health` reports `NOT_CONFIGURED`/`UNAVAILABLE`); `verify-browser-bundle.mjs` fails if any `frontend/src/**` file references `equicoreTransport*` or `IIPS_EQUICORE_*`; error payloads never leak token values.
- `IRR-AC-02` (Non-Blending & Tamper Detection): `D-4.2` negative tests prove EquiCore `404`/`503`/timeout **never** falls back to Dhan `D02` or fixture `PIT`, and tampered `responseDigest` fails closed (`502 INTEGRITY_MISMATCH`).
- `IRR-AC-03` (Disclosures & Calendar): UI displays `EQUICORE_NSE_EOD`, `Unadjusted for corporate actions` (`D-4.4`), and explicit unexplained/absent trading-day completeness badges (`MD-09`).
- `IRR-AC-04` (`D-4.7` Report Reproducibility): Persisted `NP-04` report artifacts embed full `HistoricalPriceEvidence` (`observations`, `observationDigest`, `sourceIdentity`, `adjustment`, `baselineManifestSha256`/`compositeGeneration`, `responseDigest`), validate offline via `GET /api/reports/artifacts/:reportId` with EquiCore stopped, and diff accurately across `v1` vs `v2` in `W16`.
- `IRR-AC-05` (CI & Windows): All IRR `CI`, `CAP-03`, and `Windows` checks pass, plus Windows loopback end-to-end test between live `serving.iips_serve` (over `M2`) and IRR Node server.

---

## 3. Recorded EquiCore Owner Approvals (`EC-DEC-01` – `EC-DEC-04`) & Strict Repository Ownership

The same sole owner and decision-maker (**Ramki**) explicitly **APPROVED** all four EquiCore decisions on **2026-11-24**, preserving original wording, binding bounds, and Phase B acceptance criteria (`EC-AC-01`–`EC-AC-05`) verbatim:

| Decision ID | Decision Statement (Original Wording Preserved) | Binding Bounds & Conditions (Verbatim) | Owner Disposition & Publication Status |
|---|---|---|---|
| **`EC-DEC-01`** | **Extend `D23` to authorize a headless, local loopback HTTP serving API (`serving.iips_serve`, `iips-equicore-historical/v1`)** | • Runs as a separate headless read-only Python 3 stdlib `ThreadingHTTPServer` entrypoint on `127.0.0.1:8614` (distinct from `src/ui/serve.py:8613`; `--bind 0.0.0.0` prohibited).<br>• Exposes only `GET /v1/health`, `POST /v1/historical/bars`, `POST /v1/historical/eod-observation`, `GET /v1/instruments/:isin/associations`, and `GET /v1/calendar`.<br>• Enforces mandatory `Authorization: Bearer <token>`, loopback `Host` header check, zero CORS headers, `Cache-Control: no-store`, and SHA-256 `responseDigest`. | **Sole Owner: `APPROVED`** (2026-11-24); **EquiCore repo publication `PENDING`** |
| **`EC-DEC-02`** | **Authorize the rebuildable Class-(4) `(isin_normalized, series, business_date)` index** | • Strictly `D16-07` Class-(4) derived state stored outside the M2 package (`--state` root; deleting it is never a data event and rebuild reproduces identical bytes).<br>• Indexes **only** rows with `isin_validity === 'VALID'` per `D05 §6.1` (`BLANK` and invalid-ISIN rows never form cross-symbol correlation links).<br>• Preserves `D05/1.0` verbatim `Decimal` values, `D05 §8` row provenance, and `nse_engine` (`d3269b73...`) immutability. | **Sole Owner: `APPROVED`** (2026-11-24); **EquiCore repo publication `PENDING`** |
| **`EC-DEC-03`** | **Lock initial serving scope to the qualified M2 baseline, `NSE_EQ`, daily EOD (`1D`), `RAW_UNADJUSTED`** | • Initial dataset is strictly the `I5`-qualified M2 baseline (`i4-20261008-M2`, `2,462` NSE archives, `2016-09-20`..`2026-09-18`).<br>• Rejects `BSE_EQ` (`422 UNSUPPORTED_EXCHANGE`), intraday `1m..1h` (`422 UNSUPPORTED_FREQUENCY`), and adjusted modes (`422 ADJUSTMENT_UNAVAILABLE`).<br>• Exposes `POST /v1/historical/eod-observation` strictly as `PINNED_GENERATION_EOD_SNAPSHOT` (`bitemporalKnowledgeAsOf: false`), not bitemporal `knownAsOf` PIT. | **Sole Owner: `APPROVED`** (2026-11-24); **EquiCore repo publication `PENDING`** |
| **`EC-DEC-04`** | **Confirm exclusions & `B5` boundary** | • Raw archive bytes stay excluded (`D16-08` Class 5).<br>• Post-M2 `B5` composite generations (`catalog-composite`) remain **out of initial serving scope** until `B5`/`B6` close; when later enabled, `D21` `CHANGED-CONFLICT-UNRESOLVED` quarantine (`D21 §18`) remains fail-closed (`409 D21_CONFLICT_HELD`). | **Sole Owner: `APPROVED`** (2026-11-24); **EquiCore repo publication `PENDING`** |

### 3.1 Preserved Phase B Acceptance Criteria (`EC-AC-01` – `EC-AC-05`)

- `EC-AC-01` (Security): Missing/bad bearer token → `401`; non-loopback `Host` → `403`; `--bind 0.0.0.0` refused at startup; zero `Access-Control-Allow-Origin` headers.
- `EC-AC-02` (Identity & Invalid ISIN): Invalid ISIN syntax → `400`; `BLANK`/invalid-ISIN rows excluded from ISIN index; overlapping symbol ambiguity → `409 IDENTITY_AMBIGUOUS`; sequential symbol renames returned with `observedSymbols[]`; `EQ`/`BE`/`BL` strictly isolated.
- `EC-AC-03` (Scope & EOD Semantics): `BSE_EQ` → `422 UNSUPPORTED_EXCHANGE`; `1m..1h` → `422 UNSUPPORTED_FREQUENCY`; adjusted mode → `422 ADJUSTMENT_UNAVAILABLE`; `/v1/historical/eod-observation` stamps `PINNED_GENERATION_EOD_SNAPSHOT` & `bitemporalKnowledgeAsOf: false`.
- `EC-AC-04` (Calendar & Completeness): Exact accounting across official holidays, `unexplainedCalendarDates[]` (e.g. `2024-11-20`, `2025-10-20`), `notRetrievedCalendarDates[]`, and `securityAbsentOnTradingDaysCount` (`tradingDaysWithArchive === returnedBarCount + securityAbsentOnTradingDaysCount`).
- `EC-AC-05` (Determinism & M2 Immutability): Identical queries produce byte-identical JSON & `responseDigest`; deleting and rebuilding Class-(4) ISIN index produces identical index digest; M2 manifest digest `e7c7e4c8...` unchanged; Windows `M2` smoke queries pass.

### 3.2 Strict Repository Ownership & Publication Boundary (`HTTP 403` on EquiCore)

- `ramkivs/iips-review-recovered` owns `PA-DEC-01`–`PA-DEC-05` and IRR consumer/boundary/NP-04 governance.
- `ramkivs/equity-market-data-engine` owns `EC-DEC-01`–`EC-DEC-04` and the `D23` extension decision record.
- During this IRR-scoped session, a read-only `git push --dry-run` check against `ramkivs/equity-market-data-engine` returned `HTTP 403` (`Permission to ramkivs/equity-market-data-engine.git denied`). Accordingly, **zero EquiCore mutations were attempted or claimed**.
- A ready-to-publish EquiCore decision record matching EquiCore's `docs/architecture/` pattern (`D40`) is preserved at [`docs/integration/artifacts/EQUICORE-D40-IIPS-SERVING-EXTENSION-PREPARED-2026-11-24.md`](artifacts/EQUICORE-D40-IIPS-SERVING-EXTENSION-PREPARED-2026-11-24.md) for publication in `ramkivs/equity-market-data-engine` via its own branch and PR.

---

## 4. Implementation Authorization Eligibility (Phase B & Phase C)

1. **No Implementation Authorized Here:** This record grants **no** code-execution or endpoint-implementation authority.
2. **Phase B (`ramkivs/equity-market-data-engine`) Eligibility:** **ELIGIBLE** for separate Phase B implementation authorization once the EquiCore-owned `D40` (`D23`-extension) approval record is published in `ramkivs/equity-market-data-engine` (or jointly authored/published at the start of an EquiCore-repo session with explicit Phase B authorization).
3. **Phase C (`ramkivs/iips-review-recovered`) Eligibility:** **ELIGIBLE** for separate Phase C implementation authorization now that `PA-DEC-01`–`PA-DEC-05` are approved on IRR `main`; IRR server transport boundary + `D-4.7` `NP-04` contract/embedding + unit/contract tests can be authorized independently, while live loopback E2E (`IRR-AC-05`) depends on Phase B's `serving.iips_serve` deliverable.
