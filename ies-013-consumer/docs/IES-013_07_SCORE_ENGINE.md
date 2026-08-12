# IES-013 — Consumer Sector Engine

## Document 07 — CONSUMER SCORE ENGINE

**Document ID:** IES-013-D07
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Converts consumer metrics into explainable dimensions (pillars) and a composite score, used by the Decision Engine.

# 1. Score hierarchy

```text
Metrics → Category Scores → Pillar Scores → Composite → (Overrides) → Verdict
```

# 2. Pillars

| Pillar | Composition | Weight (baseline) |
|---|---|---|
| Quality / Brand | pricing power + brand/loyalty + margin resilience score | 0.30 |
| Growth | revenue growth + innovation score | 0.20 |
| Risk | input-cost + leverage + private-label score | 0.15 |
| Profitability | EBITDA margin + ROIC score | 0.20 |
| Capital Efficiency | FCF yield + ROIC score | 0.10 |
| Valuation | P/E / EV/EBITDA score | 0.05 |

# 3. Composite

```text
Composite = Σ(Pillar × Weight)
```
Composite rounded to 1 decimal (round-half-to-even).

# 4. Determinism

Every score is derived from deterministic band→score mapping + fixed pillar weights. Identical inputs → identical composite.

# Status

**IES-013-D07 · Version 1.0 · Status SPECIFICATION**
