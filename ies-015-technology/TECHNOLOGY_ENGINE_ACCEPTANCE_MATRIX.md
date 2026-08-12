# IES-015 — Technology Engine Acceptance Matrix

**Standard:** IES-015 — Technology Sector Engine
**Purpose:** The authoritative implementation checklist — every acceptance criterion mapped back to its frozen source.
**Date:** 2026-08-09

---

## 1. Acceptance criteria → frozen source

| # | Acceptance criterion | Frozen source |
|---|---|---|
| 1 | D15 v1.3 calculation reproduced exactly | `docs/IES-015_15_NORMATIVE_CALCULATION_APPENDIX.md` |
| 2 | Calibration profile loaded + applied (subsegment + archetype + calibrated band tables) | `calibration/technology-calibration-1.0.0.json` |
| 3 | Golden dataset reproducibility (13/13) | `datasets/technology-golden-reference-1.0.0.json` |
| 4 | Expected outputs reproduced exactly | `expected-outputs/technology-expected-outputs-1.0.0.json` |
| 5 | Replay byte-identical | `replay-datasets/technology-replay-dataset-1.0.0.json` |
| 6 | Validation fixtures passed (21) | `fixtures/technology-validation-fixtures-1.0.0.json` |
| 7 | Effective band-table resolution (calibrated ?? baseline, boundaries+scores together) | `docs/IES-015_09_CALIBRATION.md` + D15 §6a |
| 8 | Metric cardinality integrity (TM-009 = 3 bands; band-count rejection) | D15 §6a.2 + contract boundary matrix |
| 9 | ConservativeBandTable operator (deterministic, composite-lowering) | D15 §6a.3.1 + contract boundary matrix |
| 10 | Hybrid / multi-subsegment resolution (single profile, no branch) | `docs/IES-015_09_CALIBRATION.md` §2 |
| 11 | Override precedence (min-rank) deterministic | `docs/IES-015_10_DECISION_ENGINE.md` |
| 12 | Boundary semantics + rounding (round-half-to-even at composite) correct | `contract-tests/technology_contract_boundary_matrix.py` |
| 13 | Ontology registration complete (8/8) | `technology-ontology-metadata-1.0.0.json` |
| 14 | CSIP compatibility (zero change) | `TECHNOLOGY_IMPLEMENTATION_API_BASELINE.md` |

## 2. Work-package acceptance

| Work package | Acceptance |
|---|---|
| WP-1 Platform Reuse | Technology registers/executes; zero platform changes |
| WP-2 Framework Integration | All framework services reused; coexistence |
| WP-3 Technology Engine | Golden 13/13 + fixtures + replay + band-table resolution + overrides + contract matrix |
| WP-4 Validation | regression, replay, fixtures, traceability, independent verification, release |

## 3. Status

**IMPLEMENTATION PLANNING ARTIFACT — COMPLETE.**
