# IID Stage 4 — S4-R3 filing-refresh evidence

**Date:** 2026-11-14 (UTC)  
**Branch:** `arena/53ff9276-iips-review-recovered`  
**Classification:** LOCAL_SINGLE_USER_NON_PRODUCTION — repository-side candidate measurement  
**Design record:** `IID-STAGE4-S4-R3-REFRESH-DESIGN-2026-11-14.md`  
**Evidence bundle:** `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/`

> This record measures an additive candidate refresh. It does not install it on the operator host, does not admit it under O3 by implication, and does not claim that staleness is closed.

## 1. What was built

The candidate supplies the original Infosys input plus complete refreshed Marico and KEC input directories. The refreshed directories copy the admitted rosters byte-for-byte and retain the admitted historical periods; they add only supported new periods.

| Issuer | Added periods | Source actually used | Not added |
|---|---|---|---|
| Infosys | none | no committed source newer than FY2024 | FY2025/FY2026 remain absent; S4-R3 open for Infosys |
| Marico | FY2025, FY2026 annual | committed verbatim extracts from L-038 runs/02 and runs/03 | no PDF fetch; no preference-capital nil |
| KEC | Q1 FY27, Q2 FY27 discrete quarters | Q1 printed P&L from L-039 decisive-report §D; Q2 `OneD` P&L from committed September XBRL and printed §E balance sheet cross-checked against `OneI` | Q1 balance sheet/cash flow; Q2 discrete cash flow; unsupported debt/lease/investment fields |

Candidate input digests recorded by the real ingestion CLI:

| Input | `inputDigest` |
|---|---|
| `REL-1-INFOSYS-2026-11-06/ingest-input` | `sha256:da0253c8813952a2bfef281b253147a585385dd873be3d9b77a1a8f0662c300c` |
| `S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico` | `sha256:31d8e5039c502cae98e9c68f6d8fb47aaec44712f81c7005f5f9b8bd4d09c63d` |
| `S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec` | `sha256:22ea501869731e52f734c765f933cce2637c7c6c00f2d9ada7d741b5b44c181a` |

## 2. Candidate dataset measurement

Built through the real CLI into a temporary root, with the admitted identity set published into that same temporary root. No host artefact was touched.

```text
datasetVersion sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b
contentDigest  sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b
issuers        3
periods        13 total = 11 ANNUAL + 2 QUARTER
issues         0
sectors        3/13 measured; 10 outstanding named
coverage       Consumer G1_ENABLED, Industrials G2_PARTIAL, Technology G2_PARTIAL
usable methods 7; withheld methods 31; every withheld slot carries a reason
```

The historical admitted inputs still reproduce the Stage 3 host pin:

```text
sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83
```

The candidate digest is different because the content is different. That is not a Stage 3 verification failure; it is a new candidate requiring separate operator acceptance/installation.

## 3. Coverage read-path defect found and fixed

The first candidate build exposed a real read-path token defect:

- the manifest correctly counted `quarterlyPeriods: 2` because `manifest.ts` compares against the contract token `QUARTER`;
- `investmentCoverage.ts` compared against `QUARTERLY`, which is not a `PeriodType`, so every issuer row reported `quarterlyPeriods: 0`.

The fix is confined to the coverage read-path comparison and a regression test. After the fix:

| Surface | KEC quarterly count |
|---|---:|
| candidate manifest / dataset summary | 2 |
| investment-coverage issuer row | 2 |
| served `/api/investment/coverage/investment` body | 2 |
| assessment `data.series.quarterlyPeriods` | 2 |

No ingestion, assessment, freshness, valuation, required-field, capital-structure, XBRL-tag-map, or identity-resolver rule was changed.

## 4. Freshness measurement at as-of 2026-11-14

The existing engine derives freshness from the latest **annual** period only. The 200-day P&L window requires an annual period end on or after 2026-04-28. No committed source provides that for any of the three issuers.

| Issuer | Latest annual used | Staleness days | `STALE_STATEMENTS` | `STALE_DATA` cap | Quarterly periods in assessment series |
|---|---|---:|---|---|---:|
| Infosys | 2024-03-31 | 958 | raised | present | 0 |
| Marico | 2026-03-31 | 228 | raised | present | 0 |
| KEC | 2026-03-31 | 228 | raised | present | 2 |

All three remain `MATERIAL_CONCERNS` and `SUFFICIENT` with 100% required-field coverage on the annual series. KEC also retains its pre-existing annual `CASH_FLOW_EARNINGS_DIVERGENCE` flag. The refresh therefore does **not** close the freshness limb of S4-R3.

## 5. Source-to-dataset verification

Bundle: `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/`.

- 6 verbatim page excerpts are digested in `source/page-map.json` and verified as exact blocks of their committed origin reports.
- The September XBRL selection records compressed sha256 `ba9e6c15fca2f17bf10a7cf332044d04e95b000c5da0a7ef3ae85c2838b27ae7` (6,830 B) and raw sha256 `59dd7e3bef485535eaec3db6ded52421088662469ba6bcecd315857073eda10c` (73,996 B), with contexts `OneD`, `OneI`, `FourD`.
- 105 new populated CSV cells were checked against the extraction map: 100 reported values and 5 operator sums; 15 explicit not-reported reasons are recorded.
- Every XBRL-backed cell was checked against the raw fact and the crore conversion; per-share facts were not scaled.
- Every derived value on the four new periods recomputes from its own reported inputs via `deriveLineItems`.
- Six hand checks are recorded in `runs/04-derived-handchecks.json`, including Marico FY2026 EBITDA 2,532 crore and KEC Q2 FY27 EBITDA 284.55 crore; 0 mismatches.

### 5.1 Differences preserved rather than smoothed over

1. **Marico FY2025 as-filed vs FY2026 comparative.** FY2025 total assets are 8,338 crore in the FY2025 report and 8,332 crore in the FY2026 comparative; the trade-payable sums are 1,363 vs 1,306. The candidate keeps FY2025 as filed and records the comparative difference. No restatement cause is inferred.
2. **KEC Q2 PPE aggregation.** The printed balance sheet separates PPE 1,270.63 crore and right-of-use assets 310.32 crore. The XBRL `PropertyPlantAndEquipment@OneI` fact is 1,580.95 crore. The candidate uses the printed PPE split and records the aggregation difference.
3. **KEC Q2 cash-flow duration.** The committed cash-flow facts are `FourD` (2026-04-01 to 2026-09-30), i.e. half-year YTD. They are retained as source evidence but not assigned to the discrete Q2 period.
4. **L-039 machine zero.** `CurrentInvestments@OneI = 0` remains raw evidence only. It is not ingested as a disclosed zero.

## 6. Gates run

Exact tails are in `runs/05-gates.txt` and the bundle run logs.

| Gate | Result |
|---|---|
| Platform typecheck | exit 0 |
| Platform IID suite | **1163 tests / 257 suites / 0 fail** |
| Platform full suite | **678 tests / 678 pass / 0 fail** after read-only fetch of the missing A13 baseline commit `5ca181c7…` |
| IID-0 constraints | **6 / 6 / 0 fail** |
| New refresh suite | **20 tests / 5 suites / 0 fail** |
| Coverage + refresh targeted final | **30 tests / 6 suites / 0 fail** |
| Frontend typecheck | exit 0 |
| Frontend full suite | **2949 passed \| 1 skipped (2950), 202 files passed \| 1 skipped (203)** |
| Hygiene | `git diff --check` exit 0; probe compiles; bundle JSON parses; bundle digests verify 26 files / 0 mismatches |

The frontend suite’s known zero-socket evidence side effect was restored with `git checkout --` and verified absent from `git status`. The PowerShell conformance and document-evidence validators named in the prior Stage 4 record are not present in the current tree or in `f98732e`; no pass is claimed for them here.

## 7. Boundaries

- No historical evidence bundle was modified.
- No host dataset was reinstalled or repaired; no host identity publication was repeated.
- No NP-04 assessment artefact was minted or persisted; `runs/candidate-assessments-readonly.json` is a read-only measurement.
- No operating metric, price, corporate action, or source observation was fabricated.
- `L-041` and `L-042` remain open. The verified chain is committed extract/XBRL → transcription → dataset → derivation, not independent PDF/source-rights verification.
- Overall IID readiness remains **NOT READY**; D2–D6 are untouched.
