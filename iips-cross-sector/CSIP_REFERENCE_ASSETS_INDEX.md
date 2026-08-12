# IIPS — CSIP Reference Assets Index

**Program:** v1.1 Track 5 — Cross-Sector Intelligence Platform
**Milestone:** Phase 2 — Reference Assets
**Status:** REFERENCE (specification assets — no implementation)
**Date:** 2026-08-06

> **Governance:** CSIP reference assets are governed by the same standards-first discipline; all are deterministic + versioned.

---

## 1. Portfolio Golden Dataset

| Asset | Version | Path |
|---|---|---|
| Portfolio Golden Dataset | 1.0.0 | `portfolios/PORTFOLIO_GOLDEN_DATASET.json` |

6 portfolios: Conservative, Growth, Income, Over-concentrated, Multi-sector Balanced, Crisis.

## 2. Portfolio Expected Outputs

| Asset | Version | Path |
|---|---|---|
| Portfolio Expected Outputs | 1.0.0 | `expected-outputs/PORTFOLIO_EXPECTED_OUTPUTS.json` |

Sector exposure, concentration, diversification score, avg conviction/quality/risk, ranking per portfolio.

## 3. Portfolio Replay Dataset

| Asset | Version | Path |
|---|---|---|
| Portfolio Replay Dataset | 1.0.0 | `replay-datasets/PORTFOLIO_REPLAY_DATASET.json` |

Replay assertions: identical rankings/allocations/reports/diversification/evidence.

## 4. Validation Fixtures

| Asset | Version | Path |
|---|---|---|
| Allocation Fixtures | 1.0.0 | `fixtures/ALLOCATION_FIXTURES.json` |
| Diversification Fixtures | 1.0.0 | `fixtures/DIVERSIFICATION_FIXTURES.json` |

## 5. Decision + Evidence artifacts

| Asset | Path |
|---|---|
| Allocation Decision Matrix | `ALLOCATION_DECISION_MATRIX.md` |
| Cross-Sector Evidence Model | `CROSS_SECTOR_EVIDENCE_MODEL.md` |

## 6. Specification (predecessors)

- Universal Investment Ontology
- Cross-Sector Intelligence Standard
- Portfolio Architecture
- Portfolio Reference Data

## 7. Architecture Review (Phase 3)

| Asset | Path |
|---|---|
| Portfolio Decision Trace Matrix | `architecture-review/PORTFOLIO_DECISION_TRACE_MATRIX.md` |
| Ontology Consistency Matrix | `architecture-review/ONTOLOGY_CONSISTENCY_MATRIX.md` |
| Allocation Rule Precedence Table | `architecture-review/ALLOCATION_RULE_PRECEDENCE_TABLE.md` |
| Cross-Sector Coverage Matrix | `architecture-review/CROSS_SECTOR_COVERAGE_MATRIX.md` |
| Architecture Review (verdict) | `architecture-review/ARCHITECTURE_REVIEW.md` |

## 8. Freeze (Phase 4)

| Asset | Path |
|---|---|
| Freeze Manifest (JSON, hashes) | `CSIP_FREEZE_MANIFEST.json` |
| Freeze Checklist | `CSIP_FREEZE_CHECKLIST.md` |
| Freeze Regression Baseline | `CSIP_FREEZE_REGRESSION_BASELINE.md` |
| Compatibility Statement | `CSIP_COMPATIBILITY.md` |
| Freeze Report | `CSIP_FREEZE_REPORT.md` |
| Implementation Readiness Certificate | `CSIP_IMPLEMENTATION_READINESS_CERTIFICATE.md` |

## 9. Implementation Plan (Phase 5)

| Asset | Path |
|---|---|
| Implementation Plan (WP-1..WP-4) | `CSIP_IMPLEMENTATION_PLAN.md` |
| Implementation Traceability Matrix | `CSIP_IMPLEMENTATION_TRACEABILITY_MATRIX.md` |
| Service Dependency Matrix | `CSIP_SERVICE_DEPENDENCY_MATRIX.md` |
| Framework Integration Matrix | `CSIP_FRAMEWORK_INTEGRATION_MATRIX.md` |
| Execution Pipeline | `CSIP_EXECUTION_PIPELINE.md` |
| Release Traceability Report | `CSIP_RELEASE_TRACEABILITY_REPORT.md` |

## 10. Release (WP-4)

CSIP v1.0.0 released — tag `csip-v1.0.0`. Production platform capability consuming the four immutable sector engines. See `iips-platform/RELEASE_NOTES_csip-v1.0.0.md`, `CSIP_INDEPENDENT_VERIFICATION_REPORT.md`, `CSIP_IMPLEMENTATION_REUSE_REPORT.md`, `CSIP_FINAL_READINESS_CERTIFICATE.md`.

---

## Relationship to lifecycle

Consumes: Ontology + Standard + Architecture + Reference Data + Reference Assets + Architecture Review + Freeze. Consumed by: Implementation (WP-1 → WP-4) → Independent Verification → Release.

## Out of scope

No CSIP implementation (portfolio/ranking/allocation/diversification/opportunity/correlation/reporting services).
