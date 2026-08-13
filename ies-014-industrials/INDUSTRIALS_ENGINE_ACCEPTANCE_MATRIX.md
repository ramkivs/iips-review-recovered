# IES-014 — Industrials Engine Acceptance Matrix

**Standard:** IES-014 — Industrials Sector Engine
**Purpose:** The authoritative implementation checklist — every acceptance criterion mapped back to its frozen source.
**Date:** 2026-08-09

---

## 1. Acceptance criteria → frozen source

| # | Acceptance criterion | Frozen source |
|---|---|---|
| 1 | D15 v1.2 calculation reproduced exactly | `docs/IES-014_15_NORMATIVE_CALCULATION_APPENDIX.md` |
| 2 | Calibration profile loaded + applied (subsegment + archetype) | `calibration/industrials-calibration-1.0.0.json` |
| 3 | Golden dataset reproducibility (10/10) | `datasets/industrials-golden-reference-1.0.0.json` |
| 4 | Expected outputs reproduced exactly | `expected-outputs/industrials-expected-outputs-1.0.0.json` |
| 5 | Replay byte-identical | `replay-datasets/industrials-replay-dataset-1.0.0.json` |
| 6 | Validation fixtures passed (10) | `fixtures/industrials-validation-fixtures-1.0.0.json` |
| 7 | Override precedence (min-rank) deterministic | `docs/IES-014_10_DECISION_ENGINE.md` |
| 8 | Ontology registration complete (8/8) | `industrials-ontology-metadata-1.0.0.json` |
| 9 | Boundary semantics + rounding correct | `contract-tests/industrials_contract_boundary_matrix.py` |
| 10 | CSIP compatibility (zero change) | `INDUSTRIALS_IMPLEMENTATION_API_BASELINE.md` |

## 2. Work-package acceptance

| Work package | Acceptance |
|---|---|
| WP-1 Platform Reuse | Industrials registers/executes; zero platform changes |
| WP-2 Framework Integration | All framework services reused; coexistence |
| WP-3 Industrials Engine | Golden 10/10 + fixtures + replay + overrides + contract matrix |
| WP-4 Validation | regression, replay, fixtures, traceability, independent verification, release |

## 3. Status

**IMPLEMENTATION PLANNING ARTIFACT — COMPLETE.**
