# IES-015 — Implementation Readiness Certificate (ISSUED)

**Standard:** IES-015 — Technology Sector Engine
**Status:** AUTHORIZED — implementation may begin against the frozen baseline
**Issued:** 2026-08-09
**Issuer:** IIPS Engineering Standards Maintainer

---

## 1. Certifications

| # | Condition | Status |
|---|---|---|
| 1 | IES-005 platform architecture approved | ✅ |
| 2 | IES-005.1 contracts approved | ✅ |
| 3 | IES-015 reference assets frozen | ✅ |
| 4 | IES-015 architecture review passed (11/11) | ✅ |
| 5 | Technology implementation authorized against frozen baseline | ✅ |
| 6 | Future methodology changes require new version | ✅ |
| 7 | Ontology metadata frozen (CSIP zero change) | ✅ |

## 2. Frozen baseline

| Artifact | Version |
|---|---|
| Calibration Profile | 1.0.0 |
| Golden Dataset | 1.0.0 |
| Frozen Expected Outputs (13) | 1.0.0 |
| Replay Dataset | 1.0.0 |
| Validation Fixtures (21) | 1.0.0 |
| Normative Calculation Appendix (D15 v1.3) | 1.3 |
| Ontology Metadata | 1.0.0 |

## 3. Implementation boundary

Reuses `iips-platform` unchanged; implements Technology as `sector.technology` (metrics/scoring/calibration/decision/evidence). Registers ontology metadata for CSIP (zero CSIP change). Reference assets are the authoritative test oracle.

## 4. Next authorized phase

**IES-015 Implementation Plan** → WP-1 → WP-2 → WP-3 → WP-4 → Independent Verification → Release.

## 5. Status

**READY TO IMPLEMENT** (against the frozen baseline, after the Implementation Plan is approved).
