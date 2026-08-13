# IES-013 — Consumer Decision Pipeline Trace

**Standard:** IES-013 — Consumer Sector Engine
**Phase:** WP-3
**Version:** 1.0
**Date:** 2026-08-08
**Status:** IMPLEMENTATION REFERENCE for WP-3

---

## 1. Execution path

```text
Raw Metrics
  ↓
Metric Evaluation
  ↓
Band Assignment
  ↓
Metric Scores
  ↓
Pillar Aggregation
  ↓
Business Model Calibration
  ↓
Demand Durability Calibration
  ↓
Composite Score
  ↓
Override Evaluation
  ↓
Final Verdict
  ↓
Evidence Generation
  ↓
Ontology Registration
```

## 2. Per-stage detail

| Stage | Input | Output | Governing doc | Deterministic guarantee | Replay boundary | Acceptance test |
|---|---|---|---|---|---|---|
| Metric Evaluation | raw inputs | CM-001..CM-012 | D06 | pure | identical metrics | WP3-ACC1 |
| Band Assignment | metrics | bands | D15 | band tables | identical bands | WP3-ACC2 |
| Metric Scores | bands | 0-100 | D15 | band→score | identical scores | WP3-ACC3 |
| Pillar Aggregation | scores | 6 pillars | D07 | weighted | identical pillars | WP3-ACC4 |
| Business Model Calibration | pillars | weighted | D09 | per-model weights | identical composite | WP3-ACC5 |
| Demand Durability Calibration | risk | risk weight | D09 | per-segment | identical | WP3-ACC5 |
| Composite Score | pillars | composite | D15 | round-half-to-even | byte-identical | WP3-ACC6 |
| Override Evaluation | composite | override | D10 | precedence | identical | WP3-ACC7 |
| Final Verdict | composite+override | verdict | D10 | mapping | identical | WP3-ACC7 |
| Evidence Generation | verdict | evidence | D11 | deterministic | byte-identical | WP3-ACC8 |
| Ontology Registration | result | 8 dims | D13 | deterministic | — | WP3-ACC9 |

## 3. Status

**IMPLEMENTATION REFERENCE — COMPLETE.**
