# IES-010 — Hospitality Implementation Traceability Matrix

**Standard:** IES-010 — Hospitality Sector Engine
**Purpose:** The definitive implementation audit document — maps every implementation component to its frozen source.
**Date:** 2026-08-08

---

## 1. Component → frozen source traceability

| Implementation component | Module | Authoritative frozen source | Validation test | Replay obligation | Acceptance criterion |
|---|---|---|---|---|---|
| **Hospitality Metric Evaluator** | `metrics/HospitalityMetrics.ts` | Metric Library (D06) | metric regression | outputs identical | HM metrics correct |
| **Band Scoring** | `scoring/HospitalityScoreEngine.ts` | Normative Calculation Appendix (D15) | band→score test | byte-identical | D15 reproduced |
| **Calibration Engine** | `calibration/HospitalityCalibration.ts` | `hospitality-calibration-1.0.0` | business-model weights test | byte-identical | calibration applied |
| **Decision Engine** | `decision/HospitalityDecision.ts` | Decision Engine (D10) + Override Precedence Matrix | override precedence test | byte-identical | verdicts match |
| **Evidence Builder** | `evidence/HospitalityEvidence.ts` | Evidence Framework (D11) | evidence shape test | byte-identical | evidence complete |
| **Ontology Registration** | `HospitalityEngine.ts` + metadata | Arena Implementation Spec (D13) | ontology registration test | — | 8/8 dimensions, CSIP unchanged |
| **Composite + Verdict** | `scoring/` + `decision/` | Expected Outputs (frozen) | golden regression (9/9) | byte-identical | 9/9 reproduce |

## 2. Acceptance → source closure

| Acceptance target | Frozen source | Verified by |
|---|---|---|
| 9 golden outputs | Expected Outputs + D15 | WP-4 regression (9/9) |
| 9 validation fixtures | Validation Fixtures | WP-4 fixture acceptance |
| Replay determinism | Replay Dataset | WP-4 replay |
| Override precedence | Override Precedence Matrix | WP-3 tests |
| Ontology registration | Ontology Registration Review | WP-3 test |
| Zero engine/platform/CSIP change | Compatibility Statement | WP-1 + WP-4 reuse report |

## 3. Completeness rule

Every component must have (a) an implementation module, (b) a frozen source, (c) a validation test, (d) a replay obligation, (e) an acceptance criterion.

## 4. Status

**IMPLEMENTATION PLANNING ARTIFACT — COMPLETE.** The authoritative implementation audit document.
