# IES-010 — Implementation Readiness Certificate (ISSUED)

**Standard:** IES-010 — Hospitality Sector Engine
**Status:** AUTHORIZED — implementation may begin against the frozen baseline
**Issued:** 2026-08-08
**Issuer:** IIPS Engineering Standards Maintainer

---

## 1. Certifications

| # | Condition | Status |
|---|---|---|
| 1 | IES-005 platform architecture approved | ✅ |
| 2 | IES-005.1 contracts approved | ✅ |
| 3 | IES-010 reference assets frozen | ✅ |
| 4 | IES-010 architecture review passed (8/8) | ✅ |
| 5 | Hospitality implementation authorized against frozen baseline | ✅ |
| 6 | Future methodology changes require new version | ✅ |

## 2. Frozen baseline

| Artifact | Version |
|---|---|
| Calibration Profile | 1.0.0 |
| Golden Dataset | 1.0.0 |
| Frozen Expected Outputs | 1.0.0 |
| Replay Dataset | 1.0.0 |
| Validation Fixtures (9) | 1.0.0 |
| Normative Calculation Appendix (D15) | 1.0 |

## 3. Implementation boundary

Reuses `iips-platform` unchanged; implements Hospitality as `sector.hospitality` (metrics/scoring/calibration/decision/evidence). Registers ontology metadata for CSIP (zero CSIP change).

## 4. Next authorized phase

**IES-010 Implementation Plan** → WP-1 → WP-2 → WP-3 → WP-4 → Independent Verification → Release.

## 5. Status

**READY TO IMPLEMENT** (against the frozen baseline, after the Implementation Plan is approved).
