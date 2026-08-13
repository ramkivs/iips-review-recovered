# IES-015 — Worked Example: Semiconductor Foundry (TE-003)

**Standard:** IES-015 — Technology Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-09
**Contract:** IES-015 D15 v1.3

---

## Inputs

- Subsegment: semiconductors, archetype: foundry-manufacturing
- EBITDA margin 28%, revenue growth 18%, Debt/EBITDA 2.2x, EV/Revenue 6, FCF yield 3%, recurring revenue 55%, NRR 108%, gross margin 40%, R&D intensity 12%, customer concentration 15%, capex intensity 40%, usage growth 20%.

## Effective band-table resolution (D15 §6a) — calibrated boundaries AND scores together

The semiconductors profile defines **calibrated band tables for TM-008 (gross margin) and TM-011 (capex intensity)**. Both boundaries AND score values differ from baseline:

| Metric | Value | Calibrated | Baseline would give |
|---|---|---|---|
| TM-008 Gross margin | 40 | 35≤x<50 → **75** | 30≤x<50 → 60 |
| TM-011 Capex intensity | 40 | 30≤x<45 → **60** | ≥30 → 40 |

This is the **calibrated boundaries + scores resolve together** case — the complete calibrated table supersedes the complete baseline table (never mixing calibrated boundaries with baseline scores). Both calibrated tables preserve the baseline **4-band cardinality** (D15 §6a.2).

## Band → score (D15 v1.3, lower-inclusive/upper-exclusive)

| Metric | Value | Effective table | Band | Score |
|---|---|---|---|---|
| TM-001 EBITDA margin | 28 | baseline | 20≤x<30 | 75 |
| TM-002 Revenue growth | 18 | baseline | 15≤x<25 | 75 |
| TM-003 Debt/EBITDA | 2.2 | baseline | 2.0≤x<3.0 | 55 |
| TM-004 EV/Revenue | 6 | baseline | <8 | 90 |
| TM-005 FCF yield | 3 | baseline | 2≤x<4 | 60 |
| TM-006 Recurring % | 55 | baseline | 50≤x<75 | 75 |
| TM-007 NRR | 108 | baseline | 105≤x<115 | 75 |
| TM-008 Gross margin | 40 | **calibrated** | 35≤x<50 | **75** |
| TM-009 R&D intensity | 12 | baseline | ≥10 | 75 |
| TM-010 Customer conc. | 15 | baseline | 10≤x<25 | 75 |
| TM-011 Capex intensity | 40 | **calibrated** | 30≤x<45 | **60** |
| TM-012 Usage growth | 20 | baseline | 15≤x<30 | 75 |

## Pillars (full precision, D07)

| Pillar | Computation | Value |
|---|---|---|
| Quality | TM-006 75×0.40 + TM-007 75×0.30 + TM-008 75×0.30 | 75.0 |
| Growth | TM-002 75×0.40 + TM-012 75×0.35 + TM-009 75×0.25 | 75.0 |
| Risk | TM-003 55×0.40 + TM-010 75×0.35 + TM-011 60×0.25 | 63.25 |
| Profitability | TM-001 75×0.50 + TM-008 75×0.50 | 75.0 |
| Capital Efficiency | TM-005 60×1.00 | 60.0 |
| Valuation | TM-004 90×1.00 | 90.0 |

## Composite (semiconductors weights; foundry-manufacturing risk 1.3x)

```text
w = [0.20, 0.20, 0.30, 0.15, 0.10, 0.05]; w[Risk] = 0.30 × 1.3 = 0.39
Composite = 75×0.20 + 75×0.20 + 63.25×0.39 + 75×0.15 + 60×0.10 + 90×0.05
          = 15 + 15 + 24.6675 + 11.25 + 6 + 4.5 = 76.4175
Composite = round_half_to_even(76.4175) = 76.4
```

## Verdict

- Composite 76.4 → **Buy** (70 ≤ x < 80).
- No overrides (Debt/EBITDA 2.2 < semiconductors alert 2.5).

## Determinism

Identical inputs + calibration version (`technology-calibration-1.0.0`, TM-008/TM-011 calibrated) + methodology version → identical composite + verdict. Replay-identical.
