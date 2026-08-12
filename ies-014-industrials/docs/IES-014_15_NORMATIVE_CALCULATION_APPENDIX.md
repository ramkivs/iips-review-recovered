# IES-014 — Industrials Sector Engine

## Document 15 — NORMATIVE CALCULATION APPENDIX

**Document ID:** IES-014-D15
**Version:** 1.2 (DRAFT — contract-hardened)
**Status:** SPECIFICATION (becomes NORMATIVE at freeze) — the frozen golden-output contract

---

# 1. Purpose

Defines the exact transformation from raw industrials metrics to final verdict so any independent implementation reproduces identical outputs. This document is the **authoritative normative calculation contract**; where pillar/band/formula definitions are referenced, they resolve to the versioned documents named in §2.

# 2. Normative dependency resolution

All metric scores, pillar formulas, and metric bands referenced by this document are resolved using:

| Document | Version | Role |
|---|---|---|
| IES-014-D06 Metric Library | 1.1 | metric definitions + band tables |
| IES-014-D07 Score Engine | 1.1 | pillar composition + composite weights |
| IES-014-D08 Formula Library | 1.2 | deterministic formulas + derived-component missing-data rule |
| IES-014-D09 Calibration | 1.2 | subsegment/archetype weights + leverage alerts + calibration parameter staging |
| IES-014-D10 Decision Engine | 1.1 | override families + precedence + verdict mapping |

This document does **not** duplicate those definitions; it is the executable composition of them. Any conflict between D15 and D06–D10 is resolved in favor of **D15** (D15 is the normative calculation contract).

# 3. Boundary semantics (global, one rule)

**All intervals are lower-inclusive / upper-exclusive**, except the terminal band of a table, which includes its upper boundary.

- Metric band example (EBITDA margin, higher better):
  - `x < 8` → 40
  - `8 ≤ x < 15` → 60
  - `15 ≤ x < 25` → 75
  - `25 ≤ x` → 90
- Verdict mapping (see §8) uses the same convention: lower-inclusive / upper-exclusive, final band includes its upper boundary.

**This single global rule applies to every band/verdict table in this standard.** No table repeats an ad hoc boundary convention.

# 4. Rounding

- **Round-half-to-even** is applied **at the composite only**. Intermediate pillar scores are NOT rounded before composite computation; they are kept at full precision and rounded once at the final composite (1 decimal).
- Reason: rounding intermediate pillars would lose determinism at boundaries. Only the final composite is rounded to 1 decimal.

# 5. Missing / unavailable metrics

## 5.1 Primitive metric missing rule
- If a **primitive metric** is missing/unavailable, it contributes **0 score** to its pillar, and the pillar is computed from the available primitive metrics using the pillar's constituent weights **renormalized to the available primitive subset**.
- If ALL primitive metrics of a pillar are missing, the pillar contributes 0.
- This rule is deterministic and global.

## 5.2 Derived component missing-data rule
A **derived component** (e.g. `Execution = (IM-001 + IM-011)/2`, `CostPosition = IM-011`) shall be calculated from its **available constituent metrics** using constituent weights **renormalized to the available subset**.

- If a derived component has constituent weights `a, b` and only `a` is available, the derived component = `a` (weight renormalized to 1.0).
- If **all** constituent metrics of a derived component are unavailable, the derived component is **unavailable**, and the parent pillar applies the global missing-component rule (renormalize the parent pillar's constituent weights over the available subset, including the derived component only if it is available).

**Example:** `Execution = (IM-001 + IM-011)/2`.
- IM-001 available, IM-011 missing → `Execution = IM-001` (weight renormalized to 1.0).
- Both missing → `Execution` unavailable; Quality renormalizes around Aftermarket% + CostPosition.
- This rule is deterministic and global; an independent implementation must not choose an interpretation.

# 6. Calibration parameter application order

Calibration is split into two parameter types, each applied at a **fixed, distinct pipeline stage**:

| Calibration parameter type | Applied at | Example |
|---|---|---|
| **Band thresholds** | **BEFORE Metric → Band → Score** | metric band boundaries (D06) |
| **Pillar weights / risk multipliers** | **AFTER pillar construction, BEFORE composite** | subsegment weights (D09), archetype risk multiplier (D09) |

**Normative rule:** Calibration threshold parameters are resolved before Metric → Band → Score. Calibration weight parameters and archetype risk multipliers are applied after pillar construction and before composite calculation. **No calibration parameter may be applied at an inconsistent pipeline stage.**

Full pipeline:
1. Metric → band → score (band thresholds resolved first).
2. Pillar scores computed (per D07).
3. **Subsegment calibration** applies composite pillar weights (D09).
4. **Business-model archetype calibration** applies risk multiplier (D09).
5. Composite = Σ(pillar × calibrated weight), rounded half-to-even.
6. Overrides applied (per D10 precedence).
7. Verdict mapping.

Scoring thresholds (step 1) are never modified by weights; weights (steps 3–4) are never applied before scoring.

# 7. Band → Score mapping (baseline, lower-inclusive/upper-exclusive)

## IM-001 EBITDA Margin (higher better)
| Condition | Score |
|---|---|
| `x < 8` | 40 |
| `8 ≤ x < 15` | 60 |
| `15 ≤ x < 25` | 75 |
| `25 ≤ x` | 90 |

## IM-002 Revenue Growth (higher better)
| Condition | Score |
|---|---|
| `x < 2` | 40 |
| `2 ≤ x < 5` | 60 |
| `5 ≤ x < 10` | 75 |
| `10 ≤ x` | 90 |

## IM-006 Backlog (higher better)
| Condition | Score |
|---|---|
| `x < 1` (×revenue) | 40 |
| `1 ≤ x < 2` | 60 |
| `2 ≤ x < 3` | 75 |
| `3 ≤ x` | 90 |

## IM-007 Book-to-Bill (higher better)
| Condition | Score |
|---|---|
| `x < 0.9` | 40 |
| `0.9 ≤ x < 1.0` | 60 |
| `1.0 ≤ x < 1.1` | 75 |
| `1.1 ≤ x` | 90 |

## IM-008 Aftermarket % (higher better)
| Condition | Score |
|---|---|
| `x < 15` | 40 |
| `15 ≤ x < 30` | 60 |
| `30 ≤ x < 50` | 75 |
| `50 ≤ x` | 90 |

## IM-010 Order Growth (higher better)
| Condition | Score |
|---|---|
| `x < 0` | 40 |
| `0 ≤ x < 5` | 60 |
| `5 ≤ x < 10` | 75 |
| `10 ≤ x` | 90 |

## IM-011 Operating Margin (higher better)
| Condition | Score |
|---|---|
| `x < 10` | 40 |
| `10 ≤ x < 18` | 60 |
| `18 ≤ x < 28` | 75 |
| `28 ≤ x` | 90 |

## IM-009 FCF Yield (higher better)
| Condition | Score |
|---|---|
| `x < 3` | 40 |
| `3 ≤ x < 6` | 60 |
| `6 ≤ x < 10` | 75 |
| `10 ≤ x` | 90 |

## IM-005 Return on Capital (higher better)
| Condition | Score |
|---|---|
| `x < 8` | 40 |
| `8 ≤ x < 15` | 60 |
| `15 ≤ x < 25` | 75 |
| `25 ≤ x` | 90 |

## IM-004 Valuation EV/EBITDA (mid-cycle) (lower better)
| Condition | Score |
|---|---|
| `x < 8` | 90 |
| `8 ≤ x < 12` | 75 |
| `12 ≤ x < 16` | 60 |
| `16 ≤ x` | 40 |

## IM-003 Debt/EBITDA (lower better; subsegment alert)
| Condition | Score |
|---|---|
| `x < 1.5` | 90 |
| `1.5 ≤ x < 2.5` | 75 |
| `2.5 ≤ x < 3.5` | 55 |
| `3.5 ≤ x` | 30 |

## IM-012 Project Risk Exposure (lower better)
| Condition | Score |
|---|---|
| `x < 15` | 90 |
| `15 ≤ x < 30` | 75 |
| `30 ≤ x < 50` | 60 |
| `50 ≤ x` | 40 |

# 8. Pillar construction (complete constituent weights)

Pillars are computed at **full precision** (no intermediate rounding).

| Pillar | Composition (constituent weights) |
|---|---|
| **Quality** | `Aftermarket% × 0.40 + CostPosition × 0.35 + Execution × 0.25`<br>where `CostPosition = IM-011 score`, `Execution = (IM-001 score + IM-011 score)/2` |
| **Growth** | `Backlog(IM-006) × 0.40 + OrderGrowth(IM-010) × 0.35 + RevenueGrowth(IM-002) × 0.25` |
| **Risk** | `Leverage(IM-003) × 0.70 + ProjectRisk(IM-012) × 0.30` |
| **Profitability** | `EBITDAmargin(IM-001) × 0.40 + OperatingMargin(IM-011) × 0.40 + ROCE(IM-005) × 0.20` |
| **Capital Efficiency** | `FCFYield(IM-009) × 0.50 + ROCE(IM-005) × 0.50` |
| **Valuation** | `Valuation(IM-004) × 1.00` |

# 9. Composite Score (subsegment-calibrated)

```text
Composite = Quality×wQ + Growth×wG + Risk×wR + Profitability×wP + CapitalEff×wC + Valuation×wV
where weights (wQ..wV) come from the subsegment calibration profile (D09), e.g. Capital Goods:
  wQ=0.25, wG=0.25, wR=0.20, wP=0.15, wC=0.10, wV=0.05
Composite = round_half_to_even(Composite, 1)
```

# 10. Override precedence (explicit, ordered)

When multiple overrides trigger simultaneously, apply them in **exact precedence order** below; the most restrictive cap (lowest verdict rank) that is reached wins.

| Priority | Override | Cap |
|---|---|---|
| 1 | Governance / regulatory | Avoid |
| 2 | Defense program failure | Watch |
| 3 | EPC cost overrun | Watch |
| 4 | Order cancellation / demand shock | Watch |
| 5 | Margin compression | Watch |
| 6 | Leverage breach | Watch |

**Formal operator:** `finalVerdict = min_rank(baseVerdict, all applicable override caps)`. That is, the final verdict is the **lowest verdict rank** (most restrictive) among the base verdict and the caps of **all** simultaneously-triggered overrides. The 1→6 priority ordering above is retained solely as the **audit/evaluation order** (deterministic, documented) — it does NOT select which cap survives; the min-rank over all applicable caps does. This makes "most restrictive cap wins" mathematically identical to the implementation.

# 11. Verdict mapping (lower-inclusive / upper-exclusive)

| Condition | Verdict |
|---|---|
| `80 ≤ score < 100` | Strong Buy |
| `70 ≤ score < 80` | Buy |
| `60 ≤ score < 70` | Accumulate |
| `50 ≤ score < 60` | Hold |
| `40 ≤ score < 50` | Watch |
| `0 ≤ score < 40` | Avoid |

Note: since composite is 0–100, `100` maps to Strong Buy (terminal band includes its upper boundary). There are **no overlapping boundaries**.

# 12. Determinism

Identical inputs + calibration version + methodology version → identical composite + verdict. Replay-identical. No `Math.random`/`Date.now`.

# Status

**IES-014-D15 · Version 1.2 · Status SPECIFICATION (contract-hardened) — becomes NORMATIVE at freeze.**
