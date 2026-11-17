# IID Stage 4 — S4-R3 filing-refresh design and authority boundary

**Date:** 2026-11-14 (UTC)  
**Branch:** `arena/53ff9276-iips-review-recovered`  
**Status at design time:** implementation authorised only as an additive, repository-side candidate refresh; no host installation or admission decision is implied.

## 1. Purpose

S4-R3 asks for quarterly periods or newer annual filings. This change supplies the newer filings that are actually supported by bytes already committed in this repository, measures their effect through the existing ingestion and assessment code, and leaves every unsupported field missing with a reason.

It does **not** change the assessment engine, freshness policy, valuation policy, required-field set, capital-structure rules, XBRL tag map, identity resolver, or any historical evidence bundle.

## 2. Source-availability decision

| Issuer | New source supported by committed bytes | Candidate addition | Limit |
|---|---|---|---|
| Infosys | None. Every committed CSV/extract stops at FY2024. | None | S4-R3 remains open for Infosys; no FY2025/FY2026 figure is inferred. |
| Marico | FY2025 and FY2026 annual-report page extracts in `WI12-L038-PREFERENCE-CAPITAL-2026-11-08/runs/02` and `runs/03`. | Two annual periods, 2025-03-31 and 2026-03-31. | The PDFs themselves are not committed; verification is committed-extract → transcription → dataset → derivation. |
| KEC | Q1 FY27 printed P&L in `WI12-L039-CURRENT-INVESTMENTS-2026-11-05/runs/decisive-report.txt` §D; Q2 FY27 printed balance sheet in §E and the committed September consolidated XBRL instance. | Two discrete quarterly periods, 2026-06-30 and 2026-09-30. | Q1 has no balance sheet or cash-flow statement in the committed extract. Q2 cash-flow facts are half-year YTD, not discrete-quarter facts, and are not assigned to the quarter. |

## 3. Input shape and historical preservation

The existing multi-input merger refuses two bundles that claim the same issuer. Therefore the refresh is a new evidence bundle containing **complete replacement input directories** for Marico and KEC:

- each roster is a byte-for-byte copy of the admitted roster;
- each periods CSV retains the admitted historical periods and adds only the supported new periods;
- a candidate build supplies the original Infosys input plus the refreshed Marico and KEC inputs, once each;
- the original WI7/WI8 inputs remain untouched and remain the inputs that reproduce the historical host digest.

The historical host pin remains:

`sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`

The candidate will have a different `datasetVersion`. That is expected content change, not a failed Stage 3 verification. Installing it over the host dataset is a separate operator acceptance act and is not performed here.

### 3.1 Read-path token defect found while measuring the candidate

The first candidate build exposed a separate coverage read-path defect: the dataset manifest correctly counted two `QUARTER` periods, but `investmentCoverage.ts` compared the contract token against the non-contract string `QUARTERLY`, so every issuer row reported `quarterlyPeriods: 0`. The fix is confined to that read-path comparison and a regression test using the actual `PeriodType` contract. It does not change ingestion, assessment, freshness, or valuation policy.

## 4. Transcription rules

1. Numbers are transcribed in the filing's printed scale (`CRORE`); per-share values are never scaled.
2. A blank cell means `NOT_REPORTED`. A dash, an omitted caption, a template zero, and an express nil are not interchangeable.
3. Marico trade-payable and lease totals may be operator sums of two printed components only when both components are present; the sum and its locators are recorded. They are not passed off as a single printed caption.
4. Marico FY2025 is taken from the FY2025 report's current column. The FY2026 report's FY2025 comparative is a cross-check, not an overwrite. Observed comparative differences are disclosed.
5. KEC Q2 P&L uses the XBRL `OneD` context (2026-07-01 through 2026-09-30); balance-sheet items use `OneI` (2026-09-30) and are cross-checked against the printed balance sheet. `FourD` is half-year YTD and is not used for discrete-quarter P&L or cash flow.
6. KEC's printed PPE caption excludes the separately printed right-of-use asset. The XBRL `PropertyPlantAndEquipment` fact includes that amount. The candidate uses the printed balance-sheet PPE value and records the XBRL aggregation difference.
7. KEC current investments, lease liabilities, and current maturities of long-term debt remain `NOT_REPORTED` where the committed source does not support a governed value. In particular, the L-039 `CurrentInvestments = 0` machine fact is not promoted to a disclosed zero.
8. No operating metric, price, corporate action, identity observation, or assessment-store artifact is created.

## 5. Freshness consequence, stated before measurement

At as-of 2026-11-14 the existing engine derives statement freshness from the latest **annual** period only. The 200-day P&L window requires an annual period end on or after 2026-04-28. None of the three issuers has such a filing in the committed sources.

Expected result:

- Infosys: 958 days, unchanged;
- Marico: 958 → 228 days, still outside the 200-day window;
- KEC: 228 days for assessment freshness, unchanged, while quarterly period coverage becomes non-zero.

Therefore this refresh cannot honestly claim that `STALE_STATEMENTS` or `STALE_DATA` is lifted. Closing that limb would require a newer annual filing or an engine/policy decision outside this change's authority.

## 6. Acceptance checks for the implementation

- committed source excerpts and XBRL facts verify by digest and locator;
- every populated new CSV cell has a recorded value, printed form or XBRL fact, and locator;
- historical rosters are byte-identical and historical parsed periods are unchanged;
- the real ingestion CLI builds one candidate dataset with 3 issuers, 11 annual periods, 2 quarterly periods, 3 measured sectors, and 0 ingestion issues;
- every derived value recomputes from its own inputs; unsupported fields remain missing;
- the real assessment code reports the freshness result in §5 and does not lift staleness;
- the historical host dataset pin still reproduces from the original admitted inputs;
- targeted and full platform/IID gates, typecheck, frontend gates, and existing conformance/evidence validators are run where available;
- a new evidence record states the measured candidate digest, counts, freshness, source checks, and the separate host-acceptance boundary.
