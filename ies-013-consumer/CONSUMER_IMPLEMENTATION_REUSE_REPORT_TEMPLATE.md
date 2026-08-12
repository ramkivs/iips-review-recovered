# IES-013 — Consumer Implementation Reuse Report (Template)

**Standard:** IES-013 — Consumer Sector Engine
**Purpose:** Standard implementation report template. All modification sections remain **zero** except the new Consumer engine.
**Date:** 2026-08-08
**Status:** TEMPLATE (filled at WP-4)

---

## 1. Reuse summary

| Component | Modified? | Expected | Notes |
|---|---|---|---|
| Platform runtime | — | **0** | reused unchanged |
| Framework services | — | **0** | reused unchanged |
| Contracts / schemas | — | **0** | reused unchanged |
| Banking Engine | — | **0** | immutable |
| Insurance Engine | — | **0** | immutable |
| Capital Markets Engine | — | **0** | immutable |
| Healthcare Engine | — | **0** | immutable |
| Hospitality Engine | — | **0** | immutable |
| Energy Engine | — | **0** | immutable |
| Utilities Engine | — | **0** | immutable |
| CSIP capability | — | **0** | unchanged (ontology registration only) |
| **Consumer Engine** | **NEW** | **new** | `sector.consumer` |

## 2. New Consumer code (sector-specific only)

- `metrics/ConsumerMetrics.ts`
- `scoring/ConsumerScoreEngine.ts`
- `calibration/ConsumerCalibration.ts`
- `decision/ConsumerDecision.ts`
- `evidence/ConsumerEvidence.ts`
- `ConsumerEngine.ts`

## 3. Reuse metrics

- Platform services reused: TBD
- Platform/framework/engine/CSIP files modified: **0**
- New Consumer source modules: 6
- New regression tests: TBD

## 4. Statement

Consumer reuses the platform unchanged; all differences expressed via methodology + calibration + ontology registration.

## 5. Status

**TEMPLATE** — to be completed at WP-4.
