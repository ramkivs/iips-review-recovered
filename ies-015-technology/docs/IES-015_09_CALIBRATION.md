# IES-015 — Technology Sector Engine

## Document 09 — TECHNOLOGY CALIBRATION

**Document ID:** IES-015-D09
**Version:** 1.3 (DRAFT — metric-specific band cardinality + conservativeBandTable operator)
**Status:** SPECIFICATION (Phase 2 — frozen calibration contract)

---

# Purpose

Defines calibration thresholds and weights **by subsegment + business-model archetype** — where recurring economics, cyclicality, capital intensity, and archetype differences are expressed (per methodology principles).

# 1. Calibration selection precedence (normative)

```text
Subsegment
     +
Business-model archetype
     ↓
Calibration profile (one per subsegment×archetype)
     ↓
Frozen metric thresholds / weights
     ↓
Common score engine
```

A company is assigned to exactly one calibration profile from its `subsegment` + `archetype`. **Calibration selects weights/thresholds only; the score engine is common.**

# 2. Hybrid / multi-subsegment resolution (Phase-2 contract item)

- **Hybrid archetype:** if a company's archetype is `hybrid`, the calibration profile is resolved by **dominant revenue model** (the archetype contributing the largest revenue share). This is declared per-company (a `hybridDominant` field), deterministically.
- **Multi-subsegment:** if a company spans multiple subsegments, the **dominant subsegment** (largest revenue share) determines the profile. Declared per-company (`subsegmentDominant`), deterministically.
- If no dominant is declared, the company is assigned to the **most conservative risk profile** among its declared subsegments/archetypes (deterministic default). This rule is global and freezes the Hybrid/multi-subsegment ambiguity.

# 3. Subsegment × archetype calibration — composite weights (wQ,wG,wR,wP,wC,wV) + leverage alert

| Subsegment | wQ | wG | wR | wP | wC | wV | leverageAlert |
|---|---|---|---|---|---|---|---|
| Software / SaaS | 0.30 | 0.25 | 0.15 | 0.15 | 0.10 | 0.05 | 3.0 |
| IT Services | 0.25 | 0.15 | 0.20 | 0.25 | 0.10 | 0.05 | 2.5 |
| Semiconductors | 0.20 | 0.20 | 0.30 | 0.15 | 0.10 | 0.05 | 2.5 |
| Electronics / Hardware | 0.20 | 0.20 | 0.25 | 0.20 | 0.10 | 0.05 | 2.5 |
| Digital Platforms | 0.30 | 0.30 | 0.15 | 0.10 | 0.10 | 0.05 | 3.5 |
| Internet / Consumer Tech | 0.25 | 0.30 | 0.20 | 0.10 | 0.10 | 0.05 | 3.0 |
| Cybersecurity | 0.30 | 0.25 | 0.20 | 0.10 | 0.10 | 0.05 | 3.0 |
| Data / Infrastructure | 0.30 | 0.20 | 0.20 | 0.15 | 0.10 | 0.05 | 3.5 |
| Tech-enabled Services | 0.25 | 0.15 | 0.20 | 0.25 | 0.10 | 0.05 | 3.0 |

# 4. Business-model archetype risk multiplier (applied to Risk pillar weight)

| Archetype | Recurring | Risk multiplier |
|---|---|---|
| License | Moderate | 1.1x |
| Subscription | High | 0.8x |
| Usage-based | High | 0.9x |
| Transaction / Platform | High | 0.9x |
| Hardware | Low | 1.2x |
| Foundry / Manufacturing | Low | 1.3x |
| Services / Project | Low | 1.1x |
| Managed Services | High | 0.9x |
| Hybrid | Varies | 1.0x |

**Deterministic application:** `effective_wR = wR × archetype_risk_multiplier`; composite = Σ(pillar × effective weight) where effective_wR replaces wR and the remaining weights are unchanged (not renormalized).

# 5. Calibration parameter application order

| Parameter type | Applied at |
|---|---|
| **Band thresholds** | BEFORE Metric → Band → Score |
| **Pillar weights / risk multipliers** | AFTER pillar construction, BEFORE composite |

No calibration parameter may be applied at an inconsistent pipeline stage.

# 6. Calibrated band tables (optional per profile)

A calibration profile **may** define calibrated band tables for specific metrics (where the subsegment's economics differ from the baseline). The resolution operator is defined in D15 §6a (Effective Band-Table Resolution). A calibrated band table carries **both boundaries and score values**; the selected table supersedes the complete baseline table for that metric. Examples (illustrative — actual values frozen with the calibration profile):

**TM-008 Gross Margin — Semiconductors (calibrated boundaries AND scores):**
| Condition | Score |
|---|---|
| `x < 20` | 35 |
| `20 ≤ x < 35` | 55 |
| `35 ≤ x < 50` | 75 |
| `50 ≤ x` | 90 |

**TM-011 Capex Intensity — Semiconductors (calibrated boundaries AND scores):**
| Condition | Score |
|---|---|
| `x < 15` | 90 |
| `15 ≤ x < 30` | 75 |
| `30 ≤ x < 45` | 60 |
| `45 ≤ x` | 40 |

Rules:
- **Band cardinality is metric-specific and immutable** (D15 §6a.2): a calibrated band table must contain exactly `baselineBandCount[metric]` bands — **4 for every metric except TM-009, which is inherently 3**. A calibrated table whose band count differs from the baseline cardinality is a **defect and is rejected** (baseline applies; validation alert recorded). Each band is `(lowerBound, upperBound, score)`, preserving **lower-inclusive / upper-exclusive** (terminal includes upper bound) and monotonic ordering.
- `effectiveBandTable[metric] = calibratedBandTable[profile][metric] ?? baselineBandTable[metric]` — boundaries AND scores resolve together (D15 §6a.1).
- If a profile defines a calibrated table for a metric, it **supersedes** the complete D15 baseline table for that metric.
- If not defined, the **D15 baseline table** applies in full.
- Conflicting complete band tables across a Hybrid/multi-subsegment selection resolve deterministically via the **conservativeBandTable()** operator (complete boundaries+scores, composite-lowering), per D15 §6a.3.1.

# 7. Replay version binding

The resolved calibration profile version (including calibrated threshold overrides) is part of the replay identity (D15 §6a.4). Any threshold/weight change → new calibration version + new replay dataset.

# Status

**IES-015-D09 · Version 1.2 · Status SPECIFICATION (frozen calibration contract)**
