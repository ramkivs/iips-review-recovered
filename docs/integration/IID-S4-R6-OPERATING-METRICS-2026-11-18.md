# IID Stage 4 — `S4-R6` / `G-4`: operating metrics — requirement matrix, capability evidence, and the outstanding owner decision

**Date:** 2026-11-18 · **Authority:** IRR only (this repository) · **Item:** `S4-R6` (`G-4`), Stage 4
**Baseline commit:** `f1bd346c22ff7e9ad44f83b097f4bcbf5d7b196e` (`main`, the merge of PR #590 = `S4-R5`), worktree clean
**Register:** `IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md` row `S4-R6` + addendum at the foot of that document;
tracker `§16.297` (`CV-CORR-262`, `CHG-2026-11-06-25`, `V2190`–`V2196`)
**Evidence:** `evidence/real-issuer/S4-R6-OPERATING-METRICS-2026-11-18/` — `runs/metric-requirement-matrix.json`,
`runs/metric-census.json`, `runs/capability-probes.json`
**Tests:** `iips-platform/tests/investment/s4r6-operating-metric-gating.test.ts` (**25** tests, all passing)

> **This item does not close `G-4`, and does not decide the owner's disposition.** It establishes the exact
> requirement set, finds no admissible source-backed metric in the repository for any affected slot, demonstrates
> that the shipped ingestion/validation/measurement path already behaves correctly, and leaves the owner's choice
> between *admit* and *keep withheld* explicitly **OPEN**. §7 gives the criterion-level reason `G-4` cannot be
> closed on the present evidence.

---

## 1. What the item is, and what governs it

`CPII-01` §10.1 assigns Stage 4 the activity **B-1** plus the gap closures **G-4**, **G-6** and **G-7**. `G-4`, as the
repository records it (`CPII-01-RUNTIME-TOPOLOGY-AND-READINESS-BOUNDARY-2026-11-13.md:400`, adopted from the baseline's
§24 rather than re-derived):

> Operating metrics are `OPERATOR_ENTERED` everywhere (zero `VENDOR`); every committed bundle carries an empty
> `operating-metrics.csv`. **14 of the 38** sector×method slots require at least one operating metric and stay
> `WITHHELD` regardless of how complete the statements are; **24** are statement-only and unlock with data alone.

The work item is registered in the Stage 4 register with two columns that must be read together:

| Register column (`IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md`, row `S4-R6`) | Text |
|---|---|
| **Owner** | `OWNER` with `OPERATOR` — this is `G-4` |
| **Exact act** | "Supply validated operating-metric records, **or record that these methods stay withheld for this population**" |
| **Exact evidence that closes it** | "`operatingMetricRecords > 0` with `validation VALID`, and the named methods `AVAILABLE`" |

A second, later record states a **different** closure test for the same item
(`IID-STAGE4-S4-R3-READINESS-REASSESSMENT-2026-11-14.md` §4): *"Validated metric records **or** a recorded decision to
keep methods withheld."* §7 treats that tension explicitly and does not resolve it by choosing the convenient reading.

Nothing here enters, admits, derives or estimates an operating metric. Every metric value in this record belongs to a
**synthetic fixture issuer** and exists only to exercise a validation path.

## 2. The exact 14-slot requirement matrix

Derived from `iips-platform/src/investment/coverage/methodMatrix.ts` (`SECTOR_METHODS`) and
`contracts/operatingMetrics.ts` (`OPERATING_METRICS`) — **not** from the aggregate "14 of 38" statement, which this
work item confirms rather than assumes. Machine record: `runs/metric-requirement-matrix.json`.

Totals: **38** declared slots (`24` statement-only, **14** metric-gated), **24** distinct metric ids required of the
**33** in the vocabulary, **9** defined but required by no method (`BM_CAR`, `BM_CASA`, `BM_NNPA`, `CM_NET_FLOWS`,
`HM_ADR`, `HM_OCCUPANCY`, `IM_COMBINED_RATIO`, `IM_PERSISTENCY`, `IN_ORDER_BOOK` — a value for any of those would change
no availability).

| # | Sector | Method | Role | Declared metric(s) — unit `[range]`, source floor | Live today (admitted dataset `sha256:bdfb2527…`) |
|---|---|---|---|---|---|
| 1 | Technology | `EV_REVENUE` | CROSS_CHECK | `TM_NRR` PERCENT `[0, 300]`, ≥`OPERATOR_ENTERED`; `TM_RECURRING_REVENUE_PCT` PERCENT `[0, 100]`, ≥`OPERATOR_ENTERED` | sector measured — **`WITHHELD`** `MANDATORY_METRIC_MISSING` `[TM_NRR, TM_RECURRING_REVENUE_PCT]` |
| 2 | Industrials | `EV_REVENUE` | CROSS_CHECK | `IN_BOOK_TO_BILL` RATIO `[0, 10]`, ≥`OPERATOR_ENTERED` | sector measured — **`WITHHELD`** `MANDATORY_METRIC_MISSING` `[IN_BOOK_TO_BILL]` |
| 3 | Materials | `NAV_RESERVES` | CROSS_CHECK | `MM_RESERVE_LIFE` YEARS `[0, 200]`; `MM_COST_POSITION` INDEX `[1, 4]` | no admitted issuer — `UNMEASURED` |
| 4 | Utilities | `REGULATED_ASSET_BASE` | SECONDARY | `UM_RAB` INR_CRORE `[0, ∞)`; `UM_ALLOWED_ROE` PERCENT `[0, 40]` | no admitted issuer — `UNMEASURED` |
| 5 | Auto | `EV_REVENUE` | CROSS_CHECK | `AU_CAPACITY_UTILISATION` PERCENT `[0, 100]`; `AU_MARKET_SHARE` PERCENT `[0, 100]` | no admitted issuer — `UNMEASURED` |
| 6 | Energy | `EV_EBITDAX` | SECONDARY | `EM_LIFTING_COST` INR `[0, ∞)` | no admitted issuer — `UNMEASURED` |
| 7 | Energy | `NAV_RESERVES` | CROSS_CHECK | `EM_RESERVE_REPLACEMENT` RATIO `[0, 10]` | no admitted issuer — `UNMEASURED` |
| 8 | Healthcare | `EV_EBITDA` | SECONDARY | `HC_OCCUPANCY` PERCENT `[0, 100]`; `HC_ARPOB` INR `[0, ∞)` | no admitted issuer — `UNMEASURED` |
| 9 | Hospitality | `EV_EBITDA` | SECONDARY | `HM_REVPAR` INR `[0, ∞)` | no admitted issuer — `UNMEASURED` |
| 10 | Banking | `RESIDUAL_INCOME` | PRIMARY | `BM_NIM` PERCENT `[-10, 25]`; `BM_GNPA` PERCENT `[0, 100]`; `BM_CET1` PERCENT `[0, 60]` | no admitted issuer — `UNMEASURED` |
| 11 | Banking | `PB_RELATIVE` | SECONDARY | `BM_GNPA` PERCENT `[0, 100]` | no admitted issuer — `UNMEASURED` |
| 12 | Insurance | `P_EMBEDDED_VALUE` | PRIMARY | `IM_EMBEDDED_VALUE` INR_CRORE `[0, ∞)`; `IM_VNB_MARGIN` PERCENT `[-50, 100]`; `IM_SOLVENCY` RATIO `[0, 20]` | no admitted issuer — `UNMEASURED` |
| 13 | Capital Markets | `P_AUM` | PRIMARY | `CM_AUM` INR_CRORE `[0, ∞)`; `CM_COST_TO_INCOME` PERCENT `[0, 200]` | no admitted issuer — `UNMEASURED` |
| 14 | Telecom | `EV_SUBSCRIBER` | PRIMARY | `TL_SUBSCRIBERS` COUNT `[0, ∞)`; `TL_ARPU` INR `[0, ∞)` | no admitted issuer — `UNMEASURED` |

Every declared metric in every slot carries the same declared floor, `minimumSourceClass: 'OPERATOR_ENTERED'` — i.e.
the metric must be attributed to an operator transcription (or be `COMPUTED_FROM_STATEMENTS`, which is stronger in the
ordering `COMPUTED_FROM_STATEMENTS > OPERATOR_ENTERED > VENDOR`); a `VENDOR` observation is *below* the floor.

**Requirement character, stated rather than assumed.**

| Question | Answer, from source |
|---|---|
| Mandatory or conditional? | **Mandatory.** `MethodRequirement.metrics` has no conditional construct; `methodMatrix.ts` names the metrics each method requires, and `measureMethod` treats every named metric as required. There is no "optional metric" path. |
| Unit and range | The metric's own definition (`OPERATING_METRICS[id].unit`, `.range`); a mismatch is `UNIT_MISMATCH` / `OUT_OF_RANGE` and the observation is withheld. |
| Required period | An **annual** period end that the dataset actually carries **for that issuer**, matching the record's `period_end` and `statement_scope`. Coverage resolves it existentially over annual periods (`S4-R5`); the assessment additionally requires the **latest** annual period and the floor (§6.4). |
| Schema field | `OperatingMetricRecord` — `issuerId`, `metricId`, `observation`, `periodEnd`, `statementScope`, `sourceClass`, `unit`, `sourceRef`, `observedAt`, `enteredAt`, `validation`, `issues`. |

## 3. The metric-record census (what actually exists)

| Where | Operating-metric rows | Note |
|---|---|---|
| `sha256:69bbc14e…` (repository dataset of record) | **0** | no `operating-metrics.csv` in any ingest input |
| `sha256:bdfb2527…` (O3-admitted, `S4-R3` refresh) | **0** | same |
| **Every** `evidence/real-issuer/**` bundle | **0** | `git ls-files` finds no `operating-metrics*` file under `evidence/` |
| `iips-platform/tests/investment/fixtures/operating-metrics.csv` | **7** | the **only** committed metric file in the repository; 2 **synthetic** issuers (`IN:EQISIN:IN0000000037`, `…0045`), source classes `OPERATOR_ENTERED` + `COMPUTED_FROM_STATEMENTS`, **0** `VENDOR`, and it deliberately contains an inconsistent GNPA/NNPA pair |

So the recorded zero is not a reporting artefact: **no real-issuer metric observation exists anywhere in this
repository**, and the only metric rows that exist at all are synthetic test fixtures. `metric-census.json` records the
same fact through the shipped path (re-ingesting both datasets and reading `operatingMetricRecords`).

Coverage percentage, read correctly: Technology and Industrials report `operatingMetricCoveragePct 0`; Consumer
reports **`100`** — because Consumer declares **no** mandatory metric (`coverage/measure.ts:250`:
`else if (metrics.length === 0) metricPct = 100`). A Consumer 100 % is *"nothing was required"*, **not** evidence that metrics exist. Test
`a sector that declares no metric reports 100 % metric coverage because nothing is required` pins that reading.

## 4. Source evidence and rights assessment

Searched the repository's own evidence for an admissible, source-supported value for each of the 24 required metric
ids. Method: `git ls-files` over metric-bearing file types; textual search for the metric names and their domain
synonyms across `evidence/`, `docs/` and the issuer bundles; reading each real-issuer bundle's own source notes.

**Result: no admissible source-backed value exists in this repository for any of the 14 slots.** That is a statement
about this repository's evidence, not a claim that such values do not exist in the world.

| Slot | What the committed evidence actually says |
|---|---|
| Technology `EV_REVENUE` (`TM_NRR`, `TM_RECURRING_REVENUE_PCT`) | `evidence/real-issuer/REL-1-INFOSYS-2026-11-06/README.md:233-235`: the metric catalogue holds both, and *"the issuer does not disclose them in a form this dataset can carry, so metric coverage is 0 % and the coverage report says `OPERATING_METRIC_MISSING`. **Not imputed from a segment note.**"* |
| Industrials `EV_REVENUE` (`IN_BOOK_TO_BILL`) | `evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/README.md` §7: the FY2025-26 report prints order intake **₹25,280 crore** and an order book of **₹36,267 crore**, but *"prints **no book-to-bill ratio** and **no prior-year order intake**, so `IN_BOOK_TO_BILL` cannot be taken from the page and is not derived by division: D-2 forbids arithmetic invention of a metric, and one year's intake is not a ratio. The metric is recorded unavailable with its reason, which is what withholds `EV_REVENUE`."* |
| The other 12 slots (Materials, Utilities, Auto, Energy ×2, Healthcare, Hospitality, Banking ×2, Insurance, Capital Markets, Telecom) | **No admitted issuer in those sectors exists in this repository**, so no issuer filing, presentation or note for them is committed either. There is nothing to transcribe and nothing to admit. |

**Rights / admission findings.** (a) Operating metrics are, by design of record
(`IIPS_V3_IID_INVESTMENT_INTELLIGENCE_DESIGN_REFINEMENT_2026-11-05.md:2069-2070`), an attributed operator transcription
with a mandatory `source_ref` for the two non-computed classes — a first-class source, not a vendor feed; the platform
performs **no network I/O** on this path. (b) **No provider, vendor or dataset was admitted by this item**, and `O3` is
untouched: the only dataset versions in play are the two already-admitted ones. (c) Source-rights/redistribution
controls (`sourceRightsOf`, the `W05` records, `datasetClass`) are unchanged and are not circumvented by writing a
metric file. (d) **No web-derived figure was used**; nothing was fetched, quoted or transcribed into a dataset.
(e) A `VENDOR` metric would in any case be *below* every declared floor and would not unlock the assessment (§6.4).

## 5. Generic capability: verified, with no production change required

The shipped path was exercised end-to-end (real `parseOperatingMetricsCsv` + real `measureCoverage`) by twelve
deterministic probes on the synthetic fixture — `runs/capability-probes.json` — and pinned by
`iips-platform/tests/investment/s4r6-operating-metric-gating.test.ts` (**25 tests, all passing**).

| Capability the work item asks about | Established behaviour | Evidence |
|---|---|---|
| Accept a source-supported metric in the canonical schema | a well-formed `OPERATOR_ENTERED` row becomes a `VALID`, `PRESENT` record with its `sourceRef`/`observedAt`/`enteredAt` lineage | probe `P1-valid`; test *a valid metric unlocks exactly that method and nothing else* |
| Validate issuer | `UNKNOWN_ISSUER` (ERROR) when the metric names an issuer not in the roster | `builder.ts:709-712`; exercised through fixtures |
| Validate metric identity | closed vocabulary: `UNKNOWN_METRIC` (ERROR), the row does not become a record | probe `P7`; test *an unknown metric id is an error…* |
| Validate unit and range | `UNIT_MISMATCH` / `OUT_OF_RANGE` ⇒ `UNVALIDATED`, value withheld | probes `P4`,`P5`; two tests |
| Validate provenance | `OPERATOR_ENTERED`/`VENDOR` without `source_ref` ⇒ `SOURCE_REF_REQUIRED` (ERROR), row rejected; a non-class ⇒ `INVALID_SOURCE_CLASS` | probes `P6`; tests *an operator-entered metric without a source reference is rejected outright*, *a source class that is not one of the three is rejected* |
| Validate temporal alignment | a metric at a period end the dataset does not carry for that issuer ⇒ `METRIC_PERIOD_NOT_IN_DATASET` (WARNING), record retained, **gates nothing**; a quarterly end never satisfies an annual requirement | probe `P8`; two tests |
| Reject ambiguity, keep the inputs | two disagreeing observations are **both** retained as `CONFLICT` with `SOURCE_CONFLICT_UNRESOLVED` and excluded from gating — nothing is overwritten; two agreeing observations are not an ambiguity and do gate | probe `P9`; two tests |
| Preserve missing as missing | an empty value is `MISSING`/`null` with `MISSING_VALUE`, never `0` | probe `P3`; test *an empty value is preserved as missing…* |
| Keep cross-field quarantine narrow | a RevPAR inconsistent with ADR × occupancy quarantines the three implicated metrics only | probe `P10`; test *a cross-field violation quarantines only the metrics it implicates* |
| Carry explicit withholding reasons through measurement | `MANDATORY_METRIC_MISSING` / `METRIC_UNVALIDATED` with `missing[]` naming the metric, on the sector and per method | probes `P2`…`P10`; every test asserts a reason |
| Make a method available **only** when all declared requirements are satisfied | a two-metric method stays `WITHHELD` with one metric present; a one-metric method flips at the single valid observation | tests *a two-metric method needs BOTH…*, *a valid metric unlocks exactly that method…* |
| Be issuer-neutral | a previously unseen issuer (id `IN:EQISIN:IN0000000901`, created inside the test) satisfies the same declaration through the same code path; a quarantined issuer is neither credited nor allowed to poison a clean one (`issuersAvailable` names the exact issuer) | two tests; no id, name or sector is special-cased anywhere |

**No defect was found that prevents any of those behaviours, so no production change was made.** The ingestion,
validation, measurement and reporting modules are untouched by this item — the entire diff is the new test suite, the
evidence bundle and the records.

**Two observations recorded and deliberately not "fixed"**, because neither prevents a required behaviour and either
change would alter served output outside this item's need:

1. **No metric/issuer-sector consistency check.** A `TM_NRR` entered for a *Hospitality* issuer is accepted `VALID`
   with no issue (probe `P11`) and is permanently inert: methods only consult the metrics their own sector declares,
   so it can never unlock anything. Adding a warning would be a behaviour change with side effects — `issuerIdOfIssue`
   maps any issue carrying an issuer id to that issuer's row, so the row's served state would flip to `ISSUED_DATA`.
2. **`period_end` is not format-validated.** A malformed end (e.g. `31/03/2026`) never matches a period, so it produces
   only `METRIC_PERIOD_NOT_IN_DATASET` and gates nothing — fail-safe, but the malformed string itself is not named as
   malformed.

## 6. Per-method availability and withholding, as served today

| | Result |
|---|---|
| Slots live on the admitted population | **2 of 14** — Technology `EV_REVENUE`, Industrials `EV_REVENUE` |
| Technology `EV_REVENUE` | `WITHHELD`, `MANDATORY_METRIC_MISSING`, `missing [TM_NRR, TM_RECURRING_REVENUE_PCT]`; sector `G2_PARTIAL`, `metric 0 %` |
| Industrials `EV_REVENUE` | `WITHHELD`, `MANDATORY_METRIC_MISSING`, `missing [IN_BOOK_TO_BILL]`; sector `G2_PARTIAL`, `metric 0 %` |
| Slots in sectors with no admitted issuer | **12 of 14**, all `UNMEASURED` — an empty sector, not a failed one |
| Consumer | declares no mandatory metric; unaffected, `G1_ENABLED` |
| Effect on the assessment layer | metric-gated methods are `applicable: false` there too, with the gap named; see §6.4 |

Both live rows are unchanged from the previous records — this item added no metric, so no method became available.

### 6.4 The two layers, side by side (unchanged `S4-R4` D4)

`runs/capability-probes.json` → `layerProbes`, on the synthetic Hospitality observation:

| `sourceClass` of the observation | Coverage verdict | Assessment verdict for the same method |
|---|---|---|
| `OPERATOR_ENTERED` | `AVAILABLE` | `applicable: false` — `INSUFFICIENT_HISTORY` (a history rule, not a metric rule) |
| `VENDOR` | `AVAILABLE` | `applicable: false` — `MANDATORY_METRIC_MISSING: HM_REVPAR (source class too weak)` |
| `COMPUTED_FROM_STATEMENTS` | `AVAILABLE` | `applicable: false` — `INSUFFICIENT_HISTORY` |

This is `S4-R4`'s recorded divergence **D4**, now demonstrated rather than described: coverage is a statement about the
dataset, the assessment applies the metric definition's `minimumSourceClass` floor (`assessment/methods.ts:147`) and its
latest-period rule. Test *a VENDOR observation is retained and counted by coverage but never unlocks the assessment* pins
it — a below-floor source class must not produce a valuation, and the refusal names the metric and the reason. Test *a
metric from another sector's vocabulary is retained, inert, and unlocks nothing anywhere* pins the complementary rule at
both layers. So the answer to "does a below-floor or wrong-sector observation unlock anything?" is **no, at either
layer**, and both are now regression-gated rather than inferred from probe output. It is not a defect, it is not changed here, and it matters for the owner's decision — **a `VENDOR`
metric would not unlock the assessment even if it unlocked coverage.**

## 7. The owner decision, and the `G-4` closure determination

### 7.1 The decision is not taken, and cannot be taken here

`S4-R6` is jointly **OWNER + OPERATOR**. Neither limb exists: no source-backed metric (so the operator has nothing to
transcribe), and no owner disposition recorded (so nothing authorises either course). A technical withholding — which is
what the code does when a metric is absent — **is not owner approval of option B**; it is the engine's default, and this
record does not dress it as a decision.

**Decision required, exactly:**

> **Option A — admit.** For each affected slot, admit validated, source-supported operating metrics for the affected
> issuers, with `source_ref` pointing at the document and locator, under the existing source-admission and rights
> controls. Live effect available today: Technology `EV_REVENUE` needs `TM_NRR` + `TM_RECURRING_REVENUE_PCT` for
> Infosys; Industrials `EV_REVENUE` needs `IN_BOOK_TO_BILL` for KEC. The other 12 slots additionally require admitting
> issuers in their sectors first (an `O3` act), so they cannot change through metrics alone.
>
> **Option B — keep withheld.** Record that these methods stay withheld for this population until admissible metrics
> become available. Live effect: the two `WITHHELD` rows and the twelve `UNMEASURED` sectors stay exactly as served.

Whoever decides should note the two facts the evidence fixes: (i) for the *current* population the decision can move at
most **two** method slots, and (ii) for Industrials the printed order intake/order book are **not** a book-to-bill ratio,
and the repository's own rule forbids computing one (`WI8` §7). Under `O3`/rights, nothing here authorises a new source.

### 7.2 `G-4` is **OPEN**, and option B alone cannot close it

| Criterion source | Test it states | Met? |
|---|---|---|
| Register `S4-R6` "Exact evidence that closes it" (`IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md`) | `operatingMetricRecords > 0` **with** `validation VALID`, **and** the named methods `AVAILABLE` | **No** — 0 records on both datasets; both live slots `WITHHELD` |
| `IID-STAGE4-S4-R3-READINESS-REASSESSMENT-2026-11-14.md` §4, `S4-R6` row | "Validated metric records **or** a recorded decision to keep methods withheld" | **No** — no record, and no decision recorded |
| `CPII-01` §5.6 (`G-4` constraint) | 14 of 38 slots "stay `WITHHELD` regardless of how complete the statements are" | describes the state; states no closure test |

**Determination: `G-4` remains OPEN.** Two things follow, and the second is the one this item was asked to establish:

1. **No limb of the numeric criterion is satisfied.** There is no metric record at all — not a partial set — so `G-4`
   is not "partially closed" in the sense of some sectors having data. The capability to consume, validate and gate on
   metrics is demonstrated (§5), but capability is not a `G-4` acceptance criterion and this record does not present it
   as one.
2. **Option B, by itself, cannot close `G-4` against the register's stated evidence.** A recorded decision to keep the
   methods withheld produces no valid metric record and leaves every named method `WITHHELD`, so it satisfies neither
   clause of *"`operatingMetricRecords > 0` with `validation VALID`, and the named methods `AVAILABLE`"*. It would
   record a **controlled limitation** — an explicit, attributed, auditable disposition — not a closure. The two
   repository statements differ (the `S4-R3` reassessment accepts "a recorded decision to keep methods withheld" as
   closure evidence); **this record does not choose between them**, because choosing would redefine the acceptance test
   on the owner's behalf. Under the stricter, register-pinned test, option B leaves `G-4` **OPEN as a recorded
   limitation**; under the permissive reading it would close `G-4` by decision alone. **Which reading governs is
   itself an owner decision**, and until it is taken `G-4` stays `OPEN` with the ambiguity recorded here rather than
   silently resolved.

Consequently: **`G-4` = OPEN**, and the honest description of this item's outcome is *investigated, requirement set
fixed, capability proven, source evidence absent, owner decision outstanding* — not "closed", and not "closed by
withholding safely".

## 8. Remaining limitations and operator actions

| # | Limitation | Owner | What would change it |
|---|---|---|---|
| 1 | No operating-metric record exists anywhere in the repository (real issuers) | OPERATOR (transcription) | a committed `operating-metrics.csv` with `source_ref` lineage, ingested and re-measured |
| 2 | Technology `EV_REVENUE` withheld: `TM_NRR`, `TM_RECURRING_REVENUE_PCT` not disclosed in a carryable form | OPERATOR, then OWNER | a source that states both metrics for a period the dataset carries |
| 3 | Industrials `EV_REVENUE` withheld: `IN_BOOK_TO_BILL` not printed, and derivation is forbidden | OPERATOR, then OWNER | a source that prints the ratio (or an owner decision that admits a computed ratio — which would be a policy change, not a transcription) |
| 4 | 12 further slots are `UNMEASURED` because their sectors hold no admitted issuer | OPERATOR + OWNER (`O3`) | admitting issuers in those sectors; metrics alone cannot change them |
| 5 | No metric/issuer-sector consistency check; `period_end` not format-validated | IRR (future, optional) | a recorded decision to add detection, with its effect on issuer row state understood (§5) |
| 6 | `G-4`'s closure test is stated two ways in the repository | OWNER | an owner decision on which test governs; this record does not pick one |

No host action was performed or is represented as performed by this item. Nothing here changes a valuation formula,
weight, threshold, cap or freshness rule, admits an issuer or dataset, or writes outside this repository.

---

## 9. What this record does not claim

That any operating metric values exist for the affected issuers. That the absence of source documents in this
repository proves such values are unavailable publicly. That `G-4` is closed, partially closed, or closable by a
withholding decision. That the owner has decided anything. That coverage availability equals assessment applicability
(§6.4 shows it does not). That a `VENDOR` source is admissible — it is below every declared floor and no provider is
admitted here.
