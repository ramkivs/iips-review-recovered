# D-4.5 D114/PIT Admission Assessment (`B2` / `CV-32` Boundary & Expansion Requirements)

**Document ID:** `DHAN-D4-5-PIT-ADMISSION-ASSESSMENT-2026-11-23`  
**Date:** 2026-11-23 (UTC; repository baseline verified against IRR `main` `dbb91b7` merged `2026-11-24`)  
**Work Item:** `D-4.5` (*D114/PIT Admission Gate*) under approved `D-4` (`DHAN-D4-OWNER-ACCEPTANCE-2026-11-23.md`)  
**Type:** Read-only architecture, governance, and capability assessment. **Zero runtime code, route, pin, fence, or admission state modified.**

---

## 1. Executive Conclusion & Current Admission Status

**Verified Current Admission Status:**
- **Gate `B2` (`AD-02`, `IIPS_v3.0_G1_B2_PIT_D114_CAPABILITY_ADMISSION_DECISION.md`):** **IN FORCE — NARROW NON-PRODUCTION ONLY.** Admits IPD `./pit` and `./d114-non-production` exclusively for **five named IRR server/test files**, server-side Node locus only, non-production fixture/archive data only, with explicit prohibition on browser imports, additional consumers, production data, network acquisition, `./persistence` mixing, and identity/tenancy/`D115` authority.
- **Route Gate `P4` (`REG-02`, `IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md` §2.1(2), §2.3):** **RETAINED, NOT ADMITTED.** The live `/api/pit/` dispatch (`frontend/server/executive-transport.ts:998-1010`) and `frontend/server/pit-transport.ts` (`GET /api/pit/market-data`) remain present in the server for operator/test verification, not admitted for product consumption.
- **Product Disposition `CV-32` (`PKG-05-PIT-CV32-DISPOSITION-PACKET.md`, tracker `§16.55`):** **CLOSED — API-ONLY FOR CURRENT SCOPE.** `frontend/src/api/pit.ts` is retained as an unconsumed typed client (`0` feature callers); no PIT UI is implemented, mounted, or authorized.
- **Approved `D-4.5` Decision (`DHAN-D4-OWNER-ACCEPTANCE-2026-11-23.md` §2 item 5 & IPD Mirror Acceptance `df74b500`, IPD PR #191):** **RETAINS `B2` / `CV-32` INTACT.** `D-4` (`approve_all_d4`, IRR PR #627 `8f893112`, IPD PR #191 `df74b500`) explicitly keeps `/api/pit/market-data` and IPD `./pit` / `./d114-non-production` fenced behind `B2` and `CV-32` and requires a dedicated Program Authority admission packet + technical prerequisites before any broader historical-replay or backtesting admission.
- **Distinction from `IID R-6` Valuation:** `iips-platform/src/investment/assessment/margin.ts` reads `PriceRecord[]` with `source: 'PIT_D01' | 'DATASET_EOD'` from the local IID dataset (`iips-platform`), completely separate from `/api/pit/market-data` and `PointInTimeStore`.

**Independent Execution Determination:** **No broader PIT implementation, durable store wiring, real Bhavcopy ingestion, `queryRange` exposure, or PIT UI work may proceed independently.** Any expansion beyond `B2`/`CV-32` requires explicit Program Authority admission (superseding `B2` and activating `P4`), Product Owner disposition (if any UI or user-facing capability is added, superseding `CV-32`), and a coordinated IPD + IRR contract/pin release.

---

## 2. Inspected Governance & Implementation Baseline

### 2.1 Governing Decisions & Acceptance Records
| Record | Repository / Commit | Verified Rule / State |
|---|---|---|
| `docs/integration/IIPS_v3.0_G1_B2_PIT_D114_CAPABILITY_ADMISSION_DECISION.md` (`B2` / `AD-02`) | IRR (`800789957`, effective via `eb05e25f`) | Narrow non-production admission of `./pit` & `./d114-non-production` for 5 named server/test files (`ipdPitReadAdapter.ts`, `nonProductionPitStore.ts`, `nonProductionRuntimePitStore.ts`, `pitRuntimeIntegration.test.ts`, `pitD114RuntimeIntegration.test.ts`). Forbids browser imports, new consumers, production/live/historical acquisition, and identity/D115 use. |
| `docs/integration/IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md` (`REG-02` / `P4`) | IRR (`main`, `2026-10-13`) | Clarifies `AD-02` is in force; explicitly holds live `/api/pit/` dispatch and `pit-transport.ts` as **RETAINED, NOT ADMITTED (`P4`)** — *"Route presence is not admission."* |
| `docs/integration/2026-10-18/PKG-05-PIT-CV32-DISPOSITION-PACKET.md` & `evidence/integration/cv32-pit-disposition-2026-10-18/evidence-record.md` | IRR (`6f115779`, PR #139, `2026-10-18`) | Closes `CV-32` as **`API-ONLY`**; retains `src/api/pit.ts` with 0 UI consumers; lists prerequisites for any future UI panel (`CV-22`/identity source, `P4` gate, bounded panel scope, mounted test, Windows operator acceptance). |
| `docs/integration/DHAN-D4-OWNER-DECISION-PROPOSAL-2026-11-23.md` & `DHAN-D02-VS-D114-PIT-ARCHITECTURE-ASSESSMENT-2026-11-23.md` | IRR (`8f893112`, PR #627 + `D4-DR-01..03` erratum) | Adopts Option C (separate authorities by use case: `D02` for range/intraday charts, `IID R-6` for valuation, `D114/PIT` for future `asOf`/backtesting, `NP-04` embedded snapshot for report reproducibility). |
| `docs/integration/DHAN-D4-OWNER-ACCEPTANCE-2026-11-23.md` & IPD Mirror Acceptance (`df74b500`, IPD PR #191) | IRR (`8f893112`) + IPD (`df74b500`) | Owner approved `D-4.1`–`D-4.7` (`approve_all_d4`, `2026-11-23`). Erratum `D4-DR-03` explicitly separates IRR's 20-record in-memory runtime fixture store from IPD's `./d114-non-production` 3-archive fixture set and IPD's library-only durable SQLite store (`src/pit/pit_durable_store.ts`). |
| `docs/integration/DHAN-D4-6-IDENTITY-SYMMETRY-IMPLEMENTATION-2026-11-23.md` | IRR (`dbb91b7`, PR #641) | Closed IRR-side `D01`/`D02` canonical identity asymmetry (`(companyId, exchangeSegment, ISIN:<12-alnum>:<series>)`) without altering `D-4.5` or pinned IPD (`26855625`). |

### 2.2 Pinned IPD Dependency & IRR Code Inventory
- **Package pins (`frontend/package.json`, `.ci/verify-ipd-pins.mjs`, `frontend/server/broker-import/brokerImportPackageConsumer.test.ts`):**
  - `iips-production-market-data`: `github:ramkivs/iips-production-market-data#2685562522f1a2fd1d745a7857f771bf21453315` (exposes `./pit`, `./d114-non-production`, `./portfolio-ui`, `./operator-drop`, `./dhan-server`).
  - `iips-np04-governed-persistence`: `github:ramkivs/iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (reports `./persistence` seam).
  - `iips-broker-import`: `github:ramkivs/iips-production-market-data#12a3d625d0ad603cb0bd9cea46bae314942ee40f`.
- **IRR PIT surface files:**
  - `frontend/server/executive-transport.ts:998-1010`: dispatches `/api/pit/` dynamically to `./pit-transport`.
  - `frontend/server/pit-transport.ts`: exact-path `GET /api/pit/market-data` handler (`405` non-GET, `404` on invalid/duplicate/missing params or `NOT_FOUND`/`AMBIGUOUS`, `200` on hit).
  - `frontend/server/pit/pitReadPort.ts`: defines `PitReadPort` with **`queryAsOf` only** (`queryRange` intentionally withheld).
  - `frontend/server/pit/pitReadContract.ts`: requires `(securityId: ISIN:<12-alnum>:<series>, domain: 'D01_QUOTES' | 'D02_OHLCV', asOf: UTC ISO-8601)` with strict calendar round-trip validation (`isValidAsOf`) and `isNotFutureLeakage`.
  - `frontend/server/pit/pitReadBoundary.ts`: validates request fail-closed, delegates to `PitReadPort`, enforces post-read `securityId`/`domain` equality and `resolvedAsOf <= request.asOf`.
  - `frontend/server/pit/ipdPitReadAdapter.ts`: sole IRR module wrapping `PitReadService` over injected IPD `PointInTimeStore` and projecting 6 `PitReadProvenance` fields verbatim. *(Note: file header still carries stale comment referencing `"IU-5A"` — flagged unverified in `B2` §5(3) — and legacy pin `2e11fa3b`.)*
  - `frontend/server/pit/nonProductionPitStore.ts`: appends `8` `MOCK_FIXTURE` records (`SWANENERGY`, `INE665A01038:{BL,EQ}`).
  - `frontend/server/pit/nonProductionRuntimePitStore.ts`: composes one in-memory `PointInTimeStore` at boot via `populateNonProductionD114Pit` (`12` TCS records) + `appendNonProductionFixtures` (`8` SWANENERGY records).
  - `frontend/src/api/pit.ts`: 57-line typed `fetchPitAsOf` client (`0` UI importers).
  - Test suites (`113` PIT tests recorded in `cv32` evidence): `pitReadBoundary.test.ts` (48), `pitRuntimeIntegration.test.ts` (28), `pitD114RuntimeIntegration.test.ts` (27), `src/api/pit.test.ts` (10).

---

## 3. Verified Current Runtime Capabilities

| Dimension | Verified Current Capability | Source Evidence |
|---|---|---|
| **Coverage** | **20 in-memory records total**: `12` D114 TCS records (`ISIN:INE467B01029:{EQ,BL}` × 3 archive dates `2024-06-28`, `2026-01-05`, `2026-02-10` × `D01_QUOTES`/`D02_OHLCV`) + `8` mock fixture records (`SWANENERGY` `INE665A01038:{BL,EQ}` × `T1/T2/T3`). Daily EOD (`1d`) only; zero NSE/BSE broad universe coverage (`4,680` P7/W-27 rows are NOT in IRR runtime PIT); zero intraday (`1m..1h`) bars. | `nonProductionRuntimePitStore.ts`, `nonProductionPitStore.ts`, `pitD114RuntimeIntegration.test.ts:105-116`, `DHAN-D4-OWNER-ACCEPTANCE-2026-11-23.md` (`D4-DR-03`). |
| **Persistence** | **IRR runtime `/api/pit/market-data` is ephemeral in-memory only** (`new PointInTimeStore<unknown>()` constructed per process boot; restart resets to the 20 boot records). Separately, IPD `84e988b0` contains a library-only append-only SQLite store (`src/pit/pit_durable_store.ts`, isolated from Gate 3/Gate A′), with **no HTTP route, no IRR consumer, and no product admission**. | `nonProductionRuntimePitStore.ts:43-59`, `DHAN-D4-OWNER-ACCEPTANCE-2026-11-23.md` §2.1 & `D4-DR-03`. |
| **Temporal Provenance** | Carries 6 verbatim provenance fields (`asOf`, `receivedAt`, `evaluatedAt`, `dataVersion`, `lineageHash`, `qualityState`). Enforces strict UTC ISO-8601 calendar round-trip validation (`isValidAsOf`) and `resolvedAsOf <= requestedAsOf` future-leakage protection. **Only 3 timestamps** exist (`asOf`, `receivedAt`, `evaluatedAt`), conflating market effective date, exchange publication time, ingestion/knowledge time, and revision time. | `pitReadContract.ts`, `ipdPitReadAdapter.ts:49-58`, `pitReadBoundary.ts:62-89`. |
| **Correction & Restatement Handling** | IPD `PointInTimeStore.append()` is append-only (`dataVersion`, `lineageHash`). However, IRR performs only a deterministic static boot population; there is **no** restatement/correction chain (`supersedesVersion`), **no** `revisedAt` timestamp, **no** multi-version dispute resolution, and **no** `asOf`-aligned corporate-action factor timeline. | `nonProductionRuntimePitStore.ts`, `pitD114RuntimeIntegration.test.ts:297-315`, `DHAN-D4-OWNER-DECISION-PROPOSAL-2026-11-23.md` §5, §7 `D-4.5`. |
| **Runtime Query & Isolation** | Read-only `GET /api/pit/market-data` (`405` on non-GET; exact-path match; duplicate-parameter fail-closed). Supports single-security, single-domain (`D01_QUOTES` or `D02_OHLCV`), single-instant (`queryAsOf`) lookup only. Series (`EQ`/`BL`) strictly isolated; `isinAuthority: 'NON_AUTHORITATIVE'`; zero fallback or blending with Dhan `D02`; zero `queryRange` or batch API; zero `NP-04` report price embedding (`D-4.7` pending). | `pit-transport.ts`, `pitReadPort.ts:18-24`, `pitD114RuntimeIntegration.test.ts:154-230`, `frontend/server/reports/`. |

---

## 4. Gap Analysis: Current State vs Broader PIT Admission

| Capability Axis | Current State (`B2` / `CV-32`) | Gap for **Tier 1: Read-Only Historical Replay (Product API / UI)** | Additional Gap for **Tier 2: Backtesting & Strategy Replay** |
|---|---|---|---|
| **Storage & Restart Durability** | IRR runtime uses ephemeral 20-record in-memory `PointInTimeStore`. IPD `pit_durable_store.ts` is library-only and unadmitted. | Must replace IRR in-memory fixture store with admitted durable storage (e.g., IPD durable PIT store exposed via governed contract) surviving process restart with WAL/integrity checks and explicit Gate 3/A′ isolation. | Must support indexed multi-year history across NSE+BSE equities without full-table scans or unbounded memory growth; reproducible store snapshot digests. |
| **Market-Data Ingestion & Coverage** | `12` TCS records from 3 static Bhavcopy fixture files + `8` mock records. | Verified automated/manual ingestion pipeline for real NSE (CM-UDiFF) + BSE Bhavcopy archives with checksums, holiday/empty-day semantics, idempotent deduplication, and explicit `coverageClaim`. | Complete multi-year contiguous trading-day calendar & coverage completeness audit (distinguishing market holidays vs missing exchange files vs suspended/delisted securities). |
| **4-Timestamp Temporal Model** | 3 timestamps (`asOf`, `receivedAt`, `evaluatedAt`) in `PitReadProvenance`. | Must separate **`marketDate`** (trading date), **`publishedAt`** (exchange file release), **`ingestedAt`** (`knownAsOf` when entered IIPS), and **`revisedAt`** (correction timestamp), prohibiting retroactive backfill from masquerading as historical knowledge. | Dual-axis replay cutoff semantics: strict **`knownAsOf <= T`** vs explicitly labelled **publication-time simulation (`publishedAt <= T` with `revisedAt > T` excluded)**. |
| **Correction & Restatement Semantics** | Static one-shot append; no revision chain. | Must model exchange file corrections / restatements via immutable **`supersedesVersion`** lineage rather than silent overwrite. | Deterministic as-of resolution across restated records (query at `T_before_revision` returns original; query at `T_after_revision` returns restated) with full audit diff. |
| **Corporate-Action Alignment** | None on `/api/pit/market-data` (only `IID` `margin.ts` enforces `{ factor, corporateActionId }`). | Must surface explicit `isAdjusted` / corporate-action disclosure symmetrically with `D-4.4` (never implying split-adjusted series from raw Bhavcopy). | **`asOf`-aligned corporate-action factor timeline**: splits/bonuses known/effective at `T` must adjust backward only from `knownAsOf <= T` without post-`T` look-ahead. |
| **Query Contract & Reproducibility** | Single-instant `queryAsOf` (`PitReadPort`) only; `queryRange` absent. | `P4` route admission + canonical identity alignment (`ISIN:<12-alnum>:<series>` + `exchangeSegment` per `D-4.6`; `CV-22`/UI identity source if UI mounted). | New bounded **`queryRange`** (`securityId`, `domain`, `fromDate`, `toDate`, `asOf` cutoff) + deterministic **query digest** + immutable `NP-04` embedding (`D-4.7`). |
| **Governance & Source Separation** | `B2` (5 files, non-production), `P4` (NOT ADMITTED), `CV-32` (`API-ONLY`). | Explicit PA admission packet superseding `B2` + activating `P4`; if UI is mounted, new PO act superseding `CV-32`; maintain strict `D-4.2` non-fallback/non-blending with `D02`. | Explicit PA backtesting capability admission + separation from `IID R-6` live valuation and live Dhan `D02` execution. |

---

## 5. Required Admission Criteria, Evidence & Validation Gates

Any future proposal to expand `D114/PIT` beyond `B2`/`CV-32` **must** satisfy all criteria in Tier 1 (and additionally Tier 2 if backtesting is requested) before Program Authority admission is granted:

### Tier 1 — Read-Only Product Historical Replay Admission (`PIT-ADM-*`)
1. **`PIT-ADM-01` (Durable Store & Restart Proof):** Product-admitted PIT runtime reads/writes must resolve against durable disk/SQLite storage (e.g., admitted evolution of IPD `pit_durable_store.ts`, strictly isolated from Gate 3/A′ portfolio DBs), verified by an automated separate-process restart proof showing identical query results and integrity hashes across restarts.
2. **`PIT-ADM-02` (Verified NSE + BSE Bhavcopy Ingestion):** Parser, canonical normalization (`D01_QUOTES`/`D02_OHLCV`), archive SHA-256 verification, and idempotent re-ingestion must be proved over real NSE CM-UDiFF and BSE equity Bhavcopy files across multiple dates/series (`EQ`/`BE`/`A`/`B`) with explicit holiday/missing-file accounting (never fabricating missing days).
3. **`PIT-ADM-03` (4-Timestamp Temporal Model & Knowledge-Cutoff Integrity):** Every admitted PIT record must persist and return `(marketDate, publishedAt, ingestedAt, revisedAt)` (or mapped `knownAsOf`), with boundary tests proving late-ingested historical archives (`ingestedAt = 2026` for `marketDate = 2024`) never pass a `knownAsOf = 2024` query without an explicit publication-simulation flag.
4. **`PIT-ADM-04` (Correction & Restatement Lineage):** Appending a corrected exchange record for an existing `(securityId, domain, marketDate)` must preserve the prior version immutably, link `supersedesVersion`, and pass deterministic before/after `revisedAt` query tests.
5. **`PIT-ADM-05` (Canonical Identity, `D-4.4` Disclosure & `D-4.2` Non-Blending):** Requests must enforce `(ISIN:<12-alnum>:<series>, exchangeSegment)` symmetry aligned with `D-4.6` (`H-5` closed), never blend or fall back to Dhan `D02`, and render explicit unadjusted corporate-action status (`D-4.4`) + `NON_AUTHORITATIVE` / `coverageClaim` disclosures.
6. **`PIT-ADM-06` (Governance & Windows Acceptance):** Explicit PA admission record superseding `B2` (`AD-02`) and admitting `P4` (`executive-transport.ts` `/api/pit/`), updated `verify-browser-bundle.mjs` / pin guards (`EXPECTED_IPD_PIN_SHA`), and — if a UI panel is commissioned — an explicit PO act superseding `CV-32`, an established UI identity source (`CV-22` or explicit picker), mounted UI integration tests, and Windows host verification.

### Tier 2 — Backtesting Admission (`PIT-BT-*`, Cumulative on Tier 1)
7. **`PIT-BT-01` (Range-Over-Time PIT Query Contract):** Introduce and qualify `queryRange(securityId, domain, fromDate, toDate, asOfCutoff, replayMode)` on `PitReadPort` / IPD service, ensuring zero candle with `effectiveTimestamp > asOfCutoff` (or `revisedAt > asOfCutoff`) enters the returned array.
8. **`PIT-BT-02` (`asOf`-Aligned Corporate-Action Factor Timeline):** Model corporate actions (`split`, `bonus`, `rights`, `dividend`) with `(effectiveDate, knownAsOf, factor, corporateActionId)` so backtest price series at `asOfCutoff` apply only adjustments known at `asOfCutoff`, verified against `iips-platform` `margin.ts` invariants.
9. **`PIT-BT-03` (Deterministic Query Digest & `NP-04` Reproducibility):** Every backtest read must emit a canonical `dataVersion`, `lineageHash`, and `queryDigest` compatible with `D-4.7` (`HistoricalPriceEvidence` embedded in `NP-04` artifacts) so re-running or reading stored artifacts reproduces identical inputs byte-for-byte.
10. **`PIT-BT-04` (Universe Completeness & Survivorship Bias Guard):** Backtesting across multiple securities must read from an `asOf`-qualified historical universe membership list (including delisted/suspended ISINs), preventing survivorship bias from present-day P7/W-27 snapshots.
11. **`PIT-BT-05` (Separate Backtesting PA Gate):** Explicit Program Authority acceptance certifying `PIT-BT-01..04` with zero cross-contamination into `IID R-6` live valuation or live Dhan `D02` feeds.

---

## 6. Implementation & Governance Dependencies and Repository Ownership

### Can Any Implementation Proceed Independently?
**No — not for any expansion beyond `B2`/`CV-32`.**
- **What stays allowed without new governance:** Purely internal, non-production maintenance strictly within `B2` §3.1–§3.4 (the 5 existing server/test files, non-production fixtures/archives only, zero browser UI, zero new symbols/consumers, `CV-32` API-only preserved).
- **What is blocked and requires further governance + coordinated IPD/IRR execution:**
  1. **Wiring IPD `pit_durable_store.ts` into IRR runtime or adding Bhavcopy archive ingestion** → blocked on IPD package export/contract readiness + **PA act superseding `B2`**.
  2. **Product consumption of `/api/pit/market-data` or adding `queryRange`** → blocked on **`P4` PA route gate** + IPD `PitReadService` / IRR `PitReadPort` contract update.
  3. **Mounting any PIT UI screen or backtest viewer** → blocked on **PO act superseding `CV-32`** + identity source (`CV-22` / W-15 picker) + `P4` gate + Windows operator acceptance.
  4. *(Separate parallel track — does NOT lift `B2`/`CV-32`)*: `W-20` (`D02` vs `PIT` precedence boundary under `D-4.1`–`D-4.3`) and `D-4.7` (`NP-04` price-evidence embedding) remain independently sequenced per `D-4` §2.1 (`W-12` → `W-17`/`W-14` → `W-19` → `W-20`), while IRR-side `D-4.4` (PR #639) and `D-4.6` (PR #641) are already merged.

### Repository Ownership Matrix
| Responsibility | Owning Authority / Repo | Current Status |
|---|---|---|
| Durable PIT store (`pit_durable_store.ts`), Bhavcopy ingestion parsers, 4-timestamp schema, `supersedesVersion`, `asOf`-CA timeline, `queryRange` service, `./pit` exports | **IPD (`ramkivs/iips-production-market-data`)** | `pit_durable_store.ts` is library-only with no HTTP route/admission (`84e988b0`); rest not yet implemented/admitted |
| `/api/pit/market-data` transport, `PitReadPort` / `PitReadBoundary`, `src/api/pit.ts`, future UI consumer, `NP-04` `HistoricalPriceEvidence` embedding (`D-4.7`), non-blending enforcement (`D-4.2`) | **IRR (`ramkivs/iips-review-recovered`)** | Non-production `queryAsOf` seam (`B2`/`CV-32`); `D-4.4` & `D-4.6` merged; `W-20`/`D-4.7` pending `W-19` |
| `IID R-6` Margin of Safety price alignment & CA refusal (`margin.ts`) | **IRR (`iips-platform/`)** | Preserved & tightened in `D-4.4` (PR #639) |
| Superseding `B2` (`AD-02`), activating `P4` route gate, backtesting admission | **Program Authority (Owner)** | **Retained closed/non-production** (`D-4.5` accepted `2026-11-23`) |
| Reopening `CV-32` (`API-ONLY`) for any PIT UI panel | **Product Owner (IRR)** | **Closed API-ONLY** (`2026-10-18`, preserved by `D-4.5`) |

---

## 7. Updated `D-4.5` Status & Recommended Next Step

- **`D-4.5` Status:** **ASSESSMENT COMPLETE** (evidence, capability inventory, gap matrix, and Tier 1/Tier 2 admission criteria established). Gate **`B2` (`AD-02`)**, **`P4` (`REG-02`)**, and **`CV-32` (`API-ONLY`)** remain **unchanged and in force**.
- **Immediate Next Step (outside `D-4.5`, consistent with `D-4` §2.1):**
  1. Do **not** alter `B2`/`CV-32` or wire durable PIT persistence into IRR until an explicit business need (product historical replay or backtesting) triggers a formal **PA `B2`/`P4` supersession packet** + IPD `pit_durable_store`/Bhavcopy contract design.
  2. Continue the approved Dhan `D02` critical path independently: `W-12` historical builder check & bounded owner-authorized `E4` probes → `W-14` live quote qualification → IPD `W-19` (`D02_OHLCV` cache/freshness + D02 digest) → IRR `W-20` (`D-4.2`/`D-4.3` non-blending & truthful D02 freshness) + `D-4.7` (`NP-04` price-evidence embedding).
