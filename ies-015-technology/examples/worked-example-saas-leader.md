# IES-015 — Worked Example: SaaS Platform Leader (TE-001)

**Standard:** IES-015 — Technology Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-09
**Contract:** IES-015 D15 v1.3

---

## Inputs

- Subsegment: software-saas, archetype: subscription
- EBITDA margin 24%, revenue growth 22%, Debt/EBITDA 1.5x, EV/Revenue 14, FCF yield 6%, recurring revenue 80%, NRR 118%, gross margin 75%, R&D intensity 12%, customer concentration 20%, capex intensity 8%, usage growth 25%.

## Effective band-table resolution (D15 §6a)

The software-saas profile defines a **calibrated TM-007 (NRR) table**; all other metrics fall back to the baseline. NRR = 118 falls in the calibrated **105 ≤ x < 120 → 75** band, whereas the baseline would give **≥115 → 90**. This is the **calibrated boundaries + scores together** case: the calibrated table supersedes the complete baseline table.

## Band → score (D15 v1.3, lower-inclusive/upper-exclusive)

| Metric | Value | Effective table | Band | Score |
|---|---|---|---|---|
| TM-001 EBITDA margin | 24 | baseline | 20≤x<30 | 75 |
| TM-002 Revenue growth | 22 | baseline | 15≤x<25 | 75 |
| TM-003 Debt/EBITDA | 1.5 | baseline | 1.0≤x<2.0 | 75 |
| TM-004 EV/Revenue | 14 | baseline | 12≤x<16 | 60 |
| TM-005 FCF yield | 6 | baseline | 4≤x<7 | 75 |
| TM-006 Recurring % | 80 | baseline | ≥75 | 90 |
| TM-007 NRR | 118 | **calibrated** | 105≤x<120 | **75** |
| TM-008 Gross margin | 75 | baseline | ≥70 | 90 |
| TM-009 R&D intensity | 12 | baseline | ≥10 | 75 |
| TM-010 Customer conc. | 20 | baseline | 10≤x<25 | 75 |
| TM-011 Capex intensity | 8 | baseline | 5≤x<15 | 75 |
| TM-012 Usage growth | 25 | baseline | 15≤x<30 | 75 |

## Pillars (full precision, D07 — no intermediate rounding)

| Pillar | Computation | Value |
|---|---|---|
| Quality | TM-006 90×0.40 + TM-007 75×0.30 + TM-008 90×0.30 | 85.5 |
| Growth | TM-002 75×0.40 + TM-012 75×0.35 + TM-009 75×0.25 | 75.0 |
| Risk | TM-003 75×0.40 + TM-010 75×0.35 + TM-011 75×0.25 | 75.0 |
| Profitability | TM-001 75×0.50 + TM-008 90×0.50 | 82.5 |
| Capital Efficiency | TM-005 75×1.00 | 75.0 |
| Valuation | TM-004 60×1.00 | 60.0 |

## Composite (software-saas weights; subscription risk 0.8x)

```text
w = [0.30, 0.25, 0.15, 0.15, 0.10, 0.05]; w[Risk] = 0.15 × 0.8 = 0.12
Composite = 85.5×0.30 + 75×0.25 + 75×0.12 + 82.5×0.15 + 75×0.10 + 60×0.05
          = 25.65 + 18.75 + 9.00 + 12.375 + 7.50 + 3.00 = 76.275
Composite = round_half_to_even(76.275) = 76.3
```

## Verdict

- Composite 76.3 → **Buy** (70 ≤ x < 80).
- No overrides (Debt/EBITDA 1.5 < software-saas alert 3.0).

## Determinism

Identical inputs + calibration version (`technology-calibration-1.0.0`, TM-007 calibrated) + methodology version → identical composite + verdict. Replay-identical.
