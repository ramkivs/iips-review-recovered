# IES-014 — Worked Example: Capital Goods OEM Leader (IN-001)

**Standard:** IES-014 — Industrials Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-09
**Contract:** IES-014 D15 v1.2

---

## Inputs

- Subsegment: capital-goods, archetype: oem
- EBITDA margin 22%, revenue growth 8%, Debt/EBITDA 2.0x, EV/EBITDA 12, ROCE 20%, backlog 2.5x, book-to-bill 1.05, aftermarket 30%, FCF yield 8%, order growth 8%, operating margin 22%, project risk 20%.

## Band → score (D15 v1.2, lower-inclusive/upper-exclusive)

| Metric | Value | Band | Score |
|---|---|---|---|
| IM-001 EBITDA margin | 22 | 15≤x<25 | 75 |
| IM-002 Revenue growth | 8 | 5≤x<10 | 75 |
| IM-003 Debt/EBITDA | 2.0 | 1.5≤x<2.5 | 75 |
| IM-004 EV/EBITDA | 12 | 12≤x<16 | 60 |
| IM-005 ROCE | 20 | 15≤x<25 | 75 |
| IM-006 Backlog | 2.5 | 2≤x<3 | 75 |
| IM-007 Book-to-bill | 1.05 | 1.0≤x<1.1 | 75 |
| IM-008 Aftermarket | 30 | 30≤x<50 | 75 |
| IM-009 FCF yield | 8 | 6≤x<10 | 75 |
| IM-010 Order growth | 8 | 5≤x<10 | 75 |
| IM-011 Op margin | 22 | 18≤x<28 | 75 |
| IM-012 Project risk | 20 | 15≤x<30 | 75 |

## Pillars (full precision, D07)

| Pillar | Computation | Value |
|---|---|---|
| Quality | Aftermarket 75×0.40 + CostPosition(IM-011=75)×0.35 + Execution((75+75)/2=75)×0.25 | 75.0 |
| Growth | Backlog 75×0.40 + OrderGrowth 75×0.35 + RevGrowth 75×0.25 | 75.0 |
| Risk | Leverage 75×0.70 + ProjectRisk 75×0.30 | 75.0 |
| Profitability | IM-001 75×0.40 + IM-011 75×0.40 + ROCE 75×0.20 | 75.0 |
| Capital Efficiency | FCF 75×0.50 + ROCE 75×0.50 | 75.0 |
| Valuation | IM-004 60 | 60.0 |

## Composite (capital-goods weights; archetype oem risk 1.2x)

```text
w = [0.25, 0.25, 0.20, 0.15, 0.10, 0.05]; w[Risk]=0.20×1.2=0.24
Composite = 75×0.25 + 75×0.25 + 75×0.24 + 75×0.15 + 75×0.10 + 60×0.05
          = 18.75 + 18.75 + 18.00 + 11.25 + 7.50 + 3.00 = 77.25
Composite = round_half_to_even(77.25) = 77.2
```

## Verdict

- Composite 77.2 → **Buy** (70 ≤ x < 80).
- No overrides.

## Determinism

Identical inputs + calibration + methodology version → identical composite + verdict. Replay-identical.
