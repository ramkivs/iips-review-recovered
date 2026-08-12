# IES-012 — Freeze Regression Baseline

**Standard:** IES-012 — Utilities Sector Engine
**Date:** 2026-08-08
**Purpose:** The frozen regression baseline that Utilities implementation must reproduce exactly — the WP-3 implementation target.

---

## 1. Frozen baseline

| Artifact | Version | SHA-256 |
|---|---|---|
| Utilities Calibration Profile | 1.0.0 | `cd60d644…` (see Freeze Manifest) |
| Golden Dataset | 1.0.0 | `27c191a3…` |
| Frozen Expected Outputs | 1.0.0 | `0abb710f…` |
| Replay Dataset | 1.0.0 | `ed8818a5…` |
| Validation Fixtures | 1.0.0 | `b0edbffd…` |
| Normative Calculation Appendix (D15) | 1.0 | `e472e6eb…` |

## 2. Expected outputs (implementation target)

| Provider | Segment | Composite | Verdict |
|---|---|---|---|
| UT-001 | regulated-electric | 74.1 | Buy |
| UT-002 | gas-distribution | 70.5 | Buy |
| UT-003 | water-utilities | 69.3 | Accumulate |
| UT-004 | multi-utility | 71.8 | Buy |
| UT-005 | ipp-merchant | 66.4 | Accumulate |
| UT-006 | regulated-electric | 69.6 | Accumulate |
| UT-007 | regulated-electric | 61.5 | Watch (adverse rate case) |
| UT-008 | gas-distribution | 57.6 | Watch (regulatory lag) |
| UT-009 | regulated-electric | 70.4 | Watch (capex overrun) |
| UT-010 | ipp-merchant | 47.5 | Watch (leverage) |
| UT-011 | regulated-electric | 66.3 | Watch (stranded asset) |

## 3. Implementation must

- Reproduce all 11 frozen outputs exactly (composite + verdict).
- Pass all 11 validation fixtures (incl. override paths).
- Reproduce byte-identical replay.
- Consume platform unchanged; register ontology metadata for CSIP (zero CSIP change).

## 4. Status

**FROZEN** — this is the implementation target.
