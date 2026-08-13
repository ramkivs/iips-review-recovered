# IES-014 — Industrials Implementation Risk Register

**Standard:** IES-014 — Industrials Sector Engine
**Phase:** Implementation Planning
**Version:** 1.0
**Date:** 2026-08-09
**Status:** ENGINEERING RISK LEDGER — referenced throughout WP-1..WP-4

---

## 1. Risk register

| Risk | Mitigation | Validation |
|---|---|---|
| Calibration drift | load from frozen `industrials-calibration-1.0.0` | golden regression (10/10) |
| Boundary-semantics error (lower-incl/upper-excl) | contract boundary matrix | contract test suite |
| Rounding error (round-half-to-even at composite only) | normative D15 rounding | contract test suite |
| Derived-component missing rule | D15 §5.2 + D08 IF-009 | contract test suite |
| Calibration staging (thresholds vs weights) | D15 §6 + D09 | contract test suite |
| Override precedence (min-rank) | D10 + D15 §10 | WP-3 override tests |
| Replay fixture mismatch | replay dataset assertions | WP-4 replay (byte-identical) |
| Subsegment/archetype misclassification | subsegment + archetype → profile | validation fixtures (10) |
| Ontology metadata mismatch | ontology registration tests | WP-3 ontology test (8/8) |
| CSIP compatibility break | ontology registration only; zero CSIP change | compatibility check |

## 2. Usage

- Referenced during WP-3 implementation and WP-4 validation.
- Any new risk discovered during implementation is appended (additive, versioned).

## 3. Status

**IMPLEMENTATION PLANNING ARTIFACT — COMPLETE.**
