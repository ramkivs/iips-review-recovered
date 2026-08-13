# IES-012 — Worked Example: Regulated Electric (UT-001)

**Standard:** IES-012 — Utilities Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-08

---

## Inputs

- Segment: regulated-electric, regulatory posture: constructive
- Rate base growth 7%, allowed ROE 10%, FFO/Debt 18%, O&M efficiency 18%, demand growth 2%, SAIDI 90, transition capex 30%, EBITDA margin 42%, revenue growth 4%, Debt/EBITDA 3.5x, P/E 18, ROE 11%.

## Band → score (per D15 + calibration)

| Metric | Value | Band | Score |
|---|---|---|---|
| EBITDA margin | 42% | 30–45 | 75 |
| Rate base growth | 7% | 5–8 | 75 |
| FFO/Debt | 18% | 15–20 | 75 |
| O&M efficiency | 18% | 15–25 | 75 |
| SAIDI | 90 | <100 | 90 |
| Debt/EBITDA | 3.5x | 3.0–4.5 | 75 |

## Pillars (regulated-electric weights)

| Pillar | Score | Weight | Contribution |
|---|---|---|---|
| Quality (O&M 0.4 + SAIDI 0.3 + FFO 0.3) | 79.5 | 0.30 | 23.85 |
| Growth | 75.0 | 0.20 | 15.0 |
| Risk | 75.0 | 0.15 | 11.25 |
| Profitability | 75.0 | 0.20 | 15.0 |
| Capital Efficiency | 75.0 | 0.10 | 7.5 |
| Valuation | 30 | 0.05 | 1.5 |
| **Composite** | | | **74.1** |

## Verdict

- Composite 74.1 → **Buy** (70–80 range).
- No overrides.
- Calibration: regulated-electric (leverage alert 6.0x; Debt/EBITDA 3.5x — no breach).

## Determinism

Identical inputs + calibration → composite 74.1, verdict Buy. Replay-identical.
