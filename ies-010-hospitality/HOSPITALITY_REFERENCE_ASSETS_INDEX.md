# IES-010 — Hospitality Reference Assets Index

**Standard:** IES-010 — Hospitality Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-08
**Status:** REFERENCE ASSETS (deterministic + versioned — no implementation)

> **Governance:** Hospitality reference assets are governed by the same standards-first discipline; all are deterministic + versioned.

---

## 1. Calibration & datasets

| Asset | Version | Path |
|---|---|---|
| Hospitality Calibration Profile | 1.0.0 | `calibration/hospitality-calibration-1.0.0.json` |
| Hospitality Golden Dataset | 1.0.0 | `datasets/hospitality-golden-reference-1.0.0.json` |
| Hospitality Expected Outputs | 1.0.0 | `expected-outputs/hospitality-expected-outputs-1.0.0.json` |
| Hospitality Replay Dataset | 1.0.0 | `replay-datasets/hospitality-replay-dataset-1.0.0.json` |
| Hospitality Validation Fixtures | 1.0.0 | `fixtures/hospitality-validation-fixtures-1.0.0.json` |

## 2. Matrices

| Asset | Path |
|---|---|
| Hospitality Scenario Coverage Matrix | `HOSPITALITY_SCENARIO_COVERAGE_MATRIX.md` |
| Business Model Calibration Matrix | `HOSPITALITY_BUSINESS_MODEL_CALIBRATION_MATRIX.md` |
| RevPAR Decomposition Matrix | `HOSPITALITY_REVPAR_DECOMPOSITION_MATRIX.md` |
| Demand Quality Trace Matrix | `HOSPITALITY_DEMAND_QUALITY_TRACE_MATRIX.md` |

## 3. Worked examples & diagrams

| Asset | Path |
|---|---|
| Worked Example (Asset-light Mixed) | `examples/worked-example-asset-light-mixed.md` |
| Dataflow Diagram | `diagrams/hospitality-dataflow.mmd` |

## 4. Coverage guarantees

- **Every business model** (Owned, Leased, Managed, Franchised, Asset-light) represented.
- **Every override path** (demand shock, occupancy collapse, leverage breach, brand deterioration, governance) exercised.
- **Every deterministic calculation path** frozen (D15 + calibration).
- **Replay datasets** reproduce byte-identically.
- **CSIP compatibility** unchanged (ontology registration, no CSIP change).

## 6. Architecture Review (Phase 4)

| Asset | Path |
|---|---|
| Business Model Consistency Matrix | `HOSPITALITY_BUSINESS_MODEL_CONSISTENCY_MATRIX.md` |
| Override Precedence Matrix | `HOSPITALITY_OVERRIDE_PRECEDENCE_MATRIX.md` |
| RevPAR Decision Trace Examples | `HOSPITALITY_REVPAR_DECISION_TRACE_EXAMPLES.md` |
| Ontology Registration Review | `HOSPITALITY_ONTOLOGY_REGISTRATION_REVIEW.md` |
| Architecture Review (verdict) | `IES-010_ARCHITECTURE_REVIEW.md` |

## 7. Freeze (Phase 5)

| Asset | Path |
|---|---|
| Freeze Manifest | `IES-010_FREEZE_MANIFEST.json` |
| Freeze Checklist | `IES-010_FREEZE_CHECKLIST.md` |
| Freeze Regression Baseline | `IES-010_FREEZE_REGRESSION_BASELINE.md` |
| Compatibility Statement | `IES-010_COMPATIBILITY.md` |
| Freeze Report | `IES-010_FREEZE_REPORT.md` |
| Implementation Readiness Certificate | `IES-010_IMPLEMENTATION_READINESS_CERTIFICATE.md` |
| Implementation Readiness Summary | `IES-010_IMPLEMENTATION_READINESS_SUMMARY.md` |
| Release Notes | `RELEASE_NOTES_IES-010_v1.0.0.md` |

## 8. Implementation Planning (post-Freeze)

| Asset | Path |
|---|---|
| Implementation API Baseline | `HOSPITALITY_IMPLEMENTATION_API_BASELINE.md` |
| Engine Acceptance Matrix | `HOSPITALITY_ENGINE_ACCEPTANCE_MATRIX.md` |
| Implementation Reuse Report (template) | `HOSPITALITY_IMPLEMENTATION_REUSE_REPORT_TEMPLATE.md` |
| Implementation Plan | `HOSPITALITY_IMPLEMENTATION_PLAN.md` |

## 9. Release (WP-4)

IES-010 Hospitality v1.0.0 released — tag `hospitality-engine-v1.0.0`. Fifth sector engine; consumes platform unchanged; CSIP ontology compatible. See `iips-platform/RELEASE_NOTES_hospitality-engine-v1.0.0.md`, `IES010_INDEPENDENT_VERIFICATION_REPORT.md`, `IES010_IMPLEMENTATION_REUSE_REPORT.md`, `IES010_FINAL_READINESS_CERTIFICATE.md`, `HOSPITALITY_RELEASE_TRACEABILITY_REPORT.md`.

## 10. Lifecycle

Gate 0 Discovery → Phase 1 Principles → Phase 2 Standard → Phase 3 Reference Assets → Phase 4 Architecture Review → Phase 5 Freeze → Implementation Planning → WP-1 → WP-2 → WP-3 → **WP-4 Release (COMPLETE)**.

**IES-010 Hospitality v1.0.0 RELEASED.**
