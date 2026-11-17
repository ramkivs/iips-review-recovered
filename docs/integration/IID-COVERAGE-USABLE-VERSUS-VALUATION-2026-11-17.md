# IID — coverage `usable` is not a valuation (`S4-R4`)

**Status:** the committed source-level record `S4-R4` was registered for. **S4-R4 CLOSED** on its own criterion — *"a
source-level note in the coverage module stating the window difference"*, *"the note committed"*. The note is in
`iips-platform/src/investment/coverage/measure.ts` (the module that computes `usableMethods`) and
`iips-platform/src/investment/coverage/investmentCoverage.ts` (the read model that serves it); this document is the
long-form explanation both point at.

**Authority:** IRR-only. No IPD write, no issuer admitted, no source re-downloaded, no production behaviour changed.
**Nothing here decides anything**: `S4-R5` remains an **OPEN owner decision**, and this document is written so that
either answer to it leaves every statement below true (see §12).

**Base:** `main` `5b67827385d7ea8378cfd7dcf5c13274a5cf9904`. Every figure below was produced at that head by the
commands in §14 and reproduces from the committed inputs named there.

---

## 1. The two questions, stated once

There are two layers in this platform that both talk about "what can be valued", and they are not the same layer.

| | **Coverage** — `coverage/measure.ts` → `measureCoverage` | **Assessment** — `assessment/engine.ts` → `assessCompany` |
|---|---|---|
| The question | *Could this method be computed for **some** issuer-period in this dataset?* | *Does it produce a value for **this** issuer at **this** clock, under the current policy?* |
| The unit | a sector, over **every** annual period of **every** issuer in it | one issuer, one series, one latest instant |
| The window | **existential** — one qualifying period is enough (`measure.ts:166`) | the **newest** annual period for inputs, plus the history each method demands |
| The input set | the method's declared `lineItems` + `metrics` (`methodMatrix.ts`) | the derivation set, the capital-structure aggregation, the policy, the blend |
| The output | `AVAILABLE` / `WITHHELD` + a reason code | `applicable` + a per-share output, or a named `notApplicableReason`, or `NOT_COMPUTABLE` |
| What a reader may conclude | *the dataset's declared inputs are present somewhere* | *a value was, or was not, produced* |

The one-sentence version, which is the whole of `S4-R4`:

> **Coverage `usable` is a statement about the dataset's inputs. A valuation is a statement about one issuer at one
> clock. A method must never be presented as successfully valued merely because coverage marks it usable.**

## 2. What `usable` means, exactly (observed behaviour)

Read from the code, not from the label:

1. **`usable` is per method, not per sector.** `usableMethods` is the set of `MethodMeasurement`s whose `state` is
   `AVAILABLE` (`measure.ts:256`). The sector `stage` is a summary of that set — `G1_ENABLED` when nothing in the
   sector is withheld, `G2_PARTIAL` when something is (`measure.ts:262-264`). The report says so in its own published
   `methodLevelNote`: *"A sector stage of G1/G2 describes how far the sector has been enabled for measurement; it does
   not mean every method in the sector is usable."*
2. **A method is `AVAILABLE` when at least one (issuer, annual period) pair carries every declared input.**
   `measureMethod` loops issuers × annual periods and pushes the issuer into `available` as soon as one period is
   complete for that issuer; `if (available.length > 0)` returns `AVAILABLE` (`measure.ts:111-175`). This is the
   **existential window**, and it is the subject of the pending `S4-R5` decision — not of this one.
3. **"Present" means a number, and only a number.** `presentLineItem` requires
   `presence === 'PRESENT' && value !== null` (`measure.ts:94-97`). A declared nil, a `MISSING: NOT_REPORTED` cell and
   a `NOT_COMPUTABLE` derivation are all *not present* to coverage.
4. **A derived item counts, and only if the derivation actually produced a number.** Coverage reads
   `period.values[item] ?? period.derived[item]`, and `deriveLineItems` refuses to derive while any hard input is not
   `PRESENT` (`fundamentals/derive.ts:95-120`). So `NET_DEBT` in coverage is the **v0 three-input derivation**
   (`LONG_TERM_BORROWINGS + SHORT_TERM_BORROWINGS − CASH_AND_CASH_EQUIVALENTS`), which deliberately excludes lease
   liabilities and current maturities.
5. **Only `ANNUAL` periods are measured.** `annualPeriods` filters `period.periodType === 'ANNUAL'`
   (`measure.ts:226-228`). A dataset that carried only quarters would measure zero sectors — `quarterlyPeriods` is
   invisible to coverage today.
6. **A metric must be `VALID` at *any* annual period end.** `validMetric` accepts a record whose `validation` is
   `VALID`, at the period end it is asked about, for any annual period (`measure.ts:99-109`).
7. **The served counters are vocabulary counts as well as dataset facts.** `financialCoverage.usableMethods` /
   `withheldMethods` count **method slots across all 13 sectors**, including sectors with no issuers (their methods are
   `WITHHELD / NO_DATA_FOR_SECTOR`); `derivationItems` is `DERIVATIONS.length` (**8**) and `xbrlMappedTags` is
   `Object.keys(XBRL_TAG_MAP).length` (**22**) — those two are *constants of the code*, not measurements of the
   dataset (`identity/coverage.ts:146-149`). On both datasets used here, the served line reads **`7 / 31`**.

## 3. What `usable` does not guarantee

Each of these is true today and is *not* implied by `AVAILABLE`:

1. that **any** issuer can be valued — coverage is a sector-level capability statement;
2. that the **latest** period supports the method — one old year is enough (§2.2);
3. that a **number will be produced** — the assessment's aggregation, bridge and blend each can refuse (§5);
4. that the **engine implements** the method family — six matrix methods have no engine-v1 implementation (§5, D6);
5. that the resulting valuation is **current** — `S4-R3` freshness is a separate limb (§11);
6. that the **data feeding it is complete** — coverage only asserts each declared input is present somewhere.

## 4. How coverage differs from a latest-period assessment, in one worked pair

**Same issuer, same data, opposite answers.** Infosys on the repository dataset of record
`sha256:69bbc14e…`, clock 2026-11-17:

| Layer | `EV_EBITDA` | Why |
|---|---|---|
| Coverage (Technology) | **`WITHHELD` / `STATEMENT_INPUT_MISSING: ["NET_DEBT"]`** | `derive.ts` cannot produce `NET_DEBT`: FY2024 carries `LONG_TERM_BORROWINGS` and `SHORT_TERM_BORROWINGS` as `NIL_BY_DISCLOSURE`, and a declared nil is not a number. |
| Assessment | **applied** — inputs `ebitda PRESENT ₹41,136 cr`, `netDebt PRESENT −₹19,342 cr` | `buildCapitalStructure` admits a declared nil under **D-2**; gross debt ₹8,359 cr, cash+investments ₹27,701 cr, net debt −₹19,342 cr (the payload's own note: *"components declared nil by the filer, counted as zero under the capital-structure aggregation contract"*). |
| Consequence | intrinsic **875.34 / 1,088.97 / 1,399.81** per share, with `EV_EBITDA` at weight **0.1** | the blend ran on a method that coverage withholds |

**The inversion is the lesson:** in this population the *only* valuation produced belongs to the issuer whose coverage
row **withholds** the method that helped produce it. A reader who took the coverage row as a valuation statement would
have concluded the opposite of what the assessment published.

## 5. The complete divergence catalogue

Six classes. Each is a rule difference, not an error; each direction is real.

| # | Class | Coverage rule | Assessment rule | Live instance at this head |
|---|---|---|---|---|
| **D1** | **Window** — existential vs latest | any one annual period with all declared inputs (`measure.ts:111-175`) | component-wise newest informative period, then a **same-instant** invariant (`capitalStructure.ts:85-92`, `:126`, `:175`) | **Marico** on `69bbc14e…`: coverage Consumer `G1_ENABLED`, `EV_EBITDA AVAILABLE` (supported by FY2023); assessment `CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable` (FY2024 `LONG_TERM_BORROWINGS` is `MISSING: NOT_REPORTED`) |
| **D2** | **Nil disclosure** — numeric derivation vs aggregation permission | derivation accepts `PRESENT` only (`derive.ts:95-120`) | aggregation admits `NIL_BY_DISCLOSURE` as zero, named in the aggregate note (`capitalStructure.ts:21-36`) | **Infosys** on `69bbc14e…` — §4 above: coverage withheld, assessment applied |
| **D3** | **Input set** — three inputs vs six components | `NET_DEBT` = LTB + STB − cash | gross debt = STB + current maturities + LTB + **leases**; cash side = cash + **current investments**; both sides at one instant | **KEC** (both datasets): coverage `EV_EBITDA AVAILABLE` (derivation triple present at FY2026); assessment `CAPITAL_STRUCTURE_INCOMPLETE` because `CURRENT_INVESTMENTS` is `MISSING: NOT_REPORTED`. **Marico** on `bdfb2527…` for the same reason (`CURRENT_MATURITIES_OF_LONG_TERM_DEBT` `NOT_REPORTED`) |
| **D4** | **Operating metrics** | any annual period, `validation === 'VALID'` (`measure.ts:99-109`) | **latest** annual period **and** a source-class floor (`methods.ts:125-150`) | **none live** — `operatingMetricRecords` is 0 (`G-4`/`S4-R6`). Code-level today, live the moment metrics are admitted |
| **D5** | **Applicability vs output** | n/a | `applicable: true` can still publish `output.perShareMid = NOT_COMPUTABLE` when the enterprise-to-equity bridge refuses (`capitalStructure.ts:419-440`) | **all three issuers** on `bdfb2527…`: `DCF_FCFF` applicable, per-share `NOT_COMPUTABLE`, note *"enterprise-to-equity conversion blocked by netDebt"* |
| **D6** | **Engine coverage of the matrix** | `AVAILABLE` needs only declared inputs | six matrix method families are `METHOD_NOT_IMPLEMENTED_IN_ENGINE_V1` (`methods.ts:683`): `EV_EBITDAX`, `EV_SUBSCRIBER`, `NAV_RESERVES`, `P_AUM`, `P_EMBEDDED_VALUE`, `REGULATED_ASSET_BASE` | **none live** — none is declared for Consumer, Industrials or Technology. Live for Banking, Insurance or Energy the day those sectors get data |

Two further asymmetries belong to the same family but are not method-availability questions:

- **Blend completeness (INV-5).** An intrinsic range exists only when **every** weighted method produced a present
  per-share number (`intrinsic.ts:37-63`). On `bdfb2527…` all three issuers have applicable methods and **no** intrinsic.
- **Sector exclusions.** `SECTOR_EXCLUSIONS` (`policy.ts:28`) declares methods *not applicable* to a sector; a method can
  be `AVAILABLE` in coverage for a sector in which the assessment would never apply it.

## 6. Measured: what the population actually shows

At clock **2026-11-17**. Two datasets, both built from committed inputs (§14).

**(a) Repository dataset of record `sha256:69bbc14e…`** (Infosys with the `S4-R2` transcription; Marico `WI7`, KEC
`WI8`):

| Sector | Coverage stage | Coverage `usableMethods` | Assessment outcome per issuer |
|---|---|---|---|
| Consumer | `G1_ENABLED` | `DCF_FCFF`, `PE_RELATIVE`, `EV_EBITDA` | Marico: `EV_EBITDA` withheld `CAPITAL_STRUCTURE_INCOMPLETE`; **intrinsic `null`** |
| Industrials | `G2_PARTIAL` | `DCF_FCFF`, `EV_EBITDA` | KEC: `EV_EBITDA` withheld `CAPITAL_STRUCTURE_INCOMPLETE`; **intrinsic `null`** |
| Technology | `G2_PARTIAL` | `DCF_FCFF`, `PE_RELATIVE` (`EV_EBITDA` **withheld**: `STATEMENT_INPUT_MISSING ["NET_DEBT"]`) | Infosys: `EV_EBITDA` **applied**; **intrinsic 875.34 / 1,088.97 / 1,399.81** |

**(b) The `S4-R3` O3-admitted dataset `sha256:bdfb2527…`** (Infosys `REL-1`, refreshed Marico, refreshed KEC):

| Sector | Coverage stage | Coverage `usableMethods` | Assessment outcome per issuer |
|---|---|---|---|
| Consumer | `G1_ENABLED` | `DCF_FCFF`, `PE_RELATIVE`, `EV_EBITDA` | Marico: `DCF_FCFF` applicable but `NOT_COMPUTABLE`; `PE_RELATIVE` present (₹275.59); `EV_EBITDA` withheld `CAPITAL_STRUCTURE_INCOMPLETE`; **intrinsic `null`** |
| Industrials | `G2_PARTIAL` | `DCF_FCFF`, `EV_EBITDA` | KEC: same shape; **intrinsic `null`** |
| Technology | `G2_PARTIAL` | `DCF_FCFF`, `PE_RELATIVE` | Infosys: `EV_EBITDA` withheld (no borrowings transcribed in `REL-1`); **intrinsic `null`** |

**The headline.** On the admitted dataset, coverage reports **seven usable method slots** across three measured sectors,
Consumer is **`G1_ENABLED`**, and the assessment produces **no intrinsic range for any issuer**. Nothing is wrong with
either layer: the sectors' inputs exist *somewhere*, and no issuer has a complete latest instant with a bridge that
converts.

## 7. How historical annual periods make a method available — and what that is *not*

History plays **two different roles**, and confusing them is the origin of most of the confusion this document exists to
remove:

- **For coverage** (D1): history is *tolerance*. FY2023 alone makes Consumer's `EV_EBITDA` `AVAILABLE`. On `69bbc14e…`
  exactly one of Marico's three years supports the derivation triple; on `bdfb2527…` two of five do (FY2023 and
  FY2026 — the refresh added FY2026, it did not make the other three years complete).
- **For assessment**: history is a *hard requirement of the method itself*. `DCF_FCFF` needs three annual periods of
  EBIT, D&A and capex (`methods.ts:238-260`); `EV_EBITDA` needs three annual EBITDA observations for a mid-cycle figure
  (`methods.ts:418-423`); `PE_RELATIVE` needs three annual EPS observations (`methods.ts:390`). A one-year dataset is
  *less* capable in assessment, not more.

So "use an older period" is a legitimate coverage answer and never an assessment answer: the assessment does not
substitute an older balance sheet for a missing input, which is exactly what the `PERIOD_MISMATCH` invariant enforces
(`capitalStructure.ts:40-57`).

## 8. Derivation-level requirements versus assessment-level aggregation (D2 + D3)

This is the sharpest mechanical difference, and it is one sentence long:

> **Coverage asks whether the derivation set can produce `NET_DEBT`. The assessment never uses that derivation — it
> builds net debt from six components, admits a nil disclosure, and refuses to mix instants.**

| | IID-0 derivation (`fundamentals/derive.ts`) | IID-2 aggregation (`assessment/capitalStructure.ts`) |
|---|---|---|
| Inputs | `LONG_TERM_BORROWINGS`, `SHORT_TERM_BORROWINGS`, `CASH_AND_CASH_EQUIVALENTS` | debt side: `SHORT_TERM_BORROWINGS`, `CURRENT_MATURITIES_OF_LONG_TERM_DEBT`, `LONG_TERM_BORROWINGS`, `LEASE_LIABILITIES`; cash side: `CASH_AND_CASH_EQUIVALENTS`, `CURRENT_INVESTMENTS` |
| Nil disclosure | **refused** — not a number (`derive.ts:102`) | **admitted** as zero, named in the note, observation left `NIL_BY_DISCLOSURE` (D-2) |
| Missing input | derivation absent, inputs named | aggregate `MISSING` with the blocking reason preserved |
| Periods | the period being derived | each component resolves to its newest informative period; all four debt components must share one instant, both cash components must share one instant, and both sides must share that instant — otherwise `PERIOD_MISMATCH` |
| Lease liabilities | excluded by design | **included** (Ind AS 116) |

Which is why `NET_DEBT` can be absent in coverage and present in the assessment (Infosys, D2), or present in coverage
and absent in the assessment (Marico's FY2023, KEC's `CURRENT_INVESTMENTS`, D1 and D3).

## 9. Explicit nil, missing, `NOT_REPORTED`, and a reported zero

Four different claims, and the layers treat them differently. The full vocabulary is six presence states
(`contracts/observation.ts`); these four are the ones that change an answer here.

| State | What it says | Derivation (`derive.ts`) | Aggregation (`capitalStructure.ts`) | Coverage |
|---|---|---|---|---|
| `PRESENT` = `0` | the filer reported a zero | accepted as the number 0 | accepted as the number 0 | **present** |
| `NIL_BY_DISCLOSURE` | the filer said the item is nil, with the quoted wording, filing reference and period (`INV-7`) | **refused** — an input, not a number | **admitted** as zero; the nil keeps its source and period | **not present** |
| `MISSING: NOT_REPORTED` | nobody transcribed it; the dataset does not carry it | refused, named as the missing input | blocks the aggregate, reason preserved | not present |
| `NOT_COMPUTABLE: <reason>` | it cannot be computed (schema, unavailable source, refusal) | refused | blocks the aggregate | not present |

Two rules follow, and both are already implemented and tested:

- **A declared nil is not a zero and never becomes one.** The observation keeps `NIL_BY_DISCLOSURE`, its filing
  reference and its period; only the *aggregate* counts it as zero, and the aggregate says so in its note
  (`nil-by-disclosure.test.ts:343-362`, which asserts *"the nil observation is not rewritten"*).
- **A missing value is never a zero, anywhere.** `s4r2BorrowingsReuse.test.ts:487` pins it: *"the derived `NET_DEBT` is
  absent rather than computed from a substituted zero"* — and asserts the value a silent zero would have produced is
  **not** what is published.

## 10. Reading the withholding reasons

Three vocabularies, three meanings. A reader who treats them as one number will mis-read both layers.

**Coverage** (`WithheldReason`, `measure.ts:20-25`) — *why the dataset does not have the inputs*:

| Code | Meaning |
|---|---|
| `NO_DATA_FOR_SECTOR` | no issuer, or no annual period, for that sector — nothing was measured |
| `STATEMENT_INPUT_MISSING` | at least one qualifying period lacks a declared line item (this outranks the metric reasons) |
| `MANDATORY_METRIC_MISSING` | a declared operating metric is absent at every period tried |
| `METRIC_UNVALIDATED` | the metric exists but is not `VALID` |

**Assessment method** (`notApplicableReason`, a free-text code + detail) — *why the method was not run*:
`CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable`, `MANDATORY_METRIC_MISSING: <ids>`,
`INSUFFICIENT_HISTORY: …`, `NEGATIVE_BASE: …`, `WACC_LE_TERMINAL_GROWTH`, `METHOD_NOT_IMPLEMENTED_IN_ENGINE_V1`,
`ROE_LE_TERMINAL_GROWTH`, `DISCOUNT_RATE_LE_TERMINAL_GROWTH`, `MISSING_INPUT: …`, plus the sector exclusions.

**Assessment output / blend** — *why a method that ran produced no number*: `output.perShareMid.presence =
NOT_COMPUTABLE` with a reason and a note (e.g. *"blocked by netDebt"*), and `valuation.intrinsic = null` when INV-5
cannot be satisfied. The payload also carries prose in `limitations` naming the blocking input.

Rule of thumb: **coverage reasons describe the dataset; assessment reasons describe a valuation that was not
produced; `NOT_COMPUTABLE` describes arithmetic that refused at a named step.** None of the three is a zero, and none
of them may be read as "not applicable to this business" unless the reason says so (a `SECTOR_EXCLUSIONS` reason is
the only one that means *this method does not apply to this kind of company*).

## 11. How `S4-R2` and `S4-R3` change the interpretation (without reopening either)

**`S4-R2` — CLOSED on the assessment path** (`IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md`, addendum 2026-11-17). It
transcribed Infosys' borrowings as a declared nil, which made `netDebt` `PRESENT` (−₹19,342 cr) and applied
`EV_EBITDA`. **That closure condition is unchanged and this document does not touch it.** What `S4-R2` *added* is the
first live instance of D2: the correction moved the assessment and left the coverage row withholding, so the two layers
now disagree on a real issuer rather than in principle. The distinction §4 describes was latent before it; it is
observable now. `S4-R2`'s own record already names this remainder ("the coverage row still withholds") and defers the
wording question to `S4-R4`/`S4-R5`; this document is that deferral being discharged for the *interpretation*, not for
the *measurement policy*.

**`S4-R3` — OPEN** (`…S4-R3-READINESS-REASSESSMENT-2026-11-14.md` §12). It added the per-issuer freshness block:
`valuationBasis` (the annual period a valuation consumes) beside `latestReported`, both aged from the **period end**,
with `FRESH`/`STALE`/`UNKNOWN`. **`S4-R3` changes no method availability and no coverage figure**, and its closure
conditions are untouched. Its contribution to *this* question is a second, independent reason why "usable" is not
"valued": on `bdfb2527…` KEC's newest information is **48 days** old while its valuation basis is **231 days** old, and
every issuer is `STALE` with `VALUATION_BASIS_BEYOND_PNL_WINDOW`. A method can be available, applicable, and still sit
on a basis outside the freshness window — `STALE_STATEMENTS` (HIGH) and the `STALE_DATA` confidence cap say so in the
payload. On the `69bbc14e…` Infosys payload the caps are exactly
`["STALE_DATA","DILUTION_PROXY","POLICY_DEFAULT_WACC","POLICY_DEFAULT_MULTIPLE"]` and the combined confidence is
**0.4378**: the valuation exists, and its currency is qualified.

## 12. The contract for any eligible future issuer

These ten statements are properties of the code, not of this population. They hold for an issuer added tomorrow with a
different sector, a different fiscal year end, or quarterly-only data.

1. **Coverage describes availability under its own criteria** — declared line items and metrics present for *at least
   one* annual period of *at least one* issuer in the sector. It is a dataset-capability statement.
2. **Assessment decides whether a valuation is produced** — newest-period inputs, the aggregation's instant invariant,
   the method's own history requirement, the bridge, and the blend.
3. **`usable` never implies a valuation.** No surface may present a per-share figure, an intrinsic range or a margin of
   safety on the strength of a coverage row.
4. **Missing data is never zero.** A blank cell is `NOT_REPORTED`; a derivation or an aggregate that lacks an input is
   absent with a reason, never computed from a substitute.
5. **A declared nil is a statement with provenance, not an absence and not a zero.** It is admitted where the contract
   says so (the capital-structure aggregation under D-2), refused where it says otherwise (the derivation set), and it
   is never rewritten.
6. **Stale data keeps its freshness limitation.** Availability says nothing about currency; a valuation on a basis
   beyond the policy window carries `STALE_STATEMENTS` and the `STALE_DATA` cap, and `S4-R3`'s block reports the age of
   the basis separately from the age of the newest filing.
7. **History is a requirement in one layer and a tolerance in the other.** An old year can make a method *available*;
   it can never make an assessment *current*, and the assessment will not mix instants to manufacture completeness.
8. **Reasons are directional.** A coverage `WITHHELD` says the dataset lacks inputs (it may understate capability); an
   assessment refusal says a valuation was not produced (it never overstates one).
9. **An applicable method is not a number.** `applicable: true` with `NOT_COMPUTABLE` output is a published,
   deliberate state: the method's arithmetic ran and the conversion refused.
10. **Two layers disagreeing is the normal case, not a defect.** The correct response is to read both reasons, not to
    reconcile them by weakening either.

## 13. What a user should infer when the two differ

| Coverage | Assessment | Inference |
|---|---|---|
| `AVAILABLE` | method applied, per-share `PRESENT` | Both layers agree; read the freshness block before treating the number as current. |
| `AVAILABLE` | withheld (`CAPITAL_STRUCTURE_INCOMPLETE`, `MANDATORY_METRIC_MISSING`, `INSUFFICIENT_HISTORY`) | Availability rests on an older period or a narrower input set. **No valuation was produced for this issuer.** |
| `WITHHELD` (`STATEMENT_INPUT_MISSING`) | applied — net debt resolved through a declared nil | Coverage **understates** capability. The nil is the filer's own statement; the assessment is the better answer, and the payload names the nil. |
| `WITHHELD` (`MANDATORY_METRIC_MISSING` / `METRIC_UNVALIDATED`) | withheld for the same reason | Both layers agree; the gap is a metric gap (today: `G-4`/`S4-R6`). |
| `G1_ENABLED` (nothing withheld) | no intrinsic | Usable ≠ valued. Read the blend: INV-5 needs every weighted method to produce a number. |
| `AVAILABLE` | `applicable: true`, output `NOT_COMPUTABLE` | The method ran; the per-share conversion refused at a named step. Do not quote an enterprise value as a per-share value. |
| anything | `intrinsic: null` | **No per-share valuation was produced.** Report that, with the reasons — never a zero, never a placeholder. |

## 14. Observed behaviour, existing policy, known limitations, reserved decisions

**Observed behaviour (measured at this head, reproducible from §15).** The divergence catalogue §5; the two dataset
tables §6; the served counters `7 / 31`; one intrinsic in the population, and it sits on the issuer whose coverage row
withholds the contributing method.

**Existing policy (unchanged, and not this document's to change).** `valuation-policy/1.0.0` and its method matrix;
D-2's declared-nil permission for the capital-structure aggregation, with its three stated rules; the two
register-owner period-alignment decisions (`DEBT-COMPONENT-PERIOD-ALIGNMENT` Option A,
`CASH-SIDE-PERIOD-ALIGNMENT` Option B); INV-5's blend-completeness rule; `freshness-policy/1.0.0`'s windows;
`REQUIRED_ITEMS` and every confidence cap.

**Known limitations (documented, open, not defects fixed here).**
`L-001` (3 of 13 sectors measured); `G-4`/`S4-R6` (no operating-metric records, so 14 of 38 method slots are withheld);
`G-6`/`S4-R3` (staleness); `L-041`/`L-042` (untouched); six matrix methods unimplemented in engine v1 (D6); no
measured sector exercises D4 or D6 today.

**One wording imprecision, recorded and deliberately not changed.** When net debt is absent, `engine.ts:327-330`
publishes *"…so every enterprise-value method is withheld rather than run on a partial bridge."* Substantively true —
no enterprise value is converted to a per-share figure — but literally imprecise for `DCF_FCFF`, which is
`applicable: true` with a `NOT_COMPUTABLE` per-share leg (D5). This is a **prose precision issue, not a behaviour
defect**: nothing is overstated, zeroed or approximated, and the same payload names the blocked step twice
(`output.perShareMid.note` = *"blocked by netDebt"*). It is recorded here with its evidence and **not fixed**: `S4-R4`
is documentation, and editing that sentence would be a production-source *behaviour-adjacent* change requiring its own
change record. An operator reading it should prefer the field-level state over the sentence.

**Reserved decisions (not taken, not pre-empted).**
- **`S4-R5` (OWNER, OPEN)** — whether coverage availability should remain **existential** over annual periods or become
  a statement about the **latest** period. Everything in §5 (D1) and §7 is written to describe the *current* rule and
  to remain true under either outcome: if `S4-R5` adopts "latest", Consumer's `EV_EBITDA` on `69bbc14e…` becomes
  `WITHHELD` and the D1 example disappears — the *contract* in §12 does not change.
- **`S4-R6`/`G-4` (OWNER + OPERATOR)** — whether to supply operating metrics; that would make D4 live and would change
  the `MANDATORY_METRIC_MISSING` reasons, not this distinction.
- **A measurement-semantics decision** — whether `derive.ts` should admit a declared nil for `NET_DEBT`. That would
  change derivation semantics for every consumer of `NET_DEBT`; recorded with `S4-R4`/`S4-R5` by the `S4-R2` addendum
  and **not taken here**.
- **Any new limitation entry** for the §14 wording point — an owner act.

## 15. Where this is pinned, and how to reproduce it

**Committed tests that pin the rules this document describes** (all pass at this head):

| Behaviour | Test |
|---|---|
| Coverage `AVAILABLE` / `WITHHELD` reasons, stage semantics, determinism, the rendered summary | `iips-platform/tests/investment/coverage.test.ts` (12 tests) |
| Derivation refuses a non-numeric input; `NET_DEBT` absent rather than zero-substituted | `s4r2BorrowingsReuse.test.ts:396`, `:487` |
| All four debt components nil → `grossDebt 0`, `netDebt` present, nil not rewritten | `nil-by-disclosure.test.ts:343` (and `:364` reported zeros ≠ nils) |
| One component not reported / unavailable / unmapped blocks the debt position; mixed instants refused | `nil-by-disclosure.test.ts:400`, `:407`, `:414`, `:428` |
| An unavailable bridge blocks the grid instead of zeroing it | `l040ValuationZeroSubstitution.test.ts` |
| Method applicability, withholding reasons, intrinsic/blend behaviour | `assessment-valuation.test.ts`, `assessment-valuation-integrity.test.ts` |
| The `S4-R2` nil transcription end to end (coverage withheld, assessment applied) | `s4r2BorrowingsReuse.test.ts` |

**Reproduction.** Any dataset built from committed inputs; here, the two in §6:

```bash
cd iips-platform
# (a) the repository dataset of record  -> sha256:69bbc14e…
npx tsx src/investment/cli/ingest.ts \
  --input ../evidence/real-issuer/S4-R2-INFOSYS-BORROWINGS-2026-11-17/ingest-input \
  --input ../evidence/real-issuer/WI7-CONSUMER-MARICO-2026-11-07/ingest-input \
  --input ../evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/ingest-input \
  --dataset-dir <tmp>/dataset --now 2026-11-17T00:00:00.000Z
# (b) the S4-R3 O3-admitted dataset  -> sha256:bdfb2527…
npx tsx src/investment/cli/ingest.ts \
  --input ../evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input \
  --input ../evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico \
  --input ../evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec \
  --dataset-dir <tmp>/dataset --now 2026-11-17T00:00:00.000Z
```

`ingest.ts` prints the coverage summary; the assessment rows in §6 come from `assessCompany` over the same dataset at the
same clock. The evidence bundle `evidence/real-issuer/S4-R4-COVERAGE-VERSUS-VALUATION-2026-11-17/` records both
outputs verbatim, with digests, so the tables above can be checked without re-deriving them.

## 16. What this document does not claim

That `S4-R5` is decided. That coverage should change. That `derive.ts` should admit nils. That any valuation is current
(`S4-R3` is OPEN). That the population is complete (`L-001`: 3 of 13 sectors). That a divergence is a defect — none of
the six is: each is two correct answers to two different questions, and the only fault this document addresses is a
reader being left to guess which question a row answered.
