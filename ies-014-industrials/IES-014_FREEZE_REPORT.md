# IES-014 — Freeze Report (v1.0)

**Standard:** IES-014 — Industrials Sector Engine
**Status:** FROZEN v1.0
**Freeze Date:** 2026-08-09
**Approver:** IIPS Engineering Standards Maintainer
**Release Tag:** `ies-014-v1.0.0`

---

## 1. Freeze scope

IES-014 transitions from Draft to **Frozen v1.0** (normative contract D15 v1.2). See `IES-014_FREEZE_MANIFEST.json` for the machine-readable record (versions + SHA-256 hashes).

Frozen items:

| Asset | Frozen version |
|---|---|
| Engineering Standard (19 documents, v1.1/v1.2) | 1.0 |
| Normative Calculation Appendix (D15) | 1.2 |
| Calibration Profile | 1.0.0 |
| Golden Dataset | 1.0.0 |
| Expected Outputs | 1.0.0 |
| Replay Dataset | 1.0.0 |
| Validation Fixtures (10) | 1.0.0 |
| Ontology Metadata | 1.0.0 |
| Worked Example + Diagram + Contract Test Suite | 1.0.0 |
| Architecture Review artifacts (2 files) | 1.0.0 |

## 2. Freeze gate (per `IES-014_FREEZE_CHECKLIST.md`)

All 18 items complete.

## 3. Compatibility

Per `IES-014_COMPATIBILITY.md`: IES-014 v1.0 compatible with Platform v1.x; zero platform/framework/engine/CSIP modification; CSIP ontology compatible.

## 4. Regression baseline

See `IES-014_FREEZE_REGRESSION_BASELINE.md` — the implementation target (10 frozen outputs + 10 fixtures + override paths). Reference assets are the authoritative test oracle.

## 5. Post-freeze rule

Any methodology/calibration change requires a new version — never modification of the frozen baseline.

## 6. Release tag

`ies-014-v1.0.0`
