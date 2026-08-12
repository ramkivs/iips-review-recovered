# IES-012 — Utilities Reference Assets Index

**Standard:** IES-012 — Utilities Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-08
**Status:** REFERENCE ASSETS (deterministic + versioned — no implementation)

> **Governance:** Utilities reference assets are governed by the same standards-first discipline; all are deterministic + versioned.

---

## 1. Calibration & datasets

| Asset | Version | Path |
|---|---|---|
| Utilities Calibration Profile | 1.0.0 | `calibration/utilities-calibration-1.0.0.json` |
| Utilities Golden Dataset | 1.0.0 | `datasets/utilities-golden-reference-1.0.0.json` |
| Utilities Expected Outputs | 1.0.0 | `expected-outputs/utilities-expected-outputs-1.0.0.json` |
| Utilities Replay Dataset | 1.0.0 | `replay-datasets/utilities-replay-dataset-1.0.0.json` |
| Utilities Validation Fixtures | 1.0.0 | `fixtures/utilities-validation-fixtures-1.0.0.json` |

## 2. Matrices & frameworks

| Asset | Path |
|---|---|
| Regulatory Scenario Coverage Matrix | `UTILITIES_REGULATORY_SCENARIO_COVERAGE_MATRIX.md` |
| Reliability & Asset Health Framework | `UTILITIES_RELIABILITY_ASSET_HEALTH_FRAMEWORK.md` |
| Regulatory Decision Pattern Library | `ies-000-template/REGULATORY_DECISION_PATTERN_LIBRARY.md` |

## 3. Worked examples & diagrams

| Asset | Path |
|---|---|
| Worked Example (Regulated Electric) | `examples/worked-example-regulated-electric.md` |
| Dataflow Diagram | `diagrams/utilities-dataflow.mmd` |

## 4. Coverage guarantees

- **Every segment** (regulated-electric, gas-distribution, water-utilities, ipp-merchant, multi-utility) represented.
- **Every regulatory scenario** (constructive/neutral/adverse rate case, regulatory lag, accelerated recovery, disallowance, reliability penalty, merchant stress, transition approval/rejection) exercised.
- **Every override path** (adverse rate case, regulatory lag, capex overrun, stranded asset, leverage, governance) exercised.
- **Every calibration path** (segment + regulatory posture) frozen.
- **Replay datasets** reproduce byte-identically.
- **CSIP compatibility** unchanged (ontology registration, no CSIP change).

## 6. Architecture Review (Phase 4)

| Asset | Path |
|---|---|
| Calibration Independence Matrix | `UTILITIES_CALIBRATION_INDEPENDENCE_MATRIX.md` |
| Architecture Review (verdict) | `IES-012_ARCHITECTURE_REVIEW.md` |
| Sector Architecture Review Checklist (reusable) | `ies-000-template/SECTOR_ARCHITECTURE_REVIEW_CHECKLIST.md` |

## 7. Freeze (Phase 5)

| Asset | Path |
|---|---|
| Freeze Manifest | `IES-012_FREEZE_MANIFEST.json` |
| Freeze Checklist | `IES-012_FREEZE_CHECKLIST.md` |
| Freeze Regression Baseline | `IES-012_FREEZE_REGRESSION_BASELINE.md` |
| Compatibility Statement | `IES-012_COMPATIBILITY.md` |
| Freeze Report | `IES-012_FREEZE_REPORT.md` |
| Implementation Readiness Certificate | `IES-012_IMPLEMENTATION_READINESS_CERTIFICATE.md` |
| Frozen Calibration Change Policy | `FROZEN_CALIBRATION_CHANGE_POLICY.md` |
| Release Notes | `RELEASE_NOTES_IES-012_v1.0.0.md` |
| Sector Release Readiness Scorecard (reusable) | `ies-000-template/SECTOR_RELEASE_READINESS_SCORECARD.md` |

## 8. Release (WP-4)

IES-012 Utilities v1.0.0 released — tag `utilities-engine-v1.0.0`. Seventh sector engine; consumes platform unchanged; CSIP ontology compatible. See `iips-platform/RELEASE_NOTES_utilities-engine-v1.0.0.md`, `IES012_INDEPENDENT_VERIFICATION_REPORT.md`, `IES012_IMPLEMENTATION_REUSE_REPORT.md`, `IES012_FINAL_READINESS_CERTIFICATE.md`, `UTILITIES_RELEASE_AUDIT_CHECKLIST.md`.

## 9. Lifecycle

Consumes: IES-012 Standard (Phase 2) + Reference Assets (Phase 3) + Architecture Review (Phase 4). Consumed by: Implementation Plan → WP-1..4 → Independent Verification → Release (COMPLETE).

## 6. Status

**PHASE 3 COMPLETE** — all utilities reference assets defined, deterministic + versioned, awaiting approval before Phase 4 (Architecture Review).
