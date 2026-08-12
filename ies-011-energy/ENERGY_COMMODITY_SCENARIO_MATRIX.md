# IES-011 — Energy Commodity Scenario Matrix

**Standard:** IES-011 — Energy Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-08
**Status:** REFERENCE ASSET

> **Purpose.** Validate commodity environments, not just companies — the methodology is fundamentally cycle-aware.

---

## 1. Commodity scenario coverage

| Scenario | Affected metrics | Calibration profile | Expected override behavior | Expected decision impact |
|---|---|---|---|---|
| Oil boom | EM-010 (realized price), EM-001 (margin) | Upstream / Integrated | none (positive) | composite up → Buy/Strong Buy |
| Oil crash | EM-010, EM-001, EM-003 | Upstream | price collapse → cap Watch | composite down → Watch/avoid |
| Natural gas strength | EM-010, EM-006 (production) | Midstream/Integrated | none (positive) | composite up |
| Refining margin expansion | EM-001, EM-005 | Downstream | none (positive) | composite up |
| Renewable subsidy growth | EM-011 (transition mix), EM-005 | Renewables | none (positive) | composite up |
| Carbon-price pressure | EM-011, EM-001 | All | stranded asset → cap Watch | composite down |

## 2. Cycle-awareness

- Valuation uses **mid-cycle normalized** metrics, not peak/trough.
- Commodity cycle is expressed via **risk calibration** + override (price collapse, stranded asset), never scoring-logic change.
- These scenarios strengthen replay testing because the methodology is cycle-aware.

## 3. Status

**REFERENCE ASSET — COMPLETE.**
