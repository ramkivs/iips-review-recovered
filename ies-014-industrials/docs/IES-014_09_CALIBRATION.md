# IES-014 — Industrials Sector Engine

## Document 09 — INDUSTRIALS CALIBRATION

**Document ID:** IES-014-D09
**Version:** 1.2 (DRAFT — contract-hardened)
**Status:** SPECIFICATION (Phase 2 — frozen calibration contract)

---

# Purpose

Defines calibration thresholds and weights **by subsegment and business-model archetype** — where cyclicality, aftermarket mix, and project/defense risk are expressed (per methodology principles). D15 resolves calibration weights + leverage alerts against **this document (v1.1)**.

# 1. Calibration parameter application order (normative)

Calibration is split into two parameter types, each applied at a **fixed, distinct pipeline stage**:

| Calibration parameter type | Applied at | Source |
|---|---|---|
| **Band thresholds** | BEFORE Metric → Band → Score | D06 metric band tables |
| **Pillar weights / risk multipliers** | AFTER pillar construction, BEFORE composite | tables below |

**Normative rule:** Calibration threshold parameters are resolved before Metric → Band → Score. Calibration weight parameters and archetype risk multipliers are applied after pillar construction and before composite calculation. **No calibration parameter may be applied at an inconsistent pipeline stage.**

Full order:
1. Scoring (metric → band → score → pillar) — band thresholds applied first.
2. **Subsegment calibration** sets composite pillar weights (table below).
3. **Business-model archetype calibration** applies a risk multiplier to the Risk pillar weight (table below).
4. Composite = Σ(pillar × calibrated weight), rounded half-to-even.

Scoring thresholds are never modified by weights; weights are never applied before scoring.

# 2. Subsegment calibration profiles (composite weights)

| Profile | wQ | wG | wR | wP | wC | wV | leverageAlert |
|---|---|---|---|---|---|---|---|
| Capital Goods | 0.25 | 0.25 | 0.20 | 0.15 | 0.10 | 0.05 | 3.5 |
| Aerospace & Defense | 0.30 | 0.20 | 0.15 | 0.20 | 0.10 | 0.05 | 3.0 |
| Transportation | 0.25 | 0.15 | 0.25 | 0.20 | 0.10 | 0.05 | 3.5 |
| E&C | 0.20 | 0.20 | 0.30 | 0.15 | 0.10 | 0.05 | 3.0 |
| Electrical Equipment | 0.30 | 0.20 | 0.15 | 0.20 | 0.10 | 0.05 | 3.0 |
| Conglomerates / Diversified | 0.30 | 0.15 | 0.15 | 0.20 | 0.10 | 0.10 | 3.5 |

# 3. Business-model archetype risk multiplier (applied to Risk pillar weight)

| Archetype | Recurring revenue | Risk multiplier |
|---|---|---|
| OEM | Low | 1.2x |
| Aftermarket / Service | High | 0.8x |
| Project / EPC | Low | 1.3x |
| Distributor | Moderate | 1.0x |
| Diversified | Varies | 1.0x |

**Deterministic application:** `effective_wR = wR × risk_multiplier`; composite = Σ(pillar × effective weight) where effective_wR replaces wR and the remaining weights are unchanged (not renormalized).

# 4. Cyclicality handling

- Cyclical metrics normalized across the cycle (mid-cycle, D08 IF-006).
- Subsegment/archetype risk reflected via calibration, never scoring-logic change.

# Status

**IES-014-D09 · Version 1.2 · Status SPECIFICATION (frozen calibration contract)**
