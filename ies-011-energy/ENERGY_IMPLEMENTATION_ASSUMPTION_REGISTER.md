# IES-011 — Implementation Assumption Register

**Standard:** IES-011 — Energy Sector Engine
**Phase:** 5 — Freeze
**Version:** 1.0
**Date:** 2026-08-08
**Status:** IMPLEMENTATION-FACING FREEZE ARTIFACT

> **Purpose.** Enumerate every assumption implementation teams are allowed to make, reducing ambiguity during WP-3 and simplifying independent verification.

---

## 1. Fixed methodology assumptions

- The D15 transformation pipeline (`Metric → Band → Score → Pillar → Composite → Overrides → Verdict`) is normative.
- **Round-half-to-even** rounding is used for composite.
- Valuation uses **mid-cycle normalized** EBITDA (not peak/trough).

## 2. Fixed calibration assumptions

- Calibration is loaded from `energy-calibration-1.0.0` (segment + commodity-exposure profiles).
- Segment determines pillar weights; commodity exposure determines risk weighting.
- Leverage alert thresholds per segment are normative.

## 3. Fixed ontology assumptions

- Energy registers 8-dimension ontology metadata (Conviction, Confidence, Quality, Growth, Risk, Valuation, Capital Efficiency, Moat).
- CSIP consumes via ontology registration with **zero CSIP change**.

## 4. Fixed replay assumptions

- Identical inputs + calibration → identical composite/verdict/overrides/evidence.
- Replay is a hard release gate.

## 5. Explicit non-assumptions (must come ONLY from frozen assets)

- Calibration constants: **must** come from `energy-calibration-1.0.0`, never embedded in code.
- Band→score tables: **must** come from D15 + calibration.
- Expected outputs: **must** come from `energy-expected-outputs-1.0.0`.
- No `Math.random`/`Date.now` in business logic.
- No platform/runtime/framework/CSIP modifications.

## 6. Status

**IMPLEMENTATION-FACING FREEZE ARTIFACT — COMPLETE.**
