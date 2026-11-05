# IID-2 — Company assessment (IID-01): evidence

**Date:** 2026-11-06 · **Branch:** `arena/08238a84-iips-review-recovered`
**Model/policy identity:** `assessment-engine/1.0.0` · `valuation-policy/1.0.0` · `freshness-policy/1.0.0` ·
`mos-policy/1.0.0` · schema `CompanyAssessment/v1`.

> **Synthetic reference data.** All three issuers in this directory are synthetic fixtures (`IN:ISIN:IN0000000201`,
> `IN:ISIN:IN0000000301`, `IN:ISIN:IN0000000401`). Nothing here describes a real company, and nothing here
> constitutes R-16 sector coverage. The fixtures exist to exercise the engine; they are not evidence that any
> sector is covered.

## What is in this directory

| File | Content |
|---|---|
| `golden-tech.json` / `.html` | Complete technology issuer: full method matrix, intrinsic range, margin of safety, WIDE moat, COVERED dividend, 5 annual + 4 discrete quarterly periods. |
| `golden-bank.json` / `.html` | Banking issuer: no `DCF_FCFF`, metric-qualified methods withheld by name, DDM-only intrinsic, PARTIAL adequacy. |
| `golden-thin.json` / `.html` | Intentionally incomplete issuer: 2 periods, no cash flow — `INSUFFICIENT` adequacy, `intrinsic: null`, every gap named. |
| `golden-digests.json` | Determinism evidence: payload digests for 3 dataset orderings and 3 fresh process restarts, per issuer. |
| `readiness.txt` | One line per issuer: adequacy, coverage, intrinsic, MoS, moat, dividend verdict, confidence, violation count. |
| `ACIERD-AC-2-MATRIX.md` | Every IID-2 acceptance criterion with the test that proves it and the observed result. |

Regenerate (no dataset, no store, no NP-04 artifact is touched):

```
cd iips-platform
./node_modules/.bin/tsx scripts/iid2-assessment-golden.ts ../evidence/iid/IID-2-COMPANY-ASSESSMENT-2026-11-06
```

## Module map — roadmap task names → delivered files

The roadmap's task list (§IID-2, tasks 1–11) names files by responsibility. The implementation groups them
under `iips-platform/src/investment/assessment/`, because every module is one assessment concern and the
`normalize/` + `valuation/` sub-directories would have split single responsibilities across directories:

| Roadmap task | Delivered module |
|---|---|
| 1. `normalize/periods.ts` — period algebra | `assessment/periods.ts` (annual/quarterly/TTM, YTD→discrete, FY labelling, scope selection, restatement precedence) |
| 2. `normalize/derived.ts` — derived metrics | **reused, not re-implemented**: `fundamentals/derive.ts` (IID-0) supplies `derived`, consumed through `periodObservation` |
| 3. `completeness.ts` / `quality.ts` | `assessment/adequacy.ts` (both blocks, one gate list) |
| 4. `valuation/policy.ts` + `sectorMethodMatrix.ts` | `assessment/policy.ts` (every threshold, versioned) + `coverage/methodMatrix.ts` (IID-0, sector matrix reused unchanged) |
| 5. `valuation/capitalStructure.ts` | `assessment/capitalStructure.ts` (net debt, leases, NCI, preference, associates, share-count guard, per-share) |
| 6. `valuation/methods.ts` | `assessment/methods.ts` (one implementation per method family in §A2, each with formula id/version, inputs and assumptions) |
| 7. `valuation/intrinsic.ts` + `sensitivity.ts` | `assessment/intrinsic.ts` (blend, spread, INV-5 suppression, 3×3 grid) |
| 8. `dividends/sustainability.ts` | `assessment/dividends.ts` (declared vs implied, reconciliation, verdict) |
| 9. `moat/` + `risk/` + `confidence.ts` + `explain.ts` | `assessment/moat.ts`, `assessment/risk.ts`, `assessment/confidence.ts`, `assessment/explain.ts` |
| 10. `assessment/CompanyAssessmentEngine.ts` | `assessment/engine.ts` (`assessCompany`, `validatePayload`) |
| 11. Golden assessments for 3 reference issuers | this directory (`golden-*.json`), emitted by `scripts/iid2-assessment-golden.ts` |
| (view, evidence only) | `assessment/view.ts` — server-rendered HTML with no JavaScript, used to inspect a payload during IID-2. It is **not** the IID-6 product surface and it persists nothing. |

`assessment/index.ts` is the barrel; module order in it is the dependency order.

## What the engine guarantees, and where it is proven

* **No fabricated number.** Every numeric field is an IID-0 `Observation`. Absence is `MISSING` or
  `NOT_COMPUTABLE` with a reason; no field is defaulted to zero, and no method substitutes a prior period or a
  sector median. Proven by `assessment-valuation.test.ts`, `assessment-capital.test.ts` and the INV-1 walk in
  `assessment-engine.test.ts`.
* **No partial aggregate.** An intrinsic range is published only when every weighted method produced a
  per-share value; otherwise it is `null` and the unmet inputs are named (INV-5). Proven by
  `assessment-valuation.test.ts` and `assessment-capital.test.ts` (share-count mismatch).
* **No silent adjustment.** A price is used only inside the 7-day policy window, only when it postdates
  `knownAsOf`, and only when any per-share-affecting corporate action before the observation carries an
  applied factor. Otherwise the margin of safety is withheld and the refusal is named. Proven by
  `assessment-price.test.ts`.
* **No merged dividend sources.** Declared and cash-flow-implied DPS are published side by side; a divergence
  beyond 10% raises `DIVIDEND_SOURCE_CONFLICT`, keeps both values, flags quality and caps confidence. Proven by
  `assessment-dividends.test.ts`.
* **Byte determinism.** Identical inputs in any array order, and across process restarts, produce a byte-identical
  payload. Proven by `assessment-engine.test.ts` and by `golden-digests.json`.
* **Sector structure.** A bank assessment contains no `DCF_FCFF` method and no DCF sensitivity grid, and states
  the exclusion in `methodSelection`. Proven by `assessment-valuation.test.ts` and `assessment-engine.test.ts`.

## Defects found and fixed while writing the acceptance tests

These were real defects in the draft engine, found because the criteria were tested rather than assumed:

1. **Q4 of every fiscal year was dropped.** Fiscal-year identity was compared on the *calendar year of the
   period end*, so FY2026 Q3 (`2025-12-31`) and Q4 (`2026-03-31`) looked like different years and Q4's YTD→discrete
   conversion was refused. Now compared on the period *start*. (`periods.ts`)
2. **Q4 collided with the annual period in restatement de-duplication.** The de-duplication key was the period
   end alone, so the annual and the fourth cumulative quarter of the same date could not coexist. The key now
   includes the period type. (`periods.ts`)
3. **The first quarter of a fiscal year was refused.** A Q1 YTD needs no predecessor — its baseline is the
   fiscal-year start, which is zero by definition. Now allowed for `quarterIndex === 1` only. (`periods.ts`)
4. **Every enterprise-value method was blocked** because `associatesAndJV` is absent from dataset schema v1 and
   was treated as a hard blocker. Now carried as a declared policy zero per R-4.1, published in the method's
   `basis` and in `limitations`. (`capitalStructure.ts`)
5. **A sensitivity grid of nulls was emitted** for a bank, suggesting a DCF that never ran. The grid is now emitted
   only when the DCF arithmetic can produce a base value. (`intrinsic.ts`)
6. **Method evidence ids did not resolve** (`EV-METHOD-DCF` cited, `EV-DCF_FCFF` published). Method evidence ids
   are now derived from the evidence entries the payload actually publishes, and `validatePayload` rejects a
   dangling citation (INV-2). (`engine.ts`)
7. **`UNVERIFIED` was unreachable.** A payload with `INSUFFICIENT` adequacy and a third of required fields present
   reported quality `CLEAN`. Adequacy now gates the quality verdict. (`adequacy.ts`)
8. **Structural refusals were invisible in prose.** A share-count period mismatch, a pre-116 series and a missing
   net debt now each add a `limitations` line, so a reader who never expands an observation still sees the gap.
   (`engine.ts`)
9. **A price adjustment window was inverted.** An unadjusted price observed *after* a split was accepted, because
   only actions *after* the price date were checked. The check now covers any per-share-affecting action
   effective on or before `generatedAt`. (`margin.ts`)

## Known limitations carried forward (not resolved here)

1. **Dividend verdict for banking is withheld.** The leverage gate consumes `netDebt / EBITDA`, and EBITDA is not
   a reported line item for a bank. The verdict is therefore `INSUFFICIENT_EVIDENCE` with
   `NET_DEBT_TO_EBITDA_UNAVAILABLE` named, rather than resting on free-cash-flow coverage alone. A
   sector-specific leverage measure would be a `valuation-policy` revision, not an implementation fix.
2. **Restricted cash cannot be evidenced, only excluded by construction.** R-4.1's formula subtracts cash and
   cash equivalents plus liquid investments; restricted balances, margin money and regulatory balances sit in
   "other bank balances" (Schedule III) and are therefore outside both components. Dataset schema v1 has no
   restricted-balance line item, so `components.restrictedCash` is `NOT_COMPUTABLE: NOT_REPORTED`. Adding that
   line item is an IID-0 contract amendment, deliberately not made in this phase.
3. **Dilution is a proxy.** The diluted share count is the EPS-implied count (PAT attributable ÷ diluted EPS);
   ESOP and convertible dilution is not in schema v1. The `DILUTION_PROXY` cap (0.98) and a limitation line
   disclose it on every assessment.
4. **`SOTP` is not implemented.** A multi-segment issuer needs segment data, which schema v1 does not carry, so
   R-5's ≥10%-of-revenue-over-≥3-periods test cannot be evaluated. Where a sector's matrix lists `SOTP`, the
   method is published in `methodSelection` as `METHOD_NOT_IMPLEMENTED_IN_ENGINE_V1` rather than omitted; none of
   the three reference issuers' sectors lists it, so it does not appear in these goldens.
5. **No persistence, no transport, no product surface.** `assessCompany` returns a payload. `view.ts` is an
   evidence-only HTML renderer. IID-3 owns serialisation and `GET`; IID-6 owns the UI.
6. **Synthetic fixtures only.** No real issuer has been assessed. R-16 sector coverage remains open (3 of 13
   sectors measured on synthetic data) and is not advanced by this phase.
