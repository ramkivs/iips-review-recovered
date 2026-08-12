# IES-011 — Energy Sector Engine

## Document 07 — ENERGY SCORE ENGINE

**Document ID:** IES-011-D07
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Converts energy metrics into explainable dimensions (pillars) and a composite score, used by the Decision Engine.

# 1. Score hierarchy

```text
Metrics → Category Scores → Pillar Scores → Composite → (Overrides) → Verdict
```

# 2. Pillars

| Pillar | Composition | Weight (baseline) |
|---|---|---|
| Quality / Cost Position | lifting cost + reserve/asset quality score | 0.25 |
| Growth | production growth + transition score | 0.20 |
| Risk | commodity cyclicality + leverage score | 0.15 |
| Profitability | EBITDA margin + ROCE score | 0.20 |
| Capital Efficiency | FCF yield + ROCE score | 0.10 |
| Valuation | EV/EBITDA (cyclical-normalized) score | 0.10 |

# 3. Composite

```text
Composite = Σ(Pillar × Weight)
```
Composite rounded to 1 decimal (round-half-to-even).

# 4. Determinism

Every score is derived from deterministic band→score mapping + fixed pillar weights. Identical inputs → identical composite.

# Status

**IES-011-D07 · Version 1.0 · Status SPECIFICATION**
