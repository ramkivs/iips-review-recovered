# IES-013 — Consumer Implementation Traceability Register

**Standard:** IES-013 — Consumer Sector Engine
**Purpose:** Implementation audit trail mapping every frozen component to implementation module, status, test, source, and verification evidence.
**Date:** 2026-08-08

---

## 1. Traceability register

| Frozen component | Implementation module | Status | Acceptance test | Frozen source | Verification evidence |
|---|---|---|---|---|---|
| D15 calculation stages | `scoring/ConsumerScoreEngine.ts` | ⬜ | golden regression (10/10) | D15 | WP-3 |
| Metric Library items | `metrics/ConsumerMetrics.ts` | ⬜ | metric test | D06 | WP-3 |
| Calibration profiles | `calibration/ConsumerCalibration.ts` | ⬜ | calibration isolation | D09 + consumer-calibration-1.0.0 | WP-3 |
| Override rules | `decision/ConsumerDecision.ts` | ⬜ | override precedence | D10 | WP-3 |
| Evidence generation | `evidence/ConsumerEvidence.ts` | ⬜ | evidence test | D11 | WP-3 |
| Ontology registration | `ConsumerEngine.ts` | ⬜ | ontology 8/8 | D13 | WP-3 |
| Replay obligations | `ConsumerEngine.ts` + shared | ⬜ | replay byte-identical | replay dataset | WP-4 |

## 2. Usage

- Updated through WP-1..WP-4.
- Every row must move to complete + evidence before release.

## 3. Status

**IMPLEMENTATION ARTIFACT — COMPLETE** (updated per WP).
