# IES-013 — Consumer Frozen Methodology Dependency Map

**Standard:** IES-013 — Consumer Sector Engine
**Phase:** 5 — Freeze
**Version:** 1.0
**Date:** 2026-08-08
**Status:** GOVERNANCE — dependency graph of frozen artifacts (valuable when v1.1/v2.0 appear)

---

## 1. Frozen dependency map

```text
Metric Library (D06) ─┐
Formula Library (D08) ─┼─→ D15 Normative Calculation
Override Rules (D10) ──┘        │
                        ┌───────┘
Calibration Profile ────┼─→ Composite → Verdict
Golden Dataset ─────────┤
                        ▼
                Expected Outputs
                        │
                        ▼
                Replay Dataset
Validation Fixtures ──── Calibration + D15
Architecture Review ──── all reference assets
```

## 2. Dependency table

| Frozen artifact | Depends on |
|---|---|
| D15 Normative Calculation | Metric Library (D06), Formula Library (D08), Override Rules (D10) |
| Calibration Profile | D09 (segment/business-model weights) |
| Golden Dataset | D15 (provider inputs) |
| Expected Outputs | Golden Dataset, Calibration, D15 |
| Replay Dataset | Expected Outputs |
| Validation Fixtures | Calibration, D15 |
| Architecture Review | all reference assets |

## 3. Status

**GOVERNANCE — COMPLETE.**
