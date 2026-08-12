# IES-010 — Hospitality Sector Engine

## Document 07 — HOSPITALITY SCORE ENGINE

**Document ID:** IES-010-D07
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Converts hospitality metrics into explainable dimensions (pillars) and a composite score, used by the Decision Engine.

# 1. Score hierarchy

```text
Metrics → Category Scores → Pillar Scores → Composite → (Overrides) → Verdict
```

# 2. Pillars

| Pillar | Composition | Weight (baseline) |
|---|---|---|
| Occupancy / Utilization | Occupancy score | 0.20 |
| Demand Quality / RevPAR | RevPAR + direct-book score | 0.25 |
| Growth | RevPAR growth + capacity score | 0.15 |
| Profitability | GOP margin + EBITDA margin score | 0.20 |
| Earnings Quality (Asset-light) | Fee-mix score | 0.10 |
| Capital / Risk | leverage + ROIC score | 0.10 |

# 3. Composite

```text
Composite = Σ(Pillar × Weight)
```
Composite rounded to 1 decimal.

# 4. Determinism

Every score is derived from deterministic band→score mapping + fixed pillar weights. Identical inputs → identical composite.

# Status

**IES-010-D07 · Version 1.0 · Status SPECIFICATION**
