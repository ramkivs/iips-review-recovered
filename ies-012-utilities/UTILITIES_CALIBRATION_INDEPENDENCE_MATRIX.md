# IES-012 — Calibration Independence Matrix

**Standard:** IES-012 — Utilities Sector Engine
**Phase:** 4 — Architecture Review
**Version:** 1.0
**Date:** 2026-08-08
**Status:** ARCHITECTURE REVIEW ARTIFACT

> **Purpose.** Explicitly demonstrate that the scoring engine remains identical across sectors; calibration selects weights/thresholds only; overrides stay deterministic; regulatory posture affects calibration only; merchant vs regulated never alters platform behavior.

---

## 1. Calibration independence

| Scenario | Segment | Regulatory posture | Calibration profile | Score engine used | Override path | Expected result |
|---|---|---|---|---|---|---|
| Constructive rate case | regulated-electric | constructive | C-REG | common | none | Buy |
| Neutral rate case | gas-distribution | neutral | C-REG | common | none | Buy |
| Water utility | water-utilities | neutral | C-REG | common | none | Accumulate |
| Transition approved | multi-utility | constructive | C-REG | common | none | Buy |
| Merchant IPP | ipp-merchant | neutral | C-MER | common | none | Accumulate |
| Reliability penalty | regulated-electric | neutral | C-REG | common | none | Accumulate |
| Adverse rate case | regulated-electric | adversarial | C-REG | common | adverse-rate-case | Watch |
| Regulatory lag | gas-distribution | adversarial | C-REG | common | regulatory-lag | Watch |
| Capex disallowance | regulated-electric | neutral | C-REG | common | capex-overrun | Watch |
| Merchant price stress | ipp-merchant | neutral | C-MER | common | leverage-alert | Watch |
| Transition rejected | regulated-electric | adversarial | C-REG | common | stranded-asset | Watch |

## 2. Independence findings

- **Score engine is identical** (common) across all scenarios/segments.
- **Calibration** selects weights/thresholds only (segment + regulatory posture).
- **Overrides** remain deterministic (fixed precedence).
- **Regulatory posture** affects calibration only (risk multiplier), never platform behavior.
- **Merchant vs regulated** is a calibration concern (C-MER vs C-REG), never scoring-logic or platform change.

## 3. Status

**ARCHITECTURE REVIEW ARTIFACT — COMPLETE.** Architectural independence auditable.
