# IES-010 — Hospitality Engine Acceptance Matrix

**Standard:** IES-010 — Hospitality Sector Engine
**Purpose:** The authoritative implementation checklist — every acceptance criterion mapped back to its frozen source.
**Date:** 2026-08-08

---

## 1. Acceptance criteria → frozen source

| # | Acceptance criterion | Frozen source |
|---|---|---|
| 1 | D15 calculation reproduced exactly | `docs/IES-010_15_NORMATIVE_CALCULATION_APPENDIX.md` |
| 2 | Calibration profile loaded + applied | `calibration/hospitality-calibration-1.0.0.json` |
| 3 | Golden dataset reproducibility (9/9) | `datasets/hospitality-golden-reference-1.0.0.json` |
| 4 | Expected outputs reproduced exactly | `expected-outputs/hospitality-expected-outputs-1.0.0.json` |
| 5 | Replay byte-identical | `replay-datasets/hospitality-replay-dataset-1.0.0.json` |
| 6 | Validation fixtures passed (9) | `fixtures/hospitality-validation-fixtures-1.0.0.json` |
| 7 | Override precedence applied deterministically | `HOSPITALITY_OVERRIDE_PRECEDENCE_MATRIX.md` + D10 |
| 8 | Ontology registration complete (8/8) | `HOSPITALITY_ONTOLOGY_REGISTRATION_REVIEW.md` |
| 9 | Business-model calibration consistency | `HOSPITALITY_BUSINESS_MODEL_CONSISTENCY_MATRIX.md` |
| 10 | CSIP compatibility (zero change) | `HOSPITALITY_ONTOLOGY_REGISTRATION_REVIEW.md` |

## 2. Work-package acceptance

| Work package | Acceptance |
|---|---|
| WP-1 Platform Reuse | Hospitality registers/executes; zero platform changes |
| WP-2 Framework Integration | All framework services reused; coexistence |
| WP-3 Hospitality Engine | Golden 9/9 + fixtures + replay + overrides |
| WP-4 Validation | regression, replay, fixtures, traceability, release |

## 3. Status

**IMPLEMENTATION PLANNING ARTIFACT — COMPLETE.**
