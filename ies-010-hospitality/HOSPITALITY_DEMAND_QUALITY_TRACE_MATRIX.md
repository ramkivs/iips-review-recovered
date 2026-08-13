# IES-010 — Demand Quality Trace Matrix

**Standard:** IES-010 — Hospitality Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-08
**Status:** REFERENCE ASSET

> **Purpose.** Deterministic explanation of how demand quality flows into the verdict — one of hospitality's most important differentiating metrics.

---

## 1. Trace

```text
Demand Quality
      ↓
Band
      ↓
Score
      ↓
Demand Pillar
      ↓
Composite
      ↓
Verdict
```

## 2. Demand-quality scoring (Revenue Quality Hierarchy)

```text
Loyalty/Corporate=5, Direct=4, Travel Agency=3, OTA=2, One-off Promo=1
```

| Mix band (weighted) | Band | Score |
|---|---|---|
| ≥ 80% direct/corporate/loyalty | Strong | 90 |
| 60–80% | Good | 75 |
| 40–60% | Adequate | 60 |
| < 40% | Weak | 40 |

## 3. Worked trace (illustrative)

| Stage | Value |
|---|---|
| Demand quality mix | 70% (direct/corporate/loyalty) |
| Band | Good |
| Score | 75 |
| Demand pillar (RevPAR 0.7 + demand 0.3) | e.g. 78 |
| Composite contribution | weight × pillar |
| Verdict | derived from composite |

## 4. Status

**REFERENCE ASSET — COMPLETE.** Deterministic demand-quality explanation path.
