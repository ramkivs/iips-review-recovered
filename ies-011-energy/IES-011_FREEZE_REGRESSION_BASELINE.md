# IES-011 — Freeze Regression Baseline

**Standard:** IES-011 — Energy Sector Engine
**Date:** 2026-08-08
**Purpose:** The frozen regression baseline that Energy implementation must reproduce exactly — the WP-3 implementation target.

---

## 1. Frozen baseline

| Artifact | Version | SHA-256 |
|---|---|---|
| Energy Calibration Profile | 1.0.0 | `aa0e364c…` (see Freeze Manifest) |
| Golden Dataset | 1.0.0 | `2591a07d…` |
| Frozen Expected Outputs | 1.0.0 | `cddd6b24…` |
| Replay Dataset | 1.0.0 | `05baadfa…` |
| Validation Fixtures | 1.0.0 | `9964ba95…` |
| Normative Calculation Appendix (D15) | 1.0 | `e24a6817…` |

## 2. Expected outputs (implementation target)

| Provider | Segment | Composite | Verdict |
|---|---|---|---|
| EN-001 | integrated | 66.9 | Accumulate |
| EN-002 | upstream | 76.4 | Buy |
| EN-003 | midstream | 66.0 | Accumulate |
| EN-004 | downstream | 65.8 | Accumulate |
| EN-005 | renewables | 73.4 | Buy |
| EN-006 | utility | 62.7 | Accumulate |
| EN-007 | upstream | 42.5 | Watch (price collapse + leverage) |
| EN-008 | upstream | 50.3 | Watch (reserve write-down + leverage) |
| EN-009 | utility | 60.8 | Watch (stranded asset) |

## 3. Implementation must

- Reproduce all 9 frozen outputs exactly (composite + verdict).
- Pass all 9 validation fixtures (incl. override paths).
- Reproduce byte-identical replay (composites, verdicts, pillars, overrides, evidence).
- Consume platform unchanged; register ontology metadata for CSIP (zero CSIP change).

## 4. Status

**FROZEN** — this is the implementation target.
