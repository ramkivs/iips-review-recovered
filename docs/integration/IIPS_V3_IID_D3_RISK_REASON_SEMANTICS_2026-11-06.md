# IIPS v3.0 — D-3: risk reason-code semantics

**Record ID:** `IIPS-V3-IID-D3-RISK-REASON-SEMANTICS-2026-11-06`
**Work item:** D-3 (defect recorded in the limitation and coverage register §13, left open by §14 and §14.1)
**Repository:** IRR only. No IPD change.
**Baseline:** `main` at `b982c05` — the merge of PR #489 (the post-D-2 Infosys regression record), whose own baseline is the D-2 merge `b3987ef`.
**Evidence bundle:** `evidence/real-issuer/D3-RISK-REASON-SEMANTICS-2026-11-06/`

---

## 1. The defect, in the artefact's own words

On the merged post-D-2 Infosys baseline the assessment published this risk block:

```json
"risk": {
  "factors": [],
  "aggregate": { "value": null, "presence": "NOT_COMPUTABLE", "reason": "POLICY_INPUTS_UNAVAILABLE" }
}
```

`POLICY_INPUTS_UNAVAILABLE` asserts that the policy inputs were unavailable. On this issuer that is false. Two of
the three applicable dimensions had been **evaluated and passed**, and only the third was blocked:

| dimension | what the engine did, before D-3 | what the aggregate said |
|---|---|---|
| financial leverage | could not be evaluated: the filing presents no borrowings row, so `netDebt` is `MISSING: NOT_REPORTED` | "policy inputs unavailable" |
| earnings quality (cash conversion) | evaluated: operating cash flow covered 96 % of reported profit, above the 80 % floor | same, indistinguishable |
| capital allocation (capex intensity) | evaluated: capital expenditure was 1 % of revenue, below the 20 % ceiling | same, indistinguishable |

The cause was structural, not a typo: `buildRisk` emitted a **factor** only when a dimension failed. A pass emitted
nothing and a blocked dimension emitted nothing, so zero factors could mean *everything passed*, *nothing could be
evaluated*, or any mix of the two — and the aggregate had one code for all of them. The reason vocabulary also
carried `POLICY_INPUTS_UNAVAILABLE`, which is accurate for exactly one of those cases.

**Nothing else was wrong.** No threshold, severity, likelihood, statement or formula is implicated; the
misstatement was about *which* conclusion the evidence supported, never about the arithmetic.

## 2. What the contract already had, and what had to be added

The published `risk` block was `{ factors, aggregate }`. `factors` is a list of *concerns*: it is structurally the
wrong place to record a pass. `aggregate` is an `Observation<number>` and can carry only one reason. Neither field
could express "this dimension was evaluated and passed" without inventing a factor for a company that has none — the
exact falsehood this work item exists to remove.

So the change is **additive**, reusing the existing vocabulary wherever it already said the right thing:

| What had to be represented | Field | New? |
|---|---|---|
| evaluation status of each dimension | `risk.evaluation.dimensions[].status` | new |
| result of each evaluated dimension | `risk.evaluation.dimensions[].measurement` (`PRESENT` + value) | new, existing observation contract |
| dimension-specific unavailable reason | `risk.evaluation.dimensions[].measurement.reason` (`NOT_COMPUTABLE` + reason) | new, **existing** reason type |
| which inputs blocked a dimension | `risk.evaluation.dimensions[].unavailableInputs[]` | new |
| the concern a dimension raised | `risk.evaluation.dimensions[].factorId` → `risk.factors[]` | new pointer, existing factor |
| aggregate evaluation completeness | `risk.evaluation.completeness` (`COMPLETE` \| `PARTIAL` \| `NONE`) | new |
| aggregate policy disposition | `risk.evaluation.disposition` (`PASSED` \| `CONCERNS` \| `INDETERMINATE`) | new |
| the score | `risk.aggregate` | **unchanged** formula, corrected reason |

Two codes were added to the closed `MissingReason` union, because the two states had no accurate spelling:

| Code | Meaning | Where it is used |
|---|---|---|
| `NO_RISK_FACTOR_IDENTIFIED` | every applicable dimension was evaluated and none crossed a threshold, so there is no factor whose severities could be averaged | the aggregate, only when `completeness = COMPLETE` and no factor exists |
| `RISK_EVALUATION_PARTIAL` | no factor was raised and at least one applicable dimension could not be evaluated | the aggregate, only when `completeness = PARTIAL` and no factor exists |
| `POLICY_INPUTS_UNAVAILABLE` | **retained, now accurate only in its original sense**: no applicable dimension could be evaluated at all | the aggregate, only when `completeness = NONE` |

Everything else in the vocabulary is untouched: the dimension-level reasons are the **existing** ones, taken from the
blocking observation itself (`NOT_REPORTED`, `PERIOD_NOT_COVERED`, `DIVISION_BY_ZERO`, `NEGATIVE_BASE`), so a
dimension blocked by an undisclosed line item still says `NOT_REPORTED`.

### 2.1 Status vocabulary, and why a sector prior is not a pass

| Status | Meaning |
|---|---|
| `PASSED` | an input was available, the threshold was applied, and the dimension did not cross it |
| `CONCERN` | an input was available, the threshold was applied, and it crossed — `factorId` names the factor |
| `NOT_EVALUABLE` | a required input was absent or unusable; `measurement` carries the reason and `unavailableInputs` names what was missing |
| `NOT_APPLICABLE` | a sector prior that does not apply to this issuer's sector |

The two sector priors (`REGULATORY_FRAMEWORK`, `CYCLICALITY`) are propositions about the sector, not tests of the
company's numbers, so an unregulated, non-cyclical issuer is `NOT_APPLICABLE` — **never `PASSED`** — and they are
excluded from the completeness fraction. That is the difference between "we tested the company and it passed" and
"this question does not arise for this company".

### 2.2 The two aggregates are orthogonal, on purpose

`completeness` says how much of the applicable taxonomy ran; `disposition` says what it found. `PASSED` is reserved
for complete evaluation with no concern, so a partial evaluation cannot be read as a pass even when nothing failed:

| completeness \ disposition | `PASSED` | `CONCERNS` | `INDETERMINATE` |
|---|---|---|---|
| `COMPLETE` | all applicable dimensions ran, none crossed | all ran, ≥1 crossed | — (unreachable by construction) |
| `PARTIAL` | — (unreachable by construction) | some ran, ≥1 crossed | some ran, none crossed |
| `NONE` | — | — | nothing ran |

A missing input never becomes zero, a neutral score or a pass: the blocked dimension publishes `value: null`, the
aggregate publishes `value: null`, and no factor is invented for it. The aggregate is **never** `0`: the score is the
mean of severity × likelihood, whose minimum attainable value is 1, so a 0 would be a number this taxonomy cannot
produce.

## 3. What the Infosys run now says

Same input, same dataset digest (`sha256:ca29c835…`), same everything except the risk block:

```json
"risk": {
  "factors": [],
  "aggregate": { "value": null, "presence": "NOT_COMPUTABLE", "reason": "RISK_EVALUATION_PARTIAL" },
  "evaluation": {
    "completeness": "PARTIAL",
    "disposition": "INDETERMINATE",
    "counts": { "applicable": 3, "evaluated": 2, "passed": 2, "concerns": 0, "notEvaluable": 1, "notApplicable": 2 }
  }
}
```

| dimension | status | measurement | blocking input |
|---|---|---|---|
| `FINANCIAL_LEVERAGE` | `NOT_EVALUABLE` | `NOT_COMPUTABLE: NOT_REPORTED` | `fundamentals.capitalStructure.netDebt` |
| `EARNINGS_QUALITY_CASH_CONVERSION` | `PASSED` | 0.9610 (96 % of profit) | — |
| `CAPITAL_ALLOCATION_CAPEX_INTENSITY` | `PASSED` | 0.0143 (1 % of revenue) | — |
| `REGULATORY_FRAMEWORK` | `NOT_APPLICABLE` | — | — |
| `CYCLICALITY` | `NOT_APPLICABLE` | — | — |

The previous sentence — "no risk assessment was possible" — is replaced by the true one: **two dimensions were
tested and passed, one could not be tested because the filing does not present a borrowings line, and the assessment
therefore makes no overall risk statement.** The position is still blocked; it is now blocked intelligibly.

## 4. What is unchanged, and the one thing that moved

`payload-diff.json` compares the stored post-D-3 payload with the committed Work Item 1 `assessment-payload-v2.json`
path by path. It finds **exactly two differences, both inside `risk`**:

1. `risk.aggregate.reason`: `POLICY_INPUTS_UNAVAILABLE` → `RISK_EVALUATION_PARTIAL`
2. `risk.evaluation`: added

Every other field — capital structure (three borrowings `MISSING: NOT_REPORTED`, `LEASE_LIABILITIES` `PRESENT`
83,590,000,000 `AS_FILED` from `INFY-INDAS-CONSOL-FY24` at 2024-03-31, gross and net debt blocked), valuation
(`intrinsic: null`, `DCF_FCFF` `NOT_COMPUTABLE`, `PE_RELATIVE` `PRESENT`, `EV_EBITDA` `CAPITAL_STRUCTURE_INCOMPLETE`,
`EV_REVENUE` `MANDATORY_METRIC_MISSING`), margin of safety (`refusal: NO_PRICE_OBSERVATION`), moat
(`INSUFFICIENT_EVIDENCE`), dividends (`INSUFFICIENT_EVIDENCE`), completeness (`SUFFICIENT`, coverage 1.0), quality
(`MATERIAL_CONCERNS`, `STALE_STATEMENTS`), confidence (0.4939, caps `STALE_DATA` + `DILUTION_PROXY`), the four
evidence entries, the five limitations and the sector-reference block — is **identical**.

Consequences, stated rather than hidden:

- `payloadDigest` moves `cc91f239197a…` → `8e23f025527e…` (42,800 → 45,129 bytes). It must: the payload says
  something it did not say before. `reportKey` stays `ed1e54b03e5e…`, `datasetVersion` stays `sha256:ca29c835…` and
  `inputDigest` stays `sha256:799b7203…`.
- `substantiveDigest` moves for the same reason. The **rules** did not move: `substantive-identity.test.ts` now
  reconstructs the pre-D-3 risk block from a fresh payload and reproduces the L-014 decision's published vectors
  (`08ea8d4a…`, `fd9589e4…`, `34240407…`) byte for byte. Stored history keeps its digests; only a payload generated
  after D-3 digests differently, which is the correct answer.
- The frozen engine identity is unchanged: `assessment-engine/1.0.0`, `valuation-policy/1.0.0`, schema 1, and the
  substantive-identity grammar `…/1`. The version that moved is the derivation that owns this vocabulary —
  `risk-taxonomy/1.0.0` → `risk-taxonomy/1.1.0` — and it is visible in every new dimension measurement and in the
  aggregate's source reference.

## 5. Tests

`iips-platform/tests/investment/risk-evaluation.test.ts` — 14 tests, built on **real engine output** rather than
hand-written payload literals, covering the matrix the work item requires:

| Case | Asserted |
|---|---|
| all dimensions evaluated and passed (technology fixture) | `COMPLETE` / `PASSED`, three `PASSED` dimensions with `PRESENT` measurements, aggregate `NO_RISK_FACTOR_IDENTIFIED`, `value: null` |
| some passed, others unavailable (debt line items removed) | `PARTIAL` / `INDETERMINATE`, the two passing results intact, the blocked one `NOT_EVALUABLE: NOT_REPORTED` naming `netDebt` |
| a concern (capex lifted to 30 % of revenue) | one `CONCERN` dimension with `factorId`, one factor, aggregate `PRESENT` = 9, `COMPLETE` / `CONCERNS` |
| all dimensions unavailable (thin fixture) | `NONE` / `INDETERMINATE`, aggregate `POLICY_INPUTS_UNAVAILABLE` — the legacy code in its only accurate case |
| mixed passed, concern and unavailable (banking fixture) | four distinct statuses at once, each with its own reason and blocking inputs |
| missing or malformed input | no implicit pass: `value: null`, no factor, `NEGATIVE_BASE` for a non-positive denominator, `PERIOD_NOT_COVERED` when there is no annual period |
| existing synthetic goldens | factor lists, statements, severities, aggregate value 12 and the confidence blocks unchanged; zero invariant violations on every fixture |
| determinism | two runs produce the same risk block byte for byte |

Both the individual dimension outputs and the aggregate are asserted, and every fixture is checked for
`result.violations.length === 0`, so the new observations are held to INV-1 … INV-7 like every other observation.

`frontend/src/features/investment/iid6CompanyAssessment.test.tsx` adds two presentation tests: the risk section must
render completeness and disposition as two separate statements, a blocked dimension with its own reason and the input
that blocked it, a passing dimension as visibly passing; and a stored version that predates this change must say so
rather than let an empty factor list imply a pass.

## 6. Scope discipline

No formula, threshold, weighting, severity, likelihood, factor statement or verdict rule changed; adequacy, quality,
confidence and its caps, and the disposition gates are untouched and asserted unchanged. No D-2 semantics touched. No
new persistence mechanism: the SQLite store under `/tmp/d3/store` is a scratch read target for this evidence run. No
price observed, no second issuer, no sector enabled, no scheduler, no authentication, no trading surface. `L-001` …
`L-029` untouched; see register §15.

## 7. What this work item does not claim

Correcting a reason code does not validate a risk assessment. One real issuer has been assessed through one path;
its risk evaluation is **partial and will stay partial for this input**, because the filing does not present a
borrowings line and no permitted inference supplies one. The ₹470 crore finance cost in the FY24 statement is *not*
used as evidence of nil borrowings, and the `NOT_REPORTED` reason stands. No risk score, no risk grade and no
investment conclusion is published for this issuer, before or after this change.

Evidence: `evidence/real-issuer/D3-RISK-REASON-SEMANTICS-2026-11-06/README.md` and `.../runs/`.
