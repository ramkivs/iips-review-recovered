# IES-011 — Energy Implementation Risk Register

**Standard:** IES-011 — Energy Sector Engine
**Phase:** Implementation Planning
**Version:** 1.0
**Date:** 2026-08-08
**Status:** ENGINEERING RISK LEDGER — referenced throughout WP-1..WP-4

> **Purpose.** Identifies implementation-specific engineering risks (not project-management risks) and their mitigations/validation.

---

## 1. Risk register

| Risk | Mitigation | Validation |
|---|---|---|
| Calibration drift | load from frozen `energy-calibration-1.0.0`; never embed constants | golden regression (9/9) |
| Override precedence error | D10 precedence tests | WP-3 override tests |
| Replay fixtures mismatch | replay dataset assertions | WP-4 replay (byte-identical) |
| Segment misclassification | Calibration Boundary Matrix (segment + exposure → one profile) | validation fixtures (all 6 segments) |
| Commodity scenario mismatch | Commodity Scenario Matrix (cycle-aware) | replay dataset + fixtures |
| Ontology metadata mismatch | ontology registration tests | WP-3 ontology test (8/8) |
| CSIP compatibility break | ontology registration only; zero CSIP change | compatibility check |
| Rounding error (round-half-to-even) | normative D15 rounding | golden regression (9/9) |
| Mid-cycle valuation misapplication | use mid-cycle normalized EBITDA | calibration + fixtures |

## 2. Usage

- Referenced during WP-3 implementation and WP-4 validation.
- Any new risk discovered during implementation is appended (additive, versioned).

## 3. Status

**IMPLEMENTATION PLANNING ARTIFACT — COMPLETE.**
