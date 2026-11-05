# IID-2 acceptance criteria — result and proof

All results below are from the executed suites, not from inspection. Command:

```
cd iips-platform && ./node_modules/.bin/tsx --test tests/investment/*.test.ts
```

Last run: **275 / 275 pass, 0 fail** (75 suites; 80 of the tests are IID-2, the other 195 are the IID-0/IID-1
suites re-run unchanged). Regression: `tests/regression/np12-sector-reference-population.test.ts` **42 / 42**.
Typecheck: `./node_modules/.bin/tsc --noEmit` exit 0.

| ID | Criterion (roadmap §IID-2) | Result | Proof (file::test) |
|---|---|---|---|
| AC-2.1 | A missing mandatory input yields a withheld method with a named `MissingReason`; no method substitutes 0 or a prior period's value | **PASS** | `assessment-valuation.test.ts`::*every missing input is named*; `assessment-capital.test.ts`::*an issuer with no balance sheet publishes an unavailable net debt, not a zero* |
| AC-2.2 | Consolidated and standalone never mixed; scope recorded per period and in the payload | **PASS** | `assessment-periods.test.ts`::*the consolidated series is chosen and the standalone period is excluded, by name*; *the published payload reports the excluded period*; *a standalone-only issuer is used with the substitution recorded* |
| AC-2.3 | YTD→discrete accepted only when the arithmetic is sound; otherwise `DERIVATION_NOT_SUPPORTED` | **PASS** | `assessment-periods.test.ts`::*each cumulative quarter is converted…*, *a YTD quarter with no preceding quarter is refused…*, *TTM is the sum of four discrete quarters*, *fewer than four… yields no TTM* |
| AC-2.4 | Every per-share output withheld when the share-count period mismatches the numerator period | **PASS** | `assessment-capital.test.ts`::*a share count from an older period withholds per-share values and keeps the enterprise figure* (asserts `SHARE_COUNT_PERIOD_MISMATCH`, `intrinsic: null`, limitation line) |
| AC-2.5 | Bank: no `DCF_FCFF` result + stated reason; technology with missing `NRR` withholds the method that requires it | **PASS** | `assessment-valuation.test.ts`::*a bank assessment publishes no FCFF DCF and states the exclusion*; *a mandatory metric the company does not report withholds the method and names the metric* (`EV_REVENUE` ← `TM_NRR`) |
| AC-2.6 | Net debt excludes restricted cash and includes lease liabilities; pre-116 flag when a comparative predates Ind AS 116 | **PASS (first clause structural — see limitation 2)** | `assessment-capital.test.ts`::*net debt is built from named components*, *restricted cash is never silently treated as available*, *a pre-Ind-AS-116 series is flagged* (asserts `PRE_116_FLAGGED` + `limitation`) |
| AC-2.7 | Sensitivity monotone: WACC↑ ⇒ value↓, growth↑ ⇒ value↑ within the declared domain | **PASS** | `assessment-valuation.test.ts`::*value rises with growth and falls with the discount rate* (all 9 grid points, both directions), *the base point of the grid equals the DCF mid value* |
| AC-2.8 | Moat `WIDE` requires ≥3 consecutive positive ROIC−WACC years **and** ≥2 independent dimensions | **PASS** | `assessment-moat.test.ts`::*five years … classify as WIDE*, *a compressed spread keeps the classification at NARROW*, *one dimension missing keeps WIDE out of reach*, *no measurable spread … is INSUFFICIENT_EVIDENCE, never NONE* |
| AC-2.9 | Dividend verdict requires the corroboration block; a divergent corporate-action vs cash-flow figure raises `DIVIDEND_SOURCE_CONFLICT` with both values visible | **PASS (R-15 single-source rule applied — see note)** | `assessment-dividends.test.ts`::*with no declaration the block says so…*, *a declared dividend in line with the cash flow reconciles as CONSISTENT*, *a divergent declaration raises DIVIDEND_SOURCE_CONFLICT and keeps both figures visible*, *a declared dividend against zero cash dividends is a sign contradiction* |
| AC-2.10 | MoS withheld when the price is outside the policy window or predates `knownAsOf`; a split-affected price without an applied factor is refused, not adjusted | **PASS** | `assessment-price.test.ts`::*no observation is refused by name*, *a price older than the policy window is refused as stale*, *a price that predates the knowledge cutoff is refused*, *an unadjusted price across a split is refused*, *a price already adjusted … is accepted* |
| AC-2.11 | Byte-identical payload for identical inputs across 3 dataset orderings and 3 process restarts | **PASS** | `assessment-engine.test.ts`::*three dataset orderings produce an identical payload and digest*, *three fresh processes produce the byte-identical payload*; artefacts in `golden-digests.json` (`identicalAcrossOrderings: true`, `identicalAcrossRestarts: true` for all three issuers) |
| AC-2.12 | Every `evidence[]` entry is referenced by ≥1 field path, and that path resolves | **PASS** | `assessment-engine.test.ts`::*every evidence entry resolves, cites a published method, and carries a source*, *the engine reports no invariant violation … and a corrupted payload is caught* |
| AC-A1 | A banking assessment contains no `DCF_FCFF` and says why | **PASS** | `assessment-valuation.test.ts`::*a bank assessment publishes no FCFF DCF…*; `assessment-engine.test.ts`::*the bank never receives an FCFF DCF*; `golden-bank.json` `methodSelection.considered[DCF_FCFF].role = NOT_APPLICABLE` |
| AC-A2 | `intrinsic` is `null` unless every weighted method is applicable and present | **PASS** | `assessment-valuation.test.ts`::*an intrinsic range exists only when every weighted method produced a per-share value*; `assessment-capital.test.ts` (mismatch ⇒ `intrinsic: null`) |
| INV-1 | Present ⇒ value; absent ⇒ `null` + reason; never a zero for an absence | **PASS** | `assessment-engine.test.ts`::*INV-2 — every present number carries a provenance record* (walks every observation) ; `assessment-periods.test.ts`::*an absent item is NOT_REPORTED, never a zero* |
| INV-2 | Every cited evidence id exists and every published method cites evidence | **PASS** | `assessment-engine.test.ts`::*every evidence entry resolves…*; enforced in `validatePayload` |
| INV-3 | No imputation: `allowsImputation === false` on every method | **PASS** | `assessment-valuation.test.ts`::*weighted methods carry the policy blend and no imputation flag* |
| INV-4 | Every refusal carries a machine-readable reason | **PASS** | `assessment-periods.test.ts`, `assessment-price.test.ts`, `assessment-dividends.test.ts` (each refusal asserted by exact reason code) |
| INV-5 | No aggregate from partial coverage; weights sum to 1 | **PASS** | `assessment-valuation.test.ts`::*an intrinsic range exists only when…*, *one withheld method withholds the intrinsic range* |
| INV-6 | Composition-time validation | **PASS** | `assessment-engine.test.ts`::*the engine reports no invariant violation for any fixture, and a corrupted payload is caught* (tampered evidence path and out-of-range coverage both rejected) |
| Determinism / digest | `inputDigest` sensitive to inputs, stable across runs | **PASS** | `assessment-engine.test.ts`::*the digest is input-sensitive* |
| Refusal ordering | Price refusal and intrinsic withholding both reported deterministically | **PASS** | `assessment-price.test.ts`::*without an intrinsic range the margin is withheld and the reason is the intrinsic*; `readiness.txt` THIN row (`mos=NO_PRICE_OBSERVATION` — price refusal precedes the intrinsic reason when both apply) |
| Sector-reference separation | Labelled `SECTOR_REFERENCE`, never cited as evidence | **PASS** | `assessment-engine.test.ts`::*the sector reference is labelled, separate, and cannot be cited as evidence*; `assessment-view.test.ts`::*the sector reference block is presented apart from the company fields* |

## Note on AC-2.9 and R-15

AC-2.9 says the dividend verdict *requires the corroboration block*. R-15 (design of record, Part III) adds that
when only one source is present the sustainability *may still be computed from it*, with the basis recorded and
the corroborating field marked `MISSING` with a reason. Both are satisfied and both are tested: the
reconciliation block is published on **every** assessment (never omitted, never `null`); a divergence raises
`DIVIDEND_SOURCE_CONFLICT` with both figures retained; and the verdict is withheld only when the coverage inputs
themselves are absent (`FCF_COVERAGE_UNAVAILABLE`, `NET_DEBT_TO_EBITDA_UNAVAILABLE`).

## Golden outcomes (synthetic fixtures)

| Issuer | Adequacy | Coverage | Intrinsic (low–mid–high) | MoS | Moat | Dividends | Confidence | Violations |
|---|---|---|---|---|---|---|---|---|
| `IN:ISIN:IN0000000201` (Technology) | SUFFICIENT | 1.0000 | 414.28 – 516.56 – 661.74 | SIGNIFICANT_PREMIUM | WIDE | COVERED | 0.8371 | 0 |
| `IN:ISIN:IN0000000301` (Banking) | PARTIAL | 0.7778 | 63.14 – 74.29 – 85.43 | FAIR | INSUFFICIENT_EVIDENCE | INSUFFICIENT_EVIDENCE | 0.5609 | 0 |
| `IN:ISIN:IN0000000401` (Consumer, incomplete) | INSUFFICIENT | 0.3333 | WITHHELD | NO_PRICE_OBSERVATION | INSUFFICIENT_EVIDENCE | NO_DIVIDEND | 0.1176 | 0 |
