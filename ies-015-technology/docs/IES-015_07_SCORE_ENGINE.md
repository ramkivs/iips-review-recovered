# IES-015 — Technology Sector Engine

## Document 07 — TECHNOLOGY SCORE ENGINE

**Document ID:** IES-015-D07
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION (Phase 2 — frozen pillar/weights contract)

---

# Purpose

Converts technology metrics into explainable dimensions (pillars) and a composite score, used by the Decision Engine. D15 resolves pillar construction against **this document (v1.0)**.

# 1. Score hierarchy

```text
Metrics → Category Scores → Pillar Scores → Composite → (Overrides) → Verdict
```

# 2. Pillar construction (complete constituent weights, full precision)

| Pillar | Composition (constituent weights) |
|---|---|
| **Quality** | `Recurring%(TM-006) × 0.40 + NRR(TM-007) × 0.30 + GrossMargin(TM-008) × 0.30` |
| **Growth** | `RevGrowth(TM-002) × 0.40 + UsageGrowth(TM-012) × 0.35 + R&DIntensity(TM-009) × 0.25` |
| **Risk** | `Leverage(TM-003) × 0.40 + CustomerConcentration(TM-010) × 0.35 + CapexIntensity(TM-011) × 0.25` |
| **Profitability** | `EBITDAMargin(TM-001) × 0.50 + GrossMargin(TM-008) × 0.50` |
| **Capital Efficiency** | `FCFYield(TM-005) × 1.00` |
| **Valuation** | `Valuation(TM-004) × 1.00` |

# 3. Composite (subsegment-calibrated weights)

```text
Composite = Quality×wQ + Growth×wG + Risk×wR + Profitability×wP + CapitalEff×wC + Valuation×wV
```
where weights come from the subsegment + archetype calibration profile (D09). Composite = round_half_to_even(Composite, 1).

# 4. Determinism

Every score is derived from deterministic band→score mapping + fixed pillar constituent weights + subsegment/archetype composite weights. Identical inputs → identical composite.

# Status

**IES-015-D07 · Version 1.0 · Status SPECIFICATION (frozen pillar/weights contract)**
