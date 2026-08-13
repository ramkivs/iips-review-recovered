# CSIP — Implementation Readiness Certificate (ISSUED)

**Capability:** CSIP — Cross-Sector Intelligence Platform
**Program:** v1.1 Track 5
**Status:** AUTHORIZED — implementation may begin against the frozen baseline
**Issued:** 2026-08-08
**Issuer:** IIPS Engineering Standards Maintainer

---

## 1. Certifications

| # | Condition | Status |
|---|---|---|
| 1 | IES-005 platform architecture approved | ✅ |
| 2 | IES-005.1 contracts approved | ✅ |
| 3 | Universal Investment Ontology frozen | ✅ |
| 4 | CSIP standard + reference assets frozen | ✅ |
| 5 | CSIP architecture review passed (8/8) | ✅ |
| 6 | CSIP implementation authorized against frozen baseline | ✅ |
| 7 | Four sector engines recorded as immutable (no engine change) | ✅ |
| 8 | Future methodology changes require a new version | ✅ |

## 2. Frozen baseline

| Artifact | Version |
|---|---|
| Universal Investment Ontology | 1.0.0 |
| Cross-Sector Intelligence Standard | 1.0.0 |
| Portfolio Golden Dataset | 1.0.0 (6 portfolios) |
| Portfolio Expected Outputs | 1.0.0 (6) |
| Portfolio Replay Dataset | 1.0.0 |
| Allocation Fixtures | 1.0.0 (8) |
| Diversification Fixtures | 1.0.0 (5) |

## 3. Implementation boundary

CSIP is implemented as a **platform plugin** consuming `SectorPlugin` outputs via the ontology mapping. Reuses `iips-platform` runtime/framework/contracts/replay/evidence unchanged. **Zero changes** to Banking/Insurance/Capital Markets/Healthcare engines.

## 4. Next authorized phase

**CSIP Phase 5 — Implementation Plan** (portfolio/ranking/allocation/diversification/opportunity/correlation/reporting; per Allocation Rule Precedence Table + Cross-Sector Coverage Matrix; close the defined Top-N fixture gap).

## 5. Status

**READY TO IMPLEMENT** (against the frozen baseline, after the Implementation Plan is approved).
