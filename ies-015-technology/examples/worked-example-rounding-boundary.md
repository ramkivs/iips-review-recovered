# IES-015 — Worked Example: Round-Half-Even Composite Boundary (TE-012)

**Standard:** IES-015 — Technology Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-09
**Contract:** IES-015 D15 v1.3

---

## Inputs

- Subsegment: it-services, archetype: license
- EBITDA margin 8%, revenue growth 4%, Debt/EBITDA 1.5x, EV/Revenue 18, FCF yield 1%, recurring revenue 25%, NRR 90%, gross margin 25%, R&D intensity 7%, customer concentration 20%, capex intensity 8%, usage growth 4%.

This example exercises **round-half-to-even at the composite only** (D15 §4): the unrounded composite is **49.25**, which must round to **49.2** (round-half-to-even) — **not** 49.3 (which round-half-up would produce).

## Band → score (baseline; it-services has no calibrated tables)

| Metric | Value | Band | Score |
|---|---|---|---|
| TM-001 EBITDA margin | 8 | <10 | 40 |
| TM-002 Revenue growth | 4 | <5 | 40 |
| TM-003 Debt/EBITDA | 1.5 | 1.0≤x<2.0 | 75 |
| TM-004 EV/Revenue | 18 | ≥16 | 40 |
| TM-005 FCF yield | 1 | <2 | 40 |
| TM-006 Recurring % | 25 | <30 | 40 |
| TM-007 NRR | 90 | <95 | 40 |
| TM-008 Gross margin | 25 | <30 | 40 |
| TM-009 R&D intensity | 7 | 5≤x<10 | 60 |
| TM-010 Customer conc. | 20 | 10≤x<25 | 75 |
| TM-011 Capex intensity | 8 | 5≤x<15 | 75 |
| TM-012 Usage growth | 4 | <5 | 40 |

## Pillars (full precision, D07 — NO intermediate rounding)

| Pillar | Computation | Value |
|---|---|---|
| Quality | 40×0.40 + 40×0.30 + 40×0.30 | 40.0 |
| Growth | 40×0.40 + 40×0.35 + 60×0.25 | 45.0 |
| Risk | 75×0.40 + 75×0.35 + 75×0.25 | 75.0 |
| Profitability | 40×0.50 + 40×0.50 | 40.0 |
| Capital Efficiency | 40×1.00 | 40.0 |
| Valuation | 40×1.00 | 40.0 |

## Composite (it-services weights; license risk 1.1x)

```text
w = [0.25, 0.15, 0.20, 0.25, 0.10, 0.05]; w[Risk] = 0.20 × 1.1 = 0.22
Composite = 40×0.25 + 45×0.15 + 75×0.22 + 40×0.25 + 40×0.10 + 40×0.05
          = 10.00 + 6.75 + 16.50 + 10.00 + 4.00 + 2.00 = 49.25
Composite = round_half_to_even(49.25) = 49.2   (NOT 49.3)
```

## Verdict

- Composite 49.2 → **Watch** (40 ≤ x < 50).
- No overrides (Debt/EBITDA 1.5 < it-services alert 2.5).

## Rounding rule demonstration

`round_half_to_even(49.25)` → the dropped digit is `5` at the hundredths; the retained tenths digit `2` is **even**, so it stays **49.2**. A round-half-**up** implementation would produce 49.3 — a mismatch. This pins the round-half-to-even contract. Determinism: identical inputs + calibration + methodology version → identical composite + verdict. Replay-identical.
