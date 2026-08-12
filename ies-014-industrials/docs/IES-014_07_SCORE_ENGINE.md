# IES-014 — Industrials Sector Engine

## Document 07 — INDUSTRIALS SCORE ENGINE

**Document ID:** IES-014-D07
**Version:** 1.1 (DRAFT — contract-hardened)
**Status:** SPECIFICATION (Phase 2 — frozen pillar/weights contract)

---

# Purpose

Converts industrials metrics into explainable dimensions (pillars) and a composite score, used by the Decision Engine. D15 resolves pillar construction against **this document (v1.1)**.

# 1. Score hierarchy

```text
Metrics → Category Scores → Pillar Scores → Composite → (Overrides) → Verdict
```

# 2. Pillar construction (complete constituent weights)

Pillars are computed at **full precision** (no intermediate rounding); the composite is rounded once (round-half-to-even, 1 decimal).

| Pillar | Composition (constituent weights) |
|---|---|
| **Quality** | `Aftermarket%(IM-008) × 0.40 + CostPosition × 0.35 + Execution × 0.25`<br>where `CostPosition = IM-011 score`, `Execution = (IM-001 score + IM-011 score)/2` |
| **Growth** | `Backlog(IM-006) × 0.40 + OrderGrowth(IM-010) × 0.35 + RevenueGrowth(IM-002) × 0.25` |
| **Risk** | `Leverage(IM-003) × 0.70 + ProjectRisk(IM-012) × 0.30` |
| **Profitability** | `EBITDAmargin(IM-001) × 0.40 + OperatingMargin(IM-011) × 0.40 + ROCE(IM-005) × 0.20` |
| **Capital Efficiency** | `FCFYield(IM-009) × 0.50 + ROCE(IM-005) × 0.50` |
| **Valuation** | `Valuation(IM-004) × 1.00` |

# 3. Composite (subsegment-calibrated weights)

```text
Composite = Quality×wQ + Growth×wG + Risk×wR + Profitability×wP + CapitalEff×wC + Valuation×wV
```
where weights come from the subsegment calibration profile (D09). Capital Goods baseline:
`wQ=0.25, wG=0.25, wR=0.20, wP=0.15, wC=0.10, wV=0.05`.

Composite = round_half_to_even(Composite, 1).

# 4. Determinism

Every score is derived from deterministic band→score mapping + fixed pillar constituent weights + subsegment composite weights. Identical inputs → identical composite.

# Status

**IES-014-D07 · Version 1.1 · Status SPECIFICATION (frozen pillar/weights contract)**
