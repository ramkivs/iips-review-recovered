# IES-015 — Technology Implementation Reuse Report (Template)

**Standard:** IES-015 — Technology Sector Engine
**Purpose:** Standard implementation report template. All modification sections remain **zero** except the new Technology engine.
**Date:** 2026-08-09
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
| Consumer Engine | — | **0** | immutable |
| Industrials Engine | — | **0** | immutable |
| CSIP capability | — | **0** | unchanged (ontology registration only) |
| **Technology Engine** | **NEW** | **new** | `sector.technology` |

## 2. New Technology code (sector-specific only)

- `metrics/TechnologyMetrics.ts`
- `scoring/TechnologyScoreEngine.ts`
- `calibration/TechnologyCalibration.ts`
- `decision/TechnologyDecision.ts`
- `evidence/TechnologyEvidence.ts`
- `TechnologyEngine.ts`

## 3. Reuse metrics

- Platform services reused: TBD
- Platform/framework/engine/CSIP files modified: **0**
- New Technology source modules: 6
- New regression tests: TBD

## 4. Statement

Technology reuses the platform unchanged; all differences expressed via methodology + calibration + ontology registration. Frozen assets are the authoritative test oracle.

## 5. Status

**TEMPLATE** — to be completed at WP-4.
