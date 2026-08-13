# IES-012 — Freeze Report (v1.0)

**Standard:** IES-012 — Utilities Sector Engine
**Status:** FROZEN v1.0
**Freeze Date:** 2026-08-08
**Approver:** IIPS Engineering Standards Maintainer
**Release Tag:** `ies-012-v1.0.0`

---

## 1. Freeze scope

IES-012 transitions from Draft to **Frozen v1.0**. See `IES-012_FREEZE_MANIFEST.json` for the machine-readable record (versions + SHA-256 hashes).

Frozen items:

| Asset | Frozen version |
|---|---|
| Engineering Standard (19 documents) | 1.0 |
| Calibration Profile | 1.0.0 |
| Golden Dataset | 1.0.0 |
| Expected Outputs | 1.0.0 |
| Replay Dataset | 1.0.0 |
| Validation Fixtures (11) | 1.0.0 |
| Worked Example + Diagram | 1.0.0 |
| Architecture Review artifacts (2 files) | 1.0.0 |

## 2. Freeze gate (per `IES-012_FREEZE_CHECKLIST.md`)

All 17 items complete.

## 3. Compatibility

Per `IES-012_COMPATIBILITY.md`: IES-012 v1.0 compatible with Platform v1.x; zero platform/framework/engine/CSIP modification; CSIP ontology compatible.

## 4. Regression baseline

See `IES-012_FREEZE_REGRESSION_BASELINE.md` — the implementation target (11 frozen outputs + 11 fixtures + override paths).

## 5. Post-freeze rule

Any methodology/calibration change requires a new version (per Frozen Calibration Change Policy) — never modification of the frozen baseline.

## 6. Release tag

`ies-012-v1.0.0`
