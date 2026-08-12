# IES-011 — Energy Replay Coverage Matrix

**Standard:** IES-011 — Energy Sector Engine
**Phase:** 4 — Architecture Review
**Version:** 1.0
**Date:** 2026-08-08
**Status:** ARCHITECTURE REVIEW ARTIFACT

> **Purpose.** One-page proof that every deterministic calculation path has replay coverage.

---

## 1. Replay coverage

| Golden dataset case | Replay dataset case | Validation fixture | Expected output | Replay assertion |
|---|---|---|---|---|
| EN-001 (Integrated) | ✓ | ENER-01 | 66.9 / Accumulate | composite, verdict, pillars, overrides, evidence |
| EN-002 (Upstream) | ✓ | ENER-02 | 76.4 / Buy | composite, verdict, pillars, overrides, evidence |
| EN-003 (Midstream) | ✓ | ENER-03 | 66.0 / Accumulate | composite, verdict, pillars, overrides, evidence |
| EN-004 (Downstream) | ✓ | ENER-04 | 65.8 / Accumulate | composite, verdict, pillars, overrides, evidence |
| EN-005 (Renewables) | ✓ | ENER-05 | 73.4 / Buy | composite, verdict, pillars, overrides, evidence |
| EN-006 (Utility) | ✓ | ENER-06 | 62.7 / Accumulate | composite, verdict, pillars, overrides, evidence |
| EN-007 (Oil crash) | ✓ | ENER-07 | 42.5 / Watch | composite, verdict, pillars, **overrides** (price-collapse, leverage), evidence |
| EN-008 (Reserve write-down) | ✓ | ENER-08 | 50.3 / Watch | composite, verdict, pillars, **overrides**, evidence |
| EN-009 (Stranded asset) | ✓ | ENER-09 | 60.8 / Watch | composite, verdict, pillars, **overrides**, evidence |

## 2. Completeness

- Every golden dataset case has replay coverage.
- Every validation fixture maps to an expected output + replay assertion.
- Every deterministic calculation path (incl. all override paths) has replay coverage.

## 3. Status

**ARCHITECTURE REVIEW ARTIFACT — COMPLETE.**
