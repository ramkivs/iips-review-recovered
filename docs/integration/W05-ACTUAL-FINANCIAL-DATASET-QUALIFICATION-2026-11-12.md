# W05 — Actual Financial Dataset Qualification Record (2026-11-12)

## 1. Scope & Inspected Repositories

- **Workstream:** `W05 — Actual financial dataset qualification` (`Snapshot-to-Live` execution roadmap)
- **Assessment date:** `2026-11-12` (UTC)
- **IRR repository (target of narrow code remediation + qualification record):** `ramkivs/iips-review-recovered` on branch `arena/e8f9f3d2-iips-review-recovered` (branched from `main` @ `a835d4af019ab4f677ab238ec42d44326f06a771`, atop Phase 1 identity commit `7f3f7db14eb6baeda2f8e9ddfac5045d43cce1a9`)
- **IPD repository (inspected read-only; zero edits):** `ramkivs/iips-production-market-data` `main` @ `a624d06f66c376f03a29571cb24c3f0f77f0c24d`
- **Governing roadmap & limitation baselines:**
  - `ramkivs/iips-production-market-data`: `docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md` (`W01`–`W20`, blockers `B01`–`B08`, unestablished thresholds `θI`, `θF`, `θA`, `θM`)
  - `ramkivs/iips-review-recovered`: `docs/integration/IIPS-CURRENT-PORTFOLIO-STAGE-2-IRR-RECORD-2026-11-10.md`, `docs/integration/WS-A-68-ROW-IDENTITY-ASSESSMENT-RECONCILIATION-2026-11-09.md`, `docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md` (`L-001`–`L-040`), `docs/integration/IIPS_V3_IID_L040_VALUATION_OUTPUT_CORRECTION_2026-11-07.md`

---

## 2. Executive W05 Qualification Determination

| Dimension | Measured Position as of `2026-11-12` | Status |
|---|---|---|
| **W05 overall current-portfolio financial dataset qualification** | **Zero** current-portfolio holdings have an ingested financial dataset in IRR or IPD; external source rights (`B03`), live host dataset inspection (`B02`), and real-issuer accounting limitations `L-038` / `L-039` (`B08`) remain open. | **`NOT QUALIFIED` / `BLOCKED`** |
| **Persisted Windows operator portfolio (`W03` / `W04`) financial coverage** | Live Windows host runtime store and `IIPS_INVESTMENT_DATASET_DIR` are unobserved in this Linux workspace (`B02`). | **`UNAVAILABLE` (`B02`)** |
| **Published 68-row Dhan CSV (`B-04` / `§9-A`, 65 ISIN-resolved) financial coverage** | **`0 / 65` (`0.00%`)** ISIN-resolved holdings (`0 / 68` total rows) match any issuer in `evidence/real-issuer/**` or IPD `src/fundamentals/`. | **`0.00%` (`0 / 65`)** |
| **IPD fundamentals subsystem (`src/contracts/d03_fundamentals.ts`, `src/fundamentals/`)** | Operates in `LOCAL_FIXTURE_AND_OFFLINE_DEV` mode; no live filings feed or real-issuer fundamental dataset exists in IPD. | **`SYNTHETIC / OFFLINE DEV ONLY`** |
| **IRR real-issuer evidence datasets (`evidence/real-issuer/**`)** | **5 Indian listed non-portfolio issuers** across **3 of 13 sectors** (`Technology`: 3, `Consumer`: 1, `Industrials`: 1; **10 of 13 sectors have 0 real-issuer datasets**). All committed `manifest.json` files omit `sourceRights` (`UNKNOWN`), **5 of 5** are stale under `freshness-policy/1.0.0` as of `2026-11-12`, and **0 of 5** populate operating metrics (`0 / 33`). | **`EVIDENCE-SCOPED ONLY` (Non-Portfolio, Stale, Rights `UNKNOWN`)** |
| **IRR coverage source-rights enforcement (`W05-D1`, `W05-D2`)** | Remediated on branch: coverage builders and `/api/investment/coverage/investment` now classify datasets strictly from `DatasetManifest.sourceRights` via `classifyDataset()` (never from `provider`/`licence` regexes), fail closed on malformed `sourceRights`, and count governed `PeriodType = 'QUARTER'` rows accurately. | **`REMEDIATED & REGRESSION-GUARDED`** |
| **Gate `θF` & Final Gate `W20`** | `θF` remains unestablished; `W20` remains **`BLOCKED / NOT ACCEPTED`**. | **`BLOCKED`** |

---

## 3. Complete Inventory of Financial Datasets Across IRR & IPD

### 3.1 Synthetic & Reference Fixture Datasets (Excluded from Actual Coverage)

Per roadmap rule (`IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md` §3 & W05), synthetic fixtures validate schema and engine mechanics only and **never** count as actual company financial coverage:

1. **Frontend M1 demo dataset (`frontend/server/investment/demo/m1Data.ts`):** 2 fictional issuers (`IN:SYNTH:AARAV` / `Aarav Systems Limited`, `IN:SYNTH:KAVACH` / `Kavach Bank Limited`), written with `sourceRights: { state: 'SYNTHETIC', basis: '', note: 'synthetic M1 reference dataset' }` -> `DatasetClass = 'SYNTHETIC_REFERENCE'` (`'SYNTHETIC_FIXTURE'` on coverage surfaces).
2. **Platform test fixtures (`iips-platform/tests/investment/fixtures.ts`):** Synthetic test issuers written with `sourceRights.state = 'SYNTHETIC'`.
3. **Sector-engine golden reference payloads (`iips-platform/src/sector-engines/golden-references/*-golden-reference-1.0.0.json`):** 13 frozen synthetic calibration benchmarks (`Banking`, `Insurance`, `Capital Markets`, `Healthcare`, `Hospitality`, `Energy`, `Utilities`, `Consumer`, `Industrials`, `Technology`, `Telecom`, `Auto`, `Materials`).
4. **IPD offline fundamentals fixtures (`ramkivs/iips-production-market-data/src/fundamentals/`):** `LOCAL_FIXTURE_AND_OFFLINE_DEV` fixtures backing `d03_fundamentals.ts` / `ui03_fundamental_analysis.ts`.

### 3.2 Committed Real-Issuer Evidence Datasets in IRR (`evidence/real-issuer/**`)

Across all 21 bundles under `evidence/real-issuer/`, **8 distinct financial dataset builds** exist for **5 Indian listed issuers** (**none** of which appears in the 68-row Dhan portfolio CSV):

| Issuer (`issuerId` / ISIN) | Sector | Bundle(s) | `datasetVersion` (`sha256:...`) | Schema | Disk `sourceRights` -> Class | Annual Periods (`latestPeriodEnd`) | Reported `PRESENT` / `47` (+ `NIL` / `DERIVED`) | Op Metrics | Prices (`asOf` / Source) | `measureCoverage` Stage & Usable Methods | `assessCompany` @ `2026-11-12` |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Infosys Limited** (`IN:INE009A01021` / `INE009A01021`) | `Technology` | `REL-1-INFOSYS-2026-11-06` (`WI1`) | `ca29c835398c...` | `V1` | absent -> `UNKNOWN` | 3: FY22–FY24 (`2024-03-31`) | `33/47` (`0` NIL, `5` derived) | `0` | `0` | `G2_PARTIAL`; `[DCF_FCFF, PE_RELATIVE]`; withheld `EV_EBITDA`, `EV_REVENUE` | `STALE_STATEMENTS` (956d > 200d/250d); DCF blocked (`netDebt`); `PE_RELATIVE` only; `NO_PRICE_OBSERVATION`; `intrinsic: null` |
| **Infosys Limited** (`IN:INE009A01021` / `INE009A01021`) | `Technology` | `WI2-MARKET-PRICE-2026-11-06` | `0ef4299db87b...` | `V1` | absent -> `UNKNOWN` | 3: FY22–FY24 (`2024-03-31`) | `33/47` (`0` NIL, `5` derived) | `0` | `1` (`2026-11-06`, BSE BhavCopy ₹1,180.65) | `G2_PARTIAL`; `[DCF_FCFF, PE_RELATIVE]`; withheld `EV_EBITDA`, `EV_REVENUE` | `STALE_STATEMENTS` (956d); DCF blocked (`netDebt`); `PE_RELATIVE` only; `intrinsic: null` |
| **Infosys Limited** (`IN:INE009A01021` / `INE009A01021`) | `Technology` | `WI3-BORROWINGS-NIL-2026-11-06` (+ `WI11-L003` `V2`, `WI10-L035` `V3`) | `21cf25222c14...` (`WI3`) | `V1` (`WI3`), `V2` (`WI11`), `V3` (`WI10`) | absent -> `UNKNOWN` | 3: FY22–FY24 (`2024-03-31`) | `33/47` (`4` FY24 NIL debt/pref, `5` derived) | `0` | `1` (`2026-11-06`, BSE BhavCopy ₹1,180.65) | `G2_PARTIAL`; `measureCoverage` withholds `EV_EBITDA` (`derive.ts` skips `NIL_BY_DISCLOSURE`) & `EV_REVENUE` | `STALE_STATEMENTS` (956d); `[DCF_FCFF, PE_RELATIVE, EV_EBITDA]` produce `intrinsic` mid `₹1,088.97` (`L-003` policy-zero associates note under V1; bound nil under V3 `WI10`); BSE price ages out after `2026-11-13` |
| **eClerx Services Limited** (`IN:INE738I01010` / `INE738I01010`) | `Technology` | `WI5-PREFERENCE-CAPITAL-2026-11-07` | `7aa6e3f924f5...` | `V1` | absent -> `UNKNOWN` | 3: FY22–FY24 (`2024-03-31`) | `35/47` (`0` NIL, `6` derived) | `0` | `1` (`2026-11-06`, **Yahoo Finance API** ₹2,923.85) | `G2_PARTIAL`; `[DCF_FCFF, PE_RELATIVE, EV_EBITDA]`; withheld `EV_REVENUE` | `STALE_STATEMENTS` (956d); DCF & EV/EBITDA blocked (`RESTRICTED_CASH` / `LEASE_LIABILITIES` -> `netDebt`); `PE_RELATIVE` only; `intrinsic: null` |
| **Zensar Technologies Limited** (`IN:INE520A01027` / `INE520A01027`) | `Technology` | `WI6A-S2-CONSOLIDATED-PAGE-RECOVERY-2026-11-07` | `a71498da7801...` | `V1` | absent -> `UNKNOWN` | 3: FY22–FY24 (`2024-03-31`) | `31–32/47` (`3` NIL borrowings, `4–5` derived; FY22 `CAPITAL_EXPENDITURE` missing) | `0` | `0` | `G2_PARTIAL`; `[DCF_FCFF, PE_RELATIVE]`; withheld `EV_EBITDA`, `EV_REVENUE` | `STALE_STATEMENTS` (956d); DCF inapplicable (missing FY22 `CAPITAL_EXPENDITURE`), EV/EBITDA blocked (`minorityInterest`); `PE_RELATIVE` only; `NO_PRICE_OBSERVATION`; `intrinsic: null` |
| **Marico Limited** (`IN:INE196A01026` / `INE196A01026`) | `Consumer` | `WI7-CONSUMER-MARICO-2026-11-07`, `WI7-L038-DEBT-COMPLETENESS-2026-11-07`, `WI12-L038-...` | `04c96303813d...` (`WI7`), `433358f3cfdc...` (`WI7-L038`) | `V1` | absent -> `UNKNOWN` | 3: FY22–FY24 (`2024-03-31`) | `34–36/47` (`0` NIL, `5–6` derived) | `0` (Consumer requires `0`) | `0` | `G1_ENABLED` in `measureCoverage` (`[DCF_FCFF, PE_RELATIVE, EV_EBITDA]`) | `STALE_STATEMENTS` (956d); **blocked by open `L-038`** (`PREFERENCE_CAPITAL` unreported across FY24–FY26 ARs) + `netDebt`; `PE_RELATIVE` only; `NO_PRICE_OBSERVATION`; `intrinsic: null` |
| **KEC International Limited** (`IN:INE389H01022` / `INE389H01022`) | `Industrials` | `WI8-INDUSTRIALS-KEC-2026-11-07`, `WI12-L039-...` | `0df73ead5a72...` | `V1` | absent -> `UNKNOWN` | 3: FY24–FY26 (`2026-03-31`) | `34/47` (`0` NIL, `6` derived) | `0` | `0` | `G2_PARTIAL`; `[DCF_FCFF, EV_EBITDA]`; withheld `EV_REVENUE` (`IN_BOOK_TO_BILL`) | `STALE_STATEMENTS` (226d > `pnlDays=200`) + `CASH_FLOW_EARNINGS_DIVERGENCE`; **blocked by open `L-039`** (`CURRENT_INVESTMENTS` NSE XBRL `0` at ₹1 cr rounding) -> `netDebt` blocked; `NO_PRICE_OBSERVATION`; `intrinsic: null` |

**Unmeasured sectors in IRR real-issuer datasets (`10 / 13`):** `Banking`, `Insurance`, `Capital Markets`, `Healthcare`, `Hospitality`, `Energy`, `Utilities`, `Telecom`, `Auto`, and `Materials` have **zero** real-issuer financial datasets.

---

## 4. Source Rights, Provenance & Retention Qualification (`B03`)

1. **Governed rights model (`manifest.ts`, `datasetClass.ts`):**
   - `SourceRightsState` admits exactly three values: `SYNTHETIC` -> `DatasetClass = 'SYNTHETIC_REFERENCE'`, `OPERATOR_ASSERTED` (requires non-blank `basis`) -> `DatasetClass = 'OPERATOR_SUPPLIED'`, and `UNKNOWN` (default when `sourceRights` is omitted) -> `DatasetClass = 'UNKNOWN'`.
   - No code path may emit `"approved"` or treat `OPERATOR_ASSERTED` as independent legal verification of third-party terms (`datasetClassStatement('OPERATOR_SUPPLIED')`).
2. **Actual rights state of committed real-issuer datasets:**
   - Every committed `manifest.json` under `evidence/real-issuer/**/dataset/` was generated before PR #548 (`c9115f3`) and has `sourceRights: undefined`, which resolves fail-closed via `sourceRightsOf()` to **`UNKNOWN`**.
   - Filing provenance across the bundles combines:
     - BSE/NSE Ind AS XBRL instance XMLs (`Infosys`, `eClerx`, `Marico`, `KEC`, plus NSE's 404 `.xsd` taxonomy reference in `KEC` FY26 `L-039`);
     - Issuer Integrated Annual Report PDFs manually transcribed into `periods.csv` (`Zensar` `WI6A-S2`, `Infosys` `WI3`/`WI10`/`WI11`, `Marico` `WI7-L038`);
     - BSE BhavCopy CSV (`WI2`/`WI3` Infosys price); and
     - **Yahoo Finance unofficial chart endpoint** (`YAHOO-FINANCE:query1.finance.yahoo.com/v8/finance/chart/ECLERX.NS` in `WI5-PREFERENCE-CAPITAL-2026-11-07/ingest-input/prices.json`).
3. **`B03` blocker determination:**
   - Permissible automated ingestion, local caching/retention, and platform processing terms for NSE/BSE filings, issuer PDFs, and third-party quote endpoints (especially Yahoo Finance) remain **unverified** (`B03` **OPEN**).

---

## 5. Schema, Completeness, Freshness & Limitation Qualification (`B08`)

### 5.1 Line-Item Schema vs Automated XBRL Extraction Gap (`W07` Input)
- `LINE_ITEMS` (`contracts/lineItems.ts`) defines **`53` governed items** (`47` reported + `6` derived-only via `8` `DERIVATIONS` in `fundamentals/derive.ts`).
- `XBRL_TAG_MAP` (`ingestion/xbrl.ts`) maps **`22` Ind AS XBRL tags to `20` unique `LineItemId`s**, leaving **`27` of `47` reported line items unmapped** by automated XBRL ingestion — including equity-bridge critical items (`PREFERENCE_CAPITAL`, `LEASE_LIABILITIES_CURRENT`, `LEASE_LIABILITIES_NON_CURRENT`, `RESTRICTED_CASH`), cash-flow items (`CAPITAL_EXPENDITURE`, `DIVIDENDS_PAID`), `DILUTED_SHARES`, and Banking/Insurance items.

### 5.2 `manifest.completenessPct` Denominator Caveat (`W07` / `W15` Input)
- `completenessOf()` (`fundamentals/manifest.ts:212`, pinned by committed dataset digests) computes `Math.min(100, (presentItems / Math.max(1, annual.length * 20)) * 100)`.
- Because any issuer with `>= 20` non-null items per annual period scores `100%`, **all 5 real-issuer manifests report `completenessPct: 100`** despite missing 11–16 of 47 reported line items and critical bridge inputs. Downstream `W07` and `W15` readiness gates **must not** use `manifest.completenessPct` as a statement-completeness gate; they must read `measureCoverage` and `assessCompany.completeness` / bridge observations.

### 5.3 `deriveLineItems` vs `assessCompany` Nil-Disclosure Divergence (`W07` / `W12` Input)
- `deriveLineItems` (`fundamentals/derive.ts`) requires `presence === 'PRESENT'` (`value !== null`) and skips `NIL_BY_DISCLOSURE` (`value: null`). Consequently, debt-free issuers with explicit nil borrowings (`Infosys` `WI3`, `Zensar` `WI6A-S2`) do not receive a derived `NET_DEBT` line item in `DatasetContent`, causing `measureCoverage` to mark `EV_EBITDA` as withheld even when `assessCompany` (`assessment/enterprise.ts`) consumes `NIL_BY_DISCLOSURE` (and `V3` `nilBinding` from `WI10-L035`) to compute net debt.

### 5.4 Operating Metrics & Sector-Engine Input Gap (`W07` / `W10` Input)
- **`0` of `33` governed `OPERATING_METRICS`** (`contracts/operatingMetrics.ts`) are populated in any real-issuer dataset (`operatingMetricRecords = 0` across all bundles). Note: `Consumer` defines `0` required operating metrics in `SECTOR_METHODS`, so `Consumer` vacuously reports `operatingMetricCoveragePct: 100%` (`G1_ENABLED`) in `measureCoverage` even when `assessCompany` withholds intrinsic value due to `L-038`.
- The 13 `SectorPlugin` engines under `iips-platform/src/sector-engines/*` consume flat pre-aggregated metric snapshots (`TechnologyInputs`, `ConsumerInputs`, etc.) calibrated to synthetic `*-golden-reference-1.0.0.json` files; **no adapter currently binds `DatasetContent` (`NormalizedPeriod` / `OperatingMetricRecord`) to `SectorPlugin` inputs**.

### 5.5 Freshness Qualification as of `2026-11-12` (`freshness-policy/1.0.0`)
- Under `VALUATION_POLICY.freshness` (`pnlDays = 200`, `balanceSheetDays = 250`, `priceMaxAgeDays = 7`):
  - **`Infosys`, `eClerx`, `Zensar`, `Marico`** (`latestPeriodEnd = 2024-03-31`) are **956 days** past period end -> both P&L and Balance Sheet exceed policy windows (`STALE_STATEMENTS`, `quality.verdict = 'MATERIAL_CONCERNS'`), missing FY25 and FY26 annual statements and FY27 interim quarters.
  - **`KEC International`** (`latestPeriodEnd = 2026-03-31`) is **226 days** past period end -> exceeds `pnlDays = 200` (`STALE_STATEMENTS`, `quality.verdict = 'MATERIAL_CONCERNS'`), with **0** quarterly periods (`Q1 FY27` / `Q2 FY27`) ingested.
  - **Market prices:** `0` prices for `Zensar`, `Marico`, and `KEC` (`NO_PRICE_OBSERVATION`); `2026-11-06` prices for `Infosys` and `eClerx` are 6 days old on `2026-11-12` and turn stale after `2026-11-13`.

### 5.6 Open `B08` Limitation Register Status
- **`L-038` (`OPEN` — Marico `PREFERENCE_CAPITAL`):** Across FY2023-24, FY2024-25, and FY2025-26 Integrated Annual Reports (`WI12-L038-PREFERENCE-CAPITAL-2026-11-07`), Note 12(a) discloses authorised preference share capital without an issued/subscribed/paid-up nil row; `PREFERENCE_CAPITAL` remains `MISSING` (`NOT_REPORTED`), withholding enterprise-to-equity per-share valuation.
- **`L-039` (`OPEN` — KEC International `CURRENT_INVESTMENTS` & NSE 2026 `.xsd`):** NSE XBRL reports `CurrentInvestments = 0` at ₹1 crore rounding (`WI12-L039-ROUNDING-ZERO-2026-11-07`), which cannot distinguish exact zero from a non-zero balance `< ₹0.50 crore` without Annual Report Note 10, and NSE's 2026 `.xsd` schema URL returns HTTP 404; `CURRENT_INVESTMENTS` remains `MISSING` (`NOT_REPORTED`), withholding `netDebt`.
- **`L-040` (`RESOLVED` — `2026-11-07`):** Per-share bridge refusal propagation defect corrected and locked by regression suite (`IIPS_V3_IID_L040_VALUATION_OUTPUT_CORRECTION_2026-11-07.md`).

---

## 6. Reproducible IRR Code Defects Remediated in W05

During W05 qualification audit of IRR's coverage pipeline, two reproducible code defects were identified and fixed narrowly in IRR:

1. **`W05-D1` — Coverage surfaces bypassed `DatasetManifest.sourceRights` and inferred `datasetClass` from `provider`/`licence` strings:**
   - **Defect:** `financialClass()` in `iips-platform/src/investment/coverage/investmentCoverage.ts` and `iips-platform/src/investment/identity/coverage.ts` matched `/synthetic|test-fixture|fixture/i` against `${manifest.provider} ${manifest.licence}` instead of calling `classifyDataset(manifest)`. Consequently:
     - every pre-W05 dataset with `sourceRights: undefined` (including all committed `evidence/real-issuer/**/dataset` bundles where `provider = "operator-file-input"`) was silently upgraded from `UNKNOWN` to `OPERATOR_SUPPLIED`;
     - a `SYNTHETIC` dataset whose `provider`/`licence` lacked those keywords was misclassified as `OPERATOR_SUPPLIED`;
     - malformed `sourceRights` (`OPERATOR_ASSERTED` with blank `basis` or forged states such as `APPROVED_LOCAL_INGESTION`) bypassed `assertSourceRights()`.
   - **Fix:** Wired both `investmentCoverage.ts` and `identity/coverage.ts` directly to `classifyDataset(manifest)` (`SYNTHETIC_REFERENCE -> 'SYNTHETIC_FIXTURE'`, `OPERATOR_SUPPLIED -> 'OPERATOR_SUPPLIED'`, `UNKNOWN -> 'UNKNOWN'`), exposed `dataset.sourceRights` and `datasetClassStatement(...)` disclosure notes on `InvestmentCoverageReport` and `InvestmentCoveragePage.tsx`, and preserved fail-closed 503 (`INVESTMENT_DATASET_UNREADABLE`) on `/api/investment/coverage/investment` and `'NONE'` fallback on `financialCoverageFromLocalDataset` when a manifest's `sourceRights` is malformed.
2. **`W05-D2` — Quarterly period undercount (`'QUARTERLY'` vs governed `'QUARTER'`):**
   - **Defect:** `investmentCoverage.ts` filtered issuer quarterly periods with `periodTypeOf(period) === 'QUARTERLY'`, whereas the governed `PeriodType` in `contracts/period.ts` and `manifest.ts` is `'QUARTER'`, causing quarterly periods to count as `0` and quarterly-only issuers to be misclassified as `NO_FINANCIALS`.
   - **Fix:** Updated `investmentCoverage.ts` to count governed `'QUARTER'` periods (while retaining compatibility with legacy `'QUARTERLY'` test stubs).

---

## 7. Downstream Gate & Handoff Matrix (`W07`, `W10`, `W12`, `W15`, `W20`)

| Downstream Workstream / Gate | W05 Handoff Inputs & Blocking Conditions |
|---|---|
| **`W07` — Statement & metric completeness** | Must measure portfolio holdings against the 47 reported + 6 derived line items and 33 sector operating metrics (currently `0/65` Dhan holdings covered; `27/47` reported line items unmapped in `XBRL_TAG_MAP`; `0/33` operating metrics populated; `derive.ts` skips `NIL_BY_DISCLOSURE`; do **not** use `manifest.completenessPct`). |
| **`W10` — Sector engine live eligibility** | `10/13` sectors have `0` real-issuer datasets; the 13 `SectorPlugin` engines in `src/sector-engines/*` lack a governed adapter from `DatasetContent` (`NormalizedPeriod` / `OperatingMetricRecord`) and remain calibrated only to synthetic golden references. |
| **`W12` — Valuation & fundamental analysis readiness** | `5/5` existing real-issuer datasets fail `freshness-policy/1.0.0` (`STALE_STATEMENTS`) on `2026-11-12`; `L-038` (`Marico`) and `L-039` (`KEC`) remain **OPEN** (`B08`); `4/5` real issuers produce `intrinsic: null`, and `Infosys` `WI3` relies on `L-003` policy-zero associates under V1 (or manual V3 `nilBinding` under `WI10-L035`) with FY24 statements 956 days old. |
| **`W15` — Live coverage & readiness surface** | `/api/investment/coverage/investment` and `/api/investment/coverage/identity` now truthfully surface `SYNTHETIC_FIXTURE`, `OPERATOR_SUPPLIED`, `UNKNOWN`, and `NONE` from `DatasetManifest.sourceRights`, preventing `UNKNOWN` or `SYNTHETIC` datasets from inflating operator-supplied financial coverage. |
| **`θF` & `W20` — Current-portfolio live acceptance** | **Remain `UNESTABLISHED` / `BLOCKED`:** requires resolving `B02` (actual Windows portfolio & dataset dir observation), `B03` (documented source rights & retention terms), `B08` (`L-038`, `L-039`), and ingesting non-stale FY26 + interim FY27 statements, operating metrics, and live prices (`D05`/`B06`) for actual portfolio holdings. |

---

## 8. Reproducible Verification Commands

```bash
# 1. Platform IID + W05 source-rights unit & real-issuer regression suite (823 tests) + TypeScript check
PATH="$PWD/frontend/node_modules/.bin:$PATH" npm --prefix iips-platform run test:iid
PATH="$PWD/frontend/node_modules/.bin:$PATH" tsc --noEmit -p iips-platform/tsconfig.json

# 2. Frontend + investment-server + replay-server typechecks, full Vitest suite, build, and separation probe
npm --prefix frontend run typecheck
npm --prefix frontend run typecheck:investment-server
npm --prefix frontend run typecheck:replay-server
npm --prefix frontend test
npm --prefix frontend run build
npx --prefix frontend tsx frontend/scripts/iid-coverage-separation-probe.mts
```
