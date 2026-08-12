# IES-011 — Energy Reference Assets Index

**Standard:** IES-011 — Energy Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-08
**Status:** REFERENCE ASSETS (deterministic + versioned — no implementation)

> **Governance:** Energy reference assets are governed by the same standards-first discipline; all are deterministic + versioned.

---

## 1. Calibration & datasets

| Asset | Version | Path |
|---|---|---|
| Energy Calibration Profile | 1.0.0 | `calibration/energy-calibration-1.0.0.json` |
| Energy Golden Dataset | 1.0.0 | `datasets/energy-golden-reference-1.0.0.json` |
| Energy Expected Outputs | 1.0.0 | `expected-outputs/energy-expected-outputs-1.0.0.json` |
| Energy Replay Dataset | 1.0.0 | `replay-datasets/energy-replay-dataset-1.0.0.json` |
| Energy Validation Fixtures | 1.0.0 | `fixtures/energy-validation-fixtures-1.0.0.json` |

## 2. Matrices

| Asset | Path |
|---|---|
| Segment Coverage Matrix | `ENERGY_SEGMENT_COVERAGE_MATRIX.md` |
| Commodity Scenario Matrix | `ENERGY_COMMODITY_SCENARIO_MATRIX.md` |

## 3. Worked examples & diagrams

| Asset | Path |
|---|---|
| Worked Example (Upstream E&P) | `examples/worked-example-upstream-eandp.md` |
| Dataflow Diagram | `diagrams/energy-dataflow.mmd` |

## 4. Coverage guarantees

- **Every value-chain segment** (Integrated, Upstream, Midstream, Downstream, Renewables, Regulated Utility) represented.
- **Every commodity environment** (oil boom/crash, gas strength, refining margin, renewables growth, carbon pressure) exercised.
- **Every override path** (governance, stranded asset, reserve write-down, cost blowout, price collapse, leverage breach) exercised.
- **Every calibration path** (segment + commodity exposure) frozen.
- **Replay datasets** reproduce byte-identically.
- **CSIP compatibility** unchanged (ontology registration, no CSIP change).

## 6. Architecture Review (Phase 4)

| Asset | Path |
|---|---|
| Calibration Boundary Matrix | `ENERGY_CALIBRATION_BOUNDARY_MATRIX.md` |
| Replay Coverage Matrix | `ENERGY_REPLAY_COVERAGE_MATRIX.md` |
| Architecture Review (verdict) | `IES-011_ARCHITECTURE_REVIEW.md` |

## 7. Freeze (Phase 5)

| Asset | Path |
|---|---|
| Freeze Manifest | `IES-011_FREEZE_MANIFEST.json` |
| Freeze Checklist | `IES-011_FREEZE_CHECKLIST.md` |
| Freeze Regression Baseline | `IES-011_FREEZE_REGRESSION_BASELINE.md` |
| Compatibility Statement | `IES-011_COMPATIBILITY.md` |
| Freeze Report | `IES-011_FREEZE_REPORT.md` |
| Implementation Readiness Certificate | `IES-011_IMPLEMENTATION_READINESS_CERTIFICATE.md` |
| Frozen Asset Dependency Manifest | `ENERGY_FROZEN_ASSET_DEPENDENCY_MANIFEST.md` |
| Implementation Assumption Register | `ENERGY_IMPLEMENTATION_ASSUMPTION_REGISTER.md` |
| Release Notes | `RELEASE_NOTES_IES-011_v1.0.0.md` |

## 8. Release (WP-4)

IES-011 Energy v1.0.0 released — tag `energy-engine-v1.0.0`. Sixth sector engine; consumes platform unchanged; CSIP ontology compatible. See `iips-platform/RELEASE_NOTES_energy-engine-v1.0.0.md`, `IES011_INDEPENDENT_VERIFICATION_REPORT.md`, `IES011_IMPLEMENTATION_REUSE_REPORT.md`, `IES011_FINAL_READINESS_CERTIFICATE.md`, `ENERGY_VERIFICATION_COVERAGE_MATRIX.md`, `ENERGY_RELEASE_REPRODUCIBILITY_RECORD.md`.

## 9. Lifecycle

Consumes: IES-011 Standard (Phase 2) + Reference Assets (Phase 3) + Architecture Review (Phase 4). Consumed by: Implementation Plan → WP-1..4 → Independent Verification → Release (COMPLETE).

## 6. Status

**PHASE 3 COMPLETE** — all energy reference assets defined, deterministic + versioned, awaiting approval before Phase 4 (Architecture Review).
