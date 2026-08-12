# IES-010 — Hospitality Execution Pipeline

**Standard:** IES-010 — Hospitality Sector Engine
**Purpose:** The implementation counterpart to D15 — documents the complete deterministic execution flow.
**Date:** 2026-08-08

---

## 1. Execution flow

```text
Input Metrics
      ↓
Metric Evaluation
      ↓
Band Assignment
      ↓
Score Calculation
      ↓
Pillar Aggregation
      ↓
Business-Model Calibration
      ↓
Override Evaluation
      ↓
Verdict Resolution
      ↓
Evidence Generation
      ↓
Ontology Registration
      ↓
Published Engine Output
```

## 2. Stage detail

| Stage | Inputs | Outputs | Deterministic guarantee | Replay boundary | Evidence produced | Acceptance test(s) |
|---|---|---|---|---|---|---|
| **Metric Evaluation** | raw inputs (occupancy, adr, revpar, gop, growth, fee, dq, debt, roic) | metric values | pure evaluation | identical metrics | — | metric test |
| **Band Assignment** | metric values | band labels | deterministic band tables | identical bands | — | band test |
| **Score Calculation** | bands | 0–100 scores | deterministic band→score | identical scores | — | D15 test |
| **Pillar Aggregation** | scores | 6 pillars | deterministic weighted aggregation | identical pillars | — | pillar test |
| **Business-Model Calibration** | pillars + business model | weighted composite | calibration weights per model | identical composite | calibration version | calibration test |
| **Override Evaluation** | composite + flags | override applied | deterministic precedence | identical overrides | override rationale | override test |
| **Verdict Resolution** | composite + overrides | final verdict | deterministic verdict mapping | identical verdict | verdict | verdict test |
| **Evidence Generation** | verdict + pillars + overrides | evidence package | deterministic evidence | identical evidence | evidence record | evidence test |
| **Ontology Registration** | published outputs | 8-dimension metadata | deterministic mapping | — | — | ontology test |
| **Published Engine Output** | all prior | `ExecutionResult` | deterministic | byte-identical | snapshot + evidenceRef | golden regression (9/9) |

## 3. Determinism & replay

- Every stage is a pure deterministic function of its inputs.
- No `Math.random`/`Date.now` in business logic.
- Replay boundary: identical inputs + calibration → identical composite, verdict, overrides, evidence, and published output.

## 4. Status

**IMPLEMENTATION PLANNING ARTIFACT — COMPLETE.** Blueprint for the Hospitality Engine (WP-3).
