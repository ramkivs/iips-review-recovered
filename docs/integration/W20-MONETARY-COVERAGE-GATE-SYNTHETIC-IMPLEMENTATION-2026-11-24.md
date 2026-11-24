# W20 — Pure monetary-coverage gate: synthetic implementation record (2026-11-24)

**Status: IMPLEMENTED and SYNTHETICALLY VERIFIED ONLY. This is NOT W20 acceptance of any actual portfolio, NOT a
θM/θF value, NOT a D1/D2/D3 decision, and NOT a live-data claim.** W20 remains `BLOCKED / NOT ACCEPTED` until actual
evidence (B02 host access, W05/W06) establishes the open parameters.

**Implements:** the merged W12–W20 interface contract (`W12-VALUATION-METHODOLOGY-TECHNICAL-DESIGN-2026-11-23.md` §12,
IRR PR #649, main `8035f92d`) and vector specs V19–V24 (§11.7).

## Files

- `frontend/server/investment/w20MonetaryCoverageGate.ts` — the pure gate: `evaluateMonetaryCoverageGate(report,
  options?)` over the existing W13 `PositionValuationReport` (schema `iips.w13.position-valuation/v1`). Read-only,
  deterministic, no I/O, no W13/IPD logic duplicated.
- `frontend/server/investment/w20MonetaryCoverageGate.test.ts` — 17 synthetic tests (V19–V24 + boundary cases).

## What the gate does (contract §12, mapped)

1. **Input contract (§12.1):** consumes the W13 report fields exactly — schema version check (else
   `BLOCKED/SCHEMA_OR_REFUSAL`), `capture` echoed (acceptance bound to the exact revision), per-position
   `rowId`/`securityId`/status/`quantity`, `VALUED` observations (`ltp`, `quoteCurrency`, timestamps, IPD
   `freshnessVerdict`, provenance), null-not-zero unvalued fields; producer `totals` cross-checked fail-closed;
   `openMethodologyDecisions` echoed, never resolved.
2. **Gross exposure (§12.2):** `|quantity| × observation.ltp`, unrounded, per valued position; long/short never net
   (V19: signed 2305 vs gross 2705); unqualified/unresolved/stale holdings stay in population `E` with exposure
   `null` (never 0) and a reason (V20); inactive excluded from `E`; per-currency aggregation only.
3. **Precision (§12.3):** gate inputs are unrounded products and unrounded `N`, `D`, `N/D`; `round2` is
   presentation-only (V21: gate `N = 0.375`, per-position presentation `0.13`, naive rounded sum `0.39` not used);
   single-computation rule — W13 qualifies, W20 computes the gate from report fields.
4. **Units/multipliers (§12.4):** none applied (no source in the data model); every audit record carries
   `unitMultiplier: 'NOT_ESTABLISHED'`; the precise required input remains `instrumentUnitMultiplier(securityId)`.
5. **Valuation context (§12.5):** `C` recorded (single currency, else null + `NO_SINGLE_CURRENCY` refusal of
   mixed-currency aggregation — V24); `t` recorded (default `report.evaluatedAt`, overridable); observation
   timestamps retained verbatim; ages computed as `t − asOf` in ms, null when absent — never fabricated (V23);
   IPD freshness verdicts consumed verbatim, never re-derived or upgraded.
6. **Acceptance output (§12.6):** per-holding audit records + per-currency aggregates + single-`C` aggregates
   (`N`, exact `D` only when every eligible holding is valued and `D > 0`, unrounded ratio, presentation pct) +
   bound capture + echoed open decisions; result vocabulary `PASS`/`FAIL`/`BLOCKED` with reason codes
   `SCHEMA_OR_REFUSAL`, `EMPTY_POPULATION` (`|E| = 0` → NOT_APPLICABLE, never 100 % — V22), `NO_SINGLE_CURRENCY`,
   `DENOMINATOR_INDETERMINATE`, `THETA_M_UNESTABLISHED`. `PASS` iff no block reasons and unrounded ratio ≥ θM
   (comparison mechanics only — θM is injected in tests solely to exercise PASS/FAIL; production default is
   UNESTABLISHED → always `BLOCKED`).

## Verification (synthetic only)

- `w20MonetaryCoverageGate.test.ts`: **17/17 pass** — V19 (gross no-netting + θM-unestablished block), V20 (stale and
  unresolved in `E`, null exposure, indeterminate denominator, never 100 %), V21 (unrounded vs presentation
  arithmetic), V22 (empty population, incl. all-inactive), V23 (default/overridden `t`, verbatim `asOf`, ages
  120/30 min, null-age case), V24 (single `C` vs mixed refusal with per-currency breakdown), boundary (wrong schema,
  totals disagreement, negative ltp, FAIL mechanics with synthetic θM=1.5, zero-total 0/0 block, capture/decisions
  echo + input immutability).
- Scoped cluster (gate + W13 + W12 vectors + lineage + user-portfolio + W17 mode suites): **24 files, 461/461 pass**.
- Scoped strict `tsc` (repo flags incl. `noUnusedLocals`, `types: vitest/globals,@testing-library/jest-dom`) clean on
  both new files; also clean under `tsconfig.investment-server.json` (`server/investment/**`) scope.

## Field sufficiency (task question — answered per calculation)

The existing W13 report fields are **sufficient for every gate calculation**: capture binding (`capture`), population
(`status` + `totals.active` cross-check), gross exposure (`quantity` + `observation.ltp`), currency (`quoteCurrency` /
`totals.mixedCurrencies`), `t` baseline (`evaluatedAt`), ages (`observation.asOf`), verdicts (`freshnessVerdict` via
status), provenance echo. **Not sufficient / still required:** instrument unit multipliers (no field exists —
`NOT_ESTABLISHED`), established θM (parameter), max observation age (policy [E]), final `t` choice ([O]), D1/D2/D3
([E][O]). No W13 change was needed or made.

## Boundaries held

IRR-only, additive; no W13 change; no IPD change or freshness-behavior change; no live vendor request; no host access;
synthetic reports only, labelled synthetic; no D1/D2/D3/θM/max-age/multiplier policy invented; no acceptance claim;
NP-04/NP-06 untouched; no credentials. Tracker record: §16.345.
