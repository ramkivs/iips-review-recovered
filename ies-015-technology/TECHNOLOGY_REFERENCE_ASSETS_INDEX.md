# IES-015 — Technology Reference Assets Index

**Standard:** IES-015 — Technology Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-09
**Status:** REFERENCE ASSETS (deterministic + versioned — no implementation)
**Contract:** IES-015 D15 v1.3 (approved normative contract)
**Lifecycle:** **CLOSED** — IES-015 Technology v1.0.0 released and accepted (`technology-engine-v1.0.0`, 2026-08-09)

> **Governance:** Technology reference assets are generated from the **approved D15 v1.3 normative contract** (not the methodology principles), validated against the contract boundary matrix, and governed by the same standards-first discipline. All are deterministic + versioned. **D15 v1.3 and the golden dataset are immutable; an implementation must conform to them, never the reverse.**

---

## 1. Calibration & datasets

| Asset | Version | Path |
|---|---|---|
| Technology Calibration Profile | 1.0.0 | `calibration/technology-calibration-1.0.0.json` |
| Technology Golden Dataset | 1.0.0 | `datasets/technology-golden-reference-1.0.0.json` |
| Technology Expected Outputs | 1.0.0 | `expected-outputs/technology-expected-outputs-1.0.0.json` |
| Technology Replay Dataset | 1.0.0 | `replay-datasets/technology-replay-dataset-1.0.0.json` |
| Technology Validation Fixtures | 1.0.0 | `fixtures/technology-validation-fixtures-1.0.0.json` |

## 2. Contract test suite

| Asset | Path |
|---|---|
| Contract Boundary Matrix (Python, D15 v1.3) | `contract-tests/technology_contract_boundary_matrix.py` |
| Expected-Outputs Generator (Python, D15 v1.3) | `contract-tests/generate_expected_outputs.py` |

## 3. Worked examples & diagrams

| Asset | Path |
|---|---|
| Worked Example (SaaS Leader — calibrated TM-007) | `examples/worked-example-saas-leader.md` |
| Worked Example (Semiconductor Foundry — calibrated boundaries+scores) | `examples/worked-example-semiconductor-foundry.md` |
| Worked Example (Round-Half-Even Composite Boundary) | `examples/worked-example-rounding-boundary.md` |
| Dataflow Diagram | `diagrams/technology-dataflow.mmd` |

## 4. Coverage guarantees (13 providers, TE-001..TE-013)

- **Every subsegment** (software-saas, it-services, semiconductors, electronics-hardware, digital-platforms, internet-consumer-tech, cybersecurity, data-infrastructure, tech-enabled-services) represented.
- **Every archetype** (license, subscription, usage-based, transaction-platform, hardware, foundry-manufacturing, services-project, managed-services, hybrid) represented.
- **Hybrid resolution** — TE-009 (`hybridDominant: managed-services`).
- **Multi-subsegment resolution** — TE-010 (`subsegmentDominant`) and TE-011 (no dominant → most conservative risk profile).
- **TM-009 3-band cardinality** — TE-007 (R&D 10 → terminal band 75).
- **Calibrated band tables** — TE-001 (TM-007), TE-003 (TM-008 + TM-011), TE-005 (TM-006).
- **Uncalibrated fallback** — TE-002, TE-004, TE-006, TE-007, TE-008, TE-009, TE-012, TE-013.
- **Calibrated boundaries + scores together** — TE-003 (TM-008/TM-011), TE-005 (TM-006).
- **Attempted invalid cardinality → rejected** — fixture TEC-14 (D15 §6a.2).
- **Conservative conflicting band tables** — fixtures TEC-15..TEC-20 (D15 §6a.3.1).
- **Higher-better conservative score** — fixture TEC-16.
- **Lower-better conservative score** — fixture TEC-17 (composite-lowering min, both directions).
- **Simultaneous overrides** — TE-006 (leverage-breach + margin-compression → Watch).
- **Missing primitive metrics** — TE-002 (TM-010), TE-008 (TM-008 + TM-011).
- **Missing derived components** — Technology defines **no named derived components** in D08; the D15 §5.2 missing-data rule is exercised via missing-primitive renormalization within multi-constituent pillars (fixture TEC-21).
- **Composite rounding boundary** — TE-012 (raw 49.25 → round-half-even 49.2).
- **Replay / version identity** — replay dataset pins resolved calibration version (D15 §6a.4).

## 5. Verification evidence

- Contract boundary matrix: all checks pass (band cardinality, conservative operator, calibrated/fallback/hybrid/multi-subsegment, boundary epsilon).
- Expected outputs generated from D15 v1.3 via `generate_expected_outputs.py`; composites/verdicts cross-checked against fixtures.
- Replay dataset reproduces byte-identically (same inputs twice → same composite, verdict, pillars, overrides, evidence, calibration version).

## 6. Architecture Review (Phase 4)

| Asset | Path |
|---|---|
| Calibration Independence Matrix | `TECHNOLOGY_CALIBRATION_INDEPENDENCE_MATRIX.md` |
| Architecture Review (verdict) | `IES-015_ARCHITECTURE_REVIEW.md` |

## 7. Relationship to lifecycle

Consumes: IES-015 Standard v1.3 (Phase 2, approved) + Reference Assets (Phase 3). Consumed by: Architecture Review (Phase 4) → Freeze → Implementation Plan → WP-1..4 → Independent Verification → Release.
