# IES-011 — Energy Calculation Trace Matrix

**Standard:** IES-011 — Energy Sector Engine
**Purpose:** One-page traceability map for every deterministic calculation stage — implementation counterpart to D15.
**Date:** 2026-08-08

---

## 1. Calculation trace

| Stage | Input | Output | Frozen source | Acceptance test |
|---|---|---|---|---|
| Metric Evaluation | Raw metrics | EM-001…EM-012 | D06 | WP3-ACC1 |
| Band Assignment | Metric | Band | D15 | WP3-ACC2 |
| Score Calculation | Band | Score | D15 | WP3-ACC3 |
| Pillar Aggregation | Scores | Pillars | D07 | WP3-ACC4 |
| Calibration | Pillars | Calibrated pillars | D09 | WP3-ACC5 |
| Composite | Pillars | Composite | D15 | WP3-ACC6 |
| Overrides | Composite | Final verdict | D10 | WP3-ACC7 |
| Evidence | Verdict | Evidence package | D11 | WP3-ACC8 |
| Ontology Mapping | Final result | Published dimensions | D13 | WP3-ACC9 |

## 2. Status

**IMPLEMENTATION ARTIFACT — COMPLETE.**
