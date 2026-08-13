# IES-012 — Utilities Deterministic Execution Trace

**Standard:** IES-012 — Utilities Sector Engine
**Phase:** WP-3
**Version:** 1.0
**Date:** 2026-08-08
**Status:** IMPLEMENTATION ARTIFACT — one complete real-world execution trace (unlike the D15 appendix, which is the general pipeline)

---

## 1. Execution trace (UT-001 Regulated Electric, constructive)

```text
Raw Inputs
  ↓
Metric Evaluation   (rateBaseGrowth 7, allowedRoe 10, ffoDebt 18, omEfficiency 18, saidi 90, transition 30, ebitdaMargin 42, debtEbitda 3.5)
  ↓
Band Assignment     (UM-001:75, UM-006:75, UM-008:75, UM-009:75, UM-011:90, UM-003:75)
  ↓
Score Calculation   (per D15)
  ↓
Pillar Aggregation  (quality 79.5, growth 75.0, risk 75.0, profitability 75.0, capitalEff 75.0, valuation 30)
  ↓
Segment Calibration (regulated-electric weights: 0.30/0.20/0.15/0.20/0.10/0.05)
  ↓
Regulatory Calibration (constructive posture; no override trigger)
  ↓
Override Resolution (none)
  ↓
Composite Score     (74.1)
  ↓
Verdict             (Buy, 70–80)
  ↓
Evidence Package    (engineId sector.utilities, composite 74.1, verdict Buy)
  ↓
Ontology Registration (8 dimensions → CSIP)
```

## 2. Determinism

Identical inputs + calibration → identical composite (74.1), verdict (Buy), overrides (none), evidence. Replay-identical.

## 3. Status

**IMPLEMENTATION ARTIFACT — COMPLETE.**
