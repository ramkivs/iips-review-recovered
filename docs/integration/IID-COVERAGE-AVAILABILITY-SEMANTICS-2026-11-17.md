# IID Stage 4 — `S4-R5`: historical method availability versus latest-period readiness

**Date:** 2026-11-17 · **Authority:** IRR only (this repository) · **Item:** `S4-R5` (Stage 4 coverage register)
**Decision owner:** the owner of this installation. **Recorded by:** IRR, on the owner's instruction, in this item.
**Register:** `IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md` row `S4-R5`; tracker `§16.296` (`CV-CORR-261`,
`CHG-2026-11-06-24`, `V2182`–`V2189`).
**Predecessors:** `S4-R4` (`IID-COVERAGE-USABLE-VERSUS-VALUATION-2026-11-17.md`), `S4-R2`, `S4-R3`.

---

## 1. The decision

> **Retain existential annual-period coverage semantics.**
>
> A method is **historically `AVAILABLE`** when **at least one** eligible (issuer, annual period) pair satisfies the
> inputs that method declares. That is a statement that the *dataset* carries the inputs somewhere in the issuer's
> reported history. It does **not** guarantee a valuation on the latest applicable data.
>
> **Historical method availability** and **latest assessment readiness** are two different facts and stay distinct in
> what this installation computes, serves and displays. Missing, stale, incomplete or invalid *latest* inputs continue
> to produce withholding or blocking outcomes.

This closes `S4-R5` as an **open measurement-policy question**. It does **not** change the measurement: the code
already implemented existential semantics (§3), and the decision retains them. What the decision changes is the
*reporting obligation* — a report may no longer leave a reader to infer "latest" from a number that means "ever" (§6).

## 2. Why the question arose

`S4-R4` recorded the difference between coverage and assessment and, in doing so, exposed the second-order question.
On the repository dataset of record (`sha256:69bbc14e…`) Consumer's `EV_EBITDA` is `AVAILABLE` because **one** year
(FY2023) carries the borrowings lines that `NET_DEBT` derives from. The latest Consumer annual period, FY2024, does
not. So:

* the coverage counter says **Consumer: 3 usable / 0 withheld**, and
* the same dataset's Consumer issuer is **not** latest-ready for that method, and
* an assessment of the latest period refuses it.

Both statements were correct. Only the *presentation* conflated them: `usableMethods` counted the method, the UI label
said "Methods usable", and nothing said **which period** the method was usable *at*. A reader could reasonably — and
wrongly — read the counter as readiness.

## 3. What "existential" means in the code, exactly

`measureCoverage` walks every measured sector's declared methods. For each method (`measureMethod`,
`iips-platform/src/investment/coverage/measure.ts:111-175`) it iterates the sector's issuers × their annual periods,
and pushes an issuer into `available` as soon as a single period satisfies the declaration
(`measure.ts:146`). The method is `AVAILABLE` when that set is non-empty (`measure.ts:166`); otherwise it is
`WITHHELD` with a named reason (`NO_DATA_FOR_SECTOR`, `STATEMENT_INPUT_MISSING`, `MANDATORY_METRIC_MISSING`,
`METRIC_UNVALIDATED`).

"Declared inputs" are the method's `lineItems` and `metrics` in `coverage/methodMatrix.ts`. "Satisfied" means every
declared line item is `PRESENT` **with a number** at that period end (as filed or produced by the closed derivation
set) and every declared operating metric is `VALID` for that issuer and period end. A declared nil, an absent key and
an unvalidated metric are all failures — never a zero.

**This was verified, not assumed, before any edit** (§5). Nothing in the decision required the measurement to move, and
it did not move.

## 4. The two concepts, defined so they cannot be swapped

| | **Historical method availability** | **Latest-period readiness** |
|---|---|---|
| Question | does the dataset carry this method's inputs *somewhere* in the eligible history? | does the **newest** annual period carry them? |
| Scope | any (issuer, annual period) pair, in any year on record | the newest annual period end per issuer |
| Produced by | `measureMethod` — the coverage measurement (`usableMethods`, sector `stage`) | `qualificationOf`'s `latestPeriodQualified` — reported per issuer, disclosure only |
| Answers | a dataset-**capability** statement | a **usability** statement about one period |
| Is a valuation? | no (`S4-R4`) | no — assessment decides that, with its own instant/bridge/history/blend rules |
| Effect of a gap | method withheld, reason named | method not latest-ready, period named |

A third fact, deliberately untouched here, sits alongside both: **assessment readiness** (`assessment/engine.ts`) — whether
a figure can actually be computed at the assessment instant. `S4-R4` governs that distinction and it is unchanged.

## 5. What was verified before the correction (and did not change)

1. **The measurement already implemented the retained semantics.** No policy, threshold, window, formula or eligibility
   rule was edited.
2. **The measurement itself did not move.** `measureCoverage`'s report and its rendered summary hash **identically**
   before and after this item's edits, on both served datasets, measured with one script run twice:
   `84869d96…` / `b92ea944…` for `sha256:69bbc14e…` and `3a1142b2…` / `7f5dec15…` for `sha256:bdfb2527…`. The first
   value of each pair reproduces `S4-R4`'s recorded measurement digest exactly, so the two records agree on the
   measurement. (The summary value is this item's own measurement with its own hash encoding; it is evidence of
   before-after identity, not a re-derivation of `S4-R4`'s differently-encoded summary digest.)
   The **read model** necessarily did change — it gained the disclosure fields of §6 — so only the *measurement* is
   claimed unchanged here. That the read model still re-states the measurement's sector states and counters exactly is
   asserted two ways instead: regression test 9 compares the served sector table against `measureCoverage` field by
   field, and the evidence run checks the same equality on the real datasets (`existentialCheck: true`).
3. **The existential rule is now a shared predicate rather than a duplicated filter.** `missingInputsFor` (`measure.ts:365`)
   is the single definition of "this period qualifies"; `measureMethod` calls it, and so does the new
   `qualificationOf` (`measure.ts:407`). The measurement's observable output is unchanged by that extraction (item 2),
   and both declarations were appended **below** every existing line, so the Stage 4 records' line references to this
   file still resolve (`measureMethod` is still at 111; nothing above it moved).

## 6. The reporting gap this item found, and the smallest correction

**Gap.** The served report disclosed *counts* (`usableMethods`, `withheldMethods`, sector `stage`) and the issuer rows
disclosed *counts of data* (`annualPeriods`, `latestPeriodEnd`, `freshness`) — but **nothing joined them**. Neither the
report nor any rendered surface said that a usable method may rest on an earlier period, and no per-issuer statement
existed of what the latest period supports. The UI label "Methods usable / withheld" invited exactly the wrong reading.

**Correction — disclosure only, computed from inputs that already existed.** No new data source, no re-measurement, no
new eligibility rule, no issuer-specific path.

* `iips-platform/src/investment/coverage/measure.ts` — `qualificationOf` (`:407`) returns the qualifying
  (issuer, period) pairs newest-first, the newest period in scope, and whether that period itself qualifies. It is
  the measurement's own predicate, so the two answers cannot drift.
* `iips-platform/src/investment/coverage/investmentCoverage.ts` —
  * every issuer row carries `methodAvailability` (`:133`), computed by `methodAvailabilityFor` (`:361`) and attached
    at `:566`: `basis` (`SECTOR_METHODS` | `NO_SECTOR_METHODS` | `NO_ANNUAL_PERIODS`), `latestPeriodEnd`,
    `annualPeriodsConsidered`, `primaryMethod` (`historicallyAvailable` **and** `availableAtLatestPeriod`),
    and three disjoint method lists — `latestPeriodAvailable`, `earlierPeriodsOnly`, `neverAvailable`;
  * the report declares its semantics machine-readably (`availabilitySemantics: 'EXISTENTIAL_ANNUAL_PERIOD'`,
    `:216`/`:665`) and appends one note stating the reading rule and the non-substitution prohibition (appended
    last, so every note already published keeps its position on the served payload).
* `frontend/src/api/investmentCoverageInvestment.ts` — the projection types both additions as **optional**, so a report
  served before this change still renders.
* `frontend/src/features/investment/InvestmentCoveragePage.tsx` — the Sector measurement section states that
  availability is historical (`:338`) and names the column that separates it; the issuer table gains
  *Method availability (historical vs latest period)* (`:383`), rendered by `MethodAvailabilityCell` (`:89`) as
  *N at latest (period) · M earlier period(s) only · K never available*, with the earlier-only method ids listed;
  the financial-coverage row is relabelled *Methods historically available / withheld* (`:460`) with a one-paragraph
  reading note. An absent block renders `not reported`, never `0`.
* `frontend/src/features/investment/IdentityCoveragePage.tsx` and the two server HTML views
  (`coverage/investmentCoverageView.ts`, `identity/coverageView.ts`) carry the **same** relabelled counter, and the
  coverage HTML view states the same reading rule — the label must not mean two things on two surfaces.

## 7. Regression tests

`iips-platform/tests/investment/s4r5-availability-semantics.test.ts` — **10 tests, all passing** (run with
`npm run test:iid` in `iips-platform`). Each injects its own defect into the committed synthetic fixtures, so no shared
fixture changed meaning:

| # | Test | What it proves |
|---|---|---|
| 1 | a method carried only by an **earlier** annual period keeps the sector `AVAILABLE` | the retained semantics are the live ones; this fails if availability is silently narrowed to the latest period |
| 2 | the same method is `WITHHELD` once **no** period carries its inputs | absence is named (`STATEMENT_INPUT_MISSING`, `missing` includes the item) and never zero-filled |
| 3 | an earlier-only method is reported as earlier-only, with the latest period named | the report states the opposite fact to #1 for the same dataset; the three lists are disjoint and complete |
| 4 | latest-period readiness is independent of the historical verdict | same issuer, same sector: one method latest-ready, two earlier-only |
| 5 | the primary method is stated both ways | `historicallyAvailable: true` with `availableAtLatestPeriod: false` is a reachable, tested state |
| 6 | `qualificationOf` names the periods availability rests on, newest first | the period is auditable, and ordering cannot depend on input order |
| 7 | a second issuer in a **different** sector gets the block from the same generic path | issuer-neutral: no id, name or sector is special-cased |
| 8 | an issuer with no annual period says so | `NO_ANNUAL_PERIODS` instead of an ambiguous empty set |
| 9 | the report declares its semantics and re-states the measurement unchanged | no re-measurement, no narrowing; the reading note is present and prohibitive |
| 10 | every dataset issuer still carries a row, and now a disclosure | additive, not substitutive |

Full IID suite: **1526/1526** (1516 before + 10). `iips-platform` `tsc --noEmit` clean.

## 8. Evidence on the served datasets

Bundle: `evidence/real-issuer/S4-R5-HISTORICAL-VERSUS-LATEST-2026-11-17/` — `runs/availability-by-issuer.json`
plus the README. Both datasets ingested from the committed ingest inputs at clock `2026-11-17T00:00:00Z`; the report's
sector counters were checked equal to `measureCoverage`'s own (`existentialCheck: true` on both).

| dataset | issuer (sector) | latest period | latest-ready | earlier-only | never available |
|---|---|---|---|---|---|
| `sha256:69bbc14e…` | Marico Limited (Consumer) | 2024-03-31 | `DCF_FCFF`, `PE_RELATIVE` | **`EV_EBITDA`** | — |
| `sha256:69bbc14e…` | KEC International (Industrials) | 2026-03-31 | `DCF_FCFF`, `EV_EBITDA` | — | `EV_REVENUE` |
| `sha256:69bbc14e…` | Infosys Limited (Technology) | 2024-03-31 | `DCF_FCFF`, `PE_RELATIVE` | — | `EV_EBITDA`, `EV_REVENUE` |
| `sha256:bdfb2527…` | Marico Limited (Consumer) | 2026-03-31 | `DCF_FCFF`, `EV_EBITDA`, `PE_RELATIVE` | — | — |
| `sha256:bdfb2527…` | KEC International (Industrials) | 2026-03-31 | `DCF_FCFF`, `EV_EBITDA` | — | `EV_REVENUE` |
| `sha256:bdfb2527…` | Infosys Limited (Technology) | 2024-03-31 | `DCF_FCFF`, `PE_RELATIVE` | — | `EV_EBITDA`, `EV_REVENUE` |

The first row is the whole point of `S4-R5` in one line: on `69bbc14e…` Consumer's counter reads **3 usable / 0
withheld**, while only **two** of those three methods are ready at the newest Consumer period. The `S4-R3` filing
refresh (`bdfb2527…`) makes Marico latest-ready for all three — the same code, a different dataset, and the
distinction remains legible in both directions.

## 9. What this item did **not** do (prohibitions, kept)

* No change from existential to latest-period coverage; **no** change to any valuation formula, weight, threshold,
  cap or freshness window.
* **No** weakening of assessment eligibility or withholding; **no** missing→zero and **no** substitution of an older
  value for a missing latest input; **no** silent reuse of a stale period.
* **No** issuer-specific code. The disclosure is computed for whatever the dataset holds; the tests prove it on two
  sectors and three fixture issuers with no id, name or sector branch.
* **No** issuer admission, dataset construction, source-rights change, O3 authorisation, host install or production
  operation.
* **No** pre-emption of `S4-R6` (operating metrics / `G-4`), `S4-R7` (roster lint / `G-14`) or `S4-R8` (corporate
  actions). `S4-R2` stays **CLOSED**; `S4-R3` / `S4-R3-Infosys` stay **OPEN** and their conditions are untouched;
  `S4-R4`'s contract is unchanged and is *strengthened* only by being pointed at from more surfaces.
* `L-001` (3 of 13 measured sectors), `G-6`, `L-041`, `L-042` unchanged.

## 10. What this document does not claim

That the population is complete or representative. That any valuation is current (`S4-R3` is OPEN; all three issuers
exceed the 200-day statement window). That `latestPeriodAvailable` implies an assessment will produce a figure — it does
not (`S4-R4`), and a method can be latest-ready and still `NOT_COMPUTABLE` at the assessment instant. That the
`derive.ts` question (should a declared nil for `NET_DEBT` be admitted?) is decided — it remains reserved, and this
item neither needed nor took it. That a coverage/assessment divergence is a defect: it is two correct answers to two
different questions, and the only fault addressed here was a reader being left to guess which question a number
answered.

## 11. Remaining limitation

The disclosure is per issuer and per method id; it is not a per-period time series, so a reader cannot see *which*
earlier year carries an earlier-only method without the coverage evidence. The `basis` field names the two empty cases
(no sector methods, no annual period) but does not distinguish "sector off-vocabulary" from "no methods declared" —
the former is already disclosed separately on the report (`offVocabularyIssuers`) and by the issuer row's `sector`.
Both are reading limits, not measurement gaps. The real remainder of Stage 4 is unchanged: `S4-R6` (`G-4` operating
metrics, 14 of 38 method slots withheld), `G-6` freshness, and `L-001`'s 3-of-13 population.
