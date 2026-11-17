# IID Stage 4 — Coverage Measurement **Evidence** (installed data, served surface)

**Date of measurement:** 2026-11-14 (UTC)
**Assessed head:** `316da9772c1568c82ceb2e826893c4f8ffed1ef9` on `arena/94a53bb3-iips-review-recovered`
**Publication:** additive. PR #562 remains OPEN and UNMERGED.
**Classification:** LOCAL_SINGLE_USER_NON_PRODUCTION — measurement, implementation and documentation
**Companion readiness record:** `IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md` (published with this one)

> ## What this record is, and what it is not
>
> This is the **evidence** half of IID Stage 4. It records what was measured, on what data, through which
> code path, with which exact numbers — including the numbers that did not come out the way the prior
> records predicted. The verdict, the acceptance-criteria reading and the remaining-action register are in
> the companion readiness record; this one carries the observations that verdict rests on.
>
> Every count, digest, percentage, line number and exit code below is bound to its observation instant:
> **2026-11-14 at head `316da977…`, in this sandbox, on the datasets named in §2.** None of it is stated as
> a standing fact. Where a measurement was performed twice and disagreed, both results are recorded (§7.4,
> §8) rather than the convenient one.
>
> This record does **not** supersede any prior record. It adds Stage 4 observations to Stage 2's and Stage 3's
> and leaves both byte-for-byte unchanged (§12).

---

## 1. The requirement being evidenced

`CPII-01` §10.1 assigns Stage 4 the activity **B-1** plus the gap closures **G-4**, **G-6** and **G-7**; it
assigns B-4 through B-7 to **Stage 5**. The authoritative acceptance text is the primary baseline's §21
Stage 4 clause, adopted by reference:

> issuer coverage, completeness, method usability and sector measurement verified on **installed** data,
> with the §23 ten-scenario demo passing. … Acceptance: per-sector `measured:true` for Technology, Consumer
> and Industrials; unavailable methods carry reasons; completeness and adequacy per issuer; **zero fabricated
> figures (hand-check five derived values)**.

Two limbs, therefore: a **measurement limb** (verify coverage, completeness, method usability and sector
measurement on installed data) and a **demo limb** (the §23 ten scenarios). Both are accounted for below —
the measurement limb in §3–§9, the demo limb scenario by scenario in §10.

A note on scope, recorded because it shaped what was measured: `CPII-01` §12.2 mandates that an
operationalisation verify `measuredSectors > 0` rather than `datasetClass !== 'NONE'`. §4.2 shows that this
mandated check is **necessary but not sufficient**, and why.

---

## 2. What was measured, and on what

Three roots, all built in this sandbox from committed evidence only. No production host was involved and no
host artefact is claimed.

| Root | Contents | How it was produced |
|---|---|---|
| `/tmp/stage4-verify/investment/dataset` | the three admitted bundles ingested fresh | `cli/ingest.ts` `--input <bundle>/ingest-input` ×3, `--dataset-dir`, `--now 2026-11-14` → exit **0** |
| `/tmp/stage4-served/investment/{dataset,identity}` | the end-to-end root used for served-route measurement | dataset copied from `stage4-verify`; identity published by the **real** `cli/provision-identity.ts --execute` → `RESULT PASS` |
| `/tmp/stage4-g7-written/investment/dataset` | the same dataset with one sector respelled | written through `writeDataset` (digest-consistent, therefore ACCEPTED by `readDataset`) |

The three admitted bundles, as committed under `evidence/real-issuer/`:

| Bundle | Issuer | Sector as admitted | Identity source directory |
|---|---|---|---|
| `REL-1-INFOSYS-2026-11-06` | Infosys Limited | Technology | `<bundle>/identity` |
| `WI7-CONSUMER-MARICO-2026-11-07` | Marico Limited | Consumer | `<bundle>/ingest-input/identity` |
| `WI8-INDUSTRIALS-KEC-2026-11-07` | KEC International Limited | Industrials | `<bundle>/ingest-input/identity` |

The identity source directories are **not uniform across bundles** — REL-1 keeps them at the bundle root,
WI7 and WI8 under `ingest-input/`. This is recorded because a single shared constant silently points at a
non-existent path for two of the three, and because the committed Stage 2 harness had REL-1's layout.

Ingest measurements (`/tmp/stage4-verify`):

```
exit code                0
inputDigest  INFOSYS     da0253c8…
inputDigest  MARICO      725e8ead…
inputDigest  KEC         6a62f071…
datasetVersion           sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83
completed                3/13 sectors measured
methods declared         38 across 13 sectors
metric ids in vocabulary 33
line items               53
```

The `datasetVersion` **equals the value the Windows host produced at Stage 3**. The measurement below is
therefore on data identical to the installed dataset, not on a sandbox-only variant — which is what "verified
on **installed** data" requires.

Published identity set (`/tmp/stage4-served`, produced by the real provisioner, `--execute`):

```
RESULT                   PASS
merge.issuers            3      merge.securities  3
merge.listings           5      merge.actions     0
publication.published    true
published.digest         08a5d29cbc6b…  eligible-roster.json      1992 B
                         33837065aedd…  listing-map.json          3794 B
                         1d5ef030ff0b…  corporate-actions.json      70 B
verification             rosterVersion sha256:e910728a…  listingMapVersion sha256:9635ecd1…
                         corporateActionTableVersion sha256:0b1d3cbf…
refusal.count            0
attestation              WRITES_PERFORMED
--verify-only --probe    PASS
```

All three digests match the values Task 16 **predicted** before any host run; the host run then observed the
same three (`IID-STAGE2-WINDOWS-HOST-PROVISION-EVIDENCE-2026-11-14.md`). Publication is not repeated here and
was not re-executed against the Stage 3 host artefacts.

Installed-dataset manifest block:

```
issuers 3   securities 3   listings 5   annualPeriods 9   quarterlyPeriods 0
prices 0    operatingMetricRecords 0    corporateActions 0
earliest 2022-03-31   latest 2026-03-31   dataAsOf 2026-03-31
completenessPct 100   quality good   sourceRights.state OPERATOR_ASSERTED
```

---

## 3. Sector measurement on installed data — all thirteen sectors

Measured by `measureCoverage` over the installed dataset, and served through the real composition root (§6).
Every one of the thirteen canonical sectors is reported; absence of data is never reported as a pass.

| Sector | Stage | `measured` | Issuers | Annual periods | Usable | Withheld | Statement % | Metric % |
|---|---|---|---|---|---|---|---|---|
| **Consumer** | `G1_ENABLED` | true | 1 | 3 | **3** | **0** | 91.7 | 100 |
| **Industrials** | `G2_PARTIAL` | true | 1 | 3 | 2 | 1 | 100.0 | 0 |
| **Technology** | `G2_PARTIAL` | true | 1 | 3 | 2 | 2 | 87.5 | 0 |
| Auto | `UNMEASURED` | false | 0 | 0 | 0 | 3 | 0 | 0 |
| Banking | `UNMEASURED` | false | 0 | 0 | 0 | 3 | 0 | 0 |
| Capital Markets | `UNMEASURED` | false | 0 | 0 | 0 | 3 | 0 | 0 |
| Energy | `UNMEASURED` | false | 0 | 0 | 0 | 3 | 0 | 0 |
| Healthcare | `UNMEASURED` | false | 0 | 0 | 0 | 3 | 0 | 0 |
| Hospitality | `UNMEASURED` | false | 0 | 0 | 0 | 3 | 0 | 0 |
| Insurance | `UNMEASURED` | false | 0 | 0 | 0 | 2 | 0 | 0 |
| Materials | `UNMEASURED` | false | 0 | 0 | 0 | 3 | 0 | 0 |
| Telecom | `UNMEASURED` | false | 0 | 0 | 0 | 2 | 0 | 0 |
| Utilities | `UNMEASURED` | false | 0 | 0 | 0 | 3 | 0 | 0 |

`completedMeasurements` = `["Consumer","Industrials","Technology"]`; `outstandingSectors` = the other ten.

**§21's acceptance clause "per-sector `measured:true` for Technology, Consumer and Industrials" is
satisfied exactly** — those three and only those three.

### 3.1 Every withheld method, with its reason (§21: "unavailable methods carry reasons")

| Sector | Method | State | Reason | Missing |
|---|---|---|---|---|
| Consumer | — all three | `AVAILABLE` | — | — |
| Industrials | `EV_REVENUE` | `WITHHELD` | `MANDATORY_METRIC_MISSING` | `["IN_BOOK_TO_BILL"]` |
| Industrials | other two | `AVAILABLE` | — | — |
| Technology | `EV_EBITDA` | `WITHHELD` | `STATEMENT_INPUT_MISSING` | `["NET_DEBT"]` |
| Technology | `EV_REVENUE` | `WITHHELD` | `MANDATORY_METRIC_MISSING` | `["TM_NRR","TM_RECURRING_REVENUE_PCT"]` |
| Technology | other two | `AVAILABLE` | — | — |

No withheld method anywhere carries a null reason or an empty `missing` list. Consumer's sector requirements
declare **zero** mandatory operating metrics, which is why its metric coverage reads 100% with
`operatingMetricRecords = 0` — an empty requirement set is fully satisfied, and that is stated rather than
left to be inferred.

### 3.2 Reconciliation against the bundle expectations

The prior records' expectation was: *Infosys Technology measured, `EV_REVENUE` withheld absent `TM_*`;
Marico `G1_ENABLED`; KEC `G2_PARTIAL`.* Measured result: **Marico and KEC agree exactly. Technology is
measured and `EV_REVENUE` is withheld naming `TM_NRR`/`TM_RECURRING_REVENUE_PCT` exactly as expected — and
there is a second withholding the expectation did not name.**

**`Technology.EV_EBITDA` is withheld `STATEMENT_INPUT_MISSING` on `["NET_DEBT"]`.** This is a divergence from
the recorded expectation and is **not a measurement defect**. Traced to source:

* `SECTOR_METHODS['Technology']` declares `EV_EBITDA` with `lineItems ['EBITDA','NET_DEBT']`, `metrics []`.
* `EBITDA` is derived and **is** present for Infosys in all three periods.
* `NET_DEBT` is derivable (`fundamentals/derive.ts:49`) from
  `LONG_TERM_BORROWINGS + SHORT_TERM_BORROWINGS − CASH_AND_CASH_EQUIVALENTS`.
* Infosys' **`LONG_TERM_BORROWINGS` and `SHORT_TERM_BORROWINGS` were never transcribed** — ABSENT in all
  three periods. `CASH_AND_CASH_EQUIVALENTS` and `LEASE_LIABILITIES` are present.
* `derive.ts`'s header states that `NET_DEBT` intentionally excludes lease liabilities and current
  maturities, and that **"an unreported input is never silently zero"**. The derivation therefore correctly
  refuses.

The correct classification is a **transcription-completeness gap in the REL-1 bundle**, not a bug in
measurement, derivation or policy. It is recorded as remaining action **S4-R2**; it was **not** repaired,
because repairing it would mean either widening the derivation (treating an unreported borrowing as zero —
precisely what `derive.ts` forbids) or fabricating a figure. Per-issuer `NET_DEBT` derivability, measured:

| Issuer | `LONG_TERM_BORROWINGS` | `SHORT_TERM_BORROWINGS` | `NET_DEBT` derived |
|---|---|---|---|
| Infosys | ABSENT ×3 | ABSENT ×3 | **never** |
| Marico | `MISSING`/`PRESENT`/`MISSING` | PRESENT ×3 | FY2023 only, `2680000000` |
| KEC | PRESENT ×3 | PRESENT ×3 | all three: `32748500000`, `30353100000`, `44563700000` |

---

## 4. The `G-7`/`G-14` read-path defect, and its closure

### 4.1 The defect as it existed at head `316da977`

Coverage measurement decides sector membership by string equality: `measureCoverage` filters
`content.issuers` on `issuer.sector === sector`. `IssuerRecord.sector` is *typed* as the closed `SectorName`
union, but a TypeScript type is erased at runtime and the sector list itself comes from a compile-time cast
(`Object.keys(SECTOR_METHODS) as SectorName[]`). An issuer whose sector is not exactly one of the thirteen
canonical names therefore matches **no** sector, and before this change **nothing anywhere said that an
issuer had been dropped**. The route still answered 200.

`S3-D1` closed one path in: `assertValidIssuerSectors` rejects an off-vocabulary roster before anything is
written. But that guard has exactly **one call site repo-wide** — `cli/ingest.ts:180`. It does not protect
a build predating `S3-D1`, nor any caller of `writeDataset` other than the CLI. That is `G-14` verbatim:
*"two sector vocabularies, no lint"* — nothing prevents the `G-7` class of defect re-entering through a
hand-authored roster.

Demonstrated, not asserted. A dataset written directly by `writeDataset` with `Technology` respelled
`Automobile` (`/tmp/stage4-g7-written`) is **digest-consistent and ACCEPTED** by `readDataset`; the sector
validation never runs. (Hand-editing a published dataset cannot demonstrate this: `readDataset` verifies
digests and throws `DatasetIntegrityError`, `writer.ts:659-670`.)

### 4.2 Two shapes, and why the mandated check misses one of them

| Shape | Perturbation | `completedMeasurements` | served `measuredSectors` | issuer silently dropped? |
|---|---|---|---|---|
| **(a)** sole member | `Hospitality` → `Automobile` on the fixture's only Hospitality issuer | 3 → **2** | 3 → **2** | yes, and the sector becomes field-for-field indistinguishable from one that genuinely has no issuers |
| **(b)** one of two | `Technology` → `Automobile` on one of the fixture's two Technology issuers | **3 (unchanged)** | **3 (unchanged)** | **yes — and no aggregate moves at all** |

Shape (b) is the dangerous one, and it is why `CPII-01` §12.2's mandated verification
(`measuredSectors > 0`) is **necessary but NOT sufficient**: shape (b) passes that check while an issuer
silently leaves `issuersConsidered` (2 → 1). Only an explicit offender list closes it. Both shapes are
tested.

For shape (a), the comparator is deliberate: to prove a dropped sector is indistinguishable from an empty
one, the test compares only `stage`, `measured`, `issuersConsidered`, `annualPeriodsConsidered`,
`statementCoveragePct` and `operatingMetricCoveragePct`. It does **not** compare `usableMethods` or
`withheldMethods`, which are sector-specific by design and would differ for reasons that have nothing to do
with the defect.

### 4.3 What was implemented

The smallest complete change: make the read path — the one place every consumer passes through — classify
each issuer's sector with the **same pure classifier the ingestion guard already uses**, and disclose the
result. No resolver rule was widened, no value was normalised, no observation was fabricated, and no route
was turned into a failure.

`iips-platform/src/investment/coverage/measure.ts` (+72/−1, now 351 lines):

| Line | Change |
|---|---|
| `:13` | imports `SECTOR_NAMES` alongside the existing metric contracts |
| `:15` | imports `findInvalidIssuerSectors` and `type InvalidIssuerSector` from `../ingestion/sectorValidation` — **one vocabulary authority**, not a second classifier |
| `:84` | `CoverageReport` gains `readonly offVocabularyIssuers: readonly InvalidIssuerSector[]` — **required, not optional**, so no consumer can omit it |
| `:219` | computed **before** the sector loop, because it is a fact about the dataset rather than about any one sector |
| `:293` | returned in the report |
| `:311` | `renderCoverageSummary` appends `...sectorVocabularyLines(report)` **unconditionally** |
| `:329` | new exported `sectorVocabularyLines(report)` |
| `:345` | the `NOT_IN_VOCABULARY` wording names `SECTOR_NAMES.length` canonical values and states that no trimming or case-folding would fix it |

`iips-platform/src/investment/coverage/investmentCoverage.ts` (+55/−1, now 482 lines):

| Line | Change |
|---|---|
| `:98` | new exported `OffVocabularySectorIssuer` — `issuerId`, `legalName`, `sectorAsWritten`, `reason`, `canonicalSector`, `correction`. The roster `index` is deliberately **dropped**: it is a position in an input file, which the served surface has no business exposing |
| `:153` | required `offVocabularyIssuers` on the served report |
| `:368` | mapped from the measurement report |
| `:393-397` | **one** additional `notes` entry, and **only when non-empty** |
| `:466-468` | one additional status-line clause, likewise conditional |
| — | deliberately **not** routed through `issues` |

Why not `issues`: an off-vocabulary sector is not an ingestion issue *about that issuer*. Routing it through
`issues` would flip the issuer's row to `ISSUED_DATA` (`:303-304`) and hide a vocabulary defect inside a
generic per-issuer count, which is a different statement than the one that needs making.

Two doubles were updated for the new required field, one line each:
`iips-platform/tests/investment/investment-coverage-endpoint.test.ts` and
`frontend/server/investment/iidInvestmentCoverageTransport.test.ts` (`offVocabularyIssuers: []`).

### 4.4 The summary line prints in the clean case too

A line that appears only when something is wrong cannot distinguish "checked and clean" from "not checked".
So the clean dataset prints an affirmative line:

```
sector vocabulary  every issuer carries one of the 13 canonical sectors; none was dropped
```

and the defective dataset (`/tmp/stage4-g7-written`) prints:

```
sector vocabulary  1 of 3 issuer(s) OFF-VOCABULARY: matched no sector, excluded from every measurement, so "completed" above UNDERSTATES this dataset
  IN:CIN:L85110KA1981PLC013115 (Infosys Limited): sector is "Automobile" — NOT_IN_VOCABULARY; not one of the 13 canonical values, and no trimming or case-folding would fix it
  correct the sector at source and re-ingest; this measurement never rewrites a sector
```

BEFORE/AFTER on that same dataset, measured:

| | BEFORE (`316da977`) | AFTER (this change) |
|---|---|---|
| measured sectors | 2/13 | **2/13 — unchanged** |
| Technology row | `UNMEASURED`, `issuersConsidered []` | identical |
| summary mentions `Automobile` | **NO** | **YES** |
| summary names the dropped issuer | **NO** | **YES** |
| vocabulary line | **none** | the three lines above |

`completedMeasurements` on that dataset is `["Consumer","Industrials"]` — **2/13**, identical before and
after the change. The measurement did not move. That is the point: **disclosure, not repair**. Reporting an
offender never changes a number that would otherwise have been wrong, and nothing was normalised to make a
number right.

The block above was **re-verified verbatim** by rebuilding `/tmp/stage4-g7-written` from the installed dataset
through `writeDataset` and reading it back with `readDataset`, which ACCEPTED it (3 issuers, digest-consistent).
A near miss prints its correction while still being refused:

```
  IN:EQISIN:IN0000000045 (Dwarka Resorts Limited (synthetic)): sector is " hospitality " — WHITESPACE; remove whitespace and match case exactly: the canonical value is "Hospitality"
```

and a non-string prints its own null rather than a guess:

```
  IN:EQISIN:IN0000000045 (Dwarka Resorts Limited (synthetic)): sector is null — NULL; not one of the 13 canonical values, and no trimming or case-folding would fix it
```

`received` is rendered with its JSON quoting by the classifier, so the summary shows `sector is "Automobile"`
for a string and `sector is null` for a null — the reader sees the value's type, not a coerced guess at it.

### 4.5 Every way untrusted JSON can fail the vocabulary, classified

All are rejected; none is normalised; a near miss names the canonical value while still being refused.

| Received | Reason | `canonicalSector` |
|---|---|---|
| `hospitality`, `HOSPITALITY` | `CASE` | `Hospitality` |
| `" Hospitality "`, `"Hospitality "`, `" hospitality "` | `WHITESPACE` | `Hospitality` |
| `Automobile`, `Materials & Metals`, `Telecommunications` | `NOT_IN_VOCABULARY` | `null` |
| `""` | `EMPTY` | `null` |
| `"   "` | `WHITESPACE_ONLY` | `null` |
| `null` | `NULL` | `null` |
| `42`, `["Hospitality"]` | `NOT_A_STRING` | `null` |
| key absent | `MISSING` | `null` |

---

## 5. `G3_WITHHELD` — the §23 scenario-8 stage had zero tests

A repo-wide search for the literal `G3_WITHHELD` at head `316da977` returned **two source files and zero
test files**:

```
iips-platform/src/investment/coverage/measure.ts:36            the SectorStage union member
iips-platform/src/investment/coverage/measure.ts:265           the branch that produces it
iips-platform/src/investment/coverage/investmentCoverage.ts:298 the branch that consumes it
docs/integration/IID-STAGE3-WINDOWS-HOST-ACCEPTANCE-EVIDENCE-2026-11-14.md:303   a quotation
```

Stage 4's demo limb requires this stage: §23 scenario 8 is *Banking/Insurance/Capital Markets/Telecom
`WITHHELD`, naming the missing metrics (`BM_NIM`/`GNPA`/`CET1`), stage `G3_WITHHELD`, never approximated*.
An untested stage is an unmet limb, not a cosmetic gap, so it was tested. The stage rule, read from
`measure.ts:258-265`: `measured` means issuers **and** annual periods exist; the stage then splits on method
results — no withheld method ⇒ `G1_ENABLED`, some usable ⇒ `G2_PARTIAL`, none usable ⇒ `G3_WITHHELD`.

Measured on the reference fixture (`iips-platform/tests/investment/fixtures.ts`), whose Banking issuer
carries one annual period, `NET_PROFIT`/`TOTAL_EQUITY`/`BOOK_VALUE_PER_SHARE`/`EPS_DILUTED`/
`DIVIDENDS_PAID` present, `BM_CET1`/`BM_CAR` VALID and `BM_GNPA`/`BM_NNPA` UNVALIDATED:

| Perturbation | Banking stage | Usable | Withheld | Reasons |
|---|---|---|---|---|
| none (fixture default) | `G2_PARTIAL` | `["DIVIDEND_DISCOUNT"]` | `["RESIDUAL_INCOME","PB_RELATIVE"]` | both `METRIC_UNVALIDATED` |
| all `BM_*` metric records removed | `G2_PARTIAL` | `["DIVIDEND_DISCOUNT"]` | same two | `MANDATORY_METRIC_MISSING`, naming `BM_CET1`, `BM_GNPA`, `BM_NIM` |
| that **plus** `DIVIDENDS_PAID` and `EPS_DILUTED` removed | **`G3_WITHHELD`** | `[]` | all three | every method WITHHELD with a non-null reason and a non-empty `missing` list |

Served rows and counts, same fixture (5 issuers):

| | canonical | fully withheld Banking |
|---|---|---|
| `observed` | 5 | **5 — unchanged** |
| `COVERED` | 4 | 3 |
| `NO_FINANCIALS` | 1 | 1 |
| `SECTOR_NOT_MEASURED` | 0 | **1** |
| `ISSUED_DATA` | 0 | 0 |
| Banking issuer's row | `COVERED` | **`SECTOR_NOT_MEASURED`** |
| `measuredSectors` | 3 | **3** |

Three things this pins:

1. **`G3_WITHHELD` never approximates.** The Banking issuer has annual periods (so `NO_FINANCIALS` would be a
   lie) and clean data (so `ISSUED_DATA` would be a lie); its row is `SECTOR_NOT_MEASURED`, and no method
   produced a value.
2. **`G3_WITHHELD` is distinct from `UNMEASURED`.** Insurance in the same fixture is the comparator: it has an
   admitted issuer and **zero** periods, so it is `UNMEASURED` and `NO_FINANCIALS`, and it appears in
   `outstandingSectors`. Banking was measured, is in `completedMeasurements`, and is **not** outstanding.
   Both print `usable 0` in the summary — the stage word is what separates them, which is why it is printed.
3. **The §23 scenario-10 arithmetic stays exact.** The four states partition `observed` in both columns, each
   count equals its own row count, and exactly one issuer moved.

**One asymmetry is recorded rather than smoothed over.** `measuredSectors` still counts a `G3_WITHHELD`
sector (3 in both columns above) while that sector's issuers are `SECTOR_NOT_MEASURED`. Both statements are
correct about different things: `measuredSectors` counts completed *measurements* — a fact about the dataset
— and the row states *usability* for that issuer. Neither number was adjusted. Adjusting `measuredSectors`
would have invalidated the host-verified Stage 3 figure of "3 of 13 sectors", and inferring usability from a
sector count is exactly the misreading §21's "unavailable methods carry reasons" exists to prevent. The pair
is now pinned together in one test so it cannot drift silently in either direction.

---

## 6. Served-surface results — the real composition root, real HTTP

Measured through the production path, not through a helper: `frontend/server/executive-transport.ts:827-845`
matches the coverage paths and calls
`coverage.handleInvestmentCoverageRequest(req, res, sources.createCoverageProviders())`;
`frontend/server/investment/sources.ts:202` supplies
`readInvestmentCoverage: (asOf) => investmentCoverageFromLocalDataset(asOf, options.dataRoot)`;
`identity/runtime.ts:91` loads the published identity set and then opens the local snapshot. `dataRoot` is an
explicit option — no environment variable was introduced.

| Request | HTTP | `measuredSectors` | `identitySourcesAvailable` | `identitySourceDetail` | `offVocabularyIssuers` | `counts` |
|---|---|---|---|---|---|---|
| canonical | **200** | 3/13 | `true` | `null` | `[]` | observed 3, `COVERED` 3, `NO_FINANCIALS` 0, `SECTOR_NOT_MEASURED` 0, `ISSUED_DATA` 0 |
| Infosys Technology → `"Automobile"` | **200** | **2/13** | `true` | `null` | one entry: `Infosys Limited`, `sectorAsWritten "\"Automobile\""`, `reason NOT_IN_VOCABULARY`, `canonicalSector null`, `correction null` | observed 3, `COVERED` 2, `SECTOR_NOT_MEASURED` 1, `ISSUED_DATA` 0 |
| Marico Consumer → `"consumer"` | **200** | 2/13 | `true` | `null` | one entry, `reason CASE`, `canonicalSector "Consumer"`, `correction "match case exactly"` | observed 3 |
| restored to canonical | **200** | 3/13 | `true` | `null` | `[]` | observed 3, `COVERED` 3 |
| `GET /api/investment/coverage` (identity route) | **503** | — | — | — | — | `observation-sources-unavailable`, `[OBSERVATION_SOURCE_UNAVAILABLE]` |

Also measured on the canonical response: `datasetClass OPERATOR_SUPPLIED`, `issuers 3`, `notes.length 2`.
The **conditional** identity-unavailable note is **absent** (`identitySourcesAvailable` is `true`), so the
missing-identity disclosure that Stage 2/3 carried is gone — matching the supplied baseline. The status-line
clause `1 issuer(s) excluded from measurement by an off-vocabulary sector.` appears **only** in the two
respelled rows.

Three properties worth stating because they are the difference between disclosure and a gate:

* **`observed` and `issuers.length` never change** across all four states — nothing is dropped from the
  surface to make a number look better.
* **The route never fails.** An off-vocabulary dataset still answers 200 with the defect named in the body.
* **Serving performs no writes.** The identity directory snapshot (name, size, `mtimeMs` per entry) and the
  dataset manifest bytes are identical across three consecutive requests.

The identity route's 503 is **unchanged and correct**: its reason is `observation-sources-unavailable`, not
`identity-sources-unavailable`. Per `CPII-01`, the identity coverage surface needs B-3 (observation sources),
which is Stage 5 work; no amount of Stage 4 measurement makes it 200, and nothing here attempted to.

---

## 7. Zero fabricated figures (§21's acceptance limb)

Three independent checks. The first two are mechanical and exhaustive; the third is the hand-check §21 asks
for, with its limitation stated.

### 7.1 Every derived value recomputed from its own inputs

All nine annual periods × all eight declared derivations in `fundamentals/derive.ts`, recomputing each value
from its own inputs and comparing exactly:

```
derived values recomputed EXACTLY          49      (0 arithmetic mismatches)
derivation slots superseded by as-filed    18
correctly withheld (an input unavailable)   5
FABRICATED FIGURES                          0
```

Samples: Infosys FY2022 `EBIT = 303100000000`, `EBITDA = 337860000000`,
`FREE_CASH_FLOW = 217240000000`, `DILUTED_SHARES = 4218660560.9616`.

### 7.2 Every as-filed figure checked against the committed transcription

All three bundles' `ingest-input/periods.csv` compared cell by cell against the installed dataset:

```
issuer-periods compared                9
declared scale factors agreed          9      (source_scale CRORE → ×10⁷, all nine)
as-filed figures compared            304      (286 unit INR scaled, 18 unit INR_PER_SHARE unscaled)
MISMATCHES                             0
```

The scale rule was taken from the product, not assumed: `ingestion/builder.ts:378` applies
`meta.unit === 'INR' ? numeric * SCALE_FACTOR[sourceScale] : numeric`. `EPS_BASIC` (`lineItems.ts:128`),
`EPS_DILUTED` (`:129`) and `BOOK_VALUE_PER_SHARE` (`:169`) are `INR_PER_SHARE` and are therefore **passed
through unscaled** — a per-share figure must not be multiplied by 10⁷.

### 7.3 A first check of mine reported 18 "mismatches"; it was wrong, and the error is recorded

My first comparison applied ×10⁷ to every numeric column. It reported 18 mismatches, and all 18 were exactly
the `EPS_BASIC`/`EPS_DILUTED` rows (6 per issuer × 3 issuers). The dataset was right and my check was wrong:
per-share values are not scaled. This is recorded because a reviewer re-running a naive check will see the
same 18 lines and could otherwise read them as a scale defect. The corrected check (§7.2) uses the product's
own rule and reports zero.

An earlier variant of the derivation check reported 27 "defects" for the same class of reason: it resolved
each derivation's inputs only from as-filed values, ignoring (i) derivations that consume other derivations
(`DILUTED_SHARES` → `BOOK_VALUE_PER_SHARE`) and (ii) derivations superseded by an as-filed figure
(`TOTAL_INCOME` and `NET_CASH_FLOW` are `PRESENT` as filed, so no derivation is expected). A correct
zero-fabrication check must resolve inputs as-filed **then** already-derived, in `DERIVATIONS` declaration
order, and must skip ids the filing reports itself. §7.1 is that corrected check.

### 7.4 The hand-check's limitation, stated rather than glossed

§21 asks for five derived values hand-checked against the filings. **The filing PDFs are not committed**:
`find evidence/real-issuer -name '*.pdf'` returns nothing. The bundle READMEs cite public PDFs at stable URLs
and record page locators (`REL-1` README `:57-58` — FY2024 `INFY-INDAS-CONSOL-FY24`, filed 2024-04-18, from
`consol-fy24-annual-finstatement.pdf`, balance sheet p.1, P&L p.2, cash flow p.5) and the scale convention
(`:62-63` — `source_scale CRORE` as printed, the only transformation being ×10⁷ **performed by the ingestion
path, not by hand**), and record one worked example (`:155` — FY2024 EBITDA `36,458 + 4,678 = 41,136`).

So the hand-check was performed **against the committed transcription source** (`ingest-input/periods.csv`)
and the declared derivation arithmetic — §7.1 and §7.2 together cover all 49 derived values and all 304
as-filed figures, which is far more than five — but **not against the PDFs**, which are not in the
repository and were not fetched. What is therefore verified is *transcription → dataset → derivation*,
end to end and exhaustively. What is **not** verified here is *PDF → transcription*; that step rests on the
bundle README's own attestation and on `L-041`, which remains OPEN. No PDF-to-transcription verification is
claimed anywhere in this record.

---

## 8. Completeness, adequacy and quality per issuer (§21's "per issuer" clause)

Computed **read-only** through the pure assessment engine (`assessment/engine.ts` `assessCompany`, which
performs no I/O) on the installed dataset at as-of 2026-11-14. Nothing was minted, persisted or published:
no assessment artefact was written, no NP-04 store was touched, and D5's binding precondition was neither
asserted nor required.

| Issuer | Adequacy | `adequacyBasis` | Required-field coverage | `missingFields` | Statement coverage (P&L / BS / CF) | Violations | Quality verdict | Quality flags |
|---|---|---|---|---|---|---|---|---|
| Infosys Limited | `SUFFICIENT` | `FIELD_COVERAGE_AT_OR_ABOVE_SUFFICIENT_THRESHOLD` | 100% | 0 | PRESENT / PRESENT / PRESENT | 0 | `MATERIAL_CONCERNS` | `STALE_STATEMENTS` (HIGH) |
| Marico Limited | `SUFFICIENT` | same | 100% | 0 | PRESENT / PRESENT / PRESENT | 0 | `MATERIAL_CONCERNS` | `STALE_STATEMENTS` (HIGH) |
| KEC International Limited | `SUFFICIENT` | same | 100% | 0 | PRESENT / PRESENT / PRESENT | 0 | `MATERIAL_CONCERNS` | `CASH_FLOW_EARNINGS_DIVERGENCE` (HIGH, "operating cash flow is −68% of attributable profit"), `STALE_STATEMENTS` (HIGH) |

`requiredFieldCoveragePct` is stored as the fraction `1` and rendered as a percentage by the view layer
(`assessment/view.ts:195` multiplies by 100); the table above states the rendered value.

**§21's "adequacy per issuer" is satisfied for all three, and no issuer is `PARTIAL` or `INSUFFICIENT` on
installed data.** That is a fact about this population, not a shortfall in the ladder — see §10 scenario 2.

### 8.1 `STALE_STATEMENTS` is measured, not assumed

`engine.ts:233-235`: `dataAsOf` is `series.annual[0].periodEnd` (the series is newest-first), staleness is
the day count to the assessment clock, and the flag is raised when that exceeds
`VALUATION_POLICY.freshness.pnlDays`. The policy value is **200** days (`assessment/policy.ts:214`).
At as-of 2026-11-14:

| Issuer | Latest annual period end | Staleness days | > 200 |
|---|---|---|---|
| Infosys | 2024-03-31 | **958** | true |
| Marico | 2024-03-31 | **958** | true |
| KEC | 2026-03-31 | **228** | true |

All three exceed the window, so all three are correctly flagged. The cause is the same as `G-6`: the dataset
is **annual-only** (`quarterlyPeriods 0`). This is the flag working as designed — §23 scenario 9 expects
`STALE_DATA` caps to bind — and it is recorded as remaining action **S4-R3** because it materially limits
what any valuation on this data may claim.

### 8.2 A second divergence between two layers, measured and explained

The coverage report says Consumer's and Industrials' `EV_EBITDA` is **usable**. The assessment engine declines
`EV_EBITDA` for **all three** issuers as `CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable`. Both are
correct; they answer different questions, and the difference must not be read as a contradiction.

* **Coverage** (`measure.ts:139-176`) asks whether a method is computable for **any** issuer-period: it loops
  every issuer × every annual period and declares the method `AVAILABLE` if at least one combination has all
  its inputs. That is a fact about dataset shape.
* **Assessment** (`capitalStructure.ts` + `methods.ts:399`) resolves the capital structure at **one instant**
  — the latest annual period — and is stricter about what net debt needs.

The stricter inputs, measured at each issuer's latest annual period:

| Issuer | Latest | `SHORT_TERM_BORROWINGS` | `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` | `LONG_TERM_BORROWINGS` | `LEASE_LIABILITIES` | `CASH_AND_CASH_EQUIVALENTS` | `CURRENT_INVESTMENTS` | ⇒ `netDebt` |
|---|---|---|---|---|---|---|---|---|
| Infosys | 2024-03-31 | ABSENT | ABSENT | ABSENT | PRESENT | PRESENT | PRESENT | `MISSING: NOT_REPORTED` |
| Marico | 2024-03-31 | PRESENT | `MISSING: NOT_REPORTED` | `MISSING: NOT_REPORTED` | PRESENT | PRESENT | PRESENT | `MISSING: NOT_REPORTED` |
| KEC | 2026-03-31 | PRESENT | PRESENT | PRESENT | PRESENT | PRESENT | `MISSING: NOT_REPORTED` | `MISSING: NOT_REPORTED` |

`buildCapitalStructure` computes gross debt from **four** components (short-term borrowings, current
maturities, long-term borrowings, lease liabilities) and requires them to share one instant, and computes the
cash side from **two** (cash and cash equivalents, current investments) likewise. `derive.ts`'s `NET_DEBT`
uses **three** inputs and deliberately excludes leases and current maturities. So KEC has gross debt PRESENT
while its cash side is incomplete, and net debt is MISSING; Marico's coverage-layer availability rests on
**FY2023 alone**, the single year in which `LONG_TERM_BORROWINGS` was transcribed.

Two consequences recorded, neither repaired:

1. **"Usable" in a coverage report does not mean "a valuation would be produced".** The two layers have
   different windows and different input sets by design. Recorded as **S4-R4** for documentation, because a
   reader could otherwise infer a valuation from a coverage row.
2. **Coverage availability is existential over annual periods.** A single stale year carrying one input marks
   a whole sector's method AVAILABLE — Consumer's `EV_EBITDA` rests on FY2023 while FY2022 and FY2024 do not
   support it. This is the same class of subtlety as §4.2's shape (b), on the method axis. Changing it would
   be a measurement-policy decision, not a Stage 4 defect fix, so it is recorded (**S4-R5**) and not changed.

Method applicability measured at the assessment layer, for completeness:

| Issuer | `DCF_FCFF` | `PE_RELATIVE` | `EV_EBITDA` | `EV_REVENUE` |
|---|---|---|---|---|
| Infosys | applicable | applicable | not applicable — `CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable` | not applicable — `MANDATORY_METRIC_MISSING: TM_NRR, TM_RECURRING_REVENUE_PCT` |
| Marico | applicable | applicable | not applicable — same | not declared for Consumer |
| KEC | applicable | not declared for Industrials | not applicable — same | not applicable — `MANDATORY_METRIC_MISSING: IN_BOOK_TO_BILL` |

Every non-applicable method carries an explicit reason at both layers. No method was approximated, and no
intrinsic value or margin of safety was produced for any issuer.

---

## 9. The four gaps Stage 4 names, as served

Measured on the served surface, not inferred from source.

| Gap | Requirement | Measured position | Status |
|---|---|---|---|
| **G-4** | 0 operating-metric records ⇒ 14 of 38 slots withheld | `operatingMetricRecords 0`; Technology and Industrials each withhold a metric-dependent method naming its metric; Consumer declares no mandatory metrics and is unaffected | **Open, correctly disclosed.** Unlocking `TM_*`/`IN_*`/`BM_*` needs operating-metric data — a transcription decision (**S4-R6**), not a code change |
| **G-6** | no quarterly periods | `quarterlyPeriods 0`; consequently `STALE_STATEMENTS` binds for all three issuers (§8.1) | **Open, correctly disclosed** |
| **G-7** | sector split-brain; exact match ⇒ zero sector measurement with issuers present and no error | read path now classifies and discloses every issuer's sector; both shapes tested; served route answers 200 with offenders named | **Closed on the read side** by §4 |
| **G-12** | no price observation | `prices 0` | **Open, correctly disclosed** — Stage 5 territory (`B-4`/`B-5`) |
| **G-14** | two sector vocabularies, no lint | one vocabulary authority now reaches the read path (`findInvalidIssuerSectors`, the same classifier the ingestion guard uses) | **Substantially closed**; a lint over hand-authored rosters is still absent (**S4-R7**) |
| **G-10** | the JS-free `/investment/coverage` HTML still renders the identity-unavailable page | re-measured this stage: `GET /investment/coverage` → **503**, `text/html`, title *"Investment identity coverage unavailable"*, while the JSON investment route answers **200** | **Open, unchanged.** It is the identity surface (B-3, Stage 5), not the investment surface |

Corporate actions: `merge.actions 0`, `corporateActions 0`. Filling them is event-driven and remains an
operator act, as the baseline states.

Ingestion issues in the installed dataset: **0** (`issues.json` holds an empty list). Consequently no
`UNMAPPED_XBRL_TAG` appears and **no tag-map extension is triggered** — the baseline's "extend the tag map
only with golden-fixture discipline (L-002)" is not activated by this data, and nothing was extended.

---

## 10. The §23 ten-scenario demo, scenario by scenario

> ### CORRECTION — this section supersedes the accounting first published at head `a771290d`
>
> The first version reported **"six scenarios demonstrated on installed data, one partial, four not
> demonstrable"** in prose while its own table showed **three YES, one PARTIAL, six NO**. The statements were
> mutually inconsistent, and 6 + 1 + 4 does not equal 10. All three were wrong, and the reason matters more
> than the arithmetic:
>
> §23 assigns **every scenario its own data class in its own preamble** — *"(S) = synthetic fixture only;
> (R) = real evidence bundle; (––) = cannot run today."* Scenarios **2, 3, 4 and 7 are marked (S)**: a
> synthetic fixture is the *designated* medium for them, not a fallback for absent real data. Judging those
> four "not demonstrable" because the admitted population cannot show them applied a **stricter requirement
> than the baseline states**, and then reported that invented requirement as a blocker awaiting an owner
> population decision. Scenario 8 is marked *"fully demonstrable in fixtures; Marico/KEC show the
> Consumer/Industrials analogue on real data"* — both limbs, and both were available. Scenarios 5 and 10 carry
> their own "Today:" notes naming **IPD binding** as the blocked limb, and scenario 1's assessment chain needs
> a minted assessment. Those are Stage 5 dependencies, and Stage 4 is explicitly *"Independent: of IPD"*.
>
> The corrected accounting below is now a **committed, executable artefact** rather than a table in a
> document: `iips-platform/tests/investment/iidStage4ScenarioMatrix.test.ts` (**39 tests / 11 suites**) walks
> all ten scenarios, asserts each acceptance condition against real code, labels each scenario's data class,
> and asserts the accounting itself — so the counts can no longer drift away from the demonstrations.

### 10.1 The reconstructed matrix

| # | §23 data class | Acceptance condition (§23's own words, condensed) | Verdict | Labels | Residual limb, and its exact prerequisite |
|---|---|---|---|---|---|
| 1 | **(R, Infosys)** | observation resolves `RESOLVED`; dataset reports the issuer `COVERED`; assessment endpoint returns the chain **once minted** | **PARTIAL** | `OPERATOR_SUPPLIED REL-1-INFOSYS-2026-11-06` | the minted chain: **D2** (NP-04 store, unconfigured) and **G-11**; UI limbs **G-10**/**G-11** |
| 2 | **(S or any 2-period issuer)** | adequacy `PARTIAL`/`INSUFFICIENT`; `NO_FINANCIALS` only when truly empty; per-row reason visible | **DEMONSTRATED** | `SYNTHETIC_FIXTURE` | — |
| 3 | **(S)** | dataset `COVERED`; identity `UNMATCHED`/`ISIN_NOT_IN_ROSTER` (roster deliberately lacking one security); no assessment link | **DEMONSTRATED** | `SYNTHETIC_FIXTURE` | — |
| 4 | **(S)** | `UNMATCHED` or `AMBIGUOUS` with candidates listed; totals exclude it from assessable | **DEMONSTRATED** | `SYNTHETIC_FIXTURE` | — |
| 5 | unmarked — *"preview path works; portfolio path blocked on IPD binding"* | pre-provisioning `UNMATCHED`; after roster edit flips `RESOLVED` with **zero code change** | **PARTIAL** | `SYNTHETIC_FIXTURE` | holding persistence: **D5** (IPD binding) + **D6** (IPC endpoint) |
| 6 | unmarked | resolves `SECTOR_REFERENCE_NOT_AN_IDENTITY` — *not* "unresolved security"; no company link | **DEMONSTRATED** | `SYNTHETIC_FIXTURE` | — |
| 7 | **(S)** | MERGER/DEMERGER successor reconciliation; ratios reconcile to 1 **or the file is rejected wholesale** | **DEMONSTRATED** | `SYNTHETIC_FIXTURE` | — ; a *real* demo needs a transcribed corporate action (**G-8**/**L-031** = S4-R8) |
| 8 | unmarked — *"fully demonstrable in fixtures; Marico/KEC … on real data"* | methods `WITHHELD` naming `BM_NIM`/`GNPA`/`CET1` even with full statements; stage `G3_WITHHELD`; never approximated; no borrowed Banking verdicts | **DEMONSTRATED** (both limbs) | `SYNTHETIC_FIXTURE`, `OPERATOR_SUPPLIED WI7-CONSUMER-MARICO-2026-11-07`, `OPERATOR_SUPPLIED WI8-INDUSTRIALS-KEC-2026-11-07` | — |
| 9 | **(R, KEC debt-side)** | `NOT_REPORTED`/`NOT_COMPUTABLE` components; net debt unresolved ⇒ **bridge refuses**; adequacy `PARTIAL`; confidence caps `STALE_DATA` | **PARTIAL** | `OPERATOR_SUPPLIED WI8-INDUSTRIALS-KEC-2026-11-07` | §23 *predicts* adequacy `PARTIAL`; **measured `SUFFICIENT`** — a recorded divergence (§10.3), not a missing input |
| 10 | unmarked — *"needs Stages 2–3 + binding for real holdings"* | counts split `COVERED`/`NO_FINANCIALS`/`SECTOR_NOT_MEASURED`; identity counted separately; watchlist disclosed as sector refs; totals add up; nothing promoted | **PARTIAL** | both classes | a real-holdings portfolio page: **D5** + **D6** |

**Accounting: 6 DEMONSTRATED (2, 3, 4, 6, 7, 8) + 4 PARTIALLY DEMONSTRATED (1, 5, 9, 10) + 0 undemonstrable
= 10.**

**No scenario's residual limb is a population decision.** Every one is a Stage 5 dependency (D2, D5, D6, G-10,
G-11) or a measured divergence from a value §23 predicted. The matrix test asserts that mechanically: each
residual must match `/D2|D5|D6|G-10|G-11/` or `/divergence/`, and must **not** match
`/admit|population|more issuers|new issuer/i`.

### 10.2 What each demonstration actually asserts, measured

* **1 (R).** An observation carrying the admitted ISIN `INE009A01021`, resolved against the **real published**
  identity set (3 issuers / 3 securities / 5 listings), yields `RESOLVED`, `resolutionBasis ISIN`,
  `issuerId IN:CIN:L85110KA1981PLC013115`, `assessable true`. The same issuer's dataset row is `COVERED` with
  `annualPeriods 3` and Technology `measured: true`, on `datasetVersion sha256:3ad82918…76de2d83`. The
  observation **row** is test-constructed and labelled as such: the lanes that supply real rows (holdings,
  broker, watchlist) are **G-3/D5**-blocked. The identifiers in it were read out of the published roster, not
  written down.
* **2 (S).** The committed fixture's 2-period issuer → adequacy `PARTIAL`, basis `ANNUAL_PERIODS_2_LT_3`; its
  1-period issuer → `INSUFFICIENT`, basis `ANNUAL_PERIODS_1_LT_3`, 5 missing fields each with a reason; its
  0-period issuer → `INSUFFICIENT`, basis `NO_ANNUAL_PERIOD`, and **only** that one gets the coverage state
  `NO_FINANCIALS` while the sparse-but-present issuer stays `COVERED`. That is §23's "`NO_FINANCIALS` excluded
  states only when truly empty", exactly.
* **3 (S).** Fixture observation `B-03` carries ISIN `IN0000000029` — which the roster deliberately lacks —
  together with the symbol `AARAV`, a company the fixture dataset **does** cover (2 annual periods, `COVERED`).
  Measured: `UNMATCHED` / `ISIN_NOT_IN_ROSTER`, `issuerId null`, `assessable false`. The resolver does **not**
  fall back to the symbol, so the two positions sit side by side without being reconciled by guessing.
  **Also measured while building this:** the case cannot be manufactured by deleting a security from a roster.
  Removing the security whose ISIN an issuer declares as its `equityIsin` rejects the **entire** source set
  with `ISSUER_KEY_CONFLICT: declares equity ISIN IN0000000029 but no security with that ISIN belongs to it`.
  Loading is fail-closed, which is why the fixture carries a deliberately unrostered ISIN instead.
* **4 (S).** `H-04` → `AMBIGUOUS` / `DUPLICATE_ACTIVE_SYMBOL` with **2 candidates listed**, `issuerId null`,
  `assessable false`. `B-04` → `AMBIGUOUS_LISTING` / `MULTIPLE_SECURITIES_SHARE_LISTING`, also 2 candidates.
  Across all **18** fixture observations exactly **4** are assessable (`H-01`, `H-02`, `B-02`, `W-01`), all
  `RESOLVED`; every excluded one carries a non-null reason.
* **5.** A test-constructed imported `BROKER_PREVIEW` row (ISIN `IN0000000201`, symbol `NEWCO`) is `UNMATCHED`
  / `ISIN_NOT_IN_ROSTER` against the committed fixture; after an **in-memory** roster+listing edit it is
  `RESOLVED` / `basis ISIN` / `assessable true` — the same `resolveIdentity` function, only the source text
  differs. **Measured guard:** adding the security while the observation keeps another security's symbol does
  *not* resolve — it returns `AMBIGUOUS` / `SYMBOL_REUSED_BY_OTHER_SECURITY` with `issuerId null`. So the flip
  is a property of a *consistent* roster edit, not of any edit, and nothing is promoted.
* **6.** `W-03` (source `WATCHLIST`) and `H-05` both resolve `UNMATCHED` /
  `SECTOR_REFERENCE_NOT_AN_IDENTITY`, with `issuerId`, `securityId` and `listingId` all `null` and
  `assessable false`. Asserted *not* equal to `ISIN_NOT_IN_ROSTER`, `NO_LISTING_FOR_SECURITY` or
  `SECURITY_NOT_LISTED` — the specific class is named, not a generic "unresolved security".
* **7 (S).** The committed fixture table's `DEMERGER` successors are `[0.6, 0.4]`, summing to **1**, and its
  `MERGER` is `[1]`; `validateCorporateActionTable` accepts it with zero issues. Perturbing one weight to `0.3`
  (sum `0.8999999999999999` in binary floating point) returns `table: null` — **the whole file is rejected, not
  a filtered table with the bad row dropped** — with `SUCCESSOR_WEIGHTS_DO_NOT_RECONCILE` and the detail
  `ratios sum to 0.8999999999999999, expected 1`. The installed dataset's `corporateActions` is `0`, so the
  real-data demo stays pending a transcribed action (G-8/L-031 = S4-R8), exactly as §23's own note says.
* **8.** Fixture limb: Banking driven to `G3_WITHHELD` — statements present (`measured: true`, 1 annual
  period), `usableMethods []`, `RESIDUAL_INCOME` withheld `MANDATORY_METRIC_MISSING` naming `BM_CET1`,
  `BM_GNPA` and `BM_NIM`, every method WITHHELD with a non-null reason. Real limb: Consumer `G1_ENABLED` with
  no withheld method, Industrials `G2_PARTIAL` with `EV_REVENUE` withheld on `["IN_BOOK_TO_BILL"]`. Borrowing
  check: across all 13 sectors and all 38 methods, no sector is ever withheld on another sector's metric
  prefix, and Banking — with no issuers — is `UNMEASURED` with `usableMethods []` rather than being lent
  Technology's `G2_PARTIAL`.
* **9 (R).** At KEC's latest annual period `CURRENT_INVESTMENTS` is `presence MISSING`, `reason NOT_REPORTED`,
  `value null` — never zero. `capitalStructure.netDebt` is `MISSING`/`NOT_REPORTED`, and
  `equityValueFromEnterprise` on a present enterprise value returns `presence NOT_COMPUTABLE` with the note
  `enterprise-to-equity conversion blocked by netDebt` and `value null`: **the bridge refuses**. Confidence
  caps include `STALE_DATA` (with `combined 0.3199`) and the quality block carries `STALE_STATEMENTS`.
  Adequacy is the one divergence — §10.3.
* **10.** On the fixture with Banking's inputs removed, all three coverage states appear at once
  (`COVERED` 3, `NO_FINANCIALS` 1, `SECTOR_NOT_MEASURED` 1, `ISSUED_DATA` 0), the four states partition
  `observed` exactly, and each count equals its own row count. On the admitted dataset: `observed 3`,
  `COVERED 3`, the rest 0, partitioning exactly, with `dataset.datasetClass` = `OPERATOR_SUPPLIED`. Identity is
  counted **separately per source** — `HOLDING`, `BROKER_PREVIEW`, `WATCHLIST` — with the watchlist sector
  reference disclosed as `SECTOR_REFERENCE_NOT_AN_IDENTITY`, and 4 assessable of 18.

### 10.3 Scenario 9's divergence: §23 predicted adequacy `PARTIAL`, the admitted data says `SUFFICIENT`

Measured: KEC's adequacy is **`SUFFICIENT`** with `requiredFieldCoveragePct 1` and `missingFields []`. The
cause is exact and is not a defect in either layer: `assessment/adequacy.ts:24` defines `REQUIRED_ITEMS` as
nine statement fields — `REVENUE_FROM_OPERATIONS`, `EBITDA`, `NET_PROFIT`,
`NET_PROFIT_ATTRIBUTABLE_TO_OWNERS`, `TOTAL_EQUITY`, `TOTAL_ASSETS`, `OPERATING_CASH_FLOW`,
`CAPITAL_EXPENDITURE`, `EPS_DILUTED` — and **none of the debt-side components is among them**. KEC therefore
covers 100% of the required fields while its capital structure is incomplete.

The incompleteness §23 was pointing at is real and is demonstrated (`NOT_REPORTED` components, a refused
bridge, a `STALE_DATA` cap); it simply does not reach the adequacy ladder. This is recorded as a **divergence
between a baseline prediction and measured truth** — which is what §23's "current truth" column exists for —
and the matrix test pins it, including the assertion that none of the four debt-side items is in
`REQUIRED_ITEMS`. Adding them would be a valuation-policy decision, not a Stage 4 demonstration act, and
relaxing the scenario to match the measurement would be weakening an acceptance criterion. Neither was done.

### 10.4 Labelling, enforced mechanically rather than in prose

§23 line 699: *"Fixture-vs-real labelling in any demo shown to the owner: fixtures = `SYNTHETIC_FIXTURE` chip;
evidence bundles = `OPERATOR_SUPPLIED` with bundle name. **No synthetic figure is to be cited as coverage.**"*

The matrix test enforces all three clauses:

1. **Label form.** Every scenario carries at least one label, and every label is either exactly
   `SYNTHETIC_FIXTURE` or `OPERATOR_SUPPLIED <bundle>` for one of the three admitted bundle names. A scenario
   marked `(S)` must carry *only* the synthetic label; one marked `(R)` must carry only operator-supplied ones.
2. **No synthetic figure cited as coverage.** The installed dataset's issuer set is asserted to be **exactly**
   the three admitted CINs; none of the fixture's issuers appears in it; its `datasetVersion` is the
   host-verified value; and its manifest declares `sourceRights.state OPERATOR_ASSERTED`.
3. **The classes are visibly distinct.** Every fixture issuer's legal name ends in `(synthetic)` and no
   admitted issuer's name contains it. And the served report labels **itself**: passing the admitted manifest
   yields `dataset.datasetClass OPERATOR_SUPPLIED`, passing a fixture manifest (provider `test-fixture`,
   licence `synthetic; not redistributable`, `sourceRights.state SYNTHETIC`) yields `SYNTHETIC_FIXTURE`, and
   passing no manifest yields `NONE` — never a guess, and never `OPERATOR_SUPPLIED`.


## 11. Tests, typechecks and validators — exact counts

All measured in this sandbox at head `316da977` plus the changes described above. Each number is the tail of
a real run, not a transcription from an earlier record.

| Gate | Command | Result | Baseline at `316da977` |
|---|---|---|---|
| Platform IID suite | `npm run test:iid` | **1103 tests / 241 suites / 1103 pass / 0 fail** *(superseded by §11.2: 1142 / 252 after the S4-R1 matrix suite)* | 1061 / 233 |
| Platform full suite | `npm test` | **678 tests / 678 pass / 0 fail** | 678 / 678 |
| Platform typecheck | `npm run typecheck` | **exit 0** | exit 0 |
| IID-0 constraints | `npx tsx --test tests/investment/constraints.test.ts` | **6 tests / 6 pass / 0 fail** | 6 / 6 |
| **NEW** vocabulary read path | `npx tsx --test tests/investment/sectorVocabularyReadPath.test.ts` | **42 tests / 8 suites / 42 pass / 0 fail** | — |
| **NEW** served coverage route | `npx vitest run server/investment/iidStage4ServedCoverageRoute.test.ts` | **11 tests / 11 pass** | — |
| Frontend typecheck | `npx tsc --noEmit` | **exit 0** | exit 0 |
| Frontend full suite | `npx vitest run` | see §11.1 | 2836 tests / 198 files |
| PowerShell conformance | `ps-conformance.py` over the four governed `IID-STAGE*` scripts | **PASS — 0 rule failures across 4 files** (nodes 21374) | PASS |
| Document-evidence validator | `doc-evidence-validate.py` | **PASS (0 failures), 234 assertions** | PASS, 161 |

### 11.2 S4-R1 correction: every gate re-run, not transcribed

The §10 correction changed a committed test surface, so all gates were re-run from scratch at the corrected
head. **No number below is carried over from §11.**

| Gate | Command | Result |
|---|---|---|
| Platform IID suite | `npm run test:iid` | **1142 tests / 252 suites / 1142 pass / 0 fail** |
| Platform full suite | `npm test` | **678 tests / 678 pass / 0 fail** |
| Platform typecheck | `npm run typecheck` | **exit 0** |
| IID-0 constraints | `npx tsx --test tests/investment/constraints.test.ts` | **6 tests / 6 pass / 0 fail** |
| **NEW** §23 scenario matrix | `npx tsx --test tests/investment/iidStage4ScenarioMatrix.test.ts` | **39 tests / 11 suites / 39 pass / 0 fail** |
| Vocabulary read path | `npx tsx --test tests/investment/sectorVocabularyReadPath.test.ts` | **42 tests / 8 suites / 42 pass / 0 fail** |
| Frontend typecheck | `npx tsc --noEmit` | **exit 0** |
| Frontend full suite | `npx vitest run` | **2847 passed \| 1 skipped (2848), 199 files passed \| 1 skipped (200)** — 243.94 s |
| PowerShell conformance | `ps-conformance.py` over the four governed `IID-STAGE*` scripts | **PASS — 0 rule failures across 4 files** |
| Document-evidence validator | `doc-evidence-validate.py` | **PASS (0 failures)** |

Platform IID grew by exactly the new suite's **39 tests / 11 suites** (1103→1142, 241→252) and by nothing else,
which is itself a check: no existing test was edited, skipped or relaxed to make room.

Two hygiene notes, both measured rather than assumed. The frontend suite again rewrote the two committed
`evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/zero-socket-{control,test}.json` files; both were restored with
`git checkout -- evidence/` and `git status --porcelain evidence/` was verified empty before committing, so
**this change touches no file under `evidence/`**. And the four governed PowerShell scripts are
`IID-STAGE2-IDENTITY-PROVISION.ps1`, `IID-STAGE3-WINDOWS-INSTALL.ps1`, `IID-STAGE3-WINDOWS-VERIFY.ps1` and
`IID-STAGE3-WINDOWS-VERIFY.Tests.ps1`; the two `diagnose-*.ps1` scripts fail that checker for pre-existing
reasons unrelated to this work and were deliberately left out of scope and untouched.

Changed and added files:

```
 1  0  frontend/server/investment/iidInvestmentCoverageTransport.test.ts
55  1  iips-platform/src/investment/coverage/investmentCoverage.ts
72  1  iips-platform/src/investment/coverage/measure.ts
 1  0  iips-platform/tests/investment/investment-coverage-endpoint.test.ts
new    frontend/server/investment/iidStage4ServedCoverageRoute.test.ts    355 lines
new    iips-platform/tests/investment/sectorVocabularyReadPath.test.ts    645 lines
```

### 11.1 The frontend full-suite number

Recorded separately because it is the longest gate, and re-run to completion after every change in this
record: `npx tsc --noEmit` → **exit 0**, then `npx vitest run` →

```
Test Files  199 passed | 1 skipped (200)
     Tests  2847 passed | 1 skipped (2848)
  Duration  259.69s
```

That is **+11 tests and +1 file** over the `316da977` baseline of 2836 tests / 198 files, and the difference
is exactly the new `iidStage4ServedCoverageRoute.test.ts`. No pre-existing frontend test changed status.

### 11.2 Four validator pins had to move, and why

`doc-evidence-validate.py` pins evidence to exact source lines. Adding the `offVocabularyIssuers`
documentation block and field shifted four of them, and the validator correctly failed:

| Pin | Was | Now | Verified by direct inspection |
|---|---|---|---|
| `measure.ts` declares `SectorStage` | `:35` | **`:36`** | `export type SectorStage = 'G1_ENABLED' \| 'G2_PARTIAL' \| 'G3_WITHHELD' \| 'UNMEASURED';` |
| `investmentCoverage.ts` declares `measuredSectors` | `:121` | **`:140`** | `readonly measuredSectors: number;` |
| `investmentCoverage.ts` populates it | `:381` | **`:431`** | `measuredSectors: sectorReport.completedMeasurements.length,` |
| the identity-unavailable note is gated on identity availability | `:344` | **`:385`** | `if (!identitySourcesAvailable) {` |

The pins were updated to the measured lines and each was re-read from the file; the validator then passed all
234 assertions. No assertion was weakened or deleted to obtain a pass.

### 11.3 Two harnesses that were run and deleted

Both were scratch files, neither was committed, and both were confirmed absent with
`find . -name "__*.ts"` (no results):

* `frontend/server/investment/__stage4.ts` — served real HTTP through the composition root and produced the
  §6 table. Replaced by the durable `iidStage4ServedCoverageRoute.test.ts`, which proves the same thing
  inside the committed suite.
* `iips-platform/src/investment/coverage/__before.ts` — captured the BEFORE column of §4.4.

The measurement scripts behind §3, §5, §7 and §8 live outside the repository (`/tmp/s4/*.ts`) and are not
committed. Their outputs are transcribed here with the commands that produced them named.

### 11.4 One side effect of running the frontend suite, and its correction

The frontend suite rewrites two committed evidence files as a side effect of a pre-existing test:
`evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/zero-socket-control.json` and `zero-socket-test.json` gain a
fresh `generatedAt`, `pid` and port list. This was detected by `git status --porcelain` after the run and
reverted with `git checkout -- evidence/`. The final tree contains **exactly** the four modified and two new
files listed above and **no evidence modification**. This is a pre-existing property of that suite, not
something this change introduced, and it is recorded so that a future run is not mistaken for tampering.

---

## 12. Boundary confirmations

1. **No prior record was modified.** The protected set — the primary baseline assessment, `CPII-01`, the
   Stage 2 reassessment, the Stage 2 host-provision evidence, the Stage 3 readiness records, the O3 decision
   and the limitation register — is unchanged; `git diff --quiet HEAD -- docs/integration` is clean for every
   file this record does not add.
2. **No evidence bundle was modified.** `evidence/real-issuer/**` is untouched; the only evidence files the
   test suite rewrote were reverted (§11.4).
3. **The Stage 3 published dataset was not reinstalled, and the identity publication was not repeated.** Both
   are prior evidence. The publication measured in §2 was performed into a fresh sandbox root
   (`/tmp/stage4-served`), not over any host artefact.
4. **No SQLite database was created, opened for write, or named as a chosen technology.** IID-0 forbids even
   naming a persistence technology; D2's NP-04 store was left exactly as found — unconfigured, and still
   reported as such.
5. **No resolver rule was widened and no source observation was fabricated** to force a 200. The identity
   route still answers 503 for its own reason (§6).
6. **No organisational governance, committee approval, multi-user or SaaS construct, and no production
   deployment requirement** was introduced. Where a document said "owner context", the runtime requirement
   was determined instead (D3/D4 in the companion record) and left with its owner.
7. **No unrelated IPO Screening Engine concept** was imported, and **no architecture outside Stage 4** was
   created. The change is two files in the existing coverage module plus their tests.
8. **D5 and D6 were neither asserted nor worked around.** Both are IPD-owned; Stage 4 is explicitly
   independent of IPD.
9. **PR #562 remains OPEN and UNMERGED.** Merging is an owner act.
10. **Nothing here claims a Windows-host execution.** Every measurement in this record was performed in this
    sandbox. The host facts remain those recorded in
    `IID-STAGE2-WINDOWS-HOST-PROVISION-EVIDENCE-2026-11-14.md` and
    `IID-STAGE3-WINDOWS-HOST-ACCEPTANCE-EVIDENCE-2026-11-14.md`, and R-1/R-2 remain open.

---

*End of evidence record. Published additively; the records it measures against are unchanged, byte for byte.*
