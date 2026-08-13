# IES-013 — Consumer Reference Assets Index

**Standard:** IES-013 — Consumer Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-08
**Status:** REFERENCE ASSETS (deterministic + versioned — no implementation)

> **Governance:** Consumer reference assets are governed by the same standards-first discipline; all are deterministic + versioned.

---

## 1. Calibration & datasets

| Asset | Version | Path |
|---|---|---|
| Consumer Calibration Profile | 1.0.0 | `calibration/consumer-calibration-1.0.0.json` |
| Consumer Golden Dataset | 1.0.0 | `datasets/consumer-golden-reference-1.0.0.json` |
| Consumer Expected Outputs | 1.0.0 | `expected-outputs/consumer-expected-outputs-1.0.0.json` |
| Consumer Replay Dataset | 1.0.0 | `replay-datasets/consumer-replay-dataset-1.0.0.json` |
| Consumer Validation Fixtures | 1.0.0 | `fixtures/consumer-validation-fixtures-1.0.0.json` |

## 2. Matrices & frameworks

| Asset | Path |
|---|---|
| Consumer Scenario Coverage Matrix | `CONSUMER_SCENARIO_COVERAGE_MATRIX.md` |
| Consumer Portfolio Architecture | `CONSUMER_PORTFOLIO_ARCHITECTURE.md` |
| Competitive Position Pattern Library | `ies-000-template/COMPETITIVE_POSITION_PATTERN_LIBRARY.md` |

## 3. Worked examples & diagrams

| Asset | Path |
|---|---|
| Worked Example (Staple Brand) | `examples/worked-example-staple-brand.md` |
| Dataflow Diagram | `diagrams/consumer-dataflow.mmd` |

## 4. Coverage guarantees

- **Every segment** (Staples, Discretionary, Luxury) + business model (branded/retailer/DTC) represented.
- **Every scenario** (premium expansion, staple resilience, discretionary contraction, successful/failed premiumization, channel disruption, private-label, margin compression, innovation share gains, brand erosion) exercised.
- **Every override path** (brand erosion, category disruption, input-cost squeeze, channel loss, leverage, governance) exercised.
- **Every calibration path** (segment + business model) frozen.
- **Replay datasets** reproduce byte-identically.
- **CSIP compatibility** unchanged (ontology registration, no CSIP change).

## 6. Architecture Review (Phase 4)

| Asset | Path |
|---|---|
| Calibration Boundary Review Matrix | `CONSUMER_CALIBRATION_BOUNDARY_REVIEW_MATRIX.md` |
| Architecture Review (verdict) | `IES-013_ARCHITECTURE_REVIEW.md` |
| Intangible Asset Evaluation Checklist (reusable) | `ies-000-template/INTANGIBLE_ASSET_EVALUATION_CHECKLIST.md` |

## 7. Relationship to lifecycle

Consumes: IES-013 Standard (Phase 2) + Reference Assets (Phase 3). Consumed by: Freeze → Implementation Plan → Implementation → Independent Verification → Release.

## 7. Freeze (Phase 5)

| Asset | Path |
|---|---|
| Freeze Manifest | `IES-013_FREEZE_MANIFEST.json` |
| Freeze Checklist | `IES-013_FREEZE_CHECKLIST.md` |
| Freeze Regression Baseline | `IES-013_FREEZE_REGRESSION_BASELINE.md` |
| Compatibility Statement | `IES-013_COMPATIBILITY.md` |
| Freeze Report | `IES-013_FREEZE_REPORT.md` |
| Implementation Readiness Certificate | `IES-013_IMPLEMENTATION_READINESS_CERTIFICATE.md` |
| Frozen Methodology Dependency Map | `CONSUMER_FROZEN_METHODOLOGY_DEPENDENCY_MAP.md` |
| Release Notes | `RELEASE_NOTES_IES-013_v1.0.0.md` |
| Moat Evidence Pattern Library (reusable) | `ies-000-template/MOAT_EVIDENCE_PATTERN_LIBRARY.md` |

## 8. Release (WP-4)

IES-013 Consumer v1.0.0 released — tag `consumer-engine-v1.0.0`. Eighth sector engine; consumes platform unchanged; CSIP ontology compatible. See `iips-platform/RELEASE_NOTES_consumer-engine-v1.0.0.md`, `IES013_INDEPENDENT_VERIFICATION_REPORT.md`, `IES013_IMPLEMENTATION_REUSE_REPORT.md`, `IES013_FINAL_READINESS_CERTIFICATE.md`.

## 9. Lifecycle

Consumes: IES-013 Standard (Phase 2) + Reference Assets (Phase 3) + Architecture Review (Phase 4). Consumed by: Implementation Plan → WP-1..4 → Independent Verification → Release (COMPLETE).
