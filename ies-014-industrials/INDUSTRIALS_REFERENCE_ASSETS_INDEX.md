# IES-014 — Industrials Reference Assets Index

**Standard:** IES-014 — Industrials Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-09
**Status:** REFERENCE ASSETS (deterministic + versioned — no implementation)
**Contract:** IES-014 D15 v1.2 (normative)

> **Governance:** Industrials reference assets are generated from the **approved v1.2 normative contract** (not the methodology principles), validated against D15, and governed by the same standards-first discipline. All are deterministic + versioned.

---

## 1. Calibration & datasets

| Asset | Version | Path |
|---|---|---|
| Industrials Calibration Profile | 1.0.0 | `calibration/industrials-calibration-1.0.0.json` |
| Industrials Golden Dataset | 1.0.0 | `datasets/industrials-golden-reference-1.0.0.json` |
| Industrials Expected Outputs | 1.0.0 | `expected-outputs/industrials-expected-outputs-1.0.0.json` |
| Industrials Replay Dataset | 1.0.0 | `replay-datasets/industrials-replay-dataset-1.0.0.json` |
| Industrials Validation Fixtures | 1.0.0 | `fixtures/industrials-validation-fixtures-1.0.0.json` |

## 2. Contract test suite

| Asset | Path |
|---|---|
| Contract Boundary Matrix (Python, D15 v1.2) | `contract-tests/industrials_contract_boundary_matrix.py` |
| Expected-Outputs Generator (Python, D15 v1.2) | `contract-tests/generate_expected_outputs.py` |

## 3. Worked examples & diagrams

| Asset | Path |
|---|---|
| Worked Example (Capital Goods OEM) | `examples/worked-example-capital-goods-oem.md` |
| Dataflow Diagram | `diagrams/industrials-dataflow.mmd` |

## 4. Coverage guarantees

- **Every subsegment** (capital-goods, aero-defense, transportation, eandc, electrical-equipment, diversified) represented.
- **Every archetype** (oem, aftermarket, epc, distributor, diversified) represented.
- **Every override path** (order cancellation, defense program, EPC overrun, margin compression, leverage, governance) exercised.
- **Every calibration path** (subsegment weight + archetype risk multiplier) exercised.
- **Expected outputs generated from the D15 v1.2 contract** (validated against the contract test suite).
- **Replay datasets** reproduce byte-identically.
- **CSIP compatibility** unchanged (ontology registration, no CSIP change).

## 6. Architecture Review (Phase 4)

| Asset | Path |
|---|---|
| Calibration Independence Matrix | `INDUSTRIALS_CALIBRATION_INDEPENDENCE_MATRIX.md` |
| Architecture Review (verdict) | `IES-014_ARCHITECTURE_REVIEW.md` |

## 7. Relationship to lifecycle

Consumes: IES-014 Standard v1.2 (Phase 2, frozen) + Reference Assets (Phase 3). Consumed by: Freeze → Implementation Plan → Implementation → Independent Verification → Release.

## 7. Freeze

| Asset | Path |
|---|---|
| Freeze Manifest | `IES-014_FREEZE_MANIFEST.json` |
| Freeze Checklist | `IES-014_FREEZE_CHECKLIST.md` |
| Freeze Regression Baseline | `IES-014_FREEZE_REGRESSION_BASELINE.md` |
| Compatibility Statement | `IES-014_COMPATIBILITY.md` |
| Freeze Report | `IES-014_FREEZE_REPORT.md` |
| Implementation Readiness Certificate | `IES-014_IMPLEMENTATION_READINESS_CERTIFICATE.md` |
| Ontology Metadata | `industrials-ontology-metadata-1.0.0.json` |
| Release Notes | `RELEASE_NOTES_IES-014_v1.0.0.md` |

## 8. Release (WP-4)

IES-014 Industrials v1.0.0 released — tag `industrials-engine-v1.0.0`. Ninth sector engine; consumes platform unchanged; CSIP ontology compatible. See `iips-platform/RELEASE_NOTES_industrials-engine-v1.0.0.md`, `IES014_INDEPENDENT_VERIFICATION_REPORT.md`, `IES014_IMPLEMENTATION_REUSE_REPORT.md`, `IES014_FINAL_READINESS_CERTIFICATE.md`.

## 9. Lifecycle

Consumes: IES-014 Standard v1.2 (Phase 2) + Reference Assets (Phase 3) + Architecture Review (Phase 4). Consumed by: Implementation Plan → WP-1..4 → Independent Verification → Release (COMPLETE).
