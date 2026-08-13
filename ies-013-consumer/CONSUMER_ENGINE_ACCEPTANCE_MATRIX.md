# IES-013 — Consumer Engine Acceptance Matrix

**Standard:** IES-013 — Consumer Sector Engine
**Purpose:** The authoritative implementation checklist — every acceptance criterion mapped back to its frozen source.
**Date:** 2026-08-08

---

## 1. Acceptance criteria → frozen source

| # | Acceptance criterion | Frozen source |
|---|---|---|
| 1 | D15 calculation reproduced exactly | `docs/IES-013_15_NORMATIVE_CALCULATION_APPENDIX.md` |
| 2 | Calibration profile loaded + applied (segment + business model) | `calibration/consumer-calibration-1.0.0.json` |
| 3 | Golden dataset reproducibility (10/10) | `datasets/consumer-golden-reference-1.0.0.json` |
| 4 | Expected outputs reproduced exactly | `expected-outputs/consumer-expected-outputs-1.0.0.json` |
| 5 | Replay byte-identical | `replay-datasets/consumer-replay-dataset-1.0.0.json` |
| 6 | Validation fixtures passed (10) | `fixtures/consumer-validation-fixtures-1.0.0.json` |
| 7 | Override precedence applied deterministically | `docs/IES-013_10_DECISION_ENGINE.md` |
| 8 | Ontology registration complete (8/8) | `CONSUMER_IMPLEMENTATION_API_BASELINE.md` |
| 9 | Segment + business-model calibration consistency | `CONSUMER_CALIBRATION_BOUNDARY_REVIEW_MATRIX.md` |
| 10 | CSIP compatibility (zero change) | `CONSUMER_IMPLEMENTATION_API_BASELINE.md` |

## 2. Work-package acceptance

| Work package | Acceptance |
|---|---|
| WP-1 Platform Reuse | Consumer registers/executes; zero platform changes |
| WP-2 Framework Integration | All framework services reused; coexistence |
| WP-3 Consumer Engine | Golden 10/10 + fixtures + replay + overrides |
| WP-4 Validation | regression, replay, fixtures, traceability, release |

## 3. Status

**IMPLEMENTATION PLANNING ARTIFACT — COMPLETE.**
