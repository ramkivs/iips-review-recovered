# IES-011 — Frozen Asset Dependency Manifest

**Standard:** IES-011 — Energy Sector Engine
**Phase:** 5 — Freeze
**Version:** 1.0
**Date:** 2026-08-08
**Status:** REFERENCE ASSET — the dependency graph between frozen artifacts

> **Purpose.** Capture *why* each artifact exists and what normative sources it depends upon — a complete audit trail beyond simple hashes.

---

## 1. Dependency graph

| Frozen asset | Depends on | Purpose |
|---|---|---|
| Expected Outputs | Golden Dataset, Calibration Profile, D15 | authoritative expected composite/verdict |
| Replay Dataset | Expected Outputs | replay assertions target |
| Validation Fixtures | Calibration Profile, D15 | per-scenario expected behavior |
| Worked Example | D15, Calibration | step-by-step worked computation |
| Architecture Review | All reference assets | review verdict |
| Calibration Profile | Standard D09 (segment + commodity) | normative calibration |
| Normative Calculation Appendix (D15) | Metric Library, Score Engine | exact transformation |

## 2. Dependency rules

- Expected Outputs derive from Golden Dataset + Calibration + D15 (the normative source).
- Validation Fixtures derive from Calibration + D15.
- Replay Dataset targets Expected Outputs.
- No frozen asset depends on implementation code.

## 3. Status

**REFERENCE ASSET — COMPLETE.**
