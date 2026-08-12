# IES-011 — Energy Engine Acceptance Matrix

**Standard:** IES-011 — Energy Sector Engine
**Purpose:** The authoritative implementation checklist — every acceptance criterion mapped back to its frozen source.
**Date:** 2026-08-08

---

## 1. Acceptance criteria → frozen source

| # | Acceptance criterion | Frozen source |
|---|---|---|
| 1 | D15 calculation reproduced exactly | `docs/IES-011_15_NORMATIVE_CALCULATION_APPENDIX.md` |
| 2 | Calibration profile loaded + applied (segment + commodity) | `calibration/energy-calibration-1.0.0.json` |
| 3 | Golden dataset reproducibility (9/9) | `datasets/energy-golden-reference-1.0.0.json` |
| 4 | Expected outputs reproduced exactly | `expected-outputs/energy-expected-outputs-1.0.0.json` |
| 5 | Replay byte-identical | `replay-datasets/energy-replay-dataset-1.0.0.json` |
| 6 | Validation fixtures passed (9) | `fixtures/energy-validation-fixtures-1.0.0.json` |
| 7 | Override precedence applied deterministically | `docs/IES-011_10_DECISION_ENGINE.md` |
| 8 | Ontology registration complete (8/8) | `ENERGY_IMPLEMENTATION_API_BASELINE.md` |
| 9 | Segment + commodity calibration consistency | `ENERGY_CALIBRATION_BOUNDARY_MATRIX.md` |
| 10 | CSIP compatibility (zero change) | `ENERGY_IMPLEMENTATION_API_BASELINE.md` |

## 2. Work-package acceptance

| Work package | Acceptance |
|---|---|
| WP-1 Platform Reuse | Energy registers/executes; zero platform changes |
| WP-2 Framework Integration | All framework services reused; coexistence |
| WP-3 Energy Engine | Golden 9/9 + fixtures + replay + overrides |
| WP-4 Validation | regression, replay, fixtures, traceability, release |

## 3. Status

**IMPLEMENTATION PLANNING ARTIFACT — COMPLETE.**
