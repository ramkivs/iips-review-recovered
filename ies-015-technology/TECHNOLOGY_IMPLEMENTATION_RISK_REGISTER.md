# IES-015 — Technology Implementation Risk Register

**Standard:** IES-015 — Technology Sector Engine
**Phase:** Implementation Planning
**Version:** 1.0
**Date:** 2026-08-09
**Status:** ENGINEERING RISK LEDGER — referenced throughout WP-1..WP-4

---

## 1. Risk register

| Risk | Mitigation | Validation |
|---|---|---|
| Calibration drift | load from frozen `technology-calibration-1.0.0` | golden regression (13/13) |
| Effective band-table resolution error (calibrated ?? baseline) | D15 §6a + D09 §6 | golden TE-001/003/005/010/011 |
| Band-table mixing (calibrated boundaries + baseline scores) | effective table immutable, boundaries+scores together | contract boundary matrix |
| Metric-cardinality error (TM-009 = 3 bands) | D15 §6a.2 + band-count rejection | contract boundary matrix + fixture TEC-14 |
| ConservativeBandTable operator error | D15 §6a.3.1 (boundaries max/min, scores min both directions) | fixtures TEC-15..TEC-20 |
| Hybrid / multi-subsegment misresolution | `hybridDominant` / `subsegmentDominant` / most-conservative | golden TE-009/010/011 |
| Boundary-semantics error (lower-incl/upper-excl) | contract boundary matrix | contract test suite |
| Rounding error (round-half-to-even at composite only) | normative D15 rounding | golden TE-012 (49.25→49.2) |
| Derived-component / missing-primitive rule | D15 §5.1/§5.2 | golden TE-002/008 (renormalization) |
| Calibration staging (thresholds pre-scoring; weights post-pillar) | D15 §6 | contract test suite |
| Override precedence (min-rank) | D10 + D15 §10 | golden TE-006/013 |
| Replay fixture mismatch | replay dataset assertions | WP-4 replay (byte-identical) |
| Subsegment/archetype misclassification | subsegment + archetype → profile | validation fixtures (21) |
| Ontology metadata mismatch | ontology registration tests | WP-3 ontology test (8/8) |
| CSIP compatibility break | ontology registration only; zero CSIP change | compatibility check |

## 2. Usage

- Referenced during WP-3 implementation and WP-4 validation.
- Any new risk discovered during implementation is appended (additive, versioned).

## 3. Status

**IMPLEMENTATION PLANNING ARTIFACT — COMPLETE.**
