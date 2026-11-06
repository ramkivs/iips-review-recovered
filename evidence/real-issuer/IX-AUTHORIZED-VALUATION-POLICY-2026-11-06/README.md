# IX — The authorised valuation policy, implemented (2026-11-06)

**Issuer:** Infosys Limited · CIN `L85110KA1981PLC013115` · ISIN `INE009A01021` — the only real issuer in scope.
**Inputs:** the committed Work Item 3 dataset (`evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/ingest-input`),
rebuilt here, never re-typed. No WI1/WI2/WI3 file is modified by this bundle.
**What this bundle is:** a **reproduction** of what the owner's authorised policy does to the committed evidence —
the `L-034` penalty and the `L-036` review control — regenerable byte for byte by
`npx tsx iips-platform/scripts/ix-authorized-policy.ts <dir>`.
**What it is not:** a new issuer value, a valuation, a schema migration of any stored dataset, or a claim that the
associates/JV carrying value has been established.

**Statuses carried out of this bundle:** `L-034` **`RESOLVED`** (authorised policy in force, published, reproduced) ·
`L-036` **`PARTIALLY RESOLVED`** (disclosure and control in force; the carrying value is still absent from the
committed evidence) · `L-035` `OPEN` (untouched).

## The two answers this bundle carries

| Question | Answer |
|---|---|
| What does the authorised penalty do to the published confidence? | `0.6736 → 0.4378`, i.e. `round4(0.67356576 × 0.9 × 0.98 × 0.65)`. The reduction is **0.35 exactly** — `DISCOUNT_RATE` 0.20 + `TARGET_MULTIPLE` 0.15 — applied **once** at the aggregate ceiling. Three triggers, **two charges**. |
| What does a rupee of associates/JV carrying value do? | `Δmid = 0.7 × CV / 4,144,888,607.99` → **₹1.6888 per share per ₹1,000 crore**. In the V2 demonstration a ₹1,000 crore figure moves mid `1088.972274952081 → 1090.66110200198` and closes the review control. **No issuer value is asserted**: the committed evidence contains no filed figure. |

## Reproduction

```
cd iips-platform
npx tsx scripts/ix-authorized-policy.ts ../evidence/real-issuer/IX-AUTHORIZED-VALUATION-POLICY-2026-11-06/artifact
```

The generator **refuses to write** if any of its premises fail: the policy is not `ADDITIVE_BY_CATEGORY` with a 0.35
ceiling and no floor; the pre-penalty confidence is not the value VII/VIII recorded; the engine's published confidence
disagrees with the independent arithmetic; the intrinsic mid moved (the penalty may not re-value the company); the
review control is not due at 950 days; or a V2 carrying value changes anything other than the bridge, the spread-
derived `modelConfidence` and the review status.

`iips-platform/tests/investment/ixAuthorizedPolicy.test.ts` rebuilds the package and requires the committed artifact to
be identical, member for member, so drift fails CI rather than ageing quietly.

## Confidence, before and after

| Output | Before IX (VII/VIII) | After IX |
|---|---|---|
| `dataConfidence` | 0.85 | 0.85 |
| `modelConfidence` | 0.6342 | 0.6342 |
| pre-penalty combined | 0.6736 | 0.6736 |
| aggregate penalty | — | 0.35 (×0.65), ceiling reached and not exceeded |
| **`combined`** | **0.6736** | **0.4378** |
| caps | `STALE_DATA`, `DILUTION_PROXY` | + `POLICY_DEFAULT_WACC`, `POLICY_DEFAULT_MULTIPLE` |
| `assumptionCaps[].applied` | `false` | `true`, with `category`, `penaltyRate`, triggers |

Categories as charged: `DISCOUNT_RATE` 0.20 (`DCF_FCFF`) and `TARGET_MULTIPLE` 0.15 (`PE_RELATIVE`, `EV_EBITDA`
— **one** charge for two methods). Zero remains publishable: there is no floor anywhere in the chain.

## Review control, on the committed evidence

| Member | Value |
|---|---|
| `clockStart` / basis | `2024-03-31` / `DATASET_PERIOD_END` (newest balance-sheet instant, never an execution time) |
| `reviewAgeDays` / `reviewDueOn` | 180 / `2024-09-27` |
| age at the assessment clock | **950 days** |
| `status` / `reviewRequired` | `REVIEW_DUE` / `true` |
| `elapsedDays` in the payload | **absent by design** — the block is clock-free, so a midnight re-run cannot mint a version; the age is derived at render time from `clockStart` + the report's `asOf` |

## V2 demonstration (schema, not issuer data)

| | V1 | V2 with ₹1,000 crore filed |
|---|---|---|
| `associatesAndJV` | `NOT_COMPUTABLE: NOT_REPORTED`, `null` | `PRESENT`, `1e10` |
| `equityBridge.treatment` | `POLICY_ZERO_UNAVAILABLE` | `CARRYING_VALUE_REPORTED` |
| `substitutedInputs` | one entry | `[]` |
| review | `REVIEW_DUE` | `NOT_APPLICABLE` |
| intrinsic mid | 1088.972274952081 | 1090.66110200198 |
| margin of safety / band | −8.4187 % / `FAIR` | −8.2509 % / `FAIR` |
| `dataConfidence`, quality, adequacy, caps | — | **unchanged** |
| `modelConfidence` | 0.6342 | 0.6346 (spread-derived, disclosed as such) |

## Files

| Path | Contents |
|---|---|
| `artifact/authorized-policy-evidence.json` | the package: policy record, `L-034` arithmetic and declarations, `L-036` review control, V2 demonstration, regression attribution |
| `runs/ix-authorized-policy-run.log` | the generator's own stdout for the committed run |
| `README.md` | this file |

## What is deliberately absent

No associates/JV carrying value for any issuer. No new amends to WI1/WI2/WI3, VII or VIII artifacts. No store, no
NP-04 artifact, no persistence change. No second opinion on the authorised rates: 0.35 is a ceiling, and on this
assessment it happens to be exactly reached — which is arithmetic, not a target.
