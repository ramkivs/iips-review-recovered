# `S4-R6` / `G-4` — operating metrics: requirement matrix, census and capability probes (2026-11-18)

**Item:** `S4-R6` (`G-4`) of `docs/integration/IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md`.
**Record:** `docs/integration/IID-S4-R6-OPERATING-METRICS-2026-11-18.md`.
**Baseline commit:** `f1bd346c22ff7e9ad44f83b097f4bcbf5d7b196e` (the merge of PR #590 / `S4-R5`).
**Authority:** IRR only. No issuer admitted, no dataset built, no source fetched, no metric entered, no host touched.

## What was run

All three artefacts are produced by the **shipped** path — `parseOperatingMetricsCsv` for ingestion, `measureCoverage`
for measurement, `assessCompany` for the assessment limb — never by a re-implementation.

| Run | Produces | Input |
|---|---|---|
| requirement-matrix | `runs/metric-requirement-matrix.json` | `SECTOR_METHODS` + `OPERATING_METRICS` read directly |
| census | `runs/metric-census.json` | the two served datasets, re-ingested from their committed ingest inputs at clock `2026-11-18T00:00:00Z` |
| capability probes | `runs/capability-probes.json` | the committed **synthetic** fixture, with only the operating-metric CSV replaced |

### `runs/metric-requirement-matrix.json`

The 38 declared slots, split into **14** metric-gated and **24** statement-only (derived from the matrix, not assumed
from the aggregate), each gated slot carrying its declared metric ids, and — per metric — the label, unit, range,
`minimumSourceClass` and definition text. Also records the 24 metric ids required of the 33 in the vocabulary and the
nine that no method requires.

### `runs/metric-census.json`

Per dataset: `datasetVersion`, `operatingMetricRecords`, the metric source classes present, any metric-related ingestion
issues, the issuers and their sectors, and every metric-gated slot with `sectorHasIssuer`, the sector `stage`, the
sector `operatingMetricCoveragePct`, and the method's `state` / `reason` / `missing`.

Both datasets: **0 operating-metric records**, three issuers in three sectors (Consumer, Industrials, Technology), and
**two** live metric-gated slots — Technology `EV_REVENUE` (`WITHHELD`, `MANDATORY_METRIC_MISSING`,
`[TM_NRR, TM_RECURRING_REVENUE_PCT]`) and Industrials `EV_REVENUE` (`WITHHELD`, `MANDATORY_METRIC_MISSING`,
`[IN_BOOK_TO_BILL]`). The other twelve are `UNMEASURED` for want of an admitted issuer.

### `runs/capability-probes.json`

Twelve single-variable probes on `Hospitality / EV_EBITDA` (declares `HM_REVPAR` only), plus three `layerProbes` that put
the coverage verdict and the assessment verdict side by side:

| Probe | Coverage result |
|---|---|
| `P1-valid` | `AVAILABLE`; record `VALID`, `PRESENT`, `6407` |
| `P2-absent` | `WITHHELD`, `MANDATORY_METRIC_MISSING` `[HM_REVPAR]` |
| `P3-missing-value` | `METRIC_UNVALIDATED`; record `UNVALIDATED`, `MISSING`, `null` |
| `P4-wrong-unit` | `METRIC_UNVALIDATED` (`UNIT_MISMATCH`) |
| `P5-out-of-range` | `METRIC_UNVALIDATED` (`OUT_OF_RANGE`) |
| `P6-no-source-ref` | row rejected `ERROR/SOURCE_REF_REQUIRED`; `MANDATORY_METRIC_MISSING` |
| `P7-unknown-metric` | row rejected `ERROR/UNKNOWN_METRIC`; `MANDATORY_METRIC_MISSING` |
| `P8-period-not-in-dataset` | record `VALID` but `WARNING/METRIC_PERIOD_NOT_IN_DATASET`; gates nothing |
| `P9-conflict` | both retained `CONFLICT`/`null`; `ERROR/OPERATING_METRIC_CONFLICT`; `METRIC_UNVALIDATED` |
| `P10-cross-field` | three implicated metrics `UNVALIDATED`; `ERROR/OPERATING_METRIC_CROSS_FIELD` |
| `P11-wrong-sector-metric` | `TM_NRR` on a Hospitality issuer accepted `VALID`, no issue, permanently inert — recorded gap |
| `P12-vendor-observation` | `VENDOR` accepted `VALID`; coverage `AVAILABLE`; assessment refuses (see `layerProbes`) |

`layerProbes` — same synthetic observation, two layers: coverage `AVAILABLE` for all three source classes, while the
assessment returns `INSUFFICIENT_HISTORY` for `OPERATOR_ENTERED` / `COMPUTED_FROM_STATEMENTS` and
`MANDATORY_METRIC_MISSING: HM_REVPAR (source class too weak)` for `VENDOR`. That is `S4-R4`'s D4, demonstrated.

## Where the tests live

`iips-platform/tests/investment/s4r6-operating-metric-gating.test.ts` — **25 tests** that pin the matrix derivation
(the 14 slots and the nine ids no method requires), the all-or-nothing gating, every rejection class, period alignment,
cross-field quarantine narrowness, issuer neutrality with a previously unseen issuer, the below-floor `VENDOR` case at
both layers, and the inert wrong-sector metric.

## What this bundle is not

It is not a dataset, not a candidate metric file, and not an admission of any source. Every value in it belongs to a
synthetic fixture issuer. The absence of a source-backed metric here is a statement about **this repository's
evidence**, not about what the issuers have published. `G-4` remains **OPEN**; the owner decision between admitting
metrics and recording a withholding disposition is **not taken** in this record.
