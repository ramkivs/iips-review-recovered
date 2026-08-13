# IES-012 — Utilities Implementation Risk Register

**Standard:** IES-012 — Utilities Sector Engine
**Phase:** Implementation Planning
**Version:** 1.0
**Date:** 2026-08-08
**Status:** ENGINEERING RISK LEDGER — referenced throughout WP-1..WP-4

---

## 1. Risk register

| Risk | Mitigation | Validation |
|---|---|---|
| Calibration drift | load from frozen `utilities-calibration-1.0.0` | golden regression (11/11) |
| Override precedence error | D10 precedence tests | WP-3 override tests |
| Replay fixture mismatch | replay dataset assertions | WP-4 replay (byte-identical) |
| Segment misclassification | segment + regulatory posture → profile | validation fixtures (all segments) |
| Regulatory posture mismatch | Calibration Independence Matrix | replay + fixtures |
| Ontology metadata mismatch | ontology registration tests | WP-3 ontology test (8/8) |
| CSIP compatibility break | ontology registration only; zero CSIP change | compatibility check |
| Rounding error (round-half-to-even) | normative D15 rounding | golden regression (11/11) |
| Regulated vs merchant misapplication | C-REG vs C-MER calibration | fixtures |

## 2. Usage

- Referenced during WP-3 implementation and WP-4 validation.
- Any new risk discovered during implementation is appended (additive, versioned).

## 3. Status

**IMPLEMENTATION PLANNING ARTIFACT — COMPLETE.**
