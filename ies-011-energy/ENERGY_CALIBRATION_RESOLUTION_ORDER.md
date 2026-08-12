# IES-011 — Energy Calibration Resolution Order

**Standard:** IES-011 — Energy Sector Engine
**Purpose:** Documents the deterministic order of segment + commodity exposure calibration, removing ambiguity for future contributors.
**Date:** 2026-08-08

---

## 1. Resolution order

```text
Raw Metrics
      ↓
Metric Bands
      ↓
Base Scores
      ↓
Segment Calibration
      ↓
Commodity Exposure Calibration
      ↓
Composite
      ↓
Override Evaluation
      ↓
Evidence
      ↓
Ontology Registration
```

## 2. Order rationale

- **Segment calibration** first — selects the pillar weight profile (C-01..C-06).
- **Commodity exposure calibration** second — applies the risk-weight multiplier (price-taker/hedger/contracted/regulated/diversified).
- **Composite** — computed from calibrated pillars.
- **Overrides** — applied after composite.
- **Evidence + ontology** — final.

## 3. Determinism

The order is fixed and total; identical inputs → identical result. Segment + commodity exposure resolve to one calibration path.

## 4. Status

**IMPLEMENTATION ARTIFACT — COMPLETE.**
