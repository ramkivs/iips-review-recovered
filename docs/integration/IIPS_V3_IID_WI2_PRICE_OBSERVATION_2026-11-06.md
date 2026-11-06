# IIPS v3.0 — Work Item 2: Infosys market-price observation (2026-11-06)

**Authority:** IRR (this repository) only · **Baseline:** `main` @ `41c4498` (post-D-3) · **No IPD implementation
change, no new provider, no second issuer, no sector expansion.**

**Outcome, stated before the argument:**

| Question | Answer |
|---|---|
| Is an authoritative price observation obtained? | **Yes** — BSE end-of-day close, trade date 2026-11-06, ₹1,180.65, source file and row quoted verbatim |
| Is it accepted by the dataset contract? | **Yes** — `issues.json = []`, `coverage.prices = 1`, record round-trips |
| Is it accepted by the assessment's alignment rule? | **Yes** — `price.presence = PRESENT`, `priceAsOf = 2026-11-06`, no refusal code fires |
| Is the valuation computable? | **No** — `valuation.intrinsic` is still `null`; gross/net debt stay `NOT_REPORTED` |
| Is the margin of safety computable? | **No** — refusal moves `NO_PRICE_OBSERVATION` → `INTRINSIC_WITHHELD` |
| Verdict published? | **None.** A completed valuation was never an acceptance criterion for this item |

Evidence: `evidence/real-issuer/WI2-PRICE-OBSERVATION-2026-11-06/` (README, `source/`, `dataset/`, `artifact/`,
`runs/`, `digests.json`). Register impact: §16 below, entries `L-030` … `L-033`.

---

## 1. The contract the observation had to satisfy

The price is not free-form data; it enters through `PriceRecord` (dataset schema v1) and is consumed by exactly one
place in the assessment — `valuation.marginOfSafety`, via `selectPrice()` in
`iips-platform/src/investment/assessment/margin.ts`. Design §R-6 fixes both the record shape and the alignment rule:

| Requirement | Where it is enforced |
|---|---|
| `PriceRecord { securityId, value, currency, asOf, kind: CLOSE\|VWAP\|LAST, source: PIT_D01\|DATASET_EOD, sourceRef, adjustment }` | `fundamentals/types.ts`; `ingestion/builder.ts` refuses an unknown security |
| `knownAsOf ≤ price.asOf ≤ generatedAt` | `selectPrice()`; violation → `PRICE_PREDATES_KNOWLEDGE_CUTOFF` |
| price no older than the freshness window | `selectPrice()` → `PRICE_OUTSIDE_POLICY_WINDOW` |
| no unadjusted price across a per-share-affecting action | `selectPrice()` → `UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION` |
| no substitution of any kind (yesterday's close, another listing, indicative quote) | `selectPrice()` refuses rather than substitutes; no fallback path exists |
| the price is part of the dataset identity | `contentDigest` covers `prices` (design §R-7) |
| the stored assessment records the price it used | payload carries `price`, `priceAsOf`, `price.source.ref` |

All four refusals plus the no-price case are pinned by `iips-platform/tests/investment/assessment-price.test.ts`
(10 tests). **Nothing in this work item changed the contract**; the observation was shaped to fit it, not the other
way round.

## 2. Which date is the correct observation date

This is the question the work item turns on, and the answer is not "the statement date".

The margin of safety is defined as a **contemporary** comparison: the intrinsic value derived from the last filed
statements against the price observable now. The contract encodes that by admitting only
`knownAsOf ≤ price.asOf ≤ generatedAt`. Two consequences:

1. **A FY2024 price is inadmissible.** Any close from the statement period predates the dataset's knowledge cutoff and
   is refused by name (`PRICE_PREDATES_KNOWLEDGE_CUTOFF`); a close older than seven days is refused as stale
   (`PRICE_OUTSIDE_POLICY_WINDOW`). Back-dating the observation to "match" the statements would not be a stricter
   reading of the contract — it would be a refusal the engine is designed to produce. The age of the statements is a
   separate, already-published fact (`asOf.staleBeyondPolicy = true`, 950 days, confidence capped).
2. **The knowledge cutoff has to be at or after the observation.** Work Item 1 declared
   `knownAsOf = 2026-11-06T00:00:00.000Z`. The 2026-11-06 session's close is published after the session ends, so a
   dataset that contains it cannot claim to have known only until 00:00Z that day. This dataset therefore declares
   `knownAsOf = 2026-11-06T13:45:00.000Z` — after the retrieval interval, before the run. Same date, so staleness
   day-counts are identical; only the instant moved, and it moved *later*, which is the conservative direction for a
   look-ahead test.

So the correct observation is the **most recent completed session as of the run**, and that is what was taken. The
price is dated the same day as the run, which is what a contemporary margin of safety requires — not a current quote
retro-fitted onto a historical question, and not a historical price stretched over a stale window.

## 3. Which source, and why that one

| Candidate | Verdict |
|---|---|
| **BSE end-of-day bhavcopy** `BhavCopy_BSE_CM_0_0_0_20261106_F_0000.CSV` | **used.** Exchange-published, full-file, reproducible row; `ClsPric` = ₹1,180.65; the BSE listing is the one identity resolution binds for this issuer (`IN:BSE:500209:EQ:EQUITY`) |
| NSE archive `sec_bhavdata_full_06112026.csv` | HTTP 500 from this environment — no row obtained |
| NSE quote API `quote-equity?symbol=INFY` | HTTP 500 from this environment — no quote obtained |
| an indicative / delayed quote, a cached price, another instrument, a stale close | **disqualified by the work item and by the contract**; none was used |

Because NSE is the deeper book and the first listing in the roster, the absence of an NSE row is a real loss of
corroboration and is recorded as such (`L-030`), not papered over. The BSE row is quoted **byte-for-byte** with its
header and its neighbouring rows as position anchors (`source/`), so a reader can re-fetch the file, locate the same
row by scrip code and confirm the digests — the extraction is reproducible, not re-typed.

## 4. What the run produced

| | Baseline (Work Item 1 inputs + D-3 code) | This work item |
|---|---|---|
| dataset version | `sha256:ca29c835…c6d71e` | `sha256:0ef4299d…204d0579` |
| prices | 0 | 1 |
| payload digest | `8e23f025527e…` (45,129 B) | `06be8f6680ec…` (45,302 B) |
| `valuation.marginOfSafety.price` | `MISSING / PRICE_UNAVAILABLE` | `PRESENT / 1180.65 / 2026-11-06` |
| `valuation.marginOfSafety.refusal` | `NO_PRICE_OBSERVATION` | `INTRINSIC_WITHHELD` |
| `valuation.intrinsic` | `null` | `null` (**unchanged**) |
| risk aggregate / evaluation | `NOT_COMPUTABLE / RISK_EVALUATION_PARTIAL`; `PARTIAL / INDETERMINATE` | identical |
| adequacy / quality / confidence | `SUFFICIENT` / `MATERIAL_CONCERNS` / `0.4939` | identical |
| borrowings (3 components) | `NOT_REPORTED` | identical |
| lease liabilities | `PRESENT`, ₹8,359 crore, `AS_FILED` | identical |
| gross / net debt | `NOT_REPORTED` | identical |

The baseline row was not copied from prose: it was **regenerated** on this branch from the committed Work Item 1
inputs and reproduced `8e23f025527e…` exactly (`runs/04-baseline-d3-reconstruction.json`). Against that baseline a
path-by-path comparison of the two payloads finds **13 differences**, every one of them attributable:

- 3 run-clock members (`artifact.generatedAt`, `asOf.generatedAt`, `asOf.knownAsOf`);
- 2 dataset-identity members (`data.contentDigest`, `data.datasetVersion`) — the price is inside the digest by design;
- 8 members inside `valuation.marginOfSafety` (the price block and the refusal code).

No other member of the payload moved (`artifact/payload-diff-vs-d3-baseline.json`, and
`frontend/server/investment/cli/wi2PriceObservation.test.ts` asserts the same invariant).

## 5. What is now blocked, and by what

| Open blocker | Why it is still open | Owner |
|---|---|---|
| `intrinsic` withheld | capital structure incomplete: the FY2024 consolidated statements print no borrowings line, so the three borrowings components are `NOT_REPORTED` and gross/net debt cannot be derived | D-2 (nil representation) — deliberately not touched here |
| margin of safety | needs an intrinsic range as well as a price | follows from the row above |
| `DCF_FCFF`, `EV_EBITDA`, `EV_REVENUE` | the same capital-structure gap | valuation methods — unchanged |
| leverage risk dimension | `NOT_EVALUABLE` on `fundamentals.capitalStructure.netDebt` | D-3 vocabulary — reported, not corrected |
| statement staleness | 950 days past period end; `staleBeyondPolicy`, confidence capped | freshness policy |
| corporate-action status | the dataset's corporate-action table is **empty**, so "unadjusted" is a statement about the dataset, not about the issuer's action history | `L-031` |
| second-source corroboration | NSE unreachable; one exchange only | `L-030` |

## 6. Verification performed

| Check | Result |
|---|---|
| `npx tsx --test tests/investment/assessment-price.test.ts` (platform) | **10 passed** — all four alignment refusals and the no-price case |
| `npx vitest run server/investment/cli/wi2PriceObservation.test.ts` (frontend) | **6 passed** — ingest shape, engine acceptance, unchanged risk blocks, "price moves nothing else" |
| `npx vitest run server/investment/cli/realIssuerValidation.test.ts server/investment/cli/generate-investment-artifacts.test.ts` | **14 passed** — the Work Item 1 regression and the artifact CLI path |
| `npx tsc --noEmit` (platform) · `npm run typecheck:investment-server` (frontend) | clean |
| payload re-read through the service | `sha256` = chain head `payloadDigest` (`06be8f6680ec…`) |
| determinism | identical run into a second, empty store produced identical steps and digests |
| source internal consistency | 5/5 (range, last-price agreement, implied VWAP, day-move sanity, identity match) |

Not performed, and not claimed: cross-feed (NSE/BSE) agreement; independent recomputation of the close from a second
vendor; corporate-action history verification; any historical back-test of the margin.

## 7. What this work item does not do

- It does not change a formula, threshold, weight, confidence cap, risk policy, dataset schema, or limitation status.
- It does not implement a market-data provider, a scheduled refresh, or PIT-backed prices (`source: DATASET_EOD`).
- It does not touch IPD, does not add a provider, issuer or sector, and does not persist anything to the shared store.
- It does not rewrite Work Item 1, D-2 or D-3 evidence, and does not claim production readiness, real-dataset coverage
  beyond one issuer, or a valuation of Infosys.

## 8. Register impact

Section 16 of `IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md` adds `L-030` (single-exchange observation,
no second feed), `L-031` (empty corporate-action table makes adjustment status a dataset claim), `L-032` (the
alignment rule makes the price contemporary with the run, so no historical margin can be produced) and `L-033`
(`mos-policy` freshness window: design §R-6.4 says five trading days, the implementation uses seven calendar days —
recorded, not changed). **No existing entry is closed, renumbered, softened or re-statused.**
