# IES-011 — Energy Segment Coverage Matrix

**Standard:** IES-011 — Energy Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-08
**Status:** REFERENCE ASSET

> **Purpose.** Demonstrate that every Energy segment is represented across the reference assets.

---

## 1. Segment coverage

| Segment | Golden dataset | Calibration | Expected output | Replay | Fixtures |
|---|---|---|---|---|---|
| Integrated | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upstream / E&P | ✅ | ✅ | ✅ | ✅ | ✅ |
| Midstream | ✅ | ✅ | ✅ | ✅ | ✅ |
| Downstream | ✅ | ✅ | ✅ | ✅ | ✅ |
| Renewables | ✅ | ✅ | ✅ | ✅ | ✅ |
| Regulated Utility | ✅ | ✅ | ✅ | ✅ | ✅ |

## 2. Coverage completeness

- **Every segment** (Integrated, Upstream, Midstream, Downstream, Renewables, Regulated Utility) is represented in the golden dataset, calibration, expected outputs, replay, and fixtures.
- **Every override path** (governance, stranded asset, reserve write-down, cost blowout, price collapse, leverage breach) exercised.
- **Every calibration path** (segment weights + commodity exposure) exercised.

## 3. Status

**REFERENCE ASSET — COMPLETE.**
