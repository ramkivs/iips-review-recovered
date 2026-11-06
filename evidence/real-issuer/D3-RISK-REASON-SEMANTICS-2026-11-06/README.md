# D-3 — risk reason-code semantics, verified on the Infosys baseline

**Question this record answers:** the merged assessment told the reader that the risk policy inputs were unavailable
for Infosys. Was that true, and what does the product say now?

**Answer: it was not true.** Two of the three applicable risk dimensions had been evaluated and had passed, and only
leverage was blocked. The product now says exactly that, and the financial interpretation is unchanged.

| | |
|---|---|
| Baseline | `main` at `b982c05` (merge of PR #489, the post-D-2 regression record); D-2 merged at `b3987ef` |
| Issuer | Infosys Limited, `IN:CIN:L85110KA1981PLC013115`, Technology, consolidated Ind AS, FY2022–FY2024 |
| Input | the **original Work Item 1 input**, unchanged — `evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input` |
| Dataset | `sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e` — identical to Work Item 1 |
| Assessment | adequacy `SUFFICIENT`, quality `MATERIAL_CONCERNS`, confidence **0.4939** (caps `STALE_DATA`, `DILUTION_PROXY`) — identical |
| Risk block | `COMPLETE`→**`PARTIAL`** evaluation, `PASSED`→**`INDETERMINATE`** disposition, 2 dimensions passed, 1 blocked |
| Aggregate reason | `POLICY_INPUTS_UNAVAILABLE` → **`RISK_EVALUATION_PARTIAL`** |
| Payload digest | `cc91f239197a…` → `8e23f025527e…` — **two differing paths, both inside `risk`** |
| reportKey | `ed1e54b03e5e…` — unchanged |

## 1. Before and after, from the artefacts

`runs/risk-before-after.json` holds both blocks side by side, each with the file it came from.

**Before** (merged D-2, `runs/assessment-summary.json` of the previous bundle):

```json
"risk": { "factors": [], "aggregate": { "value": null, "presence": "NOT_COMPUTABLE", "reason": "POLICY_INPUTS_UNAVAILABLE" } }
```

**After** (this run):

```json
"risk": {
  "factors": [],
  "aggregate": { "value": null, "presence": "NOT_COMPUTABLE", "reason": "RISK_EVALUATION_PARTIAL" },
  "evaluation": { "completeness": "PARTIAL", "disposition": "INDETERMINATE", "counts": { "applicable": 3, "evaluated": 2, "passed": 2, "concerns": 0, "notEvaluable": 1, "notApplicable": 2 } }
}
```

## 2. Which dimensions ran, which passed, which did not — and why

| Dimension | Status | Measurement | Threshold applied | Blocking input |
|---|---|---|---|---|
| `FINANCIAL_LEVERAGE` | `NOT_EVALUABLE` | `NOT_COMPUTABLE` / `NOT_REPORTED` | concern at net debt / EBITDA ≥ 3.00× | `fundamentals.capitalStructure.netDebt` |
| `EARNINGS_QUALITY_CASH_CONVERSION` | **`PASSED`** | 0.9610 (96 % of profit) | concern below 80 % | — |
| `CAPITAL_ALLOCATION_CAPEX_INTENSITY` | **`PASSED`** | 0.0143 (1 % of revenue) | concern above 20 % | — |
| `REGULATORY_FRAMEWORK` | `NOT_APPLICABLE` | — | standing concern for a regulated sector | Technology is not regulated |
| `CYCLICALITY` | `NOT_APPLICABLE` | — | standing concern for a cyclical sector | Technology is not classified cyclical |

The blocked dimension names the *actual* input that blocked it, not a generic code: `netDebt` is `MISSING:
NOT_REPORTED` because the FY24 consolidated balance sheet presents no borrowings row, and the dimension and the
aggregate both carry `NOT_REPORTED`, never a zero.

No factor is raised in either run. The previous wording implied the whole assessment had failed; the corrected
wording says two dimensions were tested and passed, one could not be tested, and **no overall risk statement is
made**. The position is still blocked — it is now blocked legibly.

## 3. The financial interpretation is unchanged, field by field

`runs/payload-diff.json` compares the **stored** post-D-3 payload (read back from the chain in a separate process,
digest recomputed on read) with the committed Work Item 1 `artifact/assessment-payload-v2.json`:

- **2 differences in total**, both inside `risk`: `risk.aggregate.reason` and the added `risk.evaluation`.
- **0 differences** anywhere else.

So the following are byte-identical to the Work Item 1 artifact:

| Block | Value |
|---|---|
| `SHORT_TERM_BORROWINGS`, `CURRENT_MATURITIES_OF_LONG_TERM_DEBT`, `LONG_TERM_BORROWINGS`, `PREFERENCE_CAPITAL` | `MISSING` / `NOT_REPORTED`, no value, no source |
| `LEASE_LIABILITIES` | `PRESENT` 83,590,000,000, `INFY-INDAS-CONSOL-FY24`, periodEnd 2024-03-31 |
| gross debt / net debt | `MISSING` / `NOT_REPORTED` (blocked, no partial total) |
| `DCF_FCFF` | per-share `NOT_COMPUTABLE` / `NOT_REPORTED`, "enterprise-to-equity conversion blocked by netDebt" |
| `PE_RELATIVE` | per-share `PRESENT` 1,270.43 |
| `EV_EBITDA` / `EV_REVENUE` | not applicable — `CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable` / `MANDATORY_METRIC_MISSING` |
| `intrinsic` | **`null`** |
| margin of safety | refusal **`NO_PRICE_OBSERVATION`**, band `null`, no conclusion |
| moat | `INSUFFICIENT_EVIDENCE`, ROIC−WACC `NOT_COMPUTABLE` |
| dividends | `INSUFFICIENT_EVIDENCE`, `netDebtToEbitda` `NOT_COMPUTABLE` |
| completeness / quality / confidence | `SUFFICIENT` coverage 1.0 / `MATERIAL_CONCERNS` (`STALE_STATEMENTS`) / 0.4939 |
| evidence, limitations, sector reference | identical |

No valuation, no risk grade and no investment verdict is published anywhere, before or after.

## 4. Identity and digests

`runs/chain-read.json` — the head read in a separate process through `readVersionWithPayload`, which recomputes the
payload digest from the stored bytes:

| | |
|---|---|
| reportId / version | `7c80ffa3-…` / v1 (fresh scratch store, `/tmp/d3/store/investment.db`) |
| reportKey | `ed1e54b03e5e…` — **identical** to Work Item 1 |
| datasetVersion | `sha256:ca29c835…` — **identical** |
| inputDigest | `sha256:799b7203…` — **identical** |
| payloadDigest | `8e23f025527e…` — **changed** (`cc91f239197a…`), 45,129 bytes vs 42,800 |
| substantiveDigest | `01a89fb6…` — new, and it must be: the payload says something new |

The payload digest moved because the payload changed; that is what a digest is for. The **rules** behind the
substantive digest did not move, and the test suite proves it: reconstructing the pre-D-3 risk block from a fresh
payload reproduces the L-014 decision's published vectors (`08ea8d4a…`, `fd9589e4…`, `34240407…`) byte for byte, so
stored history keeps its digests and only post-D-3 runs digest differently.

The frozen engine identity is unchanged — `assessment-engine/1.0.0`, `valuation-policy/1.0.0`, schema 1, substantive
grammar `…/1`. The version that moved is the derivation that owns this vocabulary: `risk-taxonomy/1.0.0` →
`risk-taxonomy/1.1.0`, visible on every new measurement and on the aggregate's source.

## 5. Checks

`runs/tests.txt`, verbatim:

| Check | Result |
|---|---|
| `iips-platform` `npx tsc --noEmit` | clean |
| `npm run test:iid` | **420 / 420**, 111 suites, 0 fail (406 before this work item) |
| `tests/investment/risk-evaluation.test.ts` | **14 / 14** (new) |
| `frontend` `npm run typecheck` | clean |
| `frontend` `npm run typecheck:replay-server` | clean |
| `frontend` `npm run typecheck:investment-server` | clean |
| `vitest run server/investment` | 17 files / **207** tests pass (205 before; +2 for D-3) |
| `vitest run src/features/investment/iid6CompanyAssessment.test.tsx` | 16 tests pass (14 before; +2 for D-3) |
| `vitest run` (full) | 143 files / **1821** tests pass, 1 skipped |
| `npm run build` | built |

The two tests that were *updated* rather than added are the IID-5 substantive-identity vectors — see §4 and
`docs/integration/IIPS_V3_IID_D3_RISK_REASON_SEMANTICS_2026-11-06.md` §4. No other existing test changed, and no
golden fixture was regenerated.

## 6. Preserved

- `L-001` … `L-029`: untouched — the register diff is a pure append (§15); no entry's status, identifier, order or
  wording moved.
- The original Work Item 1 evidence: byte-identical, including `artifact/assessment-payload-v1.json` and `-v2.json`.
- The post-D-2 regression record (PR #489): unmodified.
- The withdrawn nil declarations: still under `D2-NIL-BY-DISCLOSURE-2026-11-06/withdrawn/` with `WHY-WITHDRAWN.md`.
- No formula, threshold, weighting, severity, likelihood, statement, confidence cap or verdict rule changed; no D-2
  semantic change; no new persistence mechanism; no price observation; no second issuer; no sector expansion.

## 7. Remaining qualification

Correcting a reason code is not validating a risk assessment. For this issuer the risk evaluation is **partial and
stays partial**: the filing presents no borrowings line, and this work item supplies no permitted substitute —
the ₹470 crore finance cost in the FY24 statement is not evidence of nil borrowings, and `NOT_REPORTED` stands. Two
dimensions were tested and passed on the filed numbers; the third cannot be tested from this input. One real issuer,
one path, no risk grade, no valuation, no verdict.
