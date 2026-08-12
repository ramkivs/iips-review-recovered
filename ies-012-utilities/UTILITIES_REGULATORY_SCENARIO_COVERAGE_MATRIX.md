# IES-012 — Regulatory Scenario Coverage Matrix

**Standard:** IES-012 — Utilities Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-08
**Status:** REFERENCE ASSET — the replay and validation coverage guide for Utilities

> **Purpose.** Ensure every important regulatory situation is represented within the frozen reference assets.

---

## 1. Regulatory scenario coverage

| Scenario | Affected metrics | Calibration profile | Expected override | Validation fixture |
|---|---|---|---|---|
| Constructive rate case | allowed ROE, rate base growth | Regulated | none (positive) | UTIL-01 |
| Neutral rate case | allowed ROE | Regulated | none | UTIL-02 |
| Adverse rate case | allowed ROE | Regulated | adverse rate case → Watch | UTIL-07 |
| Regulatory lag | O&M efficiency, margin | Regulated | regulatory lag → Watch | UTIL-08 |
| Accelerated capital recovery | rate base growth | Regulated | none (positive) | UTIL-01 |
| Capex disallowance | rate base growth | Regulated | capex overrun → Watch | UTIL-09 |
| Reliability penalty | reliability (SAIDI) | Regulated | none (quality down) | UTIL-06 |
| Merchant price stress | margin, leverage | IPP/Merchant | leverage/price → Watch | UTIL-10 |
| Transition investment approval | transition capex | Regulated | none (positive) | UTIL-04 |
| Transition investment rejection | transition capex | Regulated | stranded asset → Watch | UTIL-11 |

## 2. Coverage completeness

- **Every regulatory situation** (constructive/neutral/adverse rate case, regulatory lag, accelerated recovery, disallowance, reliability penalty, merchant stress, transition approval/rejection) exercised.
- **Every calibration profile** (regulated + merchant segments) exercised.
- **Every override path** (adverse rate case, regulatory lag, capex overrun, stranded asset, leverage) exercised.

## 3. Status

**REFERENCE ASSET — COMPLETE.**
