# IES-010 — Hospitality Implementation Reuse Report (Template)

**Standard:** IES-010 — Hospitality Sector Engine
**Purpose:** Standard implementation report template. All modification sections remain **zero** except the new Hospitality engine.
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
| CSIP capability | — | **0** | unchanged (ontology registration only) |
| **Hospitality Engine** | **NEW** | **new** | `sector.hospitality` |

## 2. New Hospitality code (sector-specific only)

- `metrics/HospitalityMetrics.ts`
- `scoring/HospitalityScoreEngine.ts`
- `calibration/HospitalityCalibration.ts`
- `decision/HospitalityDecision.ts`
- `evidence/HospitalityEvidence.ts`
- `HospitalityEngine.ts`

## 3. Reuse metrics

- Platform services reused: TBD
- Platform/framework/engine/CSIP files modified: **0**
- New Hospitality source modules: 6
- New regression tests: TBD

## 4. Statement

Hospitality reuses the platform unchanged; all differences expressed via methodology + calibration + ontology registration.

## 5. Status

**TEMPLATE** — to be completed at WP-4.
