# IES-012 — Utilities Sector Engine

## Document 07 — UTILITIES SCORE ENGINE

**Document ID:** IES-012-D07
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Converts utilities metrics into explainable dimensions (pillars) and a composite score, used by the Decision Engine.

# 1. Score hierarchy

```text
Metrics → Category Scores → Pillar Scores → Composite → (Overrides) → Verdict
```

# 2. Pillars

| Pillar | Composition | Weight (baseline) |
|---|---|---|
| Quality / Regulatory | regulatory quality + O&M efficiency + reliability score | 0.30 |
| Growth | rate-base growth + demand + transition score | 0.20 |
| Risk | leverage + regulatory risk score | 0.15 |
| Profitability | EBITDA margin + ROE score | 0.20 |
| Capital Efficiency | FFO/Debt + ROE score | 0.10 |
| Valuation | P/E / EV/EBITDA (defensive) score | 0.05 |

# 3. Composite

```text
Composite = Σ(Pillar × Weight)
```
Composite rounded to 1 decimal (round-half-to-even).

# 4. Determinism

Every score is derived from deterministic band→score mapping + fixed pillar weights. Identical inputs → identical composite.

# Status

**IES-012-D07 · Version 1.0 · Status SPECIFICATION**
