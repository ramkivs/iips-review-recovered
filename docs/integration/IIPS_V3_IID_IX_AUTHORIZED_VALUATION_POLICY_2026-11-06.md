# IX — The authorised valuation policy, implemented

**Phase:** IIPS v3.0, IX (implementation of the owner's 2026-11-06 decisions)
**Authority:** IRR (implement, test, publish), on four policy decisions taken by the owner
**Branch base:** `main`; PR on `arena/f5bc24ff-iips-review-recovered`
**Register:** closes `L-034`; updates `L-036` (stays `PARTIALLY RESOLVED`); `L-035` unchanged
**Evidence:** `evidence/real-issuer/IX-AUTHORIZED-VALUATION-POLICY-2026-11-06/`
**Supersedes nothing.** The VIII package (`IIPS_V3_IID_VIII_VALUATION_DECISIONS_2026-11-06.md`, the schema proposal and
its evidence bundle) is a historical decision package and is **not rewritten** by this phase.

---

## 1. What was decided, and by whom

VIII ended with two entries that implementation could not close, because each needed something that is not an
engineering choice: a **policy value** for the `POLICY_DEFAULT` confidence penalty (`L-034`), and an **issuer figure**
for the associates/JV carrying value (`L-036`). The owner supplied the first on 2026-11-06 and supplied nothing for the
second, which is why one entry closes and the other does not.

| Decision | Authorised value |
|---|---|
| Maximum default-assumption penalty | **35 %** maximum aggregate confidence reduction |
| How it applies | **additive, by distinct assumption category**, one aggregate ceiling applied **once** |
| Confidence floor | **none** — zero remains a valid, publishable confidence |
| Associates/JV | retain the disclosed **`POLICY_ZERO`**, with a **mandatory review after 180 days** if the carrying value is still unavailable |

These are decisions, not options. Nothing in this phase re-proposes them, and no fifth alternative was introduced.

## 2. `L-034` — the penalty, as implemented

### 2.1 The policy record

`VALUATION_POLICY.policyDefaultAssumptionCaps` → **`confidence-policy-defaults/1.1.0`**:

```ts
{
  policyVersion: 'confidence-policy-defaults/1.1.0',
  waccCap: 'POLICY_DEFAULT_WACC',
  multipleCap: 'POLICY_DEFAULT_MULTIPLE',
  application: 'ADDITIVE_BY_CATEGORY',
  maxAggregateReduction: 0.35,
  categoryPenalties: { DISCOUNT_RATE: 0.20, TARGET_MULTIPLE: 0.15 },
  confidenceFloor: null,
  factor: null,   // no single per-cap factor exists; the aggregate is the ceiling, not a product
}
```

`factor: null` is retained deliberately. VIII prepared a mechanism in which one `factor` multiplied once per cap type
(`f²` on this assessment), and the temptation on being given "35 %" is to write `factor: 0.35` and stop. That would be
**wrong under the authorised rule**: it is multiplicative and per type, so it would under-penalise a single category,
compound on two, and contradict "one aggregate ceiling". The authorised rule is additive with one ceiling, so the
penalty is expressed as a **rate per category plus one ceiling**, and `factor` stays `null` to record that no single
factor is applied.

### 2.2 The categories, and why they are the right granularity

| Category | Cap name | Rate | Triggered by | Charge |
|---|---|---|---|---|
| `DISCOUNT_RATE` | `POLICY_DEFAULT_WACC` | 0.20 | a method with an output whose discount rate is the policy WACC | one, however many methods |
| `TARGET_MULTIPLE` | `POLICY_DEFAULT_MULTIPLE` | 0.15 | a method with an output whose `multipleBasis` is `POLICY_DEFAULT` | one, however many methods |

The category is the **assumption**, not the method and not the trigger. `PE_RELATIVE` and `EV_EBITDA` both lean on a
policy target multiple; charging each would price the same missing input twice — the shareholder would see 30 % of
"we lack a multiple" where the evidence supports 15 %. The assessment has **three triggers and two charges**:
`DCF_FCFF` (discount rate), `PE_RELATIVE` + `EV_EBITDA` (target multiple). The payload publishes the triggers so the
difference between trigger count and charge count is visible rather than asserted.

Rates sum to exactly the ceiling on this assessment (0.20 + 0.15 = 0.35), so the ceiling is *reached* and not
*exceeded*; `ceilingBinding` is `false` because the sum never exceeds it. A configuration with a third category — there
is none today — would sum past the ceiling and be truncated at 0.35, with `ceilingBinding: true` published so the
truncation is never silent.

### 2.3 The formula and its order

```
combined = (0.6 · dataConfidence + 0.4 · modelConfidence)
         × Π evidence caps                     (ADEQUACY_PARTIAL 0.85, ADEQUACY_INSUFFICIENT 0.6,
                                                STALE_DATA 0.9, DILUTION_PROXY 0.98,
                                                DIVIDEND_SOURCE_CONFLICT 0.95, HIGH_METHOD_DISAGREEMENT 0.85)
         × (1 − min(0.35, Σ category penalty rates))
         rounded once to 4 dp, clamped to [0, 1]
```

Order matters and is fixed: the evidence caps first (so the penalty prices provenance on top of thin evidence rather
than being nested inside it), then the single aggregate penalty, then **one** rounding. No floor is applied at any
point: a zero result stays zero through calculation, serialisation, sorting and presentation (test `L-034` "zero
confidence stays zero").

### 2.4 What the penalty did to the committed Infosys assessment

Same issuer, same evidence, same clock (`2026-11-06T14:05:00.000Z`), same Work Item 3 inputs:

| | before IX | after IX |
|---|---|---|
| `confidence.dataConfidence` | 0.85 | 0.85 |
| `confidence.modelConfidence` | 0.6342 | 0.6342 |
| pre-penalty combined | 0.6736 | 0.6736 |
| aggregate penalty | — | 0.35 (×0.65) |
| **`confidence.combined`** | **0.6736** | **0.4378** |
| `confidence.caps` | `STALE_DATA`, `DILUTION_PROXY` | + `POLICY_DEFAULT_WACC`, `POLICY_DEFAULT_MULTIPLE` |
| `intrinsic.perShare` low / mid / high | 875.3394 / 1088.9723 / 1399.8105 | **unchanged** |
| `marginOfSafety` and band | −8.4187 %, `FAIR` | **unchanged** |

The independent cross-check in the evidence generator recomputes the pre-penalty value from the published components and
the six cap factors, then applies `1 − min(0.35, 0.20 + 0.15)`; the engine must agree with that arithmetic or the
package refuses to be written.

## 3. `L-036` — the review control and what V2 does and does not fix

### 3.1 Treatment policy unchanged

`associates-treatment/1.0.0`, basis `CARRYING_VALUE`, `whenUnavailable: POLICY_ZERO`. It is **not** renumbered:
the treatment did not change, an obligation was added beside it.

### 3.2 The review control (`associates-review/1.0.0`)

| Member | Meaning |
|---|---|
| `clockStart` | the **source-evidence date**: the dataset's newest balance-sheet instant |
| `clockStartBasis` | `DATASET_PERIOD_END`, or `UNAVAILABLE` when no instant can be read |
| `reviewAgeDays` | 180, from policy |
| `reviewDueOn` | `clockStart + 180` calendar days |
| `status` | `NOT_DUE` \| `REVIEW_DUE` \| `CLOCK_UNAVAILABLE` \| `NOT_APPLICABLE` |
| `reviewRequired` | `true` for `REVIEW_DUE` **and** for `CLOCK_UNAVAILABLE` — an age that cannot be measured is escalated, never read as "not due" |
| `reason` | prose naming the evidence date, the review age and the date it fell due |

Three rules make it trustworthy, each with a test: the clock starts at the **evidence**, not the run; a missing or
impossible date **escalates**; the flag is **inert** — it changes no carrying value, converts nothing into a nil,
applies no penalty, and moves no confidence, formula or verdict.

**The persisted block is clock-free, and that is the interesting engineering decision in this phase.** It publishes
`clockStart`, `reviewAgeDays`, `reviewDueOn`, `status`, `reviewRequired` and the reason — but **not** `elapsedDays` and
**not** the measurement clock. A day count is a pure function of the execution clock, and a payload member that moves
every midnight mints a version on every re-run: exactly the defect `assessment-substantive-identity/1` exists to close
(L-014, AC-L14.1/AC-L14.2). The age is therefore derived **at render time** from `clockStart` and the report's own
`asOf`, both of which the payload carries (`explain.ts`, `view.ts`). The alternative — widening the identity exclusion
set — was rejected: the grammar forbids a silent extension, and a grammar bump would invalidate every stored `/1`
payload. The `status` stays in the payload because it is a policy verdict on the evidence, like
`asOf.staleBeyondPolicy`, and moves only when the review crosses its date, which is a disclosure change worth exactly
one version.

Test evidence for the boundary: 179 days → `NOT_DUE`; **exactly 180** → `REVIEW_DUE`; 181 → `REVIEW_DUE`; missing,
empty, `not-a-date` and the impossible `2024-02-31` → `CLOCK_UNAVAILABLE` with `reviewRequired: true`.

### 3.3 V2 — the schema that can hold the figure

`INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES` — `BS`, `INSTANT`, `INR`, positive magnitude, `reported: true`.

- **V1 unchanged:** 52 items, same bytes, same digest, never backfilled.
- **V2 additive:** exactly one item (53). A V1 dataset is a valid V2 dataset whose new item is absent.
- **Absence is `NOT_REPORTED`, never zero.**
- **A nil needs the filer's quoted wording** (`nil: "<wording>"`); a bare `nil` is an `ERROR`
  (`NIL_WITHOUT_QUOTED_WORDING`) and never becomes a figure. An omitted line is `NOT_REPORTED`, not a nil.
- **A derived value cannot be nil:** the item is `reported: true`, and derivation items are a separate table.
- **A V1 dataset that carries it is refused by name** (`LINE_ITEM_REQUIRES_DATASET_SCHEMA_V2`), and a build that does
  not know V2 **refuses the whole dataset** (`assertSupportedDatasetSchema`) rather than dropping a member it cannot
  represent — the failure mode that would silently replace a filed carrying value with a policy zero.
- **XBRL:** the reader maps the two filed component captions (`InvestmentsInAssociates`,
  `InvestmentsInJointVentures`) and **adds** them when both are presented, recording
  `ASSOCIATES_JV_COMPONENTS_SUMMED` so the arithmetic is visible. A V1 build refuses the caption by name and emits no
  placeholder. The tag-coverage disclosure's mapped-tag count consequently moves 20 → 22.
- **No IPD write, no new persistence, no store.** The precise handoff, if IPD ever takes the schema: the line item, its
  four attributes and the two tag mappings are the entire change; nothing in NP-04, the composition boundary or the
  identity grammar is involved.

### 3.4 What a V2 carrying value changes, and what it must not

Demonstrated on the same Infosys evidence with one filed figure (₹1,000 crore) — **a schema demonstration, not an
issuer value**:

| | V1 (policy zero) | V2 (₹1,000 crore filed) |
|---|---|---|
| `capitalStructure.associatesAndJV` | `NOT_COMPUTABLE: NOT_REPORTED`, `null` | `PRESENT`, `1e10` |
| `equityBridge.treatment` | `POLICY_ZERO_UNAVAILABLE` | `CARRYING_VALUE_REPORTED` |
| `equityBridge.substitutedInputs` | one entry | `[]` |
| `associatesJVReview.status` | `REVIEW_DUE` | `NOT_APPLICABLE` |
| intrinsic mid | 1088.972274952081 | 1090.66110200198 (**+1.6888/share**) |
| margin of safety | −8.4187 % | −8.2509 % |
| `dataConfidence` / quality / adequacy / caps | — | **unchanged** |
| `modelConfidence` | 0.6342 | 0.6346 |

`+1.6888` is not a fitted slope: it is `0.7 × carrying value / diluted shares`, the exact bridge arithmetic, with 0.7
the published weight of the two enterprise-derived methods. `modelConfidence` moves because it is a function of the
published per-share spread; the bundle says so explicitly rather than presenting the change as part of the policy.

## 4. Tests

| Requirement | Where |
|---|---|
| one category, one charge | `iips-platform/tests/investment/assessment-valuation-integrity.test.ts` — "one category is one penalty; several triggers in it do not double-charge" |
| multiple triggers in one category | same — `PE_RELATIVE` + `EV_EBITDA`, one 0.15 |
| multiple distinct categories | same — "distinct categories are additive, and the aggregate ceiling is applied once" |
| ceiling reached, not exceeded | same — "the penalty reaches the 0.35 ceiling and does not exceed it" |
| zero stays zero | same — "zero confidence stays zero: no floor, no substitution, no truthiness guard" |
| existing stale / dilution penalties preserved | same — "existing penalties are preserved and are not weakened by the policy penalty" |
| 179 / exactly 180 / >180 days | same — "179 days is not due; exactly 180 days is due; more than 180 days is due" |
| missing or invalid observation date | same — "a missing or invalid evidence date escalates instead of passing silently" |
| review block is clock-free | same — "the PUBLISHED block is clock-free…" |
| V1 compatibility | `dataset-schema-v2.test.ts` — "the schema is additive and V1 is untouched" |
| V2 ingestion (CSV and XBRL) | `dataset-schema-v2.test.ts` + `ingestion.test.ts` — "XBRL — the V2 associates/JV caption" |
| old-engine rejection | `dataset-schema-v2.test.ts` — "a build that supports only V1 rejects a V2 dataset" |
| nil without provenance rejected | `dataset-schema-v2.test.ts` — "a nil needs the filer's wording…" |
| final payload disclosure | `frontend/server/investment/cli/valuationIntegrity.test.ts` — AC-034.5 and IX blocks, on the **stored** payload |
| persisted review-flag read-back | same — the flag is asserted on the payload the store returns, and in the stored text (`"reviewRequired":true`) |
| identity did not move | `frontend/server/investment/substantive-identity.test.ts` — five reconstruction layers, `VIII` … `IX` |
| engine agrees with the arithmetic | `ixAuthorizedPolicy.test.ts` — the committed bundle regenerates member for member |

Counts on this branch: `iips-platform` **469 tests, 0 failures**; `npm run typecheck` clean; frontend
`server/investment` **247 tests, 0 failures**; frontend `tsc`/`vitest` suite as recorded in the PR.

## 5. The regression, and what is attributable to what

Two independent changes landed together and the report keeps them apart:

- **attributable to the authorised policy:** `confidence.combined` (0.6736 → 0.4378), the two added caps, the formula
  clause, the applied declarations with category and rate, the review block, and one added limitation sentence.
- **attributable to issuer data (only in the V2 demonstration):** the carrying value, the per-share legs it lifts, the
  margin of safety, the band's position, and the review control closing.
- **unchanged by both:** `dataConfidence`, the intrinsic range on the V1 dataset, every method weight and selection,
  the quality verdict, adequacy and completeness, the disposition's own adequacy haircut, and every D-2/D-3 semantic.

## 6. Register outcome

| Entry | Before | After | Basis |
|---|---|---|---|
| `L-034` | `OPEN` (mechanism prepared, nothing applied) | **`RESOLVED`** | the authorised policy is in force, published and reproduced from committed inputs |
| `L-036` | `PARTIALLY RESOLVED` (disclosure corrected) | **`PARTIALLY RESOLVED`** (disclosure + control in force; quantification open) | the carrying value is still absent from the committed evidence; V2 removed the representational gap, not the evidence gap |
| `L-035` | `OPEN` | `OPEN` | untouched |
| `L-001` … `L-033` | unchanged | unchanged | untouched |

`L-034` is closed on the mechanism being **in force**, not on the number being "right": 35 % is the authorised
magnitude, which is what R-4.3 asked the operator to choose. No sentence in this phase claims the associates/JV
carrying value was established, and none converts "unavailable" into a nil.

## 7. Boundaries observed

IRR repository only. No IPD write. No new persistence or store. No issuer or sector expansion. No D-2/D-3 semantic
change. No change to any formula, weight or threshold other than the confidence aggregate the owner authorised. No
fabricated value. No historical evidence rewritten: the WI1/WI2/WI3 artifacts, the VII bundle, the VIII package and the
schema proposal are untouched, and their files are byte-identical on this branch. No trading functionality. No
unconditional verdict.
