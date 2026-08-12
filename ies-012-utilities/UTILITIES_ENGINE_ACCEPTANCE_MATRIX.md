# IES-012 — Utilities Engine Acceptance Matrix

**Standard:** IES-012 — Utilities Sector Engine
**Purpose:** The authoritative implementation checklist — every acceptance criterion mapped back to its frozen source.
**Date:** 2026-08-08

---

## 1. Acceptance criteria → frozen source

| # | Acceptance criterion | Frozen source |
|---|---|---|
| 1 | D15 calculation reproduced exactly | `docs/IES-012_15_NORMATIVE_CALCULATION_APPENDIX.md` |
| 2 | Calibration profile loaded + applied (segment + regulatory posture) | `calibration/utilities-calibration-1.0.0.json` |
| 3 | Golden dataset reproducibility (11/11) | `datasets/utilities-golden-reference-1.0.0.json` |
| 4 | Expected outputs reproduced exactly | `expected-outputs/utilities-expected-outputs-1.0.0.json` |
| 5 | Replay byte-identical | `replay-datasets/utilities-replay-dataset-1.0.0.json` |
| 6 | Validation fixtures passed (11) | `fixtures/utilities-validation-fixtures-1.0.0.json` |
| 7 | Override precedence applied deterministically | `docs/IES-012_10_DECISION_ENGINE.md` |
| 8 | Ontology registration complete (8/8) | `UTILITIES_IMPLEMENTATION_API_BASELINE.md` |
| 9 | Segment + regulatory calibration consistency | `UTILITIES_CALIBRATION_INDEPENDENCE_MATRIX.md` |
| 10 | CSIP compatibility (zero change) | `UTILITIES_IMPLEMENTATION_API_BASELINE.md` |

## 2. Work-package acceptance

| Work package | Acceptance |
|---|---|
| WP-1 Platform Reuse | Utilities registers/executes; zero platform changes |
| WP-2 Framework Integration | All framework services reused; coexistence |
| WP-3 Utilities Engine | Golden 11/11 + fixtures + replay + overrides |
| WP-4 Validation | regression, replay, fixtures, traceability, release |

## 3. Status

**IMPLEMENTATION PLANNING ARTIFACT — COMPLETE.**
