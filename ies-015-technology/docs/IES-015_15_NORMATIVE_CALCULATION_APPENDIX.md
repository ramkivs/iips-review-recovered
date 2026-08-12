# IES-015 — Technology Sector Engine

## Document 15 — NORMATIVE CALCULATION APPENDIX

**Document ID:** IES-015-D15
**Version:** 1.3 (DRAFT — final contract hardening: metric-specific band cardinality + conservativeBandTable operator)
**Status:** SPECIFICATION (becomes NORMATIVE at freeze) — the frozen golden-output contract

---

# 1. Purpose

Defines the exact transformation from raw technology metrics to final verdict so any independent implementation reproduces identical outputs. This document is the **authoritative normative calculation contract**; where pillar/band/formula definitions are referenced, they resolve to the versioned documents named in §2.

# 2. Normative dependency resolution

| Document | Version | Role |
|---|---|---|
| IES-015-D06 Metric Library | 1.1 | metric definitions + band tables + metric-specific band cardinality |
| IES-015-D07 Score Engine | 1.0 | pillar composition + composite weights |
| IES-015-D08 Formula Library | 1.0 | deterministic formulas + derived-component missing-data rule |
| IES-015-D09 Calibration | 1.3 | subsegment/archetype weights + leverage alerts + calibration precedence + calibrated band tables + effective band-table resolution + conservativeBandTable operator |
| IES-015-D10 Decision Engine | 1.0 | override families + precedence + verdict mapping |

This document does **not** duplicate those definitions; it is the executable composition of them. Any conflict between D15 and D06–D10 is resolved in favor of **D15**.

# 3. Boundary semantics (global, one rule)

All intervals are **lower-inclusive / upper-exclusive**, except the terminal band which includes its upper boundary. Metric bands and verdict mapping use the same convention. No table repeats an ad hoc boundary convention.

# 4. Rounding

- **Round-half-to-even** applied **at the composite only**. Intermediate pillar scores are NOT rounded; kept at full precision; rounded once at the final composite (1 decimal).

# 5. Missing / unavailable metrics

## 5.1 Primitive metric missing rule
- A missing primitive metric contributes **0 score**; pillar computed from available primitives using constituent weights **renormalized to the available subset**.
- If ALL primitives of a pillar are missing, the pillar contributes 0.

## 5.2 Derived-component missing-data rule
A derived component is computed from its **available constituent metrics** using renormalized weights (single available → that constituent, weight 1.0). If all constituents unavailable → derived component unavailable → parent pillar renormalizes over the available subset.

# 6. Calibration parameter application order

| Parameter type | Applied at |
|---|---|
| **Band thresholds** | BEFORE Metric → Band → Score |
| **Pillar weights / risk multipliers** | AFTER pillar construction, BEFORE composite |

**Normative rule:** threshold parameters resolved before Metric → Band → Score; weight/risk parameters applied after pillar construction and before composite. **No calibration parameter may be applied at an inconsistent pipeline stage.**

# 6a. Effective band-table resolution (normative)

This section defines the **resolution operator** for the complete band table (boundaries + score values) — the mechanism by which a selected calibration profile determines the effective metric band tables. It applies after subsegment + archetype resolution and before Metric → Band → Score.

## 6a.1 Effective band-table resolution operator

For each metric and the **selected calibration profile** (the profile chosen by subsegment + archetype resolution per D09 §2):

1. A **calibrated band table** for a metric defines, for each of its **metric-specific fixed number of bands** (`baselineBandCount[metric]`, per §6a.2), its **lowerBound, upperBound, and score**.
2. If the calibration profile defines a calibrated band table for a metric, that table **supersedes the complete baseline band table** for that metric (both boundaries AND score values).
3. If the calibration profile does **not** define a calibrated band table for a metric, the **baseline band table applies** in full.
4. The **resolved band table is immutable** for the entire calculation and is applied before Metric → Band → Score.

**Formal definition (band table, not just thresholds):**

```text
effectiveBandTable[metric] = calibratedBandTable[profile][metric] ?? baselineBandTable[metric]
```

where each band table is the tuple set `{ (lowerBound, upperBound, score) : baselineBandCount[metric] bands }`, and `??` means "if a complete calibrated band table is defined, use it; otherwise use the complete baseline band table." **Both boundaries and score values resolve together** — an independent implementation must never combine calibrated boundaries with baseline scores or vice versa.

## 6a.2 Band cardinality (metric-specific, immutable) and what calibration may modify

**Band cardinality is metric-specific and immutable.** It is fixed in D06/D15 for each metric. A calibrated band table must contain **exactly the same number of bands** as the baseline band table for that metric. Calibration may modify band boundaries and score values but **may not change band cardinality**.

**Normative band cardinality (baseline):**

| Metric | Baseline band cardinality |
|---|---|
| TM-001 | 4 |
| TM-002 | 4 |
| TM-003 | 4 |
| TM-004 | 4 |
| TM-005 | 4 |
| TM-006 | 4 |
| TM-007 | 4 |
| TM-008 | 4 |
| **TM-009** | **3** |
| TM-010 | 4 |
| TM-011 | 4 |
| TM-012 | 4 |

TM-009 (R&D Intensity) is **inherently a 3-band metric** — this is not an error and no fourth band is invented. Every other metric has 4 bands.

**Invariant:** `calibratedBandCount[metric] == baselineBandCount[metric]`. A calibrated band table whose band count differs from the baseline cardinality for that metric is a **calibration defect and is rejected**: the invalid table is **not applied**; the **baseline band table applies** in full for that metric, and a validation alert is recorded. This is consistent with `effectiveBandTable = calibratedBandTable ?? baselineBandTable` — an invalid calibrated table falls through to the baseline.

Calibration may modify, **within a complete band table**, both the **band boundaries** and the associated **score values**. It may **not** change:
- the **band cardinality** (metric-specific and immutable, per the table above),
- the **score ordering** (monotonic in the metric's preferred direction),
- the **boundary semantics** (always lower-inclusive / upper-exclusive, terminal includes upper bound).

A calibrated band table must contain exactly `baselineBandCount[metric]` bands, each with a lowerBound, upperBound, and score, preserving the global boundary convention. `effectiveBandTable` carries both boundaries and scores as a single immutable object.

## 6a.3 Hybrid / multi-subsegment conflict resolution

- **Hybrid archetype** → resolution selects the `hybridDominant` archetype's calibration profile (per D09 §2), which **unambiguously** determines the effective band table (no conflicting tables remain).
- **Multi-subsegment** → resolution selects the `subsegmentDominant` profile; if no dominant is declared, the **most conservative risk profile** is used (per D09 §2). The selected profile's band tables apply unambiguously.
- If a Hybrid/multi-subsegment selection presents **conflicting complete band tables for the same metric**, the **conservativeBandTable()** operator (§6a.3.1) resolves them deterministically into a single complete table (boundaries + scores together). This is a global tie-break rule; it is the only place where two complete tables are merged.

### 6a.3.1 conservativeBandTable() operator (normative)

Applies to a **non-empty set of conflicting complete band tables** `T = {T₁, …, Tₖ}` for the same metric, all of the **same cardinality `n = baselineBandCount[metric]`** (enforced by §6a.2). Each `Tᵢ` is the sorted band list `[(lᵢ₀, uᵢ₀, sᵢ₀), …, (lᵢ₍ₙ₋₁₎, uᵢ₍ₙ₋₁₎, sᵢ₍ₙ₋₁₎)]` with `lᵢ₀ = −∞`, `uᵢ₍ₙ₋₁₎ = +∞`, and `uᵢⱼ = lᵢ₍ⱼ₊₁₎` (lower-inclusive / upper-exclusive).

**Conservative direction** `d ∈ {higher-better, lower-better}`:
- **higher-better** if the metric's baseline score ordering is monotonically **increasing** in the metric value;
- **lower-better** if monotonically **decreasing**.

(Contextual metrics inherit the direction implied by their baseline score ordering.)

**Step 1 — resolve conservative boundaries elementwise:**
- higher-better: `Uⱼ = maxᵢ (uᵢⱼ)` for `j = 0..n−1` (hardest-to-reach threshold).
- lower-better: `Uⱼ = minᵢ (uᵢⱼ)` for `j = 0..n−1`.

The terminal band is preserved automatically because `uᵢ₍ₙ₋₁₎ = +∞` for every table.

**Step 2 — resolve conservative scores elementwise (composite-lowering):**
- `Sⱼ = minᵢ (sᵢⱼ)` for `j = 0..n−1`, in **both** directions.

**Output — the merged complete table:** `[(U₀, S₀), …, (U₍ₙ₋₁₎, S₍ₙ₋₁₎)]`, interpreted as bands `x < U₀ → S₀`, `U₀ ≤ x < U₁ → S₁`, …, `U₍ₙ₋₁₎ ≤ x → S₍ₙ₋₁₎`. The merged boundaries and scores preserve monotonic ordering (elementwise max/min of monotonic sequences is monotonic) and the global boundary semantics.

**Rationale for the score tie-break (uniform min in both directions):** metric scores are normalized to the 0–100 composite scale independent of the metric's direction, so the conservative (composite-lowering) choice for **any** metric is the **lower** score. Selecting a higher score for a lower-better metric would *raise* the composite — i.e. it would be the *less* conservative choice — so it is explicitly **not** used here.

## 6a.4 Replay version binding

The **exact resolved calibration profile version** (including any calibrated band-table overrides) is recorded in the evidence and is part of the replay identity: identical inputs + identical resolved calibration version → identical composite + verdict. This makes replay deterministic across calibration versions.

## 6a.5 Pipeline position

Effective band-table resolution occurs **after subsegment/archetype/calibration-profile selection** and **before Metric → Band → Score**:

```text
Raw Company → Subsegment Resolution → Archetype Resolution → Calibration Profile Selection
  → Effective Band-Table Resolution (this section) → Metric → Band → Score
  → Pillar Construction → Effective Weights / Risk Multiplier → Composite
  → min-rank Overrides → Verdict
```

# 7. Band → Score mapping (baseline, lower-inclusive/upper-exclusive)

## TM-001 EBITDA Margin (higher better)
| Condition | Score |
|---|---|
| `x < 10` | 40 |
| `10 ≤ x < 20` | 60 |
| `20 ≤ x < 30` | 75 |
| `30 ≤ x` | 90 |

## TM-002 Revenue Growth (higher better)
| Condition | Score |
|---|---|
| `x < 5` | 40 |
| `5 ≤ x < 15` | 60 |
| `15 ≤ x < 25` | 75 |
| `25 ≤ x` | 90 |

## TM-003 Debt/EBITDA (lower better)
| Condition | Score |
|---|---|
| `x < 1.0` | 90 |
| `1.0 ≤ x < 2.0` | 75 |
| `2.0 ≤ x < 3.0` | 55 |
| `3.0 ≤ x` | 30 |

## TM-004 Valuation EV/Revenue (lower better in growth; EV/EBITDA in cyclical/mature)
| Condition | Score |
|---|---|
| `x < 8` | 90 |
| `8 ≤ x < 12` | 75 |
| `12 ≤ x < 16` | 60 |
| `16 ≤ x` | 40 |

## TM-005 FCF Yield (higher better)
| Condition | Score |
|---|---|
| `x < 2` | 40 |
| `2 ≤ x < 4` | 60 |
| `4 ≤ x < 7` | 75 |
| `7 ≤ x` | 90 |

## TM-006 Recurring Revenue % (higher better)
| Condition | Score |
|---|---|
| `x < 30` | 40 |
| `30 ≤ x < 50` | 60 |
| `50 ≤ x < 75` | 75 |
| `75 ≤ x` | 90 |

## TM-007 NRR (higher better)
| Condition | Score |
|---|---|
| `x < 95` | 40 |
| `95 ≤ x < 105` | 60 |
| `105 ≤ x < 115` | 75 |
| `115 ≤ x` | 90 |

## TM-008 Gross Margin (higher better)
| Condition | Score |
|---|---|
| `x < 30` | 40 |
| `30 ≤ x < 50` | 60 |
| `50 ≤ x < 70` | 75 |
| `70 ≤ x` | 90 |

## TM-009 R&D Intensity (contextual)
| Condition | Score |
|---|---|
| `x < 5` | 40 |
| `5 ≤ x < 10` | 60 |
| `10 ≤ x` | 75 |

## TM-010 Customer Concentration (lower better)
| Condition | Score |
|---|---|
| `x < 10` | 90 |
| `10 ≤ x < 25` | 75 |
| `25 ≤ x < 50` | 60 |
| `50 ≤ x` | 40 |

## TM-011 Capex Intensity (contextual; lower better for software, high expected for semis/hardware)
| Condition | Score |
|---|---|
| `x < 5` | 90 |
| `5 ≤ x < 15` | 75 |
| `15 ≤ x < 30` | 60 |
| `30 ≤ x` | 40 |

## TM-012 Usage / Platform Growth (higher better)
| Condition | Score |
|---|---|
| `x < 5` | 40 |
| `5 ≤ x < 15` | 60 |
| `15 ≤ x < 30` | 75 |
| `30 ≤ x` | 90 |

# 8. Pillar construction (complete constituent weights, full precision)

| Pillar | Composition |
|---|---|
| **Quality** | `Recurring%(TM-006) × 0.40 + NRR(TM-007) × 0.30 + GrossMargin(TM-008) × 0.30` |
| **Growth** | `RevGrowth(TM-002) × 0.40 + UsageGrowth(TM-012) × 0.35 + R&DIntensity(TM-009) × 0.25` |
| **Risk** | `Leverage(TM-003) × 0.40 + CustomerConcentration(TM-010) × 0.35 + CapexIntensity(TM-011) × 0.25` |
| **Profitability** | `EBITDAMargin(TM-001) × 0.50 + GrossMargin(TM-008) × 0.50` |
| **Capital Efficiency** | `FCFYield(TM-005) × 1.00` |
| **Valuation** | `Valuation(TM-004) × 1.00` |

# 9. Composite Score (subsegment + archetype calibrated)

```text
Composite = Quality×wQ + Growth×wG + Risk×wR + Profitability×wP + CapitalEff×wC + Valuation×wV
wQ..wV from subsegment calibration (D09); effective_wR = wR × archetype_risk_multiplier (D09)
Composite = round_half_to_even(Composite, 1)
```

# 10. Override precedence (explicit, min-rank)

**Formal operator:** `finalVerdict = min_rank(baseVerdict, all applicable override caps)`. Evaluate in audit order 1→7 (governance → disruption → churn → customer-loss → capex-overrun → margin-compression → leverage); the final verdict is the **lowest rank** among the base verdict and all applicable caps.

| Priority | Override | Cap |
|---|---|---|
| 1 | Governance / regulatory | Avoid |
| 2 | Disruption / obsolescence | Watch |
| 3 | Churn collapse | Watch |
| 4 | Customer-concentration loss | Watch |
| 5 | Capex overrun | Watch |
| 6 | Margin compression | Watch |
| 7 | Leverage breach | Watch |

# 11. Verdict mapping (lower-inclusive / upper-exclusive)

| Condition | Verdict |
|---|---|
| `80 ≤ score < 100` | Strong Buy |
| `70 ≤ score < 80` | Buy |
| `60 ≤ score < 70` | Accumulate |
| `50 ≤ score < 60` | Hold |
| `40 ≤ score < 50` | Watch |
| `0 ≤ score < 40` | Avoid |

Composite 0–100; `100` maps to Strong Buy (terminal band includes upper boundary). **No overlapping boundaries.**

# 12. Determinism

Identical inputs + calibration version + methodology version → identical composite + verdict. Replay-identical. No `Math.random`/`Date.now`.

# Status

**IES-015-D15 · Version 1.2 · Status SPECIFICATION — becomes NORMATIVE at freeze.**
